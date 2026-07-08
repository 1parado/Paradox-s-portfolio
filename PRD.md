 iOS 手机主屏幕风格作品集 PRD 文档

产品名称：iPhone Portfolio（或自命名，如「你的名字 · 主屏幕」）
项目类型：Next.js 静态站点（GitHub Pages 部署）
核心理念：把作品集做成一个可交互的 iPhone 主屏幕，用户像操作手机一样浏览你的作品，每个作品就是一个「App」。
版本：v1.0
日期：2026-07-08
目标平台：Web（桌面 + 移动端），完美支持 GitHub Pages 静态导出

1. 产品概述

用户打开网站后看到一个高度还原的 iPhone 屏幕（桌面端带机身边框，移动端直接全屏）。主屏幕上排列着代表你作品、项目、社交链接、博客、关于页等的 App 图标。

• 点击 App：以丝滑动画「打开」模拟的 App 窗口（In-App Browser），用 iframe 尝试内嵌预览作品。
• 长按 App：进入编辑态 + 显示上下文菜单（更多信息、移动、删除、编辑、外部打开等）。
• 拖拽：自由排序图标，支持跨页面拖拽。
• 左右滑动：切换多个桌面页（类似 iOS 多页主屏幕）。
• 自定义壁纸：支持上传本地图片或切换预设。
• Dock 栏：固定常用 App（博客、关于、GitHub 等）。

整个体验强调个人特色 + 可玩性，而非传统卡片列表。完美展示你设计的网站/项目，同时自然融入博客/写作链接。

2. 目标与成功指标

目标：
• 打造极具记忆点和互动性的个人品牌作品集。
• 让访客通过「操作手机」的方式深度探索你的作品。
• 展示前端技术能力（动画、交互、状态管理、静态部署）。
• 易于维护和自定义（配置文件驱动 + 本地持久化）。

成功指标（MVP 后衡量）：
• 访客平均停留时间 > 45s（传统作品集通常 15-25s）。
• 至少 60% 访客点击 3 个以上 App。
• 移动端完美体验（无边框全屏）。
• GitHub Pages 加载 < 2s（首屏）。
• 访客能轻松自定义壁纸/排序并分享体验。

3. 用户画像与使用场景

• 主要用户：潜在客户、招聘方、设计师/开发者同行、朋友。
• 场景：
  • 桌面端：好奇点开，探索多个作品。
  • 手机端：直接全屏像真手机一样刷你的「App」。
  • 面试/分享：演示「这是我的作品集，你可以像用手机一样操作」。
• 次要：想复制类似交互的开发者。

4. 功能需求（Functional Requirements）

核心交互（必须）：
• App 网格：4 列（iOS 标准），响应式调整。支持 emoji 图标 + 自定义颜色/图片。
• 长按 App：
  • 触发「抖动（jiggle）」模式（图标轻微旋转动画）。
  • 弹出上下文菜单（仿 iOS）：打开、查看详情、编辑信息、移动到其他页面、删除、在新标签打开。
  • 菜单带简要预览（项目描述 + 缩略图如果有）。
• 拖拽排序：
  • HTML5 Drag API 或更好：@dnd-kit（2026 推荐主流，轻量、支持触摸、无障碍、跨容器）。
  • 支持同一页面内排序 + 跨桌面页拖拽。
  • 结合 Framer Motion layout 动画实现平滑重排。
• 多桌面页：
  • 左右滑动切换（Framer Motion drag + snap）。
  • 底部分页圆点（可点击跳转，可缩放动画）。
  • 支持 2~5 页（可配置上限）。
  • 页面间 App 可自由移动。
• App 打开动画（Framer Motion 丝滑实现）：
  • 从图标原始位置 + 尺寸 → 弹簧动画放大到全屏模拟窗口。
  • 背景轻微模糊/暗化。
  • 关闭时反向动画回到图标位置（或淡出）。
