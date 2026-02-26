# React 官网首页设计评审与可执行 TODO（DeepStudent）

> 范围：官网 React 首页（`/`）与下载视图（`/?view=download`）。
> 
> 目标：在不推翻现有 Apple-like glass 风格的前提下，提升“信息层级清晰度、可信度、可访问性、性能观感与一致性”。

## 调研轮次（4 轮）

1) **代码与结构摸底（Repo / 入口 / 组件树）**
- 入口：`src/main.jsx` 渲染 `src/App.jsx`。
- 关键模块：`TopNav`、`HeroSection`、`ArchitectureDiagram`、`FeatureSection`、`FaqSection`、`Footer`、`DownloadPage`。

2) **设计系统与样式体系审计（Token / Tailwind / UI primitives）**
- 全局 token：`src/index.css`（`--apple-*` + light/dark + 玻璃/噪点/背景）。
- Tailwind 配置：`tailwind.config.js`（darkMode=class、fade-in keyframes）。
- UI primitives：`src/components/ui/*`（`Button`、`Card`、Radix `Switch`），工具函数 `src/lib/utils.js`（`cn`）。

3) **运行态页面观感核验（Playwright + 截图 + a11y snapshot）**
- 本地启动：`npm run dev`（Vite 默认 5173；可用 `--port` 覆盖）。
- 截图/探针证据（长期回溯以仓库内「归档证据」为准；本机 `/tmp`、`/var/folders/...` 仅用于当时记录，不保证存在）：
  - 证据总表（含 a11y/UX probes）：`docs/plans/artifacts/2026-02-21-react-homepage-audit/playwright-evidence.md`
  - 首页（桌面浅色）：`docs/plans/artifacts/2026-02-21-react-homepage-audit/home-desktop-light.png`
  - 首页（桌面深色）：`docs/plans/artifacts/2026-02-21-react-homepage-audit/home-desktop-dark.png`
  - 下载视图（桌面浅色）：`docs/plans/artifacts/2026-02-21-react-homepage-audit/download-desktop-light.png`
  - 移动端（菜单打开）：`docs/plans/artifacts/2026-02-21-react-homepage-audit/home-mobile-menu-open.png`

4) **权威准则对标（可用性启发式 + WCAG 快速检查）**
- 视觉层级、IA 可找性、排版、响应式、对比度、键盘与焦点、错误提示、触控目标。
- 参考见文末「References」。

## 设计师评价（当前设计的“好”和“风险”）

### 做得很好的部分

- **品牌方向明确**：`src/index.css` 的 token 化做得扎实，light/dark 体系完整，玻璃质感统一。
- **信息架构完整**：导航（功能/QA/文档/下载）+ Hero 强转化 + 长页 feature narrative + FAQ + Footer 辅助信息，落地页结构齐。
- **可访问性有意识**：存在 `focus-ring` 体系、FAQ 用 `details/summary`，Policy modal 做了 focus trap 与 Escape。

### 主要风险（导致“看起来高级，但不一定更好用/更快”）

- **视觉噪音偏高**：Hero 大面积 blur/backdrop + aurora + 叠加纹理/噪点，会稀释信息层级，也会加重性能成本（尤其移动端）。
- **交互反馈时长偏慢**：很多 hover/transition 走 300–500ms，容易“高级但拖沓”。（交互反馈通常建议 ≤200ms）
- **一致性与可维护性压力**：大量非标准间距（如 `space-y-[6.854rem]`）、任意 z-index（如 `z-[10010]`、`z-[99999]`、`#root::before z-index:9999`）会让后续迭代很难保持统一。
- **深色模式对比度与混合模式不确定性**：`mix-blend-*` 与半透明背景在 dark 下更容易出现局部对比度不足或可读性波动。

---

## 可执行 TODO（给 LLM 逐项打勾）

> 规则：只有在“验收标准”和“验证方法”都满足，并补齐证据后，才能把 `- [ ]` 改成 `- [x]`。

### P0（高影响 / 影响可用性与可访问性）

