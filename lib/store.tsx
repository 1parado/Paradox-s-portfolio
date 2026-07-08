'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { defaultDock, defaultEditKey, defaultPages, defaultWallpaper } from '@/lib/defaultData';
import type { AppItem, DesktopIconPosition, HomePage } from '@/lib/types';

type StoreValue = {
  pages: HomePage[];
  dock: AppItem[];
  wallpaper: string;
  editMode: boolean;
  desktopIconPositions: Record<string, DesktopIconPosition>;
  desktopWidgetPositions: Record<string, DesktopIconPosition>;
  setWallpaper: (value: string) => void;
  setEditMode: (value: boolean) => void;
  setDesktopIconPosition: (itemId: string, position: DesktopIconPosition) => void;
  setDesktopIconPositions: (positions: Record<string, DesktopIconPosition>) => void;
  setDesktopWidgetPosition: (widgetId: string, position: DesktopIconPosition) => void;
  reorderPageItems: (pageId: string, items: HomePage['items']) => void;
  moveItemAcrossPages: (fromPageId: string, toPageId: string, itemId: string, targetIndex: number) => void;
  removeItem: (pageId: string, itemId: string) => void;
  resetToDefault: () => void;
  verifyEditKey: (input: string) => boolean;
};

const STORAGE_KEY = 'paradox-macos-portfolio-v2';
const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [pages, setPages] = useState<HomePage[]>(defaultPages);
  const [dock] = useState<AppItem[]>(defaultDock);
  const [wallpaper, setWallpaper] = useState(defaultWallpaper);
  const [editMode, setEditMode] = useState(false);
  const [desktopIconPositions, setDesktopIconPositions] = useState<Record<string, DesktopIconPosition>>({});
  const [desktopWidgetPositions, setDesktopWidgetPositions] = useState<Record<string, DesktopIconPosition>>({});

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as Pick<StoreValue, 'pages' | 'wallpaper' | 'desktopIconPositions' | 'desktopWidgetPositions'>;
      if (parsed.pages) setPages(parsed.pages);
      if (parsed.wallpaper) setWallpaper(parsed.wallpaper);
      if (parsed.desktopIconPositions) setDesktopIconPositions(parsed.desktopIconPositions);
      if (parsed.desktopWidgetPositions) setDesktopWidgetPositions(parsed.desktopWidgetPositions);
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ pages, wallpaper, desktopIconPositions, desktopWidgetPositions }));
  }, [desktopIconPositions, desktopWidgetPositions, pages, wallpaper]);

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

  const removeItem = useCallback((pageId: string, itemId: string) => {
    setPages((current) => current.map((page) => (page.id === pageId ? { ...page, items: page.items.filter((item) => item.id !== itemId) } : page)));
  }, []);

  const resetToDefault = useCallback(() => {
    setPages(defaultPages);
    setWallpaper(defaultWallpaper);
    setDesktopIconPositions({});
    setDesktopWidgetPositions({});
    setEditMode(false);
    window.localStorage.removeItem(STORAGE_KEY);
  }, []);

  const verifyEditKey = useCallback((input: string) => {
    const expected = process.env.NEXT_PUBLIC_EDIT_KEY || process.env.NEXT_PUBLIC_EDIT_PASSCODE || defaultEditKey;
    return input === expected;
  }, []);

  const value = useMemo(
    () => ({
      pages,
      dock,
      wallpaper,
      editMode,
      desktopIconPositions,
      desktopWidgetPositions,
      setWallpaper,
      setEditMode,
      setDesktopIconPosition,
      setDesktopIconPositions: setManyDesktopIconPositions,
      setDesktopWidgetPosition,
      reorderPageItems,
      moveItemAcrossPages,
      removeItem,
      resetToDefault,
      verifyEditKey,
    }),
    [desktopIconPositions, desktopWidgetPositions, dock, editMode, moveItemAcrossPages, pages, removeItem, reorderPageItems, resetToDefault, setDesktopIconPosition, setDesktopWidgetPosition, setManyDesktopIconPositions, verifyEditKey, wallpaper],
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
