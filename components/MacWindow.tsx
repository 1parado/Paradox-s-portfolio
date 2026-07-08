'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { AppGlyph } from '@/components/AppGlyph';
import { getBuiltinApp } from '@/components/builtin/registry';
import type { AppItem } from '@/lib/types';

type Edge = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

type Frame = { x: number; y: number; width: number; height: number };

type Props = {
  app: AppItem;
  zIndex: number;
  minimized: boolean;
  focused: boolean;
  onFocus: () => void;
  onClose: () => void;
  onMinimize: () => void;
  onEnterFullscreen?: () => void;
  onExitFullscreen?: () => void;
  onDragToTop?: () => void;
};

const MIN_WIDTH = 440;
const MIN_HEIGHT = 300;
const MENUBAR_HEIGHT = 36;
const DOCK_RESERVE = 96;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const DEFAULT_FRAME: Frame = { x: 230, y: 92, width: 980, height: 690 };

export function MacWindow({ app, zIndex, minimized, focused, onFocus, onClose, onMinimize, onEnterFullscreen, onExitFullscreen, onDragToTop }: Props) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [iframeError, setIframeError] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [frame, setFrame] = useState<Frame>(DEFAULT_FRAME);
  const [lastFrame, setLastFrame] = useState<Frame | null>(null);
  const [resize, setResize] = useState<{ edge: Edge; startX: number; startY: number; base: Frame } | null>(null);
  const [minimizing, setMinimizing] = useState(false);
  const minimizeTimer = useRef<number | null>(null);
  const Builtin = useMemo(() => getBuiltinApp(app.builtinKey), [app.builtinKey]);
  const builtinShellClass = app.builtinKey === 'calculator' ? 'mx-auto h-full max-w-md' : 'h-full w-full';

  useEffect(() => {
    setIframeError(false);
    setRefreshKey(0);
    setFullscreen(false);
    setZoomed(false);
    setMinimizing(false);
  }, [app.id]);

  useEffect(() => {
    const updateFrame = () => {
      setFrame((current) => ({
        ...current,
        x: Math.max(16, Math.round((window.innerWidth - current.width) / 2)),
        y: Math.max(MENUBAR_HEIGHT + 16, Math.round(window.innerHeight * 0.1)),
        width: Math.min(Math.max(current.width, MIN_WIDTH), window.innerWidth - 32),
        height: Math.min(Math.max(current.height, MIN_HEIGHT), window.innerHeight - MENUBAR_HEIGHT - DOCK_RESERVE),
      }));
    };
    updateFrame();
    window.addEventListener('resize', updateFrame);
    return () => window.removeEventListener('resize', updateFrame);
  }, []);

  useEffect(() => {
    return () => {
      if (minimizeTimer.current) window.clearTimeout(minimizeTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!resize) return;

    const onPointerMove = (event: PointerEvent) => {
      const dx = event.clientX - resize.startX;
      const dy = event.clientY - resize.startY;
      const maxW = window.innerWidth - resize.base.x - 8;
      const maxH = window.innerHeight - resize.base.y - DOCK_RESERVE;
      let { x, y, width, height } = resize.base;
      const e = resize.edge;

      if (e.includes('e')) width = clamp(resize.base.width + dx, MIN_WIDTH, maxW);
      if (e.includes('s')) height = clamp(resize.base.height + dy, MIN_HEIGHT, maxH);
      if (e.includes('w')) {
        const newWidth = clamp(resize.base.width - dx, MIN_WIDTH, resize.base.x + resize.base.width - 8);
        x = resize.base.x + (resize.base.width - newWidth);
        width = newWidth;
      }
      if (e.includes('n')) {
        const newHeight = clamp(resize.base.height - dy, MIN_HEIGHT, resize.base.y + resize.base.height - MENUBAR_HEIGHT - 8);
        y = resize.base.y + (resize.base.height - newHeight);
        height = newHeight;
      }
      setFrame({ x, y, width, height });
    };
    const onPointerUp = () => setResize(null);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp, { once: true });
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [resize]);

  const toggleFullscreen = () => {
    setFullscreen((current) => {
      const next = !current;
      if (next) {
        setLastFrame(frame);
        onEnterFullscreen?.();
      } else {
        onExitFullscreen?.();
      }
      return next;
    });
  };

  const toggleZoom = () => {
    setZoomed((current) => {
      const next = !current;
      if (next) {
        setLastFrame(frame);
        setFrame({
          x: Math.max(16, Math.round(window.innerWidth * 0.06)),
          y: MENUBAR_HEIGHT + 8,
          width: Math.round(window.innerWidth * 0.88),
          height: Math.round(window.innerHeight * 0.82),
        });
      } else if (lastFrame) {
        setFrame(lastFrame);
      }
      return next;
    });
  };

  const handleMinimize = () => {
    if (minimizing) return;
    setMinimizing(true);
    if (minimizeTimer.current) window.clearTimeout(minimizeTimer.current);
    minimizeTimer.current = window.setTimeout(() => {
      setMinimizing(false);
      onMinimize();
    }, 420);
  };

  const startResize = (event: React.PointerEvent, edge: Edge) => {
    if (fullscreen) return;
    event.preventDefault();
    event.stopPropagation();
    setFrame((current) => {
      setResize({ edge, startX: event.clientX, startY: event.clientY, base: { ...current } });
      return current;
    });
  };

  if (minimized && !minimizing) return null;

  const edges: { edge: Edge; className: string }[] = [
    { edge: 'n', className: 'absolute inset-x-3 top-0 h-1.5 cursor-ns-resize' },
    { edge: 's', className: 'absolute inset-x-3 bottom-0 h-1.5 cursor-ns-resize' },
    { edge: 'w', className: 'absolute inset-y-3 left-0 w-1.5 cursor-ew-resize' },
    { edge: 'e', className: 'absolute inset-y-3 right-0 w-1.5 cursor-ew-resize' },
    { edge: 'ne', className: 'absolute right-0 top-0 h-3 w-3 cursor-nesw-resize' },
    { edge: 'nw', className: 'absolute left-0 top-0 h-3 w-3 cursor-nwse-resize' },
    { edge: 'se', className: 'absolute bottom-0 right-0 h-3 w-3 cursor-nwse-resize' },
    { edge: 'sw', className: 'absolute bottom-0 left-0 h-3 w-3 cursor-nesw-resize' },
  ];

  const dockRect = typeof document !== 'undefined' ? document.getElementById('mac-dock-dropzone')?.getBoundingClientRect() : null;
  const minimizeTarget = dockRect
    ? { x: dockRect.left + dockRect.width / 2 - frame.x - frame.width / 2, y: dockRect.top - frame.y - frame.height / 2 }
    : { x: 0, y: window.innerHeight };

  return (
    <motion.section
      layoutId={`desktop-window-${app.id}`}
      className={[
        'absolute flex flex-col overflow-hidden border text-white shadow-[0_30px_110px_rgba(0,0,0,0.48)] backdrop-blur-3xl',
        fullscreen ? 'rounded-none' : 'rounded-[1.1rem]',
        focused ? 'border-white/35 bg-zinc-950/70' : 'border-white/15 bg-zinc-950/55',
      ].join(' ')}
      style={fullscreen ? { zIndex, left: 0, top: MENUBAR_HEIGHT, width: '100vw', height: `calc(100vh - ${MENUBAR_HEIGHT}px)` } : {
        zIndex,
        left: frame.x,
        top: frame.y,
        width: frame.width,
        height: frame.height,
      }}
      drag={!fullscreen && !resize && !minimizing}
      dragMomentum={false}
      dragElastic={0}
      onDragEnd={(_, info) => {
        const nextY = frame.y + info.offset.y;
        if (info.offset.y < -40 && nextY <= MENUBAR_HEIGHT + 4) {
          onDragToTop?.();
          return;
        }
        setFrame((current) => ({
          ...current,
          x: clamp(current.x + info.offset.x, 8, window.innerWidth - 120),
          y: clamp(current.y + info.offset.y, MENUBAR_HEIGHT + 4, window.innerHeight - 96),
        }));
      }}
      dragSnapToOrigin
      onPointerDown={onFocus}
      initial={{ opacity: 0, scale: 0.94, y: 18 }}
      animate={
        minimizing
          ? { opacity: 0, scale: 0.18, x: minimizeTarget.x, y: minimizeTarget.y }
          : { opacity: 1, scale: 1, x: 0, y: 0 }
      }
      exit={{ opacity: 0, scale: 0.94, y: 18 }}
      transition={{ type: 'spring', stiffness: 260, damping: 26 }}
    >
      {!fullscreen && !minimizing
        ? edges.map(({ edge, className }) => (
            <button
              key={edge}
              type="button"
              aria-label={`调整窗口 ${edge}`}
              tabIndex={-1}
              className={`${className} z-30`}
              onPointerDown={(event) => startResize(event, edge)}
            />
          ))
        : null}

      <div className="relative flex h-11 shrink-0 items-center gap-3 border-b border-white/10 bg-white/10 px-4 backdrop-blur-3xl" onDoubleClick={toggleZoom}>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/30" />
        <div className="flex items-center gap-2">
          <button type="button" className="h-3 w-3 rounded-full bg-[#ff5f57] ring-1 ring-black/15" aria-label="关闭窗口" onClick={onClose} />
          <button type="button" className="h-3 w-3 rounded-full bg-[#febc2e] ring-1 ring-black/15" aria-label="最小化窗口" onClick={handleMinimize} />
          <button type="button" className="h-3 w-3 rounded-full bg-[#28c840] ring-1 ring-black/15" aria-label="全屏窗口" onClick={toggleFullscreen} />
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
          <button type="button" className="rounded-md bg-white/10 px-2 py-1 text-white/75 transition hover:bg-white/20" onClick={toggleZoom}>
            缩放
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
