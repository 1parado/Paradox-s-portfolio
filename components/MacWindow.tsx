'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { AppGlyph } from '@/components/AppGlyph';
import { getBuiltinApp } from '@/components/builtin/registry';
import type { AppItem } from '@/lib/types';

type Props = {
  app: AppItem;
  zIndex: number;
  minimized: boolean;
  focused: boolean;
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
};

export function MacWindow({ app, zIndex, minimized, focused, onFocus, onClose, onMinimize }: Props) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [iframeError, setIframeError] = useState(false);
  const Builtin = useMemo(() => getBuiltinApp(app.builtinKey), [app.builtinKey]);
  const builtinShellClass = app.builtinKey === 'calculator' ? 'mx-auto h-full max-w-md' : 'h-full w-full';

  useEffect(() => {
    setIframeError(false);
    setRefreshKey(0);
  }, [app.id]);

  if (minimized) return null;

  return (
    <motion.section
      layoutId={`app-${app.id}`}
      className={[
        'absolute left-1/2 top-[12%] flex h-[min(690px,72vh)] w-[min(980px,82vw)] -translate-x-1/2 flex-col overflow-hidden rounded-[1.1rem] border text-white shadow-[0_30px_110px_rgba(0,0,0,0.48)] backdrop-blur-3xl',
        focused ? 'border-white/35 bg-zinc-950/70' : 'border-white/15 bg-zinc-950/55',
      ].join(' ')}
      style={{ zIndex }}
      drag
      dragMomentum={false}
      dragElastic={0}
      onPointerDown={onFocus}
      initial={{ opacity: 0, scale: 0.94, y: 18 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94, y: 18 }}
      transition={{ type: 'spring', stiffness: 250, damping: 28 }}
    >
      <div className="relative flex h-11 shrink-0 items-center gap-3 border-b border-white/10 bg-white/10 px-4 backdrop-blur-3xl">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/30" />
        <div className="flex items-center gap-2">
          <button type="button" className="h-3 w-3 rounded-full bg-[#ff5f57] ring-1 ring-black/15" aria-label="关闭窗口" onClick={onClose} />
          <button type="button" className="h-3 w-3 rounded-full bg-[#febc2e] ring-1 ring-black/15" aria-label="最小化窗口" onClick={onMinimize} />
          <button type="button" className="h-3 w-3 rounded-full bg-[#28c840] ring-1 ring-black/15" aria-label="聚焦窗口" onClick={onFocus} />
        </div>

        <div className="min-w-0 flex-1 text-center">
          <div className="truncate text-[13px] font-semibold text-white/90">{app.title}</div>
          <div className="truncate text-[11px] text-white/45">{app.url || `builtin://${app.builtinKey}`}</div>
        </div>

        <div className="flex items-center gap-2 text-[12px]">
          <button
            type="button"
            className="rounded-md bg-white/10 px-2 py-1 text-white/75 transition hover:bg-white/20"
            onClick={() => {
              setIframeError(false);
              setRefreshKey((value) => value + 1);
            }}
          >
            刷新
          </button>
          {app.url ? (
            <a href={app.url} target="_blank" rel="noreferrer" className="rounded-md bg-white/10 px-2 py-1 text-white/75 transition hover:bg-white/20">
              外部打开
            </a>
          ) : null}
        </div>
      </div>

      <div className="min-h-0 flex-1 bg-zinc-950/35 p-3 backdrop-blur-xl">
        {Builtin ? (
          <div className={builtinShellClass}>
            <Builtin />
          </div>
        ) : app.url && !iframeError ? (
          <iframe
            key={`${app.id}-${refreshKey}`}
            title={app.title}
            src={app.url}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            className="h-full w-full rounded-xl border border-white/10 bg-white"
            onError={() => setIframeError(true)}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-white/15 bg-black/20 text-center">
            <div className={`flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-gradient-to-br text-4xl shadow-lg ${app.color}`}>
              <AppGlyph iconKey={app.iconKey} fallback={app.icon} className="h-11 w-11" />
            </div>
            <div>
              <div className="text-xl font-semibold">{app.title}</div>
              <div className="mt-2 max-w-md text-sm text-white/60">该页面可能不允许嵌入预览。你仍然可以用浏览器新标签打开。</div>
            </div>
            {app.url ? (
              <a href={app.url} target="_blank" rel="noreferrer" className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-zinc-950">
                在新标签打开
              </a>
            ) : null}
          </div>
        )}
      </div>
    </motion.section>
  );
}
