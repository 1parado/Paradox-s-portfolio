'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import type { AppItem } from '@/lib/types';
import { MacDesktopIcon } from '@/components/MacDesktopIcon';

type Props = {
  apps: AppItem[];
  editing: boolean;
  runningIds: string[];
  minimizedIds: string[];
  dropActive: boolean;
  trashActive: boolean;
  trashCount: number;
  onOpen: (app: AppItem) => void;
  onLongPress: (app: AppItem) => void;
  onOpenTrash: () => void;
};

const MAX_SCALE = 0.62;
const RANGE = 130;

function magnify(distance: number) {
  if (distance >= RANGE) return { scale: 1, y: 0 };
  const t = 1 - distance / RANGE;
  const curve = Math.pow(t, 1.6);
  return { scale: 1 + MAX_SCALE * curve, y: -22 * curve };
}

export function MacDock({ apps, editing, runningIds, minimizedIds, dropActive, trashActive, trashCount, onOpen, onLongPress, onOpenTrash }: Props) {
  const [mouseX, setMouseX] = useState<number | null>(null);
  const iconRefs = useRef<(HTMLDivElement | null)[]>([]);

  return (
    <div className="absolute bottom-3 left-1/2 z-40 hidden -translate-x-1/2 md:block">
      <div
        id="mac-dock-dropzone"
        className={[
          'relative flex min-w-[34rem] max-w-[calc(100vw-4rem)] items-end justify-center gap-3 overflow-x-auto rounded-[1.9rem] border px-5 py-3 shadow-glass backdrop-blur-3xl transition',
          dropActive
            ? 'border-cyan-200/70 bg-cyan-300/18 ring-2 ring-cyan-200/40'
            : 'border-white/22 bg-white/[0.12]',
        ].join(' ')}
        onPointerMove={(event) => setMouseX(event.clientX)}
        onPointerLeave={() => setMouseX(null)}
      >
        <div className="pointer-events-none absolute inset-x-4 top-1 h-px bg-gradient-to-r from-transparent via-white/45 to-transparent" />
        {apps.map((app, index) => {
          const running = runningIds.includes(app.id);
          const minimized = minimizedIds.includes(app.id);
          const el = iconRefs.current[index];
          const center = el ? el.getBoundingClientRect().left + el.getBoundingClientRect().width / 2 : null;
          const distance = mouseX !== null && center !== null ? Math.abs(mouseX - center) : Infinity;
          const { scale, y } = magnify(distance);

          return (
            <motion.div
              key={app.id}
              ref={(node) => {
                iconRefs.current[index] = node;
              }}
              className="relative origin-bottom"
              title={app.title}
              animate={{ scale, y }}
              transition={{ type: 'spring', stiffness: 500, damping: 28, mass: 0.4 }}
            >
              <MacDesktopIcon app={app} editing={editing} compact onOpen={onOpen} onLongPress={onLongPress} />
              {running ? (
                <span
                  className={[
                    'absolute -bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full transition',
                    minimized ? 'bg-white/35' : 'bg-white/90 shadow-[0_0_8px_rgba(255,255,255,0.7)]',
                  ].join(' ')}
                />
              ) : null}
            </motion.div>
          );
        })}
        <div className="mx-1 h-12 w-px bg-white/18" />
        <motion.button
          type="button"
          id="mac-trash-dropzone"
          className={[
            'relative flex h-14 w-14 items-center justify-center rounded-2xl border transition',
            trashActive
              ? 'border-rose-200/75 bg-rose-400/24 ring-2 ring-rose-200/40 text-rose-100'
              : 'border-white/14 bg-white/10 text-white/85',
          ].join(' ')}
          title="废纸篓"
          aria-label="废纸篓"
          onClick={onOpenTrash}
          whileHover={{ scale: 1.08 }}
          transition={{ type: 'spring', stiffness: 400, damping: 22 }}
        >
          <Trash2 className={['h-6 w-6', trashCount > 0 ? '' : 'opacity-75'].join(' ')} strokeWidth={1.75} />
          {trashCount > 0 ? (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 font-mono text-[10px] font-semibold text-white">
              {trashCount}
            </span>
          ) : null}
        </motion.button>
      </div>
    </div>
  );
}
