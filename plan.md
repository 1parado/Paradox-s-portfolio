# 实施计划：iPhone Portfolio（Paradox 作品集）

> 基于 `PRD.md` 与已确认决策。当前进度：PRD 已完成（含内置 App 规范），`components/builtin/Calculator.tsx` 与 `registry.ts` 已就绪。仓库尚无 Next.js 脚手架，无法运行组件。

## 已锁定决策（来自 PRD 与对话）

- 壁纸：全局一张（非每页独立）。
- 默认数据：3 页 / 约 20 个 App，用真实信息 + 虚构占位（编辑模式可替换）。
- 文件夹：MVP 即支持（拖入仿 iOS）。
- 边框风格：简洁现代，移动端完全无边框全屏。
- 编辑模式：进入需输入密钥 `EDIT_PASSCODE`（构建期由 GitHub secret 注入 `NEXT_PUBLIC_EDIT_KEY`）。
- 受保护 App：导师评分、书签导航，各自独立密码（点击弹框校验）。
- 内置 App：计算器（`type:'builtin'`, `component:'calculator'`），iOS 计算器配色、单行读数。
- 部署仓库：`1parado/Paradox-s-portfolio` → `basePath: '/Paradox-s-portfolio'`。
- 技术栈：Next.js 15 (App Router) + TS + Tailwind + Framer Motion + @dnd-kit。

## 目标结构

```
paradox_web/
├─ PRD.md
├─ plan.md
├─ package.json
├─ next.config.ts            # output:'export', basePath, assetPrefix, images.unoptimized
├─ tailwind.config.ts
├─ postcss.config.mjs
├─ tsconfig.json
├─ .github/workflows/deploy.yml
├─ app/
│  ├─ layout.tsx             # 全局字体、metadata、body
│  ├─ page.tsx               # 渲染 <PhonePortfolio/>
│  └─ globals.css            # Tailwind 指令 + 基础变量
├─ components/
│  ├─ PhonePortfolio.tsx     # 根组件：状态、持久化、键盘事件
│  ├─ IPhoneFrame.tsx        # 简洁现代机身（桌面有框/移动端无框）
│  ├─ HomeScreen.tsx         # 多页滑动 + 分页圆点
│  ├─ AppGrid.tsx            # 4 列网格 + @dnd-kit 排序/跨页
│  ├─ AppIcon.tsx            # 图标 + 长按抖动
│  ├─ Dock.tsx               # 底部磨砂 Dock
│  ├─ ContextMenu.tsx        # 仿 iOS 长按菜单
│  ├─ InAppBrowser.tsx       # iframe + 工具栏 + builtin 挂载
│  ├─ WallpaperPicker.tsx    # 上传/预设壁纸
│  ├─ EditKeyModal.tsx       # 输入 EDIT_PASSCODE 进编辑态
│  ├─ PasswordModal.tsx      # 受保护 App 密码校验
│  ├─ Folder.tsx             # 文件夹（MVP）
│  └─ builtin/
│     ├─ Calculator.tsx      # ✅ 已完成
│     └─ registry.ts         # ✅ 已完成
├─ lib/
│  ├─ store.tsx              # Context + localStorage（布局/壁纸/顺序/编辑态）
│  ├─ defaultData.ts         # 真实+占位数据（3页约20 App）
│  └─ types.ts               # App / Folder / HomePages 类型
```

## 分阶段实施

### 阶段 0：脚手架与配置
1. 初始化 `package.json`，安装依赖：`next react react-dom typescript tailwindcss postcss autoprefixer framer-motion @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`。
2. 写 `next.config.ts`：`output:'export'`、`images.unoptimized:true`、`basePath:'/Paradox-s-portfolio'`、`assetPrefix:'/Paradox-s-portfolio'`。
3. Tailwind / PostCSS / `tsconfig.json` / `app/globals.css` / `app/layout.tsx`（含 meta、字体）。
4. 验证 `npm run dev` 能起空白页。

### 阶段 1：类型与数据
5. `lib/types.ts`：从 PRD 数据模型落地 `App`、`Folder`、`HomePages`。
6. `lib/defaultData.ts`：填入已确认内容（李家乐/Paradox、博客、书签、导师评分、GitHub、邮箱、计算器）+ 虚构占位项目凑满 3 页约 20 App；受保护 App 标注 `password`（占位值，部署时改）。

### 阶段 2：状态与持久化
7. `lib/store.tsx`：Context 保存 `pages`、`wallpaper`、`editMode`；`useEffect` ↔ `localStorage`；导出 `resetToDefault()`；编辑密钥比对 `NEXT_PUBLIC_EDIT_KEY`。

### 阶段 3：外壳与首页
8. `IPhoneFrame`：桌面简洁现代机身（圆角+柔影+可选 Dynamic Island），移动端 `md:` 断点下无边框全屏。
9. `HomeScreen`：Framer Motion `drag` + snap 切换多页，分页圆点；接入 `AppGrid` 与 `Dock`。
10. `AppGrid` + `AppIcon`：4 列网格；emoji/图片图标；长按触发抖动 + `ContextMenu`；@dnd-kit 排序与跨页拖拽。

### 阶段 4：交互组件
11. `ContextMenu`：打开 / 查看详情 / 编辑 / 移动到其他页 / 删除 / 新标签打开。
12. `InAppBrowser`：顶部工具栏（地址栏/返回/关闭/刷新/外部打开）；`app.type==='builtin'` 时经 `getBuiltinApp` 渲染本地组件，否则 `<iframe>` + sandbox + fallback；打开/关闭用 `layoutId` 弹簧动画。
13. `PasswordModal`：受保护 App 点击 → 弹框输入独立密码 → 校验通过才打开。
14. `EditKeyModal`：长按空白处/Dock 设置进入编辑态前，先输入 `EDIT_PASSCODE`。
15. `WallpaperPicker`：上传本地图片（FileReader→base64）或预设；全局持久化。
16. `Folder`：拖入生成文件夹、内部重排、点开查看（MVP）。

### 阶段 5：部署
17. `.github/workflows/deploy.yml`：build（注入 `NEXT_PUBLIC_EDIT_PASSCODE` 等 secret）→ `upload-pages-artifact` → `deploy-pages`。
18. 在仓库 Settings → Secrets 配置 `EDIT_PASSCODE` 与受保护 App 密码（与 `defaultData` 中值一致）。

### 阶段 6：验证与打磨
19. `npm run build` 成功导出 `out/`；`npm run dev` 手测：滑动/拖拽/长按菜单/计算器运算/密码弹框/编辑密钥/壁纸/刷新恢复/移动端全屏。
20. 无障碍：图标 `aria-label`、键盘可操作（ESC 关闭、方向键切页）、`prefers-reduced-motion` 支持。

## 建议执行顺序（下一步先做）
A. 阶段 0 脚手架（让 `Calculator.tsx` 可运行挂载）。
B. 阶段 1–2 类型 + 默认数据 + store。
C. 阶段 3–4 外壳与交互（先跑通「图标→打开 App→iframe/builtin」主链路，再补密码/编辑密钥/文件夹/壁纸）。
D. 阶段 5–6 部署与验证。

## 风险与待补
- 真实作品多会拦截 iframe → `InAppBrowser` 的 fallback 必须可靠。
- 触摸 vs 鼠标长按/拖拽差异 → 充分测试。
- 受保护 App 与编辑密钥的**实际密码值**仍待你在部署时填入（§12.2）。
- 更多真实项目 App 待补充以凑满 3 页。
