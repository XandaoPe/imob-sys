'use client';

import React from 'react';
import imageCompression from 'browser-image-compression';

interface ItemFormProps {
    editingId: string | null;
    isLimitReached: boolean;
    title: string;
    setTitle: (val: string) => void;
    description: string;
    setDescription: (val: string) => void;
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
    title,
    setTitle,
    description,
    setDescription,
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

    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 md:col-span-1 h-fit">
            <h2 className="text-xl font-semibold text-gray-900">{editingId ? 'Editar Registro' : 'Novo Registro'}</h2>

            {isLimitReached && (
                <div className="mt-3 mb-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 font-medium">
                    ⚠️ Limite de 10 registros atingido. Exclua um item existente para cadastrar novos.
                </div>
            )}

            <p className="text-[10px] text-green-600 mt-1 mb-2 font-medium leading-tight">
                * Limitado a 10 registros com 04 imagens cada.
            </p>
            <form onSubmit={onSaveOrUpdate} className="space-y-4">
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
                        * Compressão automática ativa! Fotos de alta resolução serão reduzidas sem perda de fidelidade.
                    </p>
                </div>

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
                        className={`w-full text-white p-2.5 rounded-lg font-medium transition shadow-sm ${isLoading || isLimitReached ? 'bg-gray-400 cursor-not-allowed' : editingId ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                    >
                        {isLoading ? 'Processando...' : editingId ? 'Salvar Alterações' : 'Salvar Registro'}
                    </button>
                    {editingId && (
                        <button
                            type="button"
                            disabled={isLoading}
                            onClick={onResetForm}
                            className="w-full bg-gray-100 text-gray-600 p-2.5 rounded-lg font-medium hover:bg-gray-200 transition disabled:opacity-50"
                        >
                            Cancelar Edição
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}