'use client';

import { AppGlyph } from '@/components/AppGlyph';
import type { AppItem, HomePage } from '@/lib/types';

type Props = {
  app: AppItem;
  pages: HomePage[];
  onClose: () => void;
  onOpen: (app: AppItem) => void;
  onOpenExternal: (app: AppItem) => void;
  editing: boolean;
  onRequestEdit: () => void;
  onMove: (targetPageId: string) => void;
  onDelete: () => void;
};

export function ContextMenu({ app, pages, onClose, onOpen, onOpenExternal, editing, onRequestEdit, onMove, onDelete }: Props) {
  return (
    <div className="absolute inset-0 z-40 flex items-end bg-black/40 p-4 md:items-center md:justify-center" onClick={onClose}>
      <div className="w-full max-w-sm rounded-[2rem] border border-white/10 bg-zinc-950/95 p-4 text-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="mb-4 flex items-center gap-3">
          <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-2xl ${app.color}`}>
            <AppGlyph iconKey={app.iconKey} fallback={app.icon} className="h-8 w-8" />
          </div>
          <div>
            <div className="text-lg font-semibold">{app.title}</div>
            <div className="text-sm text-white/65">{app.description}</div>
          </div>
        </div>
        <div className="grid gap-2">
          <button type="button" className="rounded-2xl bg-white/10 px-4 py-3 text-left" onClick={() => onOpen(app)}>打开</button>
          {app.url ? <button type="button" className="rounded-2xl bg-white/10 px-4 py-3 text-left" onClick={() => onOpenExternal(app)}>新标签打开</button> : null}
          {editing ? (
            <>
              {pages.map((page) => (
                <button key={page.id} type="button" className="rounded-2xl bg-white/10 px-4 py-3 text-left" onClick={() => onMove(page.id)}>
                  移动到「{page.title}」
                </button>
              ))}
              <button type="button" className="rounded-2xl bg-red-500/20 px-4 py-3 text-left text-red-200" onClick={onDelete}>删除</button>
            </>
          ) : (
            <button type="button" className="rounded-2xl bg-white/10 px-4 py-3 text-left" onClick={onRequestEdit}>进入编辑模式</button>
          )}
        </div>
      </div>
    </div>
  );
}
