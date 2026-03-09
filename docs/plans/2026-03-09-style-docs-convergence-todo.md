# Style Tokens And Docs Convergence Todo

> **For Claude / Codex:** 只做减法。优先合并来源、复用现有 token、移除旧入口。除非删除会造成明确回归，否则不要新增页面、不要新增视觉 token、不要引入新的文档层级。

**Goal:** 消除 `src/index.css` 的 token 契约漂移，收敛 `docs/` 与 `docs/guide/` 的双写来源，并把站点入口统一到唯一真源。

**Architecture:** 把 `docs/` 设为公共页面的 canonical source；`docs/guide/` 只允许保留真正独有的页面。样式层不扩充 token 面，优先把漂移中的消费点映射回已有 token，或直接删除多余语义。

**Tech Stack:** React 19 + Vite、VitePress、Tailwind CSS、Markdown

---

## 已确认事实

- `src/` 中存在 `10` 个“被使用但未在 `src/index.css` 定义”的 token：
  `--apple-bg`、`--apple-blue-bg`、`--apple-blue-bg-hover`、`--apple-error-bg`、
  `--apple-error-border`、`--apple-error-text`、`--apple-shadow-2xl`、
  `--apple-success-bg`、`--apple-success-border`、`--apple-success-text`
- `docs/` 与 `docs/guide/` 有 `6` 对同名页面：`index`、`start`、`download`、
  `A-Q`、`about`、`timeline`；其中 `5` 对已分叉，只有 `timeline.md` 目前一致。
- 旧 `guide` 路径仍被站内入口消费：
  `docs/.vitepress/theme/CustomHome.vue`、`src/App.jsx`
- `docs/guide/feature-architecture.md` 与 `docs/guide/function.md` 是当前仅存的
  `guide` 独有页，暂时没有稳定入口引用。

## Todo

### P0 先收入口，不要先改正文

- [x] 明确 `docs/` 是公共页面的唯一真源：
  `index.md`、`start.md`、`download.md`、`A-Q.md`、`about.md`、`timeline.md`
- [x] 把所有站内入口从 `/guide/*` 改到 canonical 页面，避免继续给重复页导流。
  涉及：`docs/.vitepress/theme/CustomHome.vue`、`src/App.jsx`
- [x] 在改入口之前，用 `rg -n '/guide/' docs src` 建立现存引用清单；改完后再跑一次，确保只剩计划/归档文本与外部 VitePress 官方链接，不再有运行时 `/guide/*` 导流。
  实际改动：`docs/.vitepress/theme/CustomHome.vue`、`src/App.jsx`

### P0 收 token 契约，不扩 token 面

- [x] 重新生成 `src/` 的 `var(--*)` 使用清单，对照 `src/index.css` 定义清单，确认初始缺口为这 `10` 个 token，并在收口后复查为 `0`。
- [x] 将 `--apple-bg` 的消费改回现有 `--apple-surface` 或 `--apple-card`，不要新建“背景语义” token。
  涉及：`src/App.jsx`
- [x] 将 `--apple-blue-bg`、`--apple-blue-bg-hover` 改回现有
  `--apple-blue-soft` 与现有 hover 组合，不新增蓝色衍生 token。
  涉及：`src/components/lazy-image-with-fallback.jsx`
- [x] 对 `--apple-error-*`、`--apple-success-*` 两组状态色，先判断能否直接改成现有类名或现有 token；只有在无法复用时，才补齐 light/dark 成对定义，不能只补单边。
  涉及：`src/components/network-provider.jsx`
- [x] 将 `--apple-shadow-2xl` 的消费降级到现有 `--apple-shadow-xl`，或直接删除 hover 阴影升级，不新增新的阴影层级。
  涉及：`src/App.jsx`
- [x] 完成后再次对比使用清单与定义清单，目标是 `used-but-undefined = 0`。
  实际改动：`src/App.jsx`、`src/components/lazy-image-with-fallback.jsx`、`src/components/network-provider.jsx`

### P0 删掉双写，不再维护两份正文

