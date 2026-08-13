import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Screen from '../components/Screen';
import { BackIcon } from '../components/icons';
import { getCategoryBySlug, type Category as Cat } from '../data/categories';
import { listByCategory, type Meditation } from '../data/meditations';

function fmt(s: number | null) {
  if (s == null) return '';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function Category() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [cat, setCat] = useState<Cat | null>(null);
  const [items, setItems] = useState<Meditation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        const c = await getCategoryBySlug(slug);
        setCat(c);
        if (c) setItems(await listByCategory(c.id));
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  return (
    <Screen className="bg-gradient-to-b from-slate-950 to-slate-900 text-slate-100">
      <div className="mx-auto flex min-h-full max-w-md flex-col px-6 pb-12 pt-12">
        <button
          onClick={() => navigate('/')}
          className="-ml-1 mb-6 flex items-center gap-1 text-slate-400 hover:text-slate-200"
        >
          <BackIcon />
          <span className="text-sm">Back</span>
        </button>

        <h1 className="mb-6 text-2xl font-semibold tracking-tight">{cat?.name ?? 'Category'}</h1>

        {loading && <p className="text-slate-400">Loading…</p>}
        {error && <p className="text-amber-400">{error}</p>}
        {!loading && !error && items.length === 0 && (
          <p className="text-slate-400">No meditations here yet.</p>
        )}

        <ul className="flex flex-col gap-2">
          {items.map((m) => (
            <li key={m.id}>
              <button
                onClick={() => navigate(`/player/${m.id}`)}
                className="flex w-full items-center justify-between rounded-2xl px-5 py-4 text-left ring-1 ring-white/5 transition hover:bg-white/5 active:scale-[0.99]"
              >
                <span className="min-w-0 flex-1 truncate font-medium">{m.title}</span>
                <span className="ml-4 text-sm tabular-nums text-slate-400">{fmt(m.duration_sec)}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </Screen>
  );
}
