import { motion } from 'framer-motion';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

// session === null → browsing as guest (no progress saved).
export default function Home({
  session,
  onSignIn,
}: {
  session: Session | null;
  onSignIn: () => void;
}) {
  return (
    <main className="flex min-h-full flex-col items-center justify-center gap-6 bg-slate-900 text-slate-100">
      <motion.h1
        className="text-4xl font-semibold tracking-tight"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        Come Home
      </motion.h1>

      {session ? (
        <div className="flex flex-col items-center gap-3 text-sm text-slate-400">
          <span>{session.user.email}</span>
          <button
            onClick={() => supabase.auth.signOut()}
            className="rounded-lg px-4 py-2 ring-1 ring-slate-700 hover:bg-slate-800"
          >
            Log out
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 text-sm text-slate-400">
          <span>Guest — progress won’t be saved</span>
          <button
            onClick={onSignIn}
            className="rounded-lg px-4 py-2 ring-1 ring-slate-700 hover:bg-slate-800"
          >
            Sign in
          </button>
        </div>
      )}
    </main>
  );
}
