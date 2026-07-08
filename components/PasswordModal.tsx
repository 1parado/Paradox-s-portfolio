'use client';

import { useState } from 'react';
import type { AppItem } from '@/lib/types';

type Props = {
  app: AppItem;
  onClose: () => void;
  onSuccess: () => void;
};

export function PasswordModal({ app, onClose, onSuccess }: Props) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/55 p-4" onClick={onClose}>
      <div className="w-full max-w-sm rounded-[2rem] border border-white/10 bg-slate-950/95 p-5 text-white" onClick={(event) => event.stopPropagation()}>
        <div className="mb-3 text-lg font-semibold">输入 {app.title} 密码</div>
        <div className="mb-4 text-sm text-white/65">该 App 受保护，输入独立密码后才可打开。</div>
        <input
          autoFocus
          type="password"
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            setError('');
          }}
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 outline-none ring-0"
          placeholder="输入密码"
        />
        {error ? <div className="mt-2 text-sm text-rose-300">{error}</div> : null}
        <div className="mt-4 flex gap-3">
          <button type="button" className="flex-1 rounded-2xl bg-white/10 px-4 py-3" onClick={onClose}>取消</button>
          <button
            type="button"
            className="flex-1 rounded-2xl bg-blue-500 px-4 py-3"
            onClick={() => {
              if (value === app.password) {
                onSuccess();
                return;
              }
              setError('密码错误，请重试。');
            }}
          >
            解锁
          </button>
        </div>
      </div>
    </div>
  );
}
