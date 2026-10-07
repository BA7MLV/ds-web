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
  - `demo/`: 网页演示的**同源镜像**（主仓库 `npm run build:demo` 的产物），由 `scripts/sync-demo.mjs` 同步，勿手改。
    入口两个：`index.html`（主仓库 demo.html：对话演示 / 学习桌面 / 移动端）与 `app.html`（demo-app.html：用户指南每章
    只含该功能的单应用演示，`?app=<章节 slug>`）；`posters/<id>-light|dark.webp` 是发布时按真实界面拍的海报。
    hero 用经典布局（`/demo/index.html?scene=…`），「学习桌面」一节（`theme/components/DesktopDemo.vue`）用同一份镜像带 `desktop=1`。
    英文页两处都多带 `lang=en`：演示界面换成英文（文案按语言整包打在 `zh-CN-*.js` / `en-US-*.js` 里，运行时不下语言包），剧本内容仍是中文。
  - `features/`: 首页「使用流程」两张卡（`flow-*`）和功能区六扇窗的真实界面截图（`<名>-light|dark.webp`，取景框的 2 倍图），**由生成器产出，勿手改**（见下）。
  - `apps/`: 首页「全部应用」一节（`theme/components/HomeApps.vue`）用的应用图标，原样拷自主仓库 `src/features/workbench/icons/app-icons/`；
    应用列表和一句话说明在 i18n 的 `home.apps`，`tests/home-apps.test.mjs` 核对图标在、链接落到真实的用户指南页、中英一致。
- `scripts/`: 构建辅助脚本。
  - `sync-release-downloads.mjs`、`sync-demo.mjs` + `lib/`：构建期同步数据与演示镜像。
  - `gen-share-images.mjs`：分享卡（og:image）与「什么是 DeepStudent」主图，都从演示海报 `demo-poster.webp` 出，
    文案读 i18n 的首屏标题与副标。重拍海报或改首屏文案后跑一次；分享卡换图要换文件名（平台按 URL 缓存）。
  - `gen-features-live.mjs`：功能区六扇窗、「使用流程」两张卡的**真实界面截图**：在同源演示镜像里打开剧本会话，
    按取景框截深浅两张 2 倍图。取景框尺寸写在 `theme/utils/feature-shot.js`（生成器、`FeatureShot.vue`、测试共用一份），
    运行时 `theme/components/FeatureShot.vue` 两张都进 SSR、按 `<html>.dark` 只显示一张。（9 月底那版字符画已整个去掉。）
    闪卡复习不在聊天页，脚本会放开演示壳的视图守卫、在 mock IPC 外补几条 FSRS 命令。
    首页「学习桌面」那一整屏（`workbench`）：演示入口带 `desktop=1` 自己开学习桌面、摆好对话和闪卡两扇窗，
    这张图就是 `DesktopDemo.vue` 载入前的海报、也是触屏 / 窄屏上的成品，和实时桌面同一个画面（只把轮播后面露半截的卡藏了）。
    依赖 devDependency `playwright-core` + 本机 Chrome 与 cwebp。
    **取景框不许切开界面**：框边压到一行字、一张卡片 / 胶囊 / 图标，截出来就是半句话、少条边的残图。
    生成器会把压在上下两条边上的块（连同它下面 / 上面的内容）截图前藏掉、框里留白；压在左右两条边上的、
    藏掉超过四成框高的、深浅两色藏得不一样的、取景框越出窗口的，直接报错不出图 —— 这时调窗口宽度
    （对话栏要比取景框窄）或取景位置，别放宽检查。
    **演示镜像更新后、或调了取景框，跑一次 `node scripts/gen-features-live.mjs`**
    （`--check` 只查切边，把框四周的上下文图放到系统临时目录，不写产物）。
  - **演示镜像跟随主仓库正式版**：主仓库每次发版，Demo Publish 工作流用该版本构建演示、逐章烟测，传到 R2
    `https://download.deepstudent.cn/demo/<版本>/`（整份构建 + `manifest.json`：文件清单 sha256、各章演示 id / 标题 / 海报），
    并更新 `demo/latest.json`。本仓库 `.github/workflows/demo-sync.yml` 每小时跑 `sync-demo.mjs`，有新版就提交镜像，推送触发 Vercel 部署；
    构建期的 `sync-demo.mjs` 见指纹一致直接跳过，源站不可用时沿用已提交的镜像。
    `data/demo-mirror.json` 的 `apps` 就是用户指南演示目录：`theme/components/GuideDemo.vue` 按当前页 slug 找演示，
    `scripts/sync-user-guide.mjs` 在每章引言后插入 `<GuideDemo />`（没有演示的章节什么都不显示）。
    正文里只放海报，点开才在浮层里载入实时演示（`/demo/app.html?app=…`，学习桌面 / 移动端两章载入 `/demo/index.html`）。
  - 本地换演示镜像（主仓库还没发版、想先看效果）：主仓库 `NODE_OPTIONS=--max-old-space-size=8192 npm run build:demo`、
    `node scripts/demo/write-demo-manifest.mjs --version <标签>`，`npx vite preview --config vite.demo.config.ts --port 4173` 供着，
    这里 `DEMO_SOURCE=http://127.0.0.1:4173 DEMO_PIN="主仓库 <提交> 的本地构建" node scripts/sync-demo.mjs --force --strict`。
    **镜像钉住**（`demo-mirror.json` 的 `pinned`）时构建期和 Demo Sync 都不跟 latest.json；主仓库发布了同一版后删掉 `pinned`。
    也可以在主仓库手动跑 Demo Publish（ref 填 main）发一版到 R2，等 Demo Sync 自动同步。
- `tests/`: Node 内置测试（`npm test`，即 `node --test` 自动发现），覆盖下载数据同步、演示镜像逻辑与 i18n 消息表结构校验。
- 根目录：`package.json`（npm workspaces，命令代理到 `docs` workspace）、`vercel.json`（含 `/docs/*` → `/*` 301 重定向）。
  - `vercel.json` 的 `installCommand` 先把 Vercel 的浅克隆（深度 10、没配 remote）按仓库地址补全历史：
    文档页的「最后更新时间」、编辑者和 sitemap 的 lastmod 都读 `git log`，浅克隆下会全部落在第 10 个提交上。
    不用 `--filter=blob:none` 省流量：编辑者用的 `git log --follow` 要做改名检测，得读历史里的文件内容。
  - `headers`：`/assets/*`、`/demo/assets/*` 回 `public, max-age=31536000, immutable`。国内访客落在 Cloudflare 西雅图节点，
    不设的话 Vercel 默认 `max-age=0, must-revalidate`，节点每个请求都回源确认（`cf-cache-status: REVALIDATED`），一轮 0.4–2 秒，
    首屏演示要串行好几轮。这两个目录只能放文件名带内容哈希的文件，`tests/cache-headers.test.mjs` 守着。

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
