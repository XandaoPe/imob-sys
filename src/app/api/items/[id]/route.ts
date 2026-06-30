import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Item from '@/models/Item';
import { verifyToken } from '@/lib/auth';

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();
        const tenantId = verifyToken(req);
        if (!tenantId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

        const resolvedParams = await params;
        const itemId = resolvedParams.id;

        const deletedItem = await Item.findOneAndDelete({ _id: itemId, tenantId });
        if (!deletedItem) {
            return NextResponse.json({ error: 'Item não encontrado ou não pertence a você' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Item excluído com sucesso' });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();
        const tenantId = verifyToken(req);
        if (!tenantId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

        const resolvedParams = await params;
        const itemId = resolvedParams.id;

        const { title, description, images } = await req.json();

        const updateData: any = { title, description };
        if (images) {
            updateData.images = images; // Atualiza a galeria completa se enviada
        }

        const updatedItem = await Item.findOneAndUpdate(
            { _id: itemId, tenantId },
            updateData,
            { new: true }
        );

        if (!updatedItem) {
            return NextResponse.json({ error: 'Item não encontrado ou não pertence a você' }, { status: 404 });
        }

        return NextResponse.json(updatedItem);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}