import type { AppItem, FolderItem, HomePage, HomeItem } from '@/lib/types';

export function isFolder(item: HomeItem | undefined | null): item is FolderItem {
  return Boolean(item) && (item as AppItem | null)?.type === 'folder';
}

/** 递归遍历 items（含文件夹 children），对每个节点调用 visitor。 */
export function walkItems(items: HomeItem[], visitor: (item: HomeItem, parent?: FolderItem) => void) {
  for (const item of items) {
    visitor(item);
    if (isFolder(item) && item.children.length > 0) {
      walkItems(item.children, (child, _parent) => visitor(child, item));
    }
  }
}

/** 在 pages 中按 id 递归查找文件夹（含嵌套）。 */
export function findFolderById(pages: HomePage[], id: string): FolderItem | null {
  for (const page of pages) {
    const found = findFolderInItems(page.items, id);
    if (found) return found;
  }
  return null;
}

function findFolderInItems(items: HomeItem[], id: string): FolderItem | null {
  for (const item of items) {
    if (item.id === id && isFolder(item)) return item;
    if (isFolder(item)) {
      const nested = findFolderInItems(item.children, id);
      if (nested) return nested;
    }
  }
  return null;
}

export type FlatEntry = {
  item: AppItem;
  pageId?: string;
  pageTitle?: string;
  folderId?: string;
  folderTitle?: string;
};

/** 把 pages（含文件夹 children）与 dock 递归拍平为可搜索条目，按 id 去重。 */
export function flattenAllItems(pages: HomePage[], dock: AppItem[]): FlatEntry[] {
  const seen = new Set<string>();
  const entries: FlatEntry[] = [];

  for (const page of pages) {
    for (const entry of flattenPageItems(page.items, page.id, page.title)) {
      if (seen.has(entry.item.id)) continue;
      seen.add(entry.item.id);
      entries.push(entry);
    }
  }

  for (const item of dock) {
    if (seen.has(item.id)) continue;
    seen.add(item.id);
    entries.push({ item });
  }

  return entries;
}

function flattenPageItems(items: HomeItem[], pageId: string, pageTitle: string, folderId?: string, folderTitle?: string): FlatEntry[] {
  const entries: FlatEntry[] = [];
  for (const item of items) {
    entries.push({ item, pageId, pageTitle, folderId, folderTitle });
    if (isFolder(item) && item.children.length > 0) {
      entries.push(...flattenPageItems(item.children, pageId, pageTitle, item.id, item.title));
    }
  }
  return entries;
}

/** 判断 candidate 是否为 folder 的（直接或间接）子孙文件夹，避免拖入自身造成循环。 */
export function isDescendantFolder(pages: HomePage[], folderId: string, candidateId: string): boolean {
  const folder = findFolderById(pages, folderId);
  if (!folder) return false;
  return Boolean(findFolderInItems(folder.children, candidateId));
}
