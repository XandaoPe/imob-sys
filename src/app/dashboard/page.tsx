'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Item {
    _id: string;
    title: string;
    description: string;
    imageBase64?: string;
}

export default function Dashboard() {
    const [items, setItems] = useState<Item[]>([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [image, setImage] = useState('');
    const [fileName, setFileName] = useState('');
    const [shareLink, setShareLink] = useState('');
    const [copied, setCopied] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

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
        if (res.ok) setItems(await res.json());
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFileName(file.name);
            const reader = new FileReader();
            reader.onloadend = () => setImage(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSaveOrUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        const isEditing = editingId !== null;
        const endpoint = isEditing ? `/api/items/${editingId}` : '/api/items';
        const method = isEditing ? 'PUT' : 'POST';

        const res = await fetch(endpoint, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({ title, description, imageBase64: image }),
        });

        if (res.ok) {
            resetForm();
            fetchItems();
        }
    };

    const startEdit = (item: Item) => {
        setEditingId(item._id);
        setTitle(item.title);
        setDescription(item.description);
        setImage(item.imageBase64 || '');
        setFileName(item.imageBase64 ? 'Imagem atual mantida' : '');
    };

    const resetForm = () => {
        setEditingId(null);
        setTitle('');
        setDescription('');
        setImage('');
        setFileName('');
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Deseja realmente excluir este registro?')) return;
        const res = await fetch(`/api/items/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        if (res.ok) {
            if (editingId === id) resetForm();
            fetchItems();
        }
    };

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(shareLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Falha ao copiar o link: ', err);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 text-gray-800">
            <header className="max-w-5xl mx-auto flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Painel de Controle</h1>
                <button
                    onClick={() => { localStorage.clear(); router.push('/'); }}
                    className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition"
                >
                    Sair
                </button>
            </header>

            <main className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Formulário Reativo (Cadastro / Edição) */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 md:col-span-1 h-fit">
                    <h2 className="text-xl font-semibold mb-4 text-gray-900">
                        {editingId ? 'Editar Registro' : 'Novo Registro'}
                    </h2>
                    <form onSubmit={handleSaveOrUpdate} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                            <input type="text" placeholder="Ex: Casa de Campo" value={title} onChange={e => setTitle(e.target.value)} required className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                            <textarea placeholder="Detalhes do registro..." value={description} onChange={e => setDescription(e.target.value)} required className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm h-24" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {editingId ? 'Alterar Imagem (Opcional)' : 'Imagem do Registro'}
                            </label>
                            <div className="flex items-center justify-center w-full">
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6 px-2 text-center">
                                        <svg className="w-8 h-8 mb-2 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                                        </svg>
                                        <p className="text-xs text-gray-700 font-semibold">
                                            {fileName ? 'Nova imagem/Arquivo pronto!' : 'Clique para substituir/enviar'}
                                        </p>
                                        <p className="text-[11px] text-gray-500 mt-0.5 truncate max-w-xs">
                                            {fileName ? fileName : 'Formatos aceitos: PNG, JPG ou WEBP'}
                                        </p>
                                    </div>
                                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                                </label>
                            </div>
                        </div>

                        {image && (
                            <div className="mt-2">
                                <p className="text-xs font-medium text-gray-500 mb-1">Visualização:</p>
                                {/* Visualização interna também protegida contra cortes */}
                                <div className="w-full h-36 bg-gray-100 flex items-center justify-center p-1 rounded-lg border">
                                    <img src={image} className="max-w-full max-h-full object-contain rounded" alt="Preview" />
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col gap-2 pt-2">
                            <button type="submit" className={`w-full text-white p-2.5 rounded-lg font-medium transition shadow-sm ${editingId ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
                                {editingId ? 'Salvar Alterações' : 'Salvar Registro'}
                            </button>

                            {editingId && (
                                <button type="button" onClick={resetForm} className="w-full bg-gray-100 text-gray-600 p-2.5 rounded-lg font-medium hover:bg-gray-200 transition">
                                    Cancelar Edição
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Listagem de Itens e Link */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 md:col-span-2">
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                        <p className="font-semibold text-blue-900 text-sm mb-1.5 flex items-center gap-1.5">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                            Link de Compartilhamento Público:
                        </p>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                readOnly
                                value={shareLink}
                                className="flex-1 p-2.5 bg-white border border-gray-300 rounded-lg text-xs select-all text-blue-600 font-mono focus:outline-none"
                            />
                            <button
                                type="button"
                                onClick={copyToClipboard}
                                className={`px-4 rounded-lg font-medium text-xs transition shadow-sm border flex items-center justify-center gap-1 min-w-[90px] ${copied
                                        ? 'bg-green-50 text-green-700 border-green-200'
                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                {copied ? (
                                    <>
                                        <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                                        Copiado!
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
                                        Copiar
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    <h2 className="text-xl font-semibold mb-4 text-gray-900">Meus Registros</h2>
                    {items.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-8">Nenhum registro cadastrado ainda.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {items.map(item => (
                                <div key={item._id} className="border border-gray-200 rounded-xl overflow-hidden flex flex-col justify-between bg-white shadow-sm hover:shadow transition">
                                    <div>
                                        {/* Alterado aqui: Container interno com contenção total da imagem */}
                                        {item.imageBase64 ? (
                                            <div className="w-full h-44 bg-gray-50 flex items-center justify-center p-2 border-b border-gray-100">
                                                <img src={item.imageBase64} className="max-w-full max-h-full object-contain rounded-lg" alt={item.title} />
                                            </div>
                                        ) : (
                                            <div className="w-full h-44 bg-gray-100 flex items-center justify-center text-gray-400 text-xs border-b">
                                                Sem imagem
                                            </div>
                                        )}
                                        <div className="p-4">
                                            <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1">{item.title}</h3>
                                            <p className="text-sm text-gray-600 line-clamp-3">{item.description}</p>
                                        </div>
                                    </div>
                                    <div className="p-4 pt-0 grid grid-cols-2 gap-2">
                                        <button onClick={() => startEdit(item)} className="bg-amber-50 text-amber-700 py-2 rounded-lg hover:bg-amber-100 text-sm font-medium transition border border-amber-200">
                                            Editar
                                        </button>
                                        <button onClick={() => handleDelete(item._id)} className="bg-red-50 text-red-600 py-2 rounded-lg hover:bg-red-100 text-sm font-medium transition border border-red-200">
                                            Excluir
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}