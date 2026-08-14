import { useSyncExternalStore } from 'react';

/**
 * Hub tab, lifted out of <Hub> local state so the back-stack (store/nav) can read
 * and restore it. Tab switches are forward navigations; back returns to Home.
 */
export type TabId = 'home' | 'support' | 'sleep' | 'library' | 'profile';

let tab: TabId = 'home';
const listeners = new Set<() => void>();

export const hub = {
  get tab() {
    return tab;
  },
  setTab(t: TabId) {
    if (t === tab) return;
    tab = t;
    listeners.forEach((l) => l());
  },
};

export function useHubTab(): TabId {
  return useSyncExternalStore(
    (l) => (listeners.add(l), () => listeners.delete(l)),
    () => tab,
    () => tab,
  );
}
