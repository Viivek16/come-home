import { useEffect } from 'react';
import LivingWater from './water/LivingWater';
import Scene from './scene/Scene';
import Atmosphere from './water/Atmosphere';
import SessionFlow from './session/SessionFlow';
import FirstRun from './first-run/FirstRun';
import Hub from './hub/Hub';
import { useView } from './store/app';
import { setDepth } from './store/water';
import { usePrefs } from './store/prefs';
import { setReduceMotionPref } from './lib/motion';

/**
 * App shell (§4, §11): Living Water + atmosphere mounted ONCE behind everything;
 * the current view renders inside .app-layer above them.
 */
export default function App() {
  const view = useView();
  const { reduceMotion } = usePrefs();

  // Apply the persisted reduce-motion override across the app (§10).
  useEffect(() => {
    setReduceMotionPref(reduceMotion);
  }, [reduceMotion]);

  // Hub / first-run sit at their own water depth (§4); the session flow manages its own.
  useEffect(() => {
    if (view === 'hub') setDepth('hub');
    else if (view === 'first-run') setDepth('opening');
  }, [view]);

  return (
    <>
      <LivingWater />
      <Scene />
      <Atmosphere />
      <div className="app-layer">
        {view === 'first-run' ? <FirstRun /> : view === 'session' ? <SessionFlow /> : <Hub />}
      </div>
    </>
  );
}
