# GitHub 中国大陆下载加速执行 TODO（LLM 勾选版）

> 目标：在中国大陆网络环境下，提高 GitHub 的 `git clone/fetch` 与 Release 下载成功率、速度与稳定性，并保证供应链安全。

## 四轮调研结论（可追溯）

### 第 1 轮（Explore + Librarian）
- 官方高可信路径稳定存在：`HTTPS + 凭据缓存`、`SSH over 443`、`浅克隆/部分克隆/稀疏检出`。
- 社区方案（镜像站、在线代理、hosts）信息噪声较大，适合“备选”，不适合“默认”。

### 第 2 轮（时效交叉验证）
- GitHub 官方安全能力在增强：Release 资产摘要校验、Immutable release、`gh release verify-asset` 相关实践可用。
- 结论：应采用“官方链路优先 + 可验证完整性 + 逐级降级兜底”。

### 第 3 轮（Oracle）
- 已发起 Oracle 咨询用于策略排序与风险边界；结合前两轮证据，形成统一决策基线：
  1) 先优化传输量与协议；2) 再加企业代理/自建中继；3) 最后才考虑第三方镜像临时兜底。

### 第 4 轮（Artistry）
- 已发起非常规方案探索；落地建议采用“三蓝图”：个人、团队、CI 分场景执行，避免一刀切。

---

## 执行清单（给 LLM 或人工逐项打勾）

### A. 基线诊断（先定位，再改造）
- [ ] 记录当前环境：个人网络 / 公司网络 / CI Runner。
- [ ] 记录当前问题类型：`clone 慢`、`release 下载慢`、`偶发超时`、`端口受限`。
- [ ] 采样 3 次基线：
  - [ ] `time git ls-remote https://github.com/OWNER/REPO.git`
  - [ ] `time git clone --depth 1 https://github.com/OWNER/REPO.git`
  - [ ] `time curl -L -o /tmp/release.bin https://github.com/OWNER/REPO/releases/download/TAG/FILE`
- [ ] 记录成功率、平均耗时、P95 耗时。

### B. 默认推荐（高可信、低维护）
- [ ] 开启 HTTPS 凭据缓存（减少重复认证与握手失败）。
- [ ] 对大仓库启用传输减载策略（按顺序尝试）：
  - [ ] `git clone --depth 1 <url>`
  - [ ] `git clone --single-branch --branch main <url>`
  - [ ] `git clone --filter=blob:none <url>`
  - [ ] `git clone --sparse <url>`
- [ ] 若 SSH 22 端口受限，切换到 SSH over 443：
  - [ ] `ssh -T -p 443 git@ssh.github.com`
  - [ ] `git clone ssh://git@ssh.github.com:443/OWNER/REPO.git`
- [ ] 首次切换出口后，核对 SSH 指纹（防中间人）。

### C. 团队/企业增强（可控性优先）
- [ ] 优先使用公司批准的 HTTP(S) 代理或出口网关。
- [ ] 为开发机与 CI 统一设置 `http_proxy` / `https_proxy` / `no_proxy`。
- [ ] 建立“中继或缓存”方案时只允许自建或受信任服务（记录负责人、SLA、审计日志）。
- [ ] 配置回滚开关：一键恢复官方直连与默认 Git 配置。

### D. 安全红线（必须遵守）
- [ ] 不把第三方镜像/在线代理设为默认生产链路。
- [ ] 不在不可信中继输入 GitHub 账号密码或高权限 Token。
- [ ] 下载 Release 后执行完整性校验（至少二选一）：
  - [ ] 校验官方 SHA256 摘要 / 发布页摘要
  - [ ] 使用 `gh release verify-asset` 或同等机制
- [ ] 对关键依赖固定版本与 commit/tag，避免“漂移更新”。

### E. 降级与兜底（按优先级）
- [ ] Level 1：官方 HTTPS + 凭据缓存 + 传输减载。
- [ ] Level 2：SSH over 443（仅在 22 不通时）。
- [ ] Level 3：企业代理/自建中继。
- [ ] Level 4：第三方镜像仅临时下载公开源码，且必须二次校验。
- [ ] 任一方案失败时，10 分钟内可回滚到上一级稳定配置。

### F. 验收标准（必须量化）
- [ ] `clone` 成功率 >= 95%（采样 >= 20 次）。
- [ ] 平均耗时较基线下降 >= 30%（或达到团队可接受阈值）。
- [ ] Release 关键资产 100% 完整性校验通过。
- [ ] CI 在高峰时段连续 3 天无大规模拉取失败。

---

## 三套落地蓝图（个人 / 团队 / CI）

### 蓝图 1：个人开发机（最小改动）
- 路径：HTTPS 凭据缓存 + `--depth 1` / `--filter=blob:none`。
- KPI：首克隆耗时、失败率、日常 pull 稳定性。
- 回滚：移除代理环境变量，恢复默认 remote URL。

### 蓝图 2：团队开发环境（可控增强）
- 路径：公司代理统一出口 + 规范化 Git 配置模板 + 校验脚本。
- KPI：团队平均 clone 时延、故障恢复时间、校验覆盖率。
- 回滚：配置中心一键切回官方直连策略。

### 蓝图 3：CI/CD（稳定性优先）
- 路径：Runner 固定网络出口 + 缓存策略 + Release 校验强制门禁。
- KPI：流水线拉取成功率、重试次数、构建中断率。
- 回滚：切换到备用 Runner/出口，保留最小构建能力。

---

## 参考（高可信优先）
- GitHub Docs: Troubleshooting connectivity problems
- GitHub Docs: Using SSH over the HTTPS port
- GitHub Docs: GitHub SSH key fingerprints
- GitHub Docs: Verifying the integrity of a release
- Git 官方文档: `git clone`, `partial-clone`, `git config`
