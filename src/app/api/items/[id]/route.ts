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

        // ✅ Função segura para converter data no backend sem interferência de fuso horário
        const parseDateSafely = (dateStr: string | null | undefined): Date | null => {
            if (!dateStr) return null;
            if (typeof dateStr === 'string' && dateStr.includes('-')) {
                const cleanStr = dateStr.split('T')[0];
                const parts = cleanStr.split('-');
                if (parts.length === 3) {
                    return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
                }
            }
            const parsed = new Date(dateStr);
            return isNaN(parsed.getTime()) ? null : parsed;
        };

        // Validação de Reativação corrigida com fuso horário local
        if (isActive && expiresAt) {
            const expDate = parseDateSafely(expiresAt);
            if (expDate) {
                expDate.setHours(0, 0, 0, 0);
            }

            const now = new Date();
            now.setHours(0, 0, 0, 0);

            if (!expDate || expDate < now) {
                return NextResponse.json(
                    { error: 'Para reativar o anúncio, informe uma nova data de validade válida.' },
                    { status: 400 }
                );
            }
        }

        const updateData: any = { title, description };
        if (images) updateData.images = images;
        if (expiresAt) {
            const parsedExp = parseDateSafely(expiresAt);
            if (parsedExp) updateData.expiresAt = parsedExp;
        }
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