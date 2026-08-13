import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { usePlayer } from '../lib/player';
import { listMeditations, type Meditation } from '../data/meditations';

function fmt(seconds: number | null) {
  if (seconds == null) return '';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// session === null → browsing as guest (no progress saved).
export default function Home({
  session,
  onSignIn,
}: {
  session: Session | null;
  onSignIn: () => void;
}) {
  const [items, setItems] = useState<Meditation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const player = usePlayer();

  useEffect(() => {
    listMeditations()
      .then(setItems)
      .catch((e) => setError(e.message ?? String(e)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="flex min-h-full flex-col bg-slate-900 text-slate-100">
      <header className="flex items-center justify-between px-5 py-4">
        <h1 className="text-xl font-semibold tracking-tight">Come Home</h1>
        {session ? (
          <button
            onClick={() => supabase.auth.signOut()}
            className="text-sm text-slate-400 hover:text-slate-200"
          >
            Log out
          </button>
        ) : (
          <button onClick={onSignIn} className="text-sm text-slate-400 hover:text-slate-200">
            Sign in
          </button>
        )}
      </header>

      <div className="flex-1 overflow-y-auto px-5 pb-28">
        {loading && <p className="text-slate-400">Loading…</p>}
        {error && <p className="text-amber-400">Couldn’t load meditations: {error}</p>}
        {!loading && !error && items.length === 0 && (
          <p className="text-slate-400">No meditations yet.</p>
        )}

        <ul className="flex flex-col gap-2">
          {items.map((m) => {
            const active = player.current?.id === m.id;
            return (
              <li key={m.id}>
                <button
                  onClick={() => player.play(m)}
                  className={`flex w-full items-center gap-4 rounded-xl px-4 py-3 text-left ring-1 transition ${
                    active ? 'bg-slate-800 ring-slate-500' : 'ring-slate-800 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="h-12 w-12 shrink-0 rounded-lg bg-slate-700" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{m.title}</span>
                    {m.description && (
                      <span className="block truncate text-sm text-slate-400">{m.description}</span>
                    )}
                  </span>
                  <span className="text-sm text-slate-500">{fmt(m.duration_sec)}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {player.current && (
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed inset-x-0 bottom-0 flex items-center gap-4 border-t border-slate-800 bg-slate-900/95 px-5 py-4 backdrop-blur"
        >
          <span className="min-w-0 flex-1 truncate">{player.current.title}</span>
          <button
            onClick={player.toggle}
            className="rounded-full bg-slate-100 px-5 py-2 font-medium text-slate-900"
          >
            {player.playing ? 'Pause' : 'Play'}
          </button>
        </motion.div>
      )}
    </main>
  );
}
