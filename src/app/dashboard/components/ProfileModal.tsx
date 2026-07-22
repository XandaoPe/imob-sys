'use client';

import React from 'react';

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
    tenantWebsiteLink: string; // <-- NOVO
    setTenantWebsiteLink: (val: string) => void; // <-- NOVO
    tenantBusinessCardLink: string;
    setTenantBusinessCardLink: (val: string) => void;
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
                className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                    &times;
                </button>

                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Editar Meu Perfil
                </h2>

                <p className="text-xs text-gray-500 mb-4">
                    Mantenha seus dados de contato e atuação profissional atualizados para os seus clientes.
                </p>

                <form onSubmit={onUpdateProfile} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                        <input
                            type="text"
                            value={tenantName}
                            onChange={(e) => setTenantName(e.target.value)}
                            required
                            className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm focus:outline-none"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                            <input
                                type="email"
                                value={tenantEmail}
                                onChange={(e) => setTenantEmail(e.target.value)}
                                required
                                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Telefone / WhatsApp</label>
                            <input
                                type="text"
                                value={tenantPhone}
                                onChange={(e) => setTenantPhone(e.target.value)}
                                required
                                placeholder="(18) 99999-9999"
                                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm focus:outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cidade de Atuação</label>
                        <input
                            type="text"
                            value={tenantCity}
                            onChange={(e) => setTenantCity(e.target.value)}
                            placeholder="Ex: Presidente Epitácio - SP"
                            className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm focus:outline-none"
                        />
                    </div>

                    {/* NOVO CAMPO: Link do seu Site */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Link do seu Site</label>
                        <input
                            type="url"
                            value={tenantWebsiteLink}
                            onChange={(e) => setTenantWebsiteLink(e.target.value)}
                            placeholder="https://seusite.com.br"
                            className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm focus:outline-none text-blue-600 font-mono"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Link do Cartão de Visitas Virtual</label>
                        <input
                            type="url"
                            value={tenantBusinessCardLink}
                            onChange={(e) => setTenantBusinessCardLink(e.target.value)}
                            placeholder="https://linktr.ee/seunome"
                            className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm focus:outline-none text-blue-600 font-mono"
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={isSavingProfile}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition shadow-sm disabled:bg-gray-400"
                        >
                            {isSavingProfile ? 'Salvando...' : 'Salvar Alterações'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}