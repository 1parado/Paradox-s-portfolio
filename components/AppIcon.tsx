'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { AppGlyph } from '@/components/AppGlyph';
import type { AppItem } from '@/lib/types';

type Props = {
  app: AppItem;
  editing: boolean;
  onOpen: (app: AppItem) => void;
  onLongPress: (app: AppItem) => void;
};

export function AppIcon({ app, editing, onOpen, onLongPress }: Props) {
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
      layoutId={`app-${app.id}`}
      type="button"
      aria-label={app.title}
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
      onPointerUp={clearLongPress}
      onContextMenu={(event) => {
        event.preventDefault();
        onLongPress(app);
      }}
      className="group flex w-full flex-col items-center gap-2 text-center text-white"
      whileTap={{ scale: 0.94 }}
    >
      <div
        className={[
          'flex h-16 w-16 items-center justify-center rounded-[1.35rem] bg-gradient-to-br text-3xl shadow-lg shadow-black/20',
          app.color,
          editing ? 'app-jiggle' : '',
        ].join(' ')}
      >
        <AppGlyph iconKey={app.iconKey} fallback={app.icon} className="h-9 w-9" />
      </div>
      <span className="line-clamp-2 text-xs font-medium text-white/90">{app.title}</span>
    </motion.button>
  );
}
