# Context Gathering Evidence

## 直接检索证据
- LSP 符号确认：`docs/.vitepress/config.js` 含 `search`、`locales`、`transformPageData` 等关键配置节点。
- AST-grep 命中：`export default withMermaid(defineConfig({ ... }))`（说明 Mermaid 插件与主配置一体化）。
- Grep 命中：根与 docs 目录下均存在 Tailwind/PostCSS 相关配置，且版本代际不同。
- Glob 命中：未发现 `.github/workflows/*.yml` 或 `.yaml`（当前缺少仓库级 CI workflow 证据）。
- LSP 诊断：`docs/.vitepress/config.js` 当前无诊断错误。

## 与调研维度的映射
- 技术栈/工具链：配置与脚本已具备可验证证据。
- 实施路径：可直接映射到 `docs/.vitepress/*`、`scripts/*`、`tests/*`。
- 风险性能：构建链、搜索链、国际化链均可测量。
- 行业案例：均有外部权威来源可引用。
