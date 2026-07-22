'use client';

interface ToastProps {
    message: string | null;
}

export default function Toast({ message }: ToastProps) {
    if (!message) return null;

    return (
        <div className="fixed bottom-5 right-5 z-50 bg-gray-900 dark:bg-gray-800 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-gray-700 dark:border-gray-600 animate-bounce">
            <svg className="animate-spin h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="text-sm font-medium">{message}</span>
        </div>
    );
}