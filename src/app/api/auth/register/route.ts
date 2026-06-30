import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Tenant from '@/models/Tenant';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
        await connectDB();
        const { name, email, phone, password } = await req.json();

        const cleanPhone = phone.replace(/\D/g, '');

        // Verifica duplicidade
        const existingEmail = await Tenant.findOne({ email });
        if (existingEmail) return NextResponse.json({ error: 'E-mail já cadastrado' }, { status: 400 });

        const existingPhone = await Tenant.findOne({ phone: cleanPhone });
        if (existingPhone) return NextResponse.json({ error: 'Telefone já cadastrado' }, { status: 400 });

        const hashedPassword = await bcrypt.hash(password, 10);

        // Gravando como passwordHash para respeitar a validação do banco
        await Tenant.create({
            name,
            email,
            phone: cleanPhone,
            passwordHash: hashedPassword,
        });

        return NextResponse.json({ message: 'Registrado com sucesso' }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}