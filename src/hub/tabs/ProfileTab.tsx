import { useEffect, useState } from 'react';
import Reveal from '../../ui/Reveal';
import { usePrefs, prefsStore } from '../../store/prefs';
import { getHistory, clearHistory, type HistoryEntry } from '../../lib/storage';
import { feelingLabel } from '../../data/feelings';
import type { Checkin } from '../../store/session';

const CHECKIN_PHRASE: Record<Checkin, string> = {
  calmer: 'felt calmer',
  better: 'felt a little better',
  same: 'stayed with it',
  struggling: 'were still struggling',
  'prefer-not': 'kept it private',
};

/** §6 Profile. Gentle private journey + settings. No streaks, no stats guilt. */
export default function ProfileTab() {
  const prefs = usePrefs();
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    getHistory().then(setHistory);
  }, []);

  const doClear = async () => {
    if (!confirmClear) {
      setConfirmClear(true);
      return;
    }
    await clearHistory();
    setHistory([]);
    setConfirmClear(false);
  };

  return (
    <div className="screen">
      <div className="mx-auto w-full max-w-md py-10">
        <Reveal delay={0.05}>
          <div className="eyebrow">Profile</div>
          <h1 className="serif" style={{ fontSize: 'var(--t-2xl)', marginTop: 8, marginBottom: 20 }}>
            Your journey
          </h1>
        </Reveal>

        {history.length === 0 ? (
          <p style={{ color: 'var(--ink-muted)', fontSize: 'var(--t-md)' }}>
            When you come home, your moments will gather here — just for you.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {history.map((h) => {
              const last = h.checkins[h.checkins.length - 1];
              return (
                <div key={h.ts} className="glass px-5 py-4" style={{ borderRadius: 'var(--radius-card)' }}>
                  <div className="eyebrow">{new Date(h.ts).toLocaleDateString()}</div>
                  <div style={{ color: 'var(--ink)', fontSize: 'var(--t-md)', marginTop: 4 }}>
                    You arrived {feelingLabel(h.emotion)}
                    {last && last !== 'prefer-not' ? `, and ${CHECKIN_PHRASE[last]}.` : '.'}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Settings */}
        <div className="eyebrow" style={{ marginTop: 34 }}>
          Settings
        </div>
        <div className="glass mt-3" style={{ borderRadius: 'var(--radius-card)', overflow: 'hidden' }}>
          <Row label="Reduce motion">
            <button
              role="switch"
              aria-checked={prefs.reduceMotion}
              aria-label="Reduce motion"
              onClick={() => prefsStore.setReduceMotion(!prefs.reduceMotion)}
              style={{
                width: 46,
                height: 28,
                borderRadius: 999,
                background: prefs.reduceMotion ? 'var(--gold)' : 'var(--hairline)',
                position: 'relative',
                transition: 'background-color .3s var(--ease-calm)',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: 3,
                  left: prefs.reduceMotion ? 21 : 3,
                  width: 22,
                  height: 22,
                  borderRadius: 999,
                  background: '#10222b',
                  transition: 'left .3s var(--ease-calm)',
                }}
              />
            </button>
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

        <button
          disabled
          className="mt-6 w-full"
          aria-disabled="true"
          style={{
            minHeight: 48,
            borderRadius: 999,
            border: '1px solid var(--hairline)',
            color: 'var(--ink-muted)',
            opacity: 0.55,
            fontSize: 'var(--t-md)',
          }}
        >
          Continue with Google · coming later
        </button>
      </div>
    </div>
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
