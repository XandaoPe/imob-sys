import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Item from '@/models/Item';
import { verifyToken } from '@/lib/auth';
import Tenant from '@/models/Tenant';

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

        const tenant = await Tenant.findById(tenantId);
        const maxImagesPerItem = tenant?.maxImagesPerItem ?? 4;

        const resolvedParams = await params;
        const itemId = resolvedParams.id;

        const { title, description, images, expiresAt, isActive } = await req.json();

        if (images && images.length > maxImagesPerItem) {
            return NextResponse.json(
                { error: `Seu plano permite no máximo ${maxImagesPerItem} imagens por registro.` },
                { status: 400 }
            );
        }

        // Validação de Reativação
        if (isActive && expiresAt) {
            const expDate = new Date(expiresAt);
            const now = new Date();
            // Reseta horário para comparar apenas a data
            now.setHours(0, 0, 0, 0);

            if (expDate < now) {
                return NextResponse.json(
                    { error: 'Para reativar o anúncio, informe uma nova data de validade válida.' },
                    { status: 400 }
                );
            }
        }

        const updateData: any = { title, description };
        if (images) updateData.images = images;
        if (expiresAt) updateData.expiresAt = new Date(expiresAt);
        if (typeof isActive === 'boolean') updateData.isActive = isActive;

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