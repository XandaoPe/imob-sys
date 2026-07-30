'use client';

import React, { useState } from 'react';
import imageCompression from 'browser-image-compression';

const InfoTooltip = ({ text }: { text: string }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <span className="relative inline-flex items-center ml-1">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                onMouseEnter={() => setIsOpen(true)}
                onMouseLeave={() => setIsOpen(false)}
                onBlur={() => setIsOpen(false)}
                className="w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-blue-600 dark:hover:bg-blue-500 hover:text-white text-gray-600 dark:text-gray-300 font-bold text-[10px] flex items-center justify-center transition-colors cursor-help select-none focus:outline-none"
                aria-label="Mais informações"
            >
                ?
            </button>
            {isOpen && (
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 flex flex-col items-center z-50 w-52 pointer-events-none animate-fadeIn">
                    <span className="relative z-10 p-2 text-xs leading-relaxed text-white bg-gray-900/95 dark:bg-gray-800 rounded-lg shadow-xl text-center font-normal border border-transparent dark:border-gray-700">
                        {text}
                    </span>
                    <span className="w-2 h-2 -mt-1 rotate-45 bg-gray-900/95 dark:bg-gray-800 block"></span>
                </span>
            )}
        </span>
    );
};

interface ItemFormProps {
    editingId: string | null;
    isLimitReached: boolean;
    maxItems: number;
    maxImagesPerItem: number;
    title: string;
    setTitle: (val: string) => void;
    description: string;
    setDescription: (val: string) => void;
    expiresAt: string;
    setExpiresAt: (val: string) => void;
    isActive: boolean;
    setIsActive: (val: boolean) => void;
    images: string[];
    setImages: React.Dispatch<React.SetStateAction<string[]>>;
    fileCountText: string;
    setFileCountText: (val: string) => void;
    isLoading: boolean;
    setIsLoading: (val: boolean) => void;
    setProcessingMessage: (val: string | null) => void;
    onSaveOrUpdate: (e: React.FormEvent) => void;
    onResetForm: () => void;
}

