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

### Round 5（已完成）

- [x] zh hero/freeModels/stats 文案第三轮（`9f9d3d1`）
- [x] en / zh-Hant 同步（`8424af2`）
- [x] Architecture 玻璃态与连接线（`9efdfee`）
- [x] Sticky 移动端 fallback 触控（`669dab0`）
- [x] Download 空态/回退（`8a88256`）
- [x] TopNav 滚动 chrome（`cf82c18`）
- [x] Footer i18n / aria（`b3f8a43`）
- [x] Docs home `.doc-hero` 对齐（`c8fda15`）
- [x] reduced-motion 全站审计（`1a17f9c`）
- [x] ROUND4 验收回填（`022983f`）
- [x] Apple shadow token 修复（`5493829` / `b35a8a9`）

### Round 6（已完成）

- [x] 按钮体系统一（`4e1e831`）
- [x] focus-ring 扫描（`1387a5b`）
- [x] 截图框阴影对齐（`365fa3c`）+ `--apple-shadow-2xl`（`33df97d`）
- [x] Architecture 深色对比度（`d82f97b`）
- [x] Download 分段深色（`eb7e719`）
- [x] Nav 品牌节奏（`146a6d7`）+ lg 断点修复（`24470f8`）
- [x] FAQ / Policy 标题尺度（`5c2dc7a`）
- [x] 占位图状态 i18n（`cafa084`）
- [x] Docs doc-hero 间距（`adc7150`）
- [x] ROUND5 验收回填（`b07ba3a`）

### Round 7（已完成）

平板断点体验、主题切换进移动菜单、性能与文案第四轮。

- [x] 移动菜单 ThemeToggle + LocaleToggle（`d4b9e6d`）
- [x] Hero GitHub / preview i18n（随 `d4b9e6d`）
- [x] Feature 滚动性能（`17f9865`）
- [x] Stats 入场动画（`b60773a`）
- [x] Download CTA 对齐 btn-apple（`cd89b56`）
- [x] FAQ disclosure a11y（`3e50492`）
- [x] zh feature.*.desc 第四轮（`58848b7` / 内容于 `7dac8f7`）
- [x] en / zh-Hant feature 同步（`b5f8ee3`）
- [x] VitePress 侧栏 Apple token（`5fdd25a`）
- [x] ROUND6 验收回填（`7dac8f7`）

验收：`npm run build` 于 `b5f8ee3` 通过；三语 317 keys；详见 ROUND7.md。

### Round 8（已完成）

i18n 扫尾、资源宽高比、平板/深色微打磨与文档站再对齐。详见 ROUND8.md。

- [x] `useImageLoader` 错误/重试文案三语 i18n（`3dcce44`）
- [x] TopNav / Footer / 移动菜单 GitHub 标签 i18n（`1827ae3`）
- [x] ModeSwitchPanel 使用审计（`548faca`）
- [x] 截图资源 aspect-ratio 核对（`77d4660`）
- [x] 平板菜单打开态二次打磨（`6fa27c0`）
- [x] FreeModels + Stats 深色微对比（`2ccce33`）
- [x] FAQ / Architecture zh 文案第五轮（`cab1907`）
- [x] en / zh-Hant 同步（`c01196e`）
- [x] VitePress 搜索框 / nav token 再对齐（`58b8e82`）
- [x] ROUND7 验收核对 + 视觉 QA 记录（随本轮验收文档落地；截图留作本地 artifacts 不入仓）

验收：10/10 落地（含 VitePress 搜索 `58b8e82`）；详见 ROUND8.md。

### Round 9（进行中）

死代码清理、locale 加载警告、文档站与 a11y/文案再打磨。详见 ROUND9.md。Round 8 #9 VitePress 搜索若未落地则作为本轮 #1 收尾。

## 待办（后续轮次）

- [ ] 删除无用 `switch.jsx`
- [ ] locale 动静态 import 警告
- [ ] CustomHome / landmarks / Download 深色 / Footer a11y
- [ ] download/policy 文案第六轮 + 三语同步
- [ ] 持续多轮至 ≥20（用户未叫停前不停止）

## PR 列表

| PR | 分支 | 状态 |
|----|------|------|
| [#6](https://github.com/BA7MLV/ds-web/pull/6) | `cursor/apple-ui-optimization-36c9` | Round 9 进行中 |

### Round 1 子代理完成项

- [x] zh / en / zh-Hant 文案人性化
- [x] mobile-nav-menu Apple 级动效
- [x] theme-toggle / locale-toggle 微交互
- [x] button / card  primitives
- [x] index.html meta 与 SEO
- [x] index.css typography utilities
- [x] tailwind Apple keyframes
