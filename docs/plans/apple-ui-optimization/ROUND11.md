# Round 11 — 依赖清理、动效一致性与文案第八轮

## 目标

清理 Round 10 性能扫描发现的未使用依赖，继续深色/焦点/动效扫尾，并推进文案第八轮。

## 本轮 10 路

1. 移除未使用依赖：`@tsparticles/react`、`@tsparticles/slim`（确认 `src/` 零引用后 `npm uninstall`）
2. 移除未使用依赖：`motion`（确认零引用）
3. 移除未使用依赖：`lucide-react`、`react-lazy-load-image-component`、`class-variance-authority`（确认零引用；若 `cn`/`cva` 仍用则只删确认无用的）
4. TopNav 深色滚动态对比与 focus-ring 再验
5. FreeModels 推荐卡/ pill 触控目标与键盘可达性
6. Stats 数字动画 reduced-motion 再验（与 Round 10 FAQ 同标准）
7. Feature sticky 桌面层与移动 fallback 焦点顺序核对
8. zh 文案第八轮：stats.* / freeModels.* / footer.* 去 AI 腔
9. en / zh-Hant 同步本轮 copy
10. ROUND10 验收最终核对 + PROGRESS 关闭 Round 10 / 开启本轮记录

## 验收

- build 通过
- package.json 无上述死依赖（若某项仍有引用则保留并在验收注明）
- 三语 key 对齐
- PROGRESS 更新

## 验收结果（已完成）

10/10 全部落地。

| # | 事项 | 状态 | SHA |
|---|------|------|-----|
| 1 | 移除未使用 `@tsparticles/*` | ✅ | `5898011` |
| 2 | 移除未使用 `motion` | ✅ | `f79d319` |
| 3 | 移除未使用 lucide / lazy-image / cva | ✅ | `93ce963` |
| 4 | TopNav 深色滚动态与 focus-ring | ✅ | `f050448` |
| 5 | FreeModels 触控目标与键盘可达性 | ✅ | `a7e1f3b` / `467ca46` |
| 6 | Stats reduced-motion 再验 | ✅ | `c84ca7a` |
| 7 | Feature sticky 焦点顺序 | ✅ | `ceea1c6` |
| 8 | zh stats / freeModels / footer 文案第八轮 | ✅ | `6e8860d` |
| 9 | en / zh-Hant 同步本轮 copy | ✅ | `ebd8309`（`listLabel` 随 `467ca46`） |
| 10 | ROUND10 验收核对 + PROGRESS / 本轮关闭 | ✅ | 见本提交 |

补充：`cn()` 仅依赖 `clsx` + `tailwind-merge`；三语 326 keys（含 `freeModels.listLabel`）；`npm run build` 于本轮收尾复验通过。
