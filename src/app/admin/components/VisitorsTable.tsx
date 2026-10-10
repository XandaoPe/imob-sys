'use client';

import React from 'react';

interface VisitorEvent {
    type: string;
    itemId?: string | null;
    metadata?: Record<string, any>;
    timestamp: string;
}

interface Visitor {
    _id: string;
    tenantId: {
        _id: string;
        name: string;
        email: string;
        phone: string;
        city?: string;
    } | string;
    sessionId: string;
    ip: string;
    browser: string;
    os: string;
    device: string;
    language: string;
    screenResolution: string;
    referrer: string;
    country: string;
    region: string;
    city: string;
    isp: string;
    enteredAt: string;
    lastActivityAt: string;
    durationSeconds: number;
    scrollDepthPercent: number;
    events: VisitorEvent[];
}

interface VisitorsTableProps {
    visitors: Visitor[];
    onOpenDetails: (visitor: Visitor) => void;
}

export default function VisitorsTable({ visitors, onOpenDetails }: VisitorsTableProps) {
    if (visitors.length === 0) {
        return <p className="p-8 text-center text-sm text-gray-400">Nenhuma visita registrada ainda.</p>;
    }

    const formatDuration = (seconds: number) => {
        if (seconds < 60) return `${seconds}s`;
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${min}m ${sec}s`;
    };

    const getDeviceIcon = (device: string) => {
        if (device === 'mobile') return '📱';
        if (device === 'tablet') return '📲';
        return '💻';
    };

    const getEventBadges = (events: VisitorEvent[]) => {
        const counts: Record<string, number> = {};
        events.forEach((e) => {
            counts[e.type] = (counts[e.type] || 0) + 1;
        });

        const badges: { label: string; color: string; icon: string }[] = [];
        if (counts['click_whatsapp']) badges.push({ label: `${counts['click_whatsapp']} WhatsApp`, color: 'bg-emerald-900/40 text-emerald-300 border-emerald-800', icon: '💬' });
        if (counts['share']) badges.push({ label: `${counts['share']} Share`, color: 'bg-blue-900/40 text-blue-300 border-blue-800', icon: '📤' });
        if (counts['view_image']) badges.push({ label: `${counts['view_image']} Fotos`, color: 'bg-purple-900/40 text-purple-300 border-purple-800', icon: '🖼️' });
        if (counts['click_website']) badges.push({ label: `${counts['click_website']} Site`, color: 'bg-amber-900/40 text-amber-300 border-amber-800', icon: '🌐' });
        if (counts['click_business_card']) badges.push({ label: `${counts['click_business_card']} Cartão`, color: 'bg-pink-900/40 text-pink-300 border-pink-800', icon: '📇' });

        return badges;
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-900 border-b border-gray-700 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        <th className="p-4">Visitante</th>
                        <th className="p-4">Localização</th>
                        <th className="p-4">Dispositivo</th>
                        <th className="p-4">Cliente Alvo</th>
                        <th className="p-4">Interações</th>
                        <th className="p-4">Tempo / Scroll</th>
                        <th className="p-4 text-right">Ações</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50 text-sm">
                    {visitors.map((v) => {
                        const tenant = typeof v.tenantId === 'object' ? v.tenantId : null;
                        const badges = getEventBadges(v.events || []);
                        const dateStr = new Date(v.enteredAt).toLocaleString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        });

                        return (
                            <tr key={v._id} className="hover:bg-gray-750/30 transition-colors">
                                <td className="p-4">
                                    <p className="font-mono text-xs text-gray-200">{v.ip}</p>
                                    <p className="text-[10px] text-gray-500 mt-0.5">{dateStr}</p>
                                    {v.referrer && (
                                        <p className="text-[10px] text-blue-400 mt-0.5 truncate max-w-[180px]" title={v.referrer}>
                                            🔗 {v.referrer.replace(/^https?:\/\//, '').substring(0, 30)}
                                        </p>
                                    )}
                                </td>
                                <td className="p-4 text-xs">
                                    <p className="font-semibold text-gray-200">{v.city || '—'}</p>
                                    <p className="text-gray-400">{v.region || '—'} {v.country ? `• ${v.country}` : ''}</p>
                                    {v.isp && <p className="text-[10px] text-gray-500 truncate max-w-[150px]">{v.isp}</p>}
                                </td>
                                <td className="p-4 text-xs">
                                    <p className="text-gray-200">
                                        <span className="mr-1">{getDeviceIcon(v.device)}</span>
                                        {v.browser} / {v.os}
                                    </p>
                                    <p className="text-[10px] text-gray-500">{v.screenResolution} • {v.language}</p>
                                </td>
                                <td className="p-4 text-xs">
                                    {tenant ? (
                                        <>
                                            <p className="font-semibold text-gray-200">{tenant.name}</p>
                                            <p className="text-blue-400 font-mono">{tenant.phone}</p>
                                        </>
                                    ) : (
                                        <span className="text-gray-500">—</span>
                                    )}
                                </td>
                                <td className="p-4">
                                    <div className="flex flex-wrap gap-1 max-w-[220px]">
                                        {badges.length === 0 ? (
                                            <span className="text-[10px] text-gray-500 italic">Nenhuma ação</span>
                                        ) : (
                                            badges.map((b, i) => (
                                                <span key={i} className={`text-[10px] px-1.5 py-0.5 rounded border ${b.color} font-semibold`}>
                                                    {b.icon} {b.label}
                                                </span>
                                            ))
                                        )}
                                    </div>
                                </td>
                                <td className="p-4 text-xs font-mono">
                                    <p className="text-emerald-400 font-bold">{formatDuration(v.durationSeconds)}</p>
                                    <p className="text-gray-400">📜 {v.scrollDepthPercent}%</p>
                                </td>
                                <td className="p-4 text-right whitespace-nowrap">
                                    <button
                                        onClick={() => onOpenDetails(v)}
                                        className="bg-blue-500/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 px-3 py-1.5 rounded-lg text-xs font-bold transition"
                                    >
                                        Ver Detalhes
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}