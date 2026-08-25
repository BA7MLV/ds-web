# Round 5 — 文案、动效一致性与多端触控

## 目标

在性能与 a11y 底座之上，继续压低「AI 腔」与交互不一致，强化多端触控与文档站体验。

## 本轮 10 路

1. Hero / freeModels / stats 文案第三轮（zh）
2. 对应 en / zh-Hant 同步
3. Architecture 卡片与连接线再打磨
4. Sticky feature 移动端 fallback 触控
5. Download 页空态 / 无推荐态文案与布局
6. TopNav 滚动时阴影/模糊微增强
7. Footer 链接与版权国际化遗漏扫一遍
8. VitePress 评估挂载 CustomHome 或对齐 index.md
9. 全站 `active:scale` / hover-lift reduced-motion 复审
10. 进度与 ROUND4 验收清单回填

## 验收

- build 通过
- 三语 key 同步
- PROGRESS 更新

## 验收结果（已完成）

10 路全部落地，每路独立提交：

1. Hero / freeModels / stats 文案第三轮（zh） — `9f9d3d1`
2. 对应 en / zh-Hant 同步 — `8424af2`
3. Architecture 卡片与连接线再打磨 — `9efdfee`
4. Sticky feature 移动端 fallback 触控 — `669dab0`
5. Download 页空态 / 无推荐态文案与布局 — `8a88256`
6. TopNav 滚动时阴影/模糊微增强 — `cf82c18`
7. Footer 链接与版权国际化遗漏扫一遍 — `b3f8a43`
8. VitePress 评估挂载 CustomHome 或对齐 index.md — `c8fda15`
9. 全站 `active:scale` / hover-lift reduced-motion 复审 — `1a17f9c`
10. 进度与 ROUND4 验收清单回填 — `022983f`

补充修复：Apple shadow token 改用 box-shadow 任意值写法 — `5493829` / `b35a8a9`

- [x] build 通过（Round 6 回填时复验 `npm run build`，vite + vitepress 均无错误）
- [x] 三语 key 同步（zh / en / zh-Hant 各 305 键，逐键比对无缺漏）
- [x] PROGRESS 已更新（`cac866c` 关闭 Round 5 并开启 Round 6）
