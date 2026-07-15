import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Tenant from '@/models/Tenant';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
        await connectDB();

        // Agora recebemos também o campo 'city' enviado do formulário de registro
        const { name, email, phone, password, city, businessCardLink } = await req.json();

        const cleanPhone = phone.replace(/\D/g, '');

        // Verifica duplicidade de E-mail
        const existingEmail = await Tenant.findOne({ email });
        if (existingEmail) return NextResponse.json({ error: 'E-mail já cadastrado' }, { status: 400 });

        // Verifica duplicidade de Telefone
        const existingPhone = await Tenant.findOne({ phone: cleanPhone });
        if (existingPhone) return NextResponse.json({ error: 'Telefone já cadastrado' }, { status: 400 });

        const hashedPassword = await bcrypt.hash(password, 10);

        // Gravando as informações atualizadas do perfil com a Cidade
        const newTenant = new Tenant({
            name,
            email,
            phone: cleanPhone,
            passwordHash: hashedPassword,
            city: city ? city.trim() : '', // Salva a cidade digitada (removendo espaços extras)
            businessCardLink: businessCardLink || '', // Armazena o link enviado
        });

        await newTenant.save();

        return NextResponse.json({ message: 'Registrado com sucesso' }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}