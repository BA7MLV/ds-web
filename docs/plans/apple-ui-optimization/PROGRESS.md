# Apple 级 UI/UX 优化进度

> 分支：`cursor/apple-ui-optimization-36c9` · 基线：`dev` · 目标：Apple 级视觉、交互与文案品质，多端适配

## 总体目标

- 视觉：玻璃态、留白、字体层级、阴影与动效对齐 Apple 官网质感
- 交互：滚动叙事、粘性区块、安全区、减少动效偏好
- 文案：有人味、具体、避免 AI 腔（aislop）
- 工程：组件化拆分、性能与可访问性

## 轮次记录

### Round 1（已完成）

**子代理分工（10 路并行）— 全部落地**

| # | 范围 | 状态 |
|---|------|------|
| 1 | `zh.json` 文案 | ✅ |
| 2 | `en.json` 文案 | ✅ |
| 3 | `zh-Hant.json` 文案 | ✅ |
| 4 | `mobile-nav-menu.jsx` | ✅ |
| 5 | `theme-toggle.jsx` | ✅ |
| 6 | `locale-toggle.jsx` | ✅ |
| 7 | `button.jsx` + `card.jsx` | ✅ |
| 8 | `index.html` | ✅ |
| 9 | `index.css` | ✅ |
| 10 | `tailwind.config.js` | ✅ |

**父代理**：Hero / TopNav / Download / 占位图 / 进度文档 — ✅

### Round 2（已完成）

- [x] `App.jsx` 拆分为 `src/components/sections/*`（~359 行路由壳）
- [x] ArchitectureDiagram 视觉升级
- [x] PolicyModal 提取与动效
- [x] FreeModelsCallout 玻璃卡片
- [x] FeatureScreenshotFrame 统一主图框
- [x] LazyImage LQIP 交叉淡入
- [x] VitePress CustomHome 样式对齐
- [x] Stats 区块（`stats-section.jsx` + 三语 `*Unit` keys）
- [x] Hero / TopNav 统一 `useScroll`（去重复 scroll listener）

### Round 3（已完成）

- [x] Hero 排版与预览指示器 / a11y — `a8b1282`
- [x] Feature sticky 桌面交叉淡入 — `144f9da`
- [x] Feature 移动端节奏与截图框统一 — `facb581`
- [x] Download 页 segmented control 与推荐卡片 — `9ca86f3`
- [x] FAQ 手风琴触控与过渡 — `2a38c4e`
- [x] Footer 社交图标与安全区 — `a96cf22`
- [x] Stats + Architecture 视觉衔接 — `2ed9344`
- [x] 深色模式导航控件对比度 — `a06449c`
- [x] 全站 safe-area 扫描 — `58cd363`
- [x] FAQ / footer / arch 文案第二轮 — `9b71e7c`

验收：`npm run build` 通过（Round 4 开始时复验），无重复组件定义，详细清单见 ROUND3.md。

### Round 4（已完成）

- [x] Hero LCP / 字体 preload（`b9e9231`）
- [x] Sticky feature 滚动性能（`ceb3ee9`）
- [x] FreeModels 微交互（`f3ee834`）
- [x] Theme / Locale toggle a11y（`afec727`）
- [x] PolicyModal ↔ Download chrome 对齐（`9a3f98c`）
- [x] VitePress Apple token 对齐（`bcd63d0`）
- [x] Feature 排版统一（`d8ed7dc`）
- [x] LazyImage 错误态对齐（`d1adb21`）
- [x] Landmarks + skip link（`e353cb0`）
- [x] 进度文档同步（`b732c80`）

### Round 5（进行中）

文案第三轮、动效一致性、移动端触控审计、文档站首页挂载评估。

- [x] Feature 移动端交错图文节奏：`ScrollRevealItem` 子功能截图复用 `FeatureScreenshotFrame`（圆角/描边/阴影与主图一致），`ImagePlaceholder` 圆角对齐 `rounded-[6px]`，移动端项内 `gap-5` / 项间 `space-y-[3.5rem]` 收紧节奏
- [x] ROUND4 验收清单回填：ROUND4.md 补记 10 路提交号与验收结果（build 复验通过、无 slate 硬编码回流）

## 待办（后续轮次）

- [ ] 将 `App.jsx` 拆分为独立 section 组件
- [ ] ArchitectureDiagram 视觉升级
- [ ] Download 页平台卡片与推荐逻辑 UX
- [ ] Feature sticky scroll 性能与移动端体验
- [ ] 占位图组件统一（缺失截图）
- [ ] 深色模式对比度审计
- [ ] 文档站 VitePress 主题对齐官网

## PR 列表

| PR | 分支 | 状态 |
|----|------|------|
| [#6](https://github.com/BA7MLV/ds-web/pull/6) | `cursor/apple-ui-optimization-36c9` | Round 1 进行中 |

### Round 1 子代理完成项

- [x] zh / en / zh-Hant 文案人性化
- [x] mobile-nav-menu Apple 级动效
- [x] theme-toggle / locale-toggle 微交互
- [x] button / card  primitives
- [x] index.html meta 与 SEO
- [x] index.css typography utilities
- [x] tailwind Apple keyframes
