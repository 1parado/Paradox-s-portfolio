'use client';

import { useEffect, useRef } from 'react';

/**
 * Living luminous field — cursor-reactive orbs + grain.
 * Signature atmosphere for the Paradox desktop art canvas.
 */
export function AmbientCanvas() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const pointerRef = useRef({ x: 0.5, y: 0.4 });
  const smoothRef = useRef({ x: 0.5, y: 0.4 });
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const root = rootRef.current;
    if (!root || reduce) return;

    const onMove = (event: PointerEvent) => {
      pointerRef.current = {
        x: event.clientX / window.innerWidth,
        y: event.clientY / window.innerHeight,
      };
    };

    const tick = () => {
      const target = pointerRef.current;
      const smooth = smoothRef.current;
      smooth.x += (target.x - smooth.x) * 0.06;
      smooth.y += (target.y - smooth.y) * 0.06;
      root.style.setProperty('--px', smooth.x.toFixed(4));
      root.style.setProperty('--py', smooth.y.toFixed(4));
      rafRef.current = window.requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    rafRef.current = window.requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('pointermove', onMove);
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[1] overflow-hidden"
      style={{
        // CSS custom properties consumed by child layers
        ['--px' as string]: 0.5,
        ['--py' as string]: 0.4,
      }}
    >
      <div className="ambient-orb ambient-orb--cyan" />
      <div className="ambient-orb ambient-orb--violet" />
      <div className="ambient-orb ambient-orb--rose" />
      <div className="ambient-grid" />
      <div className="ambient-grain" />
      <div className="ambient-vignette" />
    </div>
  );
}
