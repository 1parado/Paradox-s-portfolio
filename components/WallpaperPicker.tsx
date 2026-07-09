'use client';

import { useEffect, useState, type ChangeEvent } from 'react';
import { defaultWallpaper, wallpaperPresets } from '@/lib/defaultData';
import {
  addWallpaper,
  isGithubUploadEnabled,
  readWallpaperManifest,
  removeWallpaper,
  setSiteWallpaper,
} from '@/lib/githubAssets';
import type { WallpaperEntry } from '@/lib/types';

type Props = {
  current: string;
  editing: boolean;
  onClose: () => void;
  onSelect: (value: string) => void;
};

export function WallpaperPicker({ current, editing, onClose, onSelect }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customs, setCustoms] = useState<WallpaperEntry[]>([]);

  // 进入选择器时拉取已上传壁纸清单（配置了 GitHub 凭据才有）。
  useEffect(() => {
    if (!isGithubUploadEnabled()) return;
    let cancelled = false;
    readWallpaperManifest()
      .then((entries) => {
        if (!cancelled) setCustoms(entries);
      })
      .catch((err) => console.warn('加载壁纸清单失败', err));
    return () => {
      cancelled = true;
    };
  }, []);

  const uploadToLocalDataUrl = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onSelect(`url(${reader.result}) center / cover no-repeat`);
      }
    };
    reader.readAsDataURL(file);
  };

  const onUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = '';
    setError(null);

    if (!editing) {
      setError('请先进入整理模式再上传壁纸。');
      return;
    }

    if (!isGithubUploadEnabled()) {
      // 未配置 GitHub 凭据：回退本地 data URL（仅本机可用，不入仓库，也无法进入清单）
      uploadToLocalDataUrl(file);
      return;
    }

    setBusy(true);
    try {
      const entry = await addWallpaper(file);
      setCustoms((prev) => [entry, ...prev]);
      try {
        await setSiteWallpaper(entry.value);
      } catch (syncError) {
        console.warn('站点壁纸同步失败', syncError);
      }
      onSelect(entry.value);
    } catch (uploadError) {
      setError((uploadError as Error)?.message ?? '上传失败');
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async (entry: WallpaperEntry) => {
    if (!editing) return;
    try {
      await removeWallpaper(entry.id);
      setCustoms((prev) => prev.filter((item) => item.id !== entry.id));
      // 删掉的正是当前壁纸：退回默认壁纸，避免桌面指向已失效的直链。
      if (current === entry.value) {
        onSelect(defaultWallpaper);
      }
    } catch (deleteError) {
      setError((deleteError as Error)?.message ?? '删除失败');
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex items-end bg-black/50 p-4 md:items-center md:justify-center" onClick={onClose}>
      <div className="w-full max-w-lg rounded-[2rem] border border-white/10 bg-slate-950/95 p-5 text-white" onClick={(event) => event.stopPropagation()}>
        <div className="mb-4 text-lg font-semibold">选择壁纸</div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {wallpaperPresets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className={[
                'relative h-28 rounded-2xl border text-left',
                current === preset.value ? 'border-white/60' : 'border-white/10',
              ].join(' ')}
              style={{ background: preset.value }}
              onClick={() => onSelect(preset.value)}
            >
              <span className="m-3 inline-block rounded-full bg-black/30 px-2 py-1 text-xs">{preset.label}</span>
            </button>
          ))}
        </div>

        {customs.length > 0 ? (
          <>
            <div className="mb-2 mt-5 text-sm font-medium text-white/70">我的壁纸</div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {customs.map((entry) => (
                <div
                  key={entry.id}
                  className={[
                    'group relative h-28 overflow-hidden rounded-2xl border',
                    current === entry.value ? 'border-white/60' : 'border-white/10',
                  ].join(' ')}
                >
                  <button
                    type="button"
                    className="h-full w-full text-left"
                    style={{ background: entry.value }}
                    onClick={() => onSelect(entry.value)}
                    aria-label={`使用壁纸 ${entry.name}`}
                  >
                    <span className="m-3 inline-block max-w-[60%] truncate rounded-full bg-black/30 px-2 py-1 text-xs align-middle">
                      {entry.name}
                    </span>
                  </button>
                  {editing ? (
                    <button
                      type="button"
                      className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-xs text-white/90 hover:bg-red-500/80"
                      onClick={() => onDelete(entry)}
                      aria-label="删除壁纸"
                    >
                      ×
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          </>
        ) : null}

        <label className="mt-4 block rounded-2xl border border-dashed border-white/20 px-4 py-6 text-center text-sm text-white/75">
          {editing ? (busy ? '上传中…' : '上传本地图片（写入 GitHub）') : '进入整理模式后可上传自定义壁纸'}
          <input type="file" accept="image/*" className="hidden" disabled={busy} onChange={onUpload} />
        </label>
        {error ? <div className="mt-2 text-center text-xs text-red-300">{error}</div> : null}
      </div>
    </div>
  );
}
