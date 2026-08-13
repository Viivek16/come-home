import { useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';

export default function Auth({ onGuest }: { onGuest: () => void }) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMsg(error.message);
      // success → onAuthStateChange drives navigation
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) setMsg(error.message);
      else if (!data.session) setMsg('Account created. Confirm via email, then log in.');
    }
    setBusy(false);
  }

  return (
    <main className="flex min-h-full flex-col items-center justify-center bg-slate-900 px-6 text-slate-100">
      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex w-full max-w-sm flex-col gap-4"
      >
        <h1 className="text-3xl font-semibold tracking-tight">Come Home</h1>

        <input
          type="email"
          required
          placeholder="Email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-lg bg-slate-800 px-4 py-3 outline-none ring-1 ring-slate-700 focus:ring-slate-400"
        />
        <input
          type="password"
          required
          minLength={6}
          placeholder="Password"
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-lg bg-slate-800 px-4 py-3 outline-none ring-1 ring-slate-700 focus:ring-slate-400"
        />

        {msg && <p className="text-sm text-amber-400">{msg}</p>}

        <button
          type="submit"
          disabled={busy}
          className="rounded-lg bg-slate-100 px-4 py-3 font-medium text-slate-900 disabled:opacity-50"
        >
          {busy ? '…' : mode === 'login' ? 'Log in' : 'Sign up'}
        </button>

        <button
          type="button"
          onClick={() => {
            setMode(mode === 'login' ? 'signup' : 'login');
            setMsg(null);
          }}
          className="text-sm text-slate-400 hover:text-slate-200"
        >
          {mode === 'login' ? 'Need an account? Sign up' : 'Have an account? Log in'}
        </button>

        <button
          type="button"
          onClick={onGuest}
          className="mt-2 rounded-lg px-4 py-3 text-slate-300 ring-1 ring-slate-700 hover:bg-slate-800"
        >
          Continue as guest
        </button>
      </motion.form>
    </main>
  );
}
