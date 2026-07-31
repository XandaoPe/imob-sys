'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { InfoTooltip } from '@/components/ui/InfoTooltip';
import ForgotPasswordModal from '@/components/auth/ForgotPasswordModal';
import PixModal from '@/app/dashboard/components/PixModal';

export default function LoginForm() {
    const [loginIdentifier, setLoginIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [warningMessage, setWarningMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

    const [isPixModalOpen, setIsPixModalOpen] = useState(false);
    const [blockedTenantId, setBlockedTenantId] = useState('');
    const [blockedTenantName, setBlockedTenantName] = useState('');
    const [blockedTenantPhone, setBlockedTenantPhone] = useState('');
    const [blockedTenantEmail, setBlockedTenantEmail] = useState('');
    const [showPixButton, setShowPixButton] = useState(false);

    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;

        setError('');
        setWarningMessage('');
        setShowPixButton(false);
        setIsSubmitting(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ loginIdentifier, password }),
            });

            const data = await res.json();

            if (res.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('tenantId', data.tenantId);

                // Exibe o aviso apenas se estiver no período de carência de 7 dias após vencer
                if (data.warning) {
                    setBlockedTenantId(data.tenant?.id || data.tenantId);
                    setBlockedTenantName(data.tenant?.name || '');
                    setBlockedTenantPhone(data.tenant?.phone || '');
                    setBlockedTenantEmail(data.tenant?.email || '');
                    setWarningMessage(data.warning);
                    setShowPixButton(true);
                } else {
                    router.push('/dashboard');
                }
            } else {
                setError(data.error || data.message || 'Erro ao realizar login.');
                if (data.requiresPix && data.tenantId) {
                    setBlockedTenantId(data.tenantId);
                    setBlockedTenantName(data.tenantName || '');
                    setBlockedTenantPhone(data.tenantPhone || '');
                    setBlockedTenantEmail(data.tenantEmail || '');
                    setShowPixButton(true);
                }
            }
        } catch (err: any) {
            setError(err.message || 'Erro ao conectar com o servidor.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 text-sm text-center space-y-3">
                        <p className="font-medium leading-relaxed">
                            {error}
                        </p>
                        {showPixButton && !warningMessage && (
                            <button
                                type="button"
                                onClick={() => setIsPixModalOpen(true)}
                                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-sm shadow transition flex items-center justify-center gap-2"
                            >
                                💳 Gerar Pix da Anuidade (R$ 119,90)
                            </button>
                        )}
                    </div>
                )}

                {warningMessage && (
                    <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-200 text-sm text-center space-y-3 shadow-sm">
                        <p className="font-medium leading-relaxed">
                            {warningMessage}
                        </p>
                        <div className="space-y-2">
                            <button
                                type="button"
                                onClick={() => setIsPixModalOpen(true)}
                                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-sm shadow transition flex items-center justify-center gap-2"
                            >
                                💳 Pagar Anuidade via Pix (R$ 119,90)
                            </button>
                            <button
                                type="button"
                                onClick={() => router.push('/dashboard')}
                                className="w-full py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold rounded-lg text-xs transition"
                            >
                                Acessar Painel Temporariamente →
                            </button>
                        </div>
                    </div>
                )}

                <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        <span>E-mail ou Telefone</span>
                        <InfoTooltip text="Digite o e-mail ou o número do seu WhatsApp cadastrado." />
                    </label>
                    <input
                        type="text"
                        value={loginIdentifier}
                        onChange={(e) => setLoginIdentifier(e.target.value)}
                        required
                        className="w-full p-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white"
                        placeholder="Digite seu e-mail ou nº de telefone"
                    />
                </div>

                <div>
                    <div className="flex items-center justify-between mb-1">
                        <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300">
                            <span>Senha</span>
                            <InfoTooltip text="Sua senha secreta de acesso." />
                        </label>
                        <button
                            type="button"
                            onClick={() => setIsForgotPasswordOpen(true)}
                            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                        >
                            Esqueci minha senha
                        </button>
                    </div>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full p-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white"
                        placeholder="••••••••"
                    />
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 dark:bg-blue-500 text-white p-2.5 rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
                >
                    {isSubmitting ? 'Entrando...' : 'Entrar'}
                </button>
            </form>

            <ForgotPasswordModal
                isOpen={isForgotPasswordOpen}
                onClose={() => setIsForgotPasswordOpen(false)}
            />

            <PixModal
                isOpen={isPixModalOpen}
                onClose={() => setIsPixModalOpen(false)}
                tenantId={blockedTenantId}
                tenantName={blockedTenantName}
                tenantPhone={blockedTenantPhone}
                tenantEmail={blockedTenantEmail}
            />
        </>
    );
}