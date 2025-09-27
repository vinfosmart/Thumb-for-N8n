import React from 'react';

const SupabaseSetupMessage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 text-center">
      <div className="max-w-2xl w-full bg-gray-800 p-8 rounded-2xl shadow-xl border-2 border-red-500">
        <h1 className="text-3xl font-bold text-red-400 mb-4">Ação Necessária: Configurar Supabase</h1>
        <p className="text-gray-300 mb-6">
          A aplicação precisa se conectar a um banco de dados Supabase para funcionar, mas as credenciais não foram encontradas.
        </p>
        <div className="text-left bg-gray-900 p-6 rounded-lg font-mono text-sm space-y-4">
          <p className="text-gray-400">// Siga estes passos:</p>
          <p>1. Abra o arquivo: <code className="text-yellow-400 bg-gray-700 px-2 py-1 rounded">services/supabaseService.ts</code></p>
          <p>2. Encontre as seguintes linhas de código:</p>
          <pre className="text-green-300 bg-gray-700 p-2 rounded-md overflow-x-auto">
            <code>
              const supabaseUrl = 'COLE_SUA_PROJECT_URL_AQUI';<br />
              const supabaseAnonKey = 'COLE_SUA_ANON_KEY_AQUI';
            </code>
          </pre>
          <p>3. Substitua os valores de placeholder pelas suas credenciais do projeto Supabase.</p>
          <p>4. Salve o arquivo. A aplicação será recarregada automaticamente.</p>
        </div>
        <p className="text-xs text-gray-500 mt-8">
          Se você ainda não tem um projeto Supabase, pode criar um gratuitamente em <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline">supabase.com</a>.
        </p>
      </div>
    </div>
  );
};

export default SupabaseSetupMessage;