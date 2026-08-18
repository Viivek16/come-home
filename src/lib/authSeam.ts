import { getAuthUser, signInWithGoogle, signOut } from './auth';

/**
 * Auth seam (§0, §8). Now backed by real Google sign-in (see lib/auth.ts). Returns
 * a local guest until the user signs in; the shape is unchanged so any older caller
 * still works. New code should prefer useAuth()/signInWithGoogle() directly.
 */
export type User = { id: string; name: string; isGuest: boolean };

export function getUser(): User {
  const u = getAuthUser();
  return { id: u.id, name: u.name, isGuest: u.isGuest };
}

export function signIn(): Promise<void> {
  return signInWithGoogle();
}

export { signOut };
