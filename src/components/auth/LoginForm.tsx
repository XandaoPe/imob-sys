'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { InfoTooltip } from '@/components/ui/InfoTooltip';
import ForgotPasswordModal from '@/components/auth/ForgotPasswordModal';

export default function LoginForm() {
    const [loginIdentifier, setLoginIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;

        setError('');
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
                router.push('/dashboard');
            } else {
                setError(data.error || data.message || 'Erro ao realizar login.');
            }
        } catch (err: any) {
            setError(err.message || 'Erro ao conectar com o servidor.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderErrorMessageWithWhatsApp = (message: string) => {
        const phoneRegex = /(\(\d{2}\)\s?\d{4,5}-\d{4})/g;
        const parts = message.split(phoneRegex);

        return parts.map((part, index) => {
            if (phoneRegex.test(part)) {
                const cleanPhone = part.replace(/\D/g, '');
                const whatsappUrl = `https://wa.me/55${cleanPhone}?text=Ol%C3%A1%2C%20gostaria%20de%20renovar%20meu%20acesso`;

                return (
                    <a
                        key={index}
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold underline text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors inline"
                    >
                        {part}
                    </a>
                );
            }
            return part;
        });
    };

    return (
        <>
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 text-sm text-center">
                        <p className="font-medium leading-relaxed">
                            {renderErrorMessageWithWhatsApp(error)}
                        </p>
                    </div>
                )}

                <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        <span>E-mail ou Telefone</span>
                        <InfoTooltip text="Digite o e-mail ou o número do seu WhatsApp cadastrado durante a criação da conta." />
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
                            <InfoTooltip text="Sua senha secreta de acesso individual ao painel administrativo de anúncios." />
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
        </>
    );
}