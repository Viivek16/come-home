import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Session } from '@supabase/supabase-js';
import { useSession } from './lib/auth';
import { player } from './lib/player';
import Auth from './screens/Auth';
import Home from './screens/Home';
import Category from './screens/Category';
import Player from './screens/Player';

function Routed({ session, onSignIn }: { session: Session | null; onSignIn: () => void }) {
  const location = useLocation();
  // Keyed by path → remounts and animates in on each navigation. (framer-motion
  // 13's AnimatePresence mode="wait" hangs here, so enter-only, no exit.)
  return (
    <motion.div
      key={location.pathname}
      className="min-h-full"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <Routes location={location}>
        <Route path="/" element={<Home session={session} onSignIn={onSignIn} />} />
        <Route path="/category/:slug" element={<Category />} />
        <Route path="/player/:id" element={<Player />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </motion.div>
  );
}

export default function App() {
  const { session, loading } = useSession();
  const [guest, setGuest] = useState(false);

  // Keep the global player's user in sync so progress writes are gated on sign-in.
  useEffect(() => {
    player.setUser(session?.user.id ?? null);
  }, [session]);

  if (loading) return <main className="min-h-full bg-slate-950" />;
  if (!session && !guest) return <Auth onGuest={() => setGuest(true)} />;

  return (
    <BrowserRouter>
      <Routed session={session} onSignIn={() => setGuest(false)} />
    </BrowserRouter>
  );
}
