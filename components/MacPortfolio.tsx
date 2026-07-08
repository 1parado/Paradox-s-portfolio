'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ContextMenu } from '@/components/ContextMenu';
import { EditKeyModal } from '@/components/EditKeyModal';
import { Folder } from '@/components/Folder';
import { HomeScreen } from '@/components/HomeScreen';
import { InAppBrowser } from '@/components/InAppBrowser';
import { MacControlCenter } from '@/components/MacControlCenter';
import { MacDesktopIcon } from '@/components/MacDesktopIcon';
import { MacDock } from '@/components/MacDock';
import { MacMenuBar } from '@/components/MacMenuBar';
import { MacWidgetStack } from '@/components/MacWidgetStack';
import { MacWindow } from '@/components/MacWindow';
import { PasswordModal } from '@/components/PasswordModal';
import { SettingsPanel } from '@/components/SettingsPanel';
import { WallpaperPicker } from '@/components/WallpaperPicker';
import { StoreProvider, usePortfolioStore } from '@/lib/store';
import type { AppItem, DesktopIconPosition, FolderItem } from '@/lib/types';

type WindowState = {
  id: string;
  app: AppItem;
  minimized: boolean;
  zIndex: number;
};

type SelectionState = {
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
};

type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const DESKTOP_ICON_WIDTH = 96;
const DESKTOP_ICON_HEIGHT = 96;
const WIDGET_WIDTH = 336;
const WIDGET_HEIGHT = 260;
const DESKTOP_TOP = 64;
const DESKTOP_RIGHT = 24;
const DESKTOP_BOTTOM_SAFE = 132;
const DESKTOP_GAP_X = 24;
const DESKTOP_GAP_Y = 20;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

function getDefaultDesktopPosition(index: number, viewport: { width: number; height: number }): DesktopIconPosition {
  const usableHeight = Math.max(DESKTOP_ICON_HEIGHT, viewport.height - DESKTOP_TOP - DESKTOP_BOTTOM_SAFE);
  const rows = Math.max(1, Math.floor((usableHeight + DESKTOP_GAP_Y) / (DESKTOP_ICON_HEIGHT + DESKTOP_GAP_Y)));
  const column = Math.floor(index / rows);
  const row = index % rows;

  return {
    x: Math.max(24, viewport.width - DESKTOP_RIGHT - DESKTOP_ICON_WIDTH - column * (DESKTOP_ICON_WIDTH + DESKTOP_GAP_X)),
    y: DESKTOP_TOP + row * (DESKTOP_ICON_HEIGHT + DESKTOP_GAP_Y),
  };
}

function clampDesktopPosition(position: DesktopIconPosition, viewport: { width: number; height: number }): DesktopIconPosition {
  return {
    x: clamp(position.x, 8, Math.max(8, viewport.width - DESKTOP_ICON_WIDTH - 8)),
    y: clamp(position.y, 44, Math.max(44, viewport.height - DESKTOP_ICON_HEIGHT - 96)),
  };
}

function clampWidgetPosition(position: DesktopIconPosition, viewport: { width: number; height: number }): DesktopIconPosition {
  return {
    x: clamp(position.x, 8, Math.max(8, viewport.width - WIDGET_WIDTH - 8)),
    y: clamp(position.y, 44, Math.max(44, viewport.height - WIDGET_HEIGHT - 96)),
  };
}

function selectionToRect(selection: SelectionState): Rect {
  const x = Math.min(selection.startX, selection.currentX);
  const y = Math.min(selection.startY, selection.currentY);
  return {
    x,
    y,
    width: Math.abs(selection.currentX - selection.startX),
    height: Math.abs(selection.currentY - selection.startY),
  };
}

