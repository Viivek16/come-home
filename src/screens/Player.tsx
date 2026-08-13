import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import Screen from '../components/Screen';
import LottieAmbient from '../components/LottieAmbient';
import { BackIcon, PlayIcon, PauseIcon } from '../components/icons';
import { usePlayer, player } from '../lib/player';
import { getMeditation, type Meditation } from '../data/meditations';

function fmt(s: number) {
  if (!isFinite(s) || s < 0) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export default function Player() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [med, setMed] = useState<Meditation | null>(null);
  const [notFound, setNotFound] = useState(false);
  const p = usePlayer();

  useEffect(() => {
    if (!id) return;
    getMeditation(id)
      .then((m) => (m ? setMed(m) : setNotFound(true)))
      .catch(() => setNotFound(true));
  }, [id]);

  const isCurrent = !!med && p.current?.id === med.id;
  const playing = isCurrent && p.playing;
  const duration = (isCurrent ? p.duration : med?.duration_sec) ?? 0;
  const position = isCurrent ? p.position : 0;
  const remaining = Math.max(0, duration - position);

  function toggle() {
    if (!med) return;
    if (isCurrent) player.toggle();
    else void player.play(med);
  }

  return (
    <Screen className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-slate-100">
      {/* one ambient Lottie loop, softened with blur, behind everything */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-70 blur-3xl">
        <LottieAmbient className="h-[130%] w-[130%]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-full max-w-md flex-col px-6 pb-14 pt-12">
        <button
          onClick={() => navigate(-1)}
          className="-ml-1 flex items-center gap-1 text-slate-300/80 hover:text-white"
        >
          <BackIcon />
          <span className="text-sm">Back</span>
        </button>

        {notFound ? (
          <div className="flex flex-1 items-center justify-center text-slate-300">
            Meditation not found.
          </div>
        ) : (
          <>
            <div className="mt-10 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">{med?.title ?? '…'}</h1>
              {med?.description && <p className="mt-2 text-slate-300/70">{med.description}</p>}
            </div>

            <div className="flex flex-1 items-center justify-center">
              <motion.button
                onClick={toggle}
                aria-label={playing ? 'Pause' : 'Play'}
                animate={playing ? { scale: [1, 1.06, 1] } : { scale: 1 }}
                transition={
                  playing ? { duration: 4, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.3 }
                }
                className="grid h-40 w-40 place-items-center rounded-full bg-white/10 text-white ring-1 ring-white/25 backdrop-blur-md transition active:scale-95"
              >
                <span className={playing ? '' : 'ml-1'}>
                  {playing ? <PauseIcon /> : <PlayIcon />}
                </span>
              </motion.button>
            </div>

            <div>
              <input
                type="range"
                min={0}
                max={duration || 0}
                step={0.5}
                value={position}
                disabled={!isCurrent}
                onChange={(e) => player.seek(Number(e.target.value))}
                className="w-full accent-white/90 disabled:opacity-40"
              />
              <div className="mt-1 flex justify-between text-sm tabular-nums text-slate-300/70">
                <span>{fmt(position)}</span>
                <span>-{fmt(remaining)}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </Screen>
  );
}
