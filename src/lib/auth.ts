import { useSyncExternalStore } from 'react';
import { Capacitor } from '@capacitor/core';
import type { Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from './supabase';
import { prefsStore } from '../store/prefs';

/**
 * Auth + profile layer. Come Home stays local-first: signing in with Google is
 * optional and additive. When signed out we surface a local guest so every screen
 * keeps working; when signed in we mirror the account's display name into prefs so
 * the rest of the app (which reads prefs.name) needs no changes.
 *
 * Backend: a Postgres trigger (handle_new_user) creates the public.profiles row on
 * signup, so there's no client-side insert on the happy path — we only read/update.
 */

/** The public.profiles row (backend user record). */
export type Profile = {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  email: string | null;
  onboarded: boolean;
};

/** What screens consume — a signed-in account or a local guest. */
export type AuthUser = {
  id: string;
  name: string;
  email: string | null;
  avatarUrl: string | null;
  onboarded: boolean;
  isGuest: boolean;
};

const GUEST: AuthUser = { id: 'local-guest', name: '', email: null, avatarUrl: null, onboarded: true, isGuest: true };

type AuthState = { user: AuthUser; loading: boolean };

let session: Session | null = null;
let profile: Profile | null = null;
// Stable snapshot for useSyncExternalStore — recomputed only on real changes.
let snapshot: AuthState = { user: GUEST, loading: isSupabaseConfigured };

const listeners = new Set<() => void>();

function recompute(loading: boolean) {
  const user: AuthUser = session
    ? {
        id: session.user.id,
        name: profile?.display_name ?? metaName(session) ?? '',
        email: profile?.email ?? session.user.email ?? null,
        avatarUrl: profile?.avatar_url ?? null,
        onboarded: profile?.onboarded ?? false,
        isGuest: false,
      }
    : GUEST;
  snapshot = { user, loading };
  // Bridge the signed-in name into local prefs so existing screens show it.
  if (user.name && user.name !== prefsStore.get().name) prefsStore.setName(user.name);
  listeners.forEach((l) => l());
}

function metaName(s: Session): string | null {
  const m = s.user.user_metadata ?? {};
  return (m.full_name as string) ?? (m.name as string) ?? null;
}

async function loadProfile(userId: string): Promise<void> {
  const { data } = await supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle();
  if (data) {
    profile = data as Profile;
    return;
  }
  // Fallback for accounts created before the signup trigger existed: create the row
  // client-side (RLS allows own insert). New Google signups never hit this.
  const s = session;
  if (!s) return;
  const row = {
    user_id: userId,
    display_name: metaName(s),
    avatar_url: (s.user.user_metadata?.avatar_url as string) ?? null,
    email: s.user.email ?? null,
  };
  const { data: created } = await supabase.from('profiles').insert(row).select('*').maybeSingle();
  profile = (created as Profile) ?? { ...row, onboarded: false };
}

// One-time boot: hydrate the session, then track changes.
let started = false;
function start() {
  if (started) return;
  started = true;
  if (!isSupabaseConfigured) {
    recompute(false);
    return;
  }
  supabase.auth.getSession().then(async ({ data }) => {
    session = data.session;
    if (session) await loadProfile(session.user.id);
    recompute(false);
  });
  supabase.auth.onAuthStateChange(async (_event, s) => {
    session = s;
    profile = s ? profile : null;
    if (s) await loadProfile(s.user.id);
    recompute(false);
  });
}
start();

// ---- actions ----

export async function signInWithGoogle(): Promise<void> {
  if (!isSupabaseConfigured) throw new Error('Backend not configured');
  // Web: full-page redirect back to the app origin. Native (Capacitor) needs a deep
  // link back into the app — see STUBBED.md §Google auth (native seam).
  const redirectTo = Capacitor.isNativePlatform()
    ? 'com.comehome.app://auth-callback'
    : window.location.origin;
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo, queryParams: { prompt: 'select_account' } },
  });
  if (error) throw error;
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

/** Finish onboarding: save the chosen name and flip the flag, server-side. */
export async function completeOnboarding(displayName: string): Promise<void> {
  const s = session;
  if (!s) return;
  const name = displayName.trim() || null;
  const { data } = await supabase
    .from('profiles')
    .update({ display_name: name, onboarded: true })
    .eq('user_id', s.user.id)
    .select('*')
    .maybeSingle();
  if (data) profile = data as Profile;
  else profile = { ...(profile as Profile), display_name: name, onboarded: true };
  recompute(false);
}

// ---- reactive read ----

export function useAuth(): AuthState {
  return useSyncExternalStore(
    (l) => (listeners.add(l), () => listeners.delete(l)),
    () => snapshot,
    () => snapshot,
  );
}

/** Non-reactive snapshot (for the documented authSeam). */
export function getAuthUser(): AuthUser {
  return snapshot.user;
}

/**
 * Legacy Supabase session hook kept for the previous seam's shape. Prefer useAuth().
 */
export function useSession(): { session: Session | null; loading: boolean } {
  const { loading } = useAuth();
  return { session, loading };
}
