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
