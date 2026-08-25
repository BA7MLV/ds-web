# Round 4 — 性能、一致性与文档站

## 目标

在 Round 3 视觉打磨之后，收紧性能与跨面一致性，继续逼近 Apple 级体验。

## 本轮 10 路

1. Hero / 首屏 LCP：图片与字体加载复查
2. Feature sticky 滚动性能（passive / will-change）
3. FreeModelsCallout 微交互与 reduced-motion
4. ThemeToggle / LocaleToggle 跨页一致性
5. PolicyModal 与 Download 顶栏视觉对齐
6. VitePress Layout / CustomHome 再对齐官网 token
7. 功能区块标题字号与 FeatureSection 统一
8. 占位图 / LazyImage 错误态再对齐
9. 可访问性：跳过链接、landmark、heading 层级扫一遍
10. 进度文档与 ROUND3 验收清单更新

## 验收

- build 通过
- 无 slate 硬编码回流
- 进度写入 PROGRESS.md

## 验收结果（已完成）

10 路全部落地，每路独立提交：

1. Hero / 首屏 LCP：图片与字体加载复查 — `b9e9231`
2. Feature sticky 滚动性能（passive / will-change） — `ceb3ee9`
3. FreeModelsCallout 微交互与 reduced-motion — `f3ee834`
4. ThemeToggle / LocaleToggle 跨页一致性 — `afec727`
5. PolicyModal 与 Download 顶栏视觉对齐 — `9a3f98c`
6. VitePress Layout / CustomHome 再对齐官网 token — `bcd63d0`
7. 功能区块标题字号与 FeatureSection 统一 — `d8ed7dc`
8. 占位图 / LazyImage 错误态再对齐 — `d1adb21`
9. 可访问性：跳过链接、landmark、heading 层级 — `e353cb0`
10. 进度文档与 ROUND3 验收清单更新 — `b732c80`

- [x] build 通过（Round 5 回填时复验 `npm run build`）
- [x] 无 slate 硬编码回流（`src/` 扫描无 `*-slate-*` 色类）
- [x] 进度已写入 PROGRESS.md
