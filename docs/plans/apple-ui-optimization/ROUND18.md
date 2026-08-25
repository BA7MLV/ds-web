# Round 18 — 收口一致性、性能复核与文案第十五轮

## 目标

对营销页与文档站做一致性收口，复核构建体积，推进文案第十五轮，为后续轮次留清爽基线。

## 本轮 10 路

1. 营销页 → 文档站导航跳转：新开页 / 同页行为与 focus 丢失再验
2. FreeModels SiliconFlow 外链：`rel`/`target` 与 focus 再验
3. Footer 社交外链：`rel="noopener noreferrer"` 一致性扫描
4. 构建体积快扫：对比 Round 10 预算笔记，记录主包 gzip 变化（写进 ROUND18 验收，勿大改架构）
5. 深色模式 `--apple-ink-secondary` 使用点对比抽查（Hero/Feature/FAQ）
6. 键盘整页 Tab 顺序烟雾：Skip → Nav → Hero CTA → 主内容（记录缺口，能修则小修）
7. `public/` 资产命名空格 URL 编码（SiliconFlow logo）一致性注释或别名轻量处理
8. zh 文案第十五轮：`stats.title` / `stats.subtitle` / `stats.*Desc` 再压
9. en / zh-Hant 同步本轮 copy
10. ROUND17 验收最终核对 + PROGRESS 关闭 Round 17 / 开启本轮记录

## Tab 顺序烟雾

Skip → Nav → Hero CTA → 主内容 全链路复核，无缺口，无需修改：

- `.skip-link` 是 DOM 首个可聚焦元素（`App.jsx`），聚焦时以 fixed 定位浮出（`index.css`），指向 `#main-content`（`tabIndex={-1}` + `scroll-mt` 避开 sticky nav）。
- `TopNav` 紧随其后：品牌 → 功能 / 常见问答 / 文档 / GitHub / 下载 → 主题与语言切换 → 移动端菜单，与视觉顺序一致。
- Hero 文案列的 `order-2 lg:order-1` 只重排无焦点元素的图片列，CTA（下载 / 了解功能）Tab 顺序与阅读顺序一致；预览 tablist 走 roving tabindex，仅占一个 Tab 位。
- `src/` 全量扫描无正值 `tabIndex`；SEO fallback（`#ds-seo-fallback`）在 JS 环境下 `display: none`，不占焦点。

## 验收

- build 通过
- 三语 key 对齐
- PROGRESS 更新（含体积快扫数字）

## 构建体积快扫

Round 18 复核（`npm run build`，vite 7.2.4，gzip 后尺寸；对比 Round 10 预算笔记）：

- 主包 `index-*.js`：368.79 kB（gzip 110.98 kB）。Round 10 为 363.56 kB（gzip 109.78 kB），
  gzip +1.20 kB，来自 Round 11–17 的文案与组件小改，仍远在 gzip ≤ 150 kB 预算内，无需拆分。
- CSS `index-*.css`：82.46 kB（gzip 13.60 kB），对比 Round 10 的 13.32 kB 微增 0.28 kB，预算内。
- Locale chunk：`en-*.js` 21.68 kB（gzip 7.78 kB，Round 10 为 7.59 kB）、
  `zh-Hant-*.js` 20.66 kB（gzip 8.75 kB，Round 10 为 8.53 kB），仍为按需懒加载独立 chunk。
- 结论：各产物较 Round 10 仅有 kB 级自然增长，预算充裕，本轮不做架构调整；
  build 期间同步的 `downloads.json` 已按惯例回滚，不随本项提交。
