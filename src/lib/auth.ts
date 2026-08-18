import { useSyncExternalStore } from 'react';
import { Capacitor } from '@capacitor/core';
import type { Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from './supabase';
import { prefsStore } from '../store/prefs';
import { app } from '../store/app';
import { markFirstRunDone } from './storage';

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
    routeInIfSignedIn();
    recompute(false);
  });
  supabase.auth.onAuthStateChange(async (_event, s) => {
    session = s;
    profile = s ? profile : null;
    if (s) await loadProfile(s.user.id);
    routeInIfSignedIn();
    recompute(false);
  });
}
start();

// A signed-in user must never be stranded on the login screen (e.g. after the
// Google redirect returns, or if a persisted session outlived the first-run flag).
function routeInIfSignedIn() {
  if (session && app.view === 'first-run') {
    markFirstRunDone();
    app.setView('hub');
  }
}

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

/**
 * Manual sign-up (email + password). The name is stored in user metadata so the
 * handle_new_user trigger writes it into profiles.display_name. Returns
 * needsConfirmation=true when the project has email confirmation on (no session
 * yet) — the caller then asks the user to confirm before logging in.
 */
export async function signUpWithEmail(input: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}): Promise<{ needsConfirmation: boolean }> {
  const fullName = [input.firstName, input.lastName].map((s) => s.trim()).filter(Boolean).join(' ');
  const { data, error } = await supabase.auth.signUp({
    email: input.email.trim(),
    password: input.password,
    options: { data: { full_name: fullName, first_name: input.firstName.trim(), last_name: input.lastName.trim() } },
  });
  if (error) throw error;
  return { needsConfirmation: !data.session };
}

/** Manual log-in (email + password). onAuthStateChange handles the session. */
export async function signInWithEmail(email: string, password: string): Promise<void> {
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
  if (error) throw error;
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
