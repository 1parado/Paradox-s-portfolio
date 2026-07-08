'use client';

import { useEffect, useState } from 'react';

type Props = {
  appCount: number;
  dockCount: number;
};

export function MacWidgetStack({ appCount, dockCount }: Props) {
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
        weekday: 'long',
      }).format(now));
    };
    update();
    const timer = window.setInterval(update, 10_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <aside className="grid w-[21rem] grid-cols-2 gap-3">
      <div className="col-span-2 rounded-[1.45rem] border border-white/12 bg-zinc-950/30 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.28)] backdrop-blur-2xl">
        <div className="text-xs font-medium uppercase tracking-[0.18em] text-white/42">Today</div>
        <div className="mt-2 flex items-end justify-between">
          <div>
            <div className="text-4xl font-semibold tracking-tight">{clock || '--:--'}</div>
            <div className="mt-1 text-sm text-white/58">{dateLabel || 'Loading'}</div>
          </div>
          <div className="rounded-2xl bg-white/12 px-3 py-2 text-right">
            <div className="text-xs text-white/50">Mode</div>
            <div className="text-sm font-semibold">Desktop</div>
          </div>
        </div>
      </div>

      <div className="rounded-[1.45rem] border border-white/12 bg-white/12 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.22)] backdrop-blur-2xl">
        <div className="text-xs font-medium text-white/48">Now</div>
        <div className="mt-7 text-3xl font-semibold">{appCount}</div>
        <div className="mt-1 text-xs text-white/55">Apps ready</div>
      </div>

      <div className="rounded-[1.45rem] border border-white/12 bg-white/12 p-4 shadow-[0_18px_60px_rgba(0,0,0,0.22)] backdrop-blur-2xl">
        <div className="text-xs font-medium text-white/48">Focus</div>
        <div className="mt-7 text-3xl font-semibold">{dockCount}</div>
        <div className="mt-1 text-xs text-white/55">Core links</div>
      </div>
    </aside>
  );
}
