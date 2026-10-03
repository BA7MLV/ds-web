# T0
回复我请使用中文。
# Agent 配置

## Skill 调用

该 Agent 能够调用位于 `~/Claude/skills` 目录下的 skill。

### 使用方法
- 在需要使用 skill 时，Agent 会自动匹配并调用相应的 skill
- skill 文件存储位置：`~/Claude/skills`
- 按照 skill 目录中的规范组织和命名 skill 文件

### 支持的操作
- 项目结构与模块组织
- 构建、测试与本地开发
- 编码风格与命名约定
- 文档管理
- 其他项目相关任务


# Repository Guidelines

## 项目结构与模块组织
- 本站为纯 VitePress 站点（React 官网已移除），部署在根路径 `/`（`base: '/'`）。
- `docs/`: 站点根目录（Markdown 内容，含首页 `index.md` 与各指南专题页面）。
  - `docs/en/index.md`: 英文落地页（同样是 `layout: home` + `<HomePage />`）。**英文目前只覆盖落地页**，文档正文只有中文；顶栏与页脚在 `/en/` 下的导航目标仍指向中文文档。
    - 因此**语言开关只在落地页出现**：`SiteNav.vue` 里两处引用都带 `v-if="isLanding"`。文档页不给开关 —— 否则点「English」会跳到 `/en/` 落地页、把正在读的那页丢掉，像「切了语言但内容没变」。将来文档有英文版时，去掉这两个 `v-if` 即可。
- `docs/.vitepress/`: 站点配置与主题。
  - `config.js`: 标题、导航、侧边栏、本地搜索、编辑链接、SEO/GEO（canonical/OG/JSON-LD/sitemap）与 llms.txt 等。
  - `theme/`: 自定义主题（`index.js` 挂载 medium-zoom、暗色偏好；`custom.css` 已引入 Tailwind）。
    - `theme/i18n/`: 主题文案的多语言表。`index.js` 提供 `useI18n()`（`t()` 取字符串并支持 `{param}` 插值，`tm()` 取列表），当前语言取自 `useData().lang`；`messages/<lang>.js` 一份语言一个文件。**组件里不要再写 `isEn ? ... : ...` 或硬编码文案**，新增语言只需在 `config.js` 的 `locales` 加一项（带 `lang`）+ 补一份消息表，`tests/i18n-messages.test.mjs` 会校验各语言 key 与列表结构是否对齐。
    - `theme/utils/`: 主题侧的无组件逻辑（图标标记串、下载数据整理、首页截图的地址与取景框尺寸等）。
  - `data/downloads.json`: 下载页数据，由 `scripts/sync-release-downloads.mjs` 在构建时从 GitHub Releases 同步。
- `docs/public/`: 公共静态资源（图片、图标、`robots.txt`、`llms.txt`、favicon）。
  - `demo/`: 首页 hero 实时演示的**同源镜像**（另一个工程的构建产物），由 `scripts/sync-demo.mjs` 同步，勿手改。
  - `features/`: 首页「使用流程」两张卡（`flow-*`）和功能区六扇窗的真实界面截图（`<名>-light|dark.webp`，取景框的 2 倍图），**由生成器产出，勿手改**（见下）。
