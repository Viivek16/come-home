import { useEffect, useState } from 'react';
import { audio } from './audio';
import type { Meditation } from '../data/meditations';

// Bridges the single audio element to React. Guests and signed-in users share
// this; progress is not persisted here.
export function usePlayer() {
  const [current, setCurrent] = useState<Meditation | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const offPlay = audio.on('play', () => setPlaying(true));
    const offPause = audio.on('pause', () => setPlaying(false));
    const offEnded = audio.on('ended', () => setPlaying(false));
    return () => {
      offPlay();
      offPause();
      offEnded();
    };
  }, []);

  async function play(m: Meditation) {
    if (current?.id !== m.id) {
      audio.load(m.audio_url);
      setCurrent(m);
    }
    await audio.play();
  }

  function toggle() {
    if (current) audio.toggle();
  }

  return { current, playing, play, toggle };
}