export default function ItemForm({
    editingId,
    isLimitReached,
    maxItems,
    maxImagesPerItem,
    title,
    setTitle,
    description,
    setDescription,
    expiresAt,
    setExpiresAt,
    isActive,
    setIsActive,
    images,
    setImages,
    fileCountText,
    setFileCountText,
    isLoading,
    setIsLoading,
    setProcessingMessage,
    onSaveOrUpdate,
    onResetForm,
}: ItemFormProps) {

    const handleMultipleImagesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            const availableSlots = maxImagesPerItem - images.length;

            if (availableSlots <= 0) {
                alert(`Você já atingiu o limite máximo de ${maxImagesPerItem} imagens para este registro.`);
                e.target.value = '';
                return;
            }

            const filesToProcess = Array.from(files).slice(0, availableSlots);

            if (files.length > availableSlots) {
                alert(`Atenção: Seu plano permite até ${maxImagesPerItem} imagens por registro. Apenas as ${availableSlots} primeiras fotos selecionadas serão processadas.`);
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
                        alert(`A imagem "${file.name}" ultrapassa o limite permitido!`);
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
                alert("Ocorreu um erro ao processar as imagens.");
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

    return (
        <div id="item-form-container" className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 md:col-span-1 h-fit transition-colors">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{editingId ? 'Editar Registro' : 'Novo Registro'}</h2>

            {isLimitReached && (
                <div className="mt-3 mb-2 p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/60 rounded-xl text-xs sm:text-sm text-amber-900 dark:text-amber-200 font-medium leading-relaxed shadow-sm">
                    <div className="flex items-start gap-2">
                        <span className="text-base leading-none">💡</span>
                        <div>
                            <strong className="block font-bold text-amber-900 dark:text-amber-100 mb-0.5">Limite de registros atingido!</strong>
                            Você alcançou o limite máximo de <strong>{maxItems}</strong> registros no seu plano.
                        </div>
                    </div>
                </div>
            )}

            <p className="text-[10px] text-green-600 dark:text-green-400 mt-1 mb-2 font-medium leading-tight">
                * Limitado a {maxItems} registros com até {maxImagesPerItem} imagens cada.
            </p>

            <form onSubmit={onSaveOrUpdate} className="space-y-4">
                <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        <span>Título</span>
                        <InfoTooltip text="Nome principal do anúncio que aparecerá em destaque para os clientes." />
                    </label>
                    <input
                        type="text"
                        placeholder="Ex: Casa de Campo"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        required
                        disabled={isLimitReached}
                        className="w-full p-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm focus:outline-none transition-colors"
                    />
                </div>

                <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        <span>Descrição</span>
                        <InfoTooltip text="Detalhes completos como localização, dimensões, preço, etc." />
                    </label>
                    <textarea
                        placeholder="Detalhes do registro..."
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        required
                        disabled={isLimitReached}
                        className="w-full p-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm focus:outline-none h-24 transition-colors"
                    />
                </div>

                {/* CAMPO: DATA DE VALIDADE */}
                <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        <span>Validade do Anúncio</span>
                        <InfoTooltip text="Após esta data, o anúncio ficará inativo e oculto da página pública até ser reativado com uma nova data." />
                    </label>
                    <input
                        type="date"
                        value={expiresAt}
                        onChange={e => setExpiresAt(e.target.value)}
                        required
                        disabled={isLimitReached}
                        className="w-full p-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 text-sm focus:outline-none transition-colors"
                    />
                </div>

                {/* CAMPO: STATUS ATIVO / INATIVO */}
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/60 rounded-lg border border-gray-200 dark:border-gray-700">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                        Anúncio Ativo?
                        <InfoTooltip text="Anúncios inativos não aparecem na página pública do cliente." />
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={isActive}
                            onChange={e => setIsActive(e.target.checked)}
                            disabled={isLimitReached}
                            className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:peer-focus:ring-blue-800 peer-checked:bg-blue-600"></div>
                    </label>
                </div>

                <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        <span>Imagens do Registro</span>
                        <InfoTooltip text={`Envie até ${maxImagesPerItem} fotos. Use as setas para alterar a ordem de exibição.`} />
                    </label>
                    <label className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-lg transition p-2 text-center ${images.length >= maxImagesPerItem || isLimitReached ? 'border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-800/50 cursor-not-allowed opacity-70' : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 cursor-pointer'}`}>
                        <svg className="w-6 h-6 mb-1 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        <p className="text-xs text-gray-700 dark:text-gray-300 font-semibold">{fileCountText ? fileCountText : `Adicionar fotos (Máx ${maxImagesPerItem})`}</p>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleMultipleImagesChange}
                            className="hidden"
                            disabled={images.length >= maxImagesPerItem || isLimitReached}
                        />
                    </label>
                </div>

                {images.length > 0 && (
                    <div className="p-1">
                        <div className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1.5 flex justify-between items-center">
                            <span>Organizar ordem das fotos:</span>
                            <span className={images.length === maxImagesPerItem ? "text-red-500 font-bold" : "text-blue-500 font-bold"}>{images.length}/{maxImagesPerItem}</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto p-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
                            {images.map((img, idx) => (
                                <div key={idx} className="relative border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 flex flex-col justify-between overflow-hidden shadow-sm">
                                    {/* Miniatura da Imagem */}
                                    <div className="h-20 w-full bg-gray-100 dark:bg-gray-950 relative">
                                        <img src={img} className="h-full w-full object-cover" alt="form-thumb" />
                                        {/* Botão de Excluir */}
                                        <button
                                            type="button"
                                            onClick={() => removeImageFromGallery(idx)}
                                            className="absolute top-1.5 right-1.5 bg-red-600 hover:bg-red-700 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shadow-md transition"
                                            title="Remover foto"
                                        >
                                            &times;
                                        </button>
                                    </div>

                                    {/* Controles de Ordenação Limpos com Setas */}
                                    <div className="bg-gray-50 dark:bg-gray-800/90 px-2 py-1.5 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
                                        <button
                                            type="button"
                                            onClick={() => moveImageOrder(idx, 'left')}
                                            disabled={idx === 0}
                                            className={`w-7 h-7 flex items-center justify-center rounded text-sm font-bold transition ${idx === 0 ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed bg-transparent' : 'text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50'}`}
                                            title="Mover para esquerda"
                                        >
                                            ◀
                                        </button>
                                        <span className="text-[11px] font-bold text-gray-600 dark:text-gray-300">
                                            {idx + 1}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => moveImageOrder(idx, 'right')}
                                            disabled={idx === images.length - 1}
                                            className={`w-7 h-7 flex items-center justify-center rounded text-sm font-bold transition ${idx === images.length - 1 ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed bg-transparent' : 'text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50'}`}
                                            title="Mover para direita"
                                        >
                                            ▶
                                        </button>
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
                        className={`w-full text-white p-2.5 rounded-lg font-medium transition shadow-sm ${isLoading || isLimitReached ? 'bg-gray-400 dark:bg-gray-700 cursor-not-allowed' : editingId ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                        {isLoading ? 'Processando...' : editingId ? 'Salvar Alterações' : 'Salvar Registro'}
                    </button>
                    {editingId && (
                        <button
                            type="button"
                            disabled={isLoading}
                            onClick={onResetForm}
                            className="w-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 p-2.5 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                        >
                            Cancelar Edição
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}