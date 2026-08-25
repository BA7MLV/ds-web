# Round 7 — 平板断点、移动菜单能力与文案第四轮

## 目标

补齐 Round 6 发现的平板/主题缺口，并继续压文案与微交互。

## 本轮 10 路

1. 移动菜单内嵌 ThemeToggle + LocaleToggle（平板断点可用）
2. Hero 中文 GitHub 链走 i18n
3. Feature 区块滚动性能二次核对（长页）
4. Stats 数字动画/入场再打磨
5. Download CTA 与 btn-apple 最终对齐复查
6. FAQ 键盘操作（Enter/Space 已有 details 原生，补提示文案可选）
7. 文案第四轮：feature.*.desc 再压缩（zh）
8. en / zh-Hant 同步 feature 描述
9. VitePress 侧栏与 brand token 再对齐
10. ROUND6 验收清单回填

## 验收

- build 通过
- 768–1024 有汉堡且菜单内可切主题/语言
- PROGRESS 更新

## 验收结果（已完成）

10 路全部落地（并行共享 worktree 下部分提交被合并进兄弟提交，内容均在 HEAD）：

1. 移动菜单内嵌 ThemeToggle + LocaleToggle — `d4b9e6d`（含 `nav.menu.appearance` / `nav.menu.language`；focus trap 排除 `tabindex="-1"`）
2. Hero GitHub / preview hint / imageAlt 走三语 i18n — 内容随 `d4b9e6d` 一并落地（无独立 commit；`hero.github` / `hero.preview.*`）
3. Feature 区块滚动性能二次核对 — `17f9865`
4. Stats 数字动画/入场再打磨 — `b60773a`
5. Download CTA 与 btn-apple 最终对齐复查 — `cd89b56`
6. FAQ disclosure a11y（`aria-expanded` / `aria-controls` / region）— `3e50492`
7. 文案第四轮 feature.*.desc（zh）— 内容在 `7dac8f7`，书签提交 `58848b7`
8. en / zh-Hant 同步 feature 描述 — `b5f8ee3`
9. VitePress 侧栏与 brand token 再对齐 — `5fdd25a`
10. ROUND6 验收清单回填 — `7dac8f7`

- [x] build 通过（Round 7 收尾于 `b5f8ee3` 复验 `npm run build`：vite + vitepress 均无错误；三语 locale 各 317 key 对齐）
- [x] 768–1024 有汉堡且菜单内可切主题/语言（`lg:hidden` 汉堡 + 菜单内 ThemeToggle / LocaleToggle，`d4b9e6d`）
- [x] PROGRESS 更新
