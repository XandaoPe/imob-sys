'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Item } from './types';

// Importações dos novos subcomponentes modulares
import Toast from './components/Toast';
import FullImageModal from './components/FullImageModal';
import ProfileModal from './components/ProfileModal';
import DashboardHeader from './components/DashboardHeader';
import ShareLinkBox from './components/ShareLinkBox';
import ItemForm from './components/ItemForm';
import ItemCard from './components/ItemCard';

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

    // Limites dinâmicos configurados do corretor
    const [maxItems, setMaxItems] = useState<number>(10);
    const [maxImagesPerItem, setMaxImagesPerItem] = useState<number>(4);

    // Estados do Perfil
    const [tenantName, setTenantName] = useState('');
    const [tenantEmail, setTenantEmail] = useState('');
    const [tenantPhone, setTenantPhone] = useState('');
    const [tenantCity, setTenantCity] = useState('');
    const [tenantWebsiteLink, setTenantWebsiteLink] = useState('');
    const [tenantBusinessCardLink, setTenantBusinessCardLink] = useState('');
    const [tenantPassword, setTenantPassword] = useState('');
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isSavingProfile, setIsSavingProfile] = useState(false);

    // Estado para gerenciar modal de visualização expandida
    const [selectedVisualizingItem, setSelectedVisualizingItem] = useState<Item | null>(null);
    const [modalImageIndex, setModalImageIndex] = useState<number>(0);

    // Guarda índice das fotos ativas em cada card
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
            data.forEach((item: Item) => {
                indexes[item._id] = 0;
            });
            setActiveImageIndexes(indexes);
        }
    };

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
                setTenantWebsiteLink(data.websiteLink || '');
                setTenantBusinessCardLink(data.businessCardLink || '');

                // Grava os limites vindos do banco de dados do cliente
                if (data.maxItems !== undefined) setMaxItems(data.maxItems);
                if (data.maxImagesPerItem !== undefined) setMaxImagesPerItem(data.maxImagesPerItem);
            }
        } catch (error) {
            console.error('Erro ao buscar dados do perfil:', error);
        }
    };

    const handleSaveOrUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoading) return;

        const isEditing = editingId !== null;

        if (!isEditing && items.length >= maxItems) {
            alert(`Limite máximo atingido! Seu plano permite cadastrar até ${maxItems} registros.`);
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
                    'Erro: O tamanho total do registro (incluindo as fotos) ficou muito grande para o servidor.\n\n' +
                    'Por favor, remova algumas imagens da galeria ou reduza as fotos antes de tentar salvar novamente.'
                );
            } else {
                const errData = await res.json().catch(() => ({}));
                alert(errData.error || errData.message || 'Ocorreu um erro ao tentar salvar o registro.');
            }
        } catch (error) {
            console.error('Erro ao salvar registro:', error);
        } finally {
            setIsLoading(false);
            setProcessingMessage(null);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSavingProfile) return;

        setIsSavingProfile(true);

        let formattedPhone = tenantPhone;
        const digits = tenantPhone.replace(/\D/g, '');
        if (digits === '18997901236' || digits === '18997261236') {
            formattedPhone = '55' + digits;
        } else if (digits === '5518997901236' || digits === '5518997261236') {
            formattedPhone = digits;
        }

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
                    phone: formattedPhone,
                    city: tenantCity,
                    websiteLink: tenantWebsiteLink,
                    businessCardLink: tenantBusinessCardLink,
                    password: tenantPassword,
                }),
            });

            if (res.ok) {
                alert('Perfil atualizado com sucesso!');
                setTenantPassword('');
                setIsProfileModalOpen(false);
                await fetchProfile();
            } else {
                const errData = await res.json().catch(() => ({}));
                alert(errData.message || 'Ocorreu um erro ao atualizar o perfil.');
            }
        } catch (error) {
            console.error('Erro ao salvar perfil:', error);
            alert('Não foi possível processar a atualização do perfil.');
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

        setTimeout(() => {
            const formElement = document.getElementById('item-form-container');
            if (formElement) {
                formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        }, 50);
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
            console.error('Erro ao excluir registro:', error);
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
        setActiveImageIndexes((prev) => ({ ...prev, [itemId]: newIndex }));
    };

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

    // Verificação dinâmica baseada no limite individual do cliente
    const isLimitReached = !editingId && items.length >= maxItems;
    const cleanPhone = tenantPhone.replace(/\D/g, '');
    const isMasterAdmin = ['18997901236', '18997261236', '5518997901236', '5518997261236'].includes(cleanPhone);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 text-gray-800 dark:text-gray-100 relative transition-colors duration-200">

            {/* 1. TOAST NOTIFICATION */}
            <Toast message={processingMessage} />

            {/* 2. MODAL DE EXPANSÃO DE IMAGENS */}
            <FullImageModal
                item={selectedVisualizingItem}
                onClose={() => setSelectedVisualizingItem(null)}
                modalImageIndex={modalImageIndex}
                onChangeImageIndex={changeModalImageIndex}
            />

            {/* 3. MODAL DE EDIÇÃO DO PERFIL */}
            <ProfileModal
                isOpen={isProfileModalOpen}
                onClose={() => {
                    setIsProfileModalOpen(false);
                    setTenantPassword('');
                }}
                tenantName={tenantName}
                setTenantName={setTenantName}
                tenantEmail={tenantEmail}
                setTenantEmail={setTenantEmail}
                tenantPhone={tenantPhone}
                setTenantPhone={setTenantPhone}
                tenantCity={tenantCity}
                setTenantCity={setTenantCity}
                tenantWebsiteLink={tenantWebsiteLink}
                setTenantWebsiteLink={setTenantWebsiteLink}
                tenantBusinessCardLink={tenantBusinessCardLink}
                setTenantBusinessCardLink={setTenantBusinessCardLink}
                tenantPassword={tenantPassword}
                setTenantPassword={setTenantPassword}
                onUpdateProfile={handleUpdateProfile}
                isSavingProfile={isSavingProfile}
            />

            {/* 4. CABEÇALHO */}
            <DashboardHeader
                isMasterAdmin={isMasterAdmin}
                onOpenProfile={() => setIsProfileModalOpen(true)}
            />

            <main className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* 5. FORMULÁRIO LATERAL DE CRIAÇÃO/EDIÇÃO */}
                <ItemForm
                    editingId={editingId}
                    isLimitReached={isLimitReached}
                    maxItems={maxItems}
                    maxImagesPerItem={maxImagesPerItem}
                    title={title}
                    setTitle={setTitle}
                    description={description}
                    setDescription={setDescription}
                    images={images}
                    setImages={setImages}
                    fileCountText={fileCountText}
                    setFileCountText={setFileCountText}
                    isLoading={isLoading}
                    setIsLoading={setIsLoading}
                    setProcessingMessage={setProcessingMessage}
                    onSaveOrUpdate={handleSaveOrUpdate}
                    onResetForm={resetForm}
                />

                {/* CONTAINER DA LISTAGEM DIREITA */}
                <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 md:col-span-2 transition-colors duration-200">

                    {/* 6. COMPARTILHAMENTO DE LINKS */}
                    <ShareLinkBox
                        shareLink={shareLink}
                        copied={copied}
                        onCopy={copyToClipboard}
                    />

                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Meus Registros</h2>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-md transition-colors ${items.length >= maxItems ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400'}`}>
                            {items.length} / {maxItems}
                        </span>
                    </div>

                    {items.length === 0 ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">Nenhum registro cadastrado ainda.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {items.map((item) => (
                                /* 7. CARD INDIVIDUAL DO ITEM */
                                <ItemCard
                                    key={item._id}
                                    item={item}
                                    editingId={editingId}
                                    isLoading={isLoading}
                                    activeImageIndex={activeImageIndexes[item._id] || 0}
                                    onChangeCardImageIndex={changeCardImageIndex}
                                    onOpenVisualization={openVisualizationModal}
                                    onStartEdit={startEdit}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}