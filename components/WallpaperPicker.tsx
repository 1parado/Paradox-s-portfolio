'use client';

import { useState, type ChangeEvent } from 'react';
import { wallpaperPresets } from '@/lib/defaultData';
import { isGithubUploadEnabled, setSiteWallpaper, uploadWallpaper } from '@/lib/githubAssets';

type Props = {
  current: string;
  editing: boolean;
  onClose: () => void;
  onSelect: (value: string) => void;
};

export function WallpaperPicker({ current, editing, onClose, onSelect }: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      // 未配置 GitHub 凭据：回退本地 data URL（仅本机可用，不入仓库）
      uploadToLocalDataUrl(file);
      return;
    }

    setBusy(true);
    try {
      const { value } = await uploadWallpaper(file);
      try {
        await setSiteWallpaper(value);
      } catch (syncError) {
        console.warn('站点壁纸同步失败', syncError);
      }
      onSelect(value);
    } catch (uploadError) {
      setError((uploadError as Error)?.message ?? '上传失败');
    } finally {
      setBusy(false);
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
                'h-28 rounded-2xl border text-left',
                current === preset.value ? 'border-white/60' : 'border-white/10',
              ].join(' ')}
              style={{ background: preset.value }}
              onClick={() => onSelect(preset.value)}
            >
              <span className="m-3 inline-block rounded-full bg-black/30 px-2 py-1 text-xs">{preset.label}</span>
            </button>
          ))}
        </div>
        <label className="mt-4 block rounded-2xl border border-dashed border-white/20 px-4 py-6 text-center text-sm text-white/75">
          {editing ? (busy ? '上传中…' : '上传本地图片（写入 GitHub）') : '进入整理模式后可上传自定义壁纸'}
          <input type="file" accept="image/*" className="hidden" disabled={busy} onChange={onUpload} />
        </label>
        {error ? <div className="mt-2 text-center text-xs text-red-300">{error}</div> : null}
      </div>
    </div>
  );
}
