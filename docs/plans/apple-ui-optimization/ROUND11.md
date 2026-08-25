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
