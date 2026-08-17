import { useEffect, useRef, useState } from 'react';
import { PenLine, Trash2, ArrowLeft } from 'lucide-react';
import Reveal from '../ui/Reveal';
import Button from '../ui/Button';
import ExitButton from '../ui/ExitButton';
import { app } from '../store/app';
import { nav } from '../nav/history';
import { setDepth } from '../store/water';
import {
  getJournal,
  saveJournalEntry,
  deleteJournalEntry,
  type JournalEntry,
} from '../lib/storage';

/** Open the private journal — a view, not a nav tab (§Phase F). */
export function openJournal() {
  app.setView('journal');
}

/**
 * Gentle, trauma-safe prompts (§Phase F). Open and kind — never probing, never
 * clinical. Each is an invitation, easy to ignore. A blank page is always offered
 * alongside them so nothing is required.
 */
const PROMPTS = [
  'What’s here right now?',
  'What would feel kind today?',
  'What helped, even a little?',
  'What are you grateful for, however small?',
  'What do you want to set down tonight?',
];

type Draft = { id?: string; prompt?: string; text: string };

/**
 * Private journal (§Phase F). Guided prompt cards + a blank page. Entries live on
 * this device only — never shared, never uploaded. Editing and deleting are gentle
 * (a soft two-tap to remove). No counter, no streak, no obligation to write.
 */
