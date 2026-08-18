import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

/**
 * Come Home is local-first: it must still run with no backend configured. So we
 * don't throw when env is missing — we expose `isSupabaseConfigured` instead, and
 * the auth UI hides itself when it's false. The client is created either way so
 * imports never crash.
 */
export const isSupabaseConfigured = Boolean(url && anonKey);
if (!isSupabaseConfigured) {
  console.warn('Supabase env missing — running local-only; Google sign-in is hidden.');
}

// pkce: the SPA/mobile-safe OAuth flow. detectSessionInUrl exchanges the ?code=…
// that Google's redirect leaves in the URL, then fires onAuthStateChange.
export const supabase = createClient(url ?? '', anonKey ?? '', {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
});
