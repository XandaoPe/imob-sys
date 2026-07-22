'use client';

import ThemeToggle from '@/components/ThemeToggle';
import { useRouter } from 'next/navigation';

interface DashboardHeaderProps {
    isMasterAdmin: boolean;
    onOpenProfile: () => void;
}

export default function DashboardHeader({ isMasterAdmin, onOpenProfile }: DashboardHeaderProps) {
    const router = useRouter();

    return (
        <header className="max-w-5xl mx-auto flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Painel de Controle</h1>
            <div className="flex items-center gap-3">
                {isMasterAdmin && (
                    <button
                        onClick={() => router.push('/admin')}
                        className="bg-gray-950 text-amber-400 border border-amber-500/40 px-4 py-2 rounded-lg font-bold text-sm hover:bg-gray-900 transition flex items-center gap-1.5 shadow-md active:scale-95"
                    >
                        👑 Painel Master
                    </button>
                )}

                <button
                    onClick={onOpenProfile}
                    className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition flex items-center gap-1.5 shadow-sm"
                >
                    <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Meu Perfil
                </button>
                <button
                    onClick={() => {
                        localStorage.clear();
                        router.push('/');
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition"
                >
                    Sair
                </button>
                <ThemeToggle />
            </div>
        </header>
    );
}