function rectsIntersect(a: Rect, b: Rect) {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function MacPortfolioInner() {
  const {
    pages,
    dock,
    wallpaper,
    editMode,
    desktopIconPositions,
    desktopWidgetPositions,
    setWallpaper,
    setEditMode,
    setDesktopIconPosition,
    setDesktopIconPositions,
    setDesktopWidgetPosition,
    reorderPageItems,
    moveItemAcrossPages,
    removeItem,
    resetToDefault,
    verifyEditKey,
  } = usePortfolioStore();

  const [windows, setWindows] = useState<WindowState[]>([]);
  const [activeMobileApp, setActiveMobileApp] = useState<AppItem | null>(null);
  const [topZ, setTopZ] = useState(80);
  const [passwordApp, setPasswordApp] = useState<AppItem | null>(null);
  const [contextApp, setContextApp] = useState<{ app: AppItem; pageId?: string } | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showControlCenter, setShowControlCenter] = useState(false);
  const [showWallpaper, setShowWallpaper] = useState(false);
  const [openFolder, setOpenFolder] = useState<FolderItem | null>(null);
  const [viewport, setViewport] = useState({ width: 1440, height: 900 });
  const [draggingIconId, setDraggingIconId] = useState<string | null>(null);
  const [selectedIconIds, setSelectedIconIds] = useState<string[]>([]);
  const [selection, setSelection] = useState<SelectionState | null>(null);
  const [groupDragOffset, setGroupDragOffset] = useState({ x: 0, y: 0 });
  const suppressOpenRef = useRef<string | null>(null);
  const selectionPointerRef = useRef<number | null>(null);
  const groupDragIdsRef = useRef<string[]>([]);
  const groupDragBaseRef = useRef<Record<string, DesktopIconPosition>>({});

  const desktopEntries = useMemo(
    () => pages.flatMap((page) => page.items.map((item) => ({ item: item as AppItem, pageId: page.id, pageTitle: page.title }))),
    [pages],
  );

  const activeWindow = useMemo(() => windows.filter((window) => !window.minimized).sort((a, b) => b.zIndex - a.zIndex)[0], [windows]);
  const runningIds = windows.map((window) => window.app.id);
  const minimizedIds = windows.filter((window) => window.minimized).map((window) => window.app.id);
  const selectedIconSet = useMemo(() => new Set(selectedIconIds), [selectedIconIds]);
  const desktopIconPositionMap = useMemo(() => {
    const entries: Record<string, DesktopIconPosition> = {};
    desktopEntries.forEach(({ item }, index) => {
      entries[item.id] = clampDesktopPosition(
        desktopIconPositions[item.id] ?? getDefaultDesktopPosition(index, viewport),
        viewport,
      );
    });
    return entries;
  }, [desktopEntries, desktopIconPositions, viewport]);
  const widgetPosition = clampWidgetPosition(desktopWidgetPositions.summary ?? { x: 40, y: 244 }, viewport);

  const selectIconsInRect = (rect: Rect) => {
    const selected = desktopEntries
      .filter(({ item }) => {
        const position = desktopIconPositionMap[item.id];
        return rectsIntersect(rect, {
          x: position.x,
          y: position.y,
          width: DESKTOP_ICON_WIDTH,
          height: DESKTOP_ICON_HEIGHT,
        });
      })
      .map(({ item }) => item.id);
    setSelectedIconIds(selected);
  };

  useEffect(() => {
    const updateViewport = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };
    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  const focusWindow = (id: string) => {
    setTopZ((value) => value + 1);
    setWindows((current) => current.map((window) => (
      window.id === id ? { ...window, minimized: false, zIndex: topZ + 1 } : window
    )));
  };

  const openWindow = (app: AppItem) => {
    setTopZ((value) => value + 1);
    setWindows((current) => {
      const existing = current.find((window) => window.app.id === app.id);
      if (existing) {
        return current.map((window) => (
          window.id === existing.id ? { ...window, minimized: false, zIndex: topZ + 1 } : window
        ));
      }
      return [...current, { id: `window-${app.id}`, app, minimized: false, zIndex: topZ + 1 }];
    });
  };

  const openUnlockedApp = (app: AppItem) => {
    if (app.builtinKey === 'settings') {
      setShowSettings(true);
      return;
    }
    if (app.type === 'folder') {
      setOpenFolder(app as FolderItem);
      return;
    }
    if (app.externalOnly && app.url) {
      window.open(app.url, app.url.startsWith('mailto:') ? '_self' : '_blank', 'noopener,noreferrer');
      return;
    }
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setActiveMobileApp(app);
      return;
    }
    openWindow(app);
  };

  const openApp = (app: AppItem) => {
    if (app.password) {
      setPasswordApp(app);
      return;
    }
    openUnlockedApp(app);
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (activeWindow) {
          setWindows((current) => current.filter((window) => window.id !== activeWindow.id));
          return;
        }
        setPasswordApp(null);
        setContextApp(null);
        setShowEditModal(false);
        setShowSettings(false);
        setShowControlCenter(false);
        setShowWallpaper(false);
        setActiveMobileApp(null);
        setOpenFolder(null);
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'e') {
        event.preventDefault();
        setShowEditModal(true);
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setShowSettings(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeWindow]);

  return (
    <main className="relative min-h-screen overflow-hidden bg-zinc-950 text-white">
      <div className="absolute inset-0" style={{ background: wallpaper }} />
      <div className="absolute inset-0 bg-[linear-gradient(125deg,rgba(255,255,255,0.11),transparent_22%,rgba(0,0,0,0.28)_64%,rgba(0,0,0,0.48)),linear-gradient(0deg,rgba(0,0,0,0.26),rgba(255,255,255,0.04))]" />
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/30 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black/45 to-transparent" />

      <section className="relative z-10 min-h-screen md:hidden">
        <div className="mx-auto flex min-h-screen w-full items-center justify-center bg-black sm:px-5 sm:py-8">
          <div className="relative h-screen w-screen overflow-hidden bg-black shadow-phone sm:h-[860px] sm:w-[430px] sm:rounded-[3.2rem] sm:border sm:border-white/10">
            <div className="absolute left-1/2 top-3 z-20 hidden h-8 w-36 -translate-x-1/2 rounded-full bg-black/80 sm:block" />
            <div className="absolute inset-0" style={{ background: wallpaper }} />
            <div className="absolute inset-0 bg-[linear-gradient(160deg,rgba(255,255,255,0.18),transparent_26%,rgba(0,0,0,0.26)_74%),linear-gradient(0deg,rgba(0,0,0,0.24),rgba(255,255,255,0.04))] backdrop-blur-[1px]" />
            <div className="relative z-10 h-full">
              <HomeScreen
                pages={pages}
                dock={dock}
                editing={editMode}
                onOpen={openApp}
                onLongPress={(app, pageId) => setContextApp({ app, pageId })}
                onReorder={reorderPageItems}
                onMoveItem={moveItemAcrossPages}
              />
            </div>
            <InAppBrowser app={activeMobileApp} onClose={() => setActiveMobileApp(null)} />
          </div>
        </div>
      </section>

      <section className="relative z-10 hidden min-h-screen md:block">
        <MacMenuBar
          activeTitle={activeWindow?.app.title}
          editing={editMode}
          onSettings={() => setShowSettings(true)}
          onWallpaper={() => setShowWallpaper(true)}
          onEdit={() => {
            if (editMode) {
              setEditMode(false);
              return;
            }
            setShowEditModal(true);
          }}
          onControlCenter={() => setShowControlCenter((value) => !value)}
        />

        {showControlCenter ? (
          <MacControlCenter
            editing={editMode}
            onEdit={() => {
              setShowControlCenter(false);
              if (editMode) {
                setEditMode(false);
                return;
              }
              setShowEditModal(true);
            }}
            onWallpaper={() => {
              setShowControlCenter(false);
              setShowWallpaper(true);
            }}
            onSettings={() => {
              setShowControlCenter(false);
              setShowSettings(true);
            }}
          />
        ) : null}

        <div className="absolute left-10 top-20 max-w-[34rem]">
          <div className="rounded-[1.65rem] border border-white/15 bg-zinc-950/30 p-6 shadow-[0_26px_90px_rgba(0,0,0,0.34)] backdrop-blur-2xl">
            <div className="mb-5 flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
              <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
              <span className="h-3 w-3 rounded-full bg-[#28c840]" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/48">Paradox Desktop</p>
            <h1 className="mt-3 text-6xl font-semibold leading-none tracking-tight">Paradox&apos;s portfolio</h1>
          </div>
        </div>

        <motion.div
          className="absolute z-20 cursor-grab active:cursor-grabbing"
          style={{ left: widgetPosition.x, top: widgetPosition.y }}
          drag
          dragMomentum={false}
          dragElastic={0}
          dragSnapToOrigin
          onDragEnd={(_, info) => {
            setDesktopWidgetPosition('summary', clampWidgetPosition({
              x: widgetPosition.x + info.offset.x,
              y: widgetPosition.y + info.offset.y,
            }, viewport));
          }}
          whileDrag={{ scale: 1.015, zIndex: 48 }}
        >
          <MacWidgetStack appCount={desktopEntries.length} dockCount={dock.length} />
        </motion.div>

        <div
          className="absolute inset-0 z-10"
          onPointerDown={(event) => {
            if (event.button !== 0 || event.target !== event.currentTarget) return;
            event.currentTarget.setPointerCapture(event.pointerId);
            selectionPointerRef.current = event.pointerId;
            const nextSelection = {
              startX: event.clientX,
              startY: event.clientY,
              currentX: event.clientX,
              currentY: event.clientY,
            };
            setSelection(nextSelection);
            setSelectedIconIds([]);
          }}
          onPointerMove={(event) => {
            if (selectionPointerRef.current !== event.pointerId) return;
            const nextSelection = (current: SelectionState | null) => {
              if (!current) return current;
              return { ...current, currentX: event.clientX, currentY: event.clientY };
            };
            setSelection((current) => {
              const updated = nextSelection(current);
              if (updated) selectIconsInRect(selectionToRect(updated));
              return updated;
            });
          }}
          onPointerUp={(event) => {
            if (selectionPointerRef.current !== event.pointerId) return;
            selectionPointerRef.current = null;
            setSelection(null);
          }}
          onPointerCancel={(event) => {
            if (selectionPointerRef.current !== event.pointerId) return;
            selectionPointerRef.current = null;
            setSelection(null);
          }}
        >
          {selection ? (
            <div
              className="pointer-events-none absolute rounded-md border border-sky-200/75 bg-sky-300/20 shadow-[0_0_0_1px_rgba(14,165,233,0.18)] backdrop-blur-[1px]"
              style={{
                left: selectionToRect(selection).x,
                top: selectionToRect(selection).y,
                width: selectionToRect(selection).width,
                height: selectionToRect(selection).height,
              }}
            />
          ) : null}

          {desktopEntries.map(({ item, pageId, pageTitle }, index) => {
            const position = desktopIconPositionMap[item.id] ?? getDefaultDesktopPosition(index, viewport);
            const inActiveGroup = Boolean(draggingIconId && item.id !== draggingIconId && selectedIconSet.has(item.id) && selectedIconSet.has(draggingIconId));

            return (
              <motion.div
                key={`${pageId}-${item.id}`}
                className="absolute cursor-default"
                style={{
                  left: position.x + (inActiveGroup ? groupDragOffset.x : 0),
                  top: position.y + (inActiveGroup ? groupDragOffset.y : 0),
                }}
                drag
                dragMomentum={false}
                dragElastic={0}
                dragSnapToOrigin
                onDragStart={() => {
                  suppressOpenRef.current = item.id;
                  setDraggingIconId(item.id);
                  const dragIds = selectedIconSet.has(item.id) ? selectedIconIds : [item.id];
                  groupDragIdsRef.current = dragIds;
                  groupDragBaseRef.current = dragIds.reduce<Record<string, DesktopIconPosition>>((acc, id) => {
                    acc[id] = desktopIconPositionMap[id];
                    return acc;
                  }, {});
                  setSelectedIconIds(dragIds);
                }}
                onDrag={(_, info) => {
                  setGroupDragOffset({ x: info.offset.x, y: info.offset.y });
                }}
                onDragEnd={(_, info) => {
                  const nextPositions = groupDragIdsRef.current.reduce<Record<string, DesktopIconPosition>>((acc, id) => {
                    const base = groupDragBaseRef.current[id] ?? desktopIconPositionMap[id];
                    acc[id] = clampDesktopPosition({
                      x: base.x + info.offset.x,
                      y: base.y + info.offset.y,
                    }, viewport);
                    return acc;
                  }, {});
                  setDesktopIconPositions(Object.keys(nextPositions).length > 0 ? nextPositions : {
                    [item.id]: clampDesktopPosition({
                      x: position.x + info.offset.x,
                      y: position.y + info.offset.y,
                    }, viewport),
                  });
                  setGroupDragOffset({ x: 0, y: 0 });
                  window.setTimeout(() => {
                    if (suppressOpenRef.current === item.id) suppressOpenRef.current = null;
                    setDraggingIconId((current) => (current === item.id ? null : current));
                  }, 120);
                }}
                whileDrag={{ scale: 1.04, zIndex: 45 }}
              >
                <MacDesktopIcon
                  app={item}
                  editing={editMode}
                  selected={selectedIconSet.has(item.id)}
                  onOpen={(app) => {
                    if (suppressOpenRef.current === item.id || draggingIconId === item.id) return;
                    openApp(app);
                  }}
                  onLongPress={(app) => setContextApp({ app, pageId })}
                />
                <span className="sr-only">{pageTitle}</span>
              </motion.div>
            );
          })}
        </div>

        <AnimatePresence>
          {windows.map((window) => (
            <MacWindow
              key={window.id}
              app={window.app}
              zIndex={window.zIndex}
              minimized={window.minimized}
              focused={activeWindow?.id === window.id}
              onFocus={() => focusWindow(window.id)}
              onClose={() => setWindows((current) => current.filter((item) => item.id !== window.id))}
              onMinimize={() => setWindows((current) => current.map((item) => (
                item.id === window.id ? { ...item, minimized: true } : item
              )))}
            />
          ))}
        </AnimatePresence>

        <MacDock
          apps={dock}
          editing={editMode}
          runningIds={runningIds}
          minimizedIds={minimizedIds}
          onOpen={openApp}
          onLongPress={(app) => setContextApp({ app })}
        />
      </section>

      {passwordApp ? (
        <PasswordModal
          app={passwordApp}
          onClose={() => setPasswordApp(null)}
          onSuccess={() => {
            openUnlockedApp(passwordApp);
            setPasswordApp(null);
          }}
        />
      ) : null}

      {contextApp ? (
        <ContextMenu
          app={contextApp.app}
          pages={pages}
          editing={editMode}
          onClose={() => setContextApp(null)}
          onOpen={(app) => {
            setContextApp(null);
            openApp(app);
          }}
          onOpenExternal={(app) => {
            if (app.url) window.open(app.url, '_blank', 'noopener,noreferrer');
            setContextApp(null);
          }}
          onRequestEdit={() => {
            setContextApp(null);
            setShowEditModal(true);
          }}
          onMove={(targetPageId) => {
            if (contextApp.pageId && contextApp.pageId !== targetPageId) {
              moveItemAcrossPages(contextApp.pageId, targetPageId, contextApp.app.id, pages.find((page) => page.id === targetPageId)?.items.length ?? 0);
            }
            setContextApp(null);
          }}
          onDelete={() => {
            if (contextApp.pageId) removeItem(contextApp.pageId, contextApp.app.id);
            setContextApp(null);
          }}
        />
      ) : null}

      {showSettings ? (
        <SettingsPanel
          editing={editMode}
          onClose={() => setShowSettings(false)}
          onRequestEdit={() => {
            setShowSettings(false);
            setShowEditModal(true);
          }}
          onExitEdit={() => {
            setEditMode(false);
            setShowSettings(false);
          }}
          onWallpaper={() => {
            setShowSettings(false);
            setShowWallpaper(true);
          }}
          onReset={() => {
            resetToDefault();
            setShowSettings(false);
            setWindows([]);
          }}
        />
      ) : null}

      {showEditModal ? (
        <EditKeyModal
          onClose={() => setShowEditModal(false)}
          onSubmit={(value) => {
            const ok = verifyEditKey(value);
            if (ok) {
              setEditMode(true);
              setShowEditModal(false);
            }
            return ok;
          }}
        />
      ) : null}

      {showWallpaper ? (
        <WallpaperPicker
          current={wallpaper}
          onClose={() => setShowWallpaper(false)}
          onSelect={(value) => {
            setWallpaper(value);
            setShowWallpaper(false);
          }}
        />
      ) : null}

      {openFolder ? <Folder folder={openFolder} onClose={() => setOpenFolder(null)} onOpen={openApp} /> : null}
    </main>
  );
}

export function MacPortfolio() {
  return (
    <StoreProvider>
      <MacPortfolioInner />
    </StoreProvider>
  );
}
