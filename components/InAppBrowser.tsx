'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AppGlyph } from '@/components/AppGlyph';
import { getBuiltinApp } from '@/components/builtin/registry';
import type { AppItem } from '@/lib/types';

type Props = {
  app: AppItem | null;
  onClose: () => void;
};

export function InAppBrowser({ app, onClose }: Props) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [iframeError, setIframeError] = useState(false);
  const Builtin = useMemo(() => getBuiltinApp(app?.builtinKey), [app?.builtinKey]);

  useEffect(() => {
    setIframeError(false);
    setRefreshKey(0);
  }, [app?.id]);

  return (
    <AnimatePresence>
      {app ? (
        <motion.div
          key={app.id}
          layoutId={`mobile-app-${app.id}`}
          className="absolute inset-0 z-30 flex flex-col bg-slate-950 text-white"
          initial={{ opacity: 0.5, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0.65, scale: 0.96 }}
          transition={{ type: 'spring', stiffness: 220, damping: 26 }}
        >
          <div className="flex items-center gap-2 border-b border-white/10 bg-slate-900/95 px-3 py-3">
            <button type="button" className="rounded-full bg-white/10 px-3 py-1 text-sm" onClick={onClose}>关闭</button>
            <button type="button" className="rounded-full bg-white/10 px-3 py-1 text-sm" onClick={() => { setIframeError(false); setRefreshKey((value) => value + 1); }}>刷新</button>
            {app.url ? (
              <a href={app.url} target="_blank" rel="noreferrer" className="rounded-full bg-white/10 px-3 py-1 text-sm">
                外部打开
              </a>
            ) : null}
            <div className="ml-auto max-w-[55%] truncate rounded-full bg-white/10 px-4 py-1 text-xs text-white/65">
              {app.url || `builtin://${app.builtinKey}`}
            </div>
          </div>
          <div className="flex-1 overflow-hidden bg-black/25 p-3">
            <div className="h-full rounded-[2rem] border border-white/10 bg-slate-900/70 p-3">
              {Builtin ? (
                <Builtin />
              ) : app.url && !iframeError ? (
                <iframe
                  key={`${app.id}-${refreshKey}`}
                  title={app.title}
                  src={app.url}
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                  className="h-full w-full rounded-[1.25rem] bg-white"
                  onError={() => setIframeError(true)}
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-4 rounded-[1.25rem] border border-dashed border-white/15 bg-black/20 text-center">
                  <div className={`flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-gradient-to-br shadow-lg ${app.color}`}>
                    <AppGlyph iconKey={app.iconKey} fallback={app.icon} className="h-10 w-10 text-white" />
                  </div>
                  <div>
                    <div className="text-xl font-semibold">{app.title}</div>
                    <div className="mt-2 text-sm text-white/65">该作品不支持内嵌预览，请在新标签打开。</div>
                  </div>
                  {app.url ? (
                    <a href={app.url} target="_blank" rel="noreferrer" className="rounded-full bg-blue-500 px-4 py-2 text-sm">
                      在新标签打开
                    </a>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
