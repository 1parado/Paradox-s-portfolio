'use client';

import type { PhotoEntry, WallpaperEntry } from '@/lib/types';

type GitHubConfig = {
  owner: string;
  repo: string;
  branch: string;
  token: string;
};

const PHOTOS_DIR = 'uploads/photos';
const PHOTOS_MANIFEST_PATH = 'uploads/photos.json';
const WALLPAPERS_DIR = 'uploads/wallpapers';
const WALLPAPER_CONFIG_PATH = 'uploads/wallpaper.json';
const WALLPAPERS_MANIFEST_PATH = 'uploads/wallpapers.json';
const NOTEPAD_PATH = 'uploads/notepad.json';

export type NotepadDoc = {
  content: string;
  updatedAt: number;
};

/**
 * 读取前端注入的 GitHub 配置。任一缺失返回 null，调用方需优雅降级。
 *
 * 安全提示：token 会进入前端 bundle，请使用只对本仓库有 contents:write 权限的
 * 细粒度 PAT，并把编辑密码（NEXT_PUBLIC_EDIT_KEY）改为强密码作为写入门禁。
 */
export function getGitHubConfig(): GitHubConfig | null {
  const owner = process.env.NEXT_PUBLIC_GITHUB_OWNER;
  const repo = process.env.NEXT_PUBLIC_GITHUB_REPO;
  const branch = process.env.NEXT_PUBLIC_GITHUB_BRANCH || 'main';
  const token = process.env.NEXT_PUBLIC_GITHUB_TOKEN;
  if (!owner || !repo || !token) return null;
  return { owner, repo, branch, token };
}

export function isGithubUploadEnabled(): boolean {
  return getGitHubConfig() !== null;
}

/** raw.githubusercontent.com 上某文件的直链（公开仓库带 CORS，可前端 fetch；提交后即时可见）。 */
export function rawUrl(path: string): string {
  const cfg = getGitHubConfig();
  if (!cfg) return '';
  return `https://raw.githubusercontent.com/${cfg.owner}/${cfg.repo}/${cfg.branch}/${path}`;
}

function apiBase(): string {
  const cfg = getGitHubConfig()!;
  return `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents`;
}

