import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Tenant from '@/models/Tenant';
import bcrypt from 'bcryptjs';

// Helper para obter a data atual no fuso de Brasília sem somar dias no registro
function getBrasiliaCurrentDate(): Date {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
        timeZone: 'America/Sao_Paulo',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    };
    const parts = new Intl.DateTimeFormat('en-CA', options).formatToParts(now);
    const year = parseInt(parts.find(p => p.type === 'year')?.value || '2026', 10);
    const month = parseInt(parts.find(p => p.type === 'month')?.value || '1', 10) - 1;
    const day = parseInt(parts.find(p => p.type === 'day')?.value || '1', 10);

    return new Date(Date.UTC(year, month, day, 3, 0, 0));
}

export async function POST(req: Request) {
    try {
        await connectDB();

        const { name, email, phone, password, city, websiteLink, businessCardLink } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json({ error: 'Nome, e-mail e senha são obrigatórios' }, { status: 400 });
        }

        const cleanEmail = email.toLowerCase().trim();
        const cleanPhone = phone ? phone.replace(/\D/g, '') : '';

        const existingEmail = await Tenant.findOne({ email: cleanEmail });
        if (existingEmail) {
            return NextResponse.json({ error: 'E-mail já cadastrado' }, { status: 400 });
        }

        if (cleanPhone) {
            const existingPhone = await Tenant.findOne({ phone: cleanPhone });
            if (existingPhone) {
                return NextResponse.json({ error: 'Telefone já cadastrado' }, { status: 400 });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const currentDate = getBrasiliaCurrentDate();

        const newTenant = new Tenant({
            name: name.trim(),
            email: cleanEmail,
            phone: cleanPhone,
            passwordHash: hashedPassword,
            city: city ? city.trim() : '',
            websiteLink: websiteLink ? websiteLink.trim() : '',
            businessCardLink: businessCardLink ? businessCardLink.trim() : '',
            isAnuidadePaid: false,
            subscriptionExpiresAt: currentDate // Inicia na data de criação, abrindo os 7 dias de carência iniciais
        });

        await newTenant.save();

        return NextResponse.json({
            message: 'Registrado com sucesso',
            tenantId: newTenant._id,
            tenantName: newTenant.name,
            tenantPhone: newTenant.phone,
            tenantEmail: newTenant.email
        }, { status: 201 });

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor';
        console.error('Erro no registro:', error);
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}