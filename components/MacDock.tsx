'use client';

import type { AppItem } from '@/lib/types';
import { MacDesktopIcon } from '@/components/MacDesktopIcon';

type Props = {
  apps: AppItem[];
  editing: boolean;
  runningIds: string[];
  minimizedIds: string[];
  dropActive: boolean;
  onOpen: (app: AppItem) => void;
  onLongPress: (app: AppItem) => void;
};

export function MacDock({ apps, editing, runningIds, minimizedIds, dropActive, onOpen, onLongPress }: Props) {
  return (
    <div className="absolute bottom-4 left-1/2 z-40 hidden -translate-x-1/2 md:block">
      <div
        id="mac-dock-dropzone"
        className={[
          'relative flex min-w-[34rem] max-w-[calc(100vw-4rem)] items-end justify-center gap-3 overflow-x-auto rounded-[1.9rem] border px-5 py-3 shadow-[0_22px_80px_rgba(0,0,0,0.42)] backdrop-blur-3xl transition',
          dropActive ? 'border-sky-200/75 bg-sky-300/20 ring-2 ring-sky-200/45' : 'border-white/25 bg-white/15',
        ].join(' ')}
      >
        <div className="pointer-events-none absolute inset-x-4 top-1 h-px bg-white/35" />
        {apps.map((app) => {
          const running = runningIds.includes(app.id);
          const minimized = minimizedIds.includes(app.id);

          return (
            <div key={app.id} className="relative" title={app.title}>
              <MacDesktopIcon app={app} editing={editing} compact onOpen={onOpen} onLongPress={onLongPress} />
              {running ? (
                <span
                  className={[
                    'absolute -bottom-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full',
                    minimized ? 'bg-white/35' : 'bg-white/90',
                  ].join(' ')}
                />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
