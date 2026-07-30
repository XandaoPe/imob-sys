'use client';

import { useState } from 'react';
import ThemeToggle from '@/components/ThemeToggle';
import LoginForm from '@/components/auth/LoginForm';
import RegisterForm from '@/components/auth/RegisterForm'; // Criado na mesma lógica do LoginForm

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-gray-800 dark:text-gray-100 relative bg-gray-50 dark:bg-gray-950">
      <div className="absolute top-6 right-6 z-10">
        <ThemeToggle />
      </div>

      <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-md border border-gray-200 dark:border-gray-800 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">
          {isLogin ? 'Login do Cliente' : 'Crie sua Conta'}
        </h2>

        {isLogin ? (
          <LoginForm />
        ) : (
          <RegisterForm onSuccess={() => setIsLogin(true)} />
        )}

        <div className="text-center mt-6">
          <button
            onClick={() => setIsLogin(!isLogin)}
            type="button"
            className={`w-full py-2.5 px-4 rounded-xl text-sm font-bold transition-all shadow-md ${isLogin
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 animate-pulse shadow-amber-500/20'
                : 'bg-transparent text-blue-600 dark:text-blue-400 hover:underline shadow-none'
              }`}
          >
            {isLogin ? (
              <span className="flex items-center justify-center gap-1.5">
                <span>✨ Não tem conta?</span>
                <span className="underline font-extrabold">Cadastre-se agora! 🚀</span>
              </span>
            ) : (
              'Já tem uma conta? Conecte-se'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}