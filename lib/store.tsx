'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { defaultDock, defaultPages, defaultWallpaper } from '@/lib/defaultData';
import { findFolderById, isDescendantFolder, isFolder } from '@/lib/folders';
import { readSiteWallpaper } from '@/lib/githubAssets';
import type { AppItem, DesktopIconPosition, HomePage, HomeItem } from '@/lib/types';

type StoreValue = {
  pages: HomePage[];
  dock: AppItem[];
  wallpaper: string;
  editMode: boolean;
  trash: AppItem[];
  desktopIconPositions: Record<string, DesktopIconPosition>;
  desktopWidgetPositions: Record<string, DesktopIconPosition>;
  setWallpaper: (value: string) => void;
  setEditMode: (value: boolean) => void;
  setDesktopIconPosition: (itemId: string, position: DesktopIconPosition) => void;
  setDesktopIconPositions: (positions: Record<string, DesktopIconPosition>) => void;
  setDesktopWidgetPosition: (widgetId: string, position: DesktopIconPosition) => void;
  addToDock: (app: AppItem) => void;
  createFolder: (pageId?: string) => void;
  sortDesktop: (mode: 'name' | 'kind' | 'date') => void;
  reorderPageItems: (pageId: string, items: HomePage['items']) => void;
  moveItemAcrossPages: (fromPageId: string, toPageId: string, itemId: string, targetIndex: number) => void;
  renameFolder: (folderId: string, title: string) => void;
  moveItemIntoFolder: (itemId: string, targetFolderId: string) => void;
  moveItemToPage: (itemId: string, pageId: string) => void;
  removeItem: (pageId: string, itemId: string) => void;
  moveToTrash: (pageId: string, itemId: string) => void;
  restoreFromTrash: (itemId: string) => void;
  emptyTrash: () => void;
  resetToDefault: () => void;
  verifyEditKey: (input: string) => boolean;
  isEditKeyConfigured: () => boolean;
};

const STORAGE_KEY = 'paradox-macos-portfolio-v7';
const StoreContext = createContext<StoreValue | null>(null);

function isSameDockApp(left: AppItem, right: AppItem) {
  if (left.id === right.id) return true;
  if (left.url && right.url && left.url === right.url) return true;
  if (left.builtinKey && right.builtinKey && left.builtinKey === right.builtinKey) return true;
  return left.title === right.title && left.type === right.type;
}

function hasUsablePages(value: unknown): value is HomePage[] {
  return Array.isArray(value) && value.length > 0 && value.some((page) => Array.isArray(page?.items) && page.items.length > 0);
}

