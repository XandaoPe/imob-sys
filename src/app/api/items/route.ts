import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Item from '@/models/Item';
import { verifyToken } from '@/lib/auth';

// GET: Lista itens do Tenant logado
export async function GET(req: Request) {
    try {
        await connectDB();
        const tenantId = verifyToken(req);
        if (!tenantId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

        const items = await Item.find({ tenantId });
        return NextResponse.json(items);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST: Cria um item para o Tenant logado (Suporta Base64 direto)
export async function POST(req: Request) {
    try {
        await connectDB();
        const tenantId = verifyToken(req);
        if (!tenantId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

        const { title, description, imageBase64 } = await req.json();
        const newItem = await Item.create({ title, description, imageBase64, tenantId });

        return NextResponse.json(newItem, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}