import { useBreath } from '../breath/useBreath';

/** §6.5 waveform-ish visual that reacts to the BREATH clock (not the audio FFT —
 *  kept calm). A gentle travelling wave in gold. */
const BARS = 28;

export default function BreathWave() {
  const b = useBreath(); // 0..1, shared clock
  return (
    <div aria-hidden className="flex items-end justify-center gap-[3px]" style={{ height: 64 }}>
      {Array.from({ length: BARS }, (_, i) => {
        const h = 18 + 46 * (0.5 + 0.5 * Math.sin(i * 0.5 + b * Math.PI * 2));
        return (
          <span
            key={i}
            style={{
              width: 3,
              height: h,
              borderRadius: 999,
              background: 'var(--gold)',
              opacity: 0.28 + 0.4 * (h / 64),
            }}
          />
        );
      })}
    </div>
  );
}
