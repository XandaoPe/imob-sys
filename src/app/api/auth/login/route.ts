import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Tenant from '@/models/Tenant';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Função para escapar caracteres especiais de Regex e evitar ReDoS / Regex Injection
function escapeRegex(text: string) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function POST(req: Request) {
    try {
        await connectDB();
        const body = await req.json();
        const { loginIdentifier, password } = body;

        // 1. Validação de entrada
        if (!loginIdentifier || !password) {
            return NextResponse.json(
                { error: 'Identificador e senha são obrigatórios' },
                { status: 400 }
            );
        }

        // 2. Remove espaços extras e ajusta para minúsculo
        const sanitizedIdentifier = loginIdentifier.trim();
        const lowerIdentifier = sanitizedIdentifier.toLowerCase();
        const safeRegexIdentifier = escapeRegex(lowerIdentifier);

        // 3. Extrai apenas dígitos para checagem de telefone
        const digits = sanitizedIdentifier.replace(/\D/g, '');

        // 4. Monta as condições de busca
        const orConditions: Record<string, unknown>[] = [
            { email: { $regex: new RegExp(`^${safeRegexIdentifier}$`, 'i') } }
        ];

        // Adiciona filtros de telefone se houver uma quantidade mínima de dígitos (>= 8)
        if (digits.length >= 8) {
            const phoneWith55 = digits.startsWith('55') ? digits : '55' + digits;
            const phoneWithout55 = digits.startsWith('55') ? digits.slice(2) : digits;

            orConditions.push(
                { phone: digits },
                { phone: phoneWith55 },
                { phone: phoneWithout55 }
            );
        }

        // 5. Busca no banco de dados
        const tenant = await Tenant.findOne({ $or: orConditions });

        if (!tenant) {
            return NextResponse.json(
                { error: 'Credenciais inválidas' },
                { status: 401 }
            );
        }

        // 6. Compara a senha enviada com o hash salvo
        const isMatch = await bcrypt.compare(password, tenant.passwordHash);
        if (!isMatch) {
            return NextResponse.json(
                { error: 'Credenciais inválidas' },
                { status: 401 }
            );
        }

        // 7. Gera o token JWT (válido por 1 dia)
        const token = jwt.sign(
            { tenantId: tenant._id },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '1d' }
        );

        // 8. Retorna o token e os dados do usuário
        return NextResponse.json(
            {
                token,
                tenantId: tenant._id,
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