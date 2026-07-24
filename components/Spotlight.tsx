'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { AppGlyph } from '@/components/AppGlyph';
import { flattenAllItems, isFolder } from '@/lib/folders';
import type { AppItem, FolderItem, HomePage } from '@/lib/types';

type Props = {
  pages: HomePage[];
  dock: AppItem[];
  initialQuery?: string;
  onOpen: (app: AppItem) => void;
  onOpenFolder: (folder: FolderItem) => void;
  onClose: () => void;
};

type Result = {
  item: AppItem;
  hint: string;
  score: number;
};

function describeLocation(entry: { pageTitle?: string; folderTitle?: string }): string {
  if (entry.folderTitle) return `${entry.folderTitle} · ${entry.pageTitle ?? ''}`.trim();
  return entry.pageTitle ?? '';
}

export function Spotlight({ pages, dock, initialQuery = '', onOpen, onOpenFolder, onClose }: Props) {
  const [query, setQuery] = useState(initialQuery);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);

  const entries = useMemo(() => flattenAllItems(pages, dock), [pages, dock]);

  const results = useMemo<Result[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      // 无输入时展示全部，按标题排序，便于浏览
      return entries
        .map((entry) => ({ item: entry.item, hint: describeLocation(entry), score: 1 }))
        .sort((a, b) => a.item.title.localeCompare(b.item.title, 'zh-CN'));
    }
    const matched: Result[] = [];
    for (const entry of entries) {
      const title = entry.item.title.toLowerCase();
      const desc = (entry.item.description ?? '').toLowerCase();
      let score = 0;
      if (title === q) score = 100;
      else if (title.startsWith(q)) score = 80;
      else if (title.includes(q)) score = 60;
      else if (desc.includes(q)) score = 30;
      else continue;
      matched.push({ item: entry.item, hint: describeLocation(entry), score });
    }
    matched.sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title, 'zh-CN'));
    return matched.slice(0, 12);
  }, [entries, query]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, []);

  useEffect(() => {
    const node = listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`);
    node?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const choose = (result: Result | undefined) => {
    if (!result) return;
    if (isFolder(result.item)) {
      onOpenFolder(result.item as FolderItem);
    } else {
      onOpen(result.item);
    }
    onClose();
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive((current) => Math.min(current + 1, results.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive((current) => Math.max(current - 1, 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      choose(results[active]);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
    }
  };

  return (
    <div className="absolute inset-0 z-[60] flex items-start justify-center bg-black/30 p-4 pt-[18vh]" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: -12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -12, scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        className="w-full max-w-xl overflow-hidden rounded-[1.6rem] border border-white/14 bg-zinc-950/90 shadow-glass backdrop-blur-3xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4">
          <Search className="h-5 w-5 shrink-0 text-white/50" strokeWidth={1.9} />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Spotlight 搜索：应用、文件夹、链接…"
            className="h-14 flex-1 bg-transparent text-lg text-white outline-none placeholder:text-white/35"
          />
          <kbd className="hidden rounded-md border border-white/10 bg-white/8 px-2 py-1 font-mono text-[11px] text-white/50 sm:inline">Esc</kbd>
        </div>
        <div className="h-px bg-white/10" />
        <div ref={listRef} className="max-h-[52vh] overflow-y-auto p-2">
          {results.length === 0 ? (
            <div className="px-3 py-6 text-center text-sm text-white/45">没有匹配的结果。</div>
          ) : (
            results.map((result, index) => (
              <button
                key={`${result.item.id}-${index}`}
                type="button"
                data-index={index}
                onMouseEnter={() => setActive(index)}
                onClick={() => choose(result)}
                className={[
                  'flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition',
                  index === active ? 'bg-sky-500/80 text-white' : 'text-white/85 hover:bg-white/8',
                ].join(' ')}
              >
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-lg ${result.item.color}`}>
                  <AppGlyph iconKey={result.item.iconKey} fallback={result.item.icon} className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{result.item.title}</span>
                  <span className={['block truncate text-xs', index === active ? 'text-white/75' : 'text-white/45'].join(' ')}>
                    {result.hint ? `${result.hint} · ` : ''}{result.item.description}
                  </span>
                </span>
                {isFolder(result.item) ? <span className="text-[11px] text-white/55">文件夹</span> : null}
              </button>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
