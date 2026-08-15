import { lazy, Suspense } from 'react';
import { useToolId } from '../store/tool';

// Each tool is its own chunk (matches the hub-tab convention).
const TimerTool = lazy(() => import('./TimerTool'));
const BreatheTool = lazy(() => import('./BreatheTool'));

/** Full-screen host for the self-directed tools (§Phase2). */
export default function ToolHost() {
  const which = useToolId();
  return (
    <Suspense fallback={<div className="screen" />}>
      {which === 'timer' ? <TimerTool /> : <BreatheTool />}
    </Suspense>
  );
}
