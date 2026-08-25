# Round 6 — 视觉回归与体系统一

## 目标

在 Round 5 修复影子 token / reduced-motion 之后，统一按钮与焦点体系，做深色模式二次审计，并收紧占位图与性能细节。

## 本轮 10 路

1. 统一 btn-apple / Button 组件与 Hero CTA 用法
2. focus-ring 全站二次核对（深色已修，扫遗漏）
3. FeatureScreenshotFrame 与 sticky 桌面层阴影再对齐（新 box-shadow 写法）
4. Architecture 深色模式卡片对比度
5. Download segmented control 深色 thumb 再验
6. Mobile nav 与 TopNav 品牌字距一致性
7. FAQ / Policy 标题字号与 Feature 对齐
8. 占位图 Offline/error 文案三语补齐
9. VitePress doc-hero 与 Layout nav 间距
10. ROUND5 验收清单 + PROGRESS 回填

## 验收

- build 通过
- 无 `shadow-[var(--apple-shadow` 残留
- 进度写入 PROGRESS

## 验收结果（已完成）

10 路全部落地，每路独立提交：

1. 统一 btn-apple / Button 组件与 Hero CTA 用法 — `4e1e831`
2. focus-ring 全站二次核对（深色已修，扫遗漏） — `1387a5b`
3. FeatureScreenshotFrame 与 sticky 桌面层阴影再对齐（新 box-shadow 写法） — `365fa3c`
4. Architecture 深色模式卡片对比度 — `d82f97b`
5. Download segmented control 深色 thumb 再验 — `eb7e719`
6. Mobile nav 与 TopNav 品牌字距一致性 — `146a6d7`
7. FAQ / Policy 标题字号与 Feature 对齐 — `5c2dc7a`
8. 占位图 Offline/error 文案三语补齐 — `cafa084`
9. VitePress doc-hero 与 Layout nav 间距 — `adc7150`
10. ROUND5 验收清单 + PROGRESS 回填 — `b07ba3a`

补充修复：hover-lift 缺失的 `--apple-shadow-2xl` token 定义 — `33df97d`；汉堡按钮显示断点收至 lg，与桌面链接断点一致 — `24470f8`

- [x] build 通过（Round 7 回填时于 `c9b7050` 干净 worktree 复验 `npm run build`，vite + vitepress 均无错误，仅既有 chunk-size 提示）
- [x] 无 `shadow-[var(--apple-shadow` 残留（全库检索仅本文件验收条目自身命中，src / docs 代码零残留）
- [x] 进度写入 PROGRESS（`c9b7050` 关闭 Round 6 并开启 Round 7，10 路提交号已核对一致）
