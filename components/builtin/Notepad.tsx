'use client';

import { useEffect, useRef, useState } from 'react';
import { usePortfolioStore } from '@/lib/store';
import { isGithubUploadEnabled, readNotepad, saveNotepad } from '@/lib/githubAssets';

type Status = 'loading' | 'ready' | 'saving' | 'saved' | 'error';

const EMPTY_HINT = '在这里随手记点什么——想法、待办、灵感片段。\n进入整理模式后即可编辑并保存到 GitHub。';

export function Notepad() {
  const { editMode } = usePortfolioStore();
  const enabled = isGithubUploadEnabled();

  const [content, setContent] = useState('');
  const [status, setStatus] = useState<Status>('loading');
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<number | null>(null);
  const [dirty, setDirty] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    setError(null);
    readNotepad()
      .then((doc) => {
        if (cancelled) return;
        setContent(doc?.content ?? '');
        setUpdatedAt(doc?.updatedAt ?? null);
        setStatus('ready');
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.message ?? '读取记事本失败');
        setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const editable = editMode && enabled;

  const handleChange = (value: string) => {
    setContent(value);
    setDirty(true);
    if (status === 'saved') setStatus('ready');
  };

  const handleSave = async () => {
    if (!editable) return;
    setStatus('saving');
    setError(null);
    try {
      const stamp = await saveNotepad(content);
      setUpdatedAt(stamp);
      setDirty(false);
      setStatus('saved');
    } catch (err) {
      setError((err as Error)?.message ?? '保存失败');
      setStatus('error');
    }
  };

  // 离开未保存内容时给出提示（不阻塞导航，仅浏览器原生确认）
  useEffect(() => {
    if (!dirty || !editable) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dirty, editable]);

  const updatedAtLabel = updatedAt
    ? new Date(updatedAt).toLocaleString('zh-CN', { hour12: false })
    : null;

  return (
    <div className="flex h-full flex-col rounded-[2rem] bg-[#0b0b0f] p-4 text-white">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-9 items-center gap-2">
          <span className="text-lg font-semibold">记事本</span>
          {updatedAtLabel ? (
            <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-white/65">已保存 {updatedAtLabel}</span>
          ) : null}
        </div>
        <div className="ml-auto flex items-center gap-2">
          {editable ? (
            <button
              type="button"
              disabled={!dirty || status === 'saving'}
              onClick={handleSave}
              className="rounded-full bg-amber-500/90 px-4 py-1.5 text-sm font-medium transition hover:bg-amber-500 disabled:opacity-50"
            >
              {status === 'saving' ? '保存中…' : status === 'saved' ? '已保存' : '保存'}
            </button>
          ) : null}
        </div>
      </div>

      <div className="mb-2 text-xs text-white/55">
        {!enabled
          ? '未配置 GitHub 凭据，记事本为只读。'
          : editMode
            ? '整理模式：可编辑并保存到 GitHub 仓库。'
            : '浏览模式：进入整理模式后可编辑。'}
        {dirty ? ' · 有未保存的修改' : ''}
      </div>

      {status === 'error' && error ? (
        <div className="mb-2 rounded-lg bg-red-500/15 px-3 py-2 text-xs text-red-200">{error}</div>
      ) : null}

      <textarea
        ref={textareaRef}
        value={content || ''}
        placeholder={EMPTY_HINT}
        readOnly={!editable}
        spellCheck={false}
        onChange={(event) => handleChange(event.target.value)}
        className="min-h-0 flex-1 resize-none rounded-2xl border border-white/10 bg-black/30 p-4 text-sm leading-relaxed text-white/90 outline-none transition placeholder:text-white/35 focus:border-amber-300/40 read-only:cursor-default"
      />
    </div>
  );
}
