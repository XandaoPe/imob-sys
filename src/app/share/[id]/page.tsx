'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ThemeToggle from '@/components/ThemeToggle';

interface Item {
    _id: string;
    title: string;
    description: string;
    images?: string[];
}

interface TenantData {
    tenantName: string;
    tenantPhone: string;
    websiteLink?: string;
    businessCardLink?: string;
    items: Item[];
}

export default function PublicSharePage() {
    const params = useParams();
    const [data, setData] = useState<TenantData | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeIndexes, setActiveIndexes] = useState<{ [key: string]: number }>({});

    // Estado para controlar o item ativo e o índice da imagem no visualizador em tela cheia
    const [activeViewer, setActiveViewer] = useState<{ item: Item; currentIdx: number } | null>(null);

    useEffect(() => {
        if (!params?.id) return;

        fetch(`/api/public/tenant/${params.id}`)
            .then((res) => {
                if (res.ok) return res.json();
                throw new Error('Falha ao carregar');
            })
            .then((data) => {
                setData(data);
                const idx: { [key: string]: number } = {};
                data.items.forEach((item: Item) => { idx[item._id] = 0; });
                setActiveIndexes(idx);
            })
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    }, [params?.id]);

    const formatDisplayPhone = (phoneStr: string) => {
        if (!phoneStr) return '';
        const clean = phoneStr.replace(/\D/g, '');
        if (clean.length === 11) {
            return `(${clean.substring(0, 2)}) ${clean.substring(2, 7)}-${clean.substring(7)}`;
        }
        return phoneStr;
    };

    const nextImage = (itemId: string, max: number) => {
        const current = activeIndexes[itemId] || 0;
        setActiveIndexes(prev => ({ ...prev, [itemId]: current + 1 >= max ? 0 : current + 1 }));
    };

    const prevImage = (itemId: string, max: number) => {
        const current = activeIndexes[itemId] || 0;
        setActiveIndexes(prev => ({ ...prev, [itemId]: current - 1 < 0 ? max - 1 : current - 1 }));
    };

    // Funções de navegação exclusivas para o modo Tela Cheia
    const nextViewerImage = (max: number) => {
        if (!activeViewer) return;
        setActiveViewer(prev => prev ? {
            ...prev,
            currentIdx: prev.currentIdx + 1 >= max ? 0 : prev.currentIdx + 1
        } : null);
    };

    const prevViewerImage = (max: number) => {
        if (!activeViewer) return;
        setActiveViewer(prev => prev ? {
            ...prev,
            currentIdx: prev.currentIdx - 1 < 0 ? max - 1 : prev.currentIdx - 1
        } : null);
    };

    // Função que abre a janela nativa de compartilhar do celular
    const handleSharePage = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: data?.tenantName || "Catálogo",
                    text: `Acesse a página de ${data?.tenantName}. Para salvar no seu celular, toque em "Adicionar à Tela de Início".`,
                    url: window.location.href,
                });
            } catch (error) {
                console.log('Compartilhamento cancelado', error);
            }
        } else {
            try {
                await navigator.clipboard.writeText(window.location.href);
                alert("Link da página copiado! Agora você pode enviar ou salvar onde quiser.");
            } catch (err) {
                console.error("Erro ao copiar", err);
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center text-gray-500 dark:text-gray-400">
                Carregando registros...
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center text-red-500 dark:text-red-400 font-medium">
                Página não encontrada.
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 text-gray-800 dark:text-gray-100 transition-colors duration-200">
            <header className="max-w-5xl mx-auto text-center mb-12 mt-6 bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs flex flex-col items-center relative">

                {/* Botão para alternar entre tema claro e escuro */}
                <div className="absolute top-4 right-4">
                    <ThemeToggle />
                </div>

                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-1 pr-8 sm:pr-0">
                    {data.tenantName}
                </h1>

                {data.tenantPhone && (
                    <div className="mt-2 flex items-center justify-center gap-1.5 text-sm font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/50 w-fit mx-auto px-3 py-1 rounded-full border border-green-200 dark:border-green-800/60">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <a href={`https://wa.me/55${data.tenantPhone}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            WhatsApp: {formatDisplayPhone(data.tenantPhone)}
                        </a>
                    </div>
                )}

                {data.businessCardLink && (
                    <div className="mt-4 w-full max-w-sm">
                        <a
                            href={data.businessCardLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-500 dark:to-indigo-500 text-white py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 hover:from-blue-700 hover:to-indigo-700 shadow-sm transition-all transform hover:-translate-y-0.5"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2v-5M16.5 3.5l3.5 3.5m0 0l-3.5 3.5m3.5-3.5H11" />
                            </svg>
                            Clique aqui para visualizar informações de contato
                        </a>
                    </div>
                )}

                {data.websiteLink && (
                    <div className="mt-3 w-full max-w-sm">
                        <a
                            href={data.websiteLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full bg-slate-800 dark:bg-slate-700 text-white py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-slate-900 dark:hover:bg-slate-600 shadow-sm transition-all transform hover:-translate-y-0.5"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                            </svg>
                            Visitar nosso Site
                        </a>
                    </div>
                )}

                {/* BOTÃO COMPARTILHAR */}
                <div className="mt-2 w-full max-w-sm">
                    <button
                        type="button"
                        onClick={handleSharePage}
                        className="w-full bg-emerald-600 dark:bg-emerald-600 text-white py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-emerald-700 dark:hover:bg-emerald-500 shadow-sm transition-all transform hover:-translate-y-0.5"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 10.742a3 3 0 110 2.516m0-2.516a3 3 0 114.574-2.516m-4.574 2.516a3 3 0 104.574 2.516M15 8.25l.008-.008M15 15.75l.008-.008" />
                        </svg>
                        Salvar na Tela Inicial / Compartilhar
                    </button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto">
                {data.items.length === 0 ? (
                    <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-12">Nenhum registro público disponível.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {data.items.map((item) => {
                            const gallery = item.images || [];
                            const currentIdx = activeIndexes[item._id] || 0;

                            return (
                                <div key={item._id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between">
                                    <div>
                                        {gallery.length > 0 ? (
                                            <div className="w-full h-56 bg-gray-100 dark:bg-gray-800/80 flex items-center justify-center p-2 border-b border-gray-100 dark:border-gray-800 relative group">
                                                <img
                                                    src={gallery[currentIdx]}
                                                    className="max-w-full max-h-full object-contain rounded-lg cursor-pointer transition transform hover:scale-[1.02]"
                                                    alt={item.title}
                                                    onClick={() => setActiveViewer({ item, currentIdx })}
                                                />

                                                {gallery.length > 1 && (
                                                    <>
                                                        <button onClick={() => prevImage(item._id, gallery.length)} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm transition">&lt;</button>
                                                        <button onClick={() => nextImage(item._id, gallery.length)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm transition">&gt;</button>
                                                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white text-[10px] px-2 py-0.5 rounded-full font-mono">
                                                            {currentIdx + 1} / {gallery.length}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="w-full h-56 bg-gray-200 dark:bg-gray-800/60 flex items-center justify-center text-gray-400 dark:text-gray-500 text-xs border-b border-gray-100 dark:border-gray-800">
                                                Sem imagem disponível
                                            </div>
                                        )}

                                        <div className="p-5 flex-1">
                                            <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-snug mb-2">{item.title}</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{item.description}</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* MODAL / LIGHTBOX: Tela Inteira com desfoque de fundo e Carrossel */}
            {activeViewer && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in"
                    onClick={() => setActiveViewer(null)}
                >
                    {/* Botão de fechar (X) fixado no canto superior direito */}
                    <button
                        className="absolute top-4 right-4 bg-white/10 text-white rounded-full p-2 hover:bg-white/20 transition-all"
                        onClick={() => setActiveViewer(null)}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {/* Container da Imagem em proporção grande / tela cheia */}
                    <div className="relative w-full max-w-4xl max-h-[90vh] flex items-center justify-center">

                        {/* Botões do Carrossel em Tela Cheia */}
                        {(activeViewer.item.images?.length || 0) > 1 && (
                            <>
                                <button
                                    onClick={(e) => { e.stopPropagation(); prevViewerImage(activeViewer.item.images!.length); }}
                                    className="absolute left-4 z-50 bg-black/50 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg hover:bg-black/80 transition"
                                >
                                    &lt;
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); nextViewerImage(activeViewer.item.images!.length); }}
                                    className="absolute right-4 z-50 bg-black/50 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg hover:bg-black/80 transition"
                                >
                                    &gt;
                                </button>
                                {/* Contador de imagens em tela cheia */}
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1 rounded-full font-mono z-50">
                                    {activeViewer.currentIdx + 1} / {activeViewer.item.images!.length}
                                </div>
                            </>
                        )}

                        <img
                            src={activeViewer.item.images![activeViewer.currentIdx]}
                            alt="Visualização expandida"
                            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}