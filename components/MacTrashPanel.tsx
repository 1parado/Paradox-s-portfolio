'use client';

import { motion } from 'framer-motion';
import { AppGlyph } from '@/components/AppGlyph';
import type { AppItem } from '@/lib/types';

type Props = {
  trash: AppItem[];
  onClose: () => void;
  onRestore: (itemId: string) => void;
  onEmpty: () => void;
  onOpen: (app: AppItem) => void;
};

export function MacTrashPanel({ trash, onClose, onRestore, onEmpty, onOpen }: Props) {
  return (
    <motion.div
      className="absolute inset-0 z-[68] flex items-center justify-center bg-black/42 p-6 text-white backdrop-blur-xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.section
        className="flex h-[min(560px,72vh)] w-[min(720px,88vw)] flex-col overflow-hidden rounded-[1.1rem] border border-white/18 bg-zinc-950/92 shadow-[0_32px_110px_rgba(0,0,0,0.5)]"
        initial={{ scale: 0.96, y: 12 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.96, y: 12 }}
        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex h-11 shrink-0 items-center gap-2 border-b border-white/10 bg-white/[0.04] px-4">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          </div>
          <div className="ml-2 text-sm font-semibold text-white/85">废纸篓</div>
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              disabled={trash.length === 0}
              className="rounded-md bg-white/10 px-3 py-1 text-xs text-white/80 transition enabled:hover:bg-white/20 disabled:opacity-40"
              onClick={onEmpty}
            >
              清空废纸篓
            </button>
            <button type="button" className="rounded-md bg-white/10 px-3 py-1 text-xs text-white/80 transition hover:bg-white/20" onClick={onClose}>
              关闭
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto p-3">
          {trash.length > 0 ? (
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
              {trash.map((item) => (
                <div key={item.id} className="group flex flex-col items-center gap-1.5 rounded-lg p-2 text-center">
                  <button
                    type="button"
                    className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-2xl shadow-lg transition group-hover:scale-105"
                    onClick={() => {
                      onClose();
                      onOpen(item);
                    }}
                  >
                    <AppGlyph iconKey={item.iconKey} fallback={item.icon} className="h-8 w-8" />
                  </button>
                  <span className="line-clamp-2 text-xs text-white/85">{item.title}</span>
                  <button
                    type="button"
                    className="rounded bg-white/8 px-2 py-0.5 text-[10px] text-white/60 transition hover:bg-white/16"
                    onClick={() => onRestore(item.id)}
                  >
                    放回
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-40 flex-col items-center justify-center gap-2 text-sm text-white/45">
              <span className="text-4xl">🗑</span>
              <span>废纸篓是空的。</span>
            </div>
          )}
        </div>
      </motion.section>
    </motion.div>
  );
}
