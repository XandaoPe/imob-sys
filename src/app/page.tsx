'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// cspell:disable-next-line
import estadosCidades from 'estados-cidades';
import ThemeToggle from '@/components/ThemeToggle';

// COMPONENTE DE TOOLTIP DE INFORMAÇÃO
const InfoTooltip = ({ text }: { text: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-flex items-center ml-1">
      <button
        type="button" // IMPORTANTE: type="button" impede o envio acidental do formulário ao tocar
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onBlur={() => setIsOpen(false)} // Fecha o tooltip ao clicar fora (no celular ou computador)
        className="w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-blue-600 dark:hover:bg-blue-500 hover:text-white dark:hover:text-white text-gray-600 dark:text-gray-300 font-bold text-[11px] flex items-center justify-center transition-colors cursor-help select-none focus:outline-none"
        aria-label="Mais informações"
      >
        ?
      </button>

      {/* Balão de Informação */}
      {isOpen && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 flex flex-col items-center z-50 w-52 pointer-events-none animate-fadeIn">
          <span className="relative z-10 p-2 text-xs leading-relaxed text-white bg-gray-900 dark:bg-gray-800 rounded-lg shadow-xl text-center font-normal border border-transparent dark:border-gray-700">
            {text}
          </span>
          <div className="w-2 h-2 -mt-1 rotate-45 bg-gray-900 dark:bg-gray-800"></div>
        </div>
      )}
    </div>
  );
};

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [websiteLink, setWebsiteLink] = useState('');
  const [businessCardLink, setBusinessCardLink] = useState('');

  // Estado para Spinner / Submissão
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados para o autocomplete de Cidade
  const [city, setCity] = useState('');
  const [allCities, setAllCities] = useState<string[]>([]);

  const router = useRouter();

  // Carrega a lista de cidades do Brasil formatada ao montar a tela
  useEffect(() => {
    try {
      const ufs = estadosCidades.states();
      const listaFormatada: string[] = [];

      ufs.forEach((uf: string) => {
        const cidadesDoEstado = estadosCidades.cities(uf);
        cidadesDoEstado.forEach((nomeCidade: string) => {
          listaFormatada.push(`${nomeCidade} (${uf})`);
        });
      });

      listaFormatada.sort((a, b) => a.localeCompare(b));
      setAllCities(listaFormatada);
    } catch (err) {
      console.error("Erro ao carregar a lista de cidades:", err);
    }
  }, []);

  // Aplica máscara de telefone
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
    if (isSubmitting) return;

    setError('');
    setIsSubmitting(true);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';

    const body = isLogin
      ? { loginIdentifier, password }
      : { name, email, phone, password, city, websiteLink, businessCardLink };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const contentType = res.headers.get('content-type');
      let data: any = {};

      if (contentType && contentType.includes('application/json')) {
        data = await res.json();
      } else {
        if (res.status === 404) {
          throw new Error(`Rota de API '${endpoint}' não encontrada (404). Crie o arquivo da rota no backend.`);
        }
        throw new Error(`O servidor respondeu com um formato inválido (${res.status}).`);
      }

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
          setCity('');
          setWebsiteLink('');
          setBusinessCardLink('');
          alert('Cadastro realizado! Faça login agora.');
        }
      } else {
        setError(data.error || data.message || 'Ocorreu um erro na requisição.');
      }
    } catch (err: any) {
      console.error('Erro de requisição:', err);
      setError(err.message || 'Ocorreu um erro ao tentar conectar com o servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-gray-800 dark:text-gray-100 transition-colors duration-200 relative bg-gray-50 dark:bg-gray-950">

      {/* BOTÃO DE TEMA FIXO NO CANTO SUPERIOR DIREITO */}
      <div className="absolute top-6 right-6 z-10">
        <ThemeToggle />
      </div>

      {/* CARD PRINCIPAL */}
      <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-md border border-gray-200 dark:border-gray-800 w-full max-w-md transition-colors duration-200">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-white">
          {isLogin ? 'Login do Cliente' : 'Crie sua Conta'}
        </h2>

        {error && <p className="text-red-500 dark:text-red-400 text-sm mb-4 text-center font-medium">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <span>Nome Completo</span>
                  <InfoTooltip text="Seu nome profissional ou razão social da imobiliária/empresa que será exibida nos seus anúncios." />
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  className="w-full p-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none transition-colors"
                  placeholder="Seu nome"
                />
              </div>

              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <span>E-mail</span>
                  <InfoTooltip text="E-mail principal para acessar o painel, recuperar senha e receber avisos." />
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full p-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none transition-colors"
                  placeholder="seu@email.com"
                />
              </div>

              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <span>WhatsApp / Telefone</span>
                  <InfoTooltip text="Número de contato principal. Os clientes clicarão no seu anúncio e serão direcionados para este WhatsApp." />
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={handlePhoneChange}
                  maxLength={15}
                  required
                  className="w-full p-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none transition-colors"
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <span>Cidade / UF</span>
                  <InfoTooltip text="Sua cidade principal de atuação para regionalizar e listar seus anúncios no catálogo local." />
                </label>
                <input
                  type="text"
                  list="cities-datalist"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  required
                  className="w-full p-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none transition-colors"
                  placeholder="Digite para buscar sua cidade..."
                />
                <datalist id="cities-datalist">
                  {allCities.map((cidadeCompleta, index) => (
                    <option key={index} value={cidadeCompleta} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <span>Link do Seu Site</span>
                  <InfoTooltip text="(Opcional) Link direto para o seu portal ou site próprio de vendas/produtos." />
                </label>
                <input
                  type="url"
                  value={websiteLink}
                  onChange={e => setWebsiteLink(e.target.value)}
                  placeholder="https://seusite.com.br"
                  className="w-full p-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  <span>Link do Cartão de Visitas Virtual</span>
                  <InfoTooltip text="(Opcional) Link interativo com suas redes e dados (ex: Linktree, vCard ou cartão digital)." />
                </label>
                <input
                  type="url"
                  value={businessCardLink}
                  onChange={e => setBusinessCardLink(e.target.value)}
                  className="w-full p-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none transition-colors"
                  placeholder="https://meucartao.com/seu-perfil"
                />
              </div>
            </>
          )}

          {isLogin && (
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                <span>E-mail ou Telefone</span>
                <InfoTooltip text="Digite o e-mail ou o número do seu WhatsApp cadastrado durante a criação da conta." />
              </label>
              <input
                type="text"
                value={loginIdentifier}
                onChange={e => setLoginIdentifier(e.target.value)}
                required
                className="w-full p-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none transition-colors"
                placeholder="Digite seu e-mail ou nº de telefone"
              />
            </div>
          )}

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <span>Senha</span>
              <InfoTooltip text="Sua senha secreta de acesso individual ao painel administrativo de anúncios." />
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full p-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 dark:bg-blue-500 text-white p-2.5 rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition shadow-sm mt-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting && (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {isSubmitting
              ? (isLogin ? 'Entrando...' : 'Cadastrando...')
              : (isLogin ? 'Entrar' : 'Cadastrar')
            }
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            type="button"
            className="text-blue-600 dark:text-blue-400 font-medium hover:underline cursor-pointer"
          >
            {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem uma conta? Conecte-se'}
          </button>
        </p>
      </div>
    </div>
  );
}