• 模拟 In-App Browser：
  • 顶部工具栏（地址栏显示项目 URL、返回、关闭、刷新、外部打开按钮）。
  • 主区域使用 <iframe> 尝试加载作品 URL（sandbox 属性限制）。
  • 优雅降级：若 iframe 被阻止（X-Frame-Options 等），显示「该作品不支持内嵌预览」+ 「在新标签打开」按钮。
  • 支持加载状态、错误提示。
  • 自定义壁纸：
   • 设置入口（长按空白处或 Dock 设置 App）。
   • 上传本地图片（转为 base64 或 object URL）。
   • 预设壁纸（渐变、照片、纯色）。
   • 全局一张壁纸（已定，所有桌面页共用同一张，MVP 不做每页独立）。
   • 持久化到 localStorage。
  • 密码保护 App（必须，新增）：
   • 部分 App 在配置中带独立密码（每个 App 密码互不相同）。
   • 点击受保护 App → 弹出密码输入框（modal）→ 校验通过才打开 In-App Browser / 跳转；错误则提示重试。
   • 密码校验在客户端比对（配置内明文或构建期注入，无后端）。
   • 当前受保护的默认 App：导师评分、书签导航。博客无需密码。
  • 编辑模式密钥（必须，新增）：
   • 进入「编辑/抖动」模式需先输入编辑密钥，避免访客误改布局。
   • 密钥通过构建期环境变量注入（如 NEXT_PUBLIC_EDIT_KEY），值来自 GitHub 仓库 secret（占位名 EDIT_PASSCODE，部署时在 Actions 中配置同名 secret）。
   • 运行时仅比对输入值与注入值，不在客户端暴露 secret 原文逻辑。
• Dock 栏：底部半透明磨砂效果，固定 3~4 个 App（不可删除或可配置）。
 • 响应式：
   • 桌面：简洁现代风格机身（轻量圆角 + 柔和阴影，可选 Dynamic Island 点缀），不追求极致还原。
   • 移动端：全屏、完全无边框、触摸优先（支持长按、滑动）。
   • 横屏/竖屏适配。
• 状态持久化：localStorage 保存布局、壁纸、App 顺序。提供「重置为默认」按钮。
 • 基础 App 类型：
  • 作品/项目（带 URL）
  • 关于我
  • 博客（可内嵌或跳转）
  • 社交/GitHub/Behance 等
  • 设置（壁纸、布局重置等）
  • 内置 App（builtin）：本地 React 组件实现的功能型 App（如计算器），打开时渲染本地组件而非 iframe，无网络依赖；可无 url、可不设密码。
 • 内置 App（builtin）：
  • 由数据模型 `type: 'builtin'` + `component` 字段映射到对应本地组件（如 `calculator`）。
  • 打开逻辑：`InAppBrowser` 按 `app.component` 从注册表取本地组件渲染，不进入 iframe / fallback 流程。
  • 受保护密码、编辑模式同样适用；本类 App 默认可无 url。

非核心但推荐（MVP 后）：
• 编辑 App 信息（名称、描述、图标、颜色）。
• 搜索 / Spotlight 风格（顶部下拉）。
• 访客留言（简单表单或链接到真实评论）。
• 导出/导入配置（JSON）。
• 主题切换（深色/浅色或多壁纸模式）。
• 键盘支持（方向键切换页、ESC 关闭 App）。

5. 非功能需求

• 性能：首屏 < 1.5s，动画 60fps，App 数量控制在 20~30 个以内。
• 可访问性：图标有 alt/label，键盘可操作，语义化。
• SEO：静态导出友好，首页有基础 meta + 作品描述。
• 部署：纯静态，output: 'export'，GitHub Actions 自动部署。
• 浏览器：现代 Chrome/Firefox/Safari/Edge，移动 Safari/Chrome。
• 数据安全：仅客户端，无后端。敏感作品用「外部打开」为主。

6. 交互流程（关键 User Flow）

1. 进入 → 看到壁纸 + App 网格 + Dock + 状态栏 + Dynamic Island。
2. 左右滑 → 切换页面 + 圆点动画。
3. 短按 App → 弹簧动画打开 In-App Browser（iframe 或 fallback）。
4. 长按 App → 抖动 + 上下文菜单出现（背景模糊）。
5. 拖拽图标 → 实时重排 + 跨页拖到另一页。
6. 长按空白/Dock 设置 → 打开壁纸选择器（上传或预设）。
7. 在 In-App Browser 内 → 可返回主屏或外部跳转。
8. 刷新页面 → 恢复上次布局和壁纸。

