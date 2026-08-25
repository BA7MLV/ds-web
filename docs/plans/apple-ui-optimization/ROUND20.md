# Round 20 — 里程碑收口与持续打磨

## 目标

达成 ≥20 轮里程碑：做一轮全站一致性收口与文案第十七轮，并为后续轮次留下清晰待办。

## 本轮 10 路

1. 全站 `focus-ring` 遗漏扫描（主要交互控件）小修
2. 深色模式卡片边框 `--apple-line` → `line-strong` 遗漏扫描（sections）
3. Hero 预览图 `OptimizedImage` 与 preload 一致性再验
4. Download 分段 thumb 动画 reduced-motion 再验
5. Mobile nav Theme/Locale 行间距与触控再验
6. VitePress 侧栏当前页指示器对比再验
7. ROUND1–19 进度文档交叉核对（SHA 是否可检索；仅文档）
8. zh 文案第十七轮：`hero.headline.*` 支撑句若有 / `freeModels.title` / `freeModels.desc` 再压
9. en / zh-Hant 同步本轮 copy
10. ROUND19 验收最终核对 + PROGRESS 关闭 Round 19 / 标记 ≥20 里程碑 / 开启 Round 21 计划骨架

## 验收

- build 通过
- 三语 key 对齐
- PROGRESS 标明已达 ≥20 轮并继续

## 第 7 路结果：ROUND1–19 SHA 交叉核对

- 扫描范围：`docs/plans/apple-ui-optimization/ROUND*.md` + `PROGRESS.md`
- 提取到 172 个唯一 commit SHA，逐一经 `git cat-file -e <sha>^{commit}` 验证均可检索，
  且均为当前分支 HEAD 的祖先（`git merge-base --is-ancestor` 全部通过）
- 未发现 SHA 笔误，无需修订 —— 结果：clean
