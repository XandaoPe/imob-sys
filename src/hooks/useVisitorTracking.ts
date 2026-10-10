'use client';

import { useEffect, useRef, useCallback } from 'react';

// Gera um UUID v4 simples
function generateSessionId(): string {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

export function useVisitorTracking(tenantId: string) {
    const sessionIdRef = useRef<string | null>(null);
    const startTimeRef = useRef<number>(Date.now());
    const maxScrollRef = useRef<number>(0);
    const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
    const lastScrollSentRef = useRef<number>(0);

    // Envia evento genérico
    const trackEvent = useCallback(
        (type: string, itemId?: string, metadata?: Record<string, any>) => {
            if (!sessionIdRef.current) return;

            fetch('/api/track/event', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId: sessionIdRef.current,
                    type,
                    itemId: itemId || null,
                    metadata: metadata || {}
                }),
                keepalive: true
            }).catch(() => { /* silencioso */ });
        },
        []
    );

    // Envia heartbeat (tempo + scroll)
    const sendHeartbeat = useCallback(() => {
        if (!sessionIdRef.current) return;

        const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);

        fetch('/api/track/heartbeat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                sessionId: sessionIdRef.current,
                durationSeconds: duration,
                scrollDepthPercent: maxScrollRef.current
            }),
            keepalive: true
        }).catch(() => { /* silencioso */ });
    }, []);

    // Registra entrada
    useEffect(() => {
        if (!tenantId) return;

        // Reutiliza sessionId se já existir para esta aba
        let sessionId = sessionStorage.getItem(`visitor_session_${tenantId}`);
        if (!sessionId) {
            sessionId = generateSessionId();
            sessionStorage.setItem(`visitor_session_${tenantId}`, sessionId);
        }

        sessionIdRef.current = sessionId;
        startTimeRef.current = Date.now();

        // Envia a visita inicial
        fetch('/api/track/visit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                tenantId,
                sessionId,
                userAgent: navigator.userAgent,
                language: navigator.language,
                screenResolution: `${window.screen.width}x${window.screen.height}`,
                referrer: document.referrer || ''
            })
        }).catch(() => { /* silencioso */ });

        // Heartbeat a cada 20 segundos
        heartbeatRef.current = setInterval(sendHeartbeat, 20000);

        // Rastreia scroll
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const percent = docHeight > 0 ? Math.min(100, Math.round((scrollTop / docHeight) * 100)) : 0;

            if (percent > maxScrollRef.current) {
                maxScrollRef.current = percent;

                // Marca "scroll_deep" quando passar de 75% (apenas uma vez)
                if (percent >= 75 && lastScrollSentRef.current < 75) {
                    lastScrollSentRef.current = 75;
                    trackEvent('scroll_deep', undefined, { percent });
                }
            }
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        // Envia último heartbeat ao sair (sendBeacon é mais confiável)
        const handleBeforeUnload = () => {
            if (!sessionIdRef.current) return;
            const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);

            const payload = JSON.stringify({
                sessionId: sessionIdRef.current,
                durationSeconds: duration,
                scrollDepthPercent: maxScrollRef.current
            });

            // sendBeacon garante envio mesmo ao fechar a aba
            navigator.sendBeacon?.(
                '/api/track/heartbeat',
                new Blob([payload], { type: 'application/json' })
            );
        };

        window.addEventListener('beforeunload', handleBeforeUnload);

        // Limpa recursos
        return () => {
            if (heartbeatRef.current) clearInterval(heartbeatRef.current);
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('beforeunload', handleBeforeUnload);
            sendHeartbeat();
        };
    }, [tenantId, sendHeartbeat, trackEvent]);

    return { trackEvent };
}