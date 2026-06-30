import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Tenant from '@/models/Tenant';
import Item from '@/models/Item';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();

        const resolvedParams = await params;
        const tenantId = resolvedParams.id;

        // Adicionado o 'phone' no select
        const tenant = await Tenant.findById(tenantId).select('name phone');
        if (!tenant) {
            return NextResponse.json({ error: 'Página não encontrada' }, { status: 404 });
        }

        const items = await Item.find({ tenantId }).select('title description imageBase64');

        return NextResponse.json({ tenantName: tenant.name, tenantPhone: tenant.phone, items });
    } catch (error) {
        return NextResponse.json({ error: 'Página não encontrada' }, { status: 404 });
    }
}