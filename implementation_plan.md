# DeepStudent Docs Implementation Plan

## 目标
在不破坏现有发布链路的前提下，完成文档站的信息架构收敛、体验优化、发布可靠性增强与质量门禁建设。

## 调研引用
- 技术栈/工具链：[Link](research_logs/01-tech-stack-toolchain.md)
- 分阶段路径：[Link](research_logs/02-phased-roadmap.md)
- 风险与性能：[Link](research_logs/03-risks-performance.md)
- 行业案例：[Link](research_logs/04-industry-cases.md)
- 定向检索证据：[Link](research_logs/00-context-evidence.md)

## 分阶段实施

### Phase 1 - IA 基线与导航一致性
**范围**
- `docs/.vitepress/config.js`
- `docs/index.md`
- `docs/en/index.md`
- `docs/user-guide/*`

**交付物**
- 导航结构对齐（中英文入口与层级一致）
- 页面命名与链接规范清单

**验收**
- `npm run dev:docs`
- `npm run build -w docs`
- `npm run preview -w docs`

### Phase 2 - 主题与阅读体验收敛
**范围**
- `docs/.vitepress/theme/index.js`
- `docs/.vitepress/theme/Layout.vue`
- `docs/download.md`

**交付物**
- 主题交互策略统一（暗色、图片缩放、移动端）
- 页面内样式治理（从散落样式向主题层收敛）

**验收**
- 移动端 + 深色模式人工检查
- 文档 build/preview 全通过

### Phase 3 - 下载数据与构建可靠性
**范围**
- `scripts/sync-release-downloads.mjs`
- `scripts/lib/release-downloads.mjs`
- `docs/.vitepress/data/downloads.json`
- `src/data/downloads.json`

**交付物**
- release 数据同步策略优化（缓存优先、失败可恢复）
- docs 与官网下载数据一致性校验

**验收**
- `node --test tests/release-downloads.test.mjs tests/website-downloads.test.mjs tests/downloads-snapshot.test.mjs`
- `npm run build -w docs`
- `npm run build`

### Phase 4 - 质量门禁与持续治理
**范围**
- `.github/workflows/*.yml`（新增）
- `package.json`
- `docs/package.json`
- 文档/测试脚本

**交付物**
- 最小 CI 门禁：构建、链接、i18n 映射、关键测试
- PR 必过检查与分支保护建议

**验收**
- PR 环境稳定通过率达标
- 主分支持续成功率与构建时长进入监控基线

## 风险控制与度量
- docs build P95 <= 180s
- 搜索首开 P95 <= 300ms（核心入口页抽样）
- 新增中文页后 48h 内有英文占位或状态标识
- CI 必过项覆盖：build + links + i18n + tests

## 执行 TODO（可勾选）
- [ ] 对齐中英文导航与入口页映射，并完成链接巡检。
- [ ] 收敛主题样式落点，减少页面内大段样式。
- [ ] 拆分并优化 release 数据同步策略（缓存优先、手动刷新）。
- [ ] 增加仓库级 CI workflow，并设置最小必过门禁。
- [ ] 建立性能与内容治理阈值（build/search/i18n）并纳入发布流程。
