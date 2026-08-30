# 首页重设计（仿 workbuddy.cn）

日期：2026-08-30
状态：已确认（文案已按主仓库校准）

## 背景

将 DeepStudent 文档站首页从 VitePress 默认 `layout: home` 改造为类似
<https://www.workbuddy.cn/> 的现代产品落地页风格。

## 已确认决策

| 决策点 | 结论 |
|---|---|
| 板块构成 | 完整复刻：Hero → 功能场景区(tabs) → 深色亮点区 → 底部 CTA；去掉定价/登录/合作伙伴 |
| 视觉风格 | WorkBuddy 浅色粉/紫/橙柔和渐变 Hero + 白底区块 + 深色亮点区 |
| Hero 产品图 | 复用现有截图 `docs/public/main.png`，透视倾斜处理 |
| Hero 文案 | 衬线大标题 + 打字机轮换「我帮你 ____」 |
| 技术路线 | 自定义 Vue 页面组件（HomePage.vue）挂载到主题 |
| 文案口径 | 以主仓库 `helixnow/deep-student` 的 `README_CN.md` 为准，不自行编造功能点 |

## 文案口径（主仓库官方表述）

- 官方 slogan：「一个开源、本地优先的 AI 学习工作台」
- 官方口号：「不是学习难，是学习软件太散。」
- 官方描述：「把资料学习、笔记整理、思维导图、题目练习、翻译精读和复习制卡，装进一个统一的学习工作台。」
- 许可证：**AGPL-3.0**（注意不要写成 MIT）
- 平台：Win / Mac / Linux / Android 开箱即用（iOS 仅源码构建，首页不提）
- 本地优先：全部数据本地存储（SQLite + LanceDB + Blob），AES-256-GCM 加密敏感数据
- 多模型：12 家内置供应商模板，支持 OpenAI / DeepSeek / Ollama / Gemini 等，可自建端点

## 页面结构

```
Hero（柔和渐变背景 + 左文案 / 右产品截图）
→ 功能场景区（tabs 切换：资料对话 / 知识导图 / 题目练习 / Anki 制卡）
→ 深色亮点区（学习数据由你控制）
→ 底部 CTA（官方口号 + 下载）
→ 页脚沿用 VitePress 默认
```

## Hero 区

- 背景：浅色柔和渐变，粉(#fdf2f8) → 紫(#f5f3ff) → 橙(#fff7ed) 对角过渡；
  暗色模式换极淡暗色渐变
- 左侧文案：
  - 大标题（衬线）：「我帮你 ____」，打字机轮换「读文献 / 生成导图 / 出考题 / 批改作文」，
    光标闪烁（对应官方四大核心能力：资料学习对话、知识导图、题目集练习、作文批改）
  - 副标题（官方 slogan）：「一个开源、本地优先的 AI 学习工作台」
  - 小字（官方描述）：「资料学习、笔记整理、思维导图、题目练习、翻译精读和复习制卡，
    装进一个统一的学习工作台。」
  - 按钮：黑色主按钮「立即下载」→ `/download`；白色描边次按钮「快速开始」→ `/start`
- 右侧：`main.png` 产品截图，`perspective + rotateY` 透视倾斜 + 大圆角 + 柔和投影

## 功能场景区（白底，标题「你的学习好帮手」）

- 横向居中胶囊 tabs，选中项黑底白字，切换淡入 150ms ease-out
- 每个 tab 左文右图：小标题 + 两句说明 + 「了解更多 →」链接；右侧对应功能截图
  （圆角 + 轻投影）

| Tab | 说明文案（官方） | 链接 |
|---|---|---|
| 资料学习与智能对话 | 围绕你的材料持续学习，而不只是通用聊天。多模态输入、引用面板注入资料、深度推理模式 | `/user-guide/01-chat-v2` |
| 知识导图 | 把知识整理成结构。一句话生成完整知识体系，多轮对话编辑，节点遮挡背诵 | `/user-guide/02-learning-hub-assets/05-mindmap` |
| 题目集与练习 | 把教材、试卷变成可练习的题库。AI 自动提取或生成题目集，自动判分，知识点掌握度追踪 | `/user-guide/02-learning-hub-assets/03-question-bank` |
| Anki 智能制卡 | 把理解推进到长期记忆。自然语言触发制卡、批量生成，一键同步 Anki | `/user-guide/03-chatanki` |

## 深色亮点区（#111827 背景）

- 标题（官方理念）：「学习数据由你控制」（白色）
- 三张半透明卡片横排，简洁线性 SVG 图标：
  1. **本地优先** — 全部数据本地存储（SQLite + LanceDB + Blob），AES-256-GCM 加密敏感数据
  2. **开源免费** — AGPL-3.0 许可证，代码公开可审计；Win / Mac / Linux / Android 开箱即用
  3. **多模型自由接入** — 12 家内置供应商模板，支持 OpenAI / DeepSeek / Ollama / Gemini 等
- 静态网格，不做轨道环绕动画

## 底部 CTA

- 延续 Hero 柔和渐变背景，居中排版
- 大标题（官方口号）：「不是学习难，是学习软件太散。」
- 黑色主按钮「立即下载」→ `/download`
- 小字：「免费开源 · Win / Mac / Linux / Android」

## 暗色模式适配

- Hero / CTA 渐变换极淡暗色（`dark:` 前缀）
- Hero 截图容器与场景区截图加深色边框
- 深色亮点区在暗色模式改 #1f2937，避免与页面底色融合

## 图片素材

- Hero：`docs/public/main.png`（现有）
- 场景区 4 张功能截图：从主仓库 `example/` 目录下载真实截图，
  存入 `docs/public/` 并按语义命名：
  - `example/会话浏览.png` → `docs/public/home-chat.png`
  - `example/知识导图-3.png` → `docs/public/home-mindmap.png`
  - `example/题目集-3.png` → `docs/public/home-quiz.png`
  - `example/anki-制卡2.png` → `docs/public/home-anki.png`
  - 源地址：`https://raw.githubusercontent.com/helixnow/deep-student/main/example/<文件名>`
  - 若下载失败，fallback 用现有 `img/example/软件主页图-*.webp` 或纯 CSS 示意卡片

## 文件改动

| 文件 | 改动 |
|---|---|
| `docs/.vitepress/theme/components/HomePage.vue` | 新建，首页全部区块，Tailwind 样式（含 `dark:`），打字机用 `ref + setInterval`，不引入新依赖 |
| `docs/.vitepress/theme/index.js` | 全局注册 HomePage 组件 |
| `docs/index.md` | 保留 `layout: home` 与 title/description（SEO），删除 hero/features frontmatter，正文挂载 `<HomePage />`；若 vp-doc 排版样式干扰则改 `layout: page`，dev 时验证 |
| `docs/.vitepress/theme/custom.css` | 仅补充无法内联的样式（打字机光标 keyframes 等），不动品牌色变量 |

## 验证

`npm run dev` 自查 → `npm run build` 无警告 → `npm run preview` 终检 + 移动端/暗色模式检查。
提交时只 `git add` 本次改动文件（工作树存在其他未暂存改动，不要混入）。
