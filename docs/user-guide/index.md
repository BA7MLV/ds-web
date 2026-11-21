---
description: "面向最终用户的完整使用手册，覆盖桌面端（Windows / macOS / Linux）、移动端（Android）与自托管 WebUI / PWA。在线版：https://deepstudent.cn/user-guide/ · 按 v0.20.7（2026 年 11 月）版本编写，个别新功能需要升"
editLink: false
---

# Deep Student 用户指南

> 面向最终用户的完整使用手册，覆盖桌面端（Windows / macOS / Linux）、移动端（Android）与自托管 WebUI / PWA。
>
> 在线版：https://deepstudent.cn/user-guide/ · 按 v0.20.7（2026 年 11 月）版本编写，个别新功能需要升级到最新版才能看到。

## 新用户从这里开始

- **[01 · 快速上手](/start)**：10 分钟跑通「一键 API Key 自动配置 → 导资料 → 带着资料提问 → 生成导图、卡片、题目」的核心流程。
- **[学习桌面](/user-guide/workbench)**：桌面端的默认界面。16+1 应用、Dock、学习流阶段预设、窗口平铺、状态栏和快捷键都在这一章。

## 章节目录

### 对话与调研

| 章节 | 内容 |
|---|---|
| [02 · AI对话与会话管理](/user-guide/chat) | 学习空间、文档优先「边读边问」、生成式 UI（`openui-lang` / 交互沙箱）、Super 会话、回合 Diff 审阅与回退、DAG 拓扑抽屉、模型多选与推理强度、执行档位、会话搜索与导出 |
| [03 · 深度调研与智能记忆](/user-guide/research-memory) | 多步骤联网调研、9 个外部搜索引擎（含 DeepSeek 官方搜索与 Fetch）、实时 5 阶段研究仪表盘、AI 记忆管理与学习空间级记忆隔离 |

### 资料与阅读

| 章节 | 内容 |
|---|---|
| [04 · 资源库](/user-guide/learning-hub) | 导入资料（WASI-WASM / PDFium / 多编码）、挂载到学习空间、知识库索引与多模态页图直读、重新关联文件、回收站 |
| [05 · 文档阅读与翻译](/user-guide/reading-translation) | PDF / Word / EPUB 阅读、AI 论文导读、5 色语义高亮、跨应用 `pdfref://` 页码反链、框选提问 / 钉住对照 / 提取公式表格、翻译工作台与 7 种领域预设 |
| [06 · 论文搜索](/user-guide/paper-search) | arXiv / OpenAlex 检索与自动回退、批量下载入库与多源重试、引用格式、DOI 解析 |
| [19 · 音视频](/user-guide/media) | 音视频转写与 B 站链接/多 P 导入、应用内清晰度切换与浏览器桥配对、课中检查点与答错回跳、本课台账、章节化内联讲义阅读器、问刚才这段与选定字幕行制卡 |

### 笔记与创作

| 章节 | 内容 |
|---|---|
| [07 · 笔记](/user-guide/notes) | 富文本 Markdown 编辑、双链与 PDF / 音视频时间锚点反链、笔记模板、生成卡片与思维导图、AI 逐组 / Hunk Diff 审阅与撤销、标签实时同步 |
| [08 · 思维导图](/user-guide/mindmap) | 一句话或从笔记生成导图、导图 / 大纲双视图、画布快捷键轻提示、背诵模式（一键遮住要点、难点优先、接入今日冲刺、做成卡片）、导入导出 |
| [09 · 作文批改](/user-guide/essay) | 10 种内置批阅模式、分项评分与得分率、原文标注、逐句润色与参考范文、错误点入错题本与生成卡片 |
| [10 · 效率工具](/user-guide/productivity) | 待办与今日学习汇总、定时自动化任务、番茄钟与沉浸专注、学习统计中心、命令面板、语音输入（含 DeepSeek ASR） |

### 练习与记忆

