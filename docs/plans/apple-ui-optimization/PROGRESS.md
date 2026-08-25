# Apple 级 UI/UX 优化进度

> 分支：`cursor/apple-ui-optimization-36c9` · 基线：`dev` · 目标：Apple 级视觉、交互与文案品质，多端适配

## 总体目标

- 视觉：玻璃态、留白、字体层级、阴影与动效对齐 Apple 官网质感
- 交互：滚动叙事、粘性区块、安全区、减少动效偏好
- 文案：有人味、具体、避免 AI 腔（aislop）
- 工程：组件化拆分、性能与可访问性

## 轮次记录

### Round 1（已完成）

**子代理分工（10 路并行）— 全部落地**

| # | 范围 | 状态 |
|---|------|------|
| 1 | `zh.json` 文案 | ✅ |
| 2 | `en.json` 文案 | ✅ |
| 3 | `zh-Hant.json` 文案 | ✅ |
| 4 | `mobile-nav-menu.jsx` | ✅ |
| 5 | `theme-toggle.jsx` | ✅ |
| 6 | `locale-toggle.jsx` | ✅ |
| 7 | `button.jsx` + `card.jsx` | ✅ |
| 8 | `index.html` | ✅ |
| 9 | `index.css` | ✅ |
| 10 | `tailwind.config.js` | ✅ |

**父代理**：Hero / TopNav / Download / 占位图 / 进度文档 — ✅

### Round 2（进行中）

组件拆分与区块深化（10 路子代理并行）。

## 待办（后续轮次）

- [ ] 将 `App.jsx` 拆分为独立 section 组件
- [ ] ArchitectureDiagram 视觉升级
- [ ] Download 页平台卡片与推荐逻辑 UX
- [ ] Feature sticky scroll 性能与移动端体验
- [ ] 占位图组件统一（缺失截图）
- [ ] 深色模式对比度审计
- [ ] 文档站 VitePress 主题对齐官网

## PR 列表

| PR | 分支 | 状态 |
|----|------|------|
| [#6](https://github.com/BA7MLV/ds-web/pull/6) | `cursor/apple-ui-optimization-36c9` | Round 1 进行中 |

### Round 1 子代理完成项

- [x] zh / en / zh-Hant 文案人性化
- [x] mobile-nav-menu Apple 级动效
- [x] theme-toggle / locale-toggle 微交互
- [x] button / card  primitives
- [x] index.html meta 与 SEO
- [x] index.css typography utilities
- [x] tailwind Apple keyframes
