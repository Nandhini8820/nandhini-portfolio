import { useEffect, useState } from 'react';
import { getActiveSectionId, getHeaderHeight } from '../lib/navigation';

/** Tracks which section is on screen so the matching nav link can be highlighted. */
export function useActiveSection(ids: readonly string[]): string {
  const [active, setActive] = useState<string>(ids[0] ?? '');

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const positions = ids
        .map((id) => {
          const element = document.getElementById(id);
          return element ? { id, top: element.getBoundingClientRect().top + window.scrollY } : null;
        })
        .filter((p): p is { id: string; top: number } => p !== null);

      const next = getActiveSectionId(
        positions,
        window.scrollY,
        window.innerHeight,
        document.documentElement.scrollHeight,
        getHeaderHeight(),
      );
      if (next) setActive(next);
    };

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [ids]);

  return active;
}
