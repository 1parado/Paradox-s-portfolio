'use client';

import { useEffect, useState } from 'react';

type Props = {
  editing: boolean;
};

export function StatusBar({ editing }: Props) {
  const [time, setTime] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      setTime(`${hh}:${mm}`);
    };
    update();
    const timer = window.setInterval(update, 10_000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="px-5 pt-14 text-white/90">
      <div className="flex items-center justify-between text-sm font-medium">
        <span className="tabular-nums">{time || '--:--'}</span>
        <span className="rounded-full bg-black/20 px-3 py-1 backdrop-blur">{editing ? '编辑中' : 'Paradox'}</span>
        <span className="flex items-center gap-1.5">
          {/* 信号 */}
          <span className="flex items-end gap-[2px]" aria-hidden>
            <span className="h-1.5 w-[3px] rounded-sm bg-white/80" />
            <span className="h-2 w-[3px] rounded-sm bg-white/80" />
            <span className="h-2.5 w-[3px] rounded-sm bg-white/80" />
            <span className="h-3 w-[3px] rounded-sm bg-white/40" />
          </span>
          {/* 电池 */}
          <span className="relative flex h-3 w-6 items-center rounded-[3px] border border-white/70 px-[2px]">
            <span className="block h-1.5 w-4 rounded-[1px] bg-white/80" />
            <span className="absolute -right-[3px] top-1/2 h-1.5 w-[2px] -translate-y-1/2 rounded-r-sm bg-white/70" />
          </span>
        </span>
      </div>
    </div>
  );
}