7. 视觉与设计规范（iOS 风格）

• 字体：系统 -apple-system / SF Pro（或 Inter + 系统回退）。
• 颜色：深色为主（iOS 18/26 风格），支持动态壁纸自适应文字颜色。
• 图标：64×64 圆角 16px，带轻微阴影。
• 动画：优先使用 spring（参考 Apple WWDC 弹簧物理）。关键参数示例：stiffness 150~300、damping 20~30、bounce 0.1~0.3。
• 边框/机身：深色边框 + 真实圆角 + 微弱倒影（可选高端）。
• 磨砂效果：backdrop-filter: blur(20px)。
 • 状态栏：真实时间 + 信号 + 电池。
 • 内置 App（如计算器）采用 iOS 计算器深色配色：黑底 #000000、数字键 #333333、功能键（AC/±/%）#A5A5A5（黑字）、运算符与等号 #FF9F0A（按下反白），与简洁现代机身协调。
 • 参考 iOS HIG：Home Screen、Context Menus。

8. 技术架构

推荐技术栈：
• Next.js（App Router，推荐 15+）
• React + TypeScript
• Tailwind CSS
• Framer Motion（动画、drag、layout、AnimatePresence）
• @dnd-kit/core + @dnd-kit/sortable（拖拽首选）
• 可选：lucide-react（图标）、sonner（toast）、react-hot-toast 等

关键实现方案：
• 多页与滑动：motion.div + drag 约束 + pagination dots。或简单 state 控制当前页 + transform。
• App 打开动画：记录点击图标的 getBoundingClientRect()，用 motion 元素从该位置 scale/translate 到全屏（结合 layoutId 或自定义 variants）。
• 壁纸：<input type="file"> + FileReader → localStorage + background-image。
• In-App Browser：独立组件，带 AnimatePresence，iframe + 工具栏。
• 持久化：useEffect + localStorage，序列化 pages: App[][] + wallpaper。
• 静态导出：next.config.ts 中 output: 'export'、images: { unoptimized: true }。GitHub Pages 用 GitHub Actions（upload-pages-artifact + deploy-pages）。
 • 本仓库为普通项目仓库：https://github.com/1parado/Paradox-s-portfolio.git → 必须配置 basePath: '/Paradox-s-portfolio' 与 assetPrefix: '/Paradox-s-portfolio'。
• 状态管理：轻量用 React Context + hooks，或 Zustand（可选）。

数据模型示例（TypeScript）：

interface App {
  id: string;
  name: string;
  icon: string;      // emoji 或图片 URL
  color?: string;
  description: string;
  url: string;
  type?: 'project' | 'link' | 'about' | 'blog' | 'builtin';
  password?: string;   // 可选：受保护 App 的独立密码，存在则打开前需校验
  folderId?: string;   // 可选：归属文件夹 id（MVP 支持文件夹）
  component?: string;  // 可选：type 为 'builtin' 时，映射到本地组件名（如 'calculator'）
}

interface Folder {
  id: string;
  name: string;
  icon?: string;     // 文件夹封面（取前几个 App 图标拼合或自定义）
  appIds: string[];  // 内含 App 顺序
}

type HomePages = (App | Folder)[][];

9. 部署与运维

• 推荐仓库名：yourusername.github.io（直接根路径）。
• 构建后输出到 out/ 文件夹。
• GitHub Actions 工作流（标准模板已成熟）。
• 图片/资源放 public/。
• 提供一键重置按钮保护演示体验。

10. 参考案例与灵感来源

最接近的真实案例：
• Vivek Patel — https://vivek9patel.github.io/ （Next.js + Tailwind 实现的 Ubuntu 桌面模拟作品集，交互丰富、右键菜单、设置等，强烈推荐体验）。Repo：https://github.com/vivek9patel/vivek9patel.github.io
• Renovamen playground-macos — https://portfolio.zxh.me （macOS 风格模拟作品集）。

