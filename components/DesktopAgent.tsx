'use client';

import { AnimatePresence, motion, useDragControls, useReducedMotion } from 'framer-motion';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { AGNES_CHAT_MODEL, type AgentAction, type AgentChatMessage, requestAgnesAgent, resolveLocalAgentAction } from '@/lib/agnesAgent';
import type { AppItem } from '@/lib/types';

type Props = {
  apps: AppItem[];
  activeWindowTitle?: string;
  onAction: (action: AgentAction) => string;
};

type UiMessage = AgentChatMessage & { id: string };

type SpeechRecognitionResultLike = {
  isFinal: boolean;
  0: { transcript: string };
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
};

type SpeechRecognitionErrorEventLike = {
  error: string;
};

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

type VoiceState = 'idle' | 'listening' | 'transcribing';

const suggestions = ['打开简历', '搜索 AI 项目', '显示所有窗口'];

function createMessage(role: UiMessage['role'], content: string): UiMessage {
  return { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, role, content };
}

export function DesktopAgent({ apps, activeWindowTitle, onAction }: Props) {
  const [open, setOpen] = useState(false);
  const [showGreeting, setShowGreeting] = useState(true);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [voiceMessage, setVoiceMessage] = useState('');
  const [viewport, setViewport] = useState({ width: 1440, height: 900 });
  const [panelLeft, setPanelLeft] = useState(0);
  const [panelBelow, setPanelBelow] = useState(false);
  const [panelHeight, setPanelHeight] = useState(544);
  const [messages, setMessages] = useState<UiMessage[]>([
    createMessage('assistant', '想打开什么？'),
  ]);
  const abortRef = useRef<AbortController | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const voiceTranscriptRef = useRef('');
  const voiceErrorRef = useRef(false);
  const voiceSubmitTimerRef = useRef<number | null>(null);
  const agentRef = useRef<HTMLDivElement | null>(null);
  const draggedRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const dragControls = useDragControls();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => () => {
    abortRef.current?.abort();
    voiceErrorRef.current = true;
    recognitionRef.current?.abort();
    if (voiceSubmitTimerRef.current !== null) window.clearTimeout(voiceSubmitTimerRef.current);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowGreeting(false), 6000);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const updateViewport = () => setViewport({ width: window.innerWidth, height: window.innerHeight });
    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  const run = async (rawInput: string) => {
    const prompt = rawInput.trim();
    if (!prompt || loading) return;
    setVoiceMessage('');
    const userMessage = createMessage('user', prompt);
    const history = [...messages, userMessage];
    setMessages(history);
    setInput('');
    setLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const response = await requestAgnesAgent({
        messages: history.map(({ role, content }) => ({ role, content })),
        apps,
        activeWindowTitle,
        signal: controller.signal,
      });
      if (response.action) {
        const action = response.action;
        const result = onAction(action);
        setMessages((current) => [...current, createMessage('assistant', result)]);
      } else {
        setMessages((current) => [...current, createMessage('assistant', response.content || '我没有找到可执行的操作。')]);
      }
    } catch (error) {
      if (controller.signal.aborted) return;
      const localAction = resolveLocalAgentAction(prompt, apps);
      const fallback = localAction
        ? onAction(localAction)
        : `Agnes 暂时没有响应。${error instanceof Error ? ` ${error.message}` : ''}`;
      setMessages((current) => [...current, createMessage('assistant', fallback)]);
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
        setLoading(false);
      }
    }
  };

  const stopAgent = () => {
    const controller = abortRef.current;
    if (!controller) return;
    abortRef.current = null;
    controller.abort();
    setLoading(false);
    setMessages((current) => [...current, createMessage('assistant', '已停止当前操作。')]);
  };

  const stopVoiceInput = () => {
    recognitionRef.current?.stop();
  };

  const cancelVoiceInput = () => {
    voiceErrorRef.current = true;
    recognitionRef.current?.abort();
    recognitionRef.current = null;
    if (voiceSubmitTimerRef.current !== null) window.clearTimeout(voiceSubmitTimerRef.current);
    voiceSubmitTimerRef.current = null;
    voiceTranscriptRef.current = '';
    setVoiceState('idle');
    setVoiceMessage('');
  };

  const startVoiceInput = () => {
    if (loading || voiceState === 'transcribing') return;
    if (voiceState === 'listening') {
      stopVoiceInput();
      return;
    }

    const speechWindow = window as typeof window & {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
    };
    const Recognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    if (!Recognition) {
      setVoiceMessage('当前浏览器不支持语音输入，请使用最新版 Chrome 或 Edge。');
      return;
    }

    if (voiceSubmitTimerRef.current !== null) {
      window.clearTimeout(voiceSubmitTimerRef.current);
      voiceSubmitTimerRef.current = null;
    }

    const recognition = new Recognition();
    recognition.lang = 'zh-CN';
    recognition.continuous = false;
    recognition.interimResults = true;
    voiceTranscriptRef.current = '';
    voiceErrorRef.current = false;
    recognitionRef.current = recognition;

    recognition.onstart = () => {
      setVoiceState('listening');
      setVoiceMessage('正在聆听，说出你想让 Agent 执行的操作');
    };
    recognition.onresult = (event) => {
      let transcript = '';
      for (let index = 0; index < event.results.length; index += 1) {
        transcript += event.results[index][0].transcript;
      }
      const normalizedTranscript = transcript.trim();
      if (!normalizedTranscript) return;
      voiceTranscriptRef.current = normalizedTranscript;
      setInput(normalizedTranscript);
      setVoiceMessage('正在识别你的指令…');
    };
    recognition.onerror = (event) => {
      voiceErrorRef.current = true;
      const errorMessages: Record<string, string> = {
        'not-allowed': '麦克风权限未开启，请在浏览器地址栏中允许访问。',
        'service-not-allowed': '浏览器已阻止语音识别服务，请检查站点权限。',
        'audio-capture': '没有检测到可用的麦克风。',
        'no-speech': '没有听到语音，请靠近麦克风再试一次。',
        network: '语音识别网络连接失败，请稍后重试。',
      };
      setVoiceMessage(errorMessages[event.error] ?? '语音识别未完成，请再试一次。');
      setVoiceState('idle');
    };
    recognition.onend = () => {
      recognitionRef.current = null;
      if (voiceErrorRef.current) return;
      const transcript = voiceTranscriptRef.current.trim();
      if (!transcript) {
        setVoiceState('idle');
        setVoiceMessage('没有识别到内容，请点击麦克风重试。');
        return;
      }
      setVoiceState('transcribing');
      setVoiceMessage('已听清，正在交给 Agent');
      voiceSubmitTimerRef.current = window.setTimeout(() => {
        voiceSubmitTimerRef.current = null;
        setVoiceState('idle');
        setVoiceMessage('');
        void run(transcript);
      }, reduceMotion ? 0 : 520);
    };

    try {
      recognition.start();
    } catch {
      recognitionRef.current = null;
      setVoiceState('idle');
      setVoiceMessage('语音输入启动失败，请稍后重试。');
    }
  };

  const clearMessages = () => {
    abortRef.current?.abort();
    abortRef.current = null;
    cancelVoiceInput();
    setLoading(false);
    setVoiceState('idle');
    setVoiceMessage('');
    setInput('');
    setMessages([createMessage('assistant', '想打开什么？')]);
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (voiceState !== 'idle') return;
    void run(input);
  };

  return (
    <motion.div
      ref={agentRef}
      className="fixed bottom-36 left-4 z-[75] md:bottom-5 md:left-5"
      drag
      dragControls={dragControls}
      dragListener={false}
      dragMomentum={false}
      dragElastic={0.04}
      dragConstraints={{
        left: 0,
        right: Math.max(0, viewport.width - 80),
        top: -Math.max(0, viewport.height - (viewport.width < 768 ? 232 : 96)),
        bottom: 0,
      }}
      onDragStart={() => {
        draggedRef.current = true;
        setShowGreeting(false);
      }}
      onDragEnd={(_, info) => {
        const rect = agentRef.current?.getBoundingClientRect();
        const centerX = rect ? rect.left + rect.width / 2 : info.point.x;
        const centerY = rect ? rect.top + rect.height / 2 : info.point.y;
        const agentLeft = rect?.left ?? centerX - 28;
        const panelWidth = Math.min(384, viewport.width - 32);
        const panelViewportLeft = Math.min(
          Math.max(8, centerX - panelWidth / 2),
          viewport.width - panelWidth - 8,
        );
        const opensBelow = centerY < Math.min(360, viewport.height * 0.44);
        const availableHeight = opensBelow
          ? viewport.height - centerY - 84
          : centerY - 84;
        setPanelLeft(panelViewportLeft - agentLeft);
        setPanelBelow(opensBelow);
        setPanelHeight(Math.max(280, Math.min(544, availableHeight)));
        window.setTimeout(() => {
          draggedRef.current = false;
        }, 0);
      }}
    >
      <AnimatePresence>
        {showGreeting && !open ? (
          <motion.div
            initial={{ opacity: 0, x: -6, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -4, scale: 0.96 }}
            transition={{ duration: 0.22 }}
            className="pointer-events-none absolute bottom-1 left-[4.25rem] w-max max-w-[calc(100vw-6rem)] rounded-xl border border-white/16 bg-zinc-950/82 px-3 py-2 text-sm font-medium text-white shadow-[0_12px_36px_rgba(0,0,0,0.34)] backdrop-blur-2xl"
          >
            <span className="absolute -left-1.5 bottom-3 h-3 w-3 rotate-45 border-b border-l border-white/16 bg-zinc-950/82" />
            你好，我是Paradox Agent
          </motion.div>
        ) : null}

        {open ? (
          <motion.section
            initial={{ opacity: 0, y: 12, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 340, damping: 30 }}
            className={[
              'absolute flex w-[calc(100vw-2rem)] max-w-[24rem] flex-col overflow-hidden rounded-[1.35rem] border border-white/15 bg-zinc-950/88 text-white shadow-[0_28px_90px_rgba(0,0,0,0.52)] backdrop-blur-3xl',
              panelBelow ? 'top-[4.5rem]' : 'bottom-[4.5rem]',
            ].join(' ')}
            style={{ height: `min(${panelHeight}px, 62vh)`, left: panelLeft }}
            aria-label="Paradox Agent"
          >
            <header
              className="flex h-14 shrink-0 cursor-grab touch-none items-center gap-3 border-b border-white/10 px-4 active:cursor-grabbing"
              onPointerDown={(event) => dragControls.start(event)}
            >
              <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-300 via-sky-500 to-indigo-600 shadow-lg shadow-sky-500/20">
                <span className="flex gap-1" aria-hidden>
                  {[0, 1].map((index) => (
                    <motion.span
                      key={index}
                      className="h-1.5 w-1.5 rounded-full bg-white"
                      animate={reduceMotion ? undefined : { scaleY: [1, 1, 0.12, 1, 1] }}
                      transition={{ duration: 4.8, repeat: Infinity, repeatDelay: index * 0.18, ease: 'easeInOut' }}
                    />
                  ))}
                </span>
                <span className="absolute bottom-1.5 h-px w-3 rounded-full bg-white/80" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">Paradox Agent</div>
                <div className="truncate text-[11px] text-white/45">{AGNES_CHAT_MODEL}</div>
              </div>
              <button
                type="button"
                onClick={() => {
                  cancelVoiceInput();
                  setOpen(false);
                }}
                onPointerDown={(event) => event.stopPropagation()}
                className="flex h-8 w-8 items-center justify-center rounded-full text-xl text-white/55 transition hover:bg-white/10 hover:text-white"
                aria-label="关闭 Agent"
              >
                ×
              </button>
            </header>

            <div ref={scrollRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.map((message) => (
                <div key={message.id} className={message.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                  <div className={[
                    'max-w-[86%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm leading-relaxed',
                    message.role === 'user'
                      ? 'rounded-br-md bg-sky-500 text-white'
                      : 'rounded-bl-md border border-white/10 bg-white/8 text-white/82',
                  ].join(' ')}>
                    {message.content}
                  </div>
                </div>
              ))}
              {loading ? (
                <div className="flex justify-start">
                  <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-white/10 bg-white/8 px-3 py-3" aria-label="Agent 正在思考">
                    {[0, 1, 2].map((index) => (
                      <motion.span
                        key={index}
                        className="h-1.5 w-1.5 rounded-full bg-white/55"
                        animate={reduceMotion ? undefined : { opacity: [0.35, 1, 0.35], y: [0, -2, 0] }}
                        transition={{ duration: 0.9, repeat: Infinity, delay: index * 0.15 }}
                      />
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            {messages.length <= 1 ? (
              <div className="flex gap-2 overflow-x-auto px-4 pb-3">
                {suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => void run(suggestion)}
                    className="shrink-0 rounded-full border border-white/12 bg-white/8 px-3 py-1.5 text-xs text-white/68 transition hover:bg-white/14 hover:text-white"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            ) : null}

            <form onSubmit={onSubmit} className="shrink-0 border-t border-white/10 p-3">
              <AnimatePresence initial={false}>
                {voiceMessage ? (
                  <motion.div
                    initial={{ height: 0, opacity: 0, y: 4 }}
                    animate={{ height: 'auto', opacity: 1, y: 0 }}
                    exit={{ height: 0, opacity: 0, y: 4 }}
                    className="overflow-hidden"
                    role="status"
                    aria-live="polite"
                  >
                    <div className="mb-2 flex min-h-8 items-center gap-2 rounded-lg border border-sky-300/15 bg-sky-400/10 px-2.5 py-1.5 text-xs text-sky-100/78">
                      {voiceState === 'listening' ? (
                        <span className="flex h-4 items-center gap-0.5" aria-hidden>
                          {[0, 1, 2, 3].map((index) => (
                            <motion.span
                              key={index}
                              className="w-0.5 rounded-full bg-sky-300"
                              animate={reduceMotion ? { height: 8 } : { height: [4, 14, 6, 11, 4] }}
                              transition={{ duration: 0.8, repeat: Infinity, delay: index * 0.1 }}
                            />
                          ))}
                        </span>
                      ) : (
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-sky-300" aria-hidden />
                      )}
                      <span>{voiceMessage}</span>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
              <div className="flex items-end gap-2">
                <textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault();
                      if (input.trim() && voiceState === 'idle') void run(input);
                    }
                  }}
                  rows={1}
                  placeholder={voiceState === 'listening' ? '请说话…' : '输入指令…'}
                  className="max-h-24 min-h-10 flex-1 resize-none rounded-xl border border-white/10 bg-white/8 px-3 py-2 text-sm text-white outline-none placeholder:text-white/32 focus:border-sky-400/55 focus:ring-1 focus:ring-sky-400/30"
                />
                <button
                  type="button"
                  onClick={startVoiceInput}
                  disabled={loading || voiceState === 'transcribing'}
                  className={[
                    'relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition disabled:cursor-default disabled:opacity-35',
                    voiceState === 'listening'
                      ? 'border-sky-300/45 bg-sky-400 text-white shadow-[0_0_22px_rgba(56,189,248,0.38)]'
                      : 'border-white/10 bg-white/8 text-white/60 hover:bg-white/14 hover:text-white',
                  ].join(' ')}
                  aria-label={voiceState === 'listening' ? '结束语音输入' : '使用语音输入'}
                  aria-pressed={voiceState === 'listening'}
                  title={voiceState === 'listening' ? '结束语音输入' : '语音输入'}
                >
                  {voiceState === 'listening' && !reduceMotion ? (
                    <motion.span
                      className="absolute inset-0 rounded-xl border border-sky-200/65"
                      animate={{ scale: [1, 1.22], opacity: [0.8, 0] }}
                      transition={{ duration: 1.1, repeat: Infinity }}
                      aria-hidden
                    />
                  ) : null}
                  <svg viewBox="0 0 24 24" className="relative h-[1.125rem] w-[1.125rem]" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <rect x="9" y="3" width="6" height="11" rx="3" />
                    <path d="M5.5 10.5a6.5 6.5 0 0 0 13 0M12 17v4M9 21h6" />
                  </svg>
                </button>
              <button
                type="button"
                onClick={clearMessages}
                disabled={messages.length <= 1 && !input && !loading}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/8 text-white/60 transition hover:bg-white/14 hover:text-white disabled:cursor-default disabled:opacity-30"
                aria-label="清空聊天记录"
                title="清空聊天记录"
              >
                <svg viewBox="0 0 24 24" className="h-[1.125rem] w-[1.125rem]" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <path d="M4 7h16" />
                  <path d="M9 7V4h6v3" />
                  <path d="m7 7 1 13h8l1-13" />
                  <path d="M10 11v5M14 11v5" />
                </svg>
              </button>
              {loading ? (
                <button
                  type="button"
                  onClick={stopAgent}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500 text-white transition hover:bg-rose-400"
                  aria-label="停止 Agent"
                  title="停止当前操作"
                >
                  <span className="h-3.5 w-3.5 rounded-[0.2rem] bg-white" aria-hidden />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!input.trim() || voiceState !== 'idle'}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500 text-white transition hover:bg-sky-400 disabled:cursor-default disabled:opacity-35"
                  aria-label="发送"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="m5 12 14-7-5 14-2-5-7-2Z" />
                    <path d="m12 14 7-9" />
                  </svg>
                </button>
              )}
              </div>
            </form>
          </motion.section>
        ) : null}
      </AnimatePresence>

      <motion.button
        type="button"
        onPointerDown={(event) => dragControls.start(event)}
        onClick={() => {
          if (draggedRef.current) return;
          setShowGreeting(false);
          setOpen((value) => !value);
        }}
        className="relative flex h-14 w-14 cursor-grab touch-none items-center justify-center rounded-[1.15rem] border border-white/20 bg-zinc-950/72 text-white shadow-[0_14px_38px_rgba(0,0,0,0.38)] backdrop-blur-2xl active:cursor-grabbing"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.94 }}
        aria-label={open ? '收起 Paradox Agent' : '打开 Paradox Agent'}
        title="Paradox Agent"
      >
        <span className="absolute inset-1 rounded-[0.9rem] bg-gradient-to-br from-cyan-300 via-sky-500 to-indigo-600 opacity-90" />
        <span className="relative flex gap-1" aria-hidden>
          {[0, 1].map((index) => (
            <motion.span
              key={index}
              className="h-2 w-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.7)]"
              animate={reduceMotion ? undefined : { scaleY: [1, 1, 0.08, 1, 1] }}
              transition={{ duration: 4.8, repeat: Infinity, repeatDelay: index * 0.18, ease: 'easeInOut' }}
            />
          ))}
        </span>
        {loading ? <span className="absolute -right-1 -top-1 h-3 w-3 animate-pulse rounded-full border-2 border-zinc-900 bg-emerald-400" /> : null}
      </motion.button>
    </motion.div>
  );
}
