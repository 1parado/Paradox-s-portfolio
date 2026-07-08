'use client';

const repos = [
  {
    name: 'alibaba/open-code-review',
    url: 'https://github.com/alibaba/open-code-review',
    stars: '10.1k',
    role: 'AI 代码审查方向开源项目',
    techStack: ['Go', 'TypeScript', 'LLM', 'Code Review'],
  },
  {
    name: 'Monica-Pass/Monica',
    url: 'https://github.com/Monica-Pass/Monica',
    stars: '832',
    role: '跨平台密码管理器与安全工具',
    techStack: ['Kotlin', '加密存储'],
  },
];

export function OpenSourceContributions() {
  return (
    <div className="h-full overflow-auto rounded-[1.5rem] border border-white/10 bg-[linear-gradient(145deg,rgba(24,24,27,0.96),rgba(3,7,18,0.96))] p-5 text-white">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-white/10 pb-5">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">Open Source</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">开源贡献列表</h2>
        </div>
        <div className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-sm text-white/70">
          {repos.length} repositories
        </div>
      </div>

      <div className="mt-5 grid gap-4">
        {repos.map((repo) => (
          <article key={repo.name} className="rounded-2xl border border-white/10 bg-white/[0.07] p-4 shadow-lg shadow-black/10">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <a href={repo.url} target="_blank" rel="noreferrer" className="text-lg font-semibold text-white underline-offset-4 hover:underline">
                  {repo.name}
                </a>
                <p className="mt-1 text-sm text-white/58">{repo.role}</p>
              </div>
              <div className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-zinc-950">
                Stars {repo.stars}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {repo.techStack.map((item) => (
                <span key={item} className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/75">
                  {item}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
