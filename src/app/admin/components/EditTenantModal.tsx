'use client';

import React from 'react';

interface EditTenantModalProps {
    tenantId: string;
    editTenantName: string;
    setEditTenantName: (val: string) => void;
    editTenantEmail: string;
    setEditTenantEmail: (val: string) => void;
    editTenantPhone: string;
    setEditTenantPhone: (val: string) => void;
    editTenantCity: string;
    setEditTenantCity: (val: string) => void;
    editTenantPassword: string;
    setEditTenantPassword: (val: string) => void;
    limitMaxItems: number;
    setLimitMaxItems: (val: number) => void;
    limitMaxImages: number;
    setLimitMaxImages: (val: number) => void;
    limitSubscriptionExpiresAt: string;
    setLimitSubscriptionExpiresAt: (val: string) => void;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
}

export default function EditTenantModal({
    tenantId,
    editTenantName, setEditTenantName,
    editTenantEmail, setEditTenantEmail,
    editTenantPhone, setEditTenantPhone,
    editTenantCity, setEditTenantCity,
    editTenantPassword, setEditTenantPassword,
    limitMaxItems, setLimitMaxItems,
    limitMaxImages, setLimitMaxImages,
    limitSubscriptionExpiresAt, setLimitSubscriptionExpiresAt,
    onClose,
    onSubmit
}: EditTenantModalProps) {
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 max-w-xl w-full text-gray-100 relative shadow-2xl max-h-[90vh] overflow-y-auto">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl font-bold"
                >
                    &times;
                </button>
                <h3 className="text-xl font-bold text-blue-400 mb-1">Editar Cadastro do Cliente (Master)</h3>
                <p className="text-xs text-gray-400 mb-4">ID: <strong className="text-gray-200">{tenantId}</strong></p>

                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs uppercase tracking-wider font-semibold text-gray-400 mb-1">Nome Completo</label>
                            <input
                                type="text"
                                value={editTenantName}
                                onChange={(e) => setEditTenantName(e.target.value)}
                                required
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs uppercase tracking-wider font-semibold text-gray-400 mb-1">E-mail</label>
                            <input
                                type="email"
                                value={editTenantEmail}
                                onChange={(e) => setEditTenantEmail(e.target.value)}
                                required
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs uppercase tracking-wider font-semibold text-gray-400 mb-1">Telefone / WhatsApp</label>
                            <input
                                type="text"
                                value={editTenantPhone}
                                onChange={(e) => setEditTenantPhone(e.target.value)}
                                required
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs uppercase tracking-wider font-semibold text-gray-400 mb-1">Cidade (Opcional)</label>
                            <input
                                type="text"
                                value={editTenantCity}
                                onChange={(e) => setEditTenantCity(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs uppercase tracking-wider font-semibold text-amber-400 mb-1">Nova Senha (Deixe em branco para manter a atual)</label>
                        <input
                            type="text"
                            value={editTenantPassword}
                            onChange={(e) => setEditTenantPassword(e.target.value)}
                            placeholder="Digite uma nova senha se desejar redefinir"
                            className="w-full bg-gray-900 border border-amber-600/50 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-gray-700">
                        <div>
                            <label className="block text-xs uppercase tracking-wider font-semibold text-gray-400 mb-1">Máx. Registros</label>
                            <input
                                type="number"
                                min="1"
                                value={limitMaxItems}
                                onChange={(e) => setLimitMaxItems(Number(e.target.value))}
                                required
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs uppercase tracking-wider font-semibold text-gray-400 mb-1">Máx. Fotos/Reg.</label>
                            <input
                                type="number"
                                min="1"
                                value={limitMaxImages}
                                onChange={(e) => setLimitMaxImages(Number(e.target.value))}
                                required
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs uppercase tracking-wider font-semibold text-gray-400 mb-1">Vencimento</label>
                            <input
                                type="date"
                                value={limitSubscriptionExpiresAt}
                                onChange={(e) => setLimitSubscriptionExpiresAt(e.target.value)}
                                required
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-700 text-gray-300 px-4 py-2 rounded-lg text-xs font-semibold hover:bg-gray-600 transition"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-lg text-xs transition shadow-md"
                        >
                            Salvar Alterações Master
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}