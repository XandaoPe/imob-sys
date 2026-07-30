'use client';

import React, { useState } from 'react';
import { InfoTooltip } from '@/components/ui/InfoTooltip';
import { useCities } from '@/hooks/useCities';
import PixModal from '@/app/dashboard/components/PixModal';

interface RegisterFormProps {
    onSuccess: () => void;
}

export default function RegisterForm({ onSuccess }: RegisterFormProps) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [city, setCity] = useState('');
    const [websiteLink, setWebsiteLink] = useState('');
    const [businessCardLink, setBusinessCardLink] = useState('');
    const [password, setPassword] = useState('');

    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [isPixModalOpen, setIsPixModalOpen] = useState(false);
    const [registeredTenantId, setRegisteredTenantId] = useState('');
    const [registeredTenantName, setRegisteredTenantName] = useState('');
    const [registeredTenantPhone, setRegisteredTenantPhone] = useState('');
    const [registeredTenantEmail, setRegisteredTenantEmail] = useState('');

    const allCities = useCities();

    const formatPhone = (value: string) => {
        if (!value) return '';
        const cleanValue = value.replace(/\D/g, '');
        if (cleanValue.length <= 2) return `(${cleanValue}`;
        if (cleanValue.length <= 6) return `(${cleanValue.substring(0, 2)}) ${cleanValue.substring(2)}`;
        return `(${cleanValue.substring(0, 2)}) ${cleanValue.substring(2, 7)}-${cleanValue.substring(7, 11)}`;
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPhone(formatPhone(e.target.value));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;

        setError('');
        setIsSubmitting(true);

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    email,
                    phone,
                    password,
                    city,
                    websiteLink,
                    businessCardLink,
                }),
            });

            const contentType = res.headers.get('content-type');
            let data: any = {};

            if (contentType && contentType.includes('application/json')) {
                data = await res.json();
            } else {
                throw new Error(`O servidor respondeu com formato inválido (${res.status}).`);
            }

            if (res.ok) {
                setRegisteredTenantId(data.tenantId);
                setRegisteredTenantName(data.tenantName || name);
                setRegisteredTenantPhone(data.tenantPhone || phone);
                setRegisteredTenantEmail(data.tenantEmail || email);
                setIsPixModalOpen(true);
            } else {
                setError(data.error || data.message || 'Ocorreu um erro no cadastro.');
            }
        } catch (err: any) {
            console.error('Erro de requisição:', err);
            setError(err.message || 'Ocorreu um erro ao tentar conectar com o servidor.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <p className="text-red-500 dark:text-red-400 text-sm mb-4 text-center font-medium">
                        {error}
                    </p>
                )}

                <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        <span>Nome Completo</span>
                        <InfoTooltip text="Seu nome profissional ou razão social da imobiliária/empresa." />
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full p-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white"
                        placeholder="Seu nome"
                    />
                </div>

                <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        <span>E-mail</span>
                        <InfoTooltip text="E-mail principal para acessar o painel." />
                    </label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full p-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white"
                        placeholder="seu@email.com"
                    />
                </div>

                <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        <span>WhatsApp / Telefone</span>
                        <InfoTooltip text="Número de contato principal para os clientes." />
                    </label>
                    <input
                        type="text"
                        value={phone}
                        onChange={handlePhoneChange}
                        maxLength={15}
                        required
                        className="w-full p-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white"
                        placeholder="(00) 00000-0000"
                    />
                </div>

                <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        <span>Cidade / UF</span>
                        <InfoTooltip text="Sua cidade principal de atuação." />
                    </label>
                    <input
                        type="text"
                        list="cities-datalist"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required
                        className="w-full p-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white"
                        placeholder="Digite para buscar sua cidade..."
                    />
                    <datalist id="cities-datalist">
                        {allCities.map((cidadeCompleta, index) => (
                            <option key={index} value={cidadeCompleta} />
                        ))}
                    </datalist>
                </div>

                <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        <span>Link do Seu Site</span>
                        <InfoTooltip text="(Opcional)" />
                    </label>
                    <input
                        type="url"
                        value={websiteLink}
                        onChange={(e) => setWebsiteLink(e.target.value)}
                        placeholder="https://seusite.com.br"
                        className="w-full p-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white"
                    />
                </div>

                <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        <span>Link do Cartão de Visitas Virtual</span>
                        <InfoTooltip text="(Opcional)" />
                    </label>
                    <input
                        type="url"
                        value={businessCardLink}
                        onChange={(e) => setBusinessCardLink(e.target.value)}
                        className="w-full p-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white"
                        placeholder="https://meucartao.com/seu-perfil"
                    />
                </div>

                <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        <span>Senha</span>
                        <InfoTooltip text="Sua senha secreta de acesso." />
                    </label>
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
                    className="w-full bg-blue-600 dark:bg-blue-500 text-white p-2.5 rounded-lg font-medium hover:bg-blue-700 transition shadow-sm mt-2 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {isSubmitting ? 'Cadastrando...' : 'Cadastrar e Testar por 7 Dias'}
                </button>
            </form>

            <PixModal
                isOpen={isPixModalOpen}
                onClose={() => {
                    setIsPixModalOpen(false);
                    alert('Cadastro realizado! Você ganhou 7 dias de acesso gratuito de teste. Faça login para acessar.');
                    onSuccess();
                }}
                tenantId={registeredTenantId}
                tenantName={registeredTenantName}
                tenantPhone={registeredTenantPhone}
                tenantEmail={registeredTenantEmail}
            />
        </>
    );
}