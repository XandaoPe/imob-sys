'use client';

import React, { useState, useEffect } from 'react';
import { generatePixPayload } from '@/lib/pix';

interface PixModalProps {
    isOpen: boolean;
    onClose: () => void;
    tenantId: string;
    tenantName?: string;
    tenantPhone?: string;
    tenantEmail?: string;
}

export default function PixModal({ isOpen, onClose, tenantId, tenantName = '', tenantPhone = '', tenantEmail = '' }: PixModalProps) {
    const [payerInfo, setPayerInfo] = useState('');
    const [copied, setCopied] = useState(false);
    const [isQrLoading, setIsQrLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            // Preenche automaticamente com Nome, Telefone e E-mail cadastrados
            const details = [tenantName, tenantPhone, tenantEmail].filter(Boolean).join(' - ');
            setPayerInfo(details);
            setIsQrLoading(true);
        }
    }, [isOpen, tenantName, tenantPhone, tenantEmail]);

    if (!isOpen) return null;

    const pixPayload = generatePixPayload(
        '18997261236',
        129.90,
        'Mota Carvalho Imoveis',
        'Presidente Epitacio',
        tenantId ? tenantId.substring(0, 25) : 'ANUIDADE'
    );

    const qrCodeApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(pixPayload)}`;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(pixPayload);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
        } catch (err) {
            alert('Falha ao copiar código Pix.');
        }
    };

    const whatsappUrl = `https://wa.me/5518997261236?text=${encodeURIComponent(
        `Olá, realizei o pagamento da anuidade Pix de R$ 129,90.\nDados: ${payerInfo}\nID: ${tenantId}`
    )}`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 dark:border-gray-800 text-center relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl font-bold"
                >
                    ✕
                </button>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Pagamento da Anuidade</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                    Chave Pix: <strong className="text-blue-600 dark:text-blue-400">(18) 99726-1236</strong> | Valor: <strong className="text-green-600">R$ 129,90</strong>
                </p>

                <div className="mb-4">
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 text-left mb-1">
                        Identificação do Pagador (Nome - Telefone - E-mail):
                    </label>
                    <input
                        type="text"
                        value={payerInfo}
                        onChange={(e) => setPayerInfo(e.target.value)}
                        className="w-full p-2 text-sm border rounded-lg dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                        placeholder="Nome - Telefone - E-mail"
                    />
                </div>

                {/* Bloco do QR Code com Spinner de Carregamento */}
                <div className="bg-white p-3 rounded-xl inline-block shadow-inner border mb-4 relative min-h-[210px] min-w-[210px] flex items-center justify-center">
                    {isQrLoading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 dark:bg-gray-900/90 rounded-xl z-10">
                            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                            <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">Gerando QR Code Pix...</span>
                        </div>
                    )}
                    <img
                        src={qrCodeApiUrl}
                        alt="QR Code Pix"
                        className="w-48 h-48 mx-auto"
                        onLoad={() => setIsQrLoading(false)}
                        onError={() => setIsQrLoading(false)}
                    />
                </div>

                {/* Aviso Chamativo sobre o Comprovante */}
                <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-950/60 border-2 border-amber-400 dark:border-amber-600 rounded-xl text-amber-900 dark:text-amber-200 text-xs font-medium text-left flex items-start gap-2 shadow-sm">
                    <span className="text-base">⚠️</span>
                    <div>
                        <strong className="block font-bold mb-0.5">Atenção importante:</strong>
                        A baixa do pagamento e a liberação do acesso <strong>somente serão realizadas após o envio do comprovante</strong> via WhatsApp!
                    </div>
                </div>

                <div className="space-y-2">
                    <button
                        onClick={handleCopy}
                        className={`w-full py-2.5 px-4 rounded-xl font-bold text-sm transition-all shadow-md ${copied
                                ? 'bg-green-600 text-white'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                    >
                        {copied ? '✅ Código Pix Copiado com Sucesso!' : '📋 Copiar Código Pix (Copia e Cola)'}
                    </button>

                    <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full py-2.5 px-4 rounded-xl font-semibold text-sm bg-emerald-600 hover:bg-emerald-700 text-white transition shadow"
                    >
                        💬 Enviar Comprovante no WhatsApp
                    </a>
                </div>

                <p className="text-[11px] text-gray-400 mt-4">
                    Após o pagamento, o Administrador Master confirmará a baixa e seu acesso será liberado por 1 ano.
                </p>
            </div>
        </div>
    );
}