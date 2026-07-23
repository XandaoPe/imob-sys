'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Corretor {
    _id: string;
    name: string;
    email: string;
    phone: string;
    city?: string;
    createdAt: string;
    maxItems?: number;
    maxImagesPerItem?: number;
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

    // Estados para edição rápida de registros pelo Admin
    const [editingItem, setEditingItem] = useState<Registro | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');

    // Estados para edição de LIMITES DO CORRETOR
    const [editingTenantLimits, setEditingTenantLimits] = useState<Corretor | null>(null);
    const [limitMaxItems, setLimitMaxItems] = useState<number>(10);
    const [limitMaxImages, setLimitMaxImages] = useState<number>(4);

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

    const handleSaveTenantLimits = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingTenantLimits) return;

        try {
            const res = await fetch(`/api/admin/tenants?id=${editingTenantLimits._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    maxItems: limitMaxItems,
                    maxImagesPerItem: limitMaxImages
                })
            });

            if (res.ok) {
                alert('Limites do corretor atualizados com sucesso!');
                setEditingTenantLimits(null);
                verificarAcessoEPuxarDados();
            } else {
                const errData = await res.json();
                alert(errData.message || 'Erro ao atualizar limites.');
            }
        } catch (error) {
            alert('Falha ao conectar ao servidor para alterar limites.');
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
        if (!confirm('ATENÇÃO CRÍTICA:\n\nExcluir este corretor removerá sua conta e TODOS os imóveis cadastrados por ele automaticamente.\nDeseja prosseguir?')) return;

        try {
            const res = await fetch(`/api/admin/tenants?id=${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            if (res.ok) {
                alert('Corretor e banco de dados dependente eliminados!');
                verificarAcessoEPuxarDados();
            }
        } catch (error) {
            alert('Falha ao deletar corretor.');
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

            {/* MODAL DE EDIÇÃO DE LIMITES DO CLIENTE */}
            {editingTenantLimits && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 max-w-md w-full text-gray-100 relative shadow-2xl">
                        <button
                            onClick={() => setEditingTenantLimits(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl font-bold"
                        >
                            &times;
                        </button>
                        <h3 className="text-xl font-bold text-blue-400 mb-1">Ajustar Limites do Cliente</h3>
                        <p className="text-xs text-gray-400 mb-4">Corretor: <strong className="text-gray-200">{editingTenantLimits.name}</strong></p>

                        <form onSubmit={handleSaveTenantLimits} className="space-y-4">
                            <div>
                                <label className="block text-xs uppercase tracking-wider font-semibold text-gray-400 mb-1">
                                    Limite de Imóveis (Registros)
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={limitMaxItems}
                                    onChange={(e) => setLimitMaxItems(Number(e.target.value))}
                                    required
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs uppercase tracking-wider font-semibold text-gray-400 mb-1">
                                    Limite de Fotos por Imóvel
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    value={limitMaxImages}
                                    onChange={(e) => setLimitMaxImages(Number(e.target.value))}
                                    required
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setEditingTenantLimits(null)}
                                    className="bg-gray-700 text-gray-300 px-4 py-2 rounded-lg text-xs font-semibold hover:bg-gray-600 transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-lg text-xs transition shadow-md"
                                >
                                    Salvar Novos Limites
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL DE EDIÇÃO DE REGISTROS ALHEIOS */}
            {editingItem && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 max-w-xl w-full text-gray-100 relative shadow-2xl">
                        <button
                            onClick={() => setEditingItem(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl font-bold"
                        >
                            &times;
                        </button>
                        <h3 className="text-xl font-bold text-amber-400 mb-2">Modo Admin: Forçar Edição</h3>
                        <p className="text-xs text-gray-400 mb-4">Pertence ao corretor: <strong className="text-gray-200">{editingItem.corretor.name}</strong> ({editingItem.corretor.email})</p>

                        <form onSubmit={handleSaveEditItem} className="space-y-4">
                            <div>
                                <label className="block text-xs uppercase tracking-wider font-semibold text-gray-400 mb-1">Título do Registro</label>
                                <input
                                    type="text"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    required
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs uppercase tracking-wider font-semibold text-gray-400 mb-1">Descrição</label>
                                <textarea
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                    required
                                    className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500 h-32"
                                />
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setEditingItem(null)}
                                    className="bg-gray-700 text-gray-300 px-4 py-2 rounded-lg text-xs font-semibold hover:bg-gray-600 transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold px-4 py-2 rounded-lg text-xs transition shadow-md"
                                >
                                    Gravar Alteração Master
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* TOPO DO PAINEL MASTER */}
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

            {/* SUMÁRIO E CARDS DE METRICA */}
            <section className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-gray-800/40 border border-gray-800 p-5 rounded-xl">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total de Corretores</p>
                    <p className="text-3xl font-black text-blue-400 mt-1">{tenants.length}</p>
                </div>
                <div className="bg-gray-800/40 border border-gray-800 p-5 rounded-xl">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total de Imóveis no Banco</p>
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

            {/* SELEÇÃO DE ABAS ADMINISTRATIVAS */}
            <section className="max-w-7xl mx-auto mb-6">
                <div className="flex border-b border-gray-800 gap-2">
                    <button
                        onClick={() => setActiveTab('items')}
                        className={`px-5 py-3 text-sm font-bold border-b-2 transition ${activeTab === 'items' ? 'border-blue-500 text-blue-400 bg-gray-800/30' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
                    >
                        Todos os Imóveis Cadastrados ({items.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('tenants')}
                        className={`px-5 py-3 text-sm font-bold border-b-2 transition ${activeTab === 'tenants' ? 'border-blue-500 text-blue-400 bg-gray-800/30' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
                    >
                        Lista de Corretores ({tenants.length})
                    </button>
                </div>
            </section>

            {/* TABELA / VISUALIZAÇÃO DOS IMÓVEIS OU CORRETORES */}
            <main className="max-w-7xl mx-auto bg-gray-800 border border-gray-700/60 rounded-xl overflow-hidden shadow-xl">
                {activeTab === 'items' ? (
                    <div className="overflow-x-auto">
                        {items.length === 0 ? (
                            <p className="p-8 text-center text-sm text-gray-400">Nenhum imóvel foi postado em nenhuma conta do sistema.</p>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-900 border-b border-gray-700 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        <th className="p-4">Capa</th>
                                        <th className="p-4">Dados do Imóvel</th>
                                        <th className="p-4">Corretor Responsável</th>
                                        <th className="p-4 text-right">Ações de Controle</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700/50 text-sm">
                                    {items.map((item) => (
                                        <tr key={item._id} className="hover:bg-gray-750/30 transition-colors">
                                            <td className="p-4 whitespace-nowrap">
                                                <div className="w-16 h-12 bg-gray-900 border border-gray-700 rounded-md overflow-hidden flex items-center justify-center">
                                                    {item.images && item.images.length > 0 ? (
                                                        <img src={item.images[0]} className="w-full h-full object-cover" alt="Thumb" />
                                                    ) : (
                                                        <span className="text-[10px] text-gray-500">Sem foto</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="p-4 max-w-sm">
                                                <p className="font-bold text-white text-base leading-tight">{item.title}</p>
                                                <p className="text-xs text-gray-400 line-clamp-2 mt-0.5">{item.description}</p>
                                                <span className="text-[10px] font-mono text-gray-500 block mt-1">ID: {item._id}</span>
                                            </td>
                                            <td className="p-4">
                                                <p className="font-semibold text-gray-200">{item.corretor.name}</p>
                                                <p className="text-xs text-gray-400 font-mono">{item.corretor.email}</p>
                                                <p className="text-xs text-blue-400 font-mono">{item.corretor.phone}</p>
                                            </td>
                                            <td className="p-4 text-right whitespace-nowrap">
                                                <div className="inline-flex gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setEditingItem(item);
                                                            setEditTitle(item.title);
                                                            setEditDescription(item.description);
                                                        }}
                                                        className="bg-amber-500/10 hover:bg-amber-500 text-amber-400 hover:text-gray-900 border border-amber-500/30 px-3 py-1.5 rounded-lg text-xs font-bold transition"
                                                    >
                                                        Editar
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteItem(item._id)}
                                                        className="bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white border border-red-500/30 px-3 py-1.5 rounded-lg text-xs font-medium transition"
                                                    >
                                                        Excluir
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                ) : (
                    /* TABELA DE CONTROLE DE CORRETORES (TENANTS) COM EXIBIÇÃO E EDICÃO DE LIMITES */
                    <div className="overflow-x-auto">
                        {tenants.length === 0 ? (
                            <p className="p-8 text-center text-sm text-gray-400">Nenhum corretor cadastrado na plataforma.</p>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-900 border-b border-gray-700 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        <th className="p-4">Nome do Corretor</th>
                                        <th className="p-4">Contato / E-mail</th>
                                        <th className="p-4">Limites Atuais</th>
                                        <th className="p-4">Data Cadastro</th>
                                        <th className="p-4 text-right">Ações Críticas</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-700/50 text-sm">
                                    {tenants.map((t) => (
                                        <tr key={t._id} className="hover:bg-gray-750/30 transition-colors">
                                            <td className="p-4 whitespace-nowrap">
                                                <p className="font-bold text-white text-base">{t.name}</p>
                                                <span className="text-[10px] font-mono text-gray-500">TenantID: {t._id}</span>
                                            </td>
                                            <td className="p-4 font-mono text-xs">
                                                <p className="text-gray-200">{t.email}</p>
                                                <p className="text-blue-400 mt-0.5">{t.phone}</p>
                                            </td>
                                            <td className="p-4 text-xs font-mono">
                                                <span className="bg-blue-900/40 text-blue-300 border border-blue-800 px-2 py-1 rounded inline-block mb-1">
                                                    📌 Imóveis: <strong>{t.maxItems ?? 10}</strong>
                                                </span>
                                                <br />
                                                <span className="bg-emerald-900/40 text-emerald-300 border border-emerald-800 px-2 py-1 rounded inline-block">
                                                    🖼️ Fotos/Imóvel: <strong>{t.maxImagesPerItem ?? 4}</strong>
                                                </span>
                                            </td>
                                            <td className="p-4 text-xs text-gray-400 font-mono">
                                                {new Date(t.createdAt).toLocaleDateString('pt-BR')}
                                            </td>
                                            <td className="p-4 text-right whitespace-nowrap">
                                                <div className="inline-flex gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setEditingTenantLimits(t);
                                                            setLimitMaxItems(t.maxItems ?? 10);
                                                            setLimitMaxImages(t.maxImagesPerItem ?? 4);
                                                        }}
                                                        className="bg-blue-500/10 hover:bg-blue-600 text-blue-400 hover:text-white border border-blue-500/30 px-3 py-1.5 rounded-lg text-xs font-bold transition"
                                                    >
                                                        Ajustar Limites
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteTenant(t._id)}
                                                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow"
                                                    >
                                                        Banir / Deletar
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}