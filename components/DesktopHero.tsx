'use client';

import { motion } from 'framer-motion';

type Props = {
  appCount: number;
  windowCount: number;
};

export function DesktopHero({ appCount, windowCount }: Props) {
  return (
    <motion.div
      className="pointer-events-none absolute left-8 top-[4.5rem] z-[15] w-[min(22rem,42vw)] select-none"
      initial={{ opacity: 0, y: 28, filter: 'blur(8px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      transition={{ type: 'spring', stiffness: 120, damping: 22, mass: 0.9 }}
    >
      <div className="desktop-hero-panel relative overflow-hidden rounded-[1.75rem] border border-white/14 bg-black/25 px-6 py-5 shadow-[0_40px_120px_rgba(0,0,0,0.45)] backdrop-blur-2xl">
        <div className="pointer-events-none absolute -right-10 -top-16 h-40 w-40 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-8 h-32 w-32 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

        <div className="relative">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/8 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.28em] text-white/55">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
              Live Desktop
            </span>
            <span className="font-mono text-[11px] tabular-nums text-white/35">SYS // PARADOX</span>
          </div>

          <h1 className="desktop-hero-title mt-3 leading-[0.88] tracking-[-0.04em] text-white">
            <span className="block font-display text-[clamp(2.2rem,3.6vw,3.25rem)] font-medium">
              Paradox
            </span>
            <span className="mt-0.5 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <span className="font-display text-[clamp(1.9rem,3.2vw,2.75rem)] font-light italic text-white/88">
                portfolio
              </span>
              <span className="font-mono text-xs font-normal tracking-[0.18em] text-cyan-200/70 not-italic">
                / OS
              </span>
            </span>
          </h1>

          <div className="mt-4 flex flex-wrap items-end gap-5 border-t border-white/10 pt-4">
            <Stat label="Apps" value={String(appCount).padStart(2, '0')} />
            <Stat label="Windows" value={String(windowCount).padStart(2, '0')} />
            <Stat label="Mode" value="Immersive" mono={false} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Stat({ label, value, mono = true }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/35">{label}</div>
      <div className={['mt-0.5 text-xl font-medium tracking-tight text-white', mono ? 'font-mono tabular-nums' : 'font-display italic'].join(' ')}>
        {value}
      </div>
    </div>
  );
}
