import { Wind, CloudRain, Moon, Activity, Flame, CircleDashed, Compass, type LucideIcon } from 'lucide-react';
import Reveal from '../../ui/Reveal';
import { session, type Emotion } from '../../store/session';
import { app } from '../../store/app';
import { SUPPORT_CATEGORIES } from '../../data/supportCategories';

const ICONS: Record<string, LucideIcon> = {
  panic: Wind,
  grief: CloudRain,
  sleep: Moon,
  treatment: Activity,
  anger: Flame,
  numb: CircleDashed,
  specific: Compass,
};

/** §6 Support. Hard-moment categories → start a session in that emotion. */
export default function SupportTab() {
  const open = (emotion: Emotion) => {
    session.reset();
    session.pickEmotion(emotion);
    app.setView('session');
  };

  return (
    <div className="screen">
      <div className="mx-auto w-full max-w-md py-10">
        <Reveal delay={0.05}>
          <div className="eyebrow">Support</div>
          <h1 className="serif" style={{ fontSize: 'var(--t-2xl)', marginTop: 8, marginBottom: 22 }}>
            What's here right now?
          </h1>
        </Reveal>
        <div className="grid grid-cols-2 gap-3">
          {SUPPORT_CATEGORIES.map((c, i) => {
            const Icon = ICONS[c.id] ?? Compass;
            return (
              <Reveal key={c.id} delay={0.14 + i * 0.05}>
                <button
                  onClick={() => open(c.emotion)}
                  className="glass flex min-h-[104px] w-full flex-col justify-between px-4 py-4 text-left transition-transform duration-300 active:scale-[0.98]"
                  style={{ borderRadius: 'var(--radius-card)', transitionTimingFunction: 'var(--ease-calm)' }}
                >
                  <Icon size={22} strokeWidth={1.4} color="var(--gold)" />
                  <span style={{ color: 'var(--ink)', fontSize: 'var(--t-md)' }}>{c.label}</span>
                </button>
              </Reveal>
            );
          })}
        </div>
      </div>
    </div>
  );
}
