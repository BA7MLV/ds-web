# Round 1 — Apple UI 优化

## 本轮目标

建立优化基础设施，并完成首波可见改进：导航、Hero、下载页、占位图、设计令牌。

## 已完成（父代理）

- **TopNav**：安全区、`--apple-nav-*` 令牌、桌面端主题/语言切换
- **Hero**：响应式标题、`了解更多` 次级 CTA、GitHub 文字链、预览指示点、产品图阴影框
- **Download**：推荐卡片高亮、语言切换、`hover-lift`
- **ImagePlaceholder**：渐变 + skeleton 精致占位
- **index.css**：`btn-apple-*`、排版 utility、`hover-lift` reduced-motion

## 子代理任务（10 路）

见 `PROGRESS.md` Round 1 表；完成后合并 commit。

## 下一轮（Round 2）计划

1. 拆分 `App.jsx` → `src/components/sections/*`
2. ArchitectureDiagram 视觉升级
3. Feature sticky scroll 移动端审计
4. Stats 区块 Apple 数字叙事
5. VitePress 主题与官网对齐
