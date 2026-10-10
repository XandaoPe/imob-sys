import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import VisitorLog from '@/models/VisitorLog';

export async function POST(req: Request) {
    try {
        await connectDB();
        const body = await req.json();

        const { sessionId, type, itemId, metadata } = body;

        if (!sessionId || !type) {
            return NextResponse.json({ error: 'sessionId e type são obrigatórios.' }, { status: 400 });
        }

        const update = {
            $push: {
                events: {
                    type,
                    itemId: itemId || null,
                    metadata: metadata || {},
                    timestamp: new Date()
                }
            },
            $set: { lastActivityAt: new Date() }
        };

        const result = await VisitorLog.findOneAndUpdate(
            { sessionId },
            update,
            { new: true }
        );

        if (!result) {
            return NextResponse.json({ error: 'Sessão não encontrada.' }, { status: 404 });
        }

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error: any) {
        console.error('Erro ao registrar evento:', error);
        return NextResponse.json({ error: error.message || 'Erro interno.' }, { status: 500 });
    }
}