'use client';

import type { ReactNode } from 'react';
import { UserRound } from 'lucide-react';

type Field = {
  label: string;
  value: string;
  href?: string;
};

const fields: Field[] = [
  { label: '姓名', value: '李家乐' },
  { label: '昵称', value: 'Paradox' },
  { label: '邮箱', value: '2825171479@qq.com', href: 'mailto:2825171479@qq.com' },
  { label: '爱好', value: '编程、开源、王者荣耀' },
];

function Row({ field }: { field: Field }) {
  return (
    <div className="flex items-baseline gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <span className="w-14 shrink-0 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-300/70">{field.label}</span>
      {field.href ? (
        <a
          href={field.href}
          className="break-all text-base font-medium text-white transition hover:text-sky-200 hover:underline"
        >
          {field.value}
        </a>
      ) : (
        <span className="break-all text-base font-medium text-white">{field.value}</span>
      )}
    </div>
  );
}

export function AboutCard({ children }: { children?: ReactNode }) {
  return (
    <div className="flex h-full flex-col rounded-[1.5rem] border border-white/10 bg-[radial-gradient(circle_at_15%_10%,rgba(56,189,248,0.20),transparent_34%),linear-gradient(145deg,rgba(15,23,42,0.96),rgba(3,7,18,0.92))] p-6 text-white shadow-inner">
      <div>
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-600 text-white shadow-lg shadow-sky-500/20">
          <UserRound className="h-7 w-7" strokeWidth={1.75} />
        </div>
        <p className="mt-6 font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-200/70">About</p>
        <h2 className="mt-2 font-display text-3xl tracking-tight">关于我</h2>
      </div>

      <div className="mt-6 grid gap-2">
        {fields.map((field) => (
          <Row key={field.label} field={field} />
        ))}
      </div>

      {children ? <div className="mt-auto pt-6 text-sm text-white/45">{children}</div> : null}
    </div>
  );
}
