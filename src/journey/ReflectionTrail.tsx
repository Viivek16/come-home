import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Reveal from '../ui/Reveal';
import { feelingLabel } from '../data/feelings';
import type { Emotion, Checkin } from '../store/session';
import type { HistoryEntry, Reflection, JournalEntry } from '../lib/storage';

/**
 * Guilt-free reflection trail (§Phase F). Two soft, month-scoped views built from
 * the check-in history already stored on the device:
 *
 *  1. A gentle mood picture — a soft distribution of how you arrived, drawn only in
 *     champagne gold (never red/alarm, the one-accent rule), with a warm line about
 *     how sessions tended to end. Reflective, never a score.
 *  2. A practice calendar — the days a moment was gathered, marked as soft warm
 *     dots. Missing days are simply unmarked and unremarked: no streak, no chain to
 *     break, no percentage, no "you missed N days."
 *
 * Everything here is a mirror, not a measure.
 */

const DOW = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const dateKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
const inMonth = (ts: number, y: number, m: number) => {
  const d = new Date(ts);
  return d.getFullYear() === y && d.getMonth() === m;
};

export default function ReflectionTrail({
  history,
  reflections,
  journal,
}: {
  history: HistoryEntry[];
  reflections: Reflection[];
  journal: JournalEntry[];
}) {
  // 0 = current month; negative = earlier. Never navigate into the future.
  const [offset, setOffset] = useState(0);
  const now = new Date();
  const cursor = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const monthLabel = cursor.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  // --- Mood picture (arrival) -------------------------------------------------
  const monthHistory = history.filter((h) => inMonth(h.ts, year, month));
  const arrivalCounts = new Map<Emotion, number>();
  for (const h of monthHistory) {
    if (h.emotion) arrivalCounts.set(h.emotion, (arrivalCounts.get(h.emotion) ?? 0) + 1);
  }
  const maxArrival = Math.max(1, ...arrivalCounts.values());
  const moods = [...arrivalCounts.entries()].sort((a, b) => b[1] - a[1]);

  // --- Practice calendar (any moment) -----------------------------------------
  const active = new Set<string>();
  for (const h of history) active.add(dateKey(new Date(h.ts)));
  for (const r of reflections) active.add(dateKey(new Date(r.ts)));
  for (const j of journal) active.add(dateKey(new Date(j.ts)));

  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayKey = dateKey(now);
  const cells: ({ day: number; on: boolean; isToday: boolean } | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => {
      const d = new Date(year, month, i + 1);
      const k = dateKey(d);
      return { day: i + 1, on: active.has(k), isToday: k === todayKey };
    }),
  ];

  const canGoNext = offset < 0;

  return (
    <div className="flex flex-col gap-5">
      {/* Shared month header with quiet navigation. */}
      <div className="flex items-center justify-between">
        <div className="eyebrow">A look back</div>
        <div className="flex items-center gap-1">
          <MonthArrow dir="prev" onClick={() => setOffset((o) => o - 1)} />
          <span className="serif" style={{ fontSize: 'var(--t-md)', minWidth: 128, textAlign: 'center' }}>
            {monthLabel}
          </span>
          <MonthArrow dir="next" disabled={!canGoNext} onClick={() => canGoNext && setOffset((o) => o + 1)} />
        </div>
      </div>

      {/* 1 — Mood picture */}
      <Reveal>
        <div className="glass px-5 py-5" style={{ borderRadius: 'var(--radius-card)' }}>
          <div className="eyebrow">How you arrived</div>
          {moods.length === 0 ? (
            <p className="serif-italic" style={{ color: 'var(--ink-muted)', fontSize: 'var(--t-sm)', marginTop: 12, lineHeight: 1.5 }}>
              No moments gathered this month yet. Whenever you come home, a soft picture will form here.
            </p>
          ) : (
            <>
              <div className="mt-4 flex flex-col gap-3">
                {moods.map(([emotion, count]) => (
                  <div key={emotion} className="flex items-center gap-3">
                    <span style={{ flex: '0 0 42%', color: 'var(--ink)', fontSize: 'var(--t-sm)' }}>
                      {feelingLabel(emotion)}
                    </span>
                    <span
                      aria-hidden
                      style={{
                        flex: 1,
                        height: 8,
                        borderRadius: 999,
                        background: 'var(--hairline)',
                        overflow: 'hidden',
                      }}
                    >
                      <span
                        style={{
                          display: 'block',
                          height: '100%',
                          width: `${Math.max(14, (count / maxArrival) * 100)}%`,
                          borderRadius: 999,
                          background: 'linear-gradient(90deg, rgba(232,201,155,0.55), var(--gold))',
                          boxShadow: '0 0 10px rgba(232,201,155,0.25)',
                        }}
                      />
                    </span>
                  </div>
                ))}
              </div>
              <EndOfSessionNote history={monthHistory} />
            </>
          )}
        </div>
      </Reveal>

      {/* 2 — Practice calendar */}
      <Reveal>
        <div className="glass px-5 py-5" style={{ borderRadius: 'var(--radius-card)' }}>
          <div className="eyebrow">The days you came home</div>
          <div className="mt-4 grid grid-cols-7 gap-y-3" aria-hidden>
            {DOW.map((d, i) => (
              <span key={`h${i}`} className="eyebrow" style={{ fontSize: 9, textAlign: 'center' }}>
                {d}
              </span>
            ))}
            {cells.map((c, i) =>
              c === null ? (
                <span key={`e${i}`} />
              ) : (
                <span key={c.day} className="grid place-items-center" style={{ height: 26 }}>
                  <span
                    style={{
                      width: c.on ? 12 : 5,
                      height: c.on ? 12 : 5,
                      borderRadius: 999,
                      background: c.on ? 'var(--gold)' : 'rgba(157,178,181,0.22)',
                      boxShadow: c.on ? '0 0 12px rgba(232,201,155,0.5)' : 'none',
                      outline: c.isToday ? '1px solid rgba(232,201,155,0.45)' : 'none',
                      outlineOffset: 3,
                      transition: 'all .3s var(--ease-calm)',
                    }}
                  />
                </span>
              ),
            )}
          </div>
          <p className="serif-italic" style={{ color: 'var(--ink-muted)', fontSize: 'var(--t-sm)', marginTop: 16, lineHeight: 1.5 }}>
            Every dot is a time you showed up for yourself. The rest are simply rest.
          </p>
        </div>
      </Reveal>
    </div>
  );
}

