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
- `docs/`: 文档根目录（Markdown 内容）。
- `docs/.vitepress/`: 站点配置与主题。
  - `config.js`: 标题、导航、侧边栏、本地搜索、编辑链接等。
  - `theme/`: 自定义主题（`index.js` 挂载 medium-zoom、暗色偏好；`custom.css` 已引入 Tailwind）。
- `docs/guide/`: 指南与专题文档。
- `docs/public/`: 公共静态资源（图片、图标）。
- 根目录：`tailwind.config.js`、`postcss.config.js`、`package.json`。

## 构建、测试与本地开发
- `npm run dev`: 本地开发，热更新（VitePress）。
- `npm run build`: 生成静态站点到 `docs/.vitepress/dist`。
- `npm run preview`: 预览构建产物以做最终检查。
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