function authHeaders(): HeadersInit {
  const cfg = getGitHubConfig()!;
  return {
    Authorization: `Bearer ${cfg.token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

function encodeBase64(text: string): string {
  // UTF-8 安全的 base64 编码（中文文件名/JSON 也能正确写入）
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function decodeBase64(b64: string): string {
  const cleaned = b64.replace(/\n/g, '');
  const binary = atob(cleaned);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

type ContentsResult = { sha: string; contentText: string | null; exists: boolean };

async function apiGetContents(path: string): Promise<ContentsResult> {
  const cfg = getGitHubConfig()!;
  const res = await fetch(`${apiBase()}/${encodeURIComponent(path).replace(/%2F/g, '/')}?ref=${encodeURIComponent(cfg.branch)}`, {
    headers: authHeaders(),
  });
  if (res.status === 404) return { sha: '', contentText: null, exists: false };
  if (!res.ok) throw new Error(`GitHub GET ${path} 失败：${res.status}`);
  const data = await res.json();
  if (data.type === 'file' && typeof data.content === 'string') {
    return { sha: data.sha, contentText: decodeBase64(data.content), exists: true };
  }
  return { sha: data.sha ?? '', contentText: null, exists: true };
}

async function apiPutContents(path: string, contentBase64: string, message: string, sha?: string): Promise<string> {
  const cfg = getGitHubConfig()!;
  const body: Record<string, unknown> = {
    message,
    content: contentBase64,
    branch: cfg.branch,
  };
  if (sha) body.sha = sha;
  const res = await fetch(`${apiBase()}/${encodeURIComponent(path).replace(/%2F/g, '/')}`, {
    method: 'PUT',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`GitHub PUT ${path} 失败：${res.status} ${detail.slice(0, 200)}`);
  }
  const data = await res.json();
  return data.content?.sha ?? '';
}

async function apiDeleteContents(path: string, sha: string, message: string): Promise<void> {
  const cfg = getGitHubConfig()!;
  const res = await fetch(`${apiBase()}/${encodeURIComponent(path).replace(/%2F/g, '/')}`, {
    method: 'DELETE',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, sha, branch: cfg.branch }),
  });
  if (!res.ok && res.status !== 404) {
    const detail = await res.text();
    throw new Error(`GitHub DELETE ${path} 失败：${res.status} ${detail.slice(0, 200)}`);
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        reject(new Error('读取文件失败'));
        return;
      }
      const dataUrl = reader.result as string;
      const comma = dataUrl.indexOf(',');
      resolve(comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl);
    };
    reader.onerror = () => reject(reader.error ?? new Error('读取文件失败'));
    reader.readAsDataURL(file);
  });
}

function extFromType(type: string, name: string): string {
  const fromType = type.split('/')[1];
  if (fromType && /^[a-z0-9]+$/i.test(fromType)) return fromType;
  const match = name.match(/\.([a-z0-9]+)$/i);
  return match ? match[1].toLowerCase() : 'bin';
}

function randomId(): string {
  return Math.random().toString(36).slice(2, 8);
}

/** 测量图片宽高，失败返回 undefined。 */
function measureImage(url: string): Promise<{ width: number; height: number } | undefined> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve(undefined);
    img.src = url;
  });
}

/** 上传单个图片文件到指定目录，返回 raw 直链与仓库内路径。 */
async function uploadImageFile(file: File, dir: string, prefix: string): Promise<{ url: string; path: string }> {
  const base64 = await fileToBase64(file);
  const ext = extFromType(file.type, file.name);
  const stamp = Date.now().toString(36);
  const path = `${dir}/${prefix}-${stamp}-${randomId()}.${ext}`;
  await apiPutContents(path, base64, `upload: ${file.name}`);
  return { url: rawUrl(path), path };
}

/** 读取相册清单；不存在返回空数组。 */
export async function readPhotoManifest(): Promise<PhotoEntry[]> {
  if (!isGithubUploadEnabled()) return [];
  try {
    const result = await apiGetContents(PHOTOS_MANIFEST_PATH);
    if (!result.exists || !result.contentText) return [];
    const parsed = JSON.parse(result.contentText);
    if (!Array.isArray(parsed)) return [];
    return parsed as PhotoEntry[];
  } catch (error) {
    console.warn('读取相册清单失败', error);
    return [];
  }
}

async function writePhotoManifest(entries: PhotoEntry[]): Promise<void> {
  const result = await apiGetContents(PHOTOS_MANIFEST_PATH);
  const content = encodeBase64(JSON.stringify(entries, null, 2));
  await apiPutContents(
    PHOTOS_MANIFEST_PATH,
    content,
    `chore: update photo manifest (${entries.length})`,
    result.exists ? result.sha : undefined,
  );
}

/** 上传一张图片并写入清单，返回新条目。 */
export async function addPhoto(file: File): Promise<PhotoEntry> {
  const { url, path } = await uploadImageFile(file, PHOTOS_DIR, 'photo');
  const entries = await readPhotoManifest();
  const dimensions = await measureImage(url);
  const entry: PhotoEntry = {
    id: randomId() + Date.now().toString(36),
    url,
    path,
    name: file.name,
    createdAt: Date.now(),
    width: dimensions?.width,
    height: dimensions?.height,
  };
  const next = [entry, ...entries];
  await writePhotoManifest(next);
  return entry;
}

/** 删除一张图片：删图文件 + 从清单移除。 */
export async function removePhoto(id: string): Promise<void> {
  const entries = await readPhotoManifest();
  const target = entries.find((entry) => entry.id === id);
  if (!target) return;
  if (target.path) {
    try {
      const info = await apiGetContents(target.path);
      if (info.exists && info.sha) {
        await apiDeleteContents(target.path, info.sha, `delete: ${target.name}`);
      }
    } catch (error) {
      console.warn('删除图片文件失败', error);
    }
  }
  const next = entries.filter((entry) => entry.id !== id);
  await writePhotoManifest(next);
}

/** 上传壁纸图片，返回可直接用于 CSS background 的 url(...) 字符串、raw 直链与仓库内路径。 */
export async function uploadWallpaper(file: File): Promise<{ value: string; url: string; path: string }> {
  const { url, path } = await uploadImageFile(file, WALLPAPERS_DIR, 'wallpaper');
  return { value: `url(${url}) center / cover no-repeat`, url, path };
}

/** 读取自定义壁纸清单；不存在返回空数组。 */
export async function readWallpaperManifest(): Promise<WallpaperEntry[]> {
  if (!isGithubUploadEnabled()) return [];
  try {
    const result = await apiGetContents(WALLPAPERS_MANIFEST_PATH);
    if (!result.exists || !result.contentText) return [];
    const parsed = JSON.parse(result.contentText);
    if (!Array.isArray(parsed)) return [];
    return parsed as WallpaperEntry[];
  } catch (error) {
    console.warn('读取壁纸清单失败', error);
    return [];
  }
}

async function writeWallpaperManifest(entries: WallpaperEntry[]): Promise<void> {
  const result = await apiGetContents(WALLPAPERS_MANIFEST_PATH);
  const content = encodeBase64(JSON.stringify(entries, null, 2));
  await apiPutContents(
    WALLPAPERS_MANIFEST_PATH,
    content,
    `chore: update wallpaper manifest (${entries.length})`,
    result.exists ? result.sha : undefined,
  );
}

/** 上传一张壁纸并写入清单，返回新条目。 */
export async function addWallpaper(file: File): Promise<WallpaperEntry> {
  const { value, url, path } = await uploadWallpaper(file);
  const entries = await readWallpaperManifest();
  const entry: WallpaperEntry = {
    id: randomId() + Date.now().toString(36),
    value,
    url,
    path,
    name: file.name,
    createdAt: Date.now(),
  };
  const next = [entry, ...entries];
  await writeWallpaperManifest(next);
  return entry;
}

/** 删除一张壁纸：删图文件 + 从清单移除。 */
export async function removeWallpaper(id: string): Promise<void> {
  const entries = await readWallpaperManifest();
  const target = entries.find((entry) => entry.id === id);
  if (!target) return;
  if (target.path) {
    try {
      const info = await apiGetContents(target.path);
      if (info.exists && info.sha) {
        await apiDeleteContents(target.path, info.sha, `delete: ${target.name}`);
      }
    } catch (error) {
      console.warn('删除壁纸文件失败', error);
    }
  }
  const next = entries.filter((entry) => entry.id !== id);
  await writeWallpaperManifest(next);
}

/** 把站点级壁纸写入 uploads/wallpaper.json，供首次访客拉取。 */
export async function setSiteWallpaper(value: string): Promise<void> {
  const result = await apiGetContents(WALLPAPER_CONFIG_PATH);
  const content = encodeBase64(JSON.stringify({ value }));
  await apiPutContents(
    WALLPAPER_CONFIG_PATH,
    content,
    'chore: update site wallpaper',
    result.exists ? result.sha : undefined,
  );
}

/** 读取站点级壁纸配置（供 store 在无 localStorage 时拉取）。 */
export async function readSiteWallpaper(): Promise<string | null> {
  if (!isGithubUploadEnabled()) return null;
  try {
    const result = await apiGetContents(WALLPAPER_CONFIG_PATH);
    if (!result.exists || !result.contentText) return null;
    const parsed = JSON.parse(result.contentText);
    return typeof parsed.value === 'string' ? parsed.value : null;
  } catch (error) {
    console.warn('读取站点壁纸失败', error);
    return null;
  }
}

/** 读取记事本内容；未配置或不存在返回 null。 */
export async function readNotepad(): Promise<NotepadDoc | null> {
  if (!isGithubUploadEnabled()) return null;
  try {
    const result = await apiGetContents(NOTEPAD_PATH);
    if (!result.exists || !result.contentText) return null;
    const parsed = JSON.parse(result.contentText);
    if (typeof parsed === 'string') {
      return { content: parsed, updatedAt: 0 };
    }
    if (parsed && typeof parsed.content === 'string') {
      return { content: parsed.content, updatedAt: typeof parsed.updatedAt === 'number' ? parsed.updatedAt : 0 };
    }
    return null;
  } catch (error) {
    console.warn('读取记事本失败', error);
    return null;
  }
}

/** 把记事本内容写入 GitHub，返回写入时间戳。 */
export async function saveNotepad(content: string): Promise<number> {
  const result = await apiGetContents(NOTEPAD_PATH);
  const updatedAt = Date.now();
  const doc: NotepadDoc = { content, updatedAt };
  const body = encodeBase64(JSON.stringify(doc, null, 2));
  await apiPutContents(
    NOTEPAD_PATH,
    body,
    `chore: update notepad (${content.length} chars)`,
    result.exists ? result.sha : undefined,
  );
  return updatedAt;
}
