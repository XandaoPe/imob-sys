'use client';

import { Item } from '../types';

interface FullImageModalProps {
    item: Item | null;
    onClose: () => void;
    modalImageIndex: number;
    onChangeImageIndex: (direction: 'prev' | 'next') => void;
}

export default function FullImageModal({ item, onClose, modalImageIndex, onChangeImageIndex }: FullImageModalProps) {
    if (!item) return null;

    return (
        <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col relative"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 bg-gray-900/80 text-white hover:bg-gray-900 w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold transition z-10 shadow"
                >
                    &times;
                </button>

                <div className="relative bg-gray-900 flex-1 min-h-[300px] md:h-[500px] flex items-center justify-center p-4 select-none">
                    {item.images && item.images.length > 0 ? (
                        <>
                            <img
                                src={item.images[modalImageIndex]}
                                className="max-w-full max-h-[70vh] object-contain rounded-lg"
                                alt={item.title}
                            />

                            {item.images.length > 1 && (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => onChangeImageIndex('prev')}
                                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black text-white w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shadow-md transition"
                                    >
                                        &#10094;
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onChangeImageIndex('next')}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black text-white w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shadow-md transition"
                                    >
                                        &#10095;
                                    </button>
                                    <span className="absolute bottom-4 right-4 bg-black/70 text-white text-xs px-2.5 py-1 rounded-md font-mono">
                                        {modalImageIndex + 1} / {item.images.length}
                                    </span>
                                </>
                            )}
                        </>
                    ) : (
                        <div className="text-gray-400 text-sm">Sem imagens cadastradas</div>
                    )}
                </div>

                <div className="p-6 bg-white border-t border-gray-100 overflow-y-auto max-h-[25vh]">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-600 text-sm whitespace-pre-line leading-relaxed">{item.description}</p>
                </div>
            </div>
        </div>
    );
}