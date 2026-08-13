import { useEffect, useRef } from 'react';
import lottie from 'lottie-web';
import ambient from '../assets/ambient.json';

// lottie-web directly (not lottie-react, which double-loads React under Vite 8 +
// React 19 → invalid hook call). Renders the one ambient loop behind the player.
export default function LottieAmbient({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const anim = lottie.loadAnimation({
      container: ref.current,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      animationData: ambient,
    });
    return () => anim.destroy();
  }, []);

  return <div ref={ref} className={className} aria-hidden="true" />;
}
