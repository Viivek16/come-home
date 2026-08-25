import { useEffect, useState } from 'react';
import { Heart, PenLine } from 'lucide-react';
import Reveal from '../../ui/Reveal';
import ReflectionTrail from '../../journey/ReflectionTrail';
import { openSanctuary } from '../../sanctuary/Sanctuary';
import { openJournal } from '../../journal/Journal';
import { usePrefs, prefsStore } from '../../store/prefs';
import { useAuth, signInWithGoogle, signOut } from '../../lib/auth';
import { isSupabaseConfigured } from '../../lib/supabase';
import GoogleButton from '../../ui/GoogleButton';
import { reminders } from '../../lib/reminders';
import {
  getHistory,
  clearHistory,
  getReflections,
  clearReflections,
  getJournal,
  getPresence,
  type HistoryEntry,
  type FlowVisit,
  type Reflection,
  type JournalEntry,
} from '../../lib/storage';
import { feelingLabel } from '../../data/feelings';
import type { Checkin } from '../../store/session';
import { programme, useProgrammeProgress } from '../../store/programme';
import { PROGRAMMES, type Programme } from '../../data/programmes';

const CHECKIN_PHRASE: Record<Checkin, string> = {
  calmer: 'felt calmer',
  better: 'felt a little better',
  same: 'stayed with it',
  struggling: 'were still struggling',
  'prefer-not': 'kept it private',
};

// How a Support-flow visit reads back in the trail (§Phase C). None reads as failure.
const FLOW_LEFT: Record<FlowVisit['left'], string> = {
  lighter: 'left a little lighter',
  'a-little': 'felt a little ease',
  'still-heavy': 'stayed with what was heavy',
};

/** §6 Profile — "Your journey" (§Phase F). A gentle, guilt-free reflection space:
 *  resumable programmes, a soft mood picture + practice calendar, private
 *  journaling, and the moments you've gathered. No streaks, no counts, no pressure. */
