# ds-web P0/P1 问题审计与执行 Todo

> 面向执行 LLM：按复选框逐项完成，完成后勾选并在 PR 描述中贴验证结果。

## 审计结论（当前）

- P0：未发现可直接复现的 P0。
- P1：发现 1 项可确认问题（占位死链风险）。
- 观察项：构建产物忽略规则与 VitePress 配置目前基本可用，但需增加自动化守护，防止回归。

## 证据引用（仅链接）

- 占位链接证据：[`docs/user-guide/README.md`](../user-guide/README.md)
- VitePress 配置证据：[`docs/.vitepress/config.js`](../.vitepress/config.js)
- 根忽略规则：`.gitignore`（仓库根目录）
- 文档目录忽略规则：`docs/.gitignore`

## 可执行 Todo（给 LLM 打勾）

### P1-1 修复占位 Issues 链接（必须）

- [ ] 将 `docs/user-guide/README.md` 中 `https://github.com/your-repo/issues` 替换为真实仓库 Issues 地址。
- [ ] 保证“项目源码”与“Issues”指向同一组织/仓库，避免跨仓混淆。
- [ ] 本地验证链接可访问（非 404/重定向异常）。

**验收标准**

- [ ] `docs/user-guide/README.md` 不再包含 `your-repo` 字样。
- [ ] 页面“技术支持”区 2 个链接均可访问。

### P1-2 增加死链检测门禁（必须）

- [ ] 新增链接检查工作流（如 lychee），覆盖 `docs/**/*.md`。
- [ ] 配置为 PR 失败门禁（新增死链时 CI 失败）。
- [ ] 对确需豁免的链接建立 allowlist，并附注释说明原因和到期策略。

**验收标准**

- [ ] 新建/修改 PR 时自动执行链接检查。
- [ ] 人为引入一个错误链接可触发失败（验证后回滚该测试改动）。

### P1-3 固化构建产物忽略策略（建议升为必须）

- [ ] 确认 `docs/.vitepress/dist/` 与 `docs/.vitepress/cache/` 在忽略规则中持续生效。
- [ ] 若后续调整 `outDir/cacheDir`，同步更新忽略规则与 CI 文档。
- [ ] 在贡献文档中补充“禁止提交构建产物”的说明。

**验收标准**

- [ ] `git check-ignore -v docs/.vitepress/dist/index.html` 有命中。
- [ ] `git check-ignore -v docs/.vitepress/cache/deps/_metadata.json` 有命中。

### P1-4 建立发布前快速巡检脚本（建议）

- [ ] 在 `package.json` 增加 `check:docs`（至少包含链接检查 + docs 构建）。
- [ ] 在发布流程文档中要求先通过 `check:docs` 再合并。

**验收标准**

- [ ] `npm run check:docs` 在本地可跑通。
- [ ] CI 中可复用同一检查命令。

## 推荐执行顺序

1. 先做 P1-1（最快消除已知错误入口）。
2. 再做 P1-2（防止同类问题回归）。
3. 最后做 P1-3/P1-4（制度化与自动化）。

## 执行记录模板（供 LLM 回填）

- [ ] 已完成项：
- [ ] 变更文件：
- [ ] 验证命令与结果：
- [ ] 未完成项与阻塞：
