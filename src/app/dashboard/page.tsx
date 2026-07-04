'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Item {
    _id: string;
    title: string;
    description: string;
    images?: string[];
}

export default function Dashboard() {
    const [items, setItems] = useState<Item[]>([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [images, setImages] = useState<string[]>([]);
    const [fileCountText, setFileCountText] = useState('');
    const [shareLink, setShareLink] = useState('');
    const [copied, setCopied] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [processingMessage, setProcessingMessage] = useState<string | null>(null); // Mensagem flutuante

    // Guarda o índice da imagem activa de cada card de listagem individualmente
    const [activeImageIndexes, setActiveImageIndexes] = useState<{ [key: string]: number }>({});

    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const tenantId = localStorage.getItem('tenantId');
        if (!token || !tenantId) return router.push('/');

        setShareLink(`${window.location.origin}/share/${tenantId}`);
        fetchItems();
    }, []);

    const fetchItems = async () => {
        const res = await fetch('/api/items', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (res.ok) {
            const data = await res.json();
            setItems(data);
            const indexes: { [key: string]: number } = {};
            data.forEach((item: Item) => { indexes[item._id] = 0; });
            setActiveImageIndexes(indexes);
        }
    };

    const handleMultipleImagesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const loadedImages: string[] = [];

            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                const reader = new FileReader();
                const promise = new Promise<string>((resolve) => {
                    reader.onloadend = () => resolve(reader.result as string);
                });
                reader.readAsDataURL(file);
                loadedImages.push(await promise);
            }

            setImages((prevImages) => {
                const updatedImages = [...prevImages, ...loadedImages];
                setFileCountText(`${updatedImages.length} foto(s) na galeria`);
                return updatedImages;
            });
        }
    };

    const removeImageFromGallery = (indexToRemove: number) => {
        setImages((prevImages) => {
            const updatedImages = prevImages.filter((_, index) => index !== indexToRemove);
            setFileCountText(updatedImages.length > 0 ? `${updatedImages.length} foto(s) na galeria` : 'Nenhuma foto selecionada');
            return updatedImages;
        });
    };

    const moveImageOrder = (index: number, direction: 'left' | 'right') => {
        if (direction === 'left' && index === 0) return;
        if (direction === 'right' && index === images.length - 1) return;

        const targetIndex = direction === 'left' ? index - 1 : index + 1;
        const updatedImages = [...images];

        const temp = updatedImages[index];
        updatedImages[index] = updatedImages[targetIndex];
        updatedImages[targetIndex] = temp;

        setImages(updatedImages);
    };

    const handleSaveOrUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoading) return;

        setIsLoading(true);
        const isEditing = editingId !== null;
        setProcessingMessage(isEditing ? 'Atualizando registro, por favor aguarde...' : 'Salvando registro, por favor aguarde...');

        const endpoint = isEditing ? `/api/items/${editingId}` : '/api/items';
        const method = isEditing ? 'PUT' : 'POST';

        try {
            const res = await fetch(endpoint, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ title, description, images }),
            });

            if (res.ok) {
                resetForm();
                await fetchItems();
            }
        } catch (error) {
            console.error("Erro ao salvar registro:", error);
        } finally {
            setIsLoading(false);
            setProcessingMessage(null);
        }
    };

    const startEdit = (item: Item) => {
        setEditingId(item._id);
        setTitle(item.title);
        setDescription(item.description);
        setImages(item.images || []);
        setFileCountText(item.images && item.images.length > 0 ? `${item.images.length} foto(s) carregada(s)` : '');

        // Rolagem suave até o formulário para melhorar a UX
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const resetForm = () => {
        setEditingId(null);
        setTitle('');
        setDescription('');
        setImages([]);
        setFileCountText('');
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Deseja realmente excluir este registro?')) return;
        if (isLoading) return;

        setIsLoading(true);
        setProcessingMessage('Excluindo registro, por favor aguarde...');

        try {
            const res = await fetch(`/api/items/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            if (res.ok) {
                if (editingId === id) resetForm();
                await fetchItems();
            }
        } catch (error) {
            console.error("Erro ao excluir registro:", error);
        } finally {
            setIsLoading(false);
            setProcessingMessage(null);
        }
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(shareLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error(err);
        }
    };

    const changeCardImageIndex = (itemId: string, direction: 'prev' | 'next', max: number) => {
        const currentIndex = activeImageIndexes[itemId] || 0;
        let newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
        if (newIndex >= max) newIndex = 0;
        if (newIndex < 0) newIndex = max - 1;
        setActiveImageIndexes(prev => ({ ...prev, [itemId]: newIndex }));
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 text-gray-800 relative">

            {/* MENSAGEM FLUTUANTE (TOAST) */}
            {processingMessage && (
                <div className="fixed bottom-5 right-5 z-50 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-gray-700 animate-bounce">
                    <svg className="animate-spin h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-sm font-medium">{processingMessage}</span>
                </div>
            )}

            <header className="max-w-5xl mx-auto flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Painel de Controle</h1>
                <button onClick={() => { localStorage.clear(); router.push('/'); }} className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition">Sair</button>
            </header>

            <main className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Formulário Lateral Esquerdo */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 md:col-span-1 h-fit">
                    <h2 className="text-xl font-semibold mb-4 text-gray-900">{editingId ? 'Editar Registro' : 'Novo Registro'}</h2>
                    <form onSubmit={handleSaveOrUpdate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                            <input type="text" placeholder="Ex: Casa de Campo" value={title} onChange={e => setTitle(e.target.value)} required className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm focus:outline-none" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                            <textarea placeholder="Detalhes do registro..." value={description} onChange={e => setDescription(e.target.value)} required className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm focus:outline-none h-24" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Imagens do Registro</label>
                            <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition p-2 text-center">
                                <svg className="w-6 h-6 mb-1 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                <p className="text-xs text-gray-700 font-semibold">{fileCountText ? fileCountText : 'Adicionar fotos'}</p>
                                <input type="file" accept="image/*" multiple onChange={handleMultipleImagesChange} className="hidden" />
                            </label>
                        </div>

                        {!editingId && images.length > 0 && (
                            <div className="p-1">
                                <p className="text-[11px] font-semibold text-gray-500 mb-1.5">Organizar fotos antes de salvar:</p>
                                <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto p-1.5 bg-gray-50 border rounded-lg">
                                    {images.map((img, idx) => (
                                        <div key={idx} className="relative h-14 w-full border rounded bg-white group/formthumb">
                                            <img src={img} className="h-full w-full object-cover rounded" alt="form-thumb" />
                                            <button
                                                type="button"
                                                onClick={() => removeImageFromGallery(idx)}
                                                className="absolute -top-1 -right-1 bg-red-500 text-white w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shadow hover:bg-red-600 transition z-10"
                                            >
                                                ×
                                            </button>
                                            <div className="absolute inset-0 bg-black/40 items-center justify-center gap-1 rounded hidden group-hover/formthumb:flex transition">
                                                {idx > 0 && (
                                                    <button type="button" onClick={() => moveImageOrder(idx, 'left')} className="bg-white/95 text-gray-800 font-bold text-[9px] w-3.5 h-3.5 rounded hover:bg-white flex items-center justify-center">
                                                        &larr;
                                                    </button>
                                                )}
                                                {idx < images.length - 1 && (
                                                    <button type="button" onClick={() => moveImageOrder(idx, 'right')} className="bg-white/95 text-gray-800 font-bold text-[9px] w-3.5 h-3.5 rounded hover:bg-white flex items-center justify-center">
                                                        &rarr;
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col gap-2 pt-1">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full text-white p-2.5 rounded-lg font-medium transition shadow-sm ${isLoading ? 'bg-gray-400 cursor-not-allowed' : editingId ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'}`}
                            >
                                {isLoading ? 'Processando...' : editingId ? 'Salvar Alterações' : 'Salvar Registro'}
                            </button>
                            {editingId && <button type="button" disabled={isLoading} onClick={resetForm} className="w-full bg-gray-100 text-gray-600 p-2.5 rounded-lg font-medium hover:bg-gray-200 transition disabled:opacity-50">Cancelar Edição</button>}
                        </div>
                    </form>
                </div>

                {/* Listagem "Meus Registros" */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 md:col-span-2">
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                        <p className="font-semibold text-blue-900 text-sm mb-1.5 flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                            Link de Compartilhamento Público:
                        </p>

                        <div className="flex flex-col sm:flex-row gap-2">
                            <input type="text" readOnly value={shareLink} className="w-full sm:flex-1 p-2.5 bg-white border border-gray-300 rounded-lg text-xs select-all text-blue-600 font-mono focus:outline-none" />

                            <div className="flex gap-2 w-full sm:w-auto shrink-0">
                                <button type="button" onClick={copyToClipboard} className={`flex-1 sm:flex-none px-4 py-2.5 sm:py-0 rounded-lg font-medium text-xs transition border flex items-center justify-center gap-1 min-w-[90px] ${copied ? 'bg-green-50 text-green-700 border-green-200' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
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

                    <h2 className="text-xl font-semibold mb-4 text-gray-900">Meus Registros</h2>
                    {items.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-8">Nenhum registro cadastrado ainda.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {items.map(item => {
                                const isThisItemEditing = editingId === item._id;
                                const gallery = isThisItemEditing ? images : (item.images || []);
                                const currentImgIndex = activeImageIndexes[item._id] || 0;

                                return (
                                    <div key={item._id} className={`border rounded-xl overflow-hidden flex flex-col justify-between bg-white shadow-sm transition ${isThisItemEditing ? 'border-amber-400 ring-2 ring-amber-100' : 'border-gray-200 hover:shadow'}`}>
                                        <div>
                                            {/* Container da Imagem Principal */}
                                            {gallery.length > 0 ? (
                                                <div className="w-full h-44 bg-gray-50 flex items-center justify-center p-2 border-b border-gray-100 relative group">
                                                    <img src={gallery[currentImgIndex] || '/placeholder.png'} className="max-w-full max-h-full object-contain rounded-lg" alt={item.title} />

                                                    {/* SETAS ATUALIZADAS */}
                                                    {gallery.length > 1 && !isThisItemEditing && (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={() => changeCardImageIndex(item._id, 'prev', gallery.length)}
                                                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-md md:opacity-0 md:group-hover:opacity-100 transition duration-200 hover:bg-black/90 hover:scale-105"
                                                                style={{ textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}
                                                            >
                                                                &#10094;
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => changeCardImageIndex(item._id, 'next', gallery.length)}
                                                                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-md md:opacity-0 md:group-hover:opacity-100 transition duration-200 hover:bg-black/90 hover:scale-105"
                                                                style={{ textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}
                                                            >
                                                                &#10095;
                                                            </button>
                                                            <span className="absolute bottom-1 right-2 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded font-mono shadow-sm">
                                                                {currentImgIndex + 1}/{gallery.length}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="w-full h-44 bg-gray-100 flex items-center justify-center text-gray-400 text-xs border-b">Sem imagem</div>
                                            )}

                                            {/* Miniaturas com Ordenador e Botão Excluir */}
                                            {isThisItemEditing && gallery.length > 0 && (
                                                <div className="p-3 bg-amber-50/50 border-b border-amber-100">
                                                    <p className="text-[11px] font-semibold text-amber-800 mb-1.5">Organizar Galeria:</p>
                                                    <div className="grid grid-cols-4 gap-2 max-h-24 overflow-y-auto p-1 bg-white border border-amber-200 rounded-lg">
                                                        {gallery.map((img, idx) => (
                                                            <div key={idx} className="relative h-12 w-full border rounded bg-gray-50 group/thumb">
                                                                <img src={img} className="h-full w-full object-cover rounded" alt="thumb" />

                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeImageFromGallery(idx)}
                                                                    className="absolute -top-1 -right-1 bg-red-500 text-white w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shadow hover:bg-red-600 transition z-10"
                                                                >
                                                                    ×
                                                                </button>

                                                                <div className="absolute inset-0 bg-black/40 items-center justify-center gap-1.5 rounded hidden group-hover/thumb:flex transition">
                                                                    {idx > 0 && (
                                                                        <button type="button" onClick={() => moveImageOrder(idx, 'left')} className="bg-white/90 text-gray-800 font-bold text-[10px] w-4 h-4 rounded hover:bg-white flex items-center justify-center">
                                                                            &larr;
                                                                        </button>
                                                                    )}
                                                                    {idx < gallery.length - 1 && (
                                                                        <button type="button" onClick={() => moveImageOrder(idx, 'right')} className="bg-white/90 text-gray-800 font-bold text-[10px] w-4 h-4 rounded hover:bg-white flex items-center justify-center">
                                                                            &rarr;
                                                                        </button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="p-4">
                                                <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1">{item.title}</h3>
                                                <p className="text-sm text-gray-600 line-clamp-3">{item.description}</p>
                                            </div>
                                        </div>

                                        <div className="p-4 pt-0 grid grid-cols-2 gap-2">
                                            <button
                                                type="button"
                                                disabled={isLoading}
                                                onClick={() => startEdit(item)}
                                                className={`py-2 rounded-lg text-sm font-medium transition border ${isThisItemEditing ? 'bg-amber-500 text-white border-amber-500' : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200'} disabled:opacity-50 disabled:cursor-not-allowed`}
                                            >
                                                {isThisItemEditing ? 'Editando...' : 'Editar'}
                                            </button>
                                            <button
                                                type="button"
                                                disabled={isLoading}
                                                onClick={() => handleDelete(item._id)}
                                                className="bg-red-50 text-red-600 py-2 rounded-lg hover:bg-red-100 text-sm font-medium transition border border-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Excluir
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}