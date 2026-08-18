/**
 * Gentle daily reminder (§Phase G) — opt-in, on-device, no backend.
 *
 * Uses the browser's local Notification API. It arms a self-correcting timer for
 * the next occurrence of the chosen time and re-arms itself after each fire and on
 * every app open, so drift never accumulates.
 *
 * ponytail: this fires while the app/tab is alive (foreground or backgrounded).
 * A notification while the PWA is fully CLOSED needs a service-worker push or the
 * Notification Triggers API + a backend — deliberately out of scope (no backend).
 * The wiring is otherwise complete, so that upgrade is additive.
 */

const TITLE = 'A moment for you?';
const BODY = 'Whenever you’re ready — a few quiet breaths are enough.';

let timer: ReturnType<typeof setTimeout> | null = null;

function msUntilNext(time: string): number {
  const [h, m] = time.split(':').map(Number);
  const now = new Date();
  const next = new Date();
  next.setHours(h || 0, m || 0, 0, 0);
  if (next.getTime() <= now.getTime()) next.setDate(next.getDate() + 1);
  return next.getTime() - now.getTime();
}

function fire() {
  try {
    if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
      new Notification(TITLE, { body: BODY, icon: '/pwa-192x192.png', tag: 'come-home-reminder' });
    }
  } catch {
    /* a blocked or unavailable Notification never breaks the app */
  }
}

export const reminders = {
  supported(): boolean {
    return typeof Notification !== 'undefined';
  },
  permission(): NotificationPermission {
    return typeof Notification !== 'undefined' ? Notification.permission : 'denied';
  },

  /** Ask once, from a user gesture. Returns whether notifications are allowed. */
  async requestPermission(): Promise<boolean> {
    if (typeof Notification === 'undefined') return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;
    try {
      return (await Notification.requestPermission()) === 'granted';
    } catch {
      return false;
    }
  },

  cancel() {
    if (timer !== null) {
      clearTimeout(timer);
      timer = null;
    }
  },

  arm(time: string) {
    this.cancel();
    if (typeof window === 'undefined') return;
    const tick = () => {
      fire();
      // Re-compute from the wall clock so the next fire lands on time, not drift.
      timer = setTimeout(tick, msUntilNext(time));
    };
    timer = setTimeout(tick, msUntilNext(time));
  },

  /** Re-arm (or clear) from persisted prefs — called on app start and on change. */
  sync(enabled: boolean, time: string) {
    if (enabled && this.permission() === 'granted') this.arm(time);
    else this.cancel();
  },
};
