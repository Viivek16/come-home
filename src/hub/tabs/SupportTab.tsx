import { session, type Emotion } from '../../store/session';
import { app } from '../../store/app';
import { SUPPORT_CATEGORIES } from '../../data/supportCategories';

/** §6 Support. Hard-moment categories → start a session in that emotion. */
export default function SupportTab() {
  const open = (emotion: Emotion) => {
    session.reset();
    session.pickEmotion(emotion); // sets emotion + jumps to Response
    app.setView('session');
  };

  return (
    <div className="screen">
      <div className="mx-auto w-full max-w-md py-10">
        <div className="eyebrow">Support</div>
        <h1 className="serif" style={{ fontSize: 'var(--t-xl)', marginTop: 8, marginBottom: 20 }}>
          What's here right now?
        </h1>
        <div className="grid grid-cols-2 gap-3">
          {SUPPORT_CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => open(c.emotion)}
              className="glass min-h-[92px] px-4 py-4 text-left transition-transform duration-300 active:scale-[0.99]"
              style={{ borderRadius: 'var(--radius-card)', transitionTimingFunction: 'var(--ease-calm)' }}
            >
              <span style={{ color: 'var(--ink)', fontSize: 'var(--t-md)' }}>{c.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
