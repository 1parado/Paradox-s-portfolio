'use client';

import { useEffect, useState } from 'react';
import { CalendarDays, CloudSun } from 'lucide-react';

export function MacWidgetStack() {
  const [clock, setClock] = useState('');
  const [dateLabel, setDateLabel] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setClock(new Intl.DateTimeFormat('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(now));
      setDateLabel(new Intl.DateTimeFormat('zh-CN', {
        month: 'long',
        day: 'numeric',
        weekday: 'short',
      }).format(now));
    };
    update();
    const timer = window.setInterval(update, 10_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <aside
      className="w-[13.5rem] overflow-hidden rounded-[1.6rem] border border-white/14 bg-black/30 shadow-[0_22px_70px_rgba(0,0,0,0.35)] backdrop-blur-2xl"
      aria-label="桌面小组件"
    >
      <div className="relative px-4 pb-4 pt-5">
        <div className="pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full bg-cyan-400/20 blur-2xl" />
        <div className="flex items-center gap-2 text-white/45">
          <CloudSun className="h-3.5 w-3.5" strokeWidth={1.8} />
          <span className="font-mono text-[10px] uppercase tracking-[0.2em]">Local</span>
        </div>
        <time className="mt-2 block font-display text-5xl font-normal leading-none tracking-tight text-white" dateTime={clock || undefined}>
          {clock || '--:--'}
        </time>
        <div className="mt-3 flex items-center gap-1.5 text-sm text-white/55">
          <CalendarDays className="h-3.5 w-3.5 shrink-0" strokeWidth={1.8} />
          <span>{dateLabel || '—'}</span>
        </div>
      </div>
      <div className="border-t border-white/10 bg-white/[0.04] px-4 py-3">
        <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/30">Focus</div>
        <div className="mt-1 text-xs leading-snug text-white/60">拖动图标 · ⌘Space 搜索 · 右键菜单</div>
      </div>
    </aside>
  );
}
