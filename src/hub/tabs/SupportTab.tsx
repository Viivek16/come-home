import Reveal from '../../ui/Reveal';
import { SUPPORT_DISEASES } from '../../data/supportCategories';
import { FEELINGS } from '../../data/feelings';

/** §6 Support (in-app user flow). Two option blocks: a disease list and the six
 *  felt-states. Lists only for now — rows are inert ("soon") until real guided
 *  content exists, so nothing routes to a broken/empty session. */
export default function SupportTab() {
  return (
    <div className="screen">
      <div className="mx-auto w-full max-w-md py-10">
        <Reveal delay={0.05}>
          <div className="eyebrow">Support</div>
          <h1 className="serif" style={{ fontSize: 'var(--t-2xl)', marginTop: 8, marginBottom: 22 }}>
            What's here right now?
          </h1>
        </Reveal>

        <SupportBlock delay={0.12} title="Are you dealing with some disease?" items={SUPPORT_DISEASES} />
        <SupportBlock delay={0.22} title="How are you feeling today?" items={FEELINGS.map((f) => f.label)} />
      </div>
    </div>
  );
}

/** A titled list of inert option rows — the diagram's lists, honestly marked "soon". */
function SupportBlock({ title, items, delay }: { title: string; items: string[]; delay: number }) {
  return (
    <div style={{ marginTop: 26 }}>
      <Reveal delay={delay}>
        <div className="eyebrow" style={{ marginBottom: 10 }}>
          {title}
        </div>
      </Reveal>
      <div className="glass" style={{ borderRadius: 'var(--radius-card)', overflow: 'hidden' }}>
        {items.map((label, i) => (
          <div
            key={label}
            className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: i === items.length - 1 ? 'none' : '1px solid var(--hairline)', minHeight: 56 }}
          >
            <span style={{ color: 'var(--ink)', fontSize: 'var(--t-md)' }}>{label}</span>
            <span className="eyebrow shrink-0" style={{ color: 'var(--gold)' }}>
              Soon
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
