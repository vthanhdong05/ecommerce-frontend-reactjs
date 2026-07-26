import { useEffect, useState } from 'react';

/** Tailwind `md` breakpoint — 768px. */
const MIN_WIDTH = 768;

/**
 * Returns `true` when viewport is at least 768px wide, `false` otherwise.
 * `null` while still determining on first mount (SSR-safe).
 */
export function useDeviceGuard(): boolean | null {
  const [ok, setOk] = useState<boolean | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia(`(min-width: ${MIN_WIDTH}px)`);
    const update = () => setOk(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return ok;
}
