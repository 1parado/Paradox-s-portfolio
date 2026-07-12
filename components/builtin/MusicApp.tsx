'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

type ItunesTrack = {
  trackId: number;
  trackName: string;
  artistName: string;
  collectionName: string;
  previewUrl: string;
  artworkUrl100: string;
  trackViewUrl: string;
  primaryGenreName?: string;
};

type ItunesResponse = { resultCount: number; results: ItunesTrack[] };

const DEFAULT_QUERY = 'Coldplay';

function searchItunes(term: string): Promise<ItunesTrack[]> {
  return new Promise((resolve, reject) => {
    const callbackName = `paradoxItunes_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const script = document.createElement('script');
    const host = window as typeof window & Record<string, unknown>;
    const timeout = window.setTimeout(() => finish(new Error('iTunes 搜索超时')), 12000);

    const cleanup = () => {
      window.clearTimeout(timeout);
      script.remove();
      delete host[callbackName];
    };

    const finish = (error?: Error, tracks?: ItunesTrack[]) => {
      cleanup();
      if (error) reject(error);
      else resolve(tracks ?? []);
    };

    host[callbackName] = (payload: ItunesResponse) => {
      const tracks = (payload.results ?? []).filter((item) => item.previewUrl && item.trackName && item.artistName);
      finish(undefined, tracks);
    };
    script.onerror = () => finish(new Error('iTunes 搜索加载失败'));
    script.src = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=song&limit=12&country=US&callback=${callbackName}`;
    document.head.appendChild(script);
  });
}

function artwork(url: string, size: number) {
  return url.replace(/\/100x100bb\.(jpg|png)$/i, `/${size}x${size}bb.$1`);
}

function formatTime(value: number) {
  if (!Number.isFinite(value) || value < 0) return '0:00';
  return `${Math.floor(value / 60)}:${Math.floor(value % 60).toString().padStart(2, '0')}`;
}

function Icon({ name, className = 'h-5 w-5' }: { name: 'play' | 'pause' | 'back' | 'next' | 'volume' | 'mute' | 'repeat' | 'shuffle' | 'search'; className?: string }) {
  const paths = {
    play: <path d="m8 5 11 7-11 7V5Z" />,
    pause: <><path d="M8 5v14M16 5v14" /></>,
    back: <><path d="m11 6-6 6 6 6" /><path d="M5 12h14" /></>,
    next: <><path d="m13 6 6 6-6 6" /><path d="M5 12h14" /></>,
    volume: <><path d="M4 10v4h4l5 4V6l-5 4H4Z" /><path d="M17 9a4 4 0 0 1 0 6M19.5 6.5a8 8 0 0 1 0 11" /></>,
    mute: <><path d="M4 10v4h4l5 4V6l-5 4H4Z" /><path d="m18 9-5 6M13 9l5 6" /></>,
    repeat: <><path d="m17 2 4 4-4 4" /><path d="M3 11V9a3 3 0 0 1 3-3h15" /><path d="m7 22-4-4 4-4" /><path d="M21 13v2a3 3 0 0 1-3 3H3" /></>,
    shuffle: <><path d="M3 6h2c4 0 6 12 10 12h6" /><path d="m18 15 3 3-3 3" /><path d="M3 18h2c1.2 0 2.2-.8 3.1-2" /><path d="M14 8c.4-.8.9-2 2-2h5" /><path d="m18 3 3 3-3 3" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></>,
  };
  return <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>{paths[name]}</svg>;
}

