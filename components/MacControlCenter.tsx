'use client';

type Props = {
  editing: boolean;
  onEdit: () => void;
  onWallpaper: () => void;
  onSettings: () => void;
};

export function MacControlCenter({ editing, onEdit, onWallpaper, onSettings }: Props) {
  return (
    <div className="absolute right-4 top-12 z-[70] w-[22rem] rounded-[1.55rem] border border-white/20 bg-zinc-950/50 p-3 text-white shadow-[0_24px_80px_rgba(0,0,0,0.42)] backdrop-blur-3xl">
      <div className="grid grid-cols-[1.1fr_0.9fr] gap-3">
        <div className="rounded-[1.15rem] bg-white/10 p-3 shadow-inner shadow-white/5">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500 text-sm font-semibold">Wi</span>
            <div>
              <div className="text-sm font-semibold">Portfolio</div>
              <div className="text-xs text-white/55">Online</div>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/85 text-sm font-semibold">Bt</span>
            <div>
              <div className="text-sm font-semibold">Links</div>
              <div className="text-xs text-white/55">Ready</div>
            </div>
          </div>
        </div>

        <div className="grid gap-3">
          <button type="button" className="rounded-[1.15rem] bg-white/10 p-3 text-left transition hover:bg-white/20" onClick={onEdit}>
            <div className="text-sm font-semibold">{editing ? '整理中' : '整理桌面'}</div>
            <div className="text-xs text-white/55">{editing ? 'On' : 'Off'}</div>
          </button>
          <button type="button" className="rounded-[1.15rem] bg-white/10 p-3 text-left transition hover:bg-white/20" onClick={onWallpaper}>
            <div className="text-sm font-semibold">Wallpaper</div>
            <div className="text-xs text-white/55">Change</div>
          </button>
        </div>
      </div>

      <div className="mt-3 grid gap-3">
        <div className="rounded-[1.15rem] bg-white/10 p-3">
          <div className="mb-2 flex items-center justify-between text-xs text-white/60">
            <span>Display</span>
            <span>78%</span>
          </div>
          <div className="h-2 rounded-full bg-white/15">
            <div className="h-full w-[78%] rounded-full bg-white/90" />
          </div>
        </div>

        <div className="rounded-[1.15rem] bg-white/10 p-3">
          <div className="mb-2 flex items-center justify-between text-xs text-white/60">
            <span>Sound</span>
            <span>42%</span>
          </div>
          <div className="h-2 rounded-full bg-white/15">
            <div className="h-full w-[42%] rounded-full bg-white/90" />
          </div>
        </div>
      </div>

      <button type="button" className="mt-3 w-full rounded-[1.15rem] bg-white/10 px-4 py-3 text-left text-sm font-semibold transition hover:bg-white/20" onClick={onSettings}>
        System Settings
      </button>
    </div>
  );
}
