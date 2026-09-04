import { createClient } from '@supabase/supabase-js';

// Retrieve optional Supabase env variables if configured
const metaEnv = (import.meta as any).env || {};
const supabaseUrl =
  metaEnv.VITE_SUPABASE_URL ||
  metaEnv.NEXT_PUBLIC_SUPABASE_URL ||
  'https://iejycnfqtvxjbdtuhelo.supabase.co';

const supabaseAnonKey =
  metaEnv.VITE_SUPABASE_ANON_KEY ||
  metaEnv.VITE_SUPABASE_PUBLISHABLE_KEY ||
  metaEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_SJW6s5-4GD0DRvCblSarGA_M2_rYbLB';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

/**
 * Checks connectivity to the Supabase backend.
 */
export async function testSupabaseConnection(): Promise<{ ok: boolean; message: string }> {
  if (!supabase) {
    return { ok: false, message: 'Supabase client is not initialized.' };
  }
  try {
    const { error } = await supabase.from('borrowers').select('id', { count: 'exact', head: true });
    if (error) {
      return { ok: false, message: error.message };
    }
    return { ok: true, message: 'Connected to Supabase successfully.' };
  } catch (err: any) {
    return { ok: false, message: err?.message || 'Network error connecting to Supabase.' };
  }
}

