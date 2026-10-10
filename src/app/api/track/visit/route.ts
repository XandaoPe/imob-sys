import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import VisitorLog from '@/models/VisitorLog';
import Tenant from '@/models/Tenant';

// Extrai o IP real considerando proxies (Vercel, Cloudflare, etc)
function getClientIp(req: Request): string {
    const headers = req.headers;
    const forwarded = headers.get('x-forwarded-for');
    if (forwarded) return forwarded.split(',')[0].trim();

    return (
        headers.get('x-real-ip') ||
        headers.get('cf-connecting-ip') ||
        headers.get('x-vercel-forwarded-for') ||
        '0.0.0.0'
    );
}

// Busca geolocalização via ip-api.com (grátis, 45 req/min)
async function getGeoLocation(ip: string) {
    try {
        // IPs locais/privados não têm geolocalização
        if (
            !ip ||
            ip === '0.0.0.0' ||
            ip === '::1' ||
            ip.startsWith('127.') ||
            ip.startsWith('192.168.') ||
            ip.startsWith('10.') ||
            ip.startsWith('172.')
        ) {
            return { country: 'Local', region: '', city: '', isp: '' };
        }

        const res = await fetch(
            `http://ip-api.com/json/${ip}?fields=status,country,regionName,city,isp`,
            { cache: 'no-store' }
        );

        if (!res.ok) return { country: '', region: '', city: '', isp: '' };

        const data = await res.json();
        if (data.status !== 'success') return { country: '', region: '', city: '', isp: '' };

        return {
            country: data.country || '',
            region: data.regionName || '',
            city: data.city || '',
            isp: data.isp || ''
        };
    } catch (error) {
        console.error('Erro ao buscar geolocalização:', error);
        return { country: '', region: '', city: '', isp: '' };
    }
}

// Detecta navegador a partir do userAgent
function detectBrowser(ua: string): string {
    if (!ua) return 'Desconhecido';
    if (ua.includes('Edg/')) return 'Edge';
    if (ua.includes('OPR/') || ua.includes('Opera')) return 'Opera';
    if (ua.includes('Chrome/') && !ua.includes('Edg/')) return 'Chrome';
    if (ua.includes('Safari/') && !ua.includes('Chrome')) return 'Safari';
    if (ua.includes('Firefox/')) return 'Firefox';
    return 'Outro';
}

// Detecta sistema operacional
function detectOS(ua: string): string {
    if (!ua) return 'Desconhecido';
    if (/Windows NT/.test(ua)) return 'Windows';
    if (/Mac OS X/.test(ua)) return 'macOS';
    if (/Android/.test(ua)) return 'Android';
    if (/iPhone|iPad|iPod/.test(ua)) return 'iOS';
    if (/Linux/.test(ua)) return 'Linux';
    return 'Outro';
}

export async function POST(req: Request) {
    try {
        await connectDB();
        const body = await req.json();

        const {
            tenantId,
            sessionId,
            userAgent,
            language,
            screenResolution,
            referrer
        } = body;

        if (!tenantId || !sessionId) {
            return NextResponse.json({ error: 'Dados obrigatórios ausentes.' }, { status: 400 });
        }

        // Verifica se o tenant existe
        const tenant = await Tenant.findById(tenantId).select('_id');
        if (!tenant) {
            return NextResponse.json({ error: 'Cliente não encontrado.' }, { status: 404 });
        }

        // Evita duplicar sessão se a mesma já foi registrada
        const existing = await VisitorLog.findOne({ sessionId });
        if (existing) {
            return NextResponse.json({ success: true, sessionId, alreadyExists: true }, { status: 200 });
        }

        const ip = getClientIp(req);
        const ua = userAgent || req.headers.get('user-agent') || '';
        const geo = await getGeoLocation(ip);

        // Detecta tipo de dispositivo
        const device = /Mobile|Android|iPhone|iPad/.test(ua)
            ? (/iPad|Tablet/.test(ua) ? 'tablet' : 'mobile')
            : 'desktop';

        const log = await VisitorLog.create({
            tenantId,
            sessionId,
            ip,
            userAgent: ua,
            browser: detectBrowser(ua),
            os: detectOS(ua),
            device,
            language: language || '',
            screenResolution: screenResolution || '',
            referrer: referrer || '',
            country: geo.country,
            region: geo.region,
            city: geo.city,
            isp: geo.isp,
            enteredAt: new Date(),
            lastActivityAt: new Date(),
            durationSeconds: 0,
            scrollDepthPercent: 0,
            events: []
        });

        return NextResponse.json({ success: true, sessionId, logId: log._id }, { status: 201 });
    } catch (error: any) {
        console.error('Erro ao registrar visita:', error);
        return NextResponse.json({ error: error.message || 'Erro interno.' }, { status: 500 });
    }
}