# Claude Code 产出代码优化审计与可执行 TODO（ds-web）

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this
> plan task-by-task.
>
> 范围：React 官网（`src/`）、VitePress 文档站（`docs/`）、构建脚本（`scripts/`）、
> 工程治理（依赖 / 缓存 / 校验）。
>
> 目标：在不推翻现有视觉方向的前提下，优先解决可维护性、构建确定性、文档一致性、
> 以及体积与治理风险。
>
> 基线（2026-03-08 实测）：
> - `npm run lint`：通过
> - `node --test tests/*.test.*`：35/35 通过
> - `npm run build`：通过，但 VitePress 构建出现 large chunk warning
> - 构建会写回 `src/data/downloads.json` 与 `docs/.vitepress/data/downloads.json`

**Goal:** 把当前 Claude Code 写出来的站点代码，从“能跑、能看”推进到“可持续维护、
可验证、可继续迭代”的状态。

**Architecture:** 先做工程治理和信息架构止血，再拆 React 单体文件与样式 token，
最后收敛文档站配置和构建链路，避免边修边继续积累新债务。

**Tech Stack:** React + Vite、VitePress、Tailwind、Node scripts、Node test、ESLint

---

## 调研轮次（4 轮并行）

1. **React 官网与运行态结构**
   - `src/App.jsx` 当前约 2538 行，集中了 store、hook、图标、流程图、页面 section、
     modal、footer 与下载页切换。
   - 单文件内声明了 `OptimizedImage`、`ArchitectureDiagram`、`HeroSection`、
     `DownloadPage`、`FaqSection`、`Footer` 等一整套页面层组件。
   - 结论：后续每次改动首页，都会放大回归范围和 review 成本。

2. **样式系统与设计 token**
   - `src/index.css` 当前约 668 行，`docs/.vitepress/theme/custom.css` 当前约 809 行。
   - React 站点存在未定义 token 使用：`--apple-bg`、`--apple-shadow-2xl`、
     `--apple-blue-bg`、`--apple-blue-bg-hover`、`--apple-error-*`、
     `--apple-success-*`。
   - 结论：视觉虽然统一，但 token contract 已经失真，维护时容易出现“样式看起来没坏，
     实际依赖 fallback”的隐性问题。

3. **文档站与信息架构**
   - `docs/` 与 `docs/guide/` 存在双轨页面；`download`、`start`、`A-Q`、`about`
     等内容并行存在且已出现文案分叉。
   - 例子：`docs/start.md` 写“系统设置 -> 模型服务”，`docs/guide/start.md` 写
     “系统设置 -> API 配置”；`docs/A-Q.md` 与 `docs/guide/A-Q.md` 的仓库链接不同。
   - 结论：现在最大问题不是“页面不够多”，而是“真实来源不唯一”。

4. **构建链路、依赖与工程治理**
   - `npm run build` 会先执行 `scripts/sync-release-downloads.mjs`，直接修改源码目录里的
     JSON；这会让构建结果带 side effect。
   - 根依赖中存在明显历史残留：`@tsparticles/react`、`@tsparticles/slim`、
     `class-variance-authority`、`lucide-react`、`motion`、
     `react-lazy-load-image-component`。
   - `docs/.vitepress/cache/` 已被 git 跟踪，虽然 `.gitignore` 里已经写了忽略规则。
   - 结论：当前最大的工程风险不是 lint/test，而是“构建不纯”和“产物入库”。

## 核心判断

- 当前项目不是“缺功能”，而是“边界不清”：官网、文档、脚本、生成数据互相牵连。
- 最值得先做的是治理与拆分，不是继续在 `src/App.jsx` 上叠新 section。
- 文档站内容已经进入“双份来源”阶段，再不合并，后续每次发布都会继续漂移。
- 现有测试覆盖了部分 util，但还没覆盖首页大组件、docs theme、脚本副作用这三块。
- 首批优化应避免视觉大改，重点做：拆分、去重、收口、补验证。

---

## 可执行 TODO（给 LLM 逐项打勾）

> 规则：只有在“验收标准”和“验证方法”都满足后，才能把 `- [ ]` 改成 `- [x]`。
> 执行顺序必须是 P0 -> P1 -> P2；不要跳级。

