'use client';

import { useEffect, useState } from 'react';

export function MacWidgetStack() {
  const [clock, setClock] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setClock(new Intl.DateTimeFormat('zh-CN', {
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
    <aside className="flex w-40 items-center justify-center rounded-[1.35rem] border border-white/12 bg-zinc-950/30 px-4 py-5 shadow-[0_18px_60px_rgba(0,0,0,0.28)] backdrop-blur-2xl" aria-label="当前时间">
      <time className="text-4xl font-semibold tabular-nums" dateTime={clock || undefined}>
        {clock || '--:--'}
      </time>
    </aside>
  );
}
