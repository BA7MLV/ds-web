# 行业参考案例调研

## 参考列表（外部）
1. VitePress Default Theme Search
   - https://vitepress.dev/reference/default-theme-search
   - 价值：本地搜索配置、国际化搜索文案、排除策略。
2. Algolia DocSearch Crawler
   - https://docsearch.algolia.com/docs/crawler
   - 价值：大规模文档检索、去重与规则化抓取。
3. VitePress Deploy Guide
   - https://vitepress.dev/guide/deploy
   - 价值：`base` 子路径部署、构建/预览最佳实践。
4. Vite Performance Guide
   - https://vite.dev/guide/performance
   - 价值：插件开销审计、构建与开发性能优化基线。
5. Lighthouse CI Configuration
   - https://raw.githubusercontent.com/GoogleChrome/lighthouse-ci/main/docs/configuration.md
   - 价值：性能预算与 PR 质量门禁。
6. GitHub Protected Branches
   - https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches
   - 价值：必过检查、分支保护与合并约束。
7. GitHub Docs Content Linter
   - https://docs.github.com/en/contributing/collaborating-on-github-docs/using-the-content-linter
   - 价值：文档质量规则化（lint + CI）。
8. GitHub Docs Content Model
   - https://docs.github.com/en/contributing/style-guide-and-content-model/about-the-content-model
   - 价值：信息架构分层与内容治理模型。
9. Read the Docs Versioning Schemes
   - https://docs.readthedocs.io/en/stable/versioning-schemes.html
   - 价值：多版本、多语言文档 URL 策略。

## 对本仓库的直接可用启发
- 当前仍可维持本地搜索，但需设定“规模阈值 → 外部搜索升级”的触发条件。
- 在无 CI workflow 的前提下，优先上“最小门禁集”比追求复杂平台更关键。
- IA 模型与 i18n 流程需要同步治理，否则功能页扩展后会快速失配。
