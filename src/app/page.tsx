'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loginIdentifier, setLoginIdentifier] = useState(''); // E-mail ou Telefone
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [businessCardLink, setBusinessCardLink] = useState('');
  const router = useRouter();

  // Função para aplicar máscara de telefone em tempo de execução
  const formatPhone = (value: string) => {
    if (!value) return '';
    const cleanValue = value.replace(/\D/g, '');
    if (cleanValue.length <= 2) return `(${cleanValue}`;
    if (cleanValue.length <= 6) return `(${cleanValue.substring(0, 2)}) ${cleanValue.substring(2)}`;
    return `(${cleanValue.substring(0, 2)}) ${cleanValue.substring(2, 7)}-${cleanValue.substring(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';

    const body = isLogin
      ? { loginIdentifier, password }
      : { name, email, phone, password, businessCardLink };

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (res.ok) {
      if (isLogin) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('tenantId', data.tenantId);
        router.push('/dashboard');
      } else {
        setIsLogin(true);
        setName('');
        setEmail('');
        setPhone('');
        setPassword('');
        alert('Cadastro realizado! Faça login agora.');
      }
    } else {
      setError(data.error || 'Ocorreu um erro.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 text-gray-800">
      <div className="bg-white p-8 rounded-xl shadow-md border border-gray-200 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">
          {isLogin ? 'Login do Cliente' : 'Crie sua Conta'}
        </h2>

        {error && <p className="text-red-500 text-sm mb-4 text-center font-medium">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm focus:outline-none" placeholder="Seu nome" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm focus:outline-none" placeholder="seu@email.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp / Telefone</label>
                <input type="text" value={phone} onChange={handlePhoneChange} maxLength={15} required className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm focus:outline-none" placeholder="(00) 00000-0000" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Link do Cartão de Visitas Virtual</label>
                <input
                  type="url"
                  value={businessCardLink}
                  onChange={e => setBusinessCardLink(e.target.value)}
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm focus:outline-none"
                  placeholder="https://meucartao.com/seu-perfil"
                />
              </div>
            </>
          )}

          {isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail ou Telefone</label>
              <input type="text" value={loginIdentifier} onChange={e => setLoginIdentifier(e.target.value)} required className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm focus:outline-none" placeholder="Digite seu e-mail ou nº de telefone" />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm focus:outline-none" placeholder="••••••••" />
          </div>

          <button type="submit" className="w-full bg-blue-600 text-white p-2.5 rounded-lg font-medium hover:bg-blue-700 transition shadow-sm mt-2">
            {isLogin ? 'Entrar' : 'Cadastrar'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="text-blue-600 font-medium hover:underline">
            {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem uma conta? Conecte-se'}
          </button>
        </p>
      </div>
    </div>
  );
}