# 夜间模式落地待办

- [x] 基线梳理：汇总现有 `:root`、`.dark` 变量、背景纹理与组件里硬编码的浅色（如 `bg-white/…`、`--apple-*` 使用点）。
- [x] 主题策略：定义 `useTheme`/`ThemeProvider`（含 `auto/light/dark`）、`localStorage` 记忆、`matchMedia` 监听、首屏内联脚本防闪屏。
- [x] 设计 Token：确立暗色主/次背景、卡片、描边、文本阶梯、品牌蓝高光、语义色、阴影/噪声参数，并与 Tailwind HSL token、`--apple-*` 对齐。
- [x] 背景层更新：替换 `body` 背景为暗色基底 + 低透明度噪声/光带，确保性能友好与深色可读性。
- [x] 组件适配：导航、Hero、Feature 卡片、下载页、弹窗等移除硬编码浅色，改用语义变量；按钮/进度条/徽标使用暗色态描边与 hover 状态。
- [x] 交互入口：在导航加入主题切换（Auto/Light/Dark 三态），遵守无障碍（`aria-label`）、动画尊重 `prefers-reduced-motion`。
- [x] 文档站同步：在 `docs/.vitepress/theme/custom.css` 与相关配置中复用同一套暗色 token，保证导航/代码块/侧栏一致。
- [x] 自测与验收：手动切换与系统切换无闪烁；深浅模式可读性、对比度与 hover 状态正常；`npm run dev`/`npm run build`/`npm run preview` 通过且控制台无警告。
