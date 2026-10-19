import { useEffect, useState } from 'react';
import { prefersReducedMotion } from '../../lib/navigation';

interface RotatingTextProps {
  items: string[];
  intervalMs?: number;
}

/**
 * Cycles through short phrases with a soft fade. Screen readers get the full list once;
 * people who prefer reduced motion see the first phrase without cycling.
 */
export function RotatingText({ items, intervalMs = 2600 }: RotatingTextProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (items.length < 2 || prefersReducedMotion()) return;
    const timer = window.setInterval(() => setIndex((i) => (i + 1) % items.length), intervalMs);
    return () => window.clearInterval(timer);
  }, [items.length, intervalMs]);

  if (items.length === 0) return null;

  return (
    <span className="rotating">
      <span className="visually-hidden">{items.join(', ')}</span>
      <span className="rotating__viewport" aria-hidden="true">
        <span key={index} className="rotating__item" data-testid="rotating-item">
          {items[index]}
        </span>
      </span>
    </span>
  );
}