- [x] 对 `docs/guide/` 下的 `6` 个重复页做减法处理。
  规则：没有兼容诉求就直接删除；若必须兼容旧链接，只保留最薄 redirect stub，不再维护第二份正文。
- [x] 保留并单独评估 `docs/guide/feature-architecture.md` 与 `docs/guide/function.md`。
  规则：需要就补明确入口；不需要就删除。
- [x] 下载页只保留一个实现版本。推荐保留根目录动态版 `docs/download.md`，淘汰 `docs/guide/download.md` 的静态硬编码版。
  实际改动：删除 `docs/guide/index.md`、`docs/guide/start.md`、`docs/guide/download.md`、`docs/guide/A-Q.md`、`docs/guide/about.md`、`docs/guide/timeline.md`、`docs/guide/feature-architecture.md`、`docs/guide/function.md`

### P1 统一文案，不再漂移

- [x] 以 `docs/` 为准统一命名，避免“模型服务 / API 配置”“学习资源中心 / Learning Hub”这类表述继续双轨并存。
- [x] 统一仓库链接来源，避免 `helixnow/deep-student` 与 `000haoji/deep-student` 同时出现。
- [x] 检查 `docs/user-guide/README.md` 与首页入口文案，确保它们只指向 canonical 页面，不再暗示双份来源。
  实际改动：`docs/.vitepress/theme/CustomHome.vue`；核对无须改动：`docs/index.md`、`docs/user-guide/README.md`

### 验证

- [x] 运行 `rg -n '/guide/' docs src -g '!docs/node_modules/**' -g '!docs/.vitepress/cache/**' -g '!docs/.vitepress/dist/**'`，结果已无运行时 `/guide/*` 导流；剩余命中仅为计划/归档文本记录与外部 `vitepress.dev/guide/*` 链接。
- [x] 运行 token 对比命令，确认 `src/` 中不再存在 used-but-undefined token。
- [x] 运行 `npm run build`，确认主站与文档站都能通过构建。
- [x] 手动检查 `/docs/` 首页、下载页、FAQ、用户指南入口，以及主站 FAQ 外链是否都落到 canonical 页面。
  实际核对：`docs/.vitepress/theme/CustomHome.vue`、`docs/index.md`、`docs/user-guide/README.md`、`src/App.jsx`

## Guardrails

- [x] Do: 复用现有 token，删除重复来源，统一入口。
- [x] Don't: 新增一套 token 命名、再造第三份文档来源、为了兼容长期保留两份正文。

## Markdown References

- [首页文档](../index.md)
- [快速开始](../start.md)
- [下载页](../download.md)
- [FAQ](../A-Q.md)
- [关于页](../about.md)
- [项目历程](../timeline.md)
- 旧 guide 首页（已删除，2026-03-09）
- 旧 guide 快速开始（已删除，2026-03-09）
- 旧 guide 下载页（已删除，2026-03-09）
- 旧 guide FAQ（已删除，2026-03-09）
- [用户指南目录](../user-guide/README.md)
- [上一版大而全计划](./2026-03-08-claude-code-optimization-todo.md)

## Recommended Order

1. [x] 先改站内入口。
2. [x] 再收 token 契约。
3. [x] 最后删掉或瘦身 `docs/guide/` 的重复页并做构建验证。

## Execution Notes

- `rg '/guide/'` 基线与复查已执行；当前仅剩计划/归档文本与外部 `vitepress.dev/guide/*` 链接命中，无运行时 `/guide/*` 导流。
- `src/` token 差集已复查为 `used-but-undefined = 0`。

## Build Result

- `npm run build` 已通过：主站 `vite build` 成功，文档站 `vitepress build` 成功。

## Risks

- `npm run build` 仍会通过 `scripts/sync-release-downloads.mjs` 改写 `docs/.vitepress/data/downloads.json` 与 `src/data/downloads.json`，这是现有构建链路副作用，不是本次收敛逻辑新增。
- 文档构建仍有 chunk size warning，但不影响本次构建通过；未为此扩展优化范围。

## Unfinished

- 无功能性未完成项；剩余 `/guide/` 命中仅为计划文本与外部官方文档 URL，不属于运行时入口。
