'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ContextMenu } from '@/components/ContextMenu';
import { DesktopAgent } from '@/components/DesktopAgent';
import { EditKeyModal } from '@/components/EditKeyModal';
import { Folder } from '@/components/Folder';
import { HomeScreen } from '@/components/HomeScreen';
import { InAppBrowser } from '@/components/InAppBrowser';
import { MacControlCenter } from '@/components/MacControlCenter';
import { MacDesktopIcon } from '@/components/MacDesktopIcon';
import { MacDesktopMenu } from '@/components/MacDesktopMenu';
import { MacDock } from '@/components/MacDock';
import { MacFinder } from '@/components/MacFinder';
import { MacMenuBar } from '@/components/MacMenuBar';
import { MacMissionControl } from '@/components/MacMissionControl';
import { MacTrashPanel } from '@/components/MacTrashPanel';
import { MacWidgetStack } from '@/components/MacWidgetStack';
import { MacWindow } from '@/components/MacWindow';
import { PasswordModal } from '@/components/PasswordModal';
import { SettingsPanel } from '@/components/SettingsPanel';
import { Spotlight } from '@/components/Spotlight';
import { WallpaperPicker } from '@/components/WallpaperPicker';
import { findFolderById, flattenAllItems, isFolder } from '@/lib/folders';
import { StoreProvider, usePortfolioStore } from '@/lib/store';
import type { AgentAction } from '@/lib/agnesAgent';
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
    trash,
    resetToDefault,
    verifyEditKey,
    isEditKeyConfigured,
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
  const [showFinder, setShowFinder] = useState(false);
  const [showMissionControl, setShowMissionControl] = useState(false);
  const [showTrash, setShowTrash] = useState(false);
  const [showSpotlight, setShowSpotlight] = useState(false);
  const [spotlightQuery, setSpotlightQuery] = useState('');
  const [folderNavStack, setFolderNavStack] = useState<string[]>([]);
  const [renameRequestId, setRenameRequestId] = useState<string | null>(null);
  const [desktopMenu, setDesktopMenu] = useState<{ x: number; y: number } | null>(null);
  const [viewport, setViewport] = useState({ width: 1440, height: 900 });
  const [draggingIconId, setDraggingIconId] = useState<string | null>(null);
  const [dockDropActive, setDockDropActive] = useState(false);
  const [trashDropActive, setTrashDropActive] = useState(false);
  const [folderDropId, setFolderDropId] = useState<string | null>(null);
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
  const agentApps = useMemo(
    () => flattenAllItems(pages, dock).map((entry) => entry.item),
    [pages, dock],
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
  const widgetPosition = clampWidgetPosition(desktopWidgetPositions.summary ?? { x: 40, y: 368 }, viewport);

  // 当前打开的文件夹路径（从根到当前层），由 pages 派生，重命名/移动后实时同步。
  const folderPath = useMemo<FolderItem[]>(() => {
    if (folderNavStack.length === 0) return [];
    return folderNavStack
      .map((id) => findFolderById(pages, id))
      .filter((value): value is FolderItem => Boolean(value));
  }, [folderNavStack, pages]);
  const openFolder = folderPath[folderPath.length - 1] ?? null;

  const openFolderById = useCallback((folder: FolderItem) => {
    setFolderNavStack([folder.id]);
  }, []);

  const navigateIntoFolder = useCallback((folder: FolderItem) => {
    setFolderNavStack((current) => {
      const existing = current.indexOf(folder.id);
      if (existing >= 0) return current.slice(0, existing + 1);
      return [...current, folder.id];
    });
  }, []);

  const closeFolder = useCallback(() => {
    setFolderNavStack([]);
    setRenameRequestId(null);
  }, []);

  const navigateToFolder = useCallback((folder: FolderItem | null) => {
    if (!folder) {
      closeFolder();
      return;
    }
    setFolderNavStack((current) => {
      const index = current.indexOf(folder.id);
      if (index >= 0) return current.slice(0, index + 1);
      return [folder.id];
    });
  }, [closeFolder]);

  const isPointInsideDock = (x: number, y: number) => {
    const dockElement = document.getElementById('mac-dock-dropzone');
    if (!dockElement) return false;
    const rect = dockElement.getBoundingClientRect();
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
  };

  const isPointInsideTrash = (x: number, y: number) => {
    const trashElement = document.getElementById('mac-trash-dropzone');
    if (!trashElement) return false;
    const rect = trashElement.getBoundingClientRect();
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
  };

  // 拖拽点是否落在某个桌面文件夹图标上（编辑模式下用于把应用拖入文件夹）。
  const findFolderAtPoint = (x: number, y: number, excludeId?: string): string | null => {
    const nodes = document.querySelectorAll<HTMLElement>('[data-folder-dropzone]');
    for (const node of nodes) {
      const id = node.dataset.folderDropzone;
      if (!id || id === excludeId) continue;
      const rect = node.getBoundingClientRect();
      if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
        return id;
      }
    }
    return null;
  };

  const addDraggedAppsToDock = (ids: string[]) => {
    const itemsById = new Map(desktopEntries.map(({ item }) => [item.id, item]));
    ids.forEach((id) => {
      const item = itemsById.get(id);
      if (item) addToDock(item);
    });
  };

  const removeDraggedApps = (ids: string[]) => {
    const pageByItemId = new Map(desktopEntries.map(({ item, pageId }) => [item.id, pageId]));
    ids.forEach((id) => {
      const pageId = pageByItemId.get(id);
      if (pageId) moveToTrash(pageId, id);
    });
    setSelectedIconIds([]);
  };

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
      openFolderById(app as FolderItem);
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

  const runAgentAction = (action: AgentAction): string => {
    if (action.name === 'open_app') {
      const app = agentApps.find((item) => item.id === action.arguments.app_id);
      if (!app) return '没有找到这个应用。';
      openApp(app);
      return `已打开“${app.title}”。`;
    }
    if (action.name === 'search_apps') {
      const query = action.arguments.query?.trim() ?? '';
      setSpotlightQuery(query);
      setShowSpotlight(true);
      return query ? `正在搜索“${query}”。` : '已打开 Spotlight。';
    }
    if (action.name === 'open_spotlight') {
      setSpotlightQuery('');
      setShowSpotlight(true);
      return '已打开 Spotlight。';
    }
    if (action.name === 'open_finder') {
      setShowFinder(true);
      return '已打开 Finder。';
    }
    if (action.name === 'show_windows') {
      setShowMissionControl(true);
      return windows.length > 0 ? `正在显示 ${windows.length} 个窗口。` : '当前没有打开的窗口。';
    }
    if (action.name === 'minimize_active_window') {
      if (!activeWindow) return '当前没有可最小化的窗口。';
      setWindows((current) => current.map((item) => (
        item.id === activeWindow.id ? { ...item, minimized: true } : item
      )));
      return `已最小化“${activeWindow.app.title}”。`;
    }
    if (action.name === 'close_active_window') {
      if (!activeWindow) return '当前没有可关闭的窗口。';
      setWindows((current) => current.filter((item) => item.id !== activeWindow.id));
      return `已关闭“${activeWindow.app.title}”。`;
    }
    setShowSpotlight(false);
    setShowFinder(false);
    setShowMissionControl(false);
    setShowTrash(false);
    setShowSettings(false);
    setShowControlCenter(false);
    setShowWallpaper(false);
    setFolderNavStack([]);
    setActiveMobileApp(null);
    setWindows((current) => current.map((item) => ({ ...item, minimized: true })));
    return '已返回桌面。';
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showSpotlight) {
          setShowSpotlight(false);
          return;
        }
        if (folderNavStack.length > 0) {
          closeFolder();
          return;
        }
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
        setShowFinder(false);
        setShowMissionControl(false);
        setShowTrash(false);
        setActiveMobileApp(null);
      }
      if ((event.metaKey || event.ctrlKey) && event.code === 'Space') {
        event.preventDefault();
        setShowSpotlight((value) => !value);
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'e') {
        event.preventDefault();
        setShowEditModal(true);
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setShowSettings(true);
      }
      if (event.key === 'F3' || ((event.metaKey || event.ctrlKey) && event.key === 'ArrowUp')) {
        event.preventDefault();
        setShowMissionControl((value) => !value);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeWindow, showSpotlight, folderNavStack, closeFolder]);

  return (
    <main className="relative min-h-dvh overflow-hidden bg-zinc-950 text-white">
      <div className="absolute inset-0" style={{ background: wallpaper }} />
      <div className="absolute inset-0 bg-[linear-gradient(125deg,rgba(255,255,255,0.11),transparent_22%,rgba(0,0,0,0.28)_64%,rgba(0,0,0,0.48)),linear-gradient(0deg,rgba(0,0,0,0.26),rgba(255,255,255,0.04))]" />
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/30 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-56 bg-gradient-to-t from-black/45 to-transparent" />

      <section className="relative z-10 min-h-dvh md:hidden">
        <div className="mx-auto flex min-h-dvh w-full items-center justify-center bg-black sm:px-5 sm:py-8">
          <div className="relative h-dvh w-screen overflow-hidden bg-black shadow-phone sm:h-[860px] sm:w-[430px] sm:rounded-[3.2rem] sm:border sm:border-white/10">
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
          activeApp={activeWindow?.app ?? null}
          editing={editMode}
          windows={windows.map((window) => ({ id: window.id, title: window.app.title }))}
          onFinder={() => setShowFinder(true)}
          onSettings={() => setShowSettings(true)}
          onWallpaper={() => setShowWallpaper(true)}
          onEdit={() => {
            if (editMode) {
              setEditMode(false);
              return;
            }
            setShowEditModal(true);
          }}
          onCreateFolder={() => createFolder()}
          onMissionControl={() => setShowMissionControl(true)}
          onSortDesktop={(mode) => {
            sortDesktop(mode);
            setDesktopIconPositions({});
          }}
          onCleanUp={() => setDesktopIconPositions({})}
          onControlCenter={() => setShowControlCenter((value) => !value)}
          onSpotlight={() => setShowSpotlight(true)}
          onMinimizeActive={() => {
            if (activeWindow) {
              setWindows((current) => current.map((item) => (
                item.id === activeWindow.id ? { ...item, minimized: true } : item
              )));
            }
          }}
          onCloseActive={() => {
            if (activeWindow) {
              setWindows((current) => current.filter((item) => item.id !== activeWindow.id));
            }
          }}
          onSelectWindow={(id) => focusWindow(id)}
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
          onContextMenu={(event) => {
            if (event.target !== event.currentTarget) return;
            event.preventDefault();
            setDesktopMenu({ x: event.clientX, y: event.clientY });
          }}
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
            const isFolderItem = isFolder(item);
            const isFolderDropTarget = isFolderItem && folderDropId === item.id;

            return (
              <motion.div
                key={`${pageId}-${item.id}`}
                className={[
                  'absolute cursor-default',
                  isFolderDropTarget ? 'ring-2 ring-sky-200/70 rounded-2xl' : '',
                ].join(' ')}
                data-folder-dropzone={isFolderItem ? item.id : undefined}
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
                  setDockDropActive(editMode && isPointInsideDock(info.point.x, info.point.y));
                  setTrashDropActive(editMode && isPointInsideTrash(info.point.x, info.point.y));
                  setFolderDropId(editMode ? findFolderAtPoint(info.point.x, info.point.y, item.id) : null);
                }}
                onDragEnd={(_, info) => {
                  if (editMode && isPointInsideTrash(info.point.x, info.point.y)) {
                    removeDraggedApps(groupDragIdsRef.current.length > 0 ? groupDragIdsRef.current : [item.id]);
                    setGroupDragOffset({ x: 0, y: 0 });
                    setDockDropActive(false);
                    setTrashDropActive(false);
                    setFolderDropId(null);
                    window.setTimeout(() => {
                      if (suppressOpenRef.current === item.id) suppressOpenRef.current = null;
                      setDraggingIconId((current) => (current === item.id ? null : current));
                    }, 120);
                    return;
                  }

                  if (editMode && isPointInsideDock(info.point.x, info.point.y)) {
                    addDraggedAppsToDock(groupDragIdsRef.current.length > 0 ? groupDragIdsRef.current : [item.id]);
                    setGroupDragOffset({ x: 0, y: 0 });
                    setDockDropActive(false);
                    setTrashDropActive(false);
                    setFolderDropId(null);
                    window.setTimeout(() => {
                      if (suppressOpenRef.current === item.id) suppressOpenRef.current = null;
                      setDraggingIconId((current) => (current === item.id ? null : current));
                    }, 120);
                    return;
                  }

                  const dragIds = groupDragIdsRef.current.length > 0 ? groupDragIdsRef.current : [item.id];
                  if (editMode) {
                    const targetFolderId = findFolderAtPoint(info.point.x, info.point.y, item.id);
                    if (targetFolderId) {
                      // 仅移动不在目标文件夹子孙链上的项，避免循环（store 内还会再校验）
                      const validIds = dragIds.filter((id) => id !== targetFolderId);
                      validIds.forEach((id) => moveItemIntoFolder(id, targetFolderId));
                      setGroupDragOffset({ x: 0, y: 0 });
                      setDockDropActive(false);
                      setTrashDropActive(false);
                      setFolderDropId(null);
                      window.setTimeout(() => {
                        if (suppressOpenRef.current === item.id) suppressOpenRef.current = null;
                        setDraggingIconId((current) => (current === item.id ? null : current));
                      }, 120);
                      return;
                    }
                  }

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
                  setDockDropActive(false);
                  setTrashDropActive(false);
                  setFolderDropId(null);
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

        {desktopMenu ? (
          <MacDesktopMenu
            x={desktopMenu.x}
            y={desktopMenu.y}
            onNewFolder={() => createFolder()}
            onCleanUp={() => setDesktopIconPositions({})}
            onSort={(mode) => {
              sortDesktop(mode);
              setDesktopIconPositions({});
            }}
            onWallpaper={() => setShowWallpaper(true)}
            onSettings={() => setShowSettings(true)}
            onClose={() => setDesktopMenu(null)}
          />
        ) : null}

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
              onDragToTop={() => setShowMissionControl(true)}
            />
          ))}
        </AnimatePresence>

        <MacDock
          apps={dock}
          editing={editMode}
          runningIds={runningIds}
          minimizedIds={minimizedIds}
          dropActive={dockDropActive}
          trashActive={trashDropActive}
          trashCount={trash.length}
          onOpen={openApp}
          onLongPress={(app) => setContextApp({ app })}
          onOpenTrash={() => setShowTrash(true)}
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

      {showFinder ? (
        <MacFinder
          pages={pages}
          dock={dock}
          onClose={() => setShowFinder(false)}
          onOpen={(app) => {
            setShowFinder(false);
            openApp(app);
          }}
        />
      ) : null}

      <AnimatePresence>
        {showMissionControl ? (
          <MacMissionControl
            windows={windows}
            onClose={(id) => setWindows((current) => current.filter((item) => item.id !== id))}
            onCloseAll={() => setWindows([])}
            onCloseMissionControl={() => setShowMissionControl(false)}
            onSelect={(id) => {
              focusWindow(id);
              setShowMissionControl(false);
            }}
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {showTrash ? (
          <MacTrashPanel
            trash={trash}
            onClose={() => setShowTrash(false)}
            onRestore={(itemId) => restoreFromTrash(itemId)}
            onEmpty={() => emptyTrash()}
            onOpen={(app) => openApp(app)}
          />
        ) : null}
      </AnimatePresence>

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
          onRename={() => {
            const target = contextApp.app;
            setContextApp(null);
            if (target.type === 'folder') {
              setFolderNavStack([target.id]);
              setRenameRequestId(target.id);
            }
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
          onCreateFolder={() => {
            createFolder();
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
          configured={isEditKeyConfigured()}
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
          editing={editMode}
          onClose={() => setShowWallpaper(false)}
          onSelect={(value) => {
            setWallpaper(value);
            setShowWallpaper(false);
          }}
        />
      ) : null}

      {openFolder && folderPath.length > 0 ? (
        <Folder
          path={folderPath}
          editing={editMode}
          autoRenameId={renameRequestId}
          onClose={closeFolder}
          onOpen={openApp}
          onOpenFolder={navigateIntoFolder}
          onNavigate={navigateToFolder}
          onRename={(folderId, title) => renameFolder(folderId, title)}
          onRemoveFromFolder={(itemId) => moveItemToPage(itemId, pages[0]?.id ?? 'page-1')}
        />
      ) : null}

      <AnimatePresence>
        {showSpotlight ? (
          <Spotlight
            pages={pages}
            dock={dock}
            initialQuery={spotlightQuery}
            onOpen={openApp}
            onOpenFolder={openFolderById}
            onClose={() => setShowSpotlight(false)}
          />
        ) : null}
      </AnimatePresence>

      <DesktopAgent
        apps={agentApps}
        activeWindowTitle={activeWindow?.app.title}
        onAction={runAgentAction}
      />
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
