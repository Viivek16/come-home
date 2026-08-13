import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wind, Waves, Moon, Target, Heart, Sparkles, type LucideIcon } from 'lucide-react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import Screen from '../components/Screen';
import { listCategories, type Category } from '../data/categories';

// Static map keeps the bundle tiny (vs lucide's dynamic loader, which precaches
// every icon). Unknown names fall back to Sparkles — add a line when categories grow.
const ICONS: Record<string, LucideIcon> = { wind: Wind, waves: Waves, moon: Moon, target: Target, heart: Heart };

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function Home({
  session,
  onSignIn,
}: {
  session: Session | null;
  onSignIn: () => void;
}) {
  const [cats, setCats] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    listCategories()
      .then(setCats)
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, []);

  return (
    <Screen className="bg-gradient-to-b from-slate-950 to-slate-900 text-slate-100">
      <div className="mx-auto flex min-h-full max-w-md flex-col px-6 pb-12 pt-14">
        <header className="mb-10 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{greeting()}</h1>
            <p className="mt-1 text-slate-400">Come home to yourself.</p>
          </div>
          {session ? (
            <button
              onClick={() => supabase.auth.signOut()}
              className="mt-1 text-sm text-slate-500 hover:text-slate-300"
            >
              Sign out
            </button>
          ) : (
            <button onClick={onSignIn} className="mt-1 text-sm text-slate-500 hover:text-slate-300">
              Sign in
            </button>
          )}
        </header>

        {error && <p className="mb-4 text-amber-400">Couldn’t load categories: {error}</p>}

        <div className="grid grid-cols-2 gap-4">
          {cats.map((c) => {
            const Icon = ICONS[c.icon ?? ''] ?? Sparkles;
            return (
              <button
                key={c.id}
                onClick={() => navigate(`/category/${c.slug}`)}
                style={{ backgroundColor: c.color ?? '#1e293b' }}
                className="flex aspect-square flex-col justify-between rounded-3xl p-5 text-left text-white shadow-lg shadow-black/20 transition active:scale-[0.98]"
              >
                <Icon size={32} strokeWidth={1.5} />
                <span className="text-lg font-medium drop-shadow-sm">{c.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </Screen>
  );
}
