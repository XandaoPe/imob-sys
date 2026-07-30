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
        // VALIDAÇÃO DE ANUIDADE E PERÍODO DE TESTE (7 DIAS)
        // ==========================================
        const now = new Date();
        const createdAt = new Date(tenant.createdAt);
        const initialTrialEnd = new Date(createdAt);
        initialTrialEnd.setDate(initialTrialEnd.getDate() + 7);

        const expiresAt = tenant.subscriptionExpiresAt
            ? new Date(tenant.subscriptionExpiresAt)
            : initialTrialEnd;

        let warningMessage: string | null = null;

        // Identifica se realmente está no trial de 7 dias (sem customização prévia de data)
        const isTrial = !tenant.subscriptionExpiresAt || expiresAt <= initialTrialEnd;

        if (!tenant.isAnuidadePaid) {
            if (now > expiresAt) {
                // Período expirado -> Bloqueio total com exigência de Pix
                return NextResponse.json(
                    {
                        error: isTrial
                            ? 'Seu período de teste gratuito de 7 dias expirou. Para desbloquear seu painel e anúncios, realize o pagamento da anuidade via Pix.'
                            : 'Sua assinatura expirou. Para renovar seu acesso, entre em contato com o administrador ou realize o pagamento via Pix.',
                        requiresPix: true,
                        tenantId: tenant._id,
                        tenantName: tenant.name,
                        tenantPhone: tenant.phone,
                        tenantEmail: tenant.email
                    },
                    { status: 403 }
                );
            } else {
                // Apenas exibe o aviso se for o trial legítimo de 7 dias
                if (isTrial) {
                    const diffTime = expiresAt.getTime() - now.getTime();
                    const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    const formattedExpiresDate = expiresAt.toLocaleDateString('pt-BR', { timeZone: 'UTC' });

                    warningMessage = `Atenção: Você está no período de teste gratuito. Seu acesso expira em ${formattedExpiresDate} (restam ${daysLeft} dia(s)). Regularize sua anuidade via Pix para garantir acesso contínuo.`;
                }
            }
        } else {
            // Se já pagou, mantém a carência de 10 dias após o vencimento da anuidade
            const gracePeriodEnd = new Date(expiresAt);
            gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 10);

            if (now > gracePeriodEnd) {
                return NextResponse.json(
                    { error: 'Sua anuidade venceu e o período de carência expirou. Para renovar seu acesso, entre em contato com o administrador pelo número (18) 99726-1236.' },
                    { status: 403 }
                );
            } else if (now > expiresAt) {
                const diffTime = gracePeriodEnd.getTime() - now.getTime();
                const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                const formattedExpiresDate = expiresAt.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
                warningMessage = `Atenção: Sua anuidade venceu em ${formattedExpiresDate}. Você está no período de carência e possui mais ${daysLeft} dia(s) de acesso. Entre em contato para renovar: (18) 99726-1236.`;
            }
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