'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CloudOff, Image as ImageIcon } from 'lucide-react';
import { usePortfolioStore } from '@/lib/store';
import { addPhoto, isGithubUploadEnabled, readPhotoManifest, removePhoto } from '@/lib/githubAssets';
import type { PhotoEntry } from '@/lib/types';

type Status = { kind: 'idle' | 'loading' | 'error'; message?: string };

export function PhotoApp() {
  const { editMode } = usePortfolioStore();
  const [photos, setPhotos] = useState<PhotoEntry[]>([]);
  const [status, setStatus] = useState<Status>({ kind: 'loading' });
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const enabled = isGithubUploadEnabled();

  useEffect(() => {
    let cancelled = false;
    setStatus({ kind: 'loading' });
    readPhotoManifest()
      .then((entries) => {
        if (cancelled) return;
        setPhotos(entries);
        setStatus({ kind: 'idle' });
      })
      .catch((error) => {
        if (cancelled) return;
        setStatus({ kind: 'error', message: error?.message ?? '读取相册失败' });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const sorted = useMemo(() => [...photos].sort((a, b) => b.createdAt - a.createdAt), [photos]);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const entry = await addPhoto(file);
        setPhotos((current) => [entry, ...current]);
      }
    } catch (error) {
      setStatus({ kind: 'error', message: (error as Error)?.message ?? '上传失败' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await removePhoto(id);
      setPhotos((current) => current.filter((entry) => entry.id !== id));
      setActiveIndex((current) => {
        if (current === null) return null;
        const idx = sorted.findIndex((entry) => entry.id === id);
        if (idx === -1 || idx !== current) return current;
        return sorted.length - 1 > idx ? idx : Math.max(0, idx - 1);
      });
    } catch (error) {
      setStatus({ kind: 'error', message: (error as Error)?.message ?? '删除失败' });
    } finally {
      setDeletingId(null);
    }
  };

  const openLightbox = (index: number) => setActiveIndex(index);
  const closeLightbox = () => setActiveIndex(null);
  const stepLightbox = (delta: number) => {
    setActiveIndex((current) => {
      if (current === null) return null;
      const next = current + delta;
      if (next < 0) return sorted.length - 1;
      if (next >= sorted.length) return 0;
      return next;
    });
  };

  const activePhoto = activeIndex === null ? null : sorted[activeIndex] ?? null;

  return (
    <div className="flex h-full flex-col rounded-[2rem] bg-[#0b0b0f] p-4 text-white">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-9 items-center gap-2">
          <span className="text-lg font-semibold">照片</span>
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-white/65">{sorted.length}</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {editMode && enabled ? (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(event) => handleFiles(event.target.files)}
              />
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="rounded-full bg-pink-500/90 px-4 py-1.5 text-sm font-medium transition hover:bg-pink-500 disabled:opacity-60"
              >
                {uploading ? '上传中…' : '上传图片'}
              </button>
            </>
          ) : null}
        </div>
      </div>

      <div className="mb-2 text-xs text-white/55">
        {editMode
          ? enabled
            ? '整理模式：可上传与删除图片，写入 GitHub 仓库。'
            : '整理模式：未配置 GitHub 凭据，无法上传。'
          : '浏览模式：进入整理模式后可上传图片。'}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto rounded-2xl bg-black/20 p-3">
        {status.kind === 'loading' && sorted.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-white/55">加载相册…</div>
        ) : status.kind === 'error' && sorted.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-white/65">
            <CloudOff className="h-8 w-8 text-white/35" strokeWidth={1.5} />
            <span>{status.message ?? '读取相册失败'}</span>
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-white/55">
            <ImageIcon className="h-9 w-9 text-white/35" strokeWidth={1.5} />
            <span>还没有照片{editMode && enabled ? '，点击右上角上传第一张' : ''}。</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {sorted.map((photo, index) => (
              <motion.button
                key={photo.id}
                type="button"
                layoutId={`photo-${photo.id}`}
                onClick={() => openLightbox(index)}
                className="group relative aspect-square overflow-hidden rounded-xl bg-white/5"
                whileTap={{ scale: 0.96 }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt={photo.name}
                  loading="lazy"
                  className="h-full w-full object-cover transition group-hover:scale-105"
                />
                {editMode ? (
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(event) => {
                      event.stopPropagation();
                      handleDelete(photo.id);
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        event.stopPropagation();
                        handleDelete(photo.id);
                      }
                    }}
                    className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/55 text-xs text-white backdrop-blur transition hover:bg-red-500"
                    aria-label="删除照片"
                  >
                    {deletingId === photo.id ? '⋯' : '×'}
                  </span>
                ) : null}
              </motion.button>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {activePhoto ? (
          <motion.div
            className="absolute inset-0 z-30 flex items-center justify-center bg-black/85 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLightbox}
          >
            <button
              type="button"
              className="absolute left-3 top-3 rounded-full bg-white/10 px-3 py-1 text-sm"
              onClick={closeLightbox}
            >
              关闭
            </button>
            {sorted.length > 1 ? (
              <>
                <button
                  type="button"
                  className="absolute left-3 rounded-full bg-white/10 px-3 py-2 text-sm"
                  onClick={(event) => {
                    event.stopPropagation();
                    stepLightbox(-1);
                  }}
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="absolute right-3 rounded-full bg-white/10 px-3 py-2 text-sm"
                  onClick={(event) => {
                    event.stopPropagation();
                    stepLightbox(1);
                  }}
                >
                  ›
                </button>
              </>
            ) : null}
            <motion.div
              key={activePhoto.id}
              layoutId={`photo-${activePhoto.id}`}
              className="relative max-h-full max-w-full"
              onClick={(event) => event.stopPropagation()}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activePhoto.url}
                alt={activePhoto.name}
                className="max-h-[80vh] max-w-full rounded-xl object-contain"
              />
              <div className="mt-2 text-center text-xs text-white/70">{activePhoto.name}</div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
