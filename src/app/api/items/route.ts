import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Item from '@/models/Item';
import { verifyToken } from '@/lib/auth';

export async function GET(req: Request) {
    try {
        await connectDB();
        const tenantId = verifyToken(req);
        if (!tenantId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

        const items = await Item.find({ tenantId }).sort({ createdAt: -1 });
        return NextResponse.json(items);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        await connectDB();
        const tenantId = verifyToken(req);
        if (!tenantId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

        const { title, description, images } = await req.json();

        const newItem = await Item.create({
            tenantId,
            title,
            description,
            images: images || [], // Salva o array de imagens
        });

        return NextResponse.json(newItem, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}