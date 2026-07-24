'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AppWindow,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Clock3,
  FileText,
  HardDrive,
  LayoutGrid,
  List,
  Monitor,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { AppGlyph } from '@/components/AppGlyph';
import type { AppIconKey, AppItem, FolderItem, HomePage } from '@/lib/types';

type Props = {
  pages: HomePage[];
  dock: AppItem[];
  onClose: () => void;
  onOpen: (app: AppItem) => void;
};

type FSKind = 'folder' | 'app' | 'external' | 'builtin';

type FSNode = {
  id: string;
  name: string;
  kind: FSKind;
  icon: string;
  iconKey?: AppIconKey;
  color?: string;
  children?: FSNode[];
  item?: AppItem;
  modified: string;
  size: string;
};

const SIDEBAR_FAVORITES: { id: string; name: string; Icon: LucideIcon }[] = [
  { id: 'desktop', name: '桌面', Icon: Monitor },
  { id: 'applications', name: '应用程序', Icon: AppWindow },
  { id: 'recent', name: '最近', Icon: Clock3 },
  { id: 'documents', name: '文档', Icon: FileText },
];
const SIDEBAR_LOCATIONS: { id: string; name: string; Icon: LucideIcon }[] = [
  { id: 'paradox-hd', name: 'Paradox HD', Icon: HardDrive },
];

const kindLabel: Record<FSKind, string> = {
  folder: '文件夹',
  app: '应用',
  external: '外链',
  builtin: '内置应用',
};

function toItemNode(item: AppItem): FSNode {
  const isFolder = item.type === 'folder';
  return {
    id: item.id,
    name: item.title,
    kind: isFolder ? 'folder' : item.builtinKey ? 'builtin' : 'external',
    icon: item.icon,
    iconKey: item.iconKey,
    color: item.color,
    children: isFolder ? (item as FolderItem).children.map(toItemNode) : undefined,
    item,
    modified: '2026-07-08 09:41',
    size: isFolder ? '-- 项' : '—',
  };
}

function buildTree(pages: HomePage[], dock: AppItem[]): FSNode {
  const pageFolders: FSNode[] = pages.map((page) => ({
    id: page.id,
    name: page.title,
    kind: 'folder' as const,
    icon: 'folder',
    iconKey: 'folder',
    color: 'from-slate-300 to-slate-600',
    children: page.items.map(toItemNode),
    modified: '2026-07-08 09:41',
    size: `${page.items.length} 项`,
  }));

  const applications: FSNode = {
    id: 'applications',
    name: '应用程序',
    kind: 'folder',
    icon: 'apps',
    iconKey: 'portfolio',
    children: dock.map(toItemNode),
    modified: '2026-07-08 09:41',
    size: `${dock.length} 项`,
  };

  const desktop: FSNode = {
    id: 'desktop',
    name: '桌面',
    kind: 'folder',
    icon: 'desktop',
    iconKey: 'design',
    children: pages.flatMap((page) => page.items.map(toItemNode)),
    modified: '2026-07-08 09:41',
    size: `${pages.flatMap((p) => p.items).length} 项`,
  };

  const documents: FSNode = {
    id: 'documents',
    name: '文档',
    kind: 'folder',
    icon: 'docs',
    iconKey: 'note',
    children: pages.flatMap((page) => page.items).filter((i) => i.type !== 'external').map(toItemNode),
    modified: '2026-07-08 09:41',
    size: '-- 项',
  };

  const recent: FSNode = {
    id: 'recent',
    name: '最近使用',
    kind: 'folder',
    icon: 'recent',
    iconKey: 'chart',
    children: [...pages.flatMap((p) => p.items), ...dock].slice(0, 8).map(toItemNode),
    modified: '2026-07-08 09:41',
    size: '8 项',
  };

  return {
    id: 'paradox-hd',
    name: 'Paradox HD',
    kind: 'folder',
    icon: 'drive',
    iconKey: 'archive',
    modified: '2026-07-08 09:41',
    size: `${pageFolders.length + 4} 项`,
    children: [desktop, applications, documents, recent, ...pageFolders],
  };
}

function findNode(root: FSNode, path: string[]): FSNode | null {
  let current: FSNode = root;
  for (const id of path) {
    const next = current.children?.find((child) => child.id === id);
    if (!next) return null;
    current = next;
  }
  return current;
}

function isFolder(node: FSNode) {
  return node.kind === 'folder';
}

