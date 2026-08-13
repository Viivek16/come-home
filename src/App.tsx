import { useEffect } from 'react';
import LivingWater from './water/LivingWater';
import Atmosphere from './water/Atmosphere';
import SessionFlow from './session/SessionFlow';
import Button from './ui/Button';
import { app, useView } from './store/app';
import { setDepth } from './store/water';
import { session } from './store/session';

/**
 * App shell (§4, §11): Living Water + atmosphere mounted ONCE behind everything;
 * the current view renders inside .app-layer above them.
 */
export default function App() {
  const view = useView();

  // Hub sits at its own water depth (§4); the session flow manages its own.
  useEffect(() => {
    if (view === 'hub') setDepth('hub');
  }, [view]);

  return (
    <>
      <LivingWater />
      <Atmosphere />
      <div className="app-layer">
        {view === 'session' ? <SessionFlow /> : <HubPlaceholder />}
      </div>
    </>
  );
}

// Phase 6 replaces this with the real hub + tab bar.
function HubPlaceholder() {
  return (
    <div className="screen items-center justify-center text-center">
      <div className="mx-auto flex w-full max-w-md flex-col items-center">
        <div className="eyebrow">Home</div>
        <p className="serif" style={{ fontSize: 'var(--t-xl)', marginTop: 8 }}>
          You're not alone in this.
        </p>
        <div className="mt-10">
          <Button
            onClick={() => {
              session.reset();
              app.setView('session');
            }}
          >
            Come Home now
          </Button>
        </div>
      </div>
    </div>
  );
}
