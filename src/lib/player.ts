import { useSyncExternalStore } from 'react';
import { MediaSession } from '@capgo/capacitor-media-session';
import { audio } from './audio';
import { saveProgress } from '../data/progress';
import type { Meditation } from '../data/meditations';

type Snapshot = {
  current: Meditation | null;
  playing: boolean;
  position: number;
  duration: number;
};

let snap: Snapshot = { current: null, playing: false, position: 0, duration: 0 };
let userId: string | null = null;
let maxPos = 0; // furthest playback position reached this session
let lastSaved = 0;
const listeners = new Set<() => void>();

function commit(patch: Partial<Snapshot>) {
  snap = { ...snap, ...patch };
  listeners.forEach((l) => l());
}

function saveNow() {
  if (!userId || !snap.current) return;
  lastSaved = Date.now();
  void saveProgress(userId, snap.current.id, Math.floor(maxPos));
}

// Wire the single audio element once, at module load. These handlers outlive any
// screen, so playback + lock-screen controls + progress keep working across
// navigation (and when the app is backgrounded).
audio.on('play', () => {
  commit({ playing: true });
  MediaSession.setPlaybackState({ playbackState: 'playing' });
});
audio.on('pause', () => {
  commit({ playing: false });
  MediaSession.setPlaybackState({ playbackState: 'paused' });
  saveNow();
});
audio.on('ended', () => {
  commit({ playing: false });
  MediaSession.setPlaybackState({ playbackState: 'paused' });
  saveNow();
});
audio.on('loadedmetadata', () => commit({ duration: audio.duration }));
audio.on('durationchange', () => commit({ duration: audio.duration }));
audio.on('timeupdate', () => {
  const t = audio.currentTime;
  if (t > maxPos) maxPos = t;
  commit({ position: t });
  MediaSession.setPositionState({
    duration: isFinite(audio.duration) ? audio.duration : 0,
    position: t,
    playbackRate: 1,
  });
  if (userId && Date.now() - lastSaved > 10000) saveNow(); // ponytail: 10s throttle, tune if writes matter more
});

export const player = {
  setUser(id: string | null) {
    userId = id;
  },
  async play(m: Meditation) {
    if (snap.current?.id !== m.id) {
      maxPos = 0;
      lastSaved = 0;
      audio.load(m.audio_url);
      commit({ current: m, position: 0, duration: 0 });
      MediaSession.setMetadata({ title: m.title, artist: 'Come Home', album: m.description ?? '' });
      MediaSession.setActionHandler({ action: 'play' }, () => void audio.play());
      MediaSession.setActionHandler({ action: 'pause' }, () => audio.pause());
      MediaSession.setActionHandler({ action: 'seekto' }, (d) => {
        if (typeof d.seekTime === 'number') audio.seek(d.seekTime);
      });
    }
    await audio.play();
  },
  toggle() {
    if (snap.current) void audio.toggle();
  },
  seek(t: number) {
    audio.seek(t);
    commit({ position: t });
  },
};

export function usePlayer() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => snap,
  );
}
