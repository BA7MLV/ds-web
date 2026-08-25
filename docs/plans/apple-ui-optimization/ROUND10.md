# Round 10 — 性能、深色/动效与文案第七轮

## 目标

在 Round 9 收尾后继续压性能与深色一致性，处理已知资源比例问题，并推进文案第七轮。

## 本轮 10 路

1. 可选：移除未使用的 `@radix-ui/react-switch` 依赖（确认无其它引用后）
2. 记录并尽量修复「软件主页图」png vs webp 宽高比不一致（优先改维度声明；勿强行提交大图，除非已有导出流程）
3. 营销页性能预算扫描：主包 / locale chunk / LCP 图片提示清单（可改代码或文档记录）
4. FAQ 手风琴动效与 reduced-motion 再验
5. PolicyModal 深色对比与焦点环再验
6. Hero 移动端排版（字号/行高/CTA 间距）微打磨
7. VitePress `.doc-hero` 深色模式间距与对比
8. 全站 `prefers-reduced-motion` 二次扫描遗漏
9. zh 文案第七轮：nav.* / a11y.* / placeholder.* 压缩去 AI 腔
10. en / zh-Hant 同步本轮 copy + ROUND9 最终 SHA 核对写入 PROGRESS

## 性能扫描

Round 10 营销页性能预算扫描（`vite build`，vite 7.2.4，构建产物 gzip 后尺寸）：

- 主包 `index-*.js`：363.56 kB（gzip 109.78 kB）。构成以 react / react-dom 为主，另含应用代码、
  内联的 zh 兜底文案（约 21 kB 源码）与 LQIP map。在 gzip ≤ 150 kB 预算内，暂无拆分必要。
- CSS `index-*.css`：82.17 kB（gzip 13.32 kB），预算内。
- Locale chunk：`en-*.js` 21.22 kB（gzip 7.59 kB）、`zh-Hant-*.js` 20.40 kB（gzip 8.53 kB），
  均为按需懒加载的独立 chunk；zh 作为兜底随主包内联，切换语言不阻塞首屏。
- LCP 图片：`index.html` 已在 head 最前 preload `软件主页图-960.webp`（24.75 kB），
  `imagesrcset`/`imagesizes` 与 `OptimizedImage`（640/960/1280/1600 webp srcset + 相同 sizes）
  一致，命中同一缓存条目；hero `<img>` 带 `loading="eager"` + `fetchPriority="high"` +
  宽高声明。已是当前最优，无需新增 hint。
- 发现（不影响 bundle，仅安装体积）：`@tsparticles/react`、`@tsparticles/slim`、`motion`、
  `lucide-react`、`react-lazy-load-image-component`、`class-variance-authority` 在 `src/` 中
  零引用，构建时被完全剔除；建议后续轮次仿照本轮第 1 路（radix switch）逐个确认后从
  `package.json` 移除。

## 验收

按 `git log --grep='Round 10'` 核对（截至本次写入；SHA 均为分支上已落地提交）：

| # | 事项 | 状态 | SHA |
|---|------|------|-----|
| 1 | 移除未使用 `@radix-ui/react-switch` 依赖 | ✅ | `e13b108` |
| 2 | 软件主页图 png vs webp 宽高比记录/修复 | 进行中 | — |
| 3 | 营销页性能预算扫描（主包 / locale chunk / LCP） | ✅ | `c853cb1` |
| 4 | FAQ 手风琴动效与 reduced-motion 再验 | ✅ | `3e2ef23` |
| 5 | PolicyModal 深色对比与焦点环再验 | ✅ | `8b790f7` |
| 6 | Hero 移动端排版微打磨 | ✅ | `42d25ee` |
| 7 | VitePress `.doc-hero` 深色模式间距与对比 | 进行中 | — |
| 8 | 全站 `prefers-reduced-motion` 二次扫描 | 进行中 | — |
| 9 | zh 文案第七轮（nav / a11y / placeholder） | ✅ | `cca8d00` |
| 10 | en / zh-Hant 同步本轮 copy + PROGRESS 核对 | 进行中 | — |

- 已落地 6/10；其余 4 路进行中，落地后回填 SHA。
- 视觉验证截图（hero webp）留作本地 artifacts，不入仓。
- build 通过
- 三语 key 对齐
- PROGRESS / ROUND10 更新
