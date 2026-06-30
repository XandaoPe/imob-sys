import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Item from '@/models/Item';
import { verifyToken } from '@/lib/auth';

// DELETE: Remove o registro
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

// PUT: Atualiza o registro (com suporte a nova imagem base64)
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();

        const tenantId = verifyToken(req);
        if (!tenantId) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

        const resolvedParams = await params;
        const itemId = resolvedParams.id;

        const { title, description, imageBase64 } = await req.json();

        // Monta o objeto com os campos que serão atualizados
        const updateData: any = { title, description };
        if (imageBase64) {
            updateData.imageBase64 = imageBase64; // Só altera a imagem se uma nova for enviada
        }

        // Atualiza garantindo o isolamento pelo tenantId
        const updatedItem = await Item.findOneAndUpdate(
            { _id: itemId, tenantId },
            updateData,
            { new: true } // Retorna o item já atualizado
        );

        if (!updatedItem) {
            return NextResponse.json({ error: 'Item não encontrado ou não pertence a você' }, { status: 404 });
        }

        return NextResponse.json(updatedItem);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}