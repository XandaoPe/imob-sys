'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { InfoTooltip } from '@/components/ui/InfoTooltip';

export default function LoginForm() {
    const [loginIdentifier, setLoginIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
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

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}

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
                    className="w-full p-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm"
                    placeholder="Digite seu e-mail ou nº de telefone"
                />
            </div>

            <div>
                <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <span>Senha</span>
                    <InfoTooltip text="Sua senha secreta de acesso individual ao painel administrativo de anúncios." />
                </label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full p-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm"
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
    );
}