'use client';

import React from 'react';

interface Corretor {
    _id: string;
    name: string;
    email: string;
    phone: string;
}

interface PixModalProps {
    tenant: Corretor;
    pixAmount: string;
    setPixAmount: (val: string) => void;
    pixPaymentDate: string;
    setPixPaymentDate: (val: string) => void;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
}

export default function PixModal({
    tenant,
    pixAmount,
    setPixAmount,
    pixPaymentDate,
    setPixPaymentDate,
    onClose,
    onSubmit
}: PixModalProps) {
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 max-w-md w-full text-gray-100 relative shadow-2xl">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl font-bold"
                >
                    &times;
                </button>
                <h3 className="text-xl font-bold text-emerald-400 mb-1">💳 Baixa de Pix Recebido</h3>
                <p className="text-xs text-gray-400 mb-4">Confirme os dados para estender a anuidade por mais 1 ano.</p>

                <form onSubmit={onSubmit} className="space-y-3 text-sm">
                    <div className="bg-gray-900/60 p-3 rounded-lg border border-gray-700/60 space-y-1.5 font-mono text-xs">
                        <p><span className="text-gray-400">ID:</span> <span className="text-gray-200">{tenant._id}</span></p>
                        <p><span className="text-gray-400">Nome:</span> <span className="text-white font-bold">{tenant.name}</span></p>
                        <p><span className="text-gray-400">Fone:</span> <span className="text-blue-400">{tenant.phone}</span></p>
                        <p><span className="text-gray-400">E-mail:</span> <span className="text-gray-300">{tenant.email}</span></p>
                    </div>

                    <div>
                        <label className="block text-xs uppercase tracking-wider font-semibold text-gray-400 mb-1">
                            Valor do Pix (R$)
                        </label>
                        <input
                            type="text"
                            value={pixAmount}
                            onChange={(e) => setPixAmount(e.target.value)}
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                        />
                    </div>

                    <div>
                        <label className="block text-xs uppercase tracking-wider font-semibold text-gray-400 mb-1">
                            Data do Recebimento
                        </label>
                        <input
                            type="date"
                            value={pixPaymentDate}
                            onChange={(e) => setPixPaymentDate(e.target.value)}
                            required
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-700 text-gray-300 px-4 py-2 rounded-lg text-xs font-semibold hover:bg-gray-600 transition"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-lg text-xs transition shadow-md"
                        >
                            Confirmar Baixa (+1 Ano)
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}