import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Tenant from '@/models/Tenant';
import Item from '@/models/Item';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();
        const resolvedParams = await params;
        const tenantId = resolvedParams.id;

        // INCLUSÃO: Adicionado 'businessCardLink' no select do Tenant
        const tenant = await Tenant.findById(tenantId).select('name phone businessCardLink');
        if (!tenant) return NextResponse.json({ error: 'Página não encontrada' }, { status: 404 });

        const items = await Item.find({ tenantId }).select('title description images');

        // RETORNO: repassando a nova propriedade para o front-end
        return NextResponse.json({
            tenantName: tenant.name,
            tenantPhone: tenant.phone,
            businessCardLink: tenant.businessCardLink || '',
            items
        });
    } catch (error) {
        return NextResponse.json({ error: 'Página não encontrada' }, { status: 404 });
    }
}