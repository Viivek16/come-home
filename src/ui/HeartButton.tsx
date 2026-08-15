import { Heart } from 'lucide-react';
import { favorites, useFavorites } from '../store/favorites';

/**
 * Soft save/favorite toggle (§Phase3). Champagne heart when saved, muted when
 * not. 44px tap target, calm press feedback, no red. `label` names the item for
 * screen readers. `favKey` is a prefixed key (`lib:<id>` | `path:<id>`).
 */
export default function HeartButton({ favKey, label }: { favKey: string; label: string }) {
  const favs = useFavorites();
  const active = favs.has(favKey);
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        favorites.toggle(favKey);
      }}
      aria-pressed={active}
      aria-label={active ? `Remove ${label} from saved` : `Save ${label}`}
      className="grid shrink-0 place-items-center transition-transform duration-300 active:scale-[0.9]"
      style={{ width: 44, height: 44, borderRadius: 999, color: active ? 'var(--gold)' : 'var(--ink-muted)', transitionTimingFunction: 'var(--ease-calm)' }}
    >
      <Heart size={20} strokeWidth={1.6} fill={active ? 'var(--gold)' : 'none'} />
    </button>
  );
}
