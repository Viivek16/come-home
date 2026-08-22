import { useEffect } from 'react';
import LivingWater from './water/LivingWater';
import Scene from './scene/Scene';
import Atmosphere from './water/Atmosphere';
import SessionFlow from './session/SessionFlow';
import FirstRun from './first-run/FirstRun';
import Onboarding from './first-run/Onboarding';
import Hub from './hub/Hub';
import ToolHost from './tools/ToolHost';
import ProgrammeOverview from './programme/ProgrammeOverview';
import SleepPlayer from './sleep/SleepPlayer';
import Sanctuary from './sanctuary/Sanctuary';
import Journal from './journal/Journal';
import PlayerHost from './audio/PlayerHost';
import { app, useView } from './store/app';
import { onboardingDone, markPresence } from './lib/storage';
import { setDepth } from './store/water';
import { usePrefs } from './store/prefs';
import { setReduceMotionPref } from './lib/motion';
import { ambient } from './audio/ambient';
import { reminders } from './lib/reminders';
import { useAppHistory } from './nav/history';

/**
 * App shell (§4, §11): Living Water + atmosphere mounted ONCE behind everything;
 * the current view renders inside .app-layer above them.
 */
export default function App() {
  const view = useView();
  const { reduceMotion, ambientMuted, reminder } = usePrefs();

  // Keep hardware/browser Back inside the app (only Home-screen Back exits).
  useAppHistory();

  // Just opening the app counts as coming home (§Phase A). Dedup'd per day in storage.
  useEffect(() => {
    void markPresence();
  }, []);

  // Apply the persisted reduce-motion override across the app (§10).
  useEffect(() => {
    setReduceMotionPref(reduceMotion);
  }, [reduceMotion]);

  // Ambient bed: honor the mute pref, and start it on the first user gesture.
  useEffect(() => {
    ambient.setMuted(ambientMuted);
  }, [ambientMuted]);

  // Gentle reminder: re-arm (or clear) the opt-in local notification from prefs.
  useEffect(() => {
    reminders.sync(reminder.enabled, reminder.time);
  }, [reminder.enabled, reminder.time]);
  useEffect(() => {
    const go = () => ambient.enable();
    window.addEventListener('pointerdown', go, { once: true });
    window.addEventListener('keydown', go, { once: true });
    return () => {
      window.removeEventListener('pointerdown', go);
      window.removeEventListener('keydown', go);
    };
  }, []);

  // New users answer the 3 onboarding questions once, after login, before Home —
  // every path lands on 'hub' first, so gate it here in one place (§6 flow).
  useEffect(() => {
    if (view === 'hub' && !onboardingDone()) app.setView('onboarding');
  }, [view]);

  // Hub / first-run / onboarding sit at their own water depth (§4); the session flow manages its own.
  useEffect(() => {
    if (view === 'hub') setDepth('hub');
    else if (view === 'first-run' || view === 'onboarding') setDepth('opening');
  }, [view]);

  return (
    <>
      <LivingWater />
      <Scene />
      <Atmosphere />
      <div className="app-layer">
        {view === 'first-run' ? (
          <FirstRun />
        ) : view === 'onboarding' ? (
          <Onboarding />
        ) : view === 'session' ? (
          <SessionFlow />
        ) : view === 'tool' ? (
          <ToolHost />
        ) : view === 'programme' ? (
          <ProgrammeOverview />
        ) : view === 'sleep' ? (
          <SleepPlayer />
        ) : view === 'sanctuary' ? (
          <Sanctuary />
        ) : view === 'journal' ? (
          <Journal />
        ) : (
          <Hub />
        )}
      </div>
      {/* Docked mini-player + natural-close handler — global, outlives every view. */}
      <PlayerHost />
    </>
  );
}
