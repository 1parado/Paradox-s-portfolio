export type AppKind = 'external' | 'builtin' | 'folder';
export type AppIconKey =
  | 'about'
  | 'agent'
  | 'archive'
  | 'automation'
  | 'blog'
  | 'bookmark'
  | 'calculator'
  | 'calendar'
  | 'chart'
  | 'design'
  | 'folder'
  | 'github'
  | 'lab'
  | 'mail'
  | 'mentor'
  | 'motion'
  | 'note'
  | 'photo'
  | 'portfolio'
  | 'prompt'
  | 'reading'
  | 'resume'
  | 'settings'
  | 'skills'
  | 'target'
  | 'writing';

export type AppItem = {
  id: string;
  title: string;
  icon: string;
  iconKey?: AppIconKey;
  color: string;
  description: string;
  url?: string;
  preview?: string;
  type: AppKind;
  builtinKey?: string;
  password?: string;
  passwordHint?: string;
  techStack?: string[];
  badge?: string;
  externalOnly?: boolean;
};

export type FolderItem = AppItem & {
  type: 'folder';
  children: AppItem[];
};

export type HomeItem = AppItem | FolderItem;

export type HomePage = {
  id: string;
  title: string;
  items: HomeItem[];
};

export type DesktopIconPosition = {
  x: number;
  y: number;
};

export type WallpaperPreset = {
  id: string;
  label: string;
  value: string;
};

export type PhotoEntry = {
  id: string;
  url: string;
  path: string;
  name: string;
  createdAt: number;
  width?: number;
  height?: number;
};

export type WallpaperEntry = {
  id: string;
  /** 可直接用于 CSS background 的值，如 `url(...) center / cover no-repeat`。 */
  value: string;
  /** raw 直链，用于预览缩略图。 */
  url: string;
  /** 仓库内路径，删除时定位文件。 */
  path: string;
  name: string;
  createdAt: number;
};
