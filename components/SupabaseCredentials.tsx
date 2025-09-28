import React, { useState, useEffect } from 'react';

interface SupabaseCredentialsProps {
  onConnect: (url: string, key: string) => void;
}

const SupabaseCredentials: React.FC<SupabaseCredentialsProps> = ({ onConnect }) => {
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [copySuccess, setCopySuccess] = useState('');

  // Auto-fill from localStorage on component mount
  useEffect(() => {
    try {
      const storedUrl = localStorage.getItem('supabaseUrl');
      const storedKey = localStorage.getItem('supabaseAnonKey');
      if (storedUrl) setUrl(storedUrl);
      if (storedKey) setKey(storedKey);
    } catch (e) {
      console.error("Failed to read from localStorage", e);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim() && key.trim()) {
      onConnect(url, key);
    }
  };

  const sqlScript = `-- AVISO: Este script é DESTRUTIVO. Ele irá apagar suas tabelas 'api_configs' e 'history' para garantir uma configuração limpa e corrigir erros de estrutura do banco de dados.

-- Apaga as tabelas antigas se elas existirem para recomeçar.
DROP TABLE IF EXISTS public.history;
DROP TABLE IF EXISTS public.api_configs;

-- 1. Cria a tabela para armazenar as configurações de API do usuário
CREATE TABLE public.api_configs (
  id BIGINT PRIMARY KEY, -- Usamos um ID fixo '1' para sempre atualizar a mesma linha
  config JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Cria a tabela para o histórico de gerações (sem a coluna 'user_id')
CREATE TABLE public.history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT,
  image_prompt TEXT,
  image_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Habilita a Segurança em Nível de Linha (RLS) para ambas as tabelas
-- RLS não é estritamente necessária neste modelo (um DB por usuário), mas é uma boa prática de segurança.
ALTER TABLE public.api_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.history ENABLE ROW LEVEL SECURITY;

-- 4. Cria políticas que permitem acesso total, pois a segurança é gerenciada pela chave de API do projeto
CREATE POLICY "Enable all access for authenticated users" ON public.api_configs
FOR ALL
USING (true);

CREATE POLICY "Enable all access for authenticated users" ON public.history
FOR ALL
USING (true);

-- 5. Insere uma linha de configuração padrão com ID fixo '1'
INSERT INTO public.api_configs (id, config) VALUES (1, '{}'::jsonb);
`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlScript).then(() => {
      setCopySuccess('Copiado!');
      setTimeout(() => setCopySuccess(''), 2000);
    }, () => {
      setCopySuccess('Falha ao copiar.');
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4 sm:p-6">
      <div className="w-full max-w-4xl p-8 space-y-10 bg-gray-800 rounded-2xl shadow-lg">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-center text-indigo-400">Bem-vindo ao Gerador de Thumbnails IA!</h1>
          <p className="mt-3 text-center text-gray-300">
            Siga os passos abaixo para conectar seu próprio banco de dados Supabase e começar a criar.
          </p>
        </div>

        <div className="space-y-8">
          <Step number={1} title="Crie seu Projeto no Supabase">
            <p>Se você ainda não tem uma conta, crie uma e inicie um novo projeto. É gratuito para começar.</p>
            <a href="https://supabase.com/dashboard/projects" target="_blank" rel="noopener noreferrer" className="link-button">Ir para o Supabase</a>
          </Step>

          <Step number={2} title="Configure seu Banco de Dados">
            <p>No seu projeto Supabase, vá para o <strong className="text-indigo-300">SQL Editor</strong>, cole o script abaixo e clique em <strong className="text-green-400">"RUN"</strong>. Isso criará as tabelas necessárias para salvar suas configurações e histórico.</p>
             <div className="mt-3 relative">
                <pre className="code-block max-h-40 overflow-auto">{sqlScript}</pre>
                <button onClick={copyToClipboard} className="absolute top-2 right-2 bg-gray-600 hover:bg-gray-500 text-white text-xs font-bold py-1 px-2 rounded">
                  {copySuccess || 'Copiar'}
                </button>
             </div>
             <p className="text-xs text-yellow-400 mt-2">⚠️ <strong className='font-semibold'>OBRIGATÓRIO:</strong> Se você está vendo erros como <code className='text-red-400'>"invalid input syntax for type uuid"</code> ou <code className='text-red-400'>"null value in column user_id"</code>, executar este script é a <strong className='underline'>solução definitiva</strong>. Ele irá apagar seus dados salvos, mas corrigirá a estrutura do banco.</p>
          </Step>

          <Step number={3} title="Encontre suas Chaves de API">
            <p>Vá para <strong className="text-indigo-300">Project Settings {'>'} API</strong>. Você precisará de duas informações:</p>
            <ul className="list-disc list-inside mt-2 text-gray-400">
                <li>A <strong className="text-white">URL</strong> do seu projeto (em Project URL).</li>
                <li>A chave <strong className="text-white">anon public</strong> (em Project API Keys).</li>
            </ul>
          </Step>

          <Step number={4} title="Conecte a Ferramenta">
             <p>Cole as credenciais que você copiou no passo anterior nos campos abaixo para finalizar a configuração.</p>
            <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
              <input type="url" required className="input-field" placeholder="URL do Projeto Supabase" value={url} onChange={(e) => setUrl(e.target.value)} />
              <input type="text" required className="input-field" placeholder="Chave Anon (Pública) do Supabase" value={key} onChange={(e) => setKey(e.target.value)} />
              <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 text-lg">
                Conectar e Começar a Criar
              </button>
            </form>
          </Step>
        </div>
        
        <div className="text-center pt-6 border-t border-gray-700">
            <h3 className="font-semibold text-lg text-gray-200">Próximos Passos</h3>
            <p className="text-gray-400 mt-2 text-sm">Após conectar, clique no ícone de engrenagem (⚙️) no canto superior direito para adicionar suas chaves de API dos geradores de imagem (Google, OpenAI, etc.).</p>
        </div>

      </div>
      <style>{`
        .input-field { width: 100%; background-color: #374151; border: 1px solid #4B5563; color: #F3F4F6; padding: 0.75rem; border-radius: 0.5rem; transition: all 0.2s; }
        .input-field:focus { outline: none; border-color: #818CF8; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.3); }
        .link-button { display: inline-block; margin-top: 0.5rem; background-color: #4f46e5; color: white; padding: 0.5rem 1rem; border-radius: 0.375rem; text-decoration: none; font-weight: 600; transition: background-color 0.2s; }
        .link-button:hover { background-color: #4338ca; }
        .code-block { white-space: pre-wrap; background-color: #111827; padding: 1rem; border-radius: 0.5rem; font-family: monospace; font-size: 0.8rem; color: #d1d5db; word-break: break-all; border: 1px solid #374151; }
      `}</style>
    </div>
  );
};

const Step: React.FC<{ number: number; title: string; children: React.ReactNode }> = ({ number, title, children }) => (
    <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-indigo-500 rounded-full flex items-center justify-center font-bold text-lg text-white">
            {number}
        </div>
        <div className="flex-grow pt-1">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-100">{title}</h2>
            <div className="text-sm sm:text-base text-gray-400 mt-1 space-y-2">{children}</div>
        </div>
    </div>
);


export default SupabaseCredentials;