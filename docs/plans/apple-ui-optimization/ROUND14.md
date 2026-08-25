# Round 14 — 视觉节奏、占位图与文案第十一轮

## 目标

在控件 a11y 基本稳住后，收紧区块节奏与占位图体验，推进文案第十一轮，并核对遗留工程卫生。

## 本轮 10 路

1. Hero 首屏节奏：CTA 组与预览区垂直间距 / 小屏裁切再验（勿塞入次要营销内容）
2. FreeModels + Stats 区块衔接留白与深色分割线再验
3. Feature sticky 进度指示（若有）或移动 fallback 标题节奏微打磨
4. Download 推荐卡：推荐徽章对比度 + focus-ring
5. FAQ 手风琴打开态深色边框 / 内容间距再验
6. `index.html` / meta / OG 与品牌表述一致性轻量核对
7. 工程卫生：确认无残留 `shadow-[var(--apple-shadow`；扫描未跟踪大图不入仓
8. zh 文案第十一轮：`hero.preview.*` / `hero.cta.*` / `hero.github` 去腔压缩
9. en / zh-Hant 同步本轮 copy
10. ROUND13 验收最终核对 + PROGRESS 关闭 Round 13 / 开启本轮记录

## 验收

- build 通过
- 三语 key 对齐
- 无错误 Apple shadow 任意类残留
- PROGRESS 更新

## 验收结果（已完成）

10/10 全部落地（含两项审计无代码变更）。

| # | 事项 | 状态 | SHA |
|---|------|------|-----|
| 1 | Hero 首屏节奏 | ✅ | `b93760e` |
| 2 | FreeModels + Stats 衔接留白 | ✅ | `9afde4a` |
| 3 | Feature sticky / 移动标题节奏 | ✅ | `847b01b` |
| 4 | Download 推荐卡对比度 / focus | ✅ | `da70fb0` |
| 5 | FAQ 打开态深色边框 / 间距 | ✅ | `30ae6df` |
| 6 | index.html meta / OG 品牌核对 | ✅ 无需改动 | — |
| 7 | Apple shadow 任意类残留扫描 | ✅ 代码零残留 | — |
| 8 | zh hero preview 文案第十一轮 | ✅ | `5d9bea3` |
| 9 | en / zh-Hant 同步 | ✅ | `31adbd3` |
| 10 | ROUND13 验收 + PROGRESS / 本轮关闭 | ✅ | 见本提交 |

补充：未跟踪 webp / verification 仍不入仓；`apple-touch-icon.png` 缺失记入后续轮次；`npm run build` 复验通过。
