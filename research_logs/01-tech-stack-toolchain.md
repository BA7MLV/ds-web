# 技术栈 / 工具链调研

## 核心结论
- 仓库是「官网 + 文档」双应用结构：官网走 React + Vite，文档走 VitePress。
- 文档站以 `docs/` 为工作区，启用 Mermaid、本地搜索、多语言、编辑链接与自定义主题。
- 根项目与 `docs/` 子项目存在 Tailwind 主版本分叉（v3 vs v4），是后续维护成本热点。

## 关键证据
- 文档构建脚本：`docs/package.json` 中 `vitepress build`，且构建前调用 release 同步脚本。
- 文档主题能力：`docs/.vitepress/theme/index.js` 动态加载 `medium-zoom` 并处理暗色主题色。
- 文档配置：`docs/.vitepress/config.js` 启用 `withMermaid`、`search.provider = 'local'`、`base = '/docs/'`。
- 文档样式链：`docs/postcss.config.js` 使用 `@tailwindcss/postcss`（Tailwind v4）。
- 根样式链：根 `postcss.config.js` 仍是 Tailwind v3 风格插件配置。

## 可立即落地的低风险改进
1. 明确 Tailwind 版本治理策略（全仓统一或长期双轨并写入规范）。
2. 将 release 数据同步从“构建硬依赖”拆分为“可选前置任务 + 缓存优先”。
3. 收敛文档主题样式落点（减少页面内大段样式，统一主题样式入口）。
