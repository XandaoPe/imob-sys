import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Tenant from '@/models/Tenant';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
        await connectDB();
        const { name, email, phone } = await req.json();

        if (!name || !email || !phone) {
            return NextResponse.json(
                { error: 'Preencha todos os campos: Nome completo, E-mail e Celular.' },
                { status: 400 }
            );
        }

        const cleanPhone = phone.replace(/\D/g, '');
        const phoneWith55 = cleanPhone.startsWith('55') ? cleanPhone : '55' + cleanPhone;
        const phoneWithout55 = cleanPhone.startsWith('55') ? cleanPhone.slice(2) : cleanPhone;

        // Busca o cliente validando se Nome, E-mail e Telefone conferem exatamente
        const tenant = await Tenant.findOne({
            name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
            email: { $regex: new RegExp(`^${email.trim()}$`, 'i') },
            $or: [
                { phone: cleanPhone },
                { phone: phoneWith55 },
                { phone: phoneWithout55 }
            ]
        });

        if (!tenant) {
            return NextResponse.json(
                {
                    error: 'Os dados informados não conferem com nossos registros. Por favor, entre em contato com o suporte pelo WhatsApp (18) 99726-1236 para recuperar seu acesso.'
                },
                { status: 404 }
            );
        }

        // Gera uma senha temporária numérica de 6 dígitos
        const tempPassword = Math.floor(100000 + Math.random() * 900000).toString();
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(tempPassword, salt);

        tenant.passwordHash = passwordHash;
        await tenant.save();

        return NextResponse.json(
            {
                success: true,
                tempPassword,
                phone: tenant.phone,
            },
            { status: 200 }
        );
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor';
        console.error('Erro na recuperação de senha:', error);
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}