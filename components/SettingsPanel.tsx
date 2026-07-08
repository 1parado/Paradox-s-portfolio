'use client';

type Props = {
  editing: boolean;
  onClose: () => void;
  onRequestEdit: () => void;
  onExitEdit: () => void;
  onCreateFolder: () => void;
  onWallpaper: () => void;
  onReset: () => void;
};

export function SettingsPanel({ editing, onClose, onRequestEdit, onExitEdit, onCreateFolder, onWallpaper, onReset }: Props) {
  return (
    <div className="absolute inset-0 z-50 flex items-end bg-black/50 p-4 md:items-center md:justify-center" onClick={onClose}>
      <div className="w-full max-w-sm rounded-[2rem] border border-white/10 bg-zinc-950/95 p-5 text-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="mb-4">
          <div className="text-lg font-semibold">设置</div>
          <div className="text-sm text-white/60">管理壁纸、整理模式和本地桌面布局。</div>
        </div>

        <div className="grid gap-2">
          <button type="button" className="rounded-2xl bg-white/10 px-4 py-3 text-left" onClick={onWallpaper}>
            更换壁纸
          </button>
          {editing ? (
            <>
              <button type="button" className="rounded-2xl bg-white/10 px-4 py-3 text-left" onClick={onCreateFolder}>
                新建文件夹
              </button>
              <button type="button" className="rounded-2xl bg-white/10 px-4 py-3 text-left" onClick={onExitEdit}>
                退出整理模式
              </button>
            </>
          ) : (
            <button type="button" className="rounded-2xl bg-white/10 px-4 py-3 text-left" onClick={onRequestEdit}>
              进入整理模式
            </button>
          )}
          <button type="button" className="rounded-2xl bg-red-500/20 px-4 py-3 text-left text-red-100" onClick={onReset}>
            重置桌面
          </button>
        </div>
      </div>
    </div>
  );
}