- [x] **P0-01：建立统一的 z-index scale，消除任意超大 z-index**
  - 涉及：`src/App.jsx`（TopNav、MobileNavMenu）、`src/index.css`（`#root::before`）
  - 问题：不同层级使用 `z-[10010]`、`z-[99999]`、`9999`，后续新增弹层/导航很容易互相覆盖。
  - 修复：在 `src/index.css` 或单独 token 区声明 `--z-nav/--z-overlay/--z-modal/--z-noise`，并将 Tailwind arbitrary 替换为固定层级类（或集中常量）。
  - 验收：
    - [x] 导航、移动菜单、Policy modal、噪点层的叠放顺序可预测（写在注释/文档里）。
    - [x] 不再出现 `z-[99999]` 这类“赌数值”。
  - 叠放顺序（统一 scale）：`--z-noise=20` < `--z-nav=40` < `--z-overlay=50` < `--z-modal=60`。
  - 验证：
    - 移动菜单：`nav z-index=40`、`menu overlay z-index=50`（Playwright 脚本校验），且右上角关闭按钮可正常关闭。
    - Policy modal：打开后焦点落在关闭按钮（`aria-label=关闭弹窗`），`Escape` 可关闭（Playwright 脚本校验）。
  - Evidence:
    - 移动端菜单打开（叠层/触控）：`docs/plans/artifacts/2026-02-21-react-homepage-audit/home-mobile-menu-open.png`
    - Menu/Modal 行为探针（焦点/Escape/可关闭）：`docs/plans/artifacts/2026-02-21-react-homepage-audit/playwright-evidence.md`
  - References:
    - `tailwind.config.js`
    - `src/index.css`
    - `src/App.jsx`
    - `src/components/mobile-nav-menu.jsx`
    - `src/components/network-provider.jsx`
  - 参考：WCAG（焦点可见/键盘可用）+ 工程一致性约束。

