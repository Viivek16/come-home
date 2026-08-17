import Reveal from '../ui/Reveal';
import ExitButton from '../ui/ExitButton';
import CoverCard from '../ui/CoverCard';
import HeartButton from '../ui/HeartButton';
import { app } from '../store/app';
import { nav } from '../nav/history';
import { session, type PathId } from '../store/session';
import { useFavorites } from '../store/favorites';
import { LIBRARY_ITEMS } from '../data/library';
import { PATHS } from '../data/paths';
import { stillWaterGradient } from '../store/water';
import { useTimeBand } from '../lib/timeBand';

/** Open the Sanctuary — the saved collection (§Phase D). A view, not a nav tab. */
export function openSanctuary() {
  app.setView('sanctuary');
}

/**
 * Sanctuary (§Phase D) — the calm home for saved sessions. Reads the existing
 * favorites store (never a fork). Atmospheric cards; removing is a single gentle
 * tap of the heart (no confirmation guilt); the empty state is warm, not an error.
 */
export default function Sanctuary() {
  const favs = useFavorites();
  const band = useTimeBand();
  const cover = stillWaterGradient(band);

  const savedLib = LIBRARY_ITEMS.filter((l) => favs.has(`lib:${l.id}`));
  const savedPaths = PATHS.filter((p) => favs.has(`path:${p.id}`));
  const hasSaved = savedLib.length + savedPaths.length > 0;

  const openPath = (p: PathId) => {
    session.reset();
    session.pickPath(p);
    app.setView('session');
  };
  // Library items are placeholders → open a fitting guided session (as elsewhere).
  const openLibrary = () => {
    session.reset();
    session.pickPath('more-15');
    app.setView('session');
  };

  return (
    <div className="screen">
      <ExitButton onExit={() => nav.back()} />
      <div className="mx-auto w-full max-w-md py-10">
        <Reveal delay={0.05}>
          <div className="eyebrow">Sanctuary</div>
          <h1 className="serif" style={{ fontSize: 'var(--t-2xl)', marginTop: 8 }}>
            {hasSaved ? 'What you’ve kept close.' : 'A place for what helps.'}
          </h1>
          <p style={{ color: 'var(--ink-muted)', marginTop: 8, fontSize: 'var(--t-md)', lineHeight: 1.5 }}>
            {hasSaved
              ? 'Yours to return to, whenever you need it.'
              : 'Tap the heart on anything that helps, and it will wait for you here — no rush, no pressure.'}
          </p>
        </Reveal>

        {hasSaved && (
          <div className="mt-7 flex flex-col gap-4">
            {savedPaths.map((p, i) => (
              <Reveal key={`path-${p.id}`} delay={0.16 + i * 0.05}>
                <CoverCard
                  cover={cover}
                  tag={`Guided · ${p.duration}`}
                  title={p.title}
                  onClick={() => openPath(p.id)}
                  corner={<HeartButton favKey={`path:${p.id}`} label={p.title} />}
                />
              </Reveal>
            ))}
            {savedLib.map((l, i) => (
              <Reveal key={`lib-${l.id}`} delay={0.16 + (savedPaths.length + i) * 0.05}>
                <CoverCard
                  cover={cover}
                  tag={`${l.feeling} · ${l.length}`}
                  title={l.title}
                  onClick={openLibrary}
                  corner={<HeartButton favKey={`lib:${l.id}`} label={l.title} />}
                />
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
