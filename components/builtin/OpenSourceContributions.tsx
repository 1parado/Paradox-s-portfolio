'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';

type PR = {
  id: string;
  title: string;
  date: string;
  state: 'merged' | 'open' | 'closed';
  summary: string;
  meta: string;
  details: string[];
};

type Repo = {
  name: string;
  url: string;
  role: string;
  stars: string;
  techStack: string[];
  prs: PR[];
};

const stateMeta: Record<PR['state'], { label: string; className: string; dot: string }> = {
  merged: { label: '已合并', className: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30', dot: 'bg-emerald-400' },
  open: { label: '开放中', className: 'bg-sky-500/15 text-sky-300 border-sky-400/30', dot: 'bg-sky-400' },
  closed: { label: '已关闭', className: 'bg-zinc-500/15 text-zinc-300 border-zinc-400/30', dot: 'bg-zinc-400' },
};

const repos: Repo[] = [
  {
    name: 'alibaba/open-code-review',
    url: 'https://github.com/alibaba/open-code-review',
    role: 'AI 代码审查方向开源项目',
    stars: '10.1k',
    techStack: ['Go', 'TypeScript', 'LLM', 'Code Review'],
    prs: [
      {
        id: '122',
        title: 'feat: add --model flag to override LLM model per review',
        date: '2026-06-14',
        state: 'merged',
        summary: '给 ocr review 加 --model 参数，单次运行覆盖配置里的模型，无需改 ~/.opencodereview/config.json。',
        meta: '15 个文件 · +688 / -90 · 含完整单测与多语言文档',
        details: [
          '示例：ocr review --model claude-opus-4-6、ocr review --commit abc123 --model claude-sonnet-4-6',
          '自定义 provider 可声明 models 列表，配合 ocr config model TUI 交互切换',
          '覆盖 resolver.go(模型解析)、flags.go、provider_tui.go(TUI 切换)、4 个语言的 README（中/英/日/韩/俄）',
          'go test ./... 全过，含 resolver_test.go(+223) 等单测',
        ],
      },
      {
        id: '162',
        title: 'fix: improve LLM test feedback for empty responses',
        date: '2026-06-16',
        state: 'merged',
        summary: 'API 请求成功但模型返回空内容时，程序只输出空行，用户误以为连接失败或卡死。',
        meta: 'cmd/opencodereview/llm_cmd.go · +8 / -2',
        details: [
          '检测空响应，显示 (empty response)',
          '测试完成后明确提示 Connection test successful',
          '顺带把 MaxTokens 调大以兼容 reasoning 模型测试',
          '评审：lizhengfeng101 先 COMMENTED 提了两点格式建议（混用 Println/Printf、多余空行），修改后 APPROVED 合并',
        ],
      },
    ],
  },
  {
    name: 'Monica-Pass/Monica',
    url: 'https://github.com/Monica-Pass/Monica',
    role: '跨平台密码管理器与安全工具',
    stars: '832',
    techStack: ['Kotlin', '加密存储', 'Android'],
    prs: [
      {
        id: '57',
        title: 'feat: add software update detection',
        date: '2026-06-03',
        state: 'merged',
        summary: '在应用内检查 GitHub 最新 Release 版本，并支持下载 + 安装 APK（用于 issue #37）。',
        meta: '7 个文件 · +491 / -7 · 含单元测试',
        details: [
          'UpdateChecker.kt（新增，167 行）：OkHttp 调 GitHub Releases API → kotlinx.serialization 解析 JSON → 语义化版本比较（兼容 v1.0.288c 格式）→ 下载 APK 到 cacheDir/update_apk/ → 通过 FileProvider 调系统安装器',
          'SettingsScreen.kt（+260/-7）：设置页"关于"区新增"检查更新"入口',
          'AndroidManifest.xml：加 REQUEST_INSTALL_PACKAGES 权限（Android 8.0+）',
          'file_paths.xml：配置 FileProvider 路径共享 APK',
          'strings.xml（中/英）：新增 19 条多语言文案',
          'UpdateCheckerTest.kt（+22）：版本比对单测',
          '特点：复用现有依赖（OkHttp、kotlinx.serialization），未新增第三方库；兼容 Android 7.x 与 8.0+；离线/联网场景都做了验证',
        ],
      },
    ],
  },
];

function PRItem({ pr, repoUrl }: { pr: PR; repoUrl: string }) {
  const [open, setOpen] = useState(false);
  const badge = stateMeta[pr.state];

  return (
    <li className="relative pl-8">
      <span className={`absolute left-[7px] top-2 h-2.5 w-2.5 -translate-x-1/2 rounded-full ring-4 ring-zinc-950 ${badge.dot}`} />
      <div className="rounded-2xl border border-white/10 bg-white/[0.06] shadow-lg shadow-black/10">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="flex w-full items-start gap-3 rounded-2xl p-3.5 text-left transition hover:bg-white/[0.06]"
        >
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${badge.className}`}>#{pr.id} · {badge.label}</span>
              <span className="text-[11px] text-white/40">{pr.date}</span>
            </div>
            <p className="mt-1.5 break-words text-sm font-semibold text-white/95">{pr.title}</p>
            <p className="mt-1 text-xs text-white/55">{pr.meta}</p>
            <p className="mt-1.5 text-xs leading-relaxed text-white/70">{pr.summary}</p>
          </div>
          <motion.span
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="mt-1 shrink-0 text-white/50"
            aria-hidden
          >
            ▾
          </motion.span>
        </button>

        <AnimatePresence initial={false}>
          {open ? (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="overflow-hidden"
            >
              <ul className="space-y-2.5 border-t border-white/10 px-3.5 pb-4 pt-3">
                {pr.details.map((line, index) => (
                  <li key={index} className="flex gap-2 text-xs leading-relaxed text-white/75">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-sky-400/70" />
                    <span className="break-words">{line}</span>
                  </li>
                ))}
                <li className="pt-1">
                  <a
                    href={`${repoUrl}/pull/${pr.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-md bg-white/10 px-2.5 py-1 text-xs text-white/80 transition hover:bg-white/20"
                  >
                    在 GitHub 查看 PR ↗
                  </a>
                </li>
              </ul>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </li>
  );
}

function RepoCard({ repo }: { repo: Repo }) {
  return (
    <article className="rounded-[1.4rem] border border-white/10 bg-white/[0.05] p-5 shadow-xl shadow-black/20">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/10 pb-4">
        <div className="min-w-0">
          <a href={repo.url} target="_blank" rel="noreferrer" className="break-words text-lg font-semibold text-white underline-offset-4 hover:underline">
            {repo.name}
          </a>
          <p className="mt-1 text-sm text-white/58">{repo.role}</p>
        </div>
        <div className="shrink-0 rounded-full bg-white px-3 py-1 text-sm font-semibold text-zinc-950">
          ★ {repo.stars}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {repo.techStack.map((item) => (
          <span key={item} className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/75">{item}</span>
        ))}
      </div>

      <ol className="relative mt-5 space-y-4 before:absolute before:bottom-2 before:left-[7px] before:top-2 before:w-px before:bg-white/15">
        {repo.prs.map((pr) => (
          <PRItem key={pr.id} pr={pr} repoUrl={repo.url} />
        ))}
      </ol>
    </article>
  );
}

export function OpenSourceContributions() {
  const totalPRs = repos.reduce((sum, repo) => sum + repo.prs.length, 0);

  return (
    <div className="h-full overflow-auto rounded-[1.5rem] border border-white/10 bg-[linear-gradient(145deg,rgba(24,24,27,0.96),rgba(3,7,18,0.96))] p-5 text-white">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-white/10 pb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">Open Source</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">开源贡献</h2>
        </div>
        <div className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-sm text-white/70">
          {repos.length} 个仓库 · {totalPRs} 个 PR
        </div>
      </div>

      <p className="mt-4 text-sm text-white/55">点击任意 PR 可展开详情</p>

      <div className="mt-5 grid gap-5">
        {repos.map((repo) => (
          <RepoCard key={repo.name} repo={repo} />
        ))}
      </div>
    </div>
  );
}
