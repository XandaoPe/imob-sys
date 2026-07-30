'use client';

import React, { useState } from 'react';

interface ForgotPasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [resultData, setResultData] = useState<{ tempPassword: string; phone?: string } | null>(null);
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        setResultData(null);
        setCopied(false);

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, phone }),
            });

            const data = await res.json();

            if (res.ok) {
                setResultData({
                    tempPassword: data.tempPassword,
                    phone: data.phone,
                });
            } else {
                setError(data.error || 'Erro ao redefinir a senha.');
            }
        } catch (err: any) {
            setError(err.message || 'Erro ao conectar com o servidor.');
        } finally {
            setLoading(false);
        }
    };

    const handleCopyPassword = () => {
        if (!resultData) return;
        navigator.clipboard.writeText(resultData.tempPassword);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
    };

    const handleWhatsAppSend = () => {
        if (!resultData) return;
        const cleanPhone = resultData.phone ? resultData.phone.replace(/\D/g, '') : '5518997261236';
        const message = encodeURIComponent(`Olá, minha senha temporária gerada no sistema é: *${resultData.tempPassword}*.`);
        window.open(`https://wa.me/${cleanPhone.startsWith('55') ? cleanPhone : '55' + cleanPhone}?text=${message}`, '_blank');
    };

    const renderErrorMessage = (message: string) => {
        const phoneRegex = /(\(18\)\s?99726-1236)/g;
        const parts = message.split(phoneRegex);

        return parts.map((part, index) => {
            if (phoneRegex.test(part)) {
                return (
                    <a
                        key={index}
                        href="https://wa.me/5518997261236?text=Ol%C3%A1%2C%20n%C3%A3o%20consegui%20recuperar%20minha%20senha%20no%20sistema."
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold underline text-red-700 dark:text-red-300 hover:text-red-900 transition-colors inline"
                    >
                        {part}
                    </a>
                );
            }
            return part;
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl font-bold"
                >
                    ✕
                </button>

                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Recuperação de Senha</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
                    Confirme seus dados cadastrados para gerar uma nova senha temporária de acesso.
                </p>

                {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-600 dark:text-red-400 text-sm text-center leading-relaxed">
                        {renderErrorMessage(error)}
                    </div>
                )}

                {resultData ? (
                    <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-200 text-center">
                            <p className="font-bold text-sm mb-1">Nova senha temporária gerada:</p>

                            <div className="flex items-center justify-center gap-2 my-2">
                                <div className="text-2xl font-black tracking-widest bg-white dark:bg-slate-800 py-2 px-6 rounded-lg border border-emerald-300 dark:border-emerald-700 text-slate-900 dark:text-white select-all">
                                    {resultData.tempPassword}
                                </div>

                                {/* Botão de copiar com Tooltip */}
                                <div className="relative group">
                                    <button
                                        type="button"
                                        onClick={handleCopyPassword}
                                        className="p-3 bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg transition shadow-sm flex items-center justify-center"
                                        aria-label="Copiar senha"
                                    >
                                        📋
                                    </button>
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex px-2.5 py-1 bg-slate-900 text-white text-xs rounded-md whitespace-nowrap shadow-md z-10">
                                        {copied ? 'Copiado!' : 'Copiar senha'}
                                    </div>
                                </div>
                            </div>

                            <p className="text-xs opacity-90 mt-2">
                                Copie sua senha acima ou envie para o seu WhatsApp cadastrado.
                            </p>
                        </div>

                        {/* Aviso e recomendação sobre alteração posterior */}
                        <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-xl text-xs text-blue-800 dark:text-blue-300 leading-relaxed text-center">
                            💡 Assim que entrar, clique em <strong>"Meu Perfil"</strong> para alterar esta senha temporária por uma definitiva de sua preferência.
                        </div>

                        <button
                            type="button"
                            onClick={handleWhatsAppSend}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                        >
                            <span>💬 Enviar para meu WhatsApp</span>
                        </button>

                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium py-2 px-4 rounded-xl transition-all"
                        >
                            Fechar e fazer login
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Campo Nome com Tooltip */}
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Seu Nome
                                </label>
                                <div className="relative group cursor-help">
                                    <span className="text-xs text-blue-500 dark:text-blue-400 font-semibold underline decoration-dotted">ℹ️ Ajuda</span>
                                    <div className="absolute right-0 bottom-full mb-1 hidden group-hover:block w-64 p-2 bg-slate-900 text-slate-100 text-xs rounded-lg shadow-xl z-20 pointer-events-none">
                                        Digite exatamente o nome que aparece na página de propagandas (vitrine onde são apresentados os seus itens cadastrados).
                                    </div>
                                </div>
                            </div>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                placeholder="Nome da sua página/vitrine"
                                className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
                            />
                        </div>

                        {/* Campo E-mail com Tooltip */}
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    E-mail
                                </label>
                                <div className="relative group cursor-help">
                                    <span className="text-xs text-blue-500 dark:text-blue-400 font-semibold underline decoration-dotted">ℹ️ Ajuda</span>
                                    <div className="absolute right-0 bottom-full mb-1 hidden group-hover:block w-56 p-2 bg-slate-900 text-slate-100 text-xs rounded-lg shadow-xl z-20 pointer-events-none">
                                        O e-mail cadastrado na sua conta do sistema.
                                    </div>
                                </div>
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="seu@email.com"
                                className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
                            />
                        </div>

                        {/* Campo Telefone com Tooltip */}
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Celular / WhatsApp
                                </label>
                                <div className="relative group cursor-help">
                                    <span className="text-xs text-blue-500 dark:text-blue-400 font-semibold underline decoration-dotted">ℹ️ Ajuda</span>
                                    <div className="absolute right-0 bottom-full mb-1 hidden group-hover:block w-56 p-2 bg-slate-900 text-slate-100 text-xs rounded-lg shadow-xl z-20 pointer-events-none">
                                        Número de WhatsApp vinculado ao seu cadastro.
                                    </div>
                                </div>
                            </div>
                            <input
                                type="text"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                required
                                placeholder="(18) 99999-9999"
                                className="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl transition disabled:opacity-50"
                        >
                            {loading ? 'Verificando dados...' : 'Verificar e Gerar Senha'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}