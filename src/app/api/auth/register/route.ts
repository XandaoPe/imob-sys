import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Tenant from '@/models/Tenant';
import bcrypt from 'bcryptjs';

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

        // 7 dias de teste gratuito
        const trialExpiration = new Date();
        trialExpiration.setDate(trialExpiration.getDate() + 7);

        const newTenant = new Tenant({
            name: name.trim(),
            email: cleanEmail,
            phone: cleanPhone,
            passwordHash: hashedPassword,
            city: city ? city.trim() : '',
            websiteLink: websiteLink ? websiteLink.trim() : '',
            businessCardLink: businessCardLink ? businessCardLink.trim() : '',
            isAnuidadePaid: false,
            subscriptionExpiresAt: trialExpiration
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