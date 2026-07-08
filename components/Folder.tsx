'use client';

import { useEffect, useRef, useState } from 'react';
import { AppGlyph } from '@/components/AppGlyph';
import { isFolder } from '@/lib/folders';
import type { AppItem, FolderItem } from '@/lib/types';

type Props = {
  /** 从根文件夹到当前层的路径，path[path.length-1] 为当前展示的文件夹。 */
  path: FolderItem[];
  editing: boolean;
  /** 传入某文件夹 id 时，若它等于当前文件夹，则自动进入标题编辑态。 */
  autoRenameId?: string | null;
  onClose: () => void;
  onOpen: (app: AppItem) => void;
  onOpenFolder: (folder: FolderItem) => void;
  onNavigate: (folder: FolderItem | null) => void;
  onRename: (folderId: string, title: string) => void;
  onRemoveFromFolder: (itemId: string) => void;
};

export function Folder({ path, editing, autoRenameId, onClose, onOpen, onOpenFolder, onNavigate, onRename, onRemoveFromFolder }: Props) {
  const folder = path[path.length - 1];
  const [editingTitle, setEditingTitle] = useState(false);
  const [draftTitle, setDraftTitle] = useState(folder.title);
  const titleRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setDraftTitle(folder.title);
    setEditingTitle(false);
  }, [folder.id, folder.title]);

  useEffect(() => {
    if (autoRenameId && autoRenameId === folder.id && editing) {
      setEditingTitle(true);
    }
  }, [autoRenameId, folder.id, editing]);

  useEffect(() => {
    if (editingTitle && titleRef.current) {
      titleRef.current.focus();
      titleRef.current.select();
    }
  }, [editingTitle]);

  const commitTitle = () => {
    const next = draftTitle.trim();
    if (next && next !== folder.title) {
      onRename(folder.id, next);
    } else {
      setDraftTitle(folder.title);
    }
    setEditingTitle(false);
  };

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/55 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-slate-900/95 p-5 text-white" onClick={(event) => event.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            {path.length > 1 ? (
              <nav className="mb-1 flex flex-wrap items-center gap-1 text-xs text-white/55">
                {path.map((node, index) => (
                  <span key={node.id} className="flex items-center gap-1">
                    {index < path.length - 1 ? (
                      <button
                        type="button"
                        className="truncate rounded px-1 py-0.5 transition hover:bg-white/10 hover:text-white/85"
                        onClick={() => onNavigate(node)}
                      >
                        {node.title}
                      </button>
                    ) : (
                      <span className="truncate text-white/70">{node.title}</span>
                    )}
                    {index < path.length - 1 ? <span className="text-white/35">›</span> : null}
                  </span>
                ))}
              </nav>
            ) : null}
            {editingTitle && editing ? (
              <input
                ref={titleRef}
                value={draftTitle}
                onChange={(event) => setDraftTitle(event.target.value)}
                onBlur={commitTitle}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    commitTitle();
                  }
                  if (event.key === 'Escape') {
                    event.preventDefault();
                    setDraftTitle(folder.title);
                    setEditingTitle(false);
                  }
                }}
                className="w-full rounded-md bg-white/10 px-2 py-0.5 text-lg font-semibold outline-none ring-1 ring-amber-300/50"
              />
            ) : (
              <button
                type="button"
                className="block max-w-full truncate rounded-md px-1 py-0.5 text-left text-lg font-semibold transition hover:bg-white/10"
                title={editing ? '点击重命名' : folder.title}
                onClick={() => (editing ? setEditingTitle(true) : undefined)}
                disabled={!editing}
              >
                {folder.title}
              </button>
            )}
            <div className="px-1 text-sm text-white/55">{editing ? '整理模式：点击标题重命名，× 移出文件夹。' : `${folder.children.length} 项`}</div>
          </div>
          <button type="button" className="shrink-0 rounded-full bg-white/10 px-3 py-1 text-sm" onClick={onClose}>关闭</button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {folder.children.length === 0 ? (
            <div className="col-span-3 rounded-2xl bg-white/5 p-6 text-center text-sm text-white/55">
              空文件夹{editing ? '，可把桌面应用拖到这里。' : '。'}
            </div>
          ) : folder.children.map((item) => {
            const childIsFolder = isFolder(item);
            return (
              <div key={item.id} className="relative">
                <button
                  type="button"
                  className="w-full rounded-2xl bg-white/5 p-3 text-center transition hover:bg-white/10"
                  onClick={() => {
                    if (childIsFolder) {
                      onOpenFolder(item as FolderItem);
                    } else {
                      onClose();
                      onOpen(item);
                    }
                  }}
                >
                  <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br text-2xl ${item.color}`}>
                    <AppGlyph iconKey={item.iconKey} fallback={item.icon} className="h-7 w-7" />
                  </div>
                  <div className="mt-2 truncate text-xs">{item.title}</div>
                </button>
                {editing ? (
                  <button
                    type="button"
                    aria-label="移出文件夹"
                    title="移出文件夹"
                    onClick={(event) => {
                      event.stopPropagation();
                      onRemoveFromFolder(item.id);
                    }}
                    className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/55 text-xs text-white backdrop-blur transition hover:bg-red-500"
                  >
                    ×
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