function hasUsableDock(value: unknown): value is AppItem[] {
  return Array.isArray(value) && value.length > 0;
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [pages, setPages] = useState<HomePage[]>(defaultPages);
  const [dock, setDock] = useState<AppItem[]>(defaultDock);
  const [wallpaper, setWallpaper] = useState(defaultWallpaper);
  const [editMode, setEditMode] = useState(false);
  const [trash, setTrash] = useState<AppItem[]>([]);
  const [desktopIconPositions, setDesktopIconPositions] = useState<Record<string, DesktopIconPosition>>({});
  const [desktopWidgetPositions, setDesktopWidgetPositions] = useState<Record<string, DesktopIconPosition>>({});

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    let hasLocalWallpaper = false;

    try {
      const parsed = JSON.parse(raw ?? '{}') as Pick<StoreValue, 'pages' | 'dock' | 'wallpaper' | 'trash' | 'desktopIconPositions' | 'desktopWidgetPositions'>;
      if (hasUsablePages(parsed.pages)) setPages(parsed.pages);
      if (hasUsableDock(parsed.dock)) {
        // 迁移：从 dock 中移除已下线的「关于」项，保留其余用户自定义。
        const dockWithoutAbout = parsed.dock.filter((item) => item.id !== 'dock-about');
        setDock(dockWithoutAbout.length > 0 ? dockWithoutAbout : defaultDock);
      }
      if (parsed.wallpaper) {
        setWallpaper(parsed.wallpaper);
        hasLocalWallpaper = true;
      }
      if (Array.isArray(parsed.trash)) setTrash(parsed.trash);
      if (parsed.desktopIconPositions) setDesktopIconPositions(parsed.desktopIconPositions);
      if (parsed.desktopWidgetPositions) setDesktopWidgetPositions(parsed.desktopWidgetPositions);
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }

    // 本机未选过壁纸时，拉取站点级壁纸（部署后由编辑模式上传写入 GitHub），让首次访客也能看到。
    if (!hasLocalWallpaper) {
      readSiteWallpaper().then((value) => {
        if (value) setWallpaper(value);
      });
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ pages, dock, wallpaper, trash, desktopIconPositions, desktopWidgetPositions }));
  }, [desktopIconPositions, desktopWidgetPositions, dock, pages, trash, wallpaper]);

  const setDesktopIconPosition = useCallback((itemId: string, position: DesktopIconPosition) => {
    setDesktopIconPositions((current) => ({
      ...current,
      [itemId]: position,
    }));
  }, []);

  const setManyDesktopIconPositions = useCallback((positions: Record<string, DesktopIconPosition>) => {
    setDesktopIconPositions((current) => ({
      ...current,
      ...positions,
    }));
  }, []);

  const setDesktopWidgetPosition = useCallback((widgetId: string, position: DesktopIconPosition) => {
    setDesktopWidgetPositions((current) => ({
      ...current,
      [widgetId]: position,
    }));
  }, []);

  const addToDock = useCallback((app: AppItem) => {
    setDock((current) => {
      if (current.some((item) => isSameDockApp(item, app))) return current;
      return [...current, app];
    });
  }, []);

  const createFolder = useCallback((pageId?: string) => {
    const folderId = `folder-${Date.now()}`;
    setPages((current) => {
      const targetPageId = pageId ?? current[0]?.id;
      if (!targetPageId) return current;

      return current.map((page) => {
        if (page.id !== targetPageId) return page;
        return {
          ...page,
          items: [
            ...page.items,
            {
              id: folderId,
              title: '新建文件夹',
              icon: '🗂️',
              iconKey: 'folder',
              color: 'from-slate-300 to-slate-600',
              description: '编辑模式中新建的文件夹，可继续整理作品入口。',
              type: 'folder',
              children: [],
            },
          ],
        };
      });
    });
  }, []);

  const sortDesktop = useCallback((mode: 'name' | 'kind' | 'date') => {
    const weightByKind: Record<AppItem['type'], number> = { folder: 0, builtin: 1, external: 2 };
    setPages((current) => current.map((page) => ({
      ...page,
      items: [...page.items].sort((left, right) => {
        if (mode === 'kind') {
          return weightByKind[left.type] - weightByKind[right.type] || left.title.localeCompare(right.title, 'zh-CN');
        }
        if (mode === 'date') {
          return right.id.localeCompare(left.id);
        }
        return left.title.localeCompare(right.title, 'zh-CN');
      }),
    })));
  }, []);

  const reorderPageItems = useCallback((pageId: string, items: HomePage['items']) => {
    setPages((current) => current.map((page) => (page.id === pageId ? { ...page, items } : page)));
  }, []);

  const moveItemAcrossPages = useCallback((fromPageId: string, toPageId: string, itemId: string, targetIndex: number) => {
    setPages((current) => {
      const next = current.map((page) => ({ ...page, items: [...page.items] }));
      const fromPage = next.find((page) => page.id === fromPageId);
      const toPage = next.find((page) => page.id === toPageId);
      if (!fromPage || !toPage) return current;

      const itemIndex = fromPage.items.findIndex((item) => item.id === itemId);
      if (itemIndex === -1) return current;

      const [item] = fromPage.items.splice(itemIndex, 1);
      const safeIndex = Math.max(0, Math.min(targetIndex, toPage.items.length));
      toPage.items.splice(safeIndex, 0, item);
      return next;
    });
  }, []);

  // 递归：在 items 中按 id 移除一个节点（可能是 page 顶层项或文件夹内的项）。
  function removeFromItems(items: HomeItem[], itemId: string): { items: HomeItem[]; removed: HomeItem | null } {
    let removed: HomeItem | null = null;
    const filtered = items.filter((item) => {
      if (item.id === itemId) {
        removed = item;
        return false;
      }
      return true;
    });
    const next = filtered.map((item) => {
      if (!isFolder(item)) return item;
      const childResult = removeFromItems(item.children, itemId);
      if (childResult.removed) removed = childResult.removed;
      return { ...item, children: childResult.items };
    });
    return { items: next, removed };
  }

  // 递归：把 item 追加到目标文件夹的 children 末尾。
  function pushIntoFolder(items: HomeItem[], targetFolderId: string, item: HomeItem): HomeItem[] {
    return items.map((entry) => {
      if (!isFolder(entry)) return entry;
      if (entry.id === targetFolderId) {
        return { ...entry, children: [...entry.children, item] };
      }
      return { ...entry, children: pushIntoFolder(entry.children, targetFolderId, item) };
    });
  }

  // 递归：按 id 重命名文件夹。
  function renameFolderInItems(items: HomeItem[], folderId: string, title: string): HomeItem[] {
    return items.map((item) => {
      if (isFolder(item)) {
        const nextTitle = item.id === folderId ? title : item.title;
        return { ...item, title: nextTitle, children: renameFolderInItems(item.children, folderId, title) };
      }
      return item;
    });
  }

  const renameFolder = useCallback((folderId: string, title: string) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    setPages((current) => current.map((page) => ({
      ...page,
      items: renameFolderInItems(page.items, folderId, trimmed),
    })));
  }, []);

  const moveItemIntoFolder = useCallback((itemId: string, targetFolderId: string) => {
    if (itemId === targetFolderId) return;
    setPages((current) => {
      // 不能把文件夹拖进它自己的子孙文件夹
      if (isDescendantFolder(current, targetFolderId, itemId)) return current;
      const target = findFolderById(current, targetFolderId);
      if (!target) return current;
      // 先从所有 page 顶层 + 文件夹内递归移除
      let removed: HomeItem | null = null;
      const cleaned = current.map((page) => {
        const result = removeFromItems(page.items, itemId);
        if (result.removed) removed = result.removed;
        return { ...page, items: result.items };
      });
      if (!removed) return current;
      const withItem = cleaned.map((page) => ({
        ...page,
        items: pushIntoFolder(page.items, targetFolderId, removed as HomeItem),
      }));
      return withItem;
    });
    setDesktopIconPositions((current) => {
      if (!(itemId in current)) return current;
      const { [itemId]: _removed, ...rest } = current;
      return rest;
    });
  }, []);

  const moveItemToPage = useCallback((itemId: string, pageId: string) => {
    setPages((current) => {
      let removed: HomeItem | null = null;
      const cleaned = current.map((page) => {
        const result = removeFromItems(page.items, itemId);
        if (result.removed) removed = result.removed;
        return { ...page, items: result.items };
      });
      if (!removed) return current;
      return cleaned.map((page) => (
        page.id === pageId ? { ...page, items: [...page.items, removed as HomeItem] } : page
      ));
    });
  }, []);

  const removeItem = useCallback((pageId: string, itemId: string) => {
    setPages((current) => current.map((page) => (page.id === pageId ? { ...page, items: page.items.filter((item) => item.id !== itemId) } : page)));
  }, []);

  const moveToTrash = useCallback((pageId: string, itemId: string) => {
    setPages((current) => {
      let moved: AppItem | null = null;
      const next = current.map((page) => {
        if (page.id !== pageId) return page;
        const found = page.items.find((item) => item.id === itemId);
        if (found) moved = found;
        return { ...page, items: page.items.filter((item) => item.id !== itemId) };
      });
      if (moved) {
        setTrash((prev) => (prev.some((t) => t.id === moved!.id) ? prev : [{ ...moved! }, ...prev]));
      }
      return next;
    });
    setDesktopIconPositions((current) => {
      if (!(itemId in current)) return current;
      const { [itemId]: _removed, ...rest } = current;
      return rest;
    });
  }, []);

  const restoreFromTrash = useCallback((itemId: string) => {
    setTrash((current) => {
      const found = current.find((t) => t.id === itemId);
      if (!found) return current;
      setPages((pages) => pages.map((page, index) => (index === 0 ? { ...page, items: [...page.items, found] } : page)));
      return current.filter((t) => t.id !== itemId);
    });
  }, []);

  const emptyTrash = useCallback(() => {
    setTrash([]);
  }, []);

  const resetToDefault = useCallback(() => {
    setPages(defaultPages);
    setDock(defaultDock);
    setWallpaper(defaultWallpaper);
    setTrash([]);
    setDesktopIconPositions({});
    setDesktopWidgetPositions({});
    setEditMode(false);
    window.localStorage.removeItem(STORAGE_KEY);
  }, []);

  const resolveEditKey = useCallback(() => process.env.NEXT_PUBLIC_EDIT_KEY || process.env.NEXT_PUBLIC_EDIT_PASSCODE || '', []);

  const isEditKeyConfigured = useCallback(() => resolveEditKey().length > 0, [resolveEditKey]);

  const verifyEditKey = useCallback((input: string) => {
    const expected = resolveEditKey();
    if (!expected) return false; // 未配置编辑密钥时一律拒绝，杜绝默认口令后门
    return input === expected;
  }, [resolveEditKey]);

  const value = useMemo(
    () => ({
      pages,
      dock,
      wallpaper,
      editMode,
      trash,
      desktopIconPositions,
      desktopWidgetPositions,
      setWallpaper,
      setEditMode,
      setDesktopIconPosition,
      setDesktopIconPositions: setManyDesktopIconPositions,
      setDesktopWidgetPosition,
      addToDock,
      createFolder,
      sortDesktop,
      reorderPageItems,
      moveItemAcrossPages,
      renameFolder,
      moveItemIntoFolder,
      moveItemToPage,
      removeItem,
      moveToTrash,
      restoreFromTrash,
      emptyTrash,
      resetToDefault,
      verifyEditKey,
      isEditKeyConfigured,
    }),
    [addToDock, createFolder, desktopIconPositions, desktopWidgetPositions, dock, editMode, emptyTrash, moveItemAcrossPages, moveItemIntoFolder, moveItemToPage, moveToTrash, pages, removeItem, reorderPageItems, renameFolder, resetToDefault, restoreFromTrash, setDesktopIconPosition, setDesktopWidgetPosition, setManyDesktopIconPositions, sortDesktop, trash, verifyEditKey, isEditKeyConfigured, wallpaper],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function usePortfolioStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('usePortfolioStore must be used within StoreProvider');
  }
  return context;
}
