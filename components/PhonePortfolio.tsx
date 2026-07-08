'use client';

import { useEffect, useMemo, useState } from 'react';
import { EditKeyModal } from '@/components/EditKeyModal';
import { Folder } from '@/components/Folder';
import { HomeScreen } from '@/components/HomeScreen';
import { IPhoneFrame } from '@/components/IPhoneFrame';
import { InAppBrowser } from '@/components/InAppBrowser';
import { ContextMenu } from '@/components/ContextMenu';
import { PasswordModal } from '@/components/PasswordModal';
import { SettingsPanel } from '@/components/SettingsPanel';
import { WallpaperPicker } from '@/components/WallpaperPicker';
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
    resetToDefault,
    verifyEditKey,
  } = usePortfolioStore();

  const [activeApp, setActiveApp] = useState<AppItem | null>(null);
  const [passwordApp, setPasswordApp] = useState<AppItem | null>(null);
  const [contextApp, setContextApp] = useState<{ app: AppItem; pageId?: string } | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showWallpaper, setShowWallpaper] = useState(false);
  const [openFolder, setOpenFolder] = useState<FolderItem | null>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveApp(null);
        setPasswordApp(null);
        setContextApp(null);
        setShowEditModal(false);
        setShowSettings(false);
        setShowWallpaper(false);
        setOpenFolder(null);
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'e') {
        event.preventDefault();
        setShowEditModal(true);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const pageMap = useMemo(() => new Map(pages.map((page) => [page.id, page])), [pages]);

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
          onClose={() => setShowWallpaper(false)}
          onSelect={(value) => {
            setWallpaper(value);
            setShowWallpaper(false);
          }}
        />
      ) : null}

      {openFolder ? <Folder folder={openFolder} onClose={() => setOpenFolder(null)} onOpen={openApp} /> : null}
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
