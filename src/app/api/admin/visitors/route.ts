import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Tenant from '@/models/Tenant';
import VisitorLog from '@/models/VisitorLog';
import jwt from 'jsonwebtoken';

const MASTER_ADMINS = ['18997901236', '18997261236', '5518997901236', '5518997261236'];

async function checkMasterPrivileges(request: Request) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) return false;

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secreta') as { tenantId: string };

        await dbConnect();
        const tenant = await Tenant.findById(decoded.tenantId);
        if (!tenant) return false;

        const cleanPhone = tenant.phone.replace(/\D/g, '');
        return MASTER_ADMINS.includes(cleanPhone);
    } catch {
        return false;
    }
}

export async function GET(request: Request) {
    const isMaster = await checkMasterPrivileges(request);
    if (!isMaster) {
        return NextResponse.json({ message: 'Acesso negado.' }, { status: 403 });
    }

    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const tenantId = searchParams.get('tenantId');
        const limit = parseInt(searchParams.get('limit') || '100', 10);
        const page = parseInt(searchParams.get('page') || '1', 10);
        const skip = (page - 1) * limit;

        // Filtro base
        const filter: any = {};
        if (tenantId) filter.tenantId = tenantId;

        // Busca visitas
        const visits = await VisitorLog.find(filter)
            .populate('tenantId', 'name email phone city')
            .sort({ enteredAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        const total = await VisitorLog.countDocuments(filter);

        // Estatísticas gerais (opcional: se um tenantId for passado, filtra só dele)
        const statsMatch = tenantId ? { tenantId: tenantId as any } : {};

        const [totalVisits, uniqueVisitors, totalWhatsApp, totalShares] = await Promise.all([
            VisitorLog.countDocuments(statsMatch),
            VisitorLog.distinct('ip', statsMatch).then((ips) => ips.length),
            VisitorLog.countDocuments({
                ...statsMatch,
                'events.type': 'click_whatsapp'
            }),
            VisitorLog.countDocuments({
                ...statsMatch,
                'events.type': 'share'
            })
        ]);

        // Agrupa visitas por dia (últimos 30 dias)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const visitsByDay = await VisitorLog.aggregate([
            { $match: { ...statsMatch, enteredAt: { $gte: thirtyDaysAgo } } },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$enteredAt' }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Top cidades
        const topCities = await VisitorLog.aggregate([
            { $match: { ...statsMatch, city: { $ne: '' } } },
            { $group: { _id: '$city', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        return NextResponse.json({
            visits,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            stats: {
                totalVisits,
                uniqueVisitors,
                totalWhatsApp,
                totalShares,
                visitsByDay,
                topCities
            }
        }, { status: 200 });
    } catch (error: any) {
        console.error('Erro ao buscar visitantes:', error);
        return NextResponse.json({ message: 'Erro ao buscar visitantes.' }, { status: 500 });
    }
}