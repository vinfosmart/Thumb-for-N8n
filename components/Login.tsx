
import React from 'react';
import { signInWithGoogle } from '../services/supabaseService';

const Login: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4 text-center">
      <div className="max-w-md w-full">
        <div className="flex items-center justify-center gap-4 mb-8">
            <svg className="w-12 h-12 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            <h1 className="text-4xl font-bold tracking-tight">
                Gerador de Thumbnails IA
            </h1>
        </div>
        
        <div className="bg-gray-800 p-8 rounded-2xl shadow-xl">
            <h2 className="text-2xl font-semibold mb-2">Bem-vindo!</h2>
            <p className="text-gray-400 mb-6">
                Faça login para salvar suas chaves de API, configurações e histórico de imagens de forma segura.
            </p>
            <button
                onClick={signInWithGoogle}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-3 transition-colors duration-200"
            >
                <svg className="w-5 h-5" viewBox="0 0 48 48" >
                    <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.519-3.487-11.187-8.264l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C43.021,36.241,44,30.493,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                </svg>
                Entrar com o Google
            </button>
        </div>
        <p className="text-xs text-gray-500 mt-8">Ao fazer login, você concorda em armazenar suas configurações e histórico em nosso banco de dados seguro.</p>
      </div>
    </div>
  );
};

export default Login;