export default function ProfileTab() {
  const prefs = usePrefs();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [journal, setJournal] = useState<JournalEntry[]>([]);
  const [presence, setPresence] = useState<string[]>([]);
  const [confirmClear, setConfirmClear] = useState(false);
  const [reminderDenied, setReminderDenied] = useState(false);
  useProgrammeProgress();

  // Opt-in reminder — ask for permission only when turning it on (a user gesture).
  const toggleReminder = async () => {
    if (!prefs.reminder.enabled) {
      const ok = await reminders.requestPermission();
      if (!ok) {
        setReminderDenied(true);
        return;
      }
      setReminderDenied(false);
      prefsStore.setReminder({ enabled: true, time: prefs.reminder.time });
    } else {
      prefsStore.setReminder({ enabled: false, time: prefs.reminder.time });
    }
  };
  const setReminderTime = (time: string) => prefsStore.setReminder({ enabled: prefs.reminder.enabled, time });

  useEffect(() => {
    getHistory().then(setHistory);
    getReflections().then(setReflections);
    getJournal().then(setJournal);
    getPresence().then(setPresence);
  }, []);

  const doClear = async () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    await clearHistory();
    await clearReflections();
    setHistory([]);
    setReflections([]);
    setConfirmClear(false);
    // Journal pages are personal writing — they're removed one at a time, gently,
    // inside the journal itself, never wiped by this reset.
  };

  // The trail = check-ins + reflections, gathered into one gentle time-line.
  type Moment = { ts: number; text: string };
  const moments: Moment[] = [
    ...history.map((h): Moment => {
      if (h.flow) {
        const opener = h.flow.kind === 'feeling' ? `You arrived ${h.flow.title}` : `You made space for ${h.flow.title}`;
        return { ts: h.ts, text: `${opener}, and ${FLOW_LEFT[h.flow.left]}.` };
      }
      const last = h.checkins[h.checkins.length - 1];
      return {
        ts: h.ts,
        text: `You arrived ${feelingLabel(h.emotion)}${last && last !== 'prefer-not' ? `, and ${CHECKIN_PHRASE[last]}.` : '.'}`,
      };
    }),
    ...reflections.map((r): Moment => ({ ts: r.ts, text: `You felt ${r.word.toLowerCase()}.` })),
  ].sort((a, b) => b.ts - a.ts);

  const lastWritten = journal[0] ? new Date(journal[0].ts).toLocaleDateString() : null;

  return (
    <div className="screen">
      <div className="mx-auto w-full max-w-md pt-6 pb-10">
        <Reveal delay={0.05}>
          <div className="eyebrow">Profile</div>
          <h1 className="serif" style={{ fontSize: 'var(--t-2xl)', marginTop: 8, marginBottom: 20 }}>
            Your journey
          </h1>
        </Reveal>

        {/* Gentle journeys — a static 2×2 grid, all in view; missing content shows a calm shell. */}
        <Reveal delay={0.12}>
          <div className="eyebrow" style={{ marginBottom: 12 }}>
            Gentle journeys
          </div>
        </Reveal>
        <Reveal delay={0.16}>
          <div className="grid grid-cols-2 gap-3">
            {PROGRAMMES.map((p) => (
              <ProgrammeCard key={p.id} p={p} />
            ))}
          </div>
        </Reveal>

        {/* A soft mood picture + practice calendar, from what's already on-device. */}
        <div className="mt-8">
          <ReflectionTrail history={history} reflections={reflections} journal={journal} presence={presence} />
        </div>

        {/* Private journaling — prompts + a blank page, kept just here. */}
        <Reveal delay={0.05}>
          <button
            onClick={openJournal}
            className="glass mt-6 flex w-full items-center gap-3 px-5 py-4 text-left transition-transform duration-300 active:scale-[0.99]"
            style={{ borderRadius: 'var(--radius-card)', transitionTimingFunction: 'var(--ease-calm)' }}
          >
            <span className="grid shrink-0 place-items-center" style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(232,201,155,0.14)' }}>
              <PenLine size={18} strokeWidth={1.6} color="var(--gold)" />
            </span>
            <span className="flex-1">
              <span style={{ display: 'block', color: 'var(--ink)', fontSize: 'var(--t-md)' }}>Journal</span>
              <span className="eyebrow" style={{ display: 'block', marginTop: 2, textTransform: 'none', letterSpacing: 0 }}>
                {lastWritten ? `A private page · last written ${lastWritten}` : 'A private page — write freely, kept just for you'}
              </span>
            </span>
            <span aria-hidden style={{ color: 'var(--ink-muted)' }}>→</span>
          </button>
        </Reveal>

        {/* Sanctuary — the saved collection, also reachable here (§Phase D). */}
        <Reveal delay={0.08}>
          <button
            onClick={openSanctuary}
            className="glass mt-3 flex w-full items-center gap-3 px-5 py-4 text-left transition-transform duration-300 active:scale-[0.99]"
            style={{ borderRadius: 'var(--radius-card)', transitionTimingFunction: 'var(--ease-calm)' }}
          >
            <span className="grid shrink-0 place-items-center" style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(232,201,155,0.14)' }}>
              <Heart size={18} strokeWidth={1.6} color="var(--gold)" fill="var(--gold)" />
            </span>
            <span className="flex-1">
              <span style={{ display: 'block', color: 'var(--ink)', fontSize: 'var(--t-md)' }}>Sanctuary</span>
              <span className="eyebrow" style={{ display: 'block', marginTop: 2 }}>What you’ve kept close</span>
            </span>
            <span aria-hidden style={{ color: 'var(--ink-muted)' }}>→</span>
          </button>
        </Reveal>

        {moments.length === 0 ? (
          <p style={{ color: 'var(--ink-muted)', fontSize: 'var(--t-md)', marginTop: 28 }}>
            When you come home, your moments will gather here — just for you.
          </p>
        ) : (
          <>
            <div className="eyebrow" style={{ marginTop: 34, marginBottom: 10 }}>
              The moments you’ve gathered
            </div>
            <div className="flex flex-col gap-3">
              {moments.map((m) => (
                <div key={m.ts} className="glass px-5 py-4" style={{ borderRadius: 'var(--radius-card)' }}>
                  <div className="eyebrow">{new Date(m.ts).toLocaleDateString()}</div>
                  <div style={{ color: 'var(--ink)', fontSize: 'var(--t-md)', marginTop: 4 }}>{m.text}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* A gentle, opt-in reminder — supportive, never a streak to keep (§Phase G). */}
        <div className="eyebrow" style={{ marginTop: 34 }}>
          A moment for you
        </div>
        <div className="glass mt-3" style={{ borderRadius: 'var(--radius-card)', overflow: 'hidden' }}>
          <Row label="A gentle daily reminder" last={!prefs.reminder.enabled}>
            <Switch on={prefs.reminder.enabled} label="Daily reminder" onToggle={toggleReminder} />
          </Row>
          {prefs.reminder.enabled && (
            <Row label="Around" last>
              <input
                type="time"
                aria-label="Reminder time"
                value={prefs.reminder.time}
                onChange={(e) => setReminderTime(e.target.value)}
                style={{
                  background: 'transparent',
                  color: 'var(--ink)',
                  border: '1px solid var(--hairline)',
                  borderRadius: 10,
                  padding: '6px 10px',
                  fontSize: 'var(--t-sm)',
                  colorScheme: 'dark',
                  minHeight: 36,
                }}
              />
            </Row>
          )}
        </div>
        <p style={{ color: 'var(--ink-muted)', fontSize: 'var(--t-xs)', marginTop: 10, lineHeight: 1.5 }}>
          {reminderDenied
            ? 'Notifications are off in your device settings — no pressure. It’s here whenever you’d like it.'
            : 'A soft nudge to pause, never a streak to keep. Turn it off any time.'}
        </p>

        {/* Settings */}
        <div className="eyebrow" style={{ marginTop: 34 }}>
          Settings
        </div>
        <div className="glass mt-3" style={{ borderRadius: 'var(--radius-card)', overflow: 'hidden' }}>
          <Row label="Reduce motion">
            <Switch
              on={prefs.reduceMotion}
              label="Reduce motion"
              onToggle={() => prefsStore.setReduceMotion(!prefs.reduceMotion)}
            />
          </Row>
          <Row label="Voice">
            <span style={{ color: 'var(--ink-muted)', fontSize: 'var(--t-sm)' }}>Default</span>
          </Row>
          <Row label="Theme">
            <span style={{ color: 'var(--ink-muted)', fontSize: 'var(--t-sm)' }}>Still water</span>
          </Row>
          <Row label="Your data" last>
            <button
              onClick={doClear}
              style={{ color: confirmClear ? 'var(--gold)' : 'var(--ink-muted)', fontSize: 'var(--t-sm)' }}
            >
              {confirmClear ? 'Tap again to clear' : 'Clear history'}
            </button>
          </Row>
        </div>

        <p style={{ color: 'var(--ink-muted)', fontSize: 'var(--t-xs)', marginTop: 12 }}>
          Everything you share stays on this device.
        </p>

        <AccountSection />
      </div>
    </div>
  );
}

/**
 * Optional Google account (§0). Come Home stays local-first — signing in only adds
 * an identity + server-side profile; check-ins, journal and reflections stay on the
 * device. Hidden entirely when no backend is configured.
 */
function AccountSection() {
  const { user, loading } = useAuth();

  if (!isSupabaseConfigured || loading) return null;

  // Signed out → offer sign-in.
  if (user.isGuest) {
    return (
      <div className="mt-6">
        <GoogleButton onClick={signInWithGoogle} />
        <p style={{ color: 'var(--ink-muted)', fontSize: 'var(--t-xs)', marginTop: 8, lineHeight: 1.5 }}>
          Optional — sign in to keep your name across devices. Your check-ins stay on this device.
        </p>
      </div>
    );
  }

  // Signed in → account card + sign out. (Name is collected on the login screen.)
  return (
    <div className="glass mt-6 flex items-center gap-3 px-5 py-4" style={{ borderRadius: 'var(--radius-card)' }}>
      {user.avatarUrl ? (
        <img src={user.avatarUrl} alt="" width={40} height={40} style={{ borderRadius: 999 }} referrerPolicy="no-referrer" />
      ) : (
        <span className="grid shrink-0 place-items-center" style={{ width: 40, height: 40, borderRadius: 999, background: 'rgba(232,201,155,0.14)', color: 'var(--gold)' }}>
          {(user.name || 'You').slice(0, 1).toUpperCase()}
        </span>
      )}
      <span className="flex-1 overflow-hidden">
        <span style={{ display: 'block', color: 'var(--ink)', fontSize: 'var(--t-md)' }}>{user.name || 'Signed in'}</span>
        {user.email && (
          <span className="eyebrow" style={{ display: 'block', marginTop: 2, textTransform: 'none', letterSpacing: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user.email}
          </span>
        )}
      </span>
      <button onClick={() => signOut()} style={{ color: 'var(--ink-muted)', fontSize: 'var(--t-sm)' }}>
        Sign out
      </button>
    </div>
  );
}

/**
 * A single programme in the carousel. Real journeys show a soft dot path and a
 * gentle resume; journeys still being made show a calm "in the making" state.
 * Never a streak, never a percentage, never a demand.
 */
function ProgrammeCard({ p }: { p: Programme }) {
  const done = new Set(programme.completed(p.id));
  const complete = programme.isComplete(p);
  const started = done.size > 0;
  const next = programme.nextDayIndex(p);
  const soon = !!p.comingSoon;

  const tag = soon
    ? 'In the making'
    : complete
      ? 'Complete · return any time'
      : started
        ? `Continue · day ${next + 1}`
        : `${p.days.length} gentle days`;

  return (
    <button
      onClick={() => programme.open(p.id)}
      className={`glass ${started && !soon ? 'glass-gold' : ''} w-full px-4 py-4 text-left transition-transform duration-300 active:scale-[0.98]`}
      style={{
        minHeight: 132,
        borderRadius: 'var(--radius-card)',
        transitionTimingFunction: 'var(--ease-calm)',
        opacity: soon ? 0.82 : 1,
      }}
    >
      <div className="eyebrow" style={{ color: soon ? 'var(--ink-muted)' : started || complete ? 'var(--gold)' : 'var(--ink-muted)' }}>
        {tag}
      </div>
      <div className="serif" style={{ fontSize: 'var(--t-lg)', marginTop: 6, lineHeight: 1.15 }}>
        {p.title}
      </div>
      <div style={{ color: 'var(--ink-muted)', fontSize: 'var(--t-sm)', marginTop: 6, lineHeight: 1.4 }}>
        {p.blurb}
      </div>
      {!soon && (
        <div className="mt-4 flex items-center gap-1.5" aria-hidden>
          {p.days.map((_, i) => {
            const isDone = done.has(i);
            const isNext = i === next && !complete;
            return (
              <span
                key={i}
                style={{
                  width: isNext ? 9 : 7,
                  height: isNext ? 9 : 7,
                  borderRadius: 999,
                  background: isDone ? 'var(--gold)' : 'transparent',
                  border: `1px solid ${isDone || isNext ? 'var(--gold)' : 'var(--hairline)'}`,
                }}
              />
            );
          })}
        </div>
      )}
    </button>
  );
}

function Switch({ on, label, onToggle }: { on: boolean; label: string; onToggle: () => void }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onToggle}
      style={{
        width: 46,
        height: 28,
        borderRadius: 999,
        background: on ? 'var(--gold)' : 'var(--hairline)',
        position: 'relative',
        transition: 'background-color .3s var(--ease-calm)',
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: 3,
          left: on ? 21 : 3,
          width: 22,
          height: 22,
          borderRadius: 999,
          background: '#10222b',
          transition: 'left .3s var(--ease-calm)',
        }}
      />
    </button>
  );
}

function Row({ label, children, last = false }: { label: string; children: React.ReactNode; last?: boolean }) {
  return (
    <div
      className="flex items-center justify-between px-5 py-4"
      style={{ borderBottom: last ? 'none' : '1px solid var(--hairline)', minHeight: 56 }}
    >
      <span style={{ color: 'var(--ink)', fontSize: 'var(--t-md)' }}>{label}</span>
      {children}
    </div>
  );
}
