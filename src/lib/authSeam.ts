import { loadPrefs } from './storage';

/**
 * Auth seam (§0, §8). Returns a local guest now; Google login drops in behind the
 * same shape later (the existing Supabase lib/auth stays as the wiring for that).
 * Screens depend on this shape only — never on a signed-in account.
 */
export type User = { id: string; name: string; isGuest: boolean };

export function getUser(): User {
  return { id: 'local-guest', name: loadPrefs().name, isGuest: true };
}

export async function signIn(): Promise<User> {
  return getUser(); // Google later
}

export async function signOut(): Promise<void> {
  /* no-op for local guest */
}
