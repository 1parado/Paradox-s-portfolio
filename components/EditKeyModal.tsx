'use client';

import { useState } from 'react';

type Props = {
  onClose: () => void;
  onSubmit: (value: string) => boolean;
  configured?: boolean;
};

export function EditKeyModal({ onClose, onSubmit, configured = true }: Props) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/55 p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-[2rem] border border-white/10 bg-slate-950/95 p-5 text-white" onClick={(event) => event.stopPropagation()}>
        <div className="mb-3 text-lg font-semibold">输入编辑密钥</div>
        <div className="mb-4 text-sm text-white/65">通过后可拖拽排序、删除和移动 App。</div>
        {!configured ? (
          <div className="mb-3 rounded-xl bg-amber-500/15 px-3 py-2 text-xs text-amber-200">
            当前部署未配置编辑密钥（NEXT_PUBLIC_EDIT_KEY），编辑模式不可用。
          </div>
        ) : null}
        <input
          autoFocus
          type="password"
          value={value}
          disabled={!configured}
          onChange={(event) => {
            setValue(event.target.value);
            setError('');
          }}
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none disabled:opacity-50"
          placeholder="输入编辑密钥"
        />
        {error ? <div className="mt-2 text-sm text-rose-300">{error}</div> : null}
        <div className="mt-4 flex gap-3">
          <button type="button" className="flex-1 rounded-2xl bg-white/10 px-4 py-3" onClick={onClose}>取消</button>
          <button
            type="button"
            disabled={!configured}
            className="flex-1 rounded-2xl bg-blue-500 px-4 py-3 disabled:opacity-50"
            onClick={() => {
              if (onSubmit(value)) return;
              setError('编辑密钥错误。');
            }}
          >
            进入编辑态
          </button>
        </div>
      </div>
    </div>
  );
}
