import LivingWater from './water/LivingWater';
import Atmosphere from './water/Atmosphere';
import Mark from './ui/Mark';
import Button from './ui/Button';
import { setDepth, type DepthGroup } from './store/water';

/**
 * App shell (§4, §11): Living Water + atmosphere mounted ONCE behind everything;
 * all screens render inside .app-layer above them. The session flow + hub replace
 * the placeholder below in Phase 3.
 */
export default function App() {
  return (
    <>
      <LivingWater />
      <Atmosphere />
      <div className="app-layer">
        <div className="screen items-center justify-center text-center">
          <Mark size={104} />
          <h1 className="serif tracked" style={{ fontSize: 'var(--t-2xl)', marginTop: 24 }}>
            COME HOME
          </h1>
          <p className="serif-italic" style={{ color: 'var(--ink-muted)', marginTop: 8 }}>
            Let's be here, right now.
          </p>

          {/* TEMP (Phase 2 verify only) — depth toggles, removed in Phase 3 */}
          <div className="mt-10 flex flex-wrap justify-center gap-2">
            {(['opening', 'response', 'checkin', 'hub'] as DepthGroup[]).map((g) => (
              <Button key={g} variant="ghost" onClick={() => setDepth(g)}>
                {g}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
