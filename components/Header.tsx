
import React from 'react';
import { User } from '@supabase/supabase-js';
import { signOut } from '../services/supabaseService';

interface HeaderProps {
    user: User | null;
}

const Header: React.FC<HeaderProps> = ({ user }) => {
  return (
    <header className="bg-gray-800 shadow-md p-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Gerador de Thumbnails para Automação n8n
        </h1>
      </div>
      {user && (
        <div className="flex items-center gap-4">
            <span className="text-sm text-gray-300 hidden sm:block">{user.email}</span>
            <button
                onClick={signOut}
                className="bg-red-600 hover:bg-red-500 text-white font-semibold py-2 px-4 rounded-lg text-sm"
            >
                Sair
            </button>
        </div>
      )}
    </header>
  );
};

export default Header;
