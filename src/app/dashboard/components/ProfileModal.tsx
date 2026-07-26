'use client';

import React, { useState } from 'react';

const InfoTooltip = ({ text }: { text: string }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <span className="relative inline-flex items-center ml-1">
            <button
                type="button" // IMPORTANTE: Impede o submit/recarregamento do formulário ao tocar no celular
                onClick={() => setIsOpen(!isOpen)}
                onMouseEnter={() => setIsOpen(true)}
                onMouseLeave={() => setIsOpen(false)}
                onBlur={() => setIsOpen(false)} // Fecha o balão ao clicar fora do ícone
                className="w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-blue-600 dark:hover:bg-blue-500 hover:text-white text-gray-600 dark:text-gray-300 font-bold text-[10px] flex items-center justify-center transition-colors cursor-help select-none focus:outline-none"
                aria-label="Mais informações"
            >
                ?
            </button>
            {isOpen && (
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 flex flex-col items-center z-50 w-52 pointer-events-none animate-fadeIn">
                    <span className="relative z-10 p-2 text-xs leading-relaxed text-white bg-gray-900/95 dark:bg-gray-800 rounded-lg shadow-xl text-center font-normal border border-transparent dark:border-gray-700">
                        {text}
                    </span>
                    <span className="w-2 h-2 -mt-1 rotate-45 bg-gray-900/95 dark:bg-gray-800 block"></span>
                </span>
            )}
        </span>
    );
};

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    tenantName: string;
    setTenantName: (val: string) => void;
    tenantEmail: string;
    setTenantEmail: (val: string) => void;
    tenantPhone: string;
    setTenantPhone: (val: string) => void;
    tenantCity: string;
    setTenantCity: (val: string) => void;
    tenantWebsiteLink: string;
    setTenantWebsiteLink: (val: string) => void;
    tenantBusinessCardLink: string;
    setTenantBusinessCardLink: (val: string) => void;
    tenantPassword: string;
    setTenantPassword: (val: string) => void;
    onUpdateProfile: (e: React.FormEvent) => void;
    isSavingProfile: boolean;
}

export default function ProfileModal({
    isOpen,
    onClose,
    tenantName,
    setTenantName,
    tenantEmail,
    setTenantEmail,
    tenantPhone,
    setTenantPhone,
    tenantCity,
    setTenantCity,
    tenantWebsiteLink,
    setTenantWebsiteLink,
    tenantBusinessCardLink,
    setTenantBusinessCardLink,
    tenantPassword,
    setTenantPassword,
    onUpdateProfile,
    isSavingProfile,
}: ProfileModalProps) {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-gray-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto border border-transparent dark:border-gray-800"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl font-bold transition-colors"
                >
                    &times;
                </button>

                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Editar Meu Perfil
                </h2>

                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                    Mantenha seus dados de contato e atuação profissional atualizados para os seus clientes.
                </p>

                <form onSubmit={onUpdateProfile} className="space-y-4">
                    <div>
                        <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            <span>Nome Completo</span>
                            <InfoTooltip text="Seu nome profissional ou o nome da sua empresa/imobiliária exibido nos anúncios." />
                        </label>
                        <input
                            type="text"
                            value={tenantName}
                            onChange={(e) => setTenantName(e.target.value)}
                            required
                            className="w-full p-2.5 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm focus:outline-none transition-colors"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                <span>E-mail</span>
                                <InfoTooltip text="Endereço de e-mail de acesso e contato administrativo." />
                            </label>
                            <input
                                type="email"
                                value={tenantEmail}
                                onChange={(e) => setTenantEmail(e.target.value)}
                                required
                                className="w-full p-2.5 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm focus:outline-none transition-colors"
                            />
                        </div>
                        <div>
                            <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                <span>Telefone / WhatsApp</span>
                                <InfoTooltip text="Número para o qual os clientes serão redirecionados diretamente no WhatsApp ao clicarem no seu anúncio." />
                            </label>
                            <input
                                type="text"
                                value={tenantPhone}
                                onChange={(e) => setTenantPhone(e.target.value)}
                                required
                                placeholder="(18) 99999-9999"
                                className="w-full p-2.5 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm focus:outline-none transition-colors"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            <span>Cidade de Atuação</span>
                            <InfoTooltip text="Cidade e Estado onde seus anúncios serão agrupados na busca principal." />
                        </label>
                        <input
                            type="text"
                            value={tenantCity}
                            onChange={(e) => setTenantCity(e.target.value)}
                            placeholder="Ex: Presidente Epitácio - SP"
                            className="w-full p-2.5 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm focus:outline-none transition-colors"
                        />
                    </div>

                    <div>
                        <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            <span>Link do seu Site</span>
                            <InfoTooltip text="(Opcional) Seu portal externo ou site institucional principal." />
                        </label>
                        <input
                            type="url"
                            value={tenantWebsiteLink}
                            onChange={(e) => setTenantWebsiteLink(e.target.value)}
                            placeholder="https://seusite.com.br"
                            className="w-full p-2.5 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 placeholder-gray-400 dark:placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm focus:outline-none font-mono transition-colors"
                        />
                    </div>

                    <div>
                        <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            <span>Link do Cartão de Visitas Virtual</span>
                            <InfoTooltip text="(Opcional) Link interativo com seus dados de contato (Linktree, vCard digital, etc)." />
                        </label>
                        <input
                            type="url"
                            value={tenantBusinessCardLink}
                            onChange={(e) => setTenantBusinessCardLink(e.target.value)}
                            placeholder="https://linktr.ee/seunome"
                            className="w-full p-2.5 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 placeholder-gray-400 dark:placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm focus:outline-none font-mono transition-colors"
                        />
                    </div>

                    <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                        <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            <span>Nova Senha</span>
                            <InfoTooltip text="Preencha este campo apenas se desejar redefinir sua senha de acesso. Caso contrário, deixe vazio." />
                            <span className="text-xs text-gray-400 dark:text-gray-500 font-normal ml-1">(deixe em branco para manter a atual)</span>
                        </label>
                        <input
                            type="password"
                            value={tenantPassword}
                            onChange={(e) => setTenantPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full p-2.5 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm focus:outline-none transition-colors"
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSavingProfile}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition shadow-sm disabled:bg-gray-400 dark:disabled:bg-gray-700"
                        >
                            {isSavingProfile ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}