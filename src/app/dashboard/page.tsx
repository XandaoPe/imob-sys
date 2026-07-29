'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Item } from './types';

// Importações dos subcomponentes modulares
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

    // Estados necessários pelo ItemForm
    const [expiresAt, setExpiresAt] = useState('');
    const [isActive, setIsActive] = useState(true);

    const [fileCountText, setFileCountText] = useState('');
    const [shareLink, setShareLink] = useState('');
    const [copied, setCopied] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [processingMessage, setProcessingMessage] = useState<string | null>(null);

    // Limites dinâmicos configurados do corretor
    const [maxItems, setMaxItems] = useState<number>(10);
    const [maxImagesPerItem, setMaxImagesPerItem] = useState<number>(4);

    // Estado da Validade/Expiração da conta/plano
    const [tenantExpirationDate, setTenantExpirationDate] = useState<string | null>(null);

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

                // Mapeia o campo correto retornado da API do tenant
                const expirationField = data.subscriptionExpiresAt || data.expirationDate || data.validity;
                if (expirationField) {
                    setTenantExpirationDate(expirationField);
                }

                // Grava os limites vindos do banco de dados do cliente
                if (data.maxItems !== undefined) setMaxItems(data.maxItems);
                if (data.maxImagesPerItem !== undefined) setMaxImagesPerItem(data.maxImagesPerItem);
            }
        } catch (error) {
            console.error('Erro ao buscar dados do perfil:', error);
        }
    };

    // ✅ CORREÇÃO: Converte qualquer string de data sem perder 1 dia pelo fuso horário (UTC vs GMT-3)
    const parseDateSafely = (dateStr: string | null): Date | null => {
        if (!dateStr) return null;

        // Trata formato ISO/YYYY-MM-DD (ex: "2026-07-30" ou "2026-07-30T00:00:00.000Z")
        if (typeof dateStr === 'string' && dateStr.includes('-')) {
            const cleanStr = dateStr.split('T')[0];
            const parts = cleanStr.split('-');
            if (parts.length === 3) {
                const year = Number(parts[0]);
                const month = Number(parts[1]) - 1; // Mês no JS é 0-indexed
                const day = Number(parts[2]);
                return new Date(year, month, day);
            }
        }

        // Trata formato DD/MM/YYYY
        if (typeof dateStr === 'string' && dateStr.includes('/')) {
            const parts = dateStr.split('/');
            if (parts.length === 3) {
                return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
            }
        }

        const parsed = new Date(dateStr);
        return isNaN(parsed.getTime()) ? null : parsed;
    };

    // ✅ CORREÇÃO: Lógica ajustada para calcular o Período de Carência (10 dias) sem conflitos
    const getGracePeriodInfo = () => {
        if (!tenantExpirationDate) return { isInGracePeriod: false, daysRemaining: 0, isFullyExpired: false };

        const expDate = parseDateSafely(tenantExpirationDate);
        if (!expDate) return { isInGracePeriod: false, daysRemaining: 0, isFullyExpired: false };

        // Normaliza para comparar apenas a data, sem considerar hora
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const exp = new Date(expDate);
        exp.setHours(0, 0, 0, 0);

        // Se a data de hoje for menor ou igual à data de vencimento, o plano está em dia
        if (today <= exp) {
            return { isInGracePeriod: false, daysRemaining: 0, isFullyExpired: false };
        }

        // Calcula a diferença de dias após o vencimento
        const diffTime = today.getTime() - exp.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        // Venceu e está dentro dos 10 dias de carência
        if (diffDays > 0 && diffDays <= 10) {
            return {
                isInGracePeriod: true,
                daysRemaining: 10 - diffDays + 1,
                isFullyExpired: false
            };
        }

        // Passaram-se mais de 10 dias de carência (bloqueio total)
        if (diffDays > 10) {
            return {
                isInGracePeriod: false,
                daysRemaining: 0,
                isFullyExpired: true
            };
        }

        return { isInGracePeriod: false, daysRemaining: 0, isFullyExpired: false };
    };

    const graceInfo = getGracePeriodInfo();
    const isPlanExpired = graceInfo.isFullyExpired;

    const handleSaveOrUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isLoading) return;

        if (isPlanExpired) {
            alert('Sua assinatura / acesso está expirado. Por favor, entre em contato para renovar seu plano.');
            return;
        }

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
                body: JSON.stringify({
                    title,
                    description,
                    images,
                    expiresAt,
                    isActive
                }),
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

    const formatDateForInput = (dateVal?: string | Date) => {
        if (!dateVal) return '';
        const str = String(dateVal);

        if (str.includes('T')) return str.split('T')[0];

        if (str.includes('/')) {
            const parts = str.split('/');
            if (parts.length === 3) {
                return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
            }
        }

        return str.substring(0, 10);
    };

    const startEdit = (item: Item) => {
        setEditingId(item._id);
        setTitle(item.title);
        setDescription(item.description);
        setImages(item.images || []);

        setExpiresAt(formatDateForInput(item.expiresAt));

        setIsActive(item.isActive !== undefined ? item.isActive : true);
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
        setExpiresAt('');
        setIsActive(true);
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

    const isLimitReached = !editingId && items.length >= maxItems;
    const cleanPhone = tenantPhone.replace(/\D/g, '');
    const isMasterAdmin = ['18997901236', '18997261236', '5518997901236', '5518997261236'].includes(cleanPhone);

    // ✅ CORREÇÃO: Formatação exata da data de vencimento sem alteração por fuso horário
    const formattedExpirationDate = tenantExpirationDate
        ? (() => {
            const d = parseDateSafely(tenantExpirationDate);
            if (!d) return tenantExpirationDate;
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            return `${day}/${month}/${year}`;
        })()
        : null;

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
                tenantName={tenantName}
                tenantCity={tenantCity}
                onOpenProfile={() => setIsProfileModalOpen(true)}
            />

            {/* AVISO FIXO: APENAS DURANTE O PERÍODO DE CARÊNCIA DOS 10 DIAS APÓS O VENCIMENTO */}
            {graceInfo.isInGracePeriod && (
                <div className="max-w-5xl mx-auto mb-6 p-4 rounded-xl border bg-amber-50 border-amber-300 text-amber-900 dark:bg-amber-950/60 dark:border-amber-700 dark:text-amber-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">⚠️</span>
                        <div>
                            <p className="font-bold text-base">Atenção: Seu plano está no período de carência!</p>
                            <p className="text-sm text-amber-800 dark:text-amber-300">
                                Seu plano venceu em <span className="font-semibold">{formattedExpirationDate}</span>. Restam <strong className="underline decoration-amber-500 font-extrabold">{graceInfo.daysRemaining} {graceInfo.daysRemaining === 1 ? 'dia' : 'dias'}</strong> de carência antes do bloqueio total dos recursos.
                            </p>
                        </div>
                    </div>
                    <a
                        href="https://wa.me/5518997261236?text=Ol%C3%A1%2C%20gostaria%20de%20renovar%20meu%20plano"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto text-center px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg text-sm shadow transition-colors flex items-center justify-center gap-2 shrink-0"
                    >
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                        </svg>
                        Renovar Assinatura (18) 99726-1236
                    </a>
                </div>
            )}

            {/* AVISO DE CONTA COMPLETAMENTE EXPIRADA (APÓS 10 DIAS) */}
            {isPlanExpired && (
                <div className="max-w-5xl mx-auto mb-6 p-4 rounded-xl border bg-red-50 border-red-300 text-red-900 dark:bg-red-950/60 dark:border-red-700 dark:text-red-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">🚫</span>
                        <div>
                            <p className="font-bold text-base">Acesso Bloqueado: Período de Carência Encerrado!</p>
                            <p className="text-sm text-red-800 dark:text-red-300">
                                Seu plano venceu em <span className="font-semibold">{formattedExpirationDate}</span> e o prazo de 10 dias de carência expirou. Novas edições e criações estão bloqueadas.
                            </p>
                        </div>
                    </div>
                    <a
                        href="https://wa.me/5518997261236?text=Ol%C3%A1%2C%20meu%20plano%20expirou%20e%20gostaria%20de%20renovar"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full sm:w-auto text-center px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg text-sm shadow transition-colors flex items-center justify-center gap-2 shrink-0"
                    >
                        Entrar em Contato (18) 99726-1236
                    </a>
                </div>
            )}

            <main className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">

                {/* 5. FORMULÁRIO LATERAL DE CRIAÇÃO/EDIÇÃO */}
                <ItemForm
                    editingId={editingId}
                    isLimitReached={isLimitReached || isPlanExpired}
                    maxItems={maxItems}
                    maxImagesPerItem={maxImagesPerItem}
                    title={title}
                    setTitle={setTitle}
                    description={description}
                    setDescription={setDescription}
                    expiresAt={expiresAt}
                    setExpiresAt={setExpiresAt}
                    isActive={isActive}
                    setIsActive={setIsActive}
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