import { useState } from 'react';

/**
 * "Continue with Google" — the one live sign-in control, shared by first-run and
 * Profile. On web `onClick` redirects the page away, so the busy state mostly
 * matters on native / if the redirect can't start.
 */
export default function GoogleButton({
  label = 'Continue with Google',
  onClick,
}: {
  label?: string;
  onClick: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const go = async () => {
    setErr(null);
    setBusy(true);
    try {
      await onClick();
    } catch {
      setErr('Sign-in could not start. Please try again.');
      setBusy(false);
    }
  };

  return (
    <>
      <button
        onClick={go}
        disabled={busy}
        className="flex w-full items-center justify-center gap-3"
        style={{
          minHeight: 52,
          borderRadius: 999,
          border: '1px solid var(--hairline)',
          color: 'var(--ink)',
          background: 'rgba(255,255,255,0.04)',
          fontSize: 'var(--t-md)',
          opacity: busy ? 0.6 : 1,
        }}
      >
        <GoogleG />
        {busy ? 'Opening…' : label}
      </button>
      {err && <p style={{ color: 'var(--ink-muted)', fontSize: 'var(--t-xs)', marginTop: 8 }}>{err}</p>}
    </>
  );
}

/** Google 'G' mark, inline SVG so nothing is fetched. */
function GoogleG() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.47.9 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
    </svg>
  );
}
