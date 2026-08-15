import { useSyncExternalStore } from 'react';
import { app } from './app';

/**
 * Which self-directed tool is open (§Phase2). Tools are full-screen views — like
 * the session — surfaced from Home / Library, NOT a bottom-nav tab. `openTool`
 * selects the tool and switches the top-level view; the history mirror
 * (nav/history) turns that into a Back-able entry.
 */
export type ToolId = 'timer' | 'breathe';

let which: ToolId = 'timer';
const listeners = new Set<() => void>();

export const tool = {
  get which() {
    return which;
  },
  set(w: ToolId) {
    if (w === which) return;
    which = w;
    listeners.forEach((l) => l());
  },
};

/** Open a tool as a full-screen view (a forward navigation). */
export function openTool(w: ToolId) {
  tool.set(w);
  app.setView('tool');
}

export function useToolId(): ToolId {
  return useSyncExternalStore(
    (l) => (listeners.add(l), () => listeners.delete(l)),
    () => which,
    () => which,
  );
}
