'use client';

import { useEffect } from 'react';

type Props = {
  x: number;
  y: number;
  onNewFolder: () => void;
  onCleanUp: () => void;
  onSort: (mode: 'name' | 'kind' | 'date') => void;
  onWallpaper: () => void;
  onSettings: () => void;
  onClose: () => void;
};

export function MacDesktopMenu({ x, y, onNewFolder, onCleanUp, onSort, onWallpaper, onSettings, onClose }: Props) {
  useEffect(() => {
    const onDown = () => onClose();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  const run = (fn: () => void) => {
    onClose();
    fn();
  };

  const items: { label?: string; shortcut?: string; onClick?: () => void; separator?: boolean; disabled?: boolean }[] = [
    { label: '新建文件夹', shortcut: '⇧⌘N', onClick: () => run(onNewFolder) },
    { separator: true },
    { label: '按名称排序', onClick: () => run(() => onSort('name')) },
    { label: '按种类排序', onClick: () => run(() => onSort('kind')) },
    { label: '按日期排序', onClick: () => run(() => onSort('date')) },
    { separator: true },
    { label: '整理桌面（对齐网格）', onClick: () => run(onCleanUp) },
    { label: '更改壁纸…', onClick: () => run(onWallpaper) },
    { label: '显示设置…', onClick: () => run(onSettings) },
  ];

  const maxX = typeof window !== 'undefined' ? window.innerWidth - 240 : x;
  const maxY = typeof window !== 'undefined' ? window.innerHeight - 320 : y;

  return (
    <div
      className="absolute z-[66] min-w-[15rem] rounded-xl border border-white/15 bg-zinc-900/92 p-1 text-[13px] text-white shadow-[0_22px_70px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
      style={{ left: Math.min(x, maxX), top: Math.min(y, maxY) }}
      onPointerDown={(event) => event.stopPropagation()}
    >
      {items.map((item, index) => {
        if (item.separator) return <div key={`sep-${index}`} className="my-1 h-px bg-white/12" />;
        return (
          <button
            key={index}
            type="button"
            disabled={item.disabled}
            className="flex w-full items-center gap-3 rounded-md px-2 py-1 text-left text-white/90 transition hover:bg-sky-500/80 hover:text-white disabled:cursor-default disabled:text-white/35"
            onClick={item.onClick}
          >
            <span className="flex-1 truncate">{item.label}</span>
            {item.shortcut ? <span className="text-[11px] text-white/45">{item.shortcut}</span> : null}
          </button>
        );
      })}
    </div>
  );
}
