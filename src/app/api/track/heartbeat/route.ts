import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import VisitorLog from '@/models/VisitorLog';

export async function POST(req: Request) {
    try {
        await connectDB();
        const body = await req.json();

        const { sessionId, durationSeconds, scrollDepthPercent } = body;

        if (!sessionId) {
            return NextResponse.json({ error: 'sessionId é obrigatório.' }, { status: 400 });
        }

        const update: any = {
            $set: { lastActivityAt: new Date() }
        };

        if (typeof durationSeconds === 'number') {
            update.$set.durationSeconds = durationSeconds;
        }

        // Só atualiza scroll se for maior que o atual (evita voltar para trás no scroll)
        if (typeof scrollDepthPercent === 'number') {
            const current = await VisitorLog.findOne({ sessionId }).select('scrollDepthPercent');
            if (current && scrollDepthPercent > (current.scrollDepthPercent || 0)) {
                update.$set.scrollDepthPercent = scrollDepthPercent;
            }
        }

        await VisitorLog.updateOne({ sessionId }, update);

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error: any) {
        console.error('Erro no heartbeat:', error);
        return NextResponse.json({ error: error.message || 'Erro interno.' }, { status: 500 });
    }
}