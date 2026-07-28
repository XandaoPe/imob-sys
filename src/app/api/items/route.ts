import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Item from '@/models/Item';
import Tenant from '@/models/Tenant';
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

        const tenant = await Tenant.findById(tenantId);
        const maxItems = tenant?.maxItems ?? 10;
        const maxImagesPerItem = tenant?.maxImagesPerItem ?? 4;

        const currentItemsCount = await Item.countDocuments({ tenantId });
        if (currentItemsCount >= maxItems) {
            return NextResponse.json(
                { error: `Você atingiu o seu limite de ${maxItems} registros cadastrados. Entre em contato com o suporte para expandir seu plano.` },
                { status: 400 }
            );
        }

        const { title, description, images, expiresAt, isActive } = await req.json();
        const imageList = images || [];

        if (!expiresAt) {
            return NextResponse.json({ error: 'A data de validade é obrigatória.' }, { status: 400 });
        }

        if (imageList.length > maxImagesPerItem) {
            return NextResponse.json(
                { error: `Seu plano permite no máximo ${maxImagesPerItem} imagens por registro.` },
                { status: 400 }
            );
        }

        const newItem = await Item.create({
            tenantId,
            title,
            description,
            images: imageList,
            expiresAt: new Date(expiresAt),
            isActive: isActive !== undefined ? isActive : true,
        });

        return NextResponse.json(newItem, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}