| 章节 | 内容 |
|---|---|
| [11 · 题目集与练习](/user-guide/question-bank) | 13 种题型、9 种练习模式、持久化试卷与导出、共享材料题组、只读「查看答案」模式、AI 解析一键写入、跨题目集错题本与 FSRS-6 复习计划 |
| [12 · Anki制卡与模板](/user-guide/anki) | 对话制卡与一步制卡入口、任务看板、裸公式质检、KaTeX 自带字体模板渲染、导出 APKG 与 AnkiConnect 同步 |
| [13 · 闪卡复习](/user-guide/flashcards) | FSRS-6 间隔重复（桌面端含隔离的 FSRS-7 试跑脚本）、今日冲刺 / 考前准备度、记忆曲线与未来到期预测、跨应用出处与视频时刻回跳、卡片库与 `.apkg` 导入导出 |

### 配置与数据

| 章节 | 内容 |
|---|---|
| [14 · 模型与供应商配置](/user-guide/models) | 15 家预置供应商、一键 API Key 自动配置、DeepSeek 官方应用 API（9 项能力）、OpenCode Go 与 Codex 额度、渐进披露模型分配、6 种 OCR 引擎与五档思考强度 |
| [15 · 技能与MCP扩展](/user-guide/skills-mcp) | 58 个内置技能（学习精选 / 全部 / 系统与扩展）、社区技能市场与 SHA-256 信任校验、MCP 服务器接入、技能 / MCP / 插件选型对照 |
| [16 · 数据管理与云同步](/user-guide/data-sync) | 数据治理 7 标签、本地备份与恢复、Sync V5 引擎与扫码设备配对（桌面与桌面 WebUI 支持 WebDAV / S3 / 实验性 FTP，Android 仅 WebDAV）、`0.11.x → 0.20.x` 原地无损升级 |
| [20 · AI 插件工坊与插件管理](/user-guide/plugin-workshop) | 自然语言生成与热加载 `.dstuplugin` 插件、统一插件管理页、版本回滚与 UI 熔断、同进程安全边界与 `--safe-mode`、微信 iLink Bot 渠道插件（预览） |

### 多端与自托管

| 章节 | 内容 |
|---|---|
| [17 · 移动端指南](/user-guide/mobile) | Android（Capacitor 8.6 + SQLite WASM / OPFS）4×2 抽屉启动器、系统分享中断恢复、SAF 导出、平板沉浸式全屏、桌面 / 移动功能对照表 |
| [21 · WebUI 与 PWA 自托管](/user-guide/webui-pwa) | Node.js 24+ 自托管 Web 服务、令牌与 30 天 Cookie 鉴权、Nginx / Caddy 反向代理要点、桌面与手机主屏幕 PWA 安装、功能边界 |

## 阅读说明

- 全书以桌面端为基准。桌面端默认是「学习桌面」（应用在底部 Dock 里，开成窗口）；在设置里关掉学习桌面后是经典布局（左侧导航 + 单个页面）。两种布局里功能一样，只是入口位置不同，正文按学习桌面描述，必要时注明经典布局的入口。
- 每章末尾的「📱 移动端说明」小节介绍该功能在 Android 上的入口、手势和限制。移动端与桌面端最重要的差异汇总在 [17 · 移动端指南](/user-guide/mobile) 的功能对照表里；浏览器 / PWA 自托管边界见 [21 · WebUI 与 PWA 自托管](/user-guide/webui-pwa)。

## 约定

- 界面名称一律使用应用简体中文界面的原文，例如「资源库」「知识库索引」「学习空间」「插件工坊」。
- 标注「（实验性）」或「（预览）」的功能可能在后续版本中调整。
- 快捷键写作 `⌘` 时，Windows / Linux 对应 `Ctrl`；写作 `Ctrl` 时，macOS 对应 `⌘`。学习桌面的窗口快捷键在 macOS 上 `Ctrl+Alt` 对应 `⌘⌥`。

## 反馈

发现文档与应用行为不符、或有想补充的内容？欢迎到 [GitHub Issues](https://github.com/helixnow/deep-student/issues) 反馈。

---

> 本页同步自主仓库 [`docs/user-guide/README.md`](https://github.com/helixnow/deep-student/blob/main/docs/user-guide/README.md)。发现文档和应用对不上，欢迎在 [GitHub Issues](https://github.com/helixnow/deep-student/issues) 反馈。
