'use client';

// COMPONENTE DE TOOLTIP DE INFORMAÇÃO (Tags trocadas de div para span para evitar erro de hidratação no HTML)
const InfoTooltip = ({ text }: { text: string }) => {
    return (
        <span className="group relative inline-flex items-center ml-1">
            <span className="w-4 h-4 rounded-full bg-blue-200 hover:bg-blue-600 hover:text-white text-blue-800 font-bold text-[10px] flex items-center justify-center transition-colors cursor-help select-none">
                ?
            </span>
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center z-50 w-56 pointer-events-none animate-fadeIn">
                <span className="relative z-10 p-2 text-xs leading-relaxed text-white bg-gray-900/95 rounded-lg shadow-xl text-center font-normal">
                    {text}
                </span>
                <span className="w-2 h-2 -mt-1 rotate-45 bg-gray-900/95 block"></span>
            </span>
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
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            {/* Alterado de <p> para <div> para permitir flexbox com ícones e tooltips sem violar as regras do HTML */}
            <div className="font-semibold text-blue-900 text-sm mb-1.5 flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
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
                    className="w-full sm:flex-1 p-2.5 bg-white border border-gray-300 rounded-lg text-xs select-all text-blue-600 font-mono focus:outline-none"
                />

                <div className="flex gap-2 w-full sm:w-auto shrink-0">
                    <button
                        type="button"
                        onClick={onCopy}
                        className={`flex-1 sm:flex-none px-4 py-2.5 sm:py-0 rounded-lg font-medium text-xs transition border flex items-center justify-center gap-1 min-w-[90px] ${copied ? 'bg-green-50 text-green-700 border-green-200' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                    >
                        {copied ? 'Copiado!' : 'Copiar'}
                    </button>

                    <a
                        href={shareLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 sm:flex-none px-4 py-2.5 sm:py-0 bg-blue-600 text-white rounded-lg font-medium text-xs transition border border-blue-600 hover:bg-blue-700 flex items-center justify-center gap-1"
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