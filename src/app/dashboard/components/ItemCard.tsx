'use client';

import { Item } from '../types';

interface ItemCardProps {
    item: Item;
    editingId: string | null;
    isLoading: boolean;
    activeImageIndex: number;
    onChangeCardImageIndex: (itemId: string, direction: 'prev' | 'next', max: number) => void;
    onOpenVisualization: (item: Item) => void;
    onStartEdit: (item: Item) => void;
    onDelete: (id: string) => void;
}

export default function ItemCard({
    item,
    editingId,
    isLoading,
    activeImageIndex,
    onChangeCardImageIndex,
    onOpenVisualization,
    onStartEdit,
    onDelete,
}: ItemCardProps) {
    const isThisItemEditing = editingId === item._id;
    const gallery = item.images || [];

    // Cálculo do Status de Validade
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expirationDate = item.expiresAt ? new Date(item.expiresAt) : null;
    const isExpired = expirationDate ? expirationDate < today : false;
    const isCurrentlyActive = item.isActive !== false && !isExpired;

    const formattedDate = expirationDate
        ? expirationDate.toLocaleDateString('pt-BR', { timeZone: 'UTC' })
        : 'Não definida';

    return (
        <div
            className={`border rounded-xl overflow-hidden flex flex-col justify-between bg-white dark:bg-gray-900 shadow-sm transition group/card ${isThisItemEditing
                    ? 'border-amber-400 ring-2 ring-amber-100 dark:ring-amber-900/40'
                    : 'border-gray-200 dark:border-gray-800 hover:shadow-md dark:hover:border-gray-700'
                }`}
        >
            <div>
                {/* ETIQUETAS DE STATUS */}
                <div className="p-2.5 pb-0 flex items-center justify-between text-xs font-semibold">
                    {isCurrentlyActive ? (
                        <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                            ● Ativo
                        </span>
                    ) : isExpired ? (
                        <span className="bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 px-2.5 py-0.5 rounded-full border border-rose-300 dark:border-rose-800">
                            ● Expirado
                        </span>
                    ) : (
                        <span className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 px-2.5 py-0.5 rounded-full border border-gray-300 dark:border-gray-700">
                            ○ Inativo
                        </span>
                    )}

                    <span className="text-[11px] text-gray-500 dark:text-gray-400 font-normal">
                        Válido até: <strong>{formattedDate}</strong>
                    </span>
                </div>

                {gallery.length > 0 ? (
                    <div
                        onClick={() => onOpenVisualization(item)}
                        className="w-full h-44 bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-2 border-b border-gray-100 dark:border-gray-800 relative group cursor-zoom-in mt-2"
                    >
                        <img
                            src={gallery[activeImageIndex] || '/placeholder.png'}
                            className="max-w-full max-h-full object-contain rounded-lg transition-transform duration-200 group-hover:scale-[1.02]"
                            alt={item.title}
                        />

                        {gallery.length > 1 && !isThisItemEditing && (
                            <>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onChangeCardImageIndex(item._id, 'prev', gallery.length);
                                    }}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-md hover:bg-black/90 transition"
                                >
                                    &#10094;
                                </button>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onChangeCardImageIndex(item._id, 'next', gallery.length);
                                    }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-md hover:bg-black/90 transition"
                                >
                                    &#10095;
                                </button>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="w-full h-44 bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 text-xs border-b border-gray-200 dark:border-gray-800 mt-2">
                        Sem imagem
                    </div>
                )}

                <div
                    onClick={() => onOpenVisualization(item)}
                    className="p-4 cursor-zoom-in group-hover/card:bg-gray-50/50 dark:group-hover/card:bg-gray-800/40 transition-colors"
                >
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-tight mb-1">
                        {item.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">{item.description}</p>
                </div>
            </div>

            <div className="p-4 pt-0 grid grid-cols-2 gap-2">
                <button
                    type="button"
                    onClick={() => onStartEdit(item)}
                    disabled={isLoading || isThisItemEditing}
                    className={`py-2 px-3 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-1 ${isThisItemEditing
                            ? 'bg-amber-500 text-white'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 hover:bg-amber-100'
                        }`}
                >
                    {isThisItemEditing ? 'Editando...' : 'Editar'}
                </button>
                <button
                    type="button"
                    onClick={() => onDelete(item._id)}
                    disabled={isLoading || isThisItemEditing}
                    className="py-2 px-3 bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-100 transition border border-red-200 dark:border-red-900/40 flex items-center justify-center gap-1"
                >
                    Excluir
                </button>
            </div>
        </div>
    );
}