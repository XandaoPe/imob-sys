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
    tenantId: any;
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

interface VisitorDetailsModalProps {
    visitor: Visitor | null;
    onClose: () => void;
}

const EVENT_LABELS: Record<string, { label: string; icon: string; color: string }> = {
    view_item: { label: 'Visualizou Item', icon: '👁️', color: 'text-blue-400' },
    view_image: { label: 'Abriu Imagem', icon: '🖼️', color: 'text-purple-400' },
    click_whatsapp: { label: 'Clicou WhatsApp', icon: '💬', color: 'text-emerald-400' },
    click_website: { label: 'Clicou Site', icon: '🌐', color: 'text-amber-400' },
    click_business_card: { label: 'Clicou Cartão', icon: '📇', color: 'text-pink-400' },
    share: { label: 'Compartilhou', icon: '📤', color: 'text-blue-400' },
    scroll_deep: { label: 'Scroll Profundo (75%+)', icon: '📜', color: 'text-gray-400' },
    leave_page: { label: 'Saiu da Página', icon: '🚪', color: 'text-red-400' }
};

export default function VisitorDetailsModal({ visitor, onClose }: VisitorDetailsModalProps) {
    if (!visitor) return null;

    const tenant = typeof visitor.tenantId === 'object' ? visitor.tenantId : null;

    const formatDuration = (seconds: number) => {
        if (seconds < 60) return `${seconds} segundos`;
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${min} min ${sec}s`;
    };

    const formatDateTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleString('pt-BR');
    };

    // Ordena eventos por timestamp (mais recente por último)
    const sortedEvents = [...(visitor.events || [])].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    return (
        <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={onClose}
        >
            <div
                className="bg-gray-800 border border-gray-700 rounded-2xl p-6 max-w-2xl w-full text-gray-100 relative shadow-2xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl font-bold"
                >
                    &times;
                </button>

                <h3 className="text-xl font-bold text-blue-400 mb-1">Detalhes da Visita</h3>
                <p className="text-xs text-gray-400 mb-5 font-mono">Session ID: {visitor.sessionId}</p>

                {/* DADOS DO VISITANTE */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                    <div className="bg-gray-900/60 p-3 rounded-lg border border-gray-700/60">
                        <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-500 mb-1">Rede</p>
                        <p className="text-xs font-mono text-gray-200">{visitor.ip}</p>
                        {visitor.isp && <p className="text-[10px] text-gray-400 mt-1">{visitor.isp}</p>}
                    </div>

                    <div className="bg-gray-900/60 p-3 rounded-lg border border-gray-700/60">
                        <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-500 mb-1">Localização</p>
                        <p className="text-xs text-gray-200">{visitor.city || '—'}, {visitor.region || '—'}</p>
                        <p className="text-[10px] text-gray-400 mt-1">{visitor.country || '—'}</p>
                    </div>

                    <div className="bg-gray-900/60 p-3 rounded-lg border border-gray-700/60">
                        <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-500 mb-1">Dispositivo</p>
                        <p className="text-xs text-gray-200">{visitor.browser} • {visitor.os}</p>
                        <p className="text-[10px] text-gray-400 mt-1">
                            {visitor.device} • {visitor.screenResolution} • {visitor.language}
                        </p>
                    </div>

                    <div className="bg-gray-900/60 p-3 rounded-lg border border-gray-700/60">
                        <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-500 mb-1">Origem (Referrer)</p>
                        <p className="text-xs text-blue-400 font-mono truncate" title={visitor.referrer}>
                            {visitor.referrer || 'Acesso direto'}
                        </p>
                    </div>

                    <div className="bg-gray-900/60 p-3 rounded-lg border border-gray-700/60">
                        <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-500 mb-1">Entrada</p>
                        <p className="text-xs text-gray-200">{formatDateTime(visitor.enteredAt)}</p>
                    </div>

                    <div className="bg-gray-900/60 p-3 rounded-lg border border-gray-700/60">
                        <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-500 mb-1">Tempo & Scroll</p>
                        <p className="text-xs text-emerald-400 font-bold">{formatDuration(visitor.durationSeconds)}</p>
                        <p className="text-[10px] text-gray-400 mt-1">📜 Rolou {visitor.scrollDepthPercent}% da página</p>
                    </div>
                </div>

                {/* CLIENTE ALVO */}
                {tenant && (
                    <div className="bg-blue-950/40 p-3 rounded-lg border border-blue-800/60 mb-5">
                        <p className="text-[10px] uppercase tracking-wider font-semibold text-blue-400 mb-1">Cliente Alvo</p>
                        <p className="text-sm font-bold text-white">{tenant.name}</p>
                        <p className="text-xs text-blue-300 font-mono">{tenant.email} • {tenant.phone}</p>
                    </div>
                )}

                {/* LINHA DO TEMPO DE EVENTOS */}
                <div>
                    <h4 className="text-sm font-bold text-gray-300 mb-3 flex items-center gap-2">
                        🕐 Linha do Tempo ({sortedEvents.length} evento{sortedEvents.length !== 1 ? 's' : ''})
                    </h4>

                    {sortedEvents.length === 0 ? (
                        <p className="text-xs text-gray-500 italic text-center py-6 bg-gray-900/40 rounded-lg">
                            Nenhuma ação registrada além da entrada na página.
                        </p>
                    ) : (
                        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                            {sortedEvents.map((event, idx) => {
                                const meta = EVENT_LABELS[event.type] || { label: event.type, icon: '•', color: 'text-gray-400' };
                                return (
                                    <div key={idx} className="flex items-start gap-3 bg-gray-900/40 p-2.5 rounded-lg border border-gray-800">
                                        <span className="text-lg shrink-0">{meta.icon}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-xs font-semibold ${meta.color}`}>{meta.label}</p>
                                            {event.itemId && (
                                                <p className="text-[10px] text-gray-500 font-mono">Item: {event.itemId}</p>
                                            )}
                                            {event.metadata && Object.keys(event.metadata).length > 0 && (
                                                <p className="text-[10px] text-gray-500 font-mono">
                                                    {JSON.stringify(event.metadata)}
                                                </p>
                                            )}
                                        </div>
                                        <span className="text-[10px] text-gray-500 font-mono shrink-0">
                                            {new Date(event.timestamp).toLocaleTimeString('pt-BR')}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}