交互与动画参考：
• Apple iOS 主屏幕与 Context Menu 行为（官方支持文档与 HIG）。
• Framer Motion 官方示例（layout 动画、drag 轮播、spring、AnimatePresence）。
• motion.dev 轮播与分页示例。
• Apple WWDC 弹簧动画讲解（物理弹簧参数在 iOS App 打开动画中的应用）。

拖拽库：
• @dnd-kit（https://dndkit.com/）——2026 社区主流推荐，轻量、可扩展、支持网格与触摸。

手机框架组件：
• 社区开源 iPhone 边框 + Dynamic Island 组件（Tailwind + React 示例可搜索 “iPhoneFrame Tailwind” 或具体仓库）。

其他灵感：
• 早期单文件 iPhone 模拟思路（可作为快速原型参考）。
• 各种 Awwwards / CodePen iOS 风格重建（搜索 “iOS home screen CSS” 或 “react iphone simulator”）。

11. 范围、里程碑与风险

MVP 范围（建议先做这个上线）：
• 基础多页（默认 3 页 / 约 20 个 App）+ 滑动 + 拖拽排序 + 跨页拖拽 + 文件夹（拖入仿 iOS）+ 长按菜单 + 简单 App 打开（iframe + fallback）+ 密码保护 App（独立密码弹框校验）+ 编辑模式密钥（EDIT_PASSCODE）+ 全局壁纸 + Dock + 简洁现代机身框架 + 移动端全屏无边框 + localStorage + 静态部署（basePath: /Paradox-s-portfolio）。

后续迭代：
• 文件夹、App 编辑器、Spotlight、导出配置、更好 iframe 沙箱处理、PWA 支持。

风险与注意：
• 很多作品网站会阻止 iframe → 必须做好 fallback。
• 触摸 vs 鼠标长按/拖拽行为差异 → 充分测试。
• 性能：过多图标或复杂壁纸。
• 静态限制：无服务端，数据仅本地。

12. 已确认决策（原开放问题已闭环）

• 壁纸：全局一张，所有桌面页共用（不做每页独立）。
• 默认数据：3 页 / 约 20 个 App（用真实信息填充，详见 12.1）。
• 文件夹：MVP 即支持（拖入仿 iOS，含跨页移动）。
• 边框风格：简洁现代，不追求极致还原 iOS。
• 编辑模式触发：进入编辑/抖动模式需输入密钥（EDIT_PASSCODE），非纯长按；普通长按仅弹上下文菜单、不进编辑态。
• 移动端：完全移除边框，全屏触摸优先。

12.1 默认真实内容（v1 示例数据）

• 作者：李家乐（昵称 Paradox）。
• 页面分配（建议）：
  • 第 1 页（核心作品）：导师评分、书签导航、博客，及若干占位项目 App。
  • 第 2 页（写作/博客）：博客、更多文章类 App。
  • 第 3 页（社交/关于）：GitHub、社交链接、关于我、设置。
• 已确认 App：
  • 博客：https://1parado.github.io/ （无需密码，可内嵌或跳转）
  • 书签导航：https://1parado.github.io/bookmarks2website/ （需独立密码）
  • 导师评分：https://sprightly-phoenix-8a1e83.netlify.app/ （需独立密码）
  • GitHub：https://github.com/1parado （无需密码，外部打开）
  • 联系邮箱：2825171479@qq.com （mailto 链接，无需密码）
  • 计算器：type 'builtin'、component 'calculator'（无 url、无密码，本地组件）
• 其余项目 App 为虚构示例，可在编辑模式替换。
• 待补充：其余项目 App、社交链接（GitHub/X/邮箱等）、关于页文案、各受保护 App 的具体密码值、编辑密钥实际值（部署时在 GitHub secret 配 EDIT_PASSCODE）。

12.2 仍待你补充（可选，可后续迭代填充）

• 更多真实作品/项目 URL（凑满 3 页约 20 个）。
• 社交/代码链接（GitHub、Behance、X/Twitter、邮箱）。
• 受保护 App 的具体密码、编辑密钥的实际值。
• 「关于我」文案与头像。