- `scripts/`: 构建辅助脚本。
  - `sync-release-downloads.mjs`、`sync-demo.mjs` + `lib/`：构建期同步数据与演示镜像。
  - `gen-share-images.mjs`：分享卡（og:image）与「什么是 DeepStudent」主图，都从演示海报 `demo-poster.webp` 出，
    文案读 i18n 的首屏标题与副标。重拍海报或改首屏文案后跑一次；分享卡换图要换文件名（平台按 URL 缓存）。
  - `gen-features-live.mjs`：功能区六扇窗、「使用流程」两张卡的**真实界面截图**：在同源演示镜像里打开剧本会话，
    按取景框截深浅两张 2 倍图。取景框尺寸写在 `theme/utils/feature-shot.js`（生成器、`FeatureShot.vue`、测试共用一份），
    运行时 `theme/components/FeatureShot.vue` 两张都进 SSR、按 `<html>.dark` 只显示一张。（9 月底那版字符画已整个去掉。）
    闪卡复习不在聊天页，脚本会放开演示壳的视图守卫、在 mock IPC 外补几条 FSRS 命令。
    依赖 devDependency `playwright-core` + 本机 Chrome 与 cwebp。
    **取景框不许切开界面**：框边压到一行字、一张卡片 / 胶囊 / 图标，截出来就是半句话、少条边的残图。
    生成器会把压在上下两条边上的块（连同它下面 / 上面的内容）截图前藏掉、框里留白；压在左右两条边上的、
    藏掉超过四成框高的、深浅两色藏得不一样的、取景框越出窗口的，直接报错不出图 —— 这时调窗口宽度
    （对话栏要比取景框窄）或取景位置，别放宽检查。
    **演示镜像更新后、或调了取景框，跑一次 `node scripts/gen-features-live.mjs`**
    （`--check` 只查切边，把框四周的上下文图放到系统临时目录，不写产物）。
  - 注意：`npm run build` 会先跑 `sync-demo.mjs` / `sync-release-downloads.mjs`，按演示服务器把本地 `docs/public/demo`
    整个同步成服务器上的版本、并改写 `data/demo-mirror.json`、`data/downloads.json`。本地镜像比服务器新时（新演示还没部署），
    构建完要 `git checkout HEAD -- docs/public/demo docs/.vitepress/data/demo-mirror.json docs/.vitepress/data/downloads.json`
    再 `git clean -fdq -- docs/public/demo` 恢复，别把旧镜像提交进去。
- `tests/`: Node 内置测试（`npm test`，即 `node --test` 自动发现），覆盖下载数据同步、演示镜像逻辑与 i18n 消息表结构校验。
- 根目录：`package.json`（npm workspaces，命令代理到 `docs` workspace）、`vercel.json`（含 `/docs/*` → `/*` 301 重定向）。
  - `vercel.json` 的 `installCommand` 先把 Vercel 的浅克隆（深度 10、没配 remote）按仓库地址补全历史：
    文档页的「最后更新时间」、编辑者和 sitemap 的 lastmod 都读 `git log`，浅克隆下会全部落在第 10 个提交上。
    不用 `--filter=blob:none` 省流量：编辑者用的 `git log --follow` 要做改名检测，得读历史里的文件内容。

## 构建、测试与本地开发
- `npm run dev`: 本地开发，热更新（VitePress，端口 5174）。
- `npm run build`: 先同步下载数据与演示镜像，再生成静态站点到 `docs/.vitepress/dist`。
  - 演示镜像按入口指纹增量同步（秒级跳过）；源站不可用时保留现有镜像继续构建，`node scripts/sync-demo.mjs --strict` 可强制失败。
- `npm run preview`: 预览构建产物以做最终检查。
- `npm test`: 运行 `tests/` 下的 Node 测试。
- 建议流程：修改 → `dev` 自查 → `build` 无警告 → `preview` 终检。

## 编码风格与命名约定
- 缩进与行宽：2 空格；建议行宽 ≤ 100。
- Markdown：一级页面仅一个 `#` 标题，正文用 `##/###` 分级；使用有序小节与语义化标题。
- 文件命名：小写-中划线，例如 `start-hints.md`、`a-q.md`。
- 图片与资源：放入 `docs/public/`，文内使用路径 `/your-image.png`；命名含语义与日期，如 `feature-2025-08.png`。
- 代码块：标注语言；流程图用 ```mermaid ```。
- 样式：优先 Tailwind 工具类；必要时修改 `theme/custom.css`，避免全局污染。

## 测试与自检
- 本地启动无报错/明显告警；Mermaid 渲染正常。
- 链接与图片可用（避免"死链"）；移动端与深色模式检查。
- 构建通过且体积/控制台无异常。

## 提交与 Pull Request 规范
- 提交信息：简洁清晰，推荐 Conventional 类型前缀，例如：
  - `docs: 更新使用指南`、`fix: 解决死链`、`chore: 更新资源`。
- PR 要求：简述变更与动机，关联 Issue；如改动导航/侧边栏或样式，请附截图与受影响页面列表。
- 体量适中，专注单一主题；包含必要的回滚说明。

## 安全与配置提示（可选）
- 不提交密钥/令牌；截图需打码。
- 修改 `docs/.vitepress/config.js` 前通读配置，保持导航与侧栏一致性；全局脚本放在 `theme/index.js`。
