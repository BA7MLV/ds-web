# ds-web 严肃审查（P0/P1）执行 Todo

> 面向执行 LLM：按复选框逐项完成并勾选；每项都要附验证命令与结果。

## 审查范围与结论

- 范围：`package.json`、`scripts/*.mjs`、`docs/.vitepress/config.js`、`tests/*`、`src/*` 关键链路。
- 四轮调研：配置安全、构建发布、运行时稳定性、外部最佳实践对照（并行子代理 + 本地复核）。
- P0：未发现可直接复现项。
- P1：确认 3 项（见下）。

## P1 问题清单（含证据）

### P1-01 构建脚本使用 Unix 专有命令，Windows/部分 CI 直接失败

- 证据：`package.json:16` 使用 `rm -rf dist/docs && cp -R docs/.vitepress/dist dist/docs`。
- 影响：Windows runner 或无 GNU coreutils 环境下 `npm run build` 直接失败，发布链路中断。
- 严重性：P1（高概率构建不可用）。

### P1-02 文档站内联脚本直接拼接环境变量，存在注入与运行时破坏风险

- 证据：`docs/.vitepress/config.js:126` 通过模板字符串拼接 `LA_ID/LA_CK` 到内联 JS。
- 影响：当环境变量包含引号或恶意片段时，会破坏脚本语法或注入任意前端代码。
- 严重性：P1（前端安全/稳定性高风险入口）。

### P1-03 构建过程依赖实时网络并改写受版本控制数据，产物不可复现

- 证据：
  - `package.json:16` 构建前强制执行 `node scripts/sync-release-downloads.mjs`
  - `scripts/sync-release-downloads.mjs:28` 运行时请求 GitHub API
  - `scripts/sync-release-downloads.mjs:54` 与 `scripts/sync-release-downloads.mjs:55` 直接改写 `docs/.vitepress/data/downloads.json` 与 `src/data/downloads.json`
- 影响：同一 commit 在不同时间可能生成不同页面内容；网络抖动时构建结果不可预测。
- 严重性：P1（发布完整性与可追溯性风险）。

---

## 可执行修复 Todo（给 LLM 勾选）

### A. 先修 P1-01（跨平台构建）

- [ ] 将 `package.json` 的 `rm/cp` 替换为跨平台 Node 脚本（如 `fs.rm` + `fs.cp`）或 `shx`。
- [ ] 新增 `scripts/copy-docs-dist.mjs`（若采用 Node 脚本方案）。
- [ ] 本地验证 `npm run build` 成功。
- [ ] 在 CI 增加 Windows runner 构建验证（至少 1 个 job）。

**验收标准**

- [ ] macOS/Linux/Windows 三平台构建命令语义一致。
- [ ] 不再依赖 shell 专有命令（`rm -rf`、`cp -R`）。

### B. 修 P1-02（内联脚本注入面）

- [ ] 将 `LA.init(...)` 内联字符串改为安全序列化参数注入（例如 JSON 字面量 + 运行时读取）。
- [ ] 对 `LA_ID/LA_CK` 增加输入约束（仅允许预期字符集）。
- [ ] 若值不合法，直接跳过注入并打印构建告警。
- [ ] 增加单测覆盖“包含引号/特殊字符时不执行注入”。

**验收标准**

- [ ] 任何包含 `"`、`'`、`;` 的异常值不会进入可执行脚本上下文。
- [ ] 文档站可正常构建，功能不回退。

### C. 修 P1-03（可复现构建）

- [ ] 将下载数据同步从“构建期必执行”改为“显式更新命令”（如 `npm run sync:downloads`）。
- [ ] `build` 默认只消费仓库中已提交的数据文件，不主动联网。
- [ ] 新增 CI 校验：若 `build` 修改了 tracked 文件则失败并提示先执行同步命令。
- [ ] 补充文档：发布前先跑 `sync:downloads` 并提交变更。

**验收标准**

- [ ] 相同 commit、相同依赖下重复构建，产物 hash 稳定（或关键 JSON 不漂移）。
- [ ] 离线环境可完成 build（不触发网络请求）。

---

## 回归验证清单

- [ ] `npm run build` 通过。
- [ ] `node --test tests/*.test.*` 通过。
- [ ] 新增测试覆盖 P1-02 与 P1-03 的关键保护逻辑。
- [ ] PR 描述附：风险 -> 修复 -> 验证证据（命令 + 输出摘要）。

## 执行记录模板（供 LLM 回填）

- [ ] 已完成项：
- [ ] 改动文件：
- [ ] 验证命令与结果：
- [ ] 剩余风险与后续：
