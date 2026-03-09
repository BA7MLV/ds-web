# Layout/CustomCSS SOTA Less-is-More Implementation TODO

> **For Claude / LLM:** REQUIRED MODE: 只做最小必要改动，逐项验证后再勾选；失败立即按回滚动作恢复。

**Goal:** 收敛 `docs/.vitepress/theme/Layout.vue` 与 `docs/.vitepress/theme/custom.css` 的重复与冲突样式，建立“单一样式来源（SSOT）”，降低 AI 味与维护成本。  
**Architecture:** `Layout.vue` 仅保留结构与 scoped 局部样式；全局主题样式统一放 `custom.css`；行为逻辑继续由 `index.js` 驱动（如 `home-no-search` 与 `medium-zoom`）。  
**Tech Stack:** VitePress + Vue SFC + custom.css + medium-zoom

---

## Scope & Guardrails

- [ ] 仅允许修改：
  - `docs/.vitepress/theme/Layout.vue`
  - `docs/.vitepress/theme/custom.css`
- [ ] 必须保留功能契约：
  - `html.home-no-search` 对首页搜索隐藏仍有效
  - `medium-zoom` 的 overlay / opened image 层级可用
  - 文档图片缩放交互仍正常（含 `no-zoom` / `data-no-zoom` 排除语义）
- [ ] 禁止事项：
  - 禁止新增视觉特效（动画、发光、复杂阴影）
  - 禁止引入新依赖
  - 禁止扩大无关改动范围
  - 禁止直接删除功能逻辑（只可删重复样式）

---

## Phase A — 重复/冲突样式收敛（核心）

### Task A1: 删除 Layout.vue 中重复的全局变量定义

- [ ] **Files**
  - Modify: `docs/.vitepress/theme/Layout.vue`（全局 `<style>` 中 `:root/.dark` 的 `--vp-c-brand-*`、`--vp-nav-logo-height`）
- [ ] **Action**
  - 删除与 `custom.css` 重复或冲突的变量定义，仅保留 `custom.css` 的变量来源。
- [ ] **Expected**
  - 品牌变量只在 `custom.css` 出现一个权威来源。

### Task A2: 删除 Layout.vue 中重复的图片样式

- [ ] **Files**
  - Modify: `docs/.vitepress/theme/Layout.vue`（`.vp-doc p/li/td > img` 及其媒体查询）
  - Keep: `docs/.vitepress/theme/custom.css`（该规则作为唯一来源）
- [ ] **Action**
  - 移除 Layout 中重复段，保留 `custom.css` 的统一图片规则。
- [ ] **Expected**
  - 图片样式（宽度/圆角/间距/cursor）只在 `custom.css` 定义一次。

### Task A3: medium-zoom 层级规则单点化

- [ ] **Files**
  - Modify: `docs/.vitepress/theme/Layout.vue`（删除 `.medium-zoom-*` 重复定义）
  - Keep/Adjust: `docs/.vitepress/theme/custom.css`（保留唯一 `.medium-zoom-overlay` 与 `.medium-zoom-image--opened` 定义）
- [ ] **Action**
  - 只保留一处 z-index 定义，默认不使用 `!important`。
  - 仅当验证发现层叠顺序无法解决冲突时，才最小化引入 `!important` 并注明原因。
- [ ] **Expected**
  - zoom 层级行为稳定，且无双份冲突定义。

### Task A4: Layout.vue 只保留结构与 scoped 样式

- [ ] **Files**
  - Modify: `docs/.vitepress/theme/Layout.vue`
- [ ] **Action**
  - 保留 `<template>` 插槽结构与 `<style scoped>`（如 `.NavScreenLang`）。
  - 全局 `<style>` 要么清空，要么仅保留暂无法迁移且有充分理由的最小规则。
- [ ] **Expected**
  - Layout 职责清晰：结构层，不承载全局主题体系。

---

## Phase B — 功能回归验证（必须逐项通过）

### Task B1: 诊断检查

- [ ] **Verify**
  - `lsp_diagnostics` on:
    - `docs/.vitepress/theme/Layout.vue`
    - `docs/.vitepress/theme/custom.css`
- [ ] **Pass Criteria**
  - 无 Error；若有 Warning，需解释且不引入新风险。

### Task B2: docs 构建验证

- [ ] **Verify**
  - `npm run build -w docs`
- [ ] **Pass Criteria**
  - 构建成功；如遇仓库既有 dead links，需标注“既有问题”而非本次回归。

### Task B3: 交互与视觉验收（手动）

- [ ] **Checklist**
  - 首页：搜索框隐藏逻辑（`home-no-search`）符合预期
  - 文档页：图片可缩放，overlay 不被 nav/sidebar 遮挡
  - 深浅色：链接/品牌色/正文可读性一致
  - 侧边栏：若保留“常开策略”，行为与改造前一致；若决定回归默认，需在变更说明中明确

---

## Phase C — 失败回滚矩阵（文件级安全回滚）

### Task C1: 本次范围回滚（单步失败时执行）

- [ ] **Rollback Command (safe)**

```bash
git restore --source=HEAD --worktree --staged -- docs/.vitepress/theme/Layout.vue docs/.vitepress/theme/custom.css
```

- [ ] **Expected**
  - 两文件恢复到变更前状态；可重新分步实施。

### Task C2: 构建副作用文件回滚（如被构建脚本改写）

- [ ] **Rollback Command (safe)**

```bash
git restore --source=HEAD --worktree --staged -- docs/.vitepress/data/downloads.json src/data/downloads.json
```

- [ ] **Expected**
  - 清除构建脚本附带改动，保证提交范围纯净。

---

## Completion Definition (DoD)

- [ ] `Layout.vue` 不再与 `custom.css` 重复定义同类全局样式（变量/图片/zoom）。
- [ ] `custom.css` 成为唯一全局样式入口（最小必要规则）。
- [ ] 所有验证项通过（或明确记录既有问题）。
- [ ] 变更说明包含：删了什么、保留什么、为何符合 less is more。

---

## Markdown References (link-only)

- [Round 1/2 调研汇总参考](./2026-03-09-style-docs-convergence-todo.md)
- [既有优化任务参考](./2026-03-08-claude-code-optimization-todo.md)
- [VitePress: Customizing CSS](https://vitepress.dev/guide/extending-default-theme#customizing-css)
- [VitePress: Layout Slots](https://vitepress.dev/guide/extending-default-theme#layout-slots)
- [VitePress: Building a Layout](https://vitepress.dev/guide/custom-theme#building-a-layout)
- [VitePress: pageClass](https://vitepress.dev/reference/frontmatter-config#pageclass)
- [medium-zoom README](https://github.com/francoischalifour/medium-zoom/blob/1.1.0/README.md)
- [medium-zoom container docs](https://github.com/francoischalifour/medium-zoom/blob/1.1.0/docs/container.md)
- [MDN: !important](https://developer.mozilla.org/en-US/docs/Web/CSS/important)
- [MDN: Stacking context](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_positioned_layout/Understanding_z-index/Stacking_context)