export default function Journal() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [draft, setDraft] = useState<Draft | null>(null); // non-null = writing
  const [confirmDel, setConfirmDel] = useState<string | null>(null);

  const refresh = () => getJournal().then(setEntries);
  useEffect(() => {
    setDepth('checkin'); // a calm, settled water depth for the page
    refresh();
  }, []);

  const writing = draft !== null;

  const openBlank = () => setDraft({ text: '' });
  const openPrompt = (p: string) => setDraft({ prompt: p, text: '' });
  const openEdit = (e: JournalEntry) => setDraft({ id: e.id, prompt: e.prompt, text: e.text });

  // Leaving the page keeps whatever was written — an empty draft is simply let go.
  const closeDraft = async () => {
    if (draft && draft.text.trim()) {
      await saveJournalEntry({ id: draft.id, prompt: draft.prompt, text: draft.text.trim() });
    }
    setDraft(null);
    await refresh();
  };

  const remove = async (id: string) => {
    if (confirmDel !== id) {
      setConfirmDel(id);
      return;
    }
    await deleteJournalEntry(id);
    setConfirmDel(null);
    await refresh();
  };

  if (writing) return <Writer draft={draft!} setDraft={setDraft} onDone={closeDraft} />;

  return (
    <div className="screen">
      <ExitButton onExit={() => nav.back()} />
      <div className="mx-auto w-full max-w-md py-10">
        <Reveal delay={0.05}>
          <div className="eyebrow">Journal</div>
          <h1 className="serif" style={{ fontSize: 'var(--t-2xl)', marginTop: 8, marginBottom: 8 }}>
            A page, just for you
          </h1>
          <p style={{ color: 'var(--ink-muted)', fontSize: 'var(--t-md)', lineHeight: 1.55 }}>
            Write as much or as little as you like. It stays on this device — nothing is shared.
          </p>
        </Reveal>

        {/* Gentle prompts — invitations, never assignments. */}
        <Reveal delay={0.14}>
          <div className="eyebrow" style={{ marginTop: 26, marginBottom: 12 }}>
            If you’d like a place to start
          </div>
          <div className="flex flex-col gap-2">
            {PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => openPrompt(p)}
                className="glass flex w-full items-center gap-3 px-5 py-4 text-left transition-transform duration-300 active:scale-[0.99]"
                style={{ borderRadius: 'var(--radius-card)', transitionTimingFunction: 'var(--ease-calm)' }}
              >
                <span className="serif-italic flex-1" style={{ color: 'var(--ink)', fontSize: 'var(--t-md)' }}>
                  {p}
                </span>
                <PenLine size={16} strokeWidth={1.6} color="var(--gold)" aria-hidden style={{ opacity: 0.7 }} />
              </button>
            ))}
          </div>
        </Reveal>

        {/* The one clear primary — a blank page, no prompt at all. */}
        <Reveal delay={0.24}>
          <div className="mt-4">
            <Button onClick={openBlank}>Start a blank page</Button>
          </div>
        </Reveal>

        {/* What’s been written before — tap to reopen, soft two-tap to remove. */}
        {entries.length > 0 && (
          <>
            <div className="eyebrow" style={{ marginTop: 34, marginBottom: 12 }}>
              Pages you’ve written
            </div>
            <div className="flex flex-col gap-3">
              {entries.map((e) => (
                <div
                  key={e.id}
                  className="glass px-5 py-4"
                  style={{ borderRadius: 'var(--radius-card)' }}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => openEdit(e)}
                      className="flex-1 text-left"
                      aria-label="Open entry"
                    >
                      <div className="eyebrow">{new Date(e.ts).toLocaleDateString()}</div>
                      {e.prompt && (
                        <div className="serif-italic" style={{ color: 'var(--gold)', fontSize: 'var(--t-sm)', marginTop: 4 }}>
                          {e.prompt}
                        </div>
                      )}
                      <div
                        style={{
                          color: 'var(--ink)',
                          fontSize: 'var(--t-md)',
                          marginTop: 4,
                          lineHeight: 1.5,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {e.text}
                      </div>
                    </button>
                    <button
                      onClick={() => remove(e.id)}
                      aria-label={confirmDel === e.id ? 'Tap again to remove' : 'Remove entry'}
                      className="shrink-0 grid place-items-center transition-transform duration-200 active:scale-[0.94]"
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 999,
                        color: confirmDel === e.id ? 'var(--gold)' : 'var(--ink-muted)',
                      }}
                    >
                      <Trash2 size={16} strokeWidth={1.6} />
                    </button>
                  </div>
                  {confirmDel === e.id && (
                    <div className="eyebrow" style={{ color: 'var(--gold)', marginTop: 8, textTransform: 'none', letterSpacing: 0 }}>
                      Tap the bin again to let this go.
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/** The writing surface. Optional prompt at the top; a calm full-height page. */
function Writer({
  draft,
  setDraft,
  onDone,
}: {
  draft: Draft;
  setDraft: (d: Draft) => void;
  onDone: () => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    // Soft focus into the page, but never on the very first paint (feels abrupt).
    const t = setTimeout(() => ref.current?.focus(), 260);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="screen">
      {/* Back to the journal (keeps whatever was written). One clear way out. */}
      <button
        onClick={onDone}
        aria-label="Back to journal"
        className="glass grid place-items-center transition-transform duration-200 active:scale-[0.96]"
        style={{
          position: 'fixed',
          top: 'calc(var(--safe-top) + 10px)',
          left: 'calc(env(safe-area-inset-left, 0px) + 14px)',
          zIndex: 15,
          width: 44,
          height: 44,
          borderRadius: 999,
          color: 'var(--ink-muted)',
          transitionTimingFunction: 'var(--ease-calm)',
        }}
      >
        <ArrowLeft size={18} strokeWidth={1.6} />
      </button>

      <div className="mx-auto flex w-full max-w-md flex-1 flex-col py-10" style={{ paddingTop: 'calc(var(--safe-top) + 64px)' }}>
        <Reveal delay={0.04}>
          {draft.prompt ? (
            <p className="serif-italic" style={{ color: 'var(--gold)', fontSize: 'var(--t-lg)', lineHeight: 1.4 }}>
              {draft.prompt}
            </p>
          ) : (
            <div className="eyebrow">A blank page</div>
          )}
        </Reveal>

        <Reveal delay={0.1} className="mt-4 flex-1 flex flex-col">
          <textarea
            ref={ref}
            value={draft.text}
            onChange={(e) => setDraft({ ...draft, text: e.target.value })}
            placeholder="Whatever wants to be said…"
            className="flex-1 w-full resize-none bg-transparent"
            style={{
              color: 'var(--ink)',
              fontFamily: 'var(--font-serif)',
              fontWeight: 300,
              fontSize: 'var(--t-lg)',
              lineHeight: 1.6,
              minHeight: '46vh',
              border: 'none',
              outline: 'none',
            }}
          />
        </Reveal>

        <Reveal delay={0.16} className="mt-4">
          <Button onClick={onDone}>{draft.text.trim() ? 'Keep this' : 'Done'}</Button>
        </Reveal>
      </div>
    </div>
  );
}
