import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Tenant from '@/models/Tenant';
import Item from '@/models/Item';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const MASTER_ADMINS = ['18997901236', '18997261236', '5518997901236', '5518997261236'];

async function checkMasterPrivileges(request: Request) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) return false;

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secreta') as { tenantId: string };

        await dbConnect();
        const tenant = await Tenant.findById(decoded.tenantId);
        if (!tenant) return false;

        const cleanPhone = tenant.phone.replace(/\D/g, '');
        return MASTER_ADMINS.includes(cleanPhone);
    } catch (error) {
        return false;
    }
}

export async function GET(request: Request) {
    const isMaster = await checkMasterPrivileges(request);
    if (!isMaster) {
        return NextResponse.json({ message: "Acesso negado: Apenas o Administrador Master possui permissão." }, { status: 403 });
    }

    try {
        await dbConnect();
        const tenants = await Tenant.find().select('-passwordHash').sort({ createdAt: -1 });
        return NextResponse.json(tenants, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Erro ao buscar clientes." }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    const isMaster = await checkMasterPrivileges(request);
    if (!isMaster) {
        return NextResponse.json({ message: "Acesso negado: Apenas o Administrador Master possui permissão." }, { status: 403 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ message: "ID do cliente não fornecido." }, { status: 400 });

        const body = await request.json();
        const { name, email, phone, city, password, maxItems, maxImagesPerItem, subscriptionExpiresAt } = body;

        await dbConnect();

        const tenant = await Tenant.findById(id);
        if (!tenant) {
            return NextResponse.json({ message: "Cliente não encontrado." }, { status: 404 });
        }

        // Atualiza campos cadastrais se fornecidos
        if (name !== undefined) tenant.name = name;
        if (email !== undefined) tenant.email = email;
        if (phone !== undefined) tenant.phone = phone;
        if (city !== undefined) tenant.city = city;
        if (maxItems !== undefined) tenant.maxItems = Number(maxItems);
        if (maxImagesPerItem !== undefined) tenant.maxImagesPerItem = Number(maxImagesPerItem);

        // Tratamento correto de data local (evita o recuo de 1 dia por fuso UTC)
        if (subscriptionExpiresAt) {
            const dateOnly = subscriptionExpiresAt.split('T')[0];
            const [y, m, d] = dateOnly.split('-').map(Number);
            tenant.subscriptionExpiresAt = new Date(y, m - 1, d);
        }

        // Se uma nova senha foi informada, gera o hash seguro
        if (password && password.trim() !== '') {
            const salt = await bcrypt.genSalt(10);
            tenant.passwordHash = await bcrypt.hash(password, salt);
        }

        await tenant.save();

        const updatedTenant = await Tenant.findById(id).select('-passwordHash');
        return NextResponse.json(updatedTenant, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || "Erro ao atualizar dados do cliente." }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const isMaster = await checkMasterPrivileges(request);
    if (!isMaster) {
        return NextResponse.json({ message: "Acesso negado: Apenas o Administrador Master possui permissão." }, { status: 403 });
    }

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ message: "ID do cliente não fornecido." }, { status: 400 });

        await dbConnect();
        await Item.deleteMany({ tenantId: id });
        await Tenant.findByIdAndDelete(id);

        return NextResponse.json({ message: "Cliente e registros dependentes excluídos com sucesso." }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Erro ao excluir conta de cliente." }, { status: 500 });
    }
}