# iPhone Portfolio · Paradox 作品集

一个高度还原 iOS 主屏幕交互的 Next.js 静态作品集网站，像操作真实 iPhone 一样浏览作品。

## ✨ 特性

- 🎯 **仿 iOS 主屏幕** - 完整还原 iOS 主屏幕的交互体验
- 📱 **响应式设计** - 桌面显示机身边框，移动端全屏沉浸
- 🎨 **自定义壁纸** - 支持预设渐变或上传本地图片
- 🔒 **密码保护** - 支持单个 App 独立密码保护
- 🔐 **编辑模式密钥** - 防止访客误操作，需密钥进入编辑模式
- 🎪 **拖拽排序** - 支持页面内排序和跨页面拖拽
- 📂 **文件夹支持** - MVP 阶段即支持文件夹功能
- 🧮 **内置 App** - 本地 React 组件实现（如计算器）
- 💾 **本地持久化** - 布局和壁纸自动保存到 localStorage
- 🌐 **静态部署** - 完全静态导出，GitHub Pages 友好
- 🤖 **Paradox Agent** - 由 Agnes 大模型驱动，可搜索和打开 App、控制窗口与返回桌面
- 🎵 **音乐播放器** - Apple Music 风格内置播放器，支持 iTunes 在线搜索、预览音频、曲目切换和专辑封面

## 🚀 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 本地开发

```bash
pnpm run dev
```

访问 http://localhost:3000

### 3. 构建部署

```bash
pnpm run build
```

构建产物在 `out/` 目录，可直接部署到 GitHub Pages 或任何静态服务器。

## 📁 项目结构

```
paradox_web/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # 全局布局
│   ├── page.tsx            # 主页
│   └── globals.css         # 全局样式
├── components/             # React 组件
│   ├── PhonePortfolio.tsx  # 根组件
│   ├── IPhoneFrame.tsx     # iPhone 机身边框
│   ├── HomeScreen.tsx      # 主屏幕（多页滑动）
│   ├── AppGrid.tsx         # App 网格（拖拽排序）
│   ├── AppIcon.tsx         # App 图标
│   ├── Dock.tsx            # 底部 Dock 栏
│   ├── InAppBrowser.tsx    # 内置浏览器
│   ├── ContextMenu.tsx     # 长按上下文菜单
│   ├── PasswordModal.tsx   # 密码输入框
│   ├── EditKeyModal.tsx    # 编辑密钥输入框
│   ├── WallpaperPicker.tsx # 壁纸选择器
│   ├── SettingsPanel.tsx   # 设置面板
│   ├── Folder.tsx          # 文件夹
│   └── builtin/            # 内置 App 组件
│       ├── Calculator.tsx  # 计算器
│       └── registry.ts     # 组件注册表
├── lib/                    # 核心逻辑
│   ├── types.ts            # TypeScript 类型定义
│   ├── defaultData.ts      # 默认数据（App、壁纸）
│   └── store.tsx           # 状态管理（Context API）
├── .github/workflows/      # GitHub Actions
│   └── deploy.yml          # 自动部署配置
├── next.config.ts          # Next.js 配置
├── tailwind.config.ts      # Tailwind CSS 配置
├── tsconfig.json           # TypeScript 配置
└── package.json            # 项目依赖
```

## 🎮 使用指南

### 基础操作

- **点击 App** - 打开应用（iframe 内嵌或外部跳转）
- **长按 App** - 显示上下文菜单（打开、新标签打开、移动、删除）
- **左右滑动** - 切换主屏幕页面
- **拖拽图标** - 编辑模式下可自由排序和跨页拖拽
- **点击分页点** - 快速跳转到指定页面
- **ESC 键** - 关闭当前打开的窗口/菜单
- **方向键** - 左右切换页面

### 编辑模式

1. 点击 Dock 栏的**设置**图标（⚙️）
2. 选择「进入编辑模式」
3. 输入编辑密钥（默认：`2468`）
4. 图标开始抖动，可拖拽排序、移动和删除

### 密码保护 App

部分 App（如「导师评分」「书签导航」）设置了独立密码保护：
- 点击后弹出密码输入框
- 每个 App 密码独立，互不相同
- 密码错误时提示重试

### 自定义壁纸

1. 打开设置面板
2. 选择「更换壁纸」
3. 选择预设渐变或上传本地图片
4. 壁纸全局生效，所有页面共用

### 重置主屏幕

在设置面板中选择「重置主屏幕」可恢复默认布局和壁纸。

## ⚙️ 配置

### 环境变量

在 GitHub Actions 中配置以下 Secret：

- `EDIT_PASSCODE` - 编辑模式密钥（推荐修改默认值）

### 修改默认数据

编辑 `lib/defaultData.ts` 可自定义：

