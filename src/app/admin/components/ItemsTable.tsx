'use client';

import React from 'react';

interface Registro {
    _id: string;
    title: string;
    description: string;
    images?: string[];
    tenantId: string;
    createdAt: string;
    corretor: {
        name: string;
        email: string;
        phone: string;
    };
}

interface ItemsTableProps {
    items: Registro[];
    onEdit: (item: Registro) => void;
    onDelete: (id: string) => void;
}

export default function ItemsTable({ items, onEdit, onDelete }: ItemsTableProps) {
    if (items.length === 0) {
        return <p className="p-8 text-center text-sm text-gray-400">Nenhum registro foi postado em nenhuma conta do sistema.</p>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-900 border-b border-gray-700 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        <th className="p-4">Capa</th>
                        <th className="p-4">Dados do Registro</th>
                        <th className="p-4">Cliente Responsável</th>
                        <th className="p-4 text-right">Ações de Controle</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50 text-sm">
                    {items.map((item) => (
                        <tr key={item._id} className="hover:bg-gray-750/30 transition-colors">
                            <td className="p-4 whitespace-nowrap">
                                <div className="w-16 h-12 bg-gray-900 border border-gray-700 rounded-md overflow-hidden flex items-center justify-center">
                                    {item.images && item.images.length > 0 ? (
                                        <img src={item.images[0]} className="w-full h-full object-cover" alt="Thumb" />
                                    ) : (
                                        <span className="text-[10px] text-gray-500">Sem foto</span>
                                    )}
                                </div>
                            </td>
                            <td className="p-4 max-w-sm">
                                <p className="font-bold text-white text-base leading-tight">{item.title}</p>
                                <p className="text-xs text-gray-400 line-clamp-2 mt-0.5">{item.description}</p>
                                <span className="text-[10px] font-mono text-gray-500 block mt-1">ID: {item._id}</span>
                            </td>
                            <td className="p-4">
                                <p className="font-semibold text-gray-200">{item.corretor.name}</p>
                                <p className="text-xs text-gray-400 font-mono">{item.corretor.email}</p>
                                <p className="text-xs text-blue-400 font-mono">{item.corretor.phone}</p>
                            </td>
                            <td className="p-4 text-right whitespace-nowrap">
                                <div className="inline-flex gap-2">
                                    <button
                                        onClick={() => onEdit(item)}
                                        className="bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-gray-900 border border-amber-500/30 px-3 py-1.5 rounded-lg text-xs font-bold transition"
                                    >
                                        Editar
                                    </button>
                                    <button
                                        onClick={() => onDelete(item._id)}
                                        className="bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 px-3 py-1.5 rounded-lg text-xs font-medium transition"
                                    >
                                        Excluir
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}