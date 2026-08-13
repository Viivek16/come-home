import { lazy, Suspense, useState } from 'react';
import { Home, LifeBuoy, Moon, Library, User } from 'lucide-react';
import TabBar, { type TabItem } from '../ui/TabBar';

// Lazy-load hub tabs (§12) — each panel is its own chunk.
const HomeTab = lazy(() => import('./tabs/HomeTab'));
const SupportTab = lazy(() => import('./tabs/SupportTab'));
const SleepTab = lazy(() => import('./tabs/SleepTab'));
const LibraryTab = lazy(() => import('./tabs/LibraryTab'));
const ProfileTab = lazy(() => import('./tabs/ProfileTab'));

const TABS: TabItem[] = [
  { id: 'home', label: 'Home', Icon: Home },
  { id: 'support', label: 'Support', Icon: LifeBuoy },
  { id: 'sleep', label: 'Sleep', Icon: Moon },
  { id: 'library', label: 'Library', Icon: Library },
  { id: 'profile', label: 'Profile', Icon: User },
];

/** Returning-user hub (§6). Bottom tab bar; content scrolls above it. */
export default function Hub() {
  const [tab, setTab] = useState('home');
  return (
    <div style={{ minHeight: '100%', paddingBottom: 92 }}>
      <Suspense fallback={<div className="screen" />}>
        {tab === 'home' && <HomeTab />}
        {tab === 'support' && <SupportTab />}
        {tab === 'sleep' && <SleepTab />}
        {tab === 'library' && <LibraryTab />}
        {tab === 'profile' && <ProfileTab />}
      </Suspense>
      <TabBar items={TABS} active={tab} onChange={setTab} />
    </div>
  );
}
