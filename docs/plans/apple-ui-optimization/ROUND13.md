# Round 13 — 控件焦点、下载文案与文档站扫尾

## 目标

继续控件级焦点/触控一致性，压缩仍偏硬的下载页文案，并对齐文档站与截图框细节。

## 本轮 10 路

1. ThemeToggle：深色对比 + focus-ring + 44px 触控再验
2. LocaleToggle：深色对比 + 键盘 / roving tabindex 再验
3. Hero 预览指示器：触控目标与键盘左右切换再验
4. Footer 链接行：小屏间距、focus-ring、safe-area 再验
5. PolicyModal：Escape / 焦点返回 / 滚动锁定再验（小改即可）
6. FeatureScreenshotFrame：加载/错误 chrome 与 Apple 阴影 token 再对齐
7. VitePress Layout / 侧栏：深色 active 态与 `--apple-*` 间距微打磨
8. zh 文案第十轮：`download.description.*` / `download.emptyTab.*` / `download.note.*` 去腔压缩
9. en / zh-Hant 同步本轮 copy
10. ROUND12 验收最终核对 + PROGRESS 关闭 Round 12 / 开启本轮记录

## 验收

- build 通过
- 三语 key 对齐
- PROGRESS 更新

## 验收结果（已完成）

10/10 全部落地。

| # | 事项 | 状态 | SHA |
|---|------|------|-----|
| 1 | ThemeToggle 触控 / 浅色 focus-ring token | ✅ | `67e63f5` |
| 2 | LocaleToggle 键盘修饰键守卫 / focus z-index | ✅ | `3938e80` |
| 3 | Hero 预览指示器 44×44 触控 | ✅ | `5b4bddd` |
| 4 | Footer focus / safe-area | ✅ | `1c2006a` |
| 5 | PolicyModal 焦点陷阱 / 滚动锁加固 | ✅ | `b9ca30a` |
| 6 | FeatureScreenshotFrame 阴影与深色 chrome | ✅ | `cc39512` |
| 7 | VitePress 深色 active / 间距 | ✅ | `1c954b2` |
| 8 | zh download 文案第十轮 | ✅ | `9aff5e6` |
| 9 | en / zh-Hant 同步 download copy | ✅ | `cbd4715` |
| 10 | ROUND12 验收 + PROGRESS / 本轮关闭 | ✅ | 见本提交 |

补充：三语 329 keys；`npm run build` 于本轮收尾复验通过。
