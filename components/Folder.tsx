'use client';

import { AppGlyph } from '@/components/AppGlyph';
import type { AppItem, FolderItem } from '@/lib/types';

type Props = {
  folder: FolderItem;
  onClose: () => void;
  onOpen: (app: AppItem) => void;
};

export function Folder({ folder, onClose, onOpen }: Props) {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/55 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-slate-900/95 p-5 text-white" onClick={(event) => event.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold">{folder.title}</div>
            <div className="text-sm text-white/65">MVP 文件夹预览</div>
          </div>
          <button type="button" className="rounded-full bg-white/10 px-3 py-1 text-sm" onClick={onClose}>关闭</button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {folder.children.map((item) => (
            <button
              key={item.id}
              type="button"
              className="rounded-2xl bg-white/5 p-3 text-center transition hover:bg-white/10"
              onClick={() => {
                onClose();
                onOpen(item);
              }}
            >
              <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-2xl ${item.color}`}>
                <AppGlyph iconKey={item.iconKey} fallback={item.icon} className="h-7 w-7" />
              </div>
              <div className="mt-2 text-xs">{item.title}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