### P0（先止血：可维护性 / 构建确定性 / 数据源唯一性）

- [ ] **P0-01：拆分 `src/App.jsx`，建立首页模块边界**
  - 涉及：`src/App.jsx`、`src/components/`、`src/lib/`
  - 问题：单文件同时承载页面编排、交互逻辑、流程图、图标、下载页、FAQ、Footer。
  - 修复：
    - 把首页 section 拆到 `src/components/home/` 或 `src/features/home/`
    - 把 `useResponsiveMotion`、滚动 store、视口 store、`OptimizedImage`
      等提取为独立 hook/lib
    - 保持 `App` 只负责路由态和页面编排
  - 验收：
    - `src/App.jsx` 降到“页面壳”级别，不再内嵌大段 section 组件
    - 首页组件边界清晰，可按 section 单独 review
  - 验证：
    - `npm run lint`
    - `node --test tests/*.test.*`
    - `npm run build`
  - References:
    - 现有官网首页审计（仓库根目录归档：`plans/2026-02-21-react-homepage-design-audit.md`）
    - [官网首页文案源](../index.md)

- [ ] **P0-02：整理设计 token，补齐未定义 CSS 变量并收口 React / Docs 主题契约**
  - 涉及：`src/index.css`、`docs/.vitepress/theme/custom.css`、
    `src/components/lazy-image-with-fallback.jsx`、`src/components/network-provider.jsx`
  - 问题：React 站点已有多个未定义 token 使用，docs 主题与官网 token 体系也在分叉。
  - 修复：
    - 明确“官网 token”与“文档 token”的边界
    - 补齐或删除未定义变量
    - 为 toast / 按钮 / card / hover shadow 建立稳定 token 名称
  - 验收：
    - 不再出现未定义 `var(--apple-*)`
    - token 命名有清单，后续新增样式不再猜变量名
  - 验证：
    - 全仓搜索 `var(--apple-`
    - `npm run lint`
    - `npm run build`
  - References:
    - [下载页](../download.md)
    - [快速开始](../start.md)

- [ ] **P0-03：删除死代码与未使用依赖，降低维护噪音**
  - 涉及：`package.json`、`src/components/safe-area.jsx`、
    `src/components/theme-toggle.jsx`、`src/components/mode-switch-panel.jsx`、
    `docs/.vitepress/theme/CustomHome.vue`、`docs/.vitepress/theme/components/MobileMenu.vue`
  - 问题：
    - 多个导出目前无引用：`ThemeSelector`、`SafeArea*`、`ModeSwitchPanelDemo`
    - 多个依赖目前无 import 命中
    - docs theme 里也有注册后未使用组件
  - 修复：
    - 删除未使用导出 / 组件 / 依赖
    - 如果要保留，必须补“谁在用、为什么保留”的引用链
  - 验收：
    - 根 `package.json` 无明显未使用依赖
    - docs theme 不再保留无接入组件
  - 验证：
    - `npm run lint`
    - `node --test tests/*.test.*`
    - `npm run build`
  - References:
    - [用户指南目录](../user-guide/README.md)
    - 现有实现计划（仓库根目录：`implementation_plan.md`）

- [ ] **P0-04：把 release 下载同步从“构建副作用”改成“显式数据更新流程”**
  - 涉及：`scripts/sync-release-downloads.mjs`、`package.json`、`docs/package.json`
  - 问题：`npm run build` 当前会直接改写源码树中的下载 JSON，导致构建不纯、git 状态被污染。
  - 修复：
    - 把下载元数据同步拆成独立命令，例如 `npm run sync:downloads`
    - 构建阶段只消费已有数据，不主动写回源码
    - 如需 CI 自动同步，使用单独 job 或发布脚本
  - 验收：
    - 单次 `npm run build` 不再让源码目录新增 diff
    - 离线构建策略清晰（用缓存 / 用快照 / 用发布前同步）
  - 验证：
    - `git status --short`
    - `npm run build`
    - 再次 `git status --short`
  - References:
    - [下载页](../download.md)
    - 旧下载加速 TODO（仓库根目录归档：`plans/2026-02-20-github-cn-download-acceleration-todo.md`）

