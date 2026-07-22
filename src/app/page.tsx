'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// cspell:disable-next-line
import estadosCidades from 'estados-cidades';

// COMPONENTE DE TOOLTIP DE INFORMAÇÃO
const InfoTooltip = ({ text }: { text: string }) => {
  return (
    <div className="group relative inline-flex items-center ml-1">
      <span className="w-4 h-4 rounded-full bg-gray-200 hover:bg-blue-600 hover:text-white text-gray-600 font-bold text-[11px] flex items-center justify-center transition-colors cursor-help select-none">
        ?
      </span>
      {/* Balão de Informação */}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex flex-col items-center z-50 w-52 pointer-events-none animate-fadeIn">
        <span className="relative z-10 p-2 text-xs leading-relaxed text-white bg-gray-900/95 rounded-lg shadow-xl text-center font-normal">
          {text}
        </span>
        <div className="w-2 h-2 -mt-1 rotate-45 bg-gray-900/95"></div>
      </div>
    </div>
  );
};

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loginIdentifier, setLoginIdentifier] = useState(''); // E-mail ou Telefone
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [websiteLink, setWebsiteLink] = useState(''); // Estado para o Link do Site
  const [businessCardLink, setBusinessCardLink] = useState('');

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

    // Se for registro, enviamos também os campos "city" e "websiteLink"
    const body = isLogin
      ? { loginIdentifier, password }
      : { name, email, phone, password, city, websiteLink, businessCardLink };

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
        setCity('');
        setWebsiteLink('');
        setBusinessCardLink('');
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
                <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                  <span>Nome Completo</span>
                  <InfoTooltip text="Seu nome profissional ou razão social da imobiliária/empresa que será exibida nos seus anúncios." />
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm focus:outline-none"
                  placeholder="Seu nome"
                />
              </div>

              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                  <span>E-mail</span>
                  <InfoTooltip text="E-mail principal para acessar o painel, recuperar senha e receber avisos." />
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm focus:outline-none"
                  placeholder="seu@email.com"
                />
              </div>

              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                  <span>WhatsApp / Telefone</span>
                  <InfoTooltip text="Número de contato principal. Os clientes clicarão no seu anúncio e serão direcionados para este WhatsApp." />
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={handlePhoneChange}
                  maxLength={15}
                  required
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm focus:outline-none"
                  placeholder="(00) 00000-0000"
                />
              </div>

              {/* Campo de Autocomplete de Cidades */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                  <span>Cidade / UF</span>
                  <InfoTooltip text="Sua cidade principal de atuação para regionalizar e listar seus anúncios no catálogo local." />
                </label>
                <input
                  type="text"
                  list="cities-datalist"
                  value={city}
                  onChange={e => setCity(e.target.value)}
                  required
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm focus:outline-none"
                  placeholder="Digite para buscar sua cidade..."
                />
                <datalist id="cities-datalist">
                  {allCities.map((cidadeCompleta, index) => (
                    <option key={index} value={cidadeCompleta} />
                  ))}
                </datalist>
              </div>

              {/* Link do Seu Site */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                  <span>Link do Seu Site</span>
                  <InfoTooltip text="(Opcional) Link direto para o seu portal ou site próprio de vendas/produtos." />
                </label>
                <input
                  type="url"
                  value={websiteLink}
                  onChange={e => setWebsiteLink(e.target.value)}
                  placeholder="https://seusite.com.br"
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                  <span>Link do Cartão de Visitas Virtual</span>
                  <InfoTooltip text="(Opcional) Link interativo com suas redes e dados (ex: Linktree, vCard ou cartão digital)." />
                </label>
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
              <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                <span>E-mail ou Telefone</span>
                <InfoTooltip text="Digite o e-mail ou o número do seu WhatsApp cadastrado durante a criação da conta." />
              </label>
              <input
                type="text"
                value={loginIdentifier}
                onChange={e => setLoginIdentifier(e.target.value)}
                required
                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm focus:outline-none"
                placeholder="Digite seu e-mail ou nº de telefone"
              />
            </div>
          )}

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
              <span>Senha</span>
              <InfoTooltip text="Sua senha secreta de acesso individual ao painel administrativo de anúncios." />
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-sm focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2.5 rounded-lg font-medium hover:bg-blue-700 transition shadow-sm mt-2"
          >
            {isLogin ? 'Entrar' : 'Cadastrar'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-blue-600 font-medium hover:underline"
          >
            {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem uma conta? Conecte-se'}
          </button>
        </p>
      </div>
    </div>
  );
}