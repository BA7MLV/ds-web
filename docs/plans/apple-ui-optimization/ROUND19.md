# Round 19 — 深色细节、FAQ/Footer 与文案第十六轮

## 目标

继续深色细节与页脚/FAQ 微打磨，推进文案第十六轮，逼近 ≥20 轮目标。

## 本轮 10 路

1. TopNav 深色半透明背景与边框在滚动阈值再验
2. Hero 主 CTA（立即下载）深色 pressed 与 focus 再验
3. FAQ 答案内链/按钮间距与触控再验
4. Footer 版权行与社交行小屏换行节奏
5. PolicyModal 关闭按钮 44px 触控再验
6. Docs VitePress 首页/关于页品牌句与 marketing 一致轻量核对
7. `scripts/generate-favicons.mjs` 与 touch-icon 产物路径注释再对齐（若仍漂移）
8. zh 文案第十六轮：`faq.openSource.*` / `faq.privacy.*` / `faq.macosQuarantine.*` 问答再压
9. en / zh-Hant 同步本轮 copy
10. ROUND18 验收最终核对 + PROGRESS 关闭 Round 18 / 开启本轮记录

## 验收

- build 通过
- 三语 key 对齐
- PROGRESS 更新

## 验收结果（已完成）

10/10 全部落地。

| # | 事项 | 状态 | SHA |
|---|------|------|-----|
| 1 | TopNav 深色滚动 chrome | ✅ | `66fd502` |
| 2 | Hero 主 CTA 深色 pressed | ✅ | `f04e397` |
| 3 | FAQ 答案间距 / 触控 | ✅ | `d693e85` |
| 4 | Footer 小屏换行节奏 | ✅ | `518baeb` |
| 5 | PolicyModal 关闭触控 | ✅ | `39c37b3` |
| 6 | Docs about 品牌句对齐 | ✅ | `c2f22cf` |
| 7 | favicon 脚本默认源路径 | ✅ | `2d4ffd1` |
| 8 | zh FAQ 文案第十六轮 | ✅ | `dc53f9a` |
| 9 | en / zh-Hant 同步 FAQ | ✅ | `2e3dc1f` |
| 10 | ROUND18 验收 + PROGRESS / 本轮关闭 | ✅ | 见本提交 |

补充：三语 329 keys；`npm run build` 复验通过。
