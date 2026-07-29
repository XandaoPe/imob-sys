import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Tenant from '@/models/Tenant';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

function escapeRegex(text: string) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
        // 7. VALIDAÇÃO DE ANUIDADE E CARÊNCIA DE 10 DIAS
        // ==========================================
        const now = new Date();
        const expiresAt = tenant.subscriptionExpiresAt
            ? new Date(tenant.subscriptionExpiresAt)
            : new Date(new Date(tenant.createdAt).setFullYear(new Date(tenant.createdAt).getFullYear() + 1));

        const gracePeriodEnd = new Date(expiresAt);
        gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 10);

        let warningMessage: string | null = null;

        if (now > gracePeriodEnd) {
            // Bloqueio definitivo pós-carência
            return NextResponse.json(
                { error: 'Sua anuidade venceu e o período de carência expirou. Para renovar seu acesso, entre em contato com o administrador pelo número (18) 99726-1236.' },
                { status: 403 }
            );
        } else if (now > expiresAt) {
            // Cliente no período de carência (Informa o cliente)
            const diffTime = gracePeriodEnd.getTime() - now.getTime();
            const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            const formattedExpiresDate = expiresAt.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
            warningMessage = `Atenção: Sua anuidade venceu em ${formattedExpiresDate}. Você está no período de carência e possui mais ${daysLeft} dia(s) de acesso. Entre em contato para renovar: (18) 99726-1236.`;
        }
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
                warning: warningMessage, // Retorna a mensagem de alerta no login
                tenant: {
                    id: tenant._id,
                    name: tenant.name,
                    email: tenant.email,
                    phone: tenant.phone,
                    city: tenant.city || '',
                    websiteLink: tenant.websiteLink || '',
                    businessCardLink: tenant.businessCardLink || '',
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