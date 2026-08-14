import { lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Home, LifeBuoy, Moon, Library, User } from 'lucide-react';
import TabBar, { type TabItem } from '../ui/TabBar';
import { hub, useHubTab, type TabId } from '../store/hub';
import { useReducedMotion } from '../lib/motion';

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
  const tab = useHubTab();
  const reduce = useReducedMotion();
  return (
    <div style={{ minHeight: '100%', paddingBottom: 92 }}>
      <Suspense fallback={<div className="screen" />}>
        <motion.div
          key={tab}
          className="min-h-full"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduce ? 0.001 : 0.42, ease: [0.22, 0.61, 0.36, 1] }}
        >
          {tab === 'home' && <HomeTab />}
          {tab === 'support' && <SupportTab />}
          {tab === 'sleep' && <SleepTab />}
          {tab === 'library' && <LibraryTab />}
          {tab === 'profile' && <ProfileTab />}
        </motion.div>
      </Suspense>
      <TabBar items={TABS} active={tab} onChange={(id) => hub.setTab(id as TabId)} />
    </div>
  );
}
