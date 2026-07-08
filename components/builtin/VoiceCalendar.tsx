'use client';

const demoUrl = 'https://r2.sparyn.tech/qiniu-challenge-demo.mp4';

export function VoiceCalendar() {
  return (
    <div className="flex h-full flex-col justify-between overflow-hidden rounded-[1.5rem] border border-white/10 bg-[radial-gradient(circle_at_18%_12%,rgba(34,211,238,0.22),transparent_34%),linear-gradient(145deg,rgba(15,23,42,0.96),rgba(3,7,18,0.96))] p-6 text-white">
      <div>
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-300 text-2xl font-semibold text-slate-950 shadow-lg shadow-cyan-500/20">
            7
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100/60">Voice Calendar</p>
            <h2 className="mt-1 text-3xl font-semibold tracking-tight">语音日历</h2>
          </div>
        </div>

        <div className="mt-7 rounded-[1.35rem] border border-white/10 bg-white/[0.07] p-5 shadow-inner">
          <p className="text-sm font-semibold text-cyan-100/75">提示框</p>
          <p className="mt-3 text-2xl font-semibold leading-snug">
            七牛云暑期实训，（拿到Offer，暑期不能离校，遗憾！）
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-3">
        <a
          href={demoUrl}
          target="_blank"
          rel="noreferrer"
          className="rounded-2xl bg-white px-4 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-cyan-100"
        >
          打开演示视频
        </a>
        <p className="break-all text-center text-xs text-white/42">{demoUrl}</p>
      </div>
    </div>
  );
}
