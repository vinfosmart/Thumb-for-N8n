import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ApiConfig, HistoryItem } from '../types';

/**
 * Creates a new Supabase client instance with user-provided credentials.
 * @param supabaseUrl - The project URL from the user's Supabase dashboard.
 * @param supabaseAnonKey - The anon public key from the user's Supabase dashboard.
 * @returns A SupabaseClient instance.
 */
export const createSupabaseClient = (supabaseUrl: string, supabaseAnonKey: string): SupabaseClient => {
    return createClient(supabaseUrl, supabaseAnonKey);
};

// --- API Configs ---
// Assumes a single configuration row per project.

export const getApiConfig = async (client: SupabaseClient): Promise<ApiConfig | null> => {
    if (!client) return null;

    const { data, error } = await client
        .from('api_configs')
        .select('config')
        .limit(1)
        .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('Erro ao buscar config:', error.message);
        return null;
    }
    return data ? data.config as ApiConfig : null;
};

export const saveApiConfig = async (client: SupabaseClient, config: ApiConfig): Promise<void> => {
    if (!client) return;

    // We use a fixed ID of 1 to always update the same single row.
    const { error } = await client
        .from('api_configs')
        .upsert({ id: 1, config: config });
    
    if (error) {
        console.error('Erro ao salvar config:', error.message);
    }
};

// --- History ---

export const getHistory = async (client: SupabaseClient): Promise<HistoryItem[] | null> => {
    if (!client) return null;

    // FIX: Use correct snake_case column names from the database in the select query.
    const { data, error } = await client
        .from('history')
        .select('id, title, subtitle, image_prompt, image_url, created_at')
        .order('created_at', { ascending: false })
        .limit(20);
    
    if (error) {
        console.error('Erro ao buscar histórico:', error.message);
        return null;
    }
    // FIX: Manually map snake_case properties from Supabase to camelCase properties in HistoryItem.
    // The Supabase client does not automatically perform this mapping without generated types,
    // which caused a type mismatch.
    if (!data) {
        return [];
    }
    return data.map((item: any) => ({
        id: item.id,
        title: item.title,
        subtitle: item.subtitle,
        imagePrompt: item.image_prompt,
        imageUrl: item.image_url,
        created_at: item.created_at,
    }));
};

export const addHistoryItem = async (client: SupabaseClient, item: Omit<HistoryItem, 'id' | 'created_at'>): Promise<HistoryItem | null> => {
    if (!client) return null;

    // The client automatically maps camelCase keys from the 'item' object to snake_case columns.
    // The select string needs to use the actual database column names.
    const { data, error } = await client
        .from('history')
        .insert({
            title: item.title,
            subtitle: item.subtitle,
            image_prompt: item.imagePrompt,
            image_url: item.imageUrl,
        })
        .select('id, title, subtitle, image_prompt, image_url, created_at')
        .single();

    if (error) {
        console.error('Erro ao adicionar item ao histórico:', error.message);
        return null;
    }
    
    // FIX: Manually map snake_case properties from Supabase to camelCase properties in HistoryItem.
    // The direct cast was failing because the property names did not match the HistoryItem interface.
    if (!data) {
        return null;
    }
    const result: HistoryItem = {
        id: data.id,
        title: data.title,
        subtitle: data.subtitle,
        imagePrompt: (data as any).image_prompt,
        imageUrl: (data as any).image_url,
        created_at: data.created_at,
    };
    return result;
};

export const clearHistory = async (client: SupabaseClient): Promise<void> => {
    if (!client) return;
    
    // Deletes all rows in the history table.
    const { error } = await client
        .from('history')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Dummy condition to delete all
    
    if (error) {
        console.error('Erro ao limpar histórico:', error.message);
    }
};