export function MacFinder({ pages, dock, onClose, onOpen }: Props) {
  const root = useMemo(() => buildTree(pages, dock), [pages, dock]);
  const [path, setPath] = useState<string[]>([]);
  const [history, setHistory] = useState<string[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [view, setView] = useState<'list' | 'icon'>('list');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const current = findNode(root, path) ?? root;
  const breadcrumb = [root, ...path.map((_, idx) => findNode(root, path.slice(0, idx + 1))).filter(Boolean) as FSNode[]];

  const navigate = (nextPath: string[]) => {
    setPath(nextPath);
    setSelectedId(null);
    setHistory((prev) => {
      const trimmed = prev.slice(0, historyIndex + 1);
      return [...trimmed, nextPath];
    });
    setHistoryIndex((idx) => idx + 1);
  };

  const back = () => {
    if (historyIndex > 0) {
      setHistoryIndex((idx) => idx - 1);
      setPath(history[historyIndex - 1]);
      setSelectedId(null);
    }
  };

  const forward = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex((idx) => idx + 1);
      setPath(history[historyIndex + 1]);
      setSelectedId(null);
    }
  };

  const up = () => {
    if (path.length > 0) navigate(path.slice(0, -1));
  };

  const openNode = (node: FSNode) => {
    if (isFolder(node)) {
      navigate([...path, node.id]);
      return;
    }
    if (node.item) {
      onClose();
      onOpen(node.item);
    }
  };

  const sidebarJump = (id: string) => {
    if (id === 'paradox-hd') navigate([]);
    else navigate([id]);
  };

  return (
    <motion.div
      className="absolute inset-0 z-[65] flex items-center justify-center bg-black/42 p-6 text-white backdrop-blur-xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <section
        className="flex h-[min(720px,82vh)] w-[min(1080px,90vw)] overflow-hidden rounded-[1.1rem] border border-white/18 bg-zinc-950/92 shadow-[0_32px_110px_rgba(0,0,0,0.50)]"
        onClick={(event) => event.stopPropagation()}
      >
        <aside className="w-56 shrink-0 border-r border-white/10 bg-white/[0.05] p-3">
          <div className="mb-4 flex items-center gap-2 px-1">
            <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          </div>
          <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">收藏</p>
          <div className="mt-1.5 grid gap-0.5 text-sm">
            {SIDEBAR_FAVORITES.map((fav) => {
              const Icon = fav.Icon;
              return (
                <button
                  key={fav.id}
                  type="button"
                  className={[
                    'flex items-center gap-2 rounded-md px-2 py-1 text-left transition',
                    current.id === fav.id ? 'bg-sky-500/30 text-white' : 'text-white/74 hover:bg-white/10',
                  ].join(' ')}
                  onClick={() => sidebarJump(fav.id)}
                >
                  <Icon className="h-4 w-4 shrink-0 opacity-80" strokeWidth={1.75} />
                  <span className="truncate">{fav.name}</span>
                </button>
              );
            })}
          </div>
          <p className="mt-4 px-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">位置</p>
          <div className="mt-1.5 grid gap-0.5 text-sm">
            {SIDEBAR_LOCATIONS.map((loc) => {
              const Icon = loc.Icon;
              return (
                <button
                  key={loc.id}
                  type="button"
                  className="flex items-center gap-2 rounded-md px-2 py-1 text-left text-white/74 transition hover:bg-white/10"
                  onClick={() => sidebarJump(loc.id)}
                >
                  <Icon className="h-4 w-4 shrink-0 opacity-80" strokeWidth={1.75} />
                  <span className="truncate">{loc.name}</span>
                </button>
              );
            })}
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex h-11 shrink-0 items-center gap-2 border-b border-white/10 bg-white/[0.04] px-3">
            <div className="flex items-center gap-0.5">
              <button type="button" disabled={historyIndex <= 0} className="rounded-md p-1.5 text-white/70 transition enabled:hover:bg-white/10 disabled:opacity-30" onClick={back} aria-label="后退">
                <ChevronLeft className="h-4 w-4" strokeWidth={2} />
              </button>
              <button type="button" disabled={historyIndex >= history.length - 1} className="rounded-md p-1.5 text-white/70 transition enabled:hover:bg-white/10 disabled:opacity-30" onClick={forward} aria-label="前进">
                <ChevronRight className="h-4 w-4" strokeWidth={2} />
              </button>
              <button type="button" disabled={path.length === 0} className="rounded-md p-1.5 text-white/70 transition enabled:hover:bg-white/10 disabled:opacity-30" onClick={up} aria-label="上一级">
                <ChevronUp className="h-4 w-4" strokeWidth={2} />
              </button>
            </div>
            <div className="min-w-0 flex-1 truncate text-sm font-semibold text-white/85">{current.name}</div>
            <div className="flex items-center gap-0.5 rounded-md bg-white/8 p-0.5 text-xs">
              <button type="button" className={['flex items-center gap-1 rounded px-2 py-0.5 transition', view === 'list' ? 'bg-white/20 text-white' : 'text-white/60'].join(' ')} onClick={() => setView('list')} aria-label="列表视图">
                <List className="h-3.5 w-3.5" strokeWidth={2} />
                列表
              </button>
              <button type="button" className={['flex items-center gap-1 rounded px-2 py-0.5 transition', view === 'icon' ? 'bg-white/20 text-white' : 'text-white/60'].join(' ')} onClick={() => setView('icon')} aria-label="图标视图">
                <LayoutGrid className="h-3.5 w-3.5" strokeWidth={2} />
                图标
              </button>
            </div>
            <input
              type="text"
              placeholder="搜索"
              className="hidden w-44 rounded-md border border-white/10 bg-black/30 px-2 py-1 text-xs text-white/80 outline-none placeholder:text-white/30 focus:border-sky-300/40 sm:block"
            />
            <button type="button" className="rounded-md px-2 py-1 text-white/70 transition hover:bg-white/10" onClick={onClose}>关闭</button>
          </div>

          <div className="min-h-0 flex-1 overflow-auto p-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={path.join('/')}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.15 }}
              >
                {current.children && current.children.length > 0 ? (
                  view === 'list' ? (
                    <div>
                      <div className="grid grid-cols-[1fr_8rem_6rem_5rem] gap-2 border-b border-white/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-white/40">
                        <span>名称</span>
                        <span>修改日期</span>
                        <span>大小</span>
                        <span>种类</span>
                      </div>
                      {current.children.map((node) => (
                        <button
                          key={node.id}
                          type="button"
                          className={[
                            'grid w-full grid-cols-[1fr_8rem_6rem_5rem] items-center gap-2 rounded-md px-3 py-1.5 text-left text-sm transition',
                            selectedId === node.id ? 'bg-sky-500/30 text-white' : 'text-white/85 hover:bg-white/8',
                          ].join(' ')}
                          onClick={() => setSelectedId(node.id)}
                          onDoubleClick={() => openNode(node)}
                        >
                          <span className="flex min-w-0 items-center gap-2">
                            <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-gradient-to-br text-xs ${node.color ?? 'from-slate-400 to-slate-700'}`}>
                              <AppGlyph iconKey={node.iconKey} fallback={node.icon} className="h-4 w-4" />
                            </span>
                            <span className="truncate">{node.name}</span>
                          </span>
                          <span className="text-xs text-white/45">{node.modified}</span>
                          <span className="text-xs text-white/45">{node.size}</span>
                          <span className="text-xs text-white/45">{kindLabel[node.kind]}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-6">
                      {current.children.map((node) => (
                        <button
                          key={node.id}
                          type="button"
                          className={[
                            'flex flex-col items-center gap-1.5 rounded-lg p-2 text-center transition',
                            selectedId === node.id ? 'bg-sky-500/30' : 'hover:bg-white/8',
                          ].join(' ')}
                          onClick={() => setSelectedId(node.id)}
                          onDoubleClick={() => openNode(node)}
                        >
                          <span className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-2xl shadow-lg ${node.color ?? 'from-slate-400 to-slate-700'}`}>
                            <AppGlyph iconKey={node.iconKey} fallback={node.icon} className="h-8 w-8" />
                          </span>
                          <span className="line-clamp-2 text-xs text-white/85">{node.name}</span>
                        </button>
                      ))}
                    </div>
                  )
                ) : (
                  <div className="flex h-40 items-center justify-center text-sm text-white/45">该文件夹为空。</div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex h-7 shrink-0 items-center gap-1 border-t border-white/10 bg-white/[0.04] px-3 text-[11px] text-white/45">
            {breadcrumb.map((node, index) => (
              <span key={node.id} className="flex items-center gap-0.5">
                {index > 0 ? <ChevronRight className="h-3 w-3 text-white/25" strokeWidth={2} /> : null}
                <button
                  type="button"
                  className="rounded px-1 text-white/55 transition hover:text-white"
                  onClick={() => navigate(path.slice(0, index))}
                >
                  {node.name}
                </button>
              </span>
            ))}
            <span className="ml-auto font-mono tabular-nums">{current.children?.length ?? 0} 项</span>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
