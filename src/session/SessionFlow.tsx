import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../lib/motion';
import { setDepth, type DepthGroup } from '../store/water';
import { useSessionState, type Step } from '../store/session';
import { addHistory } from '../lib/storage';
import { nav } from '../nav/history';
import Opening from './screens/Opening';
import Arrival from './screens/Arrival';
import Response from './screens/Response';
import Support from './screens/Support';
import MusicContinues from './screens/MusicContinues';
import CheckIn from './screens/CheckIn';
import Return from './screens/Return';

// Water depth per step (§4). Centralised here so the dissolve + depth change
// happen in ONE place (§5, §11).
const DEPTH: Record<Step, DepthGroup> = {
  opening: 'opening',
  arrival: 'opening',
  response: 'response',
  support: 'response',
  music: 'response',
  checkin: 'checkin',
  return: 'checkin',
};
// Entering a calmer state settles slightly downward (§5).
const CALMER: Step[] = ['support', 'music', 'checkin', 'return'];

/** The core session loop as one explicit state machine (§6, §11). */
export default function SessionFlow() {
  const { step, emotion, checkins } = useSessionState();
  const reduce = useReducedMotion();

  useEffect(() => {
    setDepth(DEPTH[step]);
  }, [step]);

  // Leaving a session is a Back: pop the session's history level so hardware/
  // browser Back and the in-app exits stay in sync (audio stop + reset happen in
  // the history handler). § this-pass routing fix.
  const toHub = () => nav.back();

  // Save the completed session to on-device history (§8), then land on the hub.
  const finishAndExit = () => {
    void addHistory({ ts: Date.now(), emotion, checkins });
    nav.back();
  };

  const screen = (() => {
    switch (step) {
      case 'opening':
        return <Opening />;
      case 'arrival':
        return <Arrival onExit={toHub} />;
      case 'response':
        return <Response onExit={toHub} />;
      case 'support':
        return <Support />;
      case 'music':
        return <MusicContinues />;
      case 'checkin':
        return <CheckIn />;
      case 'return':
        return <Return onExit={finishAndExit} />;
    }
  })();

  // Enter-only cross-dissolve keyed by step (framer-motion 13's AnimatePresence
  // mode="wait" hangs here — same pattern the old router used). 500ms (§5).
  return (
    <motion.div
      key={step}
      className="min-h-full"
      initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: CALMER.includes(step) ? -6 : 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: reduce ? 0.001 : 0.5, ease: [0.22, 0.61, 0.36, 1] }}
    >
      {screen}
    </motion.div>
  );
}
