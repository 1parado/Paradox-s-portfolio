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
      <div className="w-full max-w-sm rounded-[2rem] border border-white/10 bg-slate-950/95 p-5 text-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="mb-3 text-lg font-semibold">输入 {app.title} 密码</div>
        <div className="mb-4 text-sm text-white/65">该 App 受保护。先确认项目技术栈，再输入独立密码打开。</div>
        {app.techStack?.length ? (
          <div className="mb-4 rounded-2xl border border-white/10 bg-white/[0.06] p-3">
            <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/45">Tech Stack</div>
            <div className="flex flex-wrap gap-2">
              {app.techStack.map((item) => (
                <span key={item} className="rounded-full bg-white/10 px-2.5 py-1 text-xs text-white/78">
                  {item}
                </span>
              ))}
            </div>
          </div>
        ) : null}
        {app.passwordHint ? (
          <div className="mb-4 rounded-2xl border border-blue-200/20 bg-blue-500/10 px-3 py-2 text-sm font-medium text-blue-100">
            {app.passwordHint}
          </div>
        ) : null}
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
