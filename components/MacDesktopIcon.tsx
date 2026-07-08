'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { AppGlyph } from '@/components/AppGlyph';
import type { AppItem } from '@/lib/types';

type Props = {
  app: AppItem;
  editing: boolean;
  compact?: boolean;
  selected?: boolean;
  onOpen: (app: AppItem) => void;
  onLongPress: (app: AppItem) => void;
};

export function MacDesktopIcon({ app, editing, compact = false, selected = false, onOpen, onLongPress }: Props) {
  const timerRef = useRef<number | null>(null);
  const longPressedRef = useRef(false);

  const clearLongPress = () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => clearLongPress, []);

  return (
    <motion.button
      type="button"
      layoutId={compact ? undefined : `desktop-window-${app.id}`}
      aria-label={app.title}
      className={[
        'group flex flex-col items-center rounded-2xl p-1 text-center text-white outline-none transition hover:bg-white/10',
        selected ? 'bg-sky-300/18 ring-1 ring-sky-200/50' : '',
        compact ? 'w-16 gap-1' : 'w-24 gap-2',
      ].join(' ')}
      whileHover={{ y: compact ? -8 : -2, scale: compact ? 1.12 : 1.02 }}
      whileTap={{ scale: 0.94 }}
      onClick={() => {
        if (longPressedRef.current) {
          longPressedRef.current = false;
          return;
        }
        if (!editing) onOpen(app);
      }}
      onPointerDown={(event) => {
        if (editing || (event.pointerType === 'mouse' && event.button !== 0)) return;
        longPressedRef.current = false;
        clearLongPress();
        timerRef.current = window.setTimeout(() => {
          longPressedRef.current = true;
          onLongPress(app);
        }, 520);
      }}
      onPointerLeave={clearLongPress}
      onPointerCancel={clearLongPress}
      onPointerMove={clearLongPress}
      onPointerUp={clearLongPress}
      onContextMenu={(event) => {
        event.preventDefault();
        onLongPress(app);
      }}
    >
      <span
        className={[
          'relative flex items-center justify-center bg-gradient-to-br text-3xl shadow-[0_12px_30px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.22)] ring-1 transition group-hover:ring-white/35',
          selected ? 'ring-sky-100/80' : 'ring-white/20',
          compact ? 'h-12 w-12 rounded-[1rem]' : 'h-16 w-16 rounded-[1.25rem]',
          app.color,
          editing ? 'app-jiggle' : '',
        ].join(' ')}
      >
        <span className="absolute inset-x-2 top-1 h-4 rounded-full bg-white/25 blur-[1px]" />
        <span className="relative text-white">
          <AppGlyph iconKey={app.iconKey} fallback={app.icon} className={compact ? 'h-7 w-7' : 'h-9 w-9'} />
        </span>
      </span>
      {!compact ? (
        <span className="max-w-full rounded-md bg-black/20 px-1.5 py-0.5 text-[12px] font-medium leading-tight text-white shadow-sm backdrop-blur group-focus-visible:ring-2 group-focus-visible:ring-white/70">
          {app.title}
        </span>
      ) : null}
    </motion.button>
  );
}