export function MusicApp() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [tracks, setTracks] = useState<ItunesTrack[]>([]);
  const [trackIndex, setTrackIndex] = useState(0);
  const [searching, setSearching] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.78);
  const [repeat, setRepeat] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [error, setError] = useState('');
  const track = tracks[trackIndex] ?? null;

  const runSearch = async (term: string) => {
    const normalized = term.trim();
    if (!normalized) return;
    setSearching(true);
    setError('');
    try {
      const results = await searchItunes(normalized);
      setTracks(results);
      setTrackIndex(0);
      setIsPlaying(false);
      if (results.length === 0) setError('没有找到可播放的预览歌曲。');
    } catch (searchError) {
      setError(searchError instanceof Error ? searchError.message : '音乐搜索失败');
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    void runSearch(DEFAULT_QUERY);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !track) return;
    audio.pause();
    audio.load();
    setCurrentTime(0);
    setDuration(0);
    setError('');
    if (isPlaying) {
      audio.play().catch(() => {
        setIsPlaying(false);
        setError('音频需要点击播放后才能开始。');
      });
    }
  }, [track?.trackId]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const onSearch = (event: FormEvent) => {
    event.preventDefault();
    void runSearch(query);
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || !track) return;
    setError('');
    if (audio.paused) audio.play().catch(() => setError('音频预览加载失败，请稍后重试。'));
    else audio.pause();
  };

  const selectTrack = (index: number, autoplay = true) => {
    setTrackIndex(index);
    setIsPlaying(autoplay);
  };

  const stepTrack = (direction: number) => {
    if (tracks.length === 0) return;
    const next = shuffle
      ? Math.floor(Math.random() * tracks.length)
      : (trackIndex + direction + tracks.length) % tracks.length;
    selectTrack(next);
  };

  const handleEnded = () => {
    if (repeat && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => setIsPlaying(false));
      return;
    }
    stepTrack(1);
  };

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-[1.35rem] bg-[#0d0d13] text-white">
      {track ? (
        <audio
          ref={audioRef}
          src={track.previewUrl}
          preload="metadata"
          onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
          onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={handleEnded}
          onError={() => setError('音频预览加载失败，请稍后重试。')}
        />
      ) : null}

      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_8%,rgba(213,74,255,0.28),transparent_36%),radial-gradient(circle_at_90%_90%,rgba(56,189,248,0.18),transparent_42%)]" />
      <div className="relative flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-5 sm:p-6 md:grid md:grid-cols-[minmax(18rem,0.82fr)_minmax(20rem,1.18fr)] md:gap-7 md:overflow-hidden">
        <section className="flex min-w-0 flex-col">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45">Apple Preview</p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight">Paradox Music</h2>
            </div>
            <form onSubmit={onSearch} className="flex min-w-0 max-w-[14rem] items-center rounded-full border border-white/10 bg-white/8 pl-3 focus-within:border-white/25">
              <Icon name="search" className="h-4 w-4 shrink-0 text-white/42" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索歌曲或歌手" className="h-8 min-w-0 flex-1 bg-transparent px-2 text-xs text-white outline-none placeholder:text-white/30" />
              <button type="submit" className="mr-1 rounded-full px-2 py-1 text-[11px] text-white/55 transition hover:bg-white/10 hover:text-white">搜索</button>
            </form>
          </div>

          {track ? (
            <>
              <div className="mt-auto flex items-end justify-between gap-4 pt-8">
                <div className="min-w-0"><h3 className="truncate text-lg font-semibold">{track.trackName}</h3><p className="mt-0.5 truncate text-sm text-white/48">{track.artistName} · {track.primaryGenreName ?? 'Music'}</p></div>
                <a href={track.trackViewUrl} target="_blank" rel="noreferrer" className="shrink-0 rounded-full border border-white/10 bg-white/8 px-3 py-1 text-[11px] text-white/60 transition hover:bg-white/14 hover:text-white">Apple Music</a>
              </div>

              <div className="mt-3">
                <input type="range" min="0" max={duration || 0} step="0.1" value={Math.min(currentTime, duration || 0)} onChange={(event) => { const value = Number(event.target.value); if (audioRef.current) audioRef.current.currentTime = value; setCurrentTime(value); }} className="h-1.5 w-full cursor-pointer accent-white" aria-label="播放进度" />
                <div className="mt-1 flex justify-between text-[11px] tabular-nums text-white/42"><span>{formatTime(currentTime)}</span><span>{formatTime(duration)}</span></div>
              </div>

              <div className="mt-2 flex items-center justify-center gap-5">
                <button type="button" onClick={() => setShuffle((value) => !value)} className={`rounded-full p-2 transition ${shuffle ? 'text-white' : 'text-white/45 hover:text-white'}`} aria-label="随机播放" title="随机播放"><Icon name="shuffle" className="h-4 w-4" /></button>
                <button type="button" onClick={() => stepTrack(-1)} className="rounded-full p-2 text-white/75 transition hover:bg-white/10 hover:text-white" aria-label="上一首" title="上一首"><Icon name="back" /></button>
                <button type="button" onClick={togglePlay} className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-zinc-950 shadow-lg shadow-black/20 transition hover:scale-105" aria-label={isPlaying ? '暂停' : '播放'} title={isPlaying ? '暂停' : '播放'}><Icon name={isPlaying ? 'pause' : 'play'} className="h-6 w-6" /></button>
                <button type="button" onClick={() => stepTrack(1)} className="rounded-full p-2 text-white/75 transition hover:bg-white/10 hover:text-white" aria-label="下一首" title="下一首"><Icon name="next" /></button>
                <button type="button" onClick={() => setRepeat((value) => !value)} className={`rounded-full p-2 transition ${repeat ? 'text-white' : 'text-white/45 hover:text-white'}`} aria-label="循环播放" title="循环播放"><Icon name="repeat" className="h-4 w-4" /></button>
              </div>

              <div className="mt-3 flex items-center gap-2 text-white/55">
                <button type="button" onClick={() => setVolume((value) => value > 0 ? 0 : 0.78)} aria-label={volume > 0 ? '静音' : '取消静音'} title={volume > 0 ? '静音' : '取消静音'}><Icon name={volume > 0 ? 'volume' : 'mute'} className="h-4 w-4" /></button>
                <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(event) => setVolume(Number(event.target.value))} className="h-1 w-24 cursor-pointer accent-white" aria-label="音量" />
                {error ? <span className="ml-auto truncate text-xs text-amber-200/75">{error}</span> : null}
              </div>
              <div className="mt-auto pt-5 text-xs leading-relaxed text-white/35">音频为 iTunes Search API 提供的预览片段。完整曲目可在 Apple Music 中打开。</div>
            </>
          ) : (
            <div className="flex min-h-[20rem] flex-1 items-center justify-center text-center text-sm text-white/45">{searching ? '正在搜索 iTunes 音乐目录…' : error || '搜索歌曲开始播放。'}</div>
          )}
        </section>

        <section className="flex min-h-[18rem] min-w-0 items-center justify-center border-t border-white/10 pt-5 md:min-h-0 md:border-l md:border-t-0 md:pl-7 md:pt-0">
          {track ? (
            <motion.div className="relative aspect-square w-full max-w-[27rem] overflow-hidden rounded-[1.65rem] border border-white/15 bg-white/10 shadow-[0_28px_90px_rgba(0,0,0,0.42)]" animate={isPlaying ? { scale: [1, 1.012, 1] } : { scale: 1 }} transition={isPlaying ? { duration: 4, repeat: Infinity, ease: 'easeInOut' } : { duration: 0.2 }}>
              <img src={artwork(track.artworkUrl100, 600)} alt={`${track.trackName} 专辑封面`} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-white/10" />
              <div className="absolute bottom-6 left-6 right-6"><div className="text-xs font-medium uppercase tracking-[0.2em] text-white/65">{track.collectionName}</div><div className="mt-2 truncate text-3xl font-semibold tracking-tight">{track.trackName}</div><div className="mt-1 truncate text-sm text-white/65">{track.artistName}</div></div>
            </motion.div>
          ) : <div className="text-sm text-white/35">搜索歌曲后显示专辑封面</div>}
        </section>
      </div>

      <div className="relative shrink-0 border-t border-white/10 bg-black/15 px-5 py-3 md:px-6">
        <div className="flex gap-2 overflow-x-auto">
          {searching ? <span className="py-2 text-xs text-white/40">搜索中…</span> : tracks.map((item, index) => (
            <button key={item.trackId} type="button" onClick={() => selectTrack(index)} className={`flex min-w-[12rem] items-center gap-3 rounded-xl border px-3 py-2 text-left transition ${index === trackIndex ? 'border-white/25 bg-white/12' : 'border-white/8 bg-white/5 hover:bg-white/10'}`}>
              <img src={artwork(item.artworkUrl100, 120)} alt="" className="h-9 w-9 rounded-lg object-cover" />
              <span className="min-w-0"><span className="block truncate text-sm font-medium">{item.trackName}</span><span className="block truncate text-[11px] text-white/42">{item.artistName}</span></span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
