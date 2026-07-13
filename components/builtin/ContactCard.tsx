'use client';

export function ContactCard() {
  return (
    <div className="flex h-full flex-col justify-between rounded-[1.5rem] border border-white/10 bg-[radial-gradient(circle_at_15%_10%,rgba(251,191,36,0.20),transparent_34%),linear-gradient(145deg,rgba(15,23,42,0.96),rgba(3,7,18,0.92))] p-6 text-white shadow-inner">
      <div>
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-400 text-2xl text-zinc-950 shadow-lg shadow-amber-500/20">
          @
        </div>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.22em] text-amber-200/70">Contact</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight">Paradox 联系邮箱</h2>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
        <p className="mt-2 break-all text-xl font-semibold text-white">联系邮箱:2825171479@qq.com</p>
      </div>
    </div>
  );
}
