'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import imageCompression from 'browser-image-compression';

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
    const [processingMessage, setProcessingMessage] = useState<string | null>(null);

    // Estados para o Perfil do Tenant
    const [tenantName, setTenantName] = useState('');
    const [tenantEmail, setTenantEmail] = useState('');
    const [tenantPhone, setTenantPhone] = useState('');
    const [tenantCity, setTenantCity] = useState('');
    const [tenantBusinessCardLink, setTenantBusinessCardLink] = useState('');
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isSavingProfile, setIsSavingProfile] = useState(false);

    // Estado para gerenciar o item aberto no Modal de Visualização Expandida
    const [selectedVisualizingItem, setSelectedVisualizingItem] = useState<Item | null>(null);
    const [modalImageIndex, setModalImageIndex] = useState<number>(0);

    // Guarda o índice da imagem ativa de cada card de listagem individualmente
    const [activeImageIndexes, setActiveImageIndexes] = useState<{ [key: string]: number }>({});

    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('token');
        const tenantId = localStorage.getItem('tenantId');
        if (!token || !tenantId) return router.push('/');

        setShareLink(`${window.location.origin}/share/${tenantId}`);
        fetchItems();
        fetchProfile();
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

    // Busca os dados do perfil do tenant logado
    const fetchProfile = async () => {
        try {
            const res = await fetch('/api/tenant/profile', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            if (res.ok) {
                const data = await res.json();
                setTenantName(data.name || '');
                setTenantEmail(data.email || '');
                setTenantPhone(data.phone || '');
                setTenantCity(data.city || '');
                setTenantBusinessCardLink(data.businessCardLink || '');
            }
        } catch (error) {
            console.error("Erro ao buscar dados do perfil:", error);
        }
    };

    const handleMultipleImagesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            // Validação de Limite de 4 imagens
            const availableSlots = 4 - images.length;

            if (availableSlots <= 0) {
                alert("Você já atingiu o limite máximo de 4 imagens para este registro.");
                e.target.value = '';
                return;
            }

            const filesToProcess = Array.from(files).slice(0, availableSlots);

            if (files.length > availableSlots) {
                alert(`Atenção: Limite de 4 imagens por registro. Apenas as ${availableSlots} primeiras fotos selecionadas serão processadas.`);
            }

            setIsLoading(true);
            setProcessingMessage('Otimizando e comprimindo imagens...');
            const loadedImages: string[] = [];

            const options = {
                maxSizeMB: 0.4,
                maxWidthOrHeight: 1280,
                useWebWorker: true,
            };

            try {
                for (let i = 0; i < filesToProcess.length; i++) {
                    const file = filesToProcess[i];
                    const compressedFile = await imageCompression(file, options);

                    const MAX_FILE_SIZE = 1.5 * 1024 * 1024;
                    if (compressedFile.size > MAX_FILE_SIZE) {
                        alert(
                            `A imagem "${file.name}" mesmo após compressão ultrapassa o limite permitido do servidor!\n\n` +
                            `• Seu arquivo possui: ${(compressedFile.size / (1024 * 1024)).toFixed(2)} MB\n`
                        );
                        continue;
                    }

                    const reader = new FileReader();
                    const promise = new Promise<string>((resolve) => {
                        reader.onloadend = () => resolve(reader.result as string);
                    });
                    reader.readAsDataURL(compressedFile);
                    loadedImages.push(await promise);
                }

                if (loadedImages.length > 0) {
                    setImages((prevImages) => {
                        const updatedImages = [...prevImages, ...loadedImages];
                        setFileCountText(`${updatedImages.length} foto(s) na galeria`);
                        return updatedImages;
                    });
                }
            } catch (error) {
                console.error("Erro na compressão das imagens:", error);
                alert("Ocorreu um erro ao processar e comprimir uma ou mais imagens.");
            } finally {
                setIsLoading(false);
                setProcessingMessage(null);
                e.target.value = '';
            }
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

        const isEditing = editingId !== null;

        // Validação de Limite de 10 registros por Tenant (apenas se for um novo registro)
        if (!isEditing && items.length >= 10) {
            alert("Limite máximo atingido! Você só pode cadastrar até 10 registros.");
            return;
        }

        setIsLoading(true);
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
            } else if (res.status === 413) {
                alert(
                    "Erro: O tamanho total do registro (incluindo as fotos) ficou muito grande para o servidor.\n\n" +
                    "Por favor, remova algumas imagens da galeria ou reduza as fotos antes de tentar salvar novamente."
                );
            } else {
                const errData = await res.json().catch(() => ({}));
                alert(errData.message || "Ocorreu um erro ao tentar salvar o registro.");
            }
        } catch (error) {
            console.error("Erro ao salvar registro:", error);
        } finally {
            setIsLoading(false);
            setProcessingMessage(null);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSavingProfile) return;

        setIsSavingProfile(true);
        try {
            const res = await fetch('/api/tenant/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({
                    name: tenantName,
                    email: tenantEmail,
                    phone: tenantPhone,
                    city: tenantCity,
                    businessCardLink: tenantBusinessCardLink,
                }),
            });

            if (res.ok) {
                alert('Perfil atualizado com sucesso!');
                setIsProfileModalOpen(false);
                await fetchProfile(); // Recarrega os dados atualizados localmente
            } else {
                const errData = await res.json().catch(() => ({}));
                alert(errData.message || "Ocorreu um erro ao atualizar o perfil.");
            }
        } catch (error) {
            console.error("Erro ao salvar perfil:", error);
            alert("Não foi possível processar a atualização do perfil.");
        } finally {
            setIsSavingProfile(false);
        }
    };

    const startEdit = (item: Item) => {
        setEditingId(item._id);
        setTitle(item.title);
        setDescription(item.description);
        setImages(item.images || []);
        setFileCountText(item.images && item.images.length > 0 ? `${item.images.length} foto(s) carregada(s)` : '');
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

    // Abre o Modal com a foto inicial correspondente ao Card
    const openVisualizationModal = (item: Item) => {
        setSelectedVisualizingItem(item);
        setModalImageIndex(activeImageIndexes[item._id] || 0);
    };

    const changeModalImageIndex = (direction: 'prev' | 'next') => {
        if (!selectedVisualizingItem?.images) return;
        const max = selectedVisualizingItem.images.length;
        let newIndex = direction === 'next' ? modalImageIndex + 1 : modalImageIndex - 1;
        if (newIndex >= max) newIndex = 0;
        if (newIndex < 0) newIndex = max - 1;
        setModalImageIndex(newIndex);
    };

    // Variável para travar a interface se o limite for atingido num novo registro
    const isLimitReached = !editingId && items.length >= 10;

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

            {/* MODAL DE VISUALIZAÇÃO EM TELA CHEIA */}
            {selectedVisualizingItem && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all"
                    onClick={() => setSelectedVisualizingItem(null)}
                >
                    <div
                        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Botão Fechar */}
                        <button
                            onClick={() => setSelectedVisualizingItem(null)}
                            className="absolute top-4 right-4 bg-gray-900/80 text-white hover:bg-gray-900 w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold transition z-10 shadow"
                        >
                            &times;
                        </button>

                        {/* Área da Imagem */}
                        <div className="relative bg-gray-900 flex-1 min-h-[300px] md:h-[500px] flex items-center justify-center p-4 select-none">
                            {selectedVisualizingItem.images && selectedVisualizingItem.images.length > 0 ? (
                                <>
                                    <img
                                        src={selectedVisualizingItem.images[modalImageIndex]}
                                        className="max-w-full max-h-[70vh] object-contain rounded-lg"
                                        alt={selectedVisualizingItem.title}
                                    />

                                    {/* Setas de Navegação Interna do Modal */}
                                    {selectedVisualizingItem.images.length > 1 && (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => changeModalImageIndex('prev')}
                                                className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black text-white w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shadow-md transition"
                                            >
                                                &#10094;
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => changeModalImageIndex('next')}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black text-white w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shadow-md transition"
                                            >
                                                &#10095;
                                            </button>
                                            <span className="absolute bottom-4 right-4 bg-black/70 text-white text-xs px-2.5 py-1 rounded-md font-mono">
                                                {modalImageIndex + 1} / {selectedVisualizingItem.images.length}
                                            </span>
                                        </>
                                    )}
                                </>
                            ) : (
                                <div className="text-gray-400 text-sm">Sem imagens cadastradas</div>
                            )}
                        </div>

                        {/* Detalhes de Rodapé */}
                        <div className="p-6 bg-white border-t border-gray-100 overflow-y-auto max-h-[25vh]">
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedVisualizingItem.title}</h3>
                            <p className="text-gray-600 text-sm whitespace-pre-line leading-relaxed">{selectedVisualizingItem.description}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL DE EDIÇÃO DE PERFIL DO TENANT */}
            {isProfileModalOpen && (
                <div
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all"
                    onClick={() => setIsProfileModalOpen(false)}
                >
                    <div
                        className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setIsProfileModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold"
                        >
                            &times;
                        </button>

                        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            Editar Meu Perfil
                        </h2>

                        <p className="text-xs text-gray-500 mb-4">
                            Mantenha seus dados de contato e atuação profissional atualizados para os seus clientes.
                        </p>

                        <form onSubmit={handleUpdateProfile} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                                <input
                                    type="text"
                                    value={tenantName}
                                    onChange={(e) => setTenantName(e.target.value)}
                                    required
                                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm focus:outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                                    <input
                                        type="email"
                                        value={tenantEmail}
                                        onChange={(e) => setTenantEmail(e.target.value)}
                                        required
                                        className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefone / WhatsApp</label>
                                    <input
                                        type="text"
                                        value={tenantPhone}
                                        onChange={(e) => setTenantPhone(e.target.value)}
                                        required
                                        placeholder="(18) 99999-9999"
                                        className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Cidade de Atuação</label>
                                <input
                                    type="text"
                                    value={tenantCity}
                                    onChange={(e) => setTenantCity(e.target.value)}
                                    placeholder="Ex: Presidente Epitácio - SP"
                                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Link do Cartão de Visitas Virtual</label>
                                <input
                                    type="url"
                                    value={tenantBusinessCardLink}
                                    onChange={(e) => setTenantBusinessCardLink(e.target.value)}
                                    placeholder="https://linktr.ee/seunome"
                                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm focus:outline-none text-blue-600 font-mono"
                                />
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsProfileModalOpen(false)}
                                    className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSavingProfile}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition shadow-sm disabled:bg-gray-400"
                                >
                                    {isSavingProfile ? 'Salvando...' : 'Salvar Alterações'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <header className="max-w-5xl mx-auto flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Painel de Controle</h1>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsProfileModalOpen(true)}
                        className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition flex items-center gap-1.5 shadow-sm"
                    >
                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Meu Perfil
                    </button>
                    <button onClick={() => { localStorage.clear(); router.push('/'); }} className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition">Sair</button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Formulário Lateral Esquerdo */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 md:col-span-1 h-fit">
                    <h2 className="text-xl font-semibold text-gray-900">{editingId ? 'Editar Registro' : 'Novo Registro'}</h2>

                    {/* Alerta de Limite Atingido */}
                    {isLimitReached && (
                        <div className="mt-3 mb-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 font-medium">
                            ⚠️ Limite de 10 registros atingido. Exclua um item existente para cadastrar novos.
                        </div>
                    )}

                    <p className="text-[10px] text-green-600 mt-1 mb-2 font-medium leading-tight">
                        * Limitado a 10 registros com 04 imagens cada.
                    </p>
                    <form onSubmit={handleSaveOrUpdate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                            <input
                                type="text"
                                placeholder="Ex: Casa de Campo"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                required
                                disabled={isLimitReached}
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                            <textarea
                                placeholder="Detalhes do registro..."
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                required
                                disabled={isLimitReached}
                                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm focus:outline-none h-24 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Imagens do Registro</label>
                            <label className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg transition p-2 text-center ${images.length >= 4 || isLimitReached ? 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-70' : 'border-gray-300 bg-gray-50 hover:bg-gray-100 cursor-pointer'}`}>
                                <svg className="w-6 h-6 mb-1 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                <p className="text-xs text-gray-700 font-semibold">{fileCountText ? fileCountText : 'Adicionar fotos (Max 4)'}</p>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleMultipleImagesChange}
                                    className="hidden"
                                    disabled={images.length >= 4 || isLimitReached}
                                />
                            </label>
                            <p className="text-[10px] text-green-600 mt-1 font-medium leading-tight">
                                * Compressão automática active! Fotos de alta resolução serão reduzidas sem perda de fidelidade.
                            </p>
                        </div>

                        {/* GALERIA DE ORGANIZAÇÃO */}
                        {images.length > 0 && (
                            <div className="p-1">
                                <p className="text-[11px] font-semibold text-gray-500 mb-1.5 flex justify-between">
                                    <span>Organizar fotos antes de salvar:</span>
                                    <span className={images.length === 4 ? "text-red-500" : "text-blue-500"}>{images.length}/4</span>
                                </p>
                                <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto p-1.5 bg-gray-50 border rounded-lg">
                                    {images.map((img, idx) => (
                                        <div key={idx} className="relative h-14 w-full border rounded bg-white group/formthumb">
                                            <img src={img} className="h-full w-full object-cover rounded" alt="form-thumb" />
                                            <button
                                                type="button"
                                                onClick={() => removeImageFromGallery(idx)}
                                                className="absolute -top-1 -right-1 bg-red-500 text-white w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shadow hover:bg-red-600 transition z-10"
                                            >
                                                &times;
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
                                disabled={isLoading || isLimitReached}
                                className={`w-full text-white p-2.5 rounded-lg font-medium transition shadow-sm ${isLoading || isLimitReached ? 'bg-gray-400 cursor-not-allowed' : editingId ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'}`}
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
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 00-5.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
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

                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-900">Meus Registros</h2>
                        <span className={`text-xs font-bold px-2 py-1 rounded-md ${items.length >= 10 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                            {items.length} / 10
                        </span>
                    </div>

                    {items.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-8">Nenhum registro cadastrado ainda.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {items.map(item => {
                                const isThisItemEditing = editingId === item._id;
                                // A galeria mostrada no card é a original do item (não a do formulário)
                                const gallery = item.images || [];
                                const currentImgIndex = activeImageIndexes[item._id] || 0;

                                return (
                                    <div
                                        key={item._id}
                                        className={`border rounded-xl overflow-hidden flex flex-col justify-between bg-white shadow-sm transition group/card ${isThisItemEditing ? 'border-amber-400 ring-2 ring-amber-100' : 'border-gray-200 hover:shadow-md'}`}
                                    >
                                        <div>
                                            {/* Container da Imagem Principal (Clique abre o modal) */}
                                            {gallery.length > 0 ? (
                                                <div
                                                    onClick={() => openVisualizationModal(item)}
                                                    className="w-full h-44 bg-gray-50 flex items-center justify-center p-2 border-b border-gray-100 relative group cursor-zoom-in"
                                                >
                                                    <img src={gallery[currentImgIndex] || '/placeholder.png'} className="max-w-full max-h-full object-contain rounded-lg transition-transform duration-200 group-hover:scale-[1.02]" alt={item.title} />

                                                    {/* Setas de Troca Rápida de Fotos no Card */}
                                                    {gallery.length > 1 && !isThisItemEditing && (
                                                        <>
                                                            <button
                                                                type="button"
                                                                onClick={(e) => { e.stopPropagation(); changeCardImageIndex(item._id, 'prev', gallery.length); }}
                                                                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-md md:opacity-0 md:group-hover:opacity-100 transition duration-200 hover:bg-black/90 hover:scale-105"
                                                                style={{ textShadow: '0 1px 2px rgba(0,0,0,0.6)' }}
                                                            >
                                                                &#10094;
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={(e) => { e.stopPropagation(); changeCardImageIndex(item._id, 'next', gallery.length); }}
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

                                            {/* Conteúdo Informativo (Clique abre o modal) */}
                                            <div
                                                onClick={() => openVisualizationModal(item)}
                                                className="p-4 cursor-zoom-in group-hover/card:bg-gray-50/50 transition-colors"
                                            >
                                                <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1 group-hover/card:text-blue-600 transition-colors flex items-center gap-1.5">
                                                    {item.title}
                                                </h3>
                                                <p className="text-sm text-gray-600 line-clamp-3">{item.description}</p>
                                            </div>
                                        </div>

                                        {/* Ações */}
                                        <div className="p-4 pt-0 grid grid-cols-2 gap-2">
                                            <button
                                                type="button"
                                                onClick={() => startEdit(item)}
                                                disabled={isLoading || isThisItemEditing}
                                                className={`py-2 px-3 rounded-lg text-sm font-semibold transition disabled:opacity-50 flex items-center justify-center gap-1 ${isThisItemEditing ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-700 hover:bg-amber-100'}`}
                                            >
                                                {isThisItemEditing ? 'Editando...' : 'Editar'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleDelete(item._id)}
                                                disabled={isLoading || isThisItemEditing}
                                                className="py-2 px-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition border border-red-200 disabled:opacity-50 flex items-center justify-center gap-1 disabled:cursor-not-allowed"
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