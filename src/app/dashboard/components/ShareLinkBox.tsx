'use client';

import React, { useState } from 'react';

const InfoTooltip = ({ text }: { text: string }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <span className="relative inline-flex items-center ml-1">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                onMouseEnter={() => setIsOpen(true)}
                onMouseLeave={() => setIsOpen(false)}
                onBlur={() => setIsOpen(false)}
                className="w-4 h-4 rounded-full bg-blue-200 dark:bg-blue-900/60 hover:bg-blue-600 dark:hover:bg-blue-500 hover:text-white text-blue-800 dark:text-blue-300 font-bold text-[10px] flex items-center justify-center transition-colors cursor-help select-none focus:outline-none"
                aria-label="Mais informações"
            >
                ?
            </button>
            {isOpen && (
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 flex flex-col items-center z-50 w-56 pointer-events-none animate-fadeIn">
                    <span className="relative z-10 p-2 text-xs leading-relaxed text-white bg-gray-900/95 dark:bg-gray-800 rounded-lg shadow-xl text-center font-normal border border-transparent dark:border-gray-700">
                        {text}
                    </span>
                    <span className="w-2 h-2 -mt-1 rotate-45 bg-gray-900/95 dark:bg-gray-800 block"></span>
                </span>
            )}
        </span>
    );
};

interface ShareLinkBoxProps {
    shareLink: string;
    copied: boolean;
    onCopy: () => void;
}

export default function ShareLinkBox({ shareLink, copied, onCopy }: ShareLinkBoxProps) {
    return (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 rounded-xl transition-colors">
            <div className="font-semibold text-blue-900 dark:text-blue-300 text-sm mb-1.5 flex items-center gap-1.5">
                <svg className="w-4 h-4 text-blue-700 dark:text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 00-5.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
                </svg>
                <span>Link de Compartilhamento Público:</span>
                <InfoTooltip text="Copie este link exclusivo para enviar aos seus clientes pelo WhatsApp ou adicionar à bio do seu Instagram." />
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
                <input
                    type="text"
                    readOnly
                    value={shareLink}
                    className="w-full sm:flex-1 p-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-xs select-all text-blue-600 dark:text-blue-400 font-mono focus:outline-none transition-colors"
                />

                <div className="flex gap-2 w-full sm:w-auto shrink-0">
                    <button
                        type="button"
                        onClick={onCopy}
                        className={`flex-1 sm:flex-none px-4 py-2.5 sm:py-0 rounded-lg font-medium text-xs transition border flex items-center justify-center gap-1 min-w-[90px] ${copied
                            ? 'bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800/50'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }`}
                    >
                        {copied ? 'Copiado!' : 'Copiar'}
                    </button>

                    <a
                        href={shareLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 sm:flex-none px-4 py-2.5 sm:py-0 bg-blue-600 dark:bg-blue-500 text-white rounded-lg font-medium text-xs transition border border-blue-600 dark:border-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600 flex items-center justify-center gap-1"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2v-5M16.5 3.5l3.5 3.5m0 0l-3.5 3.5m3.5-3.5H11" />
                        </svg>
                        Abrir Link
                    </a>
                </div>
            </div>
        </div>
    );
}