- [x] **P0-02：Hero 可点击副文案（button）增加“可发现性”和“状态提示”**
  - 涉及：`src/App.jsx:1409` 附近（Hero subtext button）
  - 问题：副文案是 button，但视觉像段落；用户不一定知道可点击切换；可用性损失。
  - 修复：加入轻量的 affordance（如“点击切换”提示/小圆点指示/当前项标签），并保证键盘操作与读屏文本清晰。
  - 验收：
    - [x] 纯视觉用户能在 3 秒内意识到它可交互（无需说明文档）。
    - [x] 读屏能读出“当前第 N 项/共 M 项，可切换”。
  - 验证：键盘 Tab 可聚焦、Space 可切换；按钮 `aria-label` 会随当前项更新为“当前第 N 项 / 共 M 项，可切换”。
  - Evidence:
    - 首页首屏（含 dots + 计数 + “点击切换”提示）：`docs/plans/artifacts/2026-02-21-react-homepage-audit/home-desktop-light.png`
    - aria-label/文本探针（可读出“当前第 N 项/共 M 项，可切换”）：`docs/plans/artifacts/2026-02-21-react-homepage-audit/playwright-evidence.md`
  - References:
    - `src/App.jsx`
  - 参考：[Visual hierarchy](https://www.nngroup.com/articles/visual-hierarchy-ux-definition/)

- [x] **P0-03：对比度抽检 + 修复（浅色/深色都覆盖）**
  - 涉及：`src/index.css` token、Hero/导航/卡片/FAQ 文本（尤其 `--apple-muted` 在半透明背景上）。
  - 问题：半透明玻璃叠加背景时，实际对比度可能低于预期，暗色模式更明显。
  - 修复：对 `--apple-muted`、`--apple-line`、`--apple-card` 等做对比度校准（必要时拆分 “muted-1/muted-2”）。
  - 验收：
    - [x] 常规文本 ≥ 4.5:1；大字 ≥ 3:1（WCAG AA）。
    - [x] 深色/浅色都通过抽检（至少：TopNav、Hero、副标题、FAQ）。
  - 验证：Playwright 注入对比度探针（近似采样计算）并截图记录。
  - 记录值（抽检）：
    - 浅色：TopNav 链接 5.03:1；Hero 副文案 4.91:1；FAQ 描述 4.91:1
    - 深色：TopNav 链接 5.8:1；Hero 副文案 5.8:1；FAQ 描述 5.8:1
  - Evidence:
    - 首页首屏（浅/深）用于对比度抽检上下文：
      - `docs/plans/artifacts/2026-02-21-react-homepage-audit/home-desktop-light.png`
      - `docs/plans/artifacts/2026-02-21-react-homepage-audit/home-desktop-dark.png`
  - References:
    - `src/index.css`
    - `src/App.jsx`
    - `src/components/mobile-nav-menu.jsx`
  - 参考：[WCAG Contrast Minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum)

- [x] **P0-04：移动端触控目标最小尺寸与间距检查（尤其 hamburger / 小 icon）**
  - 涉及：`src/components/mobile-nav-menu.jsx`、`src/components/theme-toggle.jsx`
  - 问题：图标按钮若 < 24x24 或邻近过密，会误触。
  - 修复：统一 icon-only button 的 size（建议 40x40 的点击区域，视觉图标可小）并加 `aria-label`（已做但需抽检）。
  - 验收：
    - [x] 关键触控目标 ≥ 24x24 CSS px（或有足够间距）。
    - [x] 所有 icon-only button 都有清晰 aria-label。
  - 抽检记录（CSS px）：Hamburger 40x40；菜单关闭按钮 40x40；ThemeToggle 40x40。
  - Evidence:
    - 移动端菜单打开（含 hamburger/close 点击区域）：`docs/plans/artifacts/2026-02-21-react-homepage-audit/home-mobile-menu-open.png`
    - 下载视图（桌面浅色，含顶栏与版本号）：`docs/plans/artifacts/2026-02-21-react-homepage-audit/download-desktop-light.png`
  - References:
    - `src/components/mobile-nav-menu.jsx`
    - `src/components/theme-toggle.jsx`
  - 参考：[WCAG Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)

### P1（提升观感与转化的关键优化）

- [x] **P1-01：压低 Hero 背景特效的“视觉噪音”，让主 CTA 更突出**
  - 涉及：`src/App.jsx:1363` 附近（Hero 背景 aurora + blur + mix-blend）
  - 问题：氛围很强，但会抢层级；在移动端更易“糊成一片”。
  - 修复：
    - 限制 accent 色数量（每屏 1 个主强调色），减少紫/青同时出现。
    - 降低 `backdrop-blur-[60px]`，避免大面积 blur；将特效收敛到局部。
  - 验收：
    - [x] 眯眼/模糊测试下：H1 与“立即下载”仍是最强层级。
    - [x] 移动端首屏 CTA 不被背景干扰。
  - Evidence:
    - 首页首屏（桌面浅/深）：
      - `docs/plans/artifacts/2026-02-21-react-homepage-audit/home-desktop-light.png`
      - `docs/plans/artifacts/2026-02-21-react-homepage-audit/home-desktop-dark.png`
    - 移动端 CTA 可见性/无横向滚动探针：`docs/plans/artifacts/2026-02-21-react-homepage-audit/playwright-evidence.md`
  - References:
    - `src/App.jsx`
  - 参考：[Visual hierarchy](https://www.nngroup.com/articles/visual-hierarchy-ux-definition/)

- [x] **P1-02：统一交互反馈时长（hover/active/focus）到“快而稳”的节奏**
  - 涉及：`src/components/ui/button.jsx`、`src/components/ui/card.jsx`、`src/index.css`
  - 问题：`duration-300/500` 较多，hover lift 夸张且偏慢。
  - 修复：
    - 将交互反馈（hover/active）控制在 120–200ms；入场动画可稍长但需克制。
    - 动效仅用 `transform/opacity`（避免 layout/paint）。
  - 验收：
    - [x] hover/active 的主观“响应速度”明显提升。
    - [x] `prefers-reduced-motion` 下无多余动画。
  - 验证：Playwright 注入 probe 元素，读取 `transition-duration` / `transition-property` 并截图。
  - Evidence:
    - computed style spot-check（normal/reduced-motion）：`docs/plans/artifacts/2026-02-21-react-homepage-audit/playwright-evidence.md`
  - References:
    - `src/components/ui/button.jsx`
    - `src/components/ui/card.jsx`
    - `src/index.css`
  - 参考：`src/App.jsx` 的 `useResponsiveMotion` 已有基础。

- [x] **P1-03：把“魔法间距/尺寸”收敛为可复用的 spacing scale（减少维护成本）**
  - 涉及：`src/App.jsx`（大量 `*[x]rem`、`space-y-[...]`）
  - 问题：数字很精细但难复用；后续改版会变成“到处调参”。
  - 修复：
    - 引入 6–8 个语义 spacing token（如 `--space-hero`, `--space-section`, `--space-stack`），或用 Tailwind 预设 scale + 少量 `clamp()`。
  - 验收：
    - [x] 关键 section 间距来自统一体系（可在 diff 中一眼看出）。
  - Evidence:
    - 首页与下载视图整体间距观感（桌面）：
      - `docs/plans/artifacts/2026-02-21-react-homepage-audit/home-desktop-light.png`
      - `docs/plans/artifacts/2026-02-21-react-homepage-audit/download-desktop-light.png`
  - References:
    - `src/index.css`
    - `src/App.jsx`

- [x] **P1-04：标题使用 text-balance、正文使用 text-pretty 的一致策略**
  - 涉及：`src/App.jsx` 多个 heading/paragraph
  - 问题：当前只在部分场景加了 balance/pretty，整体排版“稳”的程度不均。
  - 修复：
    - Heading 默认加 `text-balance`；正文段落默认 `text-pretty`；数字型信息用 `tabular-nums`。
  - 验收：
    - [x] 英文长标题换行更自然；中文段落不出现难看的孤字/断行。
  - Evidence:
    - 首页首屏（桌面浅/深）：
      - `docs/plans/artifacts/2026-02-21-react-homepage-audit/home-desktop-light.png`
      - `docs/plans/artifacts/2026-02-21-react-homepage-audit/home-desktop-dark.png`
  - References:
    - `src/index.css`

- [x] **P1-05：FAQ 的信息密度与可扫读性优化（减少长页疲劳）**
  - 涉及：`src/App.jsx` 的 `FaqSection`
  - 问题：长页 Feature 很多，FAQ 需要更“收口”与“可扫”。
  - 修复：为 FAQ 加“分类/高频优先/搜索（可选）”，或在 summary 旁给简短摘要。
  - 验收：
    - [x] 用户在 30 秒内能定位到 macOS/隐私/配置模型等高频问题。
  - Evidence:
    - 首页（桌面浅/深）用于 FAQ 扫读性观感：
      - `docs/plans/artifacts/2026-02-21-react-homepage-audit/home-desktop-light.png`
      - `docs/plans/artifacts/2026-02-21-react-homepage-audit/home-desktop-dark.png`
  - References:
    - `src/App.jsx`

### P2（锦上添花 / 体验精修）

- [x] **P2-01：Selection（选中文本）使用 token，避免全局强黑白**
  - 涉及：`src/App.jsx:988`（`selection:bg-black selection:text-white`）
  - 问题：与 `src/index.css` 的 `--apple-selection-*` 冲突，暗色下可能突兀。
  - 修复：移除该处 selection 工具类，统一用 `src/index.css` 的 selection token。
  - Evidence:
    - 选中样式统一说明与验证：`docs/plans/artifacts/2026-02-21-react-homepage-audit/playwright-evidence.md`
  - References:
    - `src/App.jsx`
    - `src/index.css`

- [x] **P2-02：移动端菜单的滚动锁定方式做 a11y 复验**
  - 涉及：`src/components/mobile-nav-menu.jsx`
  - 问题：对 wheel/touchmove 全部 `preventDefault` 可能影响某些辅助技术；需复验“焦点陷阱/返回位置/可关闭性”。
  - 修复：确保打开菜单后焦点落在关闭按钮；关闭后焦点返回触发按钮；Esc 可关闭（若支持）。
  - 验收：
    - [x] 键盘导航不会“迷路”；关闭后滚动位置恢复准确。
  - 验证：打开菜单后 `document.activeElement` 为关闭按钮；`Escape` 关闭后焦点返回“打开菜单”。
  - Evidence:
    - Menu a11y 探针（dialog/focus/Escape）：`docs/plans/artifacts/2026-02-21-react-homepage-audit/playwright-evidence.md`
  - References:
    - `src/components/mobile-nav-menu.jsx`

- [x] **P2-03：Hero 预览图（大图）与后续大量截图的加载策略复核**
  - 涉及：`src/App.jsx`（`OptimizedImage`、HeroPreview、FeatureSection 图片）
  - 问题：长页图片多，移动端首屏与滚动性能风险。
  - 修复：
    - 首屏仅预加载 1 张；其余全部 lazy；必要时引入低质量占位（已有 lqip 工具）。
  - 验收：
    - [x] 首屏仅 1 张 `loading=eager` 且 `fetchpriority=high`；其余图片均为 `loading=lazy` / `fetchpriority=auto`。
    - [x] 移动端滚动不卡顿；网络慢时布局不跳（CLS 体感降低）。
  - 验证：Playwright 注入 probe 统计 `img[loading=eager]` 与 `img[fetchpriority=high]` 计数（light/dark）。
  - Evidence:
    - eager/highPriority 计数探针：`docs/plans/artifacts/2026-02-21-react-homepage-audit/playwright-evidence.md`
  - References:
    - `src/lib/image-loading.js`
    - `tests/image-loading-hints.test.js`
    - `src/App.jsx`
  - 参考：Vercel React 性能建议（bundle/渲染/水瀑）。

---

## 验证清单（执行 TODO 后必须跑）

- [x] 桌面：1440x900（浅/深）关键区域截图对比（Hero、Nav、FAQ、Footer）
  - Evidence:
    - 首页（桌面浅色）：`docs/plans/artifacts/2026-02-21-react-homepage-audit/home-desktop-light.png`
    - 首页（桌面深色）：`docs/plans/artifacts/2026-02-21-react-homepage-audit/home-desktop-dark.png`
    - 下载视图（桌面浅色）：`docs/plans/artifacts/2026-02-21-react-homepage-audit/download-desktop-light.png`

- [x] 移动：390x844（浅/深）首屏 CTA 可见，无横向滚动
  - Evidence:
    - CTA/h-scroll 探针（light + forced-dark）：`docs/plans/artifacts/2026-02-21-react-homepage-audit/playwright-evidence.md`

- [x] 键盘：Tab 顺序合理，焦点可见，Modal/Menu 可关闭
  - Evidence:
    - Menu（dialog/focus/Escape）：`docs/plans/artifacts/2026-02-21-react-homepage-audit/playwright-evidence.md`

- [x] 对比度：关键文本抽检达到 WCAG AA
  - Evidence:
    - 抽检记录见 P0-03（本文件内记录值 + 归档截图上下文）。

---

## 归档证据（仓库内，便于回溯/PR）

- `docs/plans/artifacts/2026-02-21-react-homepage-audit/playwright-evidence.md`
- `docs/plans/artifacts/2026-02-21-react-homepage-audit/home-desktop-light.png`
- `docs/plans/artifacts/2026-02-21-react-homepage-audit/home-desktop-dark.png`
- `docs/plans/artifacts/2026-02-21-react-homepage-audit/download-desktop-light.png`
- `docs/plans/artifacts/2026-02-21-react-homepage-audit/home-mobile-menu-open.png`

## 总结（影响范围与回归结果）

- 影响范围：React 官网首页（`/`）与下载视图（`/?view=download`）；涉及 Hero / 长页 Feature 图片加载提示、移动菜单 a11y 细节、全局 token（z-index/spacing/selection/text-wrap）与交互动效节奏。
- 回归检查：按本文件「验证清单」完成桌面/移动、浅/深色、键盘、对比度抽检；核心交互（菜单、Policy modal）保持可关闭且焦点不迷路。
- 质量门槛：
- `node --test`：通过（日志：`docs/plans/artifacts/2026-02-21-react-homepage-audit/verify/node-test.txt`；20/20）。
- `npm run lint -- --max-warnings=0`：通过（日志：`docs/plans/artifacts/2026-02-21-react-homepage-audit/verify/lint.txt`）。
- `npm run build`：通过（日志：`docs/plans/artifacts/2026-02-21-react-homepage-audit/verify/build.txt`；本次同步到 v0.9.15）。
- `npm run preview`：通过（冒烟：`/` 与 `/?view=download` 均 200；日志：`docs/plans/artifacts/2026-02-21-react-homepage-audit/verify/preview.txt`）。
    - 备注：仍有非阻塞 warning（baseline-browser-mapping 数据过旧；VitePress chunk size 提示）。
    - 机制说明：构建脚本会尝试同步更新 `docs/.vitepress/data/downloads.json` 与 `src/data/downloads.json`；当 GitHub latest release 暂无 assets 时，会保留上一份可用的缓存数据（避免写入空值）。

---

## References（引用链接，不贴全文）

### 项目内（.md）

- [README](../readme.md)
- [Docs Index](../index.md)
- [Docs Download](../download.md)
- [Feature Architecture](../feature-architecture.md)
- [计划模板示例：GitHub 下载加速 TODO](2026-02-20-github-cn-download-acceleration-todo.md)

### 外部规范

- [NNG: IA Study Guide](https://www.nngroup.com/articles/ia-study-guide/)
- [NNG: Visual Hierarchy](https://www.nngroup.com/articles/visual-hierarchy-ux-definition/)
- [MDN: Responsive Design](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)
- [WCAG: Contrast (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum)
- [WCAG: Use of Color](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html)
- [WCAG: Info and Relationships](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html)
- [WCAG: Keyboard](https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html)
- [WCAG: Focus Visible](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html)
- [WCAG: Error Identification](https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html)
- [WCAG: Target Size (Minimum)](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)
