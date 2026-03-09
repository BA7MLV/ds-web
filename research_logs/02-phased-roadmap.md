# 分阶段实施路径调研

## Phase 1: 信息架构与内容基线
- 目标：先稳住导航、入口页、目录分层，降低后续改动回归面。
- 主要触点：`docs/.vitepress/config.js`、`docs/index.md`、`docs/en/index.md`、`docs/user-guide/*`。
- 验证：`npm run dev:docs`、`npm run build -w docs`、`npm run preview -w docs`。

## Phase 2: 主题与阅读体验收敛
- 目标：将主题行为和样式能力集中管理，减少页面散落样式。
- 主要触点：`docs/.vitepress/theme/index.js`、`docs/.vitepress/theme/Layout.vue`、`docs/download.md`。
- 验证：暗黑模式、移动端侧栏、图片缩放和页面可读性人工验收 + 文档构建验证。

## Phase 3: 下载链路与发布数据可靠性
- 目标：稳定 release 资产同步与 docs/官网双端消费一致性。
- 主要触点：`scripts/sync-release-downloads.mjs`、`scripts/lib/release-downloads.mjs`、`docs/.vitepress/data/downloads.json`、`src/data/downloads.json`。
- 验证：`node --test tests/release-downloads.test.mjs tests/website-downloads.test.mjs tests/downloads-snapshot.test.mjs`。

## Phase 4: 发布门禁与持续校验
- 目标：建立可重复、可审计的发布质量门槛。
- 主要触点：`package.json`、`docs/package.json`、测试集与（新增）CI workflow。
- 验证：`npm run lint` + 全量测试 + docs build + root build + preview。
