/**
 * Daily reminders (§task4/5) — three personalized notifications a day, delivered
 * on-device so they fire even when the app is fully closed. Native only: the
 * Capacitor Local Notifications plugin is a no-op on the web, which also enforces
 * "the user must have installed the app on mobile" for free.
 *
 * The user's first name is baked into each message at schedule time (§task5). We
 * re-schedule on every login / app start, so a name change never leaves a stale
 * greeting and the set never duplicates (fixed ids replace in place).
 */
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

/** "Viivek Mehata" → "Viivek". Empty when there's no name (guest). */
const firstNameOf = (name: string) => name.trim().split(/\s+/)[0] || '';

/** The three daily reminders. Times are the device's local time. `id` is stable so
 *  a re-schedule replaces rather than stacks. Only slots 1 & 3 greet by name. */
type Slot = { id: number; hour: number; minute: number; body: (name: string) => string };
const SLOTS: Slot[] = [
  {
    id: 1,
    hour: 8,
    minute: 0,
    body: (n) => `Ready to start your day${n ? `, ${n}` : ''}? 10 minutes of peaceful meditation can set the tone for the day.`,
  },
  {
    id: 2,
    hour: 13,
    minute: 0,
    body: () => `Rushing through a busy day? Make sure to calm down, breathe in, and relax for 5 minutes.`,
  },
  {
    id: 3,
    hour: 21,
    minute: 0,
    body: (n) => `Time to wind down the day and come home to yourself${n ? `, ${n}` : ''}.`,
  },
];

/** Exposed for the self-check below and any future preview. */
export function buildBody(slotId: number, name: string): string {
  const slot = SLOTS.find((s) => s.id === slotId);
  return slot ? slot.body(firstNameOf(name)) : '';
}

export const notifications = {
  /** Native install only — the web build never schedules (also satisfies the
   *  "installed on mobile" condition, §task5). */
  supported: () => Capacitor.isNativePlatform(),

  async permitted(): Promise<boolean> {
    if (!notifications.supported()) return false;
    const { display } = await LocalNotifications.checkPermissions();
    return display === 'granted';
  },

  /** Ask once (on login, §task5). No-op if already decided — the OS won't re-prompt. */
  async requestPermission(): Promise<boolean> {
    if (!notifications.supported()) return false;
    const { display } = await LocalNotifications.requestPermissions();
    return display === 'granted';
  },

  /** (Re)schedule the three personalized daily reminders. Cancels the prior set
   *  first so a name change / re-login never duplicates. */
  async schedule(name: string): Promise<void> {
    if (!notifications.supported()) return;
    await LocalNotifications.cancel({ notifications: SLOTS.map((s) => ({ id: s.id })) });
    await LocalNotifications.schedule({
      notifications: SLOTS.map((s) => ({
        id: s.id,
        title: 'Come Home',
        body: s.body(firstNameOf(name)),
        // `on: { hour, minute }` with no date fields repeats daily at that time.
        schedule: { on: { hour: s.hour, minute: s.minute }, allowWhileIdle: true },
      })),
    });
  },

  /** Login / app-start entry (§task5): request permission if needed, then schedule. */
  async sync(name: string): Promise<void> {
    if (!notifications.supported()) return;
    const ok = (await notifications.permitted()) || (await notifications.requestPermission());
    if (ok) await notifications.schedule(name);
  },
};
