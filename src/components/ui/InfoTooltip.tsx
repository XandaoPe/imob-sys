'use client';

import React, { useState } from 'react';

export const InfoTooltip = ({ text }: { text: string }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative inline-flex items-center ml-1">
            <button
                type="button"
                onClick={(e) => {
                    e.preventDefault();
                    setIsOpen((prev) => !prev);
                }}
                onBlur={() => setIsOpen(false)}
                className="w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-blue-600 dark:hover:bg-blue-500 hover:text-white dark:hover:text-white text-gray-600 dark:text-gray-300 font-bold text-[11px] flex items-center justify-center transition-colors cursor-help select-none focus:outline-none"
                aria-label="Mais informações"
            >
                ?
            </button>

            {isOpen && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 flex flex-col items-center z-50 w-52 pointer-events-none animate-fadeIn">
                    <span className="relative z-10 p-2 text-xs leading-relaxed text-white bg-gray-900 dark:bg-gray-800 rounded-lg shadow-xl text-center font-normal border border-transparent dark:border-gray-700">
                        {text}
                    </span>
                    <div className="w-2 h-2 -mt-1 rotate-45 bg-gray-900 dark:bg-gray-800"></div>
                </div>
            )}
        </div>
    );
};