'use client';

import React from 'react';

interface Corretor {
    _id: string;
    name: string;
    email: string;
    phone: string;
    city?: string;
    createdAt: string;
    maxItems?: number;
    maxImagesPerItem?: number;
    subscriptionExpiresAt?: string;
    isAnuidadePaid?: boolean;
}

interface TenantsTableProps {
    tenants: Corretor[];
    getExpirationDetails: (tenant: Corretor) => { formattedDate: string; isExpired: boolean; expStr: string };
    onOpenPixModal: (tenant: Corretor) => void;
    onOpenEditModal: (tenant: Corretor, expStr: string) => void;
    onDeleteTenant: (id: string) => void;
}

export default function TenantsTable({
    tenants,
    getExpirationDetails,
    onOpenPixModal,
    onOpenEditModal,
    onDeleteTenant
}: TenantsTableProps) {
    if (tenants.length === 0) {
        return <p className="p-8 text-center text-sm text-gray-400">Nenhum cliente cadastrado na plataforma.</p>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-900 border-b border-gray-700 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        <th className="p-4">Nome do Cliente</th>
                        <th className="p-4">Contato / E-mail</th>
                        <th className="p-4">Limites Atuais</th>
                        <th className="p-4">Validade / Status</th>
                        <th className="p-4 text-right">Ações Críticas</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50 text-sm">
                    {tenants.map((t) => {
                        const { formattedDate, isExpired, expStr } = getExpirationDetails(t);
                        return (
                            <tr key={t._id} className="hover:bg-gray-750/30 transition-colors">
                                <td className="p-4 whitespace-nowrap">
                                    <p className="font-bold text-white text-base">{t.name}</p>
                                    <span className="text-[10px] font-mono text-gray-500">TenantID: {t._id}</span>
                                </td>
                                <td className="p-4 font-mono text-xs">
                                    <p className="text-gray-200">{t.email}</p>
                                    <p className="text-blue-400 mt-0.5">{t.phone}</p>
                                </td>
                                <td className="p-4 text-xs font-mono">
                                    <span className="bg-blue-900/40 text-blue-300 border border-blue-800 px-2 py-1 rounded inline-block mb-1">
                                        📌 Registro: <strong>{t.maxItems ?? 10}</strong>
                                    </span>
                                    <br />
                                    <span className="bg-emerald-900/40 text-emerald-300 border border-emerald-800 px-2 py-1 rounded inline-block">
                                        🖼️ Fotos/Registro: <strong>{t.maxImagesPerItem ?? 4}</strong>
                                    </span>
                                </td>
                                <td className="p-4 text-xs font-mono">
                                    <div>
                                        <p className={`font-bold ${isExpired ? 'text-red-400' : 'text-emerald-400'}`}>
                                            {formattedDate}
                                        </p>
                                        <span className="text-[10px] text-gray-400">
                                            {isExpired ? '⚠️ Vencido' : '✅ Em dia'}
                                        </span>
                                    </div>
                                </td>
                                <td className="p-4 text-right whitespace-nowrap">
                                    <div className="inline-flex gap-1.5 flex-wrap justify-end">
                                        <button
                                            onClick={() => onOpenPixModal(t)}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow"
                                        >
                                            💳 Baixar Pix
                                        </button>
                                        <button
                                            onClick={() => onOpenEditModal(t, expStr)}
                                            className="bg-blue-500/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 px-3 py-1.5 rounded-lg text-xs font-bold transition"
                                        >
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => onDeleteTenant(t._id)}
                                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow"
                                        >
                                            Banir
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}