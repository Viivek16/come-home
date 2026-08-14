import { useEffect, useRef } from 'react';
import { app, useView } from '../store/app';
import { hub, useHubTab, type TabId } from '../store/hub';
import { session } from '../store/session';
import { audioControls } from '../audio/audioStore';
import { firstRunDone } from '../lib/storage';

/**
 * Back-button routing (§ requirement). The app is state-driven, so nothing was
 * ever pushed to browser/OS history — every Back exited straight to the browser.
 *
 * This mirrors the app's navigation onto the History API so hardware/browser Back
 * moves WITHIN the app, and only a Back from Home exits it:
 *  - Home tab            → Back exits the app.
 *  - Any other hub tab   → Back returns to Home.
 *  - A session (any step)→ one history level; Back leaves the session → hub
 *    (audio stopped, session reset). In-session forward steps don't add levels.
 *
 * Works the same on the web and inside Capacitor's Android WebView (the hardware
 * Back button drives window history there too).
 */
type Loc = string; // 'first-run' | 'session' | `hub:${TabId}`

const locOf = (view: string, tab: TabId): Loc =>
  view === 'session' ? 'session' : view === 'first-run' ? 'first-run' : `hub:${tab}`;

// The loc a popstate is currently restoring — so the mirror effect below knows
// that loc change was a Back (don't re-push) rather than a forward navigation.
let poppingTo: Loc | null = null;

/** Restore app state for a history entry. Returns the loc it actually landed on. */
function applyLoc(loc: Loc): Loc {
  if (loc === 'first-run') {
    // Never drop a returning user back into onboarding.
    if (firstRunDone()) {
      app.setView('hub');
      hub.setTab('home');
      return 'hub:home';
    }
    app.setView('first-run');
    return 'first-run';
  }
  if (loc === 'session') {
    app.setView('session');
    return 'session';
  }
  const tab = loc.slice(4) as TabId;
  if (app.view === 'session') {
    audioControls.stop();
    session.reset();
  }
  app.setView('hub');
  hub.setTab(tab);
  return `hub:${tab}`;
}

/** Go back one level (used by in-app exit affordances so the stack stays synced). */
export const nav = {
  back() {
    if (typeof history !== 'undefined') history.back();
  },
};

/** Mount once (in <App>) to wire the app's navigation to browser/OS history. */
export function useAppHistory(): void {
  const view = useView();
  const tab = useHubTab();
  const loc = locOf(view, tab);
  const curRef = useRef<Loc | null>(null);

  // Seed a root entry so the first Back lands here, and the one past it exits.
  useEffect(() => {
    curRef.current = loc;
    try {
      history.replaceState({ appNav: true, loc, root: true }, '');
    } catch {
      /* history unavailable — Back handling degrades to the browser default */
    }
    const onPop = (e: PopStateEvent) => {
      const st = e.state as { appNav?: boolean; loc?: Loc } | null;
      if (!st?.appNav || !st.loc) return; // backed past root → let the app exit
      poppingTo = applyLoc(st.loc);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Forward navigations push a new history level; the loc change a Back caused
  // (poppingTo) is consumed here without pushing.
  useEffect(() => {
    if (curRef.current === loc) return;
    const wasPop = poppingTo === loc;
    poppingTo = null;
    curRef.current = loc;
    if (wasPop) return;
    try {
      history.pushState({ appNav: true, loc }, '');
    } catch {
      /* ignore */
    }
  }, [loc]);
}
