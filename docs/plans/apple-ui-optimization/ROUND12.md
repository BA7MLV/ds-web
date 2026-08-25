# Round 12 — 死 primitive、离线提示 i18n 与交互扫尾

## 目标

清理仍无引用的 UI primitive，把离线 Toast 硬编码文案三语化并补 a11y，继续键盘/触控与文案第九轮。

## 本轮 10 路

1. 审计并删除无引用的 `src/components/ui/button.jsx`（确认零 import；Hero 等已用 `btn-apple`）
2. 审计并删除无引用的 `src/components/ui/card.jsx`（确认零 import）
3. Network 离线/恢复 Toast：硬编码中文 → 三语 i18n；`role="status"`/`aria-live`；图标 `aria-hidden`；Apple shadow token（勿用裸 `shadow-lg`）
4. Mobile nav：焦点陷阱 / Escape / 关闭后焦点回到汉堡按钮再验与加固
5. Download segmented control：键盘方向键 / roving tabindex
6. Architecture 装饰 SVG：`aria-hidden` / 标题关联；深色节点对比微打磨
7. LazyImage 错误/离线占位：重试按钮触控 44px + focus-ring 再验
8. zh 文案第九轮：`architecture.*` / `faq.subtitle` 周边与 agent 芯片短标签去腔
9. en / zh-Hant 同步本轮 copy（含 network.* 新 key）
10. ROUND11 验收最终核对 + PROGRESS 关闭 Round 11 / 开启本轮记录

## 验收

- build 通过
- 无未使用 button/card primitive（或注明仍有引用而保留）
- Network toast 无硬编码用户可见中文
- 三语 key 对齐
- PROGRESS 更新
