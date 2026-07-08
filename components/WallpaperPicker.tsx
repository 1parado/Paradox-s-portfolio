'use client';

import type { ChangeEvent } from 'react';
import { wallpaperPresets } from '@/lib/defaultData';

type Props = {
  current: string;
  onClose: () => void;
  onSelect: (value: string) => void;
};

export function WallpaperPicker({ current, onClose, onSelect }: Props) {
  const onUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onSelect(`url(${reader.result}) center / cover no-repeat`);
      }
    };
    reader.readAsDataURL(file);
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
          上传本地图片
          <input type="file" accept="image/*" className="hidden" onChange={onUpload} />
        </label>
      </div>
    </div>
  );
}
