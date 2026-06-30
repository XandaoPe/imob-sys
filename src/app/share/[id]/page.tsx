'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

interface Item {
    _id: string;
    title: string;
    description: string;
    imageBase64?: string;
}

interface TenantData {
    tenantName: string;
    tenantPhone: string; // Novo campo
    items: Item[];
}

export default function PublicSharePage() {
    const params = useParams();
    const [data, setData] = useState<TenantData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!params?.id) return;

        fetch(`/api/public/tenant/${params.id}`)
            .then((res) => {
                if (res.ok) return res.json();
                throw new Error('Falha ao carregar');
            })
            .then((data) => setData(data))
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    }, [params?.id]);

    // Função para formatar o telefone vindo cru do banco para exibição visual (Ex: 11999999999 -> (11) 99999-9999)
    const formatDisplayPhone = (phoneStr: string) => {
        if (!phoneStr) return '';
        const clean = phoneStr.replace(/\D/g, '');
        if (clean.length === 11) {
            return `(${clean.substring(0, 2)}) ${clean.substring(2, 7)}-${clean.substring(7)}`;
        }
        return phoneStr;
    };

    if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">Carregando registros...</div>;
    if (!data) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-red-500">Página não encontrada.</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-6 text-gray-800">
            <header className="max-w-5xl mx-auto text-center mb-12 mt-6 bg-white p-6 rounded-2xl border shadow-xs">
                <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-1">
                    {data.tenantName}
                </h1>

                {data.tenantPhone && (
                    <div className="mt-2 flex items-center justify-center gap-1.5 text-sm font-semibold text-green-600 bg-green-50 w-fit mx-auto px-3 py-1 rounded-full border border-green-200">
                        {/* Ícone de Telefone */}
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                        <a href={`https://wa.me/55${data.tenantPhone}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            Contato: {formatDisplayPhone(data.tenantPhone)}
                        </a>
                    </div>
                )}
                <p className="text-xs text-gray-400 mt-3">Registros liberados para visualização pública</p>
            </header>

            <main className="max-w-5xl mx-auto">
                {data.items.length === 0 ? (
                    <p className="text-sm text-gray-400 text-center py-12">Nenhum registro público disponível.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {data.items.map((item) => (
                            <div key={item._id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col">
                                {item.imageBase64 ? (
                                    <div className="w-full h-56 bg-gray-100 flex items-center justify-center p-2 border-b border-gray-100">
                                        <img src={item.imageBase64} className="max-w-full max-h-full object-contain rounded-lg" alt={item.title} />
                                    </div>
                                ) : (
                                    <div className="w-full h-56 bg-gray-200 flex items-center justify-center text-gray-400 text-xs border-b">Sem imagem</div>
                                )}
                                <div className="p-5 flex-1 flex flex-col justify-between">
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg leading-snug mb-2">{item.title}</h3>
                                        <p className="text-sm text-gray-600 whitespace-pre-wrap">{item.description}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}