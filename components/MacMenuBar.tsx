'use client';

import { useEffect, useRef, useState } from 'react';
import type { AppItem } from '@/lib/types';

type MenuAction = () => void;

type MenuItem = {
  label?: string;
  shortcut?: string;
  onClick?: MenuAction;
  disabled?: boolean;
  checked?: boolean;
  separator?: boolean;
};

type MenuGroup = {
  id: string;
  label: string;
  bold?: boolean;
  items: MenuItem[];
};

type WindowRef = { id: string; title: string };

type Props = {
  activeTitle?: string;
  activeApp?: AppItem | null;
  editing: boolean;
  windows: WindowRef[];
  onFinder: () => void;
  onSettings: () => void;
  onWallpaper: () => void;
  onEdit: () => void;
  onCreateFolder: () => void;
  onMissionControl: () => void;
  onSortDesktop: (mode: 'name' | 'kind' | 'date') => void;
  onCleanUp: () => void;
  onControlCenter: () => void;
  onSpotlight: () => void;
  onMinimizeActive: () => void;
  onCloseActive: () => void;
  onSelectWindow: (id: string) => void;
};

export function MacMenuBar({
  activeTitle,
  activeApp,
  editing,
  windows,
  onFinder,
  onSettings,
  onWallpaper,
  onEdit,
  onCreateFolder,
  onMissionControl,
  onSortDesktop,
  onCleanUp,
  onControlCenter,
  onSpotlight,
  onMinimizeActive,
  onCloseActive,
  onSelectWindow,
}: Props) {
  const [time, setTime] = useState('');
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const containerRef = useRef<HTMLElement | null>(null);

  const appName = activeTitle || 'Finder';
  const hasActive = Boolean(activeTitle);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(new Intl.DateTimeFormat('zh-CN', {
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(now));
    };
    update();
    const timer = window.setInterval(update, 10_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!openMenu) return;
    const onDown = (event: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenMenu(null);
    };
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [openMenu]);

  const run = (fn?: MenuAction) => {
    setOpenMenu(null);
    if (fn) fn();
  };

  const menus: MenuGroup[] = [
    {
      id: 'app',
      label: appName,
      bold: true,
      items: [
        { label: `关于 ${appName}`, onClick: () => run(onFinder) },
        { separator: true },
        { label: '设置…', shortcut: '⌘K', onClick: () => run(onSettings) },
        { separator: true },
        { label: editing ? '退出编辑模式' : '进入编辑模式', shortcut: '⌘E', onClick: () => run(onEdit) },
        ...(hasActive
          ? [
              { label: `隐藏 ${appName}`, shortcut: '⌘M', onClick: () => run(onMinimizeActive) } as MenuItem,
              { label: `退出 ${appName}`, shortcut: '⌘W', onClick: () => run(onCloseActive) } as MenuItem,
            ]
          : []),
      ],
    },
    {
      id: 'file',
      label: '文件',
      items: [
        { label: '新建文件夹', shortcut: '⇧⌘N', onClick: () => run(onCreateFolder) },
        { separator: true },
        { label: '关闭窗口', shortcut: '⌘W', disabled: !hasActive, onClick: () => run(onCloseActive) },
      ],
    },
    {
      id: 'edit',
      label: '编辑',
      items: [
        { label: '撤销', shortcut: '⌘Z', disabled: true },
        { label: '重做', shortcut: '⇧⌘Z', disabled: true },
        { separator: true },
        { label: '剪切', shortcut: '⌘X', disabled: true },
        { label: '拷贝', shortcut: '⌘C', disabled: true },
        { label: '粘贴', shortcut: '⌘V', disabled: true },
        { separator: true },
        { label: editing ? '完成整理' : '整理桌面', onClick: () => run(onEdit) },
      ],
    },
    {
      id: 'view',
      label: '显示',
      items: [
        { label: '按名称排序', onClick: () => run(() => onSortDesktop('name')) },
        { label: '按种类排序', onClick: () => run(() => onSortDesktop('kind')) },
        { label: '按日期排序', onClick: () => run(() => onSortDesktop('date')) },
        { separator: true },
        { label: '整理桌面（对齐网格）', onClick: () => run(onCleanUp) },
        { label: '更改壁纸…', onClick: () => run(onWallpaper) },
      ],
    },
    {
      id: 'go',
      label: '前往',
      items: [
        { label: 'Spotlight 搜索', shortcut: '⌘Space', onClick: () => run(onSpotlight) },
        { label: 'Finder', shortcut: '⌘⇧F', onClick: () => run(onFinder) },
        { label: '应用程序', onClick: () => run(onFinder) },
        { separator: true },
        { label: '实用工具', onClick: () => run(onSettings) },
      ],
    },
    {
      id: 'window',
      label: '窗口',
      items: [
        { label: 'Mission Control', shortcut: 'F3', onClick: () => run(onMissionControl) },
        { label: hasActive ? '最小化' : '最小化', shortcut: '⌘M', disabled: !hasActive, onClick: () => run(onMinimizeActive) },
        { separator: true },
        ...(windows.length > 0
          ? windows.map((w) => ({ label: w.title, checked: w.title === activeTitle, onClick: () => run(() => onSelectWindow(w.id)) }))
          : [{ label: '无打开的窗口', disabled: true } as MenuItem]),
      ],
    },
    {
      id: 'help',
      label: '帮助',
      items: [
        { label: 'Spotlight 搜索', shortcut: '⌘Space', onClick: () => run(onSpotlight) },
        { separator: true },
        { label: '关于 Paradox 桌面', onClick: () => run(onSettings) },
      ],
    },
  ];

  return (
    <header
      ref={containerRef}
      className="absolute inset-x-0 top-0 z-50 flex h-9 items-center justify-between border-b border-white/10 bg-zinc-950/28 px-3 text-[13px] text-white shadow-[0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-3xl"
    >
      <nav className="flex min-w-0 items-center">
        <button type="button" className="mr-1 text-[17px] font-semibold leading-none text-white" aria-label="Paradox menu" onClick={() => run(onSettings)}>
          ◐
        </button>
        {menus.map((menu) => (
          <div key={menu.id} className="relative">
            <button
              type="button"
              className={[
                'rounded-md px-2 py-0.5 transition hover:bg-white/10',
                menu.bold ? 'font-semibold' : 'text-white/85',
                openMenu === menu.id ? 'bg-white/15' : '',
              ].join(' ')}
              onClick={() => setOpenMenu((current) => (current === menu.id ? null : menu.id))}
              onPointerEnter={() => {
                if (openMenu && openMenu !== menu.id) setOpenMenu(menu.id);
              }}
            >
              {menu.label}
            </button>
            {openMenu === menu.id ? (
              <div
                className="absolute left-0 top-8 z-50 min-w-[15rem] rounded-xl border border-white/15 bg-zinc-900/92 p-1 text-[13px] text-white shadow-[0_22px_70px_rgba(0,0,0,0.5)] backdrop-blur-2xl"
                onClick={(event) => event.stopPropagation()}
              >
                {menu.items.map((item, index) => {
                  if (item.separator) {
                    return <div key={`sep-${index}`} className="my-1 h-px bg-white/12" />;
                  }
                  return (
                    <button
                      key={index}
                      type="button"
                      disabled={item.disabled}
                      className={[
                        'flex w-full items-center gap-3 rounded-md px-2 py-1 text-left transition',
                        item.disabled ? 'cursor-default text-white/35' : 'text-white/90 hover:bg-sky-500/80 hover:text-white',
                      ].join(' ')}
                      onClick={() => {
                        if (item.disabled) return;
                        run(item.onClick);
                      }}
                    >
                      <span className="w-4 text-center text-[11px] text-white/55">{item.checked ? '✓' : ''}</span>
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.shortcut ? <span className="ml-auto text-[11px] text-white/45">{item.shortcut}</span> : null}
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
        ))}
      </nav>

      <div className="flex items-center gap-1 text-white/82">
        <button type="button" className="rounded-md px-2 py-0.5 transition hover:bg-white/10" onClick={onSpotlight} aria-label="Spotlight 搜索" title="Spotlight 搜索 ⌘Space">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
        </button>
        <button type="button" className="hidden rounded-md px-2 py-0.5 transition hover:bg-white/10 md:inline" onClick={onMissionControl} aria-label="Mission Control">
          ⌘⇳
        </button>
        <button type="button" className="rounded-md px-2 py-0.5 transition hover:bg-white/10" onClick={onControlCenter} aria-label="Control Center">
          ◫
        </button>
        <span className="tabular-nums">{time || '--:--'}</span>
      </div>
    </header>
  );
}