/** A qualitative, number-free note on how sessions tended to end (§Phase F). */
function EndOfSessionNote({ history }: { history: HistoryEntry[] }) {
  const ends = history
    .map((h) => h.checkins[h.checkins.length - 1])
    .filter((c): c is Checkin => !!c && c !== 'prefer-not');
  if (ends.length === 0) return null;

  const eased = ends.filter((c) => c === 'calmer' || c === 'better').length;
  const note =
    eased === 0
      ? 'Some days were heavier — and you stayed with them anyway. That counts.'
      : eased >= ends.length - 1
        ? 'And most times, you left a little lighter than you arrived.'
        : 'And often, you left a little lighter than you arrived.';

  return (
    <p className="serif-italic" style={{ color: 'var(--gold)', fontSize: 'var(--t-sm)', marginTop: 16, lineHeight: 1.5 }}>
      {note}
    </p>
  );
}

function MonthArrow({ dir, onClick, disabled = false }: { dir: 'prev' | 'next'; onClick: () => void; disabled?: boolean }) {
  const Icon = dir === 'prev' ? ChevronLeft : ChevronRight;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === 'prev' ? 'Earlier month' : 'Later month'}
      className="grid place-items-center transition-transform duration-200 active:scale-[0.9]"
      style={{
        width: 34,
        height: 34,
        borderRadius: 999,
        color: 'var(--ink-muted)',
        opacity: disabled ? 0.3 : 1,
        transitionTimingFunction: 'var(--ease-calm)',
      }}
    >
      <Icon size={18} strokeWidth={1.6} />
    </button>
  );
}
