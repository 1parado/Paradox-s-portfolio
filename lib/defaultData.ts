import type { AppItem, FolderItem, HomePage, WallpaperPreset } from '@/lib/types';

export const wallpaperPresets: WallpaperPreset[] = [
  { id: 'sonoma', label: 'Sonoma', value: 'linear-gradient(135deg, #123047 0%, #4f7b7a 28%, #b06c59 56%, #3b2352 100%)' },
  { id: 'ventura', label: 'Ventura', value: 'linear-gradient(140deg, #09111f 0%, #1d4f7a 32%, #a94f82 68%, #201530 100%)' },
  { id: 'graphite', label: 'Graphite', value: 'linear-gradient(150deg, #18181b 0%, #52525b 46%, #111827 100%)' },
  { id: 'ember', label: 'Ember', value: 'linear-gradient(155deg, #1c1917 0%, #9a3412 46%, #581c87 100%)' },
  { id: 'field', label: 'Field', value: 'linear-gradient(160deg, #052e16 0%, #0f766e 48%, #365314 100%)' },
];

const external = (overrides: Partial<AppItem> & Pick<AppItem, 'id' | 'title' | 'icon' | 'color' | 'description'>): AppItem => ({
  type: 'external',
  ...overrides,
});

const builtin = (overrides: Partial<AppItem> & Pick<AppItem, 'id' | 'title' | 'icon' | 'color' | 'description' | 'builtinKey'>): AppItem => ({
  type: 'builtin',
  ...overrides,
});

const folder = (overrides: Omit<FolderItem, 'type'>): FolderItem => ({
  type: 'folder',
  ...overrides,
});

export const skillsApp: AppItem = builtin({
  id: 'folder-prompt',
  title: 'Skills',
  icon: '🧰',
  iconKey: 'skills',
  color: 'from-amber-300 to-cyan-500',
  description: '我使用的 Codex skills 列表。',
  builtinKey: 'skills',
  techStack: ['Local Skills', 'Remote Skills', 'Codex'],
});

export const chatAgnesApp: AppItem = external({
  id: 'chatagnes',
  title: 'ChatAgnes',
  icon: '🤖',
  iconKey: 'agent',
  color: 'from-violet-500 to-cyan-500',
  description: 'AI 对话应用 ChatAgnes。',
  url: 'https://1parado.github.io/ChatAgnes/',
  techStack: ['AI App', 'Chat', 'GitHub Pages'],
});

export const grokSwitchApp: AppItem = external({
  id: 'grok-switch',
  title: 'grok_switch',
  icon: '/Paradox-s-portfolio/grok-switch.svg',
  color: 'from-zinc-900 to-black',
  description: '快速切换和管理 Grok Build 配置的实用工具。',
  url: 'https://1parado.github.io/grok-build-switch/',
  techStack: ['Grok', '配置切换', 'GitHub Pages'],
});

