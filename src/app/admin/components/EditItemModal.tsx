'use client';

import React from 'react';

interface EditItemModalProps {
    corretorName: string;
    corretorEmail: string;
    editTitle: string;
    setEditTitle: (val: string) => void;
    editDescription: string;
    setEditDescription: (val: string) => void;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
}

export default function EditItemModal({
    corretorName,
    corretorEmail,
    editTitle,
    setEditTitle,
    editDescription,
    setEditDescription,
    onClose,
    onSubmit
}: EditItemModalProps) {
    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 max-w-xl w-full text-gray-100 relative shadow-2xl">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl font-bold"
                >
                    &times;
                </button>
                <h3 className="text-xl font-bold text-amber-400 mb-2">Modo Admin: Forçar Edição</h3>
                <p className="text-xs text-gray-400 mb-4">Pertence ao cliente: <strong className="text-gray-200">{corretorName}</strong> ({corretorEmail})</p>

                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs uppercase tracking-wider font-semibold text-gray-400 mb-1">Título do Registro</label>
                        <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            required
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                    </div>
                    <div>
                        <label className="block text-xs uppercase tracking-wider font-semibold text-gray-400 mb-1">Descrição</label>
                        <textarea
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            required
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500 h-32"
                        />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="bg-gray-700 text-gray-300 px-4 py-2 rounded-lg text-xs font-semibold hover:bg-gray-600 transition"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold px-4 py-2 rounded-lg text-xs transition shadow-md"
                        >
                            Gravar Alteração Master
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}