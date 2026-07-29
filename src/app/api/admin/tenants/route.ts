import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Tenant from '@/models/Tenant';
import Item from '@/models/Item';
import jwt from 'jsonwebtoken';

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
        const { maxItems, maxImagesPerItem, subscriptionExpiresAt } = body;

        await dbConnect();

        const updateData: any = {
            maxItems: maxItems !== undefined ? Number(maxItems) : 10,
            maxImagesPerItem: maxImagesPerItem !== undefined ? Number(maxImagesPerItem) : 4,
        };

        if (subscriptionExpiresAt) {
            updateData.subscriptionExpiresAt = new Date(subscriptionExpiresAt);
        }

        const updatedTenant = await Tenant.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        ).select('-passwordHash');

        return NextResponse.json(updatedTenant, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Erro ao atualizar limites e anuidade do cliente." }, { status: 500 });
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