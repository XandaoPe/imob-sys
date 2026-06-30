import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Tenant from '@/models/Tenant';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(req: Request) {
    try {
        await connectDB();
        const { loginIdentifier, password } = await req.json();

        const cleanIdentifier = loginIdentifier.includes('@') ? loginIdentifier : loginIdentifier.replace(/\D/g, '');

        // Procura por E-mail OU Telefone
        const tenant = await Tenant.findOne({
            $or: [
                { email: loginIdentifier },
                { phone: cleanIdentifier }
            ]
        });

        if (!tenant) {
            return NextResponse.json({ error: 'Credenciais inválidas' }, { status: 401 });
        }

        // Corrigido para comparar usando tenant.passwordHash do banco de dados
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