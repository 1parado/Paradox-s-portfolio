export type AppKind = 'external' | 'builtin' | 'folder';
export type AppIconKey =
  | 'about'
  | 'agent'
  | 'archive'
  | 'automation'
  | 'blog'
  | 'bookmark'
  | 'calculator'
  | 'chart'
  | 'design'
  | 'folder'
  | 'github'
  | 'lab'
  | 'mail'
  | 'mentor'
  | 'motion'
  | 'note'
  | 'portfolio'
  | 'prompt'
  | 'reading'
  | 'resume'
  | 'settings'
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
