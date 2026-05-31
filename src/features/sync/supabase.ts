import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { env } from '@/lib/env';

/**
 * Lazy Supabase client. Returns `null` when env vars are missing so the rest
 * of the app can run fully offline without crashing. Real network calls only
 * happen when the user has provided credentials.
 */

let cached: SupabaseClient | null | undefined;

export function getSupabase(): SupabaseClient | null {
  if (cached !== undefined) return cached;
  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    cached = null;
    return cached;
  }
  cached = createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

export function isSyncConfigured(): boolean {
  return getSupabase() !== null;
}
