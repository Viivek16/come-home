import { useSyncExternalStore } from 'react';
import { audio } from '../lib/audio';
import { ambient } from './ambient';

/**
 * Session audio (§7). Local-only, no progress writes. Reuses the single
 * HTMLAudioElement wrapper (lib/audio) so lock-screen controls target one element.
 *
 * A session's audio is modelled as { voiceTrack?, musicTrack } so a guided-voice
 * layer + a real content library drop in later without a refactor. Only music
 * exists now — the "Music continues after voice" copy stays true.
 */
export const TRACK = '/audio/track.mp3';
export type SessionAudio = { voiceTrack?: string; musicTrack: string };
export const SESSION_AUDIO: SessionAudio = { musicTrack: TRACK };

type Snap = { playing: boolean; position: number; duration: number; ready: boolean; error: boolean };
let snap: Snap = { playing: false, position: 0, duration: 0, ready: false, error: false };
let loadedSrc: string | null = null;
const listeners = new Set<() => void>();
const emit = (p: Partial<Snap>) => {
  snap = { ...snap, ...p };
  listeners.forEach((l) => l());
};

// Native lock-screen controls (§7) — no Capacitor plugin needed; Android Chrome
// exposes navigator.mediaSession. All calls guarded so web/older engines no-op.
const ms = typeof navigator !== 'undefined' && 'mediaSession' in navigator ? navigator.mediaSession : null;
function mediaState(state: MediaSessionPlaybackState) {
  if (ms) ms.playbackState = state;
}
function mediaPosition() {
  try {
    if (ms && isFinite(audio.duration)) {
      ms.setPositionState({ duration: audio.duration, position: audio.currentTime, playbackRate: 1 });
    }
  } catch {
    /* setPositionState unsupported — ignore */
  }
}

// Wire the element once, at module load — handlers outlive any screen so playback
// keeps going across the Support → Music transition.
audio.on('play', () => (emit({ playing: true }), mediaState('playing'), ambient.setDucked(true)));
audio.on('pause', () => (emit({ playing: false }), mediaState('paused'), ambient.setDucked(false)));
audio.on('ended', () => (emit({ playing: false }), mediaState('paused'), ambient.setDucked(false)));
audio.on('loadedmetadata', () => emit({ duration: audio.duration, ready: true }));
audio.on('durationchange', () => emit({ duration: audio.duration }));
audio.on('timeupdate', () => (emit({ position: audio.currentTime }), mediaPosition()));
audio.on('error', () => emit({ error: true, ready: false }));

export const audioControls = {
  /** Load a track once. No-op if already loaded (preserves position across screens). */
  ensureLoaded(src: string = TRACK) {
    if (loadedSrc === src) return;
    loadedSrc = src;
    emit({ error: false, ready: false, position: 0, duration: 0, playing: false });
    audio.load(src);
    if (ms) {
      try {
        ms.metadata = new MediaMetadata({ title: 'Come Home', artist: 'Come Home' });
        ms.setActionHandler('play', () => void audioControls.play());
        ms.setActionHandler('pause', () => audioControls.pause());
        ms.setActionHandler('seekto', (d) => typeof d.seekTime === 'number' && audioControls.seek(d.seekTime));
      } catch {
        /* metadata/handlers unsupported — ignore */
      }
    }
  },
  // Android autoplay policy: only ever called from a user gesture (§7).
  async play() {
    try {
      await audio.play();
    } catch {
      /* gesture/policy rejection — stays paused */
    }
  },
  pause: () => audio.pause(),
  toggle() {
    if (audio.paused) void audioControls.play();
    else audio.pause();
  },
  seek(t: number) {
    audio.seek(t);
    emit({ position: t });
  },
  skip(delta: number) {
    const dur = isFinite(audio.duration) ? audio.duration : 0;
    audioControls.seek(Math.max(0, Math.min(dur || audio.currentTime + delta, audio.currentTime + delta)));
  },
  stop() {
    audio.pause();
    audio.seek(0);
    loadedSrc = null;
    emit({ playing: false, position: 0 });
  },
};

export function useAudio(): Snap {
  return useSyncExternalStore(
    (l) => (listeners.add(l), () => listeners.delete(l)),
    () => snap,
    () => snap,
  );
}
