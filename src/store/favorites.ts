import { useSyncExternalStore } from 'react';
import { loadFavorites, saveFavorites } from '../lib/storage';

/**
 * Saved items (§Phase3). A set of prefixed keys — `lib:<id>` for library items,
 * `path:<id>` for session paths — persisted locally. Reference changes on every
 * toggle so useSyncExternalStore re-renders subscribers.
 */
let favs: ReadonlySet<string> = new Set(loadFavorites());
const listeners = new Set<() => void>();

export const favorites = {
  has: (key: string) => favs.has(key),
  toggle(key: string) {
    const next = new Set(favs);
    next.has(key) ? next.delete(key) : next.add(key);
    favs = next;
    saveFavorites([...next]);
    listeners.forEach((l) => l());
  },
};

/** Reactive set of saved keys. Use `.has(key)` in components. */
export function useFavorites(): ReadonlySet<string> {
  return useSyncExternalStore(
    (l) => (listeners.add(l), () => listeners.delete(l)),
    () => favs,
    () => favs,
  );
}
