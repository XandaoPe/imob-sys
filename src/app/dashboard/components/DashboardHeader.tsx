'use client';

import ThemeToggle from '@/components/ThemeToggle';
import { useRouter } from 'next/navigation';

interface DashboardHeaderProps {
    isMasterAdmin: boolean;
    tenantName?: string; // Propriedade adicionada
    tenantCity?: string; // Propriedade adicionada
    onOpenProfile: () => void;
}

export default function DashboardHeader({ isMasterAdmin, tenantName, tenantCity, onOpenProfile }: DashboardHeaderProps) {
    const router = useRouter();

    return (
        <header className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                    Painel de Controle
                </h1>
                {/* Nome do usuário e cidade exibidos dinamicamente */}
                {tenantName && (
                    <p className="text-xs sm:text-sm font-semibold text-amber-600 dark:text-amber-400 mt-0.5">
                        {tenantName} {tenantCity ? `• ${tenantCity}` : ''}
                    </p>
                )}
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                {isMasterAdmin && (
                    <button
                        onClick={() => router.push('/admin')}
                        className="bg-gray-950 text-amber-400 border border-amber-500/40 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-bold text-xs sm:text-sm hover:bg-gray-900 transition flex items-center gap-1.5 shadow-md active:scale-95"
                    >
                        👑 Painel Master
                    </button>
                )}

                <button
                    onClick={onOpenProfile}
                    className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium text-xs sm:text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition flex items-center gap-1.5 shadow-sm"
                >
                    <svg className="w-4 h-4 text-gray-500 dark:text-gray-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Meu Perfil
                </button>

                <button
                    onClick={() => {
                        localStorage.clear();
                        router.push('/');
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg font-medium text-xs sm:text-sm transition"
                >
                    Sair
                </button>

                <div className="shrink-0">
                    <ThemeToggle />
                </div>
            </div>
        </header>
    );
}