- [ ] **P0-05：清理已跟踪的 `docs/.vitepress/cache/`，修正产物治理**
  - 涉及：`.gitignore`、`docs/.gitignore`、git index
  - 问题：虽然忽略规则已存在，但 cache 文件已经被纳入版本控制。
  - 修复：
    - 从 git index 中移除 `docs/.vitepress/cache/`
    - 确认 `.vitepress/dist`、cache、其他生成产物都不会再被误跟踪
  - 验收：
    - `git ls-files docs/.vitepress/cache` 为空
    - 后续开发不会再把本地缓存提交进仓库
  - 验证：
    - `git ls-files docs/.vitepress/cache`
    - `npm run build`
  - References:
    - [文档首页](../index.md)

### P1（提质：文档统一、配置拆分、验证补齐）

- [ ] **P1-01：确定文档唯一真源，收敛 `docs/` 与 `docs/guide/` 的重复内容**
  - 涉及：`docs/*.md`、`docs/guide/*.md`
  - 问题：同主题双份页面已经出现内容不一致与链接不一致。
  - 修复：
    - 选定 `docs/` 或 `docs/guide/` 为 canonical source
    - 另一套要么删掉，要么改成 redirect stub
    - 清理错误 / 过时仓库链接与旧术语
  - 验收：
    - `start`、`download`、`A-Q`、`about`、`timeline` 不再双份维护
    - 文档内关于仓库地址、设置入口、下载来源的表述一致
  - 验证：
    - 抽检所有主导航页面
    - `npm run build`
  - References:
    - [文档首页](../index.md)
    - [快速开始](../start.md)
    - [下载页](../download.md)
    - [FAQ](../A-Q.md)
    - 旧 guide 快速开始（已删除，2026-03-09）
    - 旧 guide 下载页（已删除，2026-03-09）
    - 旧 guide FAQ（已删除，2026-03-09）

- [ ] **P1-02：拆分 VitePress 配置，去掉 config 内联大块 SVG 与内容常量**
  - 涉及：`docs/.vitepress/config.js`
  - 问题：sidebar/nav/icon 常量全部堆在一个配置文件里，改一处需要读整份配置。
  - 修复：
    - 抽出 `sidebar`、`nav`、`head`、`locales`、`icons`
    - 让 config 只保留装配逻辑
  - 验收：
    - `docs/.vitepress/config.js` 明显瘦身
    - 站点导航、侧栏、图标配置可单独维护
  - 验证：
    - `npm run build`
    - 手动核对首页、导航、侧栏
  - References:
    - [文档首页](../index.md)
    - [用户指南目录](../user-guide/README.md)

- [ ] **P1-03：为 docs theme 建立质量门禁，不再处于 ESLint 盲区**
  - 涉及：`eslint.config.js`、`docs/.vitepress/theme/`
  - 问题：当前 ESLint 全局忽略了 `docs/.vitepress/theme`，Vue 主题代码缺乏静态校验。
  - 修复：
    - 取消对 docs theme 的无差别忽略
    - 选一种最小可行门禁：ESLint + Vue parser，或单独的 `vitepress build`
      smoke test 脚本
  - 验收：
    - docs theme 至少有一种自动校验方式
    - theme 变更不再只能靠肉眼回归
  - 验证：
    - `npm run lint`
    - `npm run build`
  - References:
    - [文档首页](../index.md)
    - [用户指南目录](../user-guide/README.md)

- [ ] **P1-04：补上首页/下载页/脚本副作用的测试，而不是只测 util**
  - 涉及：`tests/`、`scripts/`
  - 问题：当前测试多集中于 `src/lib/*`，页面编排与构建副作用没有得到等价保护。
  - 修复：
    - 为下载同步脚本写“不会污染源码构建”的回归测试
    - 为文案与下载卡片映射增加快照或结构测试
    - 为首页关键 section 的数据装配写轻量测试
  - 验收：
    - 新测试覆盖首页核心装配、文档构建关键路径、脚本副作用
    - 每个 P0 改动都有回归测试兜底
  - 验证：
    - `node --test tests/*.test.*`
  - References:
    - [下载页](../download.md)
    - 现有官网首页审计（仓库根目录归档：`plans/2026-02-21-react-homepage-design-audit.md`）

- [ ] **P1-05：统一图片与资源生成脚本，去掉平台绑定实现**
  - 涉及：`scripts/optimize-images.mjs`、`scripts/generate-responsive-images.py`
  - 问题：当前图片生成链路混用 `sips`、`sharp` CLI、Python PIL，平台依赖和入口都不统一。
  - 修复：
    - 收敛成一套跨平台方案
    - 把“生成原图尺寸变体”和“校验透明通道”纳入同一条文档化流程
  - 验收：
    - 在非 macOS 环境也能稳定执行
    - 脚本入口唯一，文档说明明确
  - 验证：
    - 执行图片脚本
    - `npm run build`
  - References:
    - [文档首页](../index.md)
    - [快速开始](../start.md)

### P2（后续优化：性能与长期维护体验）

- [ ] **P2-01：对首页做按 section / heavy block 拆包，压低主包压力**
  - 涉及：`vite.config.js`、`src/App.jsx`、首页 section 组件
  - 问题：当前首页主入口过重，构建已出现 chunk warning，后续继续堆功能只会更差。
  - 修复：
    - 引入 `manualChunks` 或按 section `lazy import`
    - 把不在首屏的重组件延后加载
  - 验收：
    - 首屏 JS 体积下降
    - 构建警告减少或可解释
  - 验证：
    - `npm run build`
    - 比较构建产物体积
  - References:
    - 现有官网首页审计（仓库根目录归档：`plans/2026-02-21-react-homepage-design-audit.md`）

- [ ] **P2-02：优化 `transformPageData` 的 git 调用成本，避免每页同步执行 git log**
  - 涉及：`docs/.vitepress/config.js`
  - 问题：当前文档页作者信息通过 `execFileSync('git log ...')` 逐页获取，长期会拖慢构建。
  - 修复：
    - 在构建前预生成作者元数据
    - 或在缓存层按文件统一批量计算
  - 验收：
    - 作者信息能力保留
    - docs build 不再依赖逐页同步 git 命令
  - 验证：
    - `npm run build`
  - References:
    - [用户指南目录](../user-guide/README.md)

- [ ] **P2-03：明确 Tailwind 版本策略，避免 root 与 docs 双版本长期漂移**
  - 涉及：`package.json`、`docs/package.json`
  - 问题：root 当前使用 Tailwind 3，docs workspace 当前使用 Tailwind 4，维护成本会继续升高。
  - 修复：
    - 选一种策略：升级统一、隔离并文档化、或抽公共 token 层
  - 验收：
    - 后续新增样式时，不会因为两个版本差异踩坑
  - 验证：
    - `npm run build`
    - 抽检官网与文档站主题表现
  - References:
    - [文档首页](../index.md)
    - [用户指南目录](../user-guide/README.md)

---

## 推荐执行顺序

1. 先完成 P0-04 与 P0-05，解决“构建污染源码”和“缓存入库”。
2. 再做 P0-01 与 P0-02，建立 React 页面和样式的稳定边界。
3. 然后做 P1-01，先统一文档真源，再做 config/theme 瘦身。
4. 最后处理测试补齐、图片脚本统一、打包与 build 性能。

## 验证清单（每个阶段结束都要跑）

- [ ] `npm run lint`
- [ ] `node --test tests/*.test.*`
- [ ] `npm run build`
- [ ] `git status --short` 确认没有新增意外产物

## 参考链接（只保留引用，不贴全文）

- [文档首页](../index.md)
- [快速开始](../start.md)
- [下载页](../download.md)
- [FAQ](../A-Q.md)
- [用户指南目录](../user-guide/README.md)
- 旧 guide 首页跳转页（已删除，2026-03-09）
- 旧 guide 快速开始（已删除，2026-03-09）
- 旧 guide 下载页（已删除，2026-03-09）
- 旧 guide FAQ（已删除，2026-03-09）
- 现有官网首页设计审计（仓库根目录归档：`plans/2026-02-21-react-homepage-design-audit.md`）
- 现有实现计划（仓库根目录：`implementation_plan.md`）
