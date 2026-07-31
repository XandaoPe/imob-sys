import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Tenant from '@/models/Tenant';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

function escapeRegex(text: string) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Helper para obter a data atual no fuso horário do Brasil (America/Sao_Paulo) zerada às 00:00:00
function getBrasiliaDate(date = new Date()): Date {
    const options: Intl.DateTimeFormatOptions = {
        timeZone: 'America/Sao_Paulo',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    };
    const parts = new Intl.DateTimeFormat('en-CA', options).formatToParts(date);
    const year = parts.find(p => p.type === 'year')?.value;
    const month = parts.find(p => p.type === 'month')?.value;
    const day = parts.find(p => p.type === 'day')?.value;
    return new Date(`${year}-${month}-${day}T00:00:00`);
}

export async function POST(req: Request) {
    try {
        await connectDB();
        const body = await req.json();
        const { loginIdentifier, password } = body;

        if (!loginIdentifier || !password) {
            return NextResponse.json(
                { error: 'Identificador e senha são obrigatórios' },
                { status: 400 }
            );
        }

        const sanitizedIdentifier = loginIdentifier.trim();
        const lowerIdentifier = sanitizedIdentifier.toLowerCase();
        const safeRegexIdentifier = escapeRegex(lowerIdentifier);
        const digits = sanitizedIdentifier.replace(/\D/g, '');

        const orConditions: Record<string, unknown>[] = [
            { email: { $regex: new RegExp(`^${safeRegexIdentifier}$`, 'i') } }
        ];

        if (digits.length >= 8) {
            const phoneWith55 = digits.startsWith('55') ? digits : '55' + digits;
            const phoneWithout55 = digits.startsWith('55') ? digits.slice(2) : digits;

            orConditions.push(
                { phone: digits },
                { phone: phoneWith55 },
                { phone: phoneWithout55 }
            );
        }

        const tenant = await Tenant.findOne({ $or: orConditions });

        if (!tenant) {
            return NextResponse.json(
                { error: 'Credenciais inválidas' },
                { status: 401 }
            );
        }

        const isMatch = await bcrypt.compare(password, tenant.passwordHash);
        if (!isMatch) {
            return NextResponse.json(
                { error: 'Credenciais inválidas' },
                { status: 401 }
            );
        }

        // ==========================================
        // VALIDAÇÃO DE EXPIRAÇÃO E CARÊNCIA (FUSO BRASÍLIA)
        // ==========================================
        const now = getBrasiliaDate();

        // Data base de expiração gravada no cadastro (ou criação)
        const expiresAt = tenant.subscriptionExpiresAt
            ? getBrasiliaDate(new Date(tenant.subscriptionExpiresAt))
            : getBrasiliaDate(new Date(tenant.createdAt));

        // Período de carência de 7 dias após a data de expiração/criação
        const gracePeriodEnd = new Date(expiresAt);
        gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 7);

        let warningMessage: string | null = null;

        // 1. Bloqueio total se passou da data de expiração + 7 dias de carência
        if (now > gracePeriodEnd) {
            if (tenant.isAnuidadePaid) {
                tenant.isAnuidadePaid = false;
                await tenant.save();
            }

            return NextResponse.json(
                {
                    error: 'Seu prazo de carência de 7 dias expirou. Para desbloquear seu painel e anúncios, realize o pagamento da anuidade via Pix.',
                    requiresPix: true,
                    tenantId: tenant._id,
                    tenantName: tenant.name,
                    tenantPhone: tenant.phone,
                    tenantEmail: tenant.email
                },
                { status: 403 }
            );
        }
        // 2. Período de carência (entre o dia do vencimento/criação e até 7 dias depois)
        else if (now >= expiresAt) {
            // Assim que entra nos 7 dias de carência, isAnuidadePaid se torna false
            if (tenant.isAnuidadePaid) {
                tenant.isAnuidadePaid = false;
                await tenant.save();
            }

            const diffTime = gracePeriodEnd.getTime() - now.getTime();
            const daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
            const formattedExpiresAt = expiresAt.toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' });

            warningMessage = `Atenção: Sua assinatura venceu em ${formattedExpiresAt}. Você está no período de carência de 7 dias (restam ${daysLeft} dia(s)). Regularize sua anuidade via Pix para evitar o bloqueio.`;
        }
        // 3. Caso o usuário esteja com a anuidade válida (antes do vencimento): Nenhuma mensagem ou aviso é exibido.
        // ==========================================

        const token = jwt.sign(
            { tenantId: tenant._id },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '1d' }
        );

        return NextResponse.json(
            {
                token,
                tenantId: tenant._id,
                warning: warningMessage,
                tenant: {
                    id: tenant._id,
                    name: tenant.name,
                    email: tenant.email,
                    phone: tenant.phone,
                    city: tenant.city || '',
                    websiteLink: tenant.websiteLink || '',
                    businessCardLink: tenant.businessCardLink || '',
                    isAnuidadePaid: tenant.isAnuidadePaid
                },
            },
            { status: 200 }
        );
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor';
        console.error('Erro no login:', error);
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}