'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PixModal from './components/PixModal';
import EditTenantModal from './components/EditTenantModal';
import EditItemModal from './components/EditItemModal';
import ItemsTable from './components/ItemsTable';
import TenantsTable from './components/TenantsTable';

interface Corretor {
    _id: string;
    name: string;
    email: string;
    phone: string;
    city?: string;
    createdAt: string;
    maxItems?: number;
    maxImagesPerItem?: number;
    subscriptionExpiresAt?: string;
    isAnuidadePaid?: boolean;
}

interface Registro {
    _id: string;
    title: string;
    description: string;
    images?: string[];
    tenantId: string;
    createdAt: string;
    corretor: {
        name: string;
        email: string;
        phone: string;
    };
}

export default function AdminMasterDashboard() {
    const [tenants, setTenants] = useState<Corretor[]>([]);
    const [items, setItems] = useState<Registro[]>([]);
    const [activeTab, setActiveTab] = useState<'items' | 'tenants'>('items');

    const [editingItem, setEditingItem] = useState<Registro | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');

    const [editingTenantLimits, setEditingTenantLimits] = useState<Corretor | null>(null);
    const [limitMaxItems, setLimitMaxItems] = useState<number>(10);
    const [limitMaxImages, setLimitMaxImages] = useState<number>(4);
    const [limitSubscriptionExpiresAt, setLimitSubscriptionExpiresAt] = useState<string>('');

    const [editTenantName, setEditTenantName] = useState('');
    const [editTenantEmail, setEditTenantEmail] = useState('');
    const [editTenantPhone, setEditTenantPhone] = useState('');
    const [editTenantCity, setEditTenantCity] = useState('');
    const [editTenantPassword, setEditTenantPassword] = useState('');

    const [pixModalTenant, setPixModalTenant] = useState<Corretor | null>(null);
    const [pixAmount, setPixAmount] = useState('119.90');
    const [pixPaymentDate, setPixPaymentDate] = useState('');

    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        verificarAcessoEPuxarDados();
    }, []);

    const verificarAcessoEPuxarDados = async () => {
        setLoading(true);
        setErrorMsg(null);
        const token = localStorage.getItem('token');

        if (!token) {
            router.push('/');
            return;
        }

        try {
            const resItems = await fetch('/api/admin/items', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!resItems.ok) {
                const errData = await resItems.json();
                throw new Error(errData.message || 'Acesso negado.');
            }

            const dataItems = await resItems.json();
            setItems(dataItems);

            const resTenants = await fetch('/api/admin/tenants', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const dataTenants = await resTenants.json();
            setTenants(dataTenants);

        } catch (err: any) {
            setErrorMsg(err.message || 'Você não tem permissão para visualizar esta página.');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveTenant = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingTenantLimits) return;

        try {
            const payload: any = {
                name: editTenantName,
                email: editTenantEmail,
                phone: editTenantPhone,
                city: editTenantCity,
                maxItems: limitMaxItems,
                maxImagesPerItem: limitMaxImages,
                subscriptionExpiresAt: limitSubscriptionExpiresAt,
            };

            if (editTenantPassword.trim() !== '') {
                payload.password = editTenantPassword;
            }

            const res = await fetch(`/api/admin/tenants?id=${editingTenantLimits._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert('Cadastro, senha e limites atualizados com sucesso!');
                setEditingTenantLimits(null);
                setEditTenantPassword('');
                verificarAcessoEPuxarDados();
            } else {
                const errData = await res.json();
                alert(errData.message || 'Erro ao atualizar dados do cliente.');
            }
        } catch (error) {
            alert('Falha ao conectar ao servidor para alterar dados do cliente.');
        }
    };

    const handleConfirmPixBaixa = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!pixModalTenant) return;

        try {
            const res = await fetch(`/api/admin/tenants?id=${pixModalTenant._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    action: 'pix_baixa',
                    paymentDate: pixPaymentDate
                })
            });

            if (res.ok) {
                alert('Baixa de Pix realizada com sucesso! Vencimento estendido por mais 1 ano.');
                setPixModalTenant(null);
                verificarAcessoEPuxarDados();
            } else {
                const errData = await res.json();
                alert(errData.message || 'Erro ao processar baixa do Pix.');
            }
        } catch (error) {
            alert('Falha ao conectar ao servidor para efetuar baixa do Pix.');
        }
    };

    const handleDeleteItem = async (id: string) => {
        if (!confirm('Tem certeza de que deseja excluir permanentemente este registro do sistema?')) return;

        try {
            const res = await fetch(`/api/admin/items?id=${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) {
                alert('Registro removido com sucesso!');
                verificarAcessoEPuxarDados();
            }
        } catch (error) {
            alert('Falha ao deletar item.');
        }
    };

    const handleDeleteTenant = async (id: string) => {
        if (!confirm('ATENÇÃO CRÍTICA:\n\nExcluir este cliente removerá sua conta e TODOS os registros cadastrados por ele automaticamente. Deseja prosseguir?')) return;

        try {
            const res = await fetch(`/api/admin/tenants?id=${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) {
                alert('Cliente e banco de dados dependente eliminados!');
                verificarAcessoEPuxarDados();
            }
        } catch (error) {
            alert('Falha ao deletar cliente.');
        }
    };

    const handleSaveEditItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingItem) return;

        try {
            const res = await fetch(`/api/admin/items?id=${editingItem._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    title: editTitle,
                    description: editDescription,
                    images: editingItem.images
                })
            });

            if (res.ok) {
                alert('Registro alterado com maestria!');
                setEditingItem(null);
                verificarAcessoEPuxarDados();
            }
        } catch (error) {
            alert('Erro ao modificar registro.');
        }
    };

    const getExpirationDetails = (tenant: Corretor) => {
        const expStr = tenant.subscriptionExpiresAt
            ? tenant.subscriptionExpiresAt.split('T')[0]
            : new Date(new Date(tenant.createdAt).setFullYear(new Date(tenant.createdAt).getFullYear() + 1)).toISOString().split('T')[0];

        const [y, m, d] = expStr.split('-').map(Number);
        const expiresDate = new Date(y, m - 1, d);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const isExpired = today > expiresDate;
        const formattedDate = `${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${y}`;

        return { formattedDate, isExpired, expStr };
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-6">
                <div className="animate-spin h-10 w-10 border-4 border-t-blue-500 border-gray-700 rounded-full mb-4"></div>
                <p className="text-sm font-mono tracking-widest text-gray-400">Autenticando credenciais do Dono do Sistema...</p>
            </div>
        );
    }

    if (errorMsg) {
        return (
            <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-6 text-center">
                <div className="bg-red-950/50 border border-red-800 p-8 rounded-2xl max-w-md shadow-2xl">
                    <span className="text-5xl block mb-4">⛔</span>
                    <h1 className="text-2xl font-bold text-red-400 mb-2">Acesso Restrito</h1>
                    <p className="text-sm text-gray-400 mb-6 font-mono bg-black/40 p-3 rounded-lg border border-gray-800">
                        {errorMsg}
                    </p>
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="bg-gray-800 hover:bg-gray-700 text-white font-medium px-5 py-2 rounded-lg text-sm transition"
                    >
                        Voltar ao Meu Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 p-6 font-sans">
            {pixModalTenant && (
                <PixModal
                    tenant={pixModalTenant}
                    pixAmount={pixAmount}
                    setPixAmount={setPixAmount}
                    pixPaymentDate={pixPaymentDate}
                    setPixPaymentDate={setPixPaymentDate}
                    onClose={() => setPixModalTenant(null)}
                    onSubmit={handleConfirmPixBaixa}
                />
            )}

            {editingTenantLimits && (
                <EditTenantModal
                    tenantId={editingTenantLimits._id}
                    editTenantName={editTenantName}
                    setEditTenantName={setEditTenantName}
                    editTenantEmail={editTenantEmail}
                    setEditTenantEmail={setEditTenantEmail}
                    editTenantPhone={editTenantPhone}
                    setEditTenantPhone={setEditTenantPhone}
                    editTenantCity={editTenantCity}
                    setEditTenantCity={setEditTenantCity}
                    editTenantPassword={editTenantPassword}
                    setEditTenantPassword={setEditTenantPassword}
                    limitMaxItems={limitMaxItems}
                    setLimitMaxItems={setLimitMaxItems}
                    limitMaxImages={limitMaxImages}
                    setLimitMaxImages={setLimitMaxImages}
                    limitSubscriptionExpiresAt={limitSubscriptionExpiresAt}
                    setLimitSubscriptionExpiresAt={setLimitSubscriptionExpiresAt}
                    onClose={() => setEditingTenantLimits(null)}
                    onSubmit={handleSaveTenant}
                />
            )}

            {editingItem && (
                <EditItemModal
                    corretorName={editingItem.corretor.name}
                    corretorEmail={editingItem.corretor.email}
                    editTitle={editTitle}
                    setEditTitle={setEditTitle}
                    editDescription={editDescription}
                    setEditDescription={setEditDescription}
                    onClose={() => setEditingItem(null)}
                    onSubmit={handleSaveEditItem}
                />
            )}

            <header className="max-w-7xl mx-auto border-b border-gray-800 pb-6 mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="bg-red-500 text-white text-[10px] uppercase font-mono px-2 py-0.5 rounded-md font-bold tracking-widest animate-pulse">
                            Root / Superuser Mode
                        </span>
                    </div>
                    <h1 className="text-3xl font-black tracking-tight text-white">Central do Proprietário</h1>
                </div>

                <button
                    onClick={() => router.push('/dashboard')}
                    className="bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 font-medium text-sm px-4 py-2 rounded-lg transition"
                >
                    Voltar ao Painel Comum
                </button>
            </header>

            <section className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-gray-800/40 border border-gray-800 p-5 rounded-xl">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total de Clientes</p>
                    <p className="text-3xl font-black text-blue-400 mt-1">{tenants.length}</p>
                </div>
                <div className="bg-gray-800/40 border border-gray-800 p-5 rounded-xl">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total de Registros no Banco</p>
                    <p className="text-3xl font-black text-green-400 mt-1">{items.length}</p>
                </div>
                <div className="bg-gray-800/40 border border-gray-800 p-5 rounded-xl sm:col-span-2 md:col-span-1">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Status do Servidor</p>
                    <p className="text-sm font-mono text-emerald-400 mt-2 flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block animate-ping"></span>
                        Operando em Segurança Completa
                    </p>
                </div>
            </section>

            <section className="max-w-7xl mx-auto mb-6">
                <div className="flex border-b border-gray-800 gap-2">
                    <button
                        onClick={() => setActiveTab('items')}
                        className={`px-5 py-3 text-sm font-bold border-b-2 transition ${activeTab === 'items' ? 'border-blue-500 text-blue-400 bg-gray-800/30' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
                    >
                        Todos os Registros Cadastrados ({items.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('tenants')}
                        className={`px-5 py-3 text-sm font-bold border-b-2 transition ${activeTab === 'tenants' ? 'border-blue-500 text-blue-400 bg-gray-800/30' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
                    >
                        Lista de Clientes ({tenants.length})
                    </button>
                </div>
            </section>

            <main className="max-w-7xl mx-auto bg-gray-800 border border-gray-700/60 rounded-xl overflow-hidden shadow-xl">
                {activeTab === 'items' ? (
                    <ItemsTable
                        items={items}
                        onEdit={(item) => {
                            setEditingItem(item);
                            setEditTitle(item.title);
                            setEditDescription(item.description);
                        }}
                        onDelete={handleDeleteItem}
                    />
                ) : (
                    <TenantsTable
                        tenants={tenants}
                        getExpirationDetails={getExpirationDetails}
                        onOpenPixModal={(t) => {
                            setPixModalTenant(t);
                            setPixPaymentDate(new Date().toISOString().split('T')[0]);
                            setPixAmount('119.90');
                        }}
                        onOpenEditModal={(t, expStr) => {
                            setEditingTenantLimits(t);
                            setEditTenantName(t.name || '');
                            setEditTenantEmail(t.email || '');
                            setEditTenantPhone(t.phone || '');
                            setEditTenantCity(t.city || '');
                            setEditTenantPassword('');
                            setLimitMaxItems(t.maxItems ?? 10);
                            setLimitMaxImages(t.maxImagesPerItem ?? 4);
                            setLimitSubscriptionExpiresAt(expStr);
                        }}
                        onDeleteTenant={handleDeleteTenant}
                    />
                )}
            </main>
        </div>
    );
}