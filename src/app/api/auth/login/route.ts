import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Tenant from '@/models/Tenant';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(req: Request) {
    try {
        await connectDB();
        const { loginIdentifier, password } = await req.json();

        // 1. Remove espaços em branco acidentais nas pontas (evita erros de copiar e colar)
        const sanitizedIdentifier = loginIdentifier.trim();

        // 2. Extrai apenas os números purificados para as checagens de telefone
        const digits = sanitizedIdentifier.replace(/\D/g, '');

        // 3. Cria variações garantidas (com 55, sem 55 e o formato original limpo)
        const phoneWith55 = digits.startsWith('55') ? digits : '55' + digits;
        const phoneWithout55 = digits.startsWith('55') ? digits.slice(2) : digits;

        // 4. Busca abrangente: o banco vai aceitar o match em qualquer uma das opções válidas
        const tenant = await Tenant.findOne({
            $or: [
                { email: sanitizedIdentifier },
                { phone: digits },
                { phone: phoneWith55 },
                { phone: phoneWithout55 }
            ]
        });

        if (!tenant) {
            return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
        }

        // Compara a senha usando o passwordHash do banco de dados
        const isMatch = await bcrypt.compare(password, tenant.passwordHash);
        if (!isMatch) {
            return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
        }

        const token = jwt.sign({ tenantId: tenant._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });

        return NextResponse.json({ token, tenantId: tenant._id });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}