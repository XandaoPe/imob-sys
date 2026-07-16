import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Tenant from '@/models/Tenant';
import Item from '@/models/Item';
import jwt from 'jsonwebtoken';

// Lista Master atualizada: Aceita as variações com e sem o prefixo 55
const MASTER_ADMINS = ['18997901236', '18997261236', '5518997901236', '5518997261236'];

async function checkMasterPrivileges(request: Request) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) return false;

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secreta') as { tenantId: string };

        await dbConnect();

        // Busca direto no banco para garantir que pega o telefone formatado mais recente
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
        const items = await Item.find().populate('tenantId', 'name email phone city').sort({ createdAt: -1 });

        const formattedItems = items.map(item => ({
            _id: item._id,
            title: item.title,
            description: item.description,
            images: item.images,
            tenantId: item.tenantId?._id,
            createdAt: item.createdAt,
            corretor: {
                name: item.tenantId?.name || 'Desconhecido',
                email: item.tenantId?.email || 'N/A',
                phone: item.tenantId?.phone || 'N/A',
            }
        }));

        return NextResponse.json(formattedItems, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Erro ao buscar registros no Master." }, { status: 500 });
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
        if (!id) return NextResponse.json({ message: "ID não fornecido." }, { status: 400 });

        const body = await request.json();
        await dbConnect();

        const updatedItem = await Item.findByIdAndUpdate(id, body, { new: true });
        return NextResponse.json(updatedItem, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Erro ao atualizar registro." }, { status: 500 });
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
        if (!id) return NextResponse.json({ message: "ID não fornecido." }, { status: 400 });

        await dbConnect();
        await Item.findByIdAndDelete(id);
        return NextResponse.json({ message: "Item excluído com sucesso." }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Erro ao excluir registro." }, { status: 500 });
    }
}