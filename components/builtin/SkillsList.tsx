'use client';

type SkillEntry = {
  id: number;
  name: string;
  source: '本地' | '远程';
  category: string;
};

const skills: SkillEntry[] = [
  { id: 1, name: 'baoyu-skills', source: '远程', category: '文章配图/插图生成' },
  { id: 2, name: 'docx', source: '本地', category: 'Word文档处理' },
  { id: 3, name: 'dogfood', source: '本地', category: 'Web应用QA测试' },
  { id: 4, name: 'skills', source: '远程', category: 'Skill发现与安装' },
  { id: 5, name: 'guizang-social-card-skill', source: '本地', category: '社交媒体卡片/小红书图文生成' },
  { id: 6, name: 'ian-xiaohei-illustrations', source: '本地', category: 'Ian风格中文正文配图（手绘/怪诞风格）' },
  { id: 7, name: 'image-api-live-motion', source: '本地', category: 'Live Photo动态素材生成' },
  { id: 8, name: 'image-generation-workflow', source: '本地', category: '固定IP角色图像生成工作流' },
  { id: 9, name: 'mimo-v2-5-tts', source: '本地', category: '小米MiMo语音合成（TTS）' },
  { id: 10, name: 'clawdis', source: '远程', category: 'OpenAI Images API批量图像生成' },
  { id: 11, name: 'pdf', source: '本地', category: 'PDF文件处理（读写/合并/拆分/OCR等）' },
  { id: 12, name: 'pencil-design-skill', source: '远程', category: 'Pencil设计工具（.pen文件转代码）' },
  { id: 13, name: 'playwright', source: '本地', category: '浏览器自动化（终端版）' },
  { id: 14, name: 'playwright-interactive', source: '本地', category: '浏览器交互式调试' },
  { id: 15, name: 'pptx', source: '本地', category: 'PowerPoint演示文稿处理' },
  { id: 16, name: 'screenshot', source: '本地', category: '桌面/系统截图' },
  { id: 17, name: 'agent-skills', source: '远程', category: 'UI代码审查/可访问性检查' },
  { id: 18, name: 'xiaohongshu-images-skill', source: '远程', category: '小红书3:4比例图片生成' },
  { id: 19, name: 'xlsx', source: '本地', category: 'Excel/电子表格处理' },
  { id: 20, name: 'yuanbao', source: '本地', category: '元宝群组功能（@提及/查询）' },
];

const sourceStyles: Record<SkillEntry['source'], string> = {
  本地: 'border-cyan-300/25 bg-cyan-300/10 text-cyan-100',
  远程: 'border-amber-300/25 bg-amber-300/10 text-amber-100',
};

export function SkillsList() {
  const localCount = skills.filter((skill) => skill.source === '本地').length;
  const remoteCount = skills.length - localCount;

  return (
    <div className="h-full overflow-auto rounded-[1.5rem] border border-white/10 bg-[linear-gradient(145deg,rgba(12,15,22,0.97),rgba(8,12,20,0.94)_52%,rgba(22,17,10,0.9))] p-4 text-white sm:p-5">
      <div className="mx-auto flex min-h-full max-w-5xl flex-col">
        <header className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-200/65">Codex Skill Shelf</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Skills</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/58">
              我当前常用的本地与远程技能清单，按工具入口整理。
            </p>
          </div>

          <div className="grid grid-cols-3 overflow-hidden rounded-xl border border-white/10 bg-white/[0.06] text-center">
            <div className="px-4 py-2.5">
              <div className="text-lg font-semibold">{skills.length}</div>
              <div className="text-[11px] text-white/45">Total</div>
            </div>
            <div className="border-x border-white/10 px-4 py-2.5">
              <div className="text-lg font-semibold text-cyan-100">{localCount}</div>
              <div className="text-[11px] text-white/45">Local</div>
            </div>
            <div className="px-4 py-2.5">
              <div className="text-lg font-semibold text-amber-100">{remoteCount}</div>
              <div className="text-[11px] text-white/45">Remote</div>
            </div>
          </div>
        </header>

        <div className="mt-5 hidden overflow-x-auto rounded-2xl border border-white/10 sm:block">
          <div className="min-w-[48rem]">
            <div className="grid grid-cols-[3.5rem_minmax(12rem,1.25fr)_5.5rem_minmax(13rem,1fr)] border-b border-white/10 bg-white/[0.07] text-xs font-semibold text-white/48">
              <div className="px-3 py-3 text-center">#</div>
              <div className="px-3 py-3">Skill 名称</div>
              <div className="px-3 py-3 text-center">来源</div>
              <div className="px-3 py-3">功能类别</div>
            </div>

            {skills.map((skill) => (
              <article
                key={skill.id}
                className="grid grid-cols-[3.5rem_minmax(12rem,1.25fr)_5.5rem_minmax(13rem,1fr)] items-center border-b border-white/5 text-sm transition last:border-b-0 hover:bg-white/[0.045]"
              >
                <div className="px-3 py-3 text-center font-mono text-xs text-white/40">{skill.id}</div>
                <div className="min-w-0 px-3 py-3 font-semibold text-white/90">
                  <span className="block truncate">{skill.name}</span>
                </div>
                <div className="px-3 py-3 text-center">
                  <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${sourceStyles[skill.source]}`}>
                    {skill.source}
                  </span>
                </div>
                <div className="px-3 py-3 text-white/68">{skill.category}</div>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-2 sm:hidden">
          {skills.map((skill) => (
            <article key={`mobile-${skill.id}`} className="rounded-xl border border-white/10 bg-white/[0.055] p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs text-white/35">#{skill.id}</div>
                  <div className="mt-1 break-words text-sm font-semibold text-white/90">{skill.name}</div>
                </div>
                <span className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium ${sourceStyles[skill.source]}`}>
                  {skill.source}
                </span>
              </div>
              <div className="mt-2 text-sm leading-6 text-white/62">{skill.category}</div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
