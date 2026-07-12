'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { AppGlyph } from '@/components/AppGlyph';
import type { AppItem } from '@/lib/types';

type MissionWindow = {
  id: string;
  app: AppItem;
  minimized: boolean;
};

type Props = {
  windows: MissionWindow[];
  onSelect: (id: string) => void;
  onClose: (id: string) => void;
  onCloseAll: () => void;
  onCloseMissionControl: () => void;
};

const SPACES = [
  { id: 'desktop', label: '桌面', active: true },
  { id: 'dashboard', label: 'Dashboard', active: false },
];

export function MacMissionControl({ windows, onSelect, onClose, onCloseAll, onCloseMissionControl }: Props) {
  return (
    <motion.div
      className="absolute inset-0 z-[70] flex flex-col bg-black/55 p-8 text-white backdrop-blur-2xl"
      initial={{ opacity: 0, scale: 1.04 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ type: 'spring', stiffness: 220, damping: 30 }}
      onClick={onCloseMissionControl}
    >
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">Mission Control</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">打开的窗口 · {windows.length}</h2>
        </div>
        <div className="flex items-center gap-2">
          {windows.length > 0 ? (
            <button
              type="button"
              className="rounded-full bg-white/12 px-4 py-2 text-sm text-white/80 transition hover:bg-white/20"
              onClick={(event) => {
                event.stopPropagation();
                onCloseAll();
              }}
            >
              全部关闭
            </button>
          ) : null}
          <button
            type="button"
            className="rounded-full bg-white/12 px-4 py-2 text-sm text-white/80 transition hover:bg-white/20"
            onClick={(event) => {
              event.stopPropagation();
              onCloseMissionControl();
            }}
          >
            关闭
          </button>
        </div>
      </div>

      <div className="mb-6 flex items-center gap-3 border-b border-white/10 pb-4">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/40">空间</span>
        {SPACES.map((space) => (
          <div
            key={space.id}
            className={[
              'rounded-xl border px-4 py-2 text-sm transition',
              space.active ? 'border-sky-200/60 bg-sky-300/18 text-white' : 'border-white/12 bg-white/6 text-white/55',
            ].join(' ')}
          >
            {space.label}
          </div>
        ))}
        <span className="text-xs text-white/35">提示：将窗口拖至屏幕顶栏可进入 Mission Control</span>
      </div>

      <div className="grid flex-1 grid-cols-3 content-start gap-5 overflow-auto xl:grid-cols-4">
        <AnimatePresence>
          {windows.length > 0
            ? windows.map((window) => (
                <motion.div
                  key={window.id}
                  layout
                  role="button"
                  tabIndex={0}
                  className="group relative rounded-[1.3rem] border border-white/14 bg-white/10 p-4 text-left shadow-2xl shadow-black/25 transition hover:-translate-y-1 hover:bg-white/16"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={(event) => {
                    event.stopPropagation();
                    onSelect(window.id);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      event.stopPropagation();
                      onSelect(window.id);
                    }
                  }}
                >
                  <button
                    type="button"
                    aria-label="关闭该窗口"
                    className="absolute right-2 top-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-black/40 text-xs text-white/70 opacity-0 transition group-hover:opacity-100 hover:bg-red-500/80"
                    onClick={(event) => {
                      event.stopPropagation();
                      onClose(window.id);
                    }}
                  >
                    ×
                  </button>
                  <div className="flex h-36 items-center justify-center rounded-2xl border border-white/10 bg-zinc-950/60">
                    <div className={`flex h-16 w-16 items-center justify-center rounded-[1.25rem] bg-gradient-to-br ${window.app.color}`}>
                      <AppGlyph iconKey={window.app.iconKey} fallback={window.app.icon} className="h-9 w-9" />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="truncate text-sm font-semibold">{window.app.title}</span>
                    {window.minimized ? <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/55">已最小化</span> : null}
                  </div>
                </motion.div>
              ))
            : (
              <div className="col-span-full rounded-[1.3rem] border border-dashed border-white/20 bg-white/8 p-8 text-center text-white/60">
                还没有打开任何窗口。从 Dock 或桌面双击应用即可打开。
              </div>
            )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
