import { createClient, Session, User } from '@supabase/supabase-js';
import { ApiConfig, HistoryItem } from '../types';

// IMPORTANT: Replace with your actual Supabase Project URL and Anon Key
const supabaseUrl = 'https://goywroslhhuowufplord.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdveXdyb3NsaGh1b3d1ZnBsb3JkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwMDE0NzAsImV4cCI6MjA3NDU3NzQ3MH0.1DSO-mByuIKydvoUAfv8JZ1qoy0aOa7TQfRRais70cA';

// Check if the placeholder values have been replaced
export const isSupabaseConfigured = !supabaseUrl.includes('COLE_SUA_PROJECT_URL_AQUI') && !supabaseAnonKey.includes('COLE_SUA_ANON_KEY_AQUI');

// Conditionally create the client to avoid crashing the app
export const supabase = isSupabaseConfigured
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

// --- Authentication ---

export const signInWithGoogle = async () => {
  if (!supabase) return;
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin,
    },
  });
  if (error) {
    console.error('Erro no login com Google:', error);
  }
};

export const signOut = async () => {
  if (!supabase) return;
  await supabase.auth.signOut();
};

export const getSession = async (): Promise<Session | null> => {
    if (!supabase) return null;
    const { data } = await supabase.auth.getSession();
    return data.session;
};

export const getUser = async (): Promise<User | null> => {
    if (!supabase) return null;
    const { data } = await supabase.auth.getUser();
    return data.user;
}

// --- API Configs ---

export const getApiConfig = async (): Promise<ApiConfig | null> => {
    const user = await getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('api_configs')
        .select('config')
        .eq('user_id', user.id)
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Erro ao buscar config:', error);
        return null;
    }
    return data ? data.config as ApiConfig : null;
};

export const saveApiConfig = async (config: ApiConfig): Promise<void> => {
    const user = await getUser();
    if (!user) return;

    const { error } = await supabase
        .from('api_configs')
        .upsert({ user_id: user.id, config: config }, { onConflict: 'user_id' });
    
    if (error) {
        console.error('Erro ao salvar config:', error);
    }
};

// --- History ---

export const getHistory = async (): Promise<HistoryItem[] | null> => {
    const user = await getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
    
    if (error) {
        console.error('Erro ao buscar histórico:', error);
        return null;
    }
    return data.map(item => ({...item, created_at: item.created_at}));
};

export const addHistoryItem = async (item: { title: string, imageUrl: string }): Promise<HistoryItem | null> => {
    const user = await getUser();
    if (!user) return null;

    const { data, error } = await supabase
        .from('history')
        .insert({ ...item, user_id: user.id })
        .select()
        .single();

    if (error) {
        console.error('Erro ao adicionar item ao histórico:', error);
        return null;
    }
    return {...data, created_at: data.created_at};
};

export const clearHistory = async (): Promise<void> => {
    const user = await getUser();
    if (!user) return;

    const { error } = await supabase
        .from('history')
        .delete()
        .eq('user_id', user.id);
    
    if (error) {
        console.error('Erro ao limpar histórico:', error);
    }
};