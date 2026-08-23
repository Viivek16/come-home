import { useEffect } from 'react';
import MiniPlayer from './MiniPlayer';
import SleepMini from './SleepMini';
import { audio } from '../lib/audio';
import { player } from '../store/player';
import { app } from '../store/app';
import { session } from '../store/session';

/**
 * Global player host (Phase A). Mounted once in <App>, so the mini-player and the
 * natural-close handler live above every view and outlast any screen. When the
 * guided track finishes on its own, we surface the gentle close (§6.6) wherever
 * the user is — expanding back into the session if they'd minimised it.
 */
export default function PlayerHost() {
  useEffect(() => {
    const off = audio.on('ended', () => {
      if (!player.active) return; // a session owns the audio → this is a real finish
      app.setView('session'); // in case it was collapsed over the hub
      session.go('checkin'); // "how do you feel now?" — no streak, no score
      player.end();
    });
    return off;
  }, []);

  return (
    <>
      <MiniPlayer />
      <SleepMini />
    </>
  );
}
