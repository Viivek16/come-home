import { createClient } from '@supabase/supabase-js';

/**
 * Public client credentials. The anon key is designed to ship in the browser bundle
 * — Row Level Security is what protects data, not secrecy of this key. We read env
 * first (so a different deploy can point elsewhere) but fall back to this project's
 * own public values, so the app works even on a host with no env vars configured
 * (e.g. Vercel without VITE_SUPABASE_* set). This must never throw at import — a
 * throw here blanks the whole app.
 */
const FALLBACK_URL = 'https://ydyklmqkddcxrcdzvjrs.supabase.co';
const FALLBACK_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkeWtsbXFrZGRjeHJjZHp2anJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2MTA2MDgsImV4cCI6MjEwMjE4NjYwOH0.JDiczjvILYgbxuVjGCJmP7NfaZDV_FaQWFj1EiEH9KQ';

const url = import.meta.env.VITE_SUPABASE_URL || FALLBACK_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || FALLBACK_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && anonKey);

// pkce: the SPA/mobile-safe OAuth flow. detectSessionInUrl exchanges the ?code=…
// that Google's redirect leaves in the URL, then fires onAuthStateChange.
export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
});
