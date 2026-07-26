'use client';

import React, { useState } from 'react';
import { InfoTooltip } from '@/components/ui/InfoTooltip';
import { useCities } from '@/hooks/useCities';

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

    // Hook para carregar a lista de cidades
    const allCities = useCities();

    // Aplica máscara de telefone
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
                if (res.status === 404) {
                    throw new Error("Rota de API '/api/auth/register' não encontrada (404).");
                }
                throw new Error(`O servidor respondeu com formato inválido (${res.status}).`);
            }

            if (res.ok) {
                alert('Cadastro realizado! Faça login agora.');
                onSuccess(); // Alterna a tela para Login no componente pai
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
        <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
                <p className="text-red-500 dark:text-red-400 text-sm mb-4 text-center font-medium">
                    {error}
                </p>
            )}

            <div>
                <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <span>Nome Completo</span>
                    <InfoTooltip text="Seu nome profissional ou razão social da imobiliária/empresa que será exibida nos seus anúncios." />
                </label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full p-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none transition-colors"
                    placeholder="Seu nome"
                />
            </div>

            <div>
                <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <span>E-mail</span>
                    <InfoTooltip text="E-mail principal para acessar o painel, recuperar senha e receber avisos." />
                </label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full p-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none transition-colors"
                    placeholder="seu@email.com"
                />
            </div>

            <div>
                <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <span>WhatsApp / Telefone</span>
                    <InfoTooltip text="Número de contato principal. Os clientes clicarão no seu anúncio e serão direcionados para este WhatsApp." />
                </label>
                <input
                    type="text"
                    value={phone}
                    onChange={handlePhoneChange}
                    maxLength={15}
                    required
                    className="w-full p-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none transition-colors"
                    placeholder="(00) 00000-0000"
                />
            </div>

            <div>
                <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <span>Cidade / UF</span>
                    <InfoTooltip text="Sua cidade principal de atuação para regionalizar e listar seus anúncios no catálogo local." />
                </label>
                <input
                    type="text"
                    list="cities-datalist"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    className="w-full p-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none transition-colors"
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
                    <InfoTooltip text="(Opcional) Link direto para o seu portal ou site próprio de vendas/produtos." />
                </label>
                <input
                    type="url"
                    value={websiteLink}
                    onChange={(e) => setWebsiteLink(e.target.value)}
                    placeholder="https://seusite.com.br"
                    className="w-full p-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none transition-colors"
                />
            </div>

            <div>
                <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    <span>Link do Cartão de Visitas Virtual</span>
                    <InfoTooltip text="(Opcional) Link interativo com suas redes e dados (ex: Linktree, vCard ou cartão digital)." />
                </label>
                <input
                    type="url"
                    value={businessCardLink}
                    onChange={(e) => setBusinessCardLink(e.target.value)}
                    className="w-full p-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none transition-colors"
                    placeholder="https://meucartao.com/seu-perfil"
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
                    className="w-full p-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none transition-colors"
                    placeholder="••••••••"
                />
            </div>

            <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 dark:bg-blue-500 text-white p-2.5 rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition shadow-sm mt-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                {isSubmitting && (
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                )}
                {isSubmitting ? 'Cadastrando...' : 'Cadastrar'}
            </button>
        </form>
    );
}