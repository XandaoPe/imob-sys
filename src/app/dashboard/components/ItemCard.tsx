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

    return (
        <div
            className={`border rounded-xl overflow-hidden flex flex-col justify-between bg-white shadow-sm transition group/card ${isThisItemEditing ? 'border-amber-400 ring-2 ring-amber-100' : 'border-gray-200 hover:shadow-md'
                }`}
        >
            <div>
                {gallery.length > 0 ? (
                    <div
                        onClick={() => onOpenVisualization(item)}
                        className="w-full h-44 bg-gray-50 flex items-center justify-center p-2 border-b border-gray-100 relative group cursor-zoom-in"
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
                                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-md md:opacity-0 md:group-hover:opacity-100 transition duration-200 hover:bg-black/90 hover:scale-105"
                                    style={{ textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}
                                >
                                    &#10094;
                                </button>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onChangeCardImageIndex(item._id, 'next', gallery.length);
                                    }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-md md:opacity-0 md:group-hover:opacity-100 transition duration-200 hover:bg-black/90 hover:scale-105"
                                    style={{ textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}
                                >
                                    &#10095;
                                </button>
                                <span className="absolute bottom-1 right-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded font-mono shadow-sm">
                                    {activeImageIndex + 1}/{gallery.length}
                                </span>
                            </>
                        )}
                    </div>
                ) : (
                    <div className="w-full h-44 bg-gray-100 flex items-center justify-center text-gray-400 text-xs border-b">Sem imagem</div>
                )}

                <div
                    onClick={() => onOpenVisualization(item)}
                    className="p-4 cursor-zoom-in group-hover/card:bg-gray-50/50 transition-colors"
                >
                    <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1 group-hover/card:text-blue-600 transition-colors flex items-center gap-1.5">
                        {item.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-3">{item.description}</p>
                </div>
            </div>

            <div className="p-4 pt-0 grid grid-cols-2 gap-2">
                <button
                    type="button"
                    onClick={() => onStartEdit(item)}
                    disabled={isLoading || isThisItemEditing}
                    className={`py-2 px-3 rounded-lg text-sm font-semibold transition disabled:opacity-50 flex items-center justify-center gap-1 ${isThisItemEditing ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                        }`}
                >
                    {isThisItemEditing ? 'Editando...' : 'Editar'}
                </button>
                <button
                    type="button"
                    onClick={() => onDelete(item._id)}
                    disabled={isLoading || isThisItemEditing}
                    className="py-2 px-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition border border-red-200 disabled:opacity-50 flex items-center justify-center gap-1 disabled:cursor-not-allowed"
                >
                    Excluir
                </button>
            </div>
        </div>
    );
}