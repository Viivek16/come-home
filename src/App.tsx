import { useState } from 'react';
import { useSession } from './lib/auth';
import Auth from './screens/Auth';
import Home from './screens/Home';

export default function App() {
  const { session, loading } = useSession();
  const [guest, setGuest] = useState(false);

  if (loading) {
    return <main className="min-h-full bg-slate-900" />;
  }

  if (!session && !guest) {
    return <Auth onGuest={() => setGuest(true)} />;
  }

  return <Home session={session} onSignIn={() => setGuest(false)} />;
}
