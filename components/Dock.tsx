'use client';

import type { AppItem } from '@/lib/types';
import { AppIcon } from '@/components/AppIcon';

type Props = {
  apps: AppItem[];
  editing: boolean;
  onOpen: (app: AppItem) => void;
  onLongPress: (app: AppItem) => void;
};

export function Dock({ apps, editing, onOpen, onLongPress }: Props) {
  return (
    <div className="mx-auto mt-auto w-[calc(100%-1.5rem)] rounded-[2rem] border border-white/10 bg-white/15 px-3 py-3 shadow-lg backdrop-blur-xl">
      <div className="grid grid-cols-4 gap-3">
        {apps.map((app) => (
          <AppIcon key={app.id} app={app} editing={editing} onOpen={onOpen} onLongPress={onLongPress} />
        ))}
      </div>
    </div>
  );
}
