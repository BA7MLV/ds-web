# Round 17 — 视觉 QA 缺口、下载流与文案第十四轮

## 目标

补齐剩余视觉/交互微缺口，打磨下载页流程文案与控件，继续文案第十四轮。

## 本轮 10 路

1. Download 页返回首页按钮：触控 44px + focus-ring 再验
2. Download 卡片 CTA：深色 active/pressed 态再验
3. PolicyModal 标题层级与 FAQ 标题尺度再对齐
4. Mobile nav 打开态滚动锁定在 iOS 橡皮筋再验（小改）
5. Architecture 连接线 / 箭头深色可见性再验
6. LazyImage LQIP 淡入与 reduced-motion 再验
7. VitePress doc 正文字号 / 行高与营销页阅读节奏轻量对齐
8. zh 文案第十四轮：`download.selectPlatform` / `download.backHome` / `download.allReleases` 等短标签再压
9. en / zh-Hant 同步本轮 copy
10. ROUND16 验收最终核对 + PROGRESS 关闭 Round 16 / 开启本轮记录

## 验收

- build 通过
- 三语 key 对齐
- PROGRESS 更新

## 验收结果（已完成）

10/10 全部落地。

| # | 事项 | 状态 | SHA |
|---|------|------|-----|
| 1 | Download 回首页触控 | ✅ | `fc3f215` |
| 2 | Download CTA 深色 pressed | ✅ | `5fea3cc` |
| 3 | PolicyModal 标题尺度 | ✅ | `3d0b9ef` |
| 4 | Mobile nav iOS 滚动锁 | ✅ | `5fa2d01` |
| 5 | Architecture 箭头深色可见性 | ✅ | `b06736c` |
| 6 | LazyImage LQIP / reduced-motion | ✅ | `e2a7ea8` |
| 7 | VitePress 正文字号行高 | ✅ | `4b583be` |
| 8 | zh download 短标签第十四轮 | ✅ | `0db6566` |
| 9 | en / zh-Hant 同步短标签 | ✅ | `a36c4d6` |
| 10 | ROUND16 验收 + PROGRESS / 本轮关闭 | ✅ | 见本提交 |

补充：三语 329 keys；`npm run build` 复验通过。
