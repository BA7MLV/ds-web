# Apple 级 UI/UX 优化进度

> 分支：`cursor/apple-ui-optimization-36c9` · 基线：`dev` · 目标：Apple 级视觉、交互与文案品质，多端适配

## 总体目标

- 视觉：玻璃态、留白、字体层级、阴影与动效对齐 Apple 官网质感
- 交互：滚动叙事、粘性区块、安全区、减少动效偏好
- 文案：有人味、具体、避免 AI 腔（aislop）
- 工程：组件化拆分、性能与可访问性

## 轮次记录

### Round 1（进行中）

**子代理分工（10 路并行）**

| # | 范围 | 任务 |
|---|------|------|
| 1 | `src/locales/zh.json` | Hero/功能标题与副文案人性化重写 |
| 2 | `src/locales/en.json` | 英文文案 Apple 风格、自然口语 |
| 3 | `src/locales/zh-Hant.json` | 与简体策略对齐的繁体文案 |
| 4 | `src/components/mobile-nav-menu.jsx` | 全屏菜单动效与层级 |
| 5 | `src/components/theme-toggle.jsx` | 切换动效与 a11y |
| 6 | `src/components/locale-toggle.jsx` | 语言切换 UX |
| 7 | `src/components/ui/button.jsx` + `card.jsx` | 设计令牌统一 |
| 8 | `index.html` | 字体、meta、预加载优化 |
| 9 | `src/index.css` | 设计系统 token 与 utility 扩展 |
| 10 | `tailwind.config.js` | 动效 keyframes 扩展 |

**父代理**

- Hero CTA、下载页、FAQ、Footer、`App.jsx` 关键区块打磨
- 进度文档与 PR 维护

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
| （待创建） | `cursor/apple-ui-optimization-36c9` | 进行中 |