export const defaultPages: HomePage[] = [
  {
    id: 'page-1',
    title: '作品',
    items: [
      external({ id: 'blog', title: '博客', icon: '✍️', iconKey: 'blog', color: 'from-orange-400 to-rose-500', description: '写作、思考与实验记录。', url: 'https://1parado.github.io/' }),
      builtin({ id: 'calculator', title: '计算器', icon: '🧮', iconKey: 'calculator', color: 'from-zinc-500 to-zinc-800', description: '本地 React 组件实现的 iOS 风格计算器。', builtinKey: 'calculator' }),
      folder({
        id: 'portfolio-lab',
        title: '作品集',
        icon: '🪄',
        iconKey: 'portfolio',
        color: 'from-cyan-400 to-blue-600',
        description: '个人项目精选集合：实验 Demo、语音日历与带访问口令的工具入口。',
        children: [
          external({ id: 'mini-world', title: 'Mini world', icon: '🌐', color: 'from-sky-400 to-indigo-500', description: 'Mini world 项目演示。', url: 'https://1parado.github.io/mini-world/', techStack: ['JavaScript'] }),
          builtin({ id: 'voice-calendar', title: '语音日历', icon: '📅', iconKey: 'calendar', color: 'from-cyan-400 to-blue-600', description: '七牛云暑期实训项目演示入口。', builtinKey: 'voice-calendar', techStack: ['语音交互', '日历管理', '七牛云', '视频演示'] }),
          external({
            id: 'bookmark-nav',
            title: '书签导航',
            icon: '🧭',
            iconKey: 'bookmark',
            color: 'from-emerald-400 to-teal-600',
            description: '常用链接与收藏导航，点击后需要独立密码。',
            url: 'https://1parado.github.io/bookmarks2website/',
            password: 'paradoxparadox',
            passwordHint: '密码是paradoxparadox',
            techStack: ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'GitHub Pages'],
          }),
          external({
            id: 'mentor-review',
            title: '导师评分',
            icon: '🧑‍🏫',
            iconKey: 'mentor',
            color: 'from-fuchsia-500 to-violet-600',
            description: '导师评审面板与反馈，点击后需要独立密码。',
            url: 'https://sprightly-phoenix-8a1e83.netlify.app/',
            password: '北校区',
            passwordHint: '密码是北校区',
            techStack: ['React', 'TypeScript', 'Tailwind CSS', 'Netlify', '表单交互'],
          }),
          chatAgnesApp,
          grokSwitchApp,
        ],
      }),
      builtin({ id: 'open-source', title: '开源贡献', icon: '🐙', iconKey: 'github', color: 'from-neutral-500 to-neutral-950', description: '参与过的开源项目、技术栈和社区数据。', builtinKey: 'open-source', techStack: ['GitHub', 'Code Review', 'TypeScript', 'AI Agent'] }),
      folder({
        id: 'starter-folder',
        title: '灵感',
        icon: '🗂️',
        iconKey: 'folder',
        color: 'from-slate-300 to-slate-600',
        description: '写作、动效和界面实验的临时集合。',
        children: [
          external({ id: 'folder-motion', title: '动效', icon: '🎞️', iconKey: 'motion', color: 'from-indigo-400 to-blue-600', description: 'Motion 与转场设计记录。', url: 'https://1parado.github.io/' }),
          external({ id: 'folder-notes', title: '笔记', icon: '📝', iconKey: 'note', color: 'from-amber-300 to-orange-500', description: '公开写作与想法碎片。', url: 'https://1parado.github.io/' }),
          skillsApp,
        ],
      }),
    ],
  },
  {
    id: 'page-2',
    title: '实验',
    items: [
      builtin({ id: 'writing', title: '书单', icon: '📚', iconKey: 'writing', color: 'from-amber-300 to-red-500', description: '读过的书：78 本，Notion 表格风格。', builtinKey: 'booklist' }),
    ],
  },
  {
    id: 'page-3',
    title: '链接',
    items: [
      external({ id: 'github', title: 'GitHub', icon: '🐙', iconKey: 'github', color: 'from-neutral-500 to-neutral-950', description: '开源项目、代码与实验。', url: 'https://github.com/1parado', externalOnly: true }),
      builtin({ id: 'email', title: '邮箱', icon: '📮', iconKey: 'mail', color: 'from-amber-400 to-orange-600', description: '邮件联系与合作。', builtinKey: 'contact' }),
      builtin({ id: 'about', title: '关于我', icon: '🙋', iconKey: 'about', color: 'from-sky-400 to-indigo-600', description: '姓名、昵称、邮箱与爱好。', builtinKey: 'about' }),
      builtin({ id: 'resume', title: '简历', icon: '📄', iconKey: 'resume', color: 'from-teal-400 to-cyan-600', description: '教育经历、实习、项目与技能。', builtinKey: 'resume' }),
    ],
  },
];

export const defaultDock: AppItem[] = [
  external({ id: 'dock-blog', title: '博客', icon: '✍️', iconKey: 'blog', color: 'from-orange-400 to-rose-500', description: '博客快捷入口。', url: 'https://1parado.github.io/' }),
  builtin({ id: 'dock-settings', title: '设置', icon: '⚙️', iconKey: 'settings', color: 'from-neutral-400 to-neutral-700', description: '壁纸、编辑模式与重置。', builtinKey: 'settings' }),
  builtin({ id: 'dock-photos', title: '照片', icon: '🖼️', iconKey: 'photo', color: 'from-pink-400 to-rose-500', description: '相册：进入整理模式后可上传图片，存入 GitHub。', builtinKey: 'photo' }),
  builtin({ id: 'dock-notepad', title: '记事本', icon: '📝', iconKey: 'note', color: 'from-amber-300 to-orange-500', description: '记事本：进入整理模式后可编辑，内容存入 GitHub。', builtinKey: 'notepad' }),
];

// 站点级壁纸：与 uploads/wallpaper.json 中由编辑模式写入的站点壁纸保持一致，
// 作为首屏默认值与 GitHub fetch 失败时的兜底（避免先闪渐变再换图）。
export const defaultWallpaper =
  'url(https://raw.githubusercontent.com/1parado/Paradox-s-portfolio/main/uploads/wallpapers/wallpaper-mrcxbwoe-i2vdkw.jpeg) center / cover no-repeat';