- App 列表（作品、项目、社交链接）
- 文件夹内容
- Dock 栏固定 App
- 预设壁纸
- 默认编辑密钥

### App 数据格式

```typescript
{
  id: 'unique-id',
  title: 'App 名称',
  icon: '🎨',  // emoji 图标
  color: 'from-blue-400 to-cyan-500',  // Tailwind 渐变
  description: 'App 描述',
  url: 'https://example.com',  // 可选
  type: 'external' | 'builtin' | 'folder',
  password: 'secret',  // 可选：受保护 App
  builtinKey: 'calculator',  // 可选：内置组件名
  externalOnly: true,  // 可选：仅外部打开
}
```

### 添加内置 App

1. 在 `components/builtin/` 创建新组件
2. 在 `registry.ts` 注册组件
3. 在 `defaultData.ts` 添加 App 配置（`type: 'builtin'`, `builtinKey: 'your-component'`）

### Paradox Agent

桌面左下角和 iPhone Dock 上方提供常驻 Agent。按住助手图标可以在屏幕内拖动，面板会根据当前位置自动选择展开方向。Agent 使用 Agnes 的 OpenAI-compatible Chat Completions 接口，通过严格的工具白名单操作桌面。

当前允许的操作包括打开 App、Spotlight 搜索、打开 Finder、显示所有窗口、最小化或关闭当前窗口、返回桌面。聊天支持随时停止正在执行的 Agnes 请求并清空记录。删除、编辑、上传、修改设置和绕过密码等操作不会暴露给模型。

## 🛠 技术栈

- **框架** - [Next.js 15](https://nextjs.org/) (App Router)
- **语言** - [TypeScript](https://www.typescriptlang.org/)
- **样式** - [Tailwind CSS](https://tailwindcss.com/)
- **动画** - [Framer Motion](https://www.framer.com/motion/)
- **拖拽** - [@dnd-kit](https://dndkit.com/)
- **包管理** - [pnpm](https://pnpm.io/)
- **部署** - GitHub Actions + GitHub Pages

## 📦 部署到 GitHub Pages

### 1. 修改仓库名（如果需要）

编辑 `next.config.ts` 中的 `repoName` 为你的仓库名。

### 2. 配置 GitHub Pages

1. 进入仓库 Settings → Pages
2. Source 选择 "GitHub Actions"

### 3. 配置 Secrets

1. 进入仓库 Settings → Secrets and variables → Actions
2. 添加 `EDIT_PASSCODE` secret（你的编辑密钥）

### 4. 推送代码

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

GitHub Actions 会自动构建和部署。

## 🎨 设计说明

### 机身样式

- **桌面端** - 简洁现代风格，圆角边框 + 柔和阴影 + Dynamic Island
- **移动端** - 完全无边框全屏，原生触摸体验

### 配色系统

- **壁纸** - 深色渐变为主，支持自定义
- **图标** - Tailwind 渐变色，每个 App 独立配色
- **界面** - 深色主题，磨砂玻璃效果（backdrop-blur）

### 动画参数

- **弹簧动画** - `stiffness: 220-240`, `damping: 26-28`
- **App 打开** - `layoutId` 过渡 + scale/opacity 动画
- **抖动效果** - `rotate(-1.75deg ~ 1.75deg)` + `scale(1.01)`

## 🔧 开发命令

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm run dev

# 类型检查
pnpm run typecheck

# 构建生产版本
pnpm run build

# 启动生产服务器（需先 build）
pnpm run start
```

## 📝 待办事项

- [ ] Spotlight 搜索功能
- [ ] App 信息编辑器（在线编辑 App 数据）
- [ ] 导出/导入配置（JSON）
- [ ] 浅色/深色主题切换
- [ ] PWA 支持（离线访问）
- [ ] 更多内置 App（记事本、相册等）
- [ ] 文件夹高级功能（嵌套、重命名）
- [ ] 访客留言板
- [ ] 访问统计

## 📄 许可证

MIT License

## 🙏 鸣谢

- [Vivek Patel](https://github.com/vivek9patel/vivek9patel.github.io) - Ubuntu 桌面作品集灵感
- [Renovamen](https://github.com/Renovamen/playground-macos) - macOS 风格作品集参考
- [Framer Motion](https://www.framer.com/motion/) - 流畅的动画库
- [@dnd-kit](https://dndkit.com/) - 强大的拖拽库
- [Next.js](https://nextjs.org/) - 优秀的 React 框架

## 📧 联系方式

- **作者** - 李家乐 (Paradox)
- **GitHub** - [@1parado](https://github.com/1parado)
- **博客** - [https://1parado.github.io/](https://1parado.github.io/)
- **邮箱** - 2825171479@qq.com

---

**⭐ 如果这个项目对你有帮助，欢迎 Star！**
