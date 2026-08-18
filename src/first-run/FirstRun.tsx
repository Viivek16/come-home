import { useState } from 'react';
import Mark from '../ui/Mark';
import Button from '../ui/Button';
import Reveal from '../ui/Reveal';
import GoogleButton from '../ui/GoogleButton';
import { app } from '../store/app';
import { prefsStore } from '../store/prefs';
import { markFirstRunDone } from '../lib/storage';
import { signInWithGoogle, signUpWithEmail, signInWithEmail } from '../lib/auth';
import { isSupabaseConfigured } from '../lib/supabase';

/**
 * First run (§6) — now a single login screen. New users create an account (name +
 * email + password) or continue with Google; returning users log in. "Maybe later"
 * keeps the local-first path (the app works fully as a guest). Once past this, the
 * screen never shows again (markFirstRunDone), and a signed-in session skips it
 * entirely (see routeInIfSignedIn in lib/auth).
 */
type Mode = 'signup' | 'login';

export default function FirstRun() {
  const [mode, setMode] = useState<Mode>('signup');
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const isSignup = mode === 'signup';

  const skip = () => {
    markFirstRunDone();
    app.setView('hub');
  };

  const google = async () => {
    // Google supplies the name; just mark done before the redirect leaves the app.
    markFirstRunDone();
    await signInWithGoogle();
  };

  const swap = () => {
    setMode(isSignup ? 'login' : 'signup');
    setErr(null);
    setNotice(null);
  };

  const submit = async () => {
    setErr(null);
    setNotice(null);
    const e = email.trim();
    if (isSignup && !first.trim()) return setErr('Your first name, please.');
    if (!/^\S+@\S+\.\S+$/.test(e)) return setErr('Enter a valid email address.');
    if (password.length < 6) return setErr('Password needs at least 6 characters.');

    setBusy(true);
    try {
      if (isSignup) {
        const { needsConfirmation } = await signUpWithEmail({ firstName: first, lastName: last, email: e, password });
        if (needsConfirmation) {
          setNotice('Check your email to confirm your account, then log in here.');
          setMode('login');
          setBusy(false);
          return;
        }
        prefsStore.setName(first.trim()); // instant greeting while the profile loads
      } else {
        await signInWithEmail(e, password);
      }
      markFirstRunDone();
      app.setView('hub'); // auth store also routes in, this makes it immediate
    } catch (ex) {
      setErr(friendly(ex));
      setBusy(false);
    }
  };

  return (
    <div className="screen">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-8">
        <Reveal delay={0.05}>
          <div className="flex flex-col items-center text-center">
            <Mark size={68} />
            <h1 className="serif" style={{ fontSize: 'var(--t-2xl)', marginTop: 14, lineHeight: 1.05 }}>
              {isSignup ? 'Come home.' : 'Welcome back.'}
            </h1>
            <p style={{ color: 'var(--ink-muted)', marginTop: 6, fontSize: 'var(--t-md)' }}>
              {isSignup ? 'A calm place, kept just for you.' : 'Sign in to pick up where you left off.'}
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.14}>
          <div className="glass glass-strong mt-8" style={{ padding: 20, borderRadius: 'var(--radius-card)' }}>
            {isSignup && (
              <div className="grid grid-cols-2 gap-3">
                <Field label="First name" value={first} onChange={setFirst} autoComplete="given-name" />
                <Field label="Last name" value={last} onChange={setLast} autoComplete="family-name" hint="optional" />
              </div>
            )}
            <Field label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" className={isSignup ? 'mt-3' : ''} />
            <Field
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              className="mt-3"
              onEnter={submit}
            />

            {err && (
              <p role="alert" style={{ color: '#e7b3a0', fontSize: 'var(--t-sm)', marginTop: 12 }}>
                {err}
              </p>
            )}
            {notice && (
              <p style={{ color: 'var(--gold)', fontSize: 'var(--t-sm)', marginTop: 12, lineHeight: 1.5 }}>
                {notice}
              </p>
            )}

            <Button className="mt-4 w-full" onClick={submit} disabled={busy}>
              {busy ? 'One moment…' : isSignup ? 'Create account' : 'Log in'}
            </Button>
          </div>
        </Reveal>

        {isSupabaseConfigured && (
          <Reveal delay={0.2}>
            <div className="mt-5 flex items-center gap-3" aria-hidden>
              <span style={{ flex: 1, height: 1, background: 'var(--hairline)' }} />
              <span className="eyebrow" style={{ margin: 0 }}>or</span>
              <span style={{ flex: 1, height: 1, background: 'var(--hairline)' }} />
            </div>
            <div className="mt-5">
              <GoogleButton onClick={google} />
            </div>
          </Reveal>
        )}

        <Reveal delay={0.26}>
          <p className="text-center" style={{ marginTop: 18, color: 'var(--ink-muted)', fontSize: 'var(--t-sm)' }}>
            {isSignup ? 'Already have an account? ' : 'New here? '}
            <button onClick={swap} style={{ color: 'var(--gold)' }}>
              {isSignup ? 'Log in' : 'Create one'}
            </button>
          </p>
          <div className="mt-3 flex justify-center">
            <Button variant="ghost" onClick={skip}>
              Maybe later
            </Button>
          </div>
        </Reveal>
      </div>
    </div>
  );
}

/** A calm labelled input matching the app's glass fields. */
function Field({
  label,
  value,
  onChange,
  type = 'text',
  autoComplete,
  hint,
  className = '',
  onEnter,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  autoComplete?: string;
  hint?: string;
  className?: string;
  onEnter?: () => void;
}) {
  const id = `f-${label.toLowerCase().replace(/\s+/g, '-')}`;
  return (
    <div className={className}>
      <label htmlFor={id} className="eyebrow" style={{ display: 'block', marginBottom: 6 }}>
        {label}
        {hint && <span style={{ opacity: 0.6 }}> · {hint}</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onEnter?.()}
        autoComplete={autoComplete}
        className="glass w-full px-4 py-3"
        style={{ borderRadius: 'var(--radius-chip)', color: 'var(--ink)', fontSize: 'var(--t-md)' }}
      />
    </div>
  );
}

/** Turn Supabase's raw auth errors into gentle, human copy. */
function friendly(ex: unknown): string {
  const m = (ex instanceof Error ? ex.message : String(ex ?? '')).toLowerCase();
  if (m.includes('already registered') || m.includes('already exists')) return 'That email already has an account — try logging in.';
  if (m.includes('invalid login')) return "Email or password doesn't match.";
  if (m.includes('email not confirmed')) return 'Please confirm your email first, then log in.';
  if (m.includes('email') && m.includes('invalid')) return 'That email address looks invalid.';
  if (m.includes('rate limit') || m.includes('too many')) return 'Too many attempts just now — wait a minute and try again.';
  if (m.includes('password')) return 'That password is too short — use at least 6 characters.';
  return 'Something went wrong. Please try again.';
}
