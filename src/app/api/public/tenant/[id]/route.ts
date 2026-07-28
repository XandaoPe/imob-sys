import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Item from '@/models/Item';
import Tenant from '@/models/Tenant';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        await connectDB();
        const resolvedParams = await params;
        const tenantId = resolvedParams.id;

        const tenant = await Tenant.findById(tenantId);
        if (!tenant) {
            return NextResponse.json({ error: 'Tenant não encontrado' }, { status: 404 });
        }

        const now = new Date();

        // Filtra apenas anúncios ativos E cuja validade seja igual ou posterior à data atual
        const items = await Item.find({
            tenantId,
            isActive: true,
            expiresAt: { $gte: now }
        }).sort({ createdAt: -1 });

        return NextResponse.json({
            tenantName: tenant.name,
            tenantPhone: tenant.phone,
            websiteLink: tenant.websiteLink,
            businessCardLink: tenant.businessCardLink,
            items
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}