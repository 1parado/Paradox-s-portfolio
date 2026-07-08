'use client';

import { useEffect, useState } from 'react';

type Props = {
  activeTitle?: string;
  editing: boolean;
  onSettings: () => void;
  onWallpaper: () => void;
  onEdit: () => void;
  onControlCenter: () => void;
};

export function MacMenuBar({ activeTitle, editing, onSettings, onWallpaper, onEdit, onControlCenter }: Props) {
  const [time, setTime] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(new Intl.DateTimeFormat('zh-CN', {
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(now));
    };
    update();
    const timer = window.setInterval(update, 10_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <header className="absolute inset-x-0 top-0 z-50 flex h-9 items-center justify-between border-b border-white/10 bg-zinc-950/28 px-4 text-[13px] text-white shadow-[0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-3xl">
      <nav className="flex min-w-0 items-center gap-4">
        <button type="button" className="text-[17px] font-semibold leading-none text-white" aria-label="Paradox menu" onClick={onSettings}>
          ◐
        </button>
        <button type="button" className="rounded-md px-1.5 py-0.5 font-semibold transition hover:bg-white/10" onClick={onSettings}>
          Paradox
        </button>
        {['File', 'Edit', 'View', 'Go', 'Window', 'Help'].map((item) => (
          <button
            key={item}
            type="button"
            className="hidden rounded-md px-1.5 py-0.5 text-white/80 transition hover:bg-white/10 lg:inline"
            onClick={item === 'View' ? onWallpaper : item === 'Window' ? onEdit : undefined}
          >
            {item}
          </button>
        ))}
        <span className="hidden max-w-[18rem] truncate text-white/55 lg:inline">
          {activeTitle ? activeTitle : editing ? 'Arranging Desktop' : 'Finder'}
        </span>
      </nav>

      <div className="flex items-center gap-2 text-white/82">
        <button type="button" className="hidden rounded-md px-2 py-0.5 transition hover:bg-white/10 md:inline" onClick={onEdit}>
          {editing ? 'Done' : 'Arrange'}
        </button>
        <button type="button" className="rounded-md px-2 py-0.5 transition hover:bg-white/10" onClick={onControlCenter} aria-label="Control Center">
          ◫
        </button>
        <span className="tabular-nums">{time || '--:--'}</span>
      </div>
    </header>
  );
}
