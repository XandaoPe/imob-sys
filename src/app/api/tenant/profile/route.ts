import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs'; // <-- Importado bcryptjs para hash da senha
import Tenant from '@/models/Tenant';

// Função auxiliar simples para conectar ao banco
async function connectToDatabase() {
    if (mongoose.connection.readyState >= 1) return;
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) throw new Error('MONGODB_URI não está definida nas variáveis de ambiente.');
    await mongoose.connect(mongoUri);
}

// GET: Retorna os dados do perfil do Tenant logado
export async function GET(request: Request) {
    try {
        await connectToDatabase();

        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { tenantId: string };

        const tenant = await Tenant.findById(decoded.tenantId).select('-passwordHash');
        if (!tenant) {
            return NextResponse.json({ message: 'Usuário não encontrado' }, { status: 404 });
        }

        return NextResponse.json(tenant);
    } catch (error) {
        console.error('Erro ao buscar perfil:', error);
        return NextResponse.json({ message: 'Erro interno do servidor' }, { status: 500 });
    }
}

// PUT: Atualiza as informações do perfil do Tenant logado
export async function PUT(request: Request) {
    try {
        await connectToDatabase();

        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { tenantId: string };

        const body = await request.json();
        const { name, email, phone, city, websiteLink, businessCardLink, password } = body; // <-- Recebe password

        if (!name || !email || !phone) {
            return NextResponse.json({ message: 'Nome, E-mail e Telefone são obrigatórios.' }, { status: 400 });
        }

        const emailExists = await Tenant.findOne({ email, _id: { $ne: decoded.tenantId } });
        if (emailExists) {
            return NextResponse.json({ message: 'Este e-mail já está em uso por outro usuário.' }, { status: 400 });
        }

        const phoneExists = await Tenant.findOne({ phone, _id: { $ne: decoded.tenantId } });
        if (phoneExists) {
            return NextResponse.json({ message: 'Este telefone já está em uso por outro usuário.' }, { status: 400 });
        }

        // Monta o objeto de atualização
        const updateFields: any = {
            name,
            email,
            phone,
            city,
            websiteLink,
            businessCardLink,
        };

        // Se uma nova senha foi digitada, gera o hash e adiciona no update
        if (password && password.trim() !== '') {
            updateFields.passwordHash = await bcrypt.hash(password.trim(), 10);
        }

        const updatedTenant = await Tenant.findByIdAndUpdate(
            decoded.tenantId,
            updateFields,
            { new: true, runValidators: true }
        ).select('-passwordHash');

        return NextResponse.json(updatedTenant);
    } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        return NextResponse.json({ message: 'Erro interno ao salvar alterações' }, { status: 500 });
    }
}