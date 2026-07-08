'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { EditKeyModal } from '@/components/EditKeyModal';
import { Folder } from '@/components/Folder';
import { HomeScreen } from '@/components/HomeScreen';
import { IPhoneFrame } from '@/components/IPhoneFrame';
import { InAppBrowser } from '@/components/InAppBrowser';
import { ContextMenu } from '@/components/ContextMenu';
import { PasswordModal } from '@/components/PasswordModal';
import { SettingsPanel } from '@/components/SettingsPanel';
import { WallpaperPicker } from '@/components/WallpaperPicker';
import { findFolderById } from '@/lib/folders';
import { StoreProvider, usePortfolioStore } from '@/lib/store';
import type { AppItem, FolderItem } from '@/lib/types';

function PhonePortfolioInner() {
  const {
    pages,
    dock,
    wallpaper,
    editMode,
    setWallpaper,
    setEditMode,
    reorderPageItems,
    moveItemAcrossPages,
    removeItem,
    createFolder,
    renameFolder,
    moveItemToPage,
    resetToDefault,
    verifyEditKey,
  } = usePortfolioStore();

  const [activeApp, setActiveApp] = useState<AppItem | null>(null);
  const [passwordApp, setPasswordApp] = useState<AppItem | null>(null);
  const [contextApp, setContextApp] = useState<{ app: AppItem; pageId?: string } | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showWallpaper, setShowWallpaper] = useState(false);
  const [folderNavStack, setFolderNavStack] = useState<string[]>([]);
  const [renameRequestId, setRenameRequestId] = useState<string | null>(null);

  const folderPath = useMemo<FolderItem[]>(
    () => folderNavStack
      .map((id) => findFolderById(pages, id))
      .filter((value): value is FolderItem => Boolean(value)),
    [folderNavStack, pages],
  );
  const openFolder = folderPath[folderPath.length - 1] ?? null;

  const closeFolder = useCallback(() => {
    setFolderNavStack([]);
    setRenameRequestId(null);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (folderNavStack.length > 0) {
          closeFolder();
          return;
        }
        setActiveApp(null);
        setPasswordApp(null);
        setContextApp(null);
        setShowEditModal(false);
        setShowSettings(false);
        setShowWallpaper(false);
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'e') {
        event.preventDefault();
        setShowEditModal(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [folderNavStack.length, closeFolder]);

  const pageMap = useMemo(() => new Map(pages.map((page) => [page.id, page])), [pages]);

  const openUnlockedApp = (app: AppItem) => {
    if (app.builtinKey === 'settings') {
      setShowSettings(true);
      return;
    }
    if (app.type === 'folder') {
      setFolderNavStack([app.id]);
      return;
    }
    if (app.externalOnly && app.url) {
      window.open(app.url, app.url.startsWith('mailto:') ? '_self' : '_blank', 'noopener,noreferrer');
      return;
    }
    setActiveApp(app);
  };

  const openApp = (app: AppItem) => {
    if (app.password) {
      setPasswordApp(app);
      return;
    }
    openUnlockedApp(app);
  };

  return (
    <IPhoneFrame>
      <div className="absolute inset-0" style={{ background: wallpaper }} />
      <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]" />

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

      <InAppBrowser app={activeApp} onClose={() => setActiveApp(null)} />

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
              moveItemAcrossPages(contextApp.pageId, targetPageId, contextApp.app.id, pageMap.get(targetPageId)?.items.length ?? 0);
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
          onOpenFolder={(folder) => setFolderNavStack((current) => {
            const existing = current.indexOf(folder.id);
            if (existing >= 0) return current.slice(0, existing + 1);
            return [...current, folder.id];
          })}
          onNavigate={(folder) => {
            if (!folder) {
              closeFolder();
              return;
            }
            setFolderNavStack((current) => {
              const index = current.indexOf(folder.id);
              if (index >= 0) return current.slice(0, index + 1);
              return [folder.id];
            });
          }}
          onRename={(folderId, title) => renameFolder(folderId, title)}
          onRemoveFromFolder={(itemId) => moveItemToPage(itemId, pages[0]?.id ?? 'page-1')}
        />
      ) : null}
    </IPhoneFrame>
  );
}

export function PhonePortfolio() {
  return (
    <StoreProvider>
      <PhonePortfolioInner />
    </StoreProvider>
  );
}
