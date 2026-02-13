# DeepStudent 功能架构基准文档

> 本文档基于实际项目代码调研（二轮），描述 DeepStudent 的核心功能架构和展示层次。

---

## 架构概览

DeepStudent 采用 **"对话即入口"** 的设计理念，所有功能围绕以下架构轴展开：

```
┌─────────────────────────────────────────────────────────────┐
│                    Chat V2 (智能对话)                        │
│                         入口层                               │
└─────────────────────────┬───────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                    Skills (技能系统)                         │
│              5 个指令型技能 + 13 个工具组技能                 │
└─────────────────────────┬───────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│               Tool Calls (工具调用 / MCP)                    │
│                     65+ 内置工具                             │
└─────────────────────────┬───────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                  VFS (虚拟文件系统)                          │
│           8 种资源类型，27 个数据表，向量索引                 │
└─────────────────────────┬───────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                Applications (各类应用)                       │
│    Anki 制卡 / 作文批改 / 翻译 / 题目集 / 知识导图            │
└─────────────────────────────────────────────────────────────┘
```

这一架构实现了 **渐进披露**：用户通过对话交互，AI 根据需要激活技能、调用工具、访问资源，最终完成学习任务。

---

## 一、Chat V2 - 智能对话

Chat V2 是 DeepStudent 的核心交互入口，所有学习任务从对话开始。

### 1.1 基础对话能力

| 功能 | 说明 | 代码路径 |
|------|------|----------|
| 多会话管理 | 按时间分组（今天/昨天/7天/30天/更早） | `src/chat-v2/` |
| 流式响应 | SSE 流式输出，实时显示 AI 回复 | `StreamingMarkdownRenderer.tsx` |
| 消息操作 | 编辑/重试/复制/删除 | `src/chat-v2/components/` |
| Token 估算 | 实时显示上下文长度 | 输入框组件 |
| 回收站 | 已删除会话可恢复 | 会话管理 |
| 附件上传 | 图片、PDF、文档拖拽上传 | 输入框组件 |

### 1.1.1 块渲染插件（14 种）

Chat V2 采用插件化架构，支持多种内容块的渲染：

| 块类型 | 说明 | 代码路径 |
|--------|------|----------|
| `thinking` | 思维链展示 | `plugins/blocks/thinking.tsx` |
| `content` | 正文内容（Markdown） | `plugins/blocks/content.tsx` |
| `rag` | 文档知识库检索结果 | `plugins/blocks/rag.tsx` |
| `memory` | 用户记忆检索结果 | `plugins/blocks/memory.tsx` |
| `webSearch` | 网络搜索结果 | `plugins/blocks/webSearch.tsx` |
| `mcpTool` | MCP 工具调用 | `plugins/blocks/mcpTool.tsx` |
| `imageGen` | 图像生成 | `plugins/blocks/imageGen.tsx` |
| `ankiCardsBlock` | Anki 卡片生成 | `plugins/blocks/ankiCardsBlock.tsx` |
| `todoList` | 任务列表 | `plugins/blocks/todoList.tsx` |
| `workspaceStatus` | 工作区状态 | `plugins/blocks/workspaceStatus.tsx` |
| `sleepBlock` | 睡眠块（等待子代理） | `plugins/blocks/sleepBlock.tsx` |
| `subagentEmbed` | 子代理嵌入块 | `plugins/blocks/subagentEmbed.tsx` |
| `subagentRetry` | 子代理重试块 | `plugins/blocks/subagentRetry.tsx` |
| `toolLimit` | 工具调用限制提示 | `plugins/blocks/toolLimit.tsx` |

### 1.1.2 消息渲染能力

- **Markdown 渲染**：代码高亮、数学公式（KaTeX）、Mermaid 图表
- **代码块执行**：Mermaid、SVG、HTML、XML 实时渲染
- **附件预览**：图片、PDF、Office 文档
- **引用显示**：笔记、教材、题目集、翻译、文件夹
- **来源面板**：RAG 来源、记忆来源、网络搜索来源
- **Anki 卡片**：卡片生成、预览、编辑
- **工具调用可视化**：时间线、状态、结果

### 1.2 RAG 知识检索

基于 VFS 虚拟文件系统的 RAG 检索，自动增强回答。

| 功能 | 说明 | 代码路径 |
|------|------|----------|
| 笔记检索 | 搜索 Markdown 笔记内容 | `src/config/rag.ts` |
| 教材检索 | PDF/Word 全文检索 | `RagPanel.tsx` |
| 题目集检索 | 历史题目语义匹配 | `src/chat-v2/plugins/blocks/rag.tsx` |
| 多模态检索 | 图片内容向量检索 | 配置项：`multimodalRag` |
| 重排序 | LLM 语义重排提升相关性 | 配置项：`enableReranking` |
| Top-K 配置 | 检索结果数量（1-50） | `topK` 参数 |

### 1.3 推理模式（思维链）

支持推理模型（o1/DeepSeek-R1 等），展示 AI 完整推理过程。

| 功能 | 说明 | 代码路径 |
|------|------|----------|
| 思维链展示 | 显示 AI 推理过程 | `ThinkingChain.css` |
| 可展开/折叠 | 用户可选择查看详情 | `ThinkingChainDebugPlugin.tsx` |
| 推理模型适配 | 支持 thinking/reasoning 参数 | 模型配置 |

### 1.4 多模型并行对比

选择多个模型同时回答同一问题，对比回答质量。

| 功能 | 说明 | 代码路径 |
|------|------|----------|
| 多模型选择 | 勾选 2+ 模型并行生成 | `MultiSelectModelPanel.tsx` |
| 并行变体视图 | 卡片形式并排显示 | `variantActions.ts` |
| 功能开关 | `enableMultiModelSelect: true` | `featureFlags.ts` |

### 1.5 上下文引用

直接引用学习资源作为对话上下文。

| 功能 | 说明 |
|------|------|
| 资源引用 | 拖拽笔记/教材/题目集到对话 |
| 来源面板 | 显示 AI 回答引用的来源 |
| 来源类型 | 知识库 / 用户记忆 / 网络搜索 |

---

## 二、Skills - 技能系统

技能系统是 DeepStudent 的可扩展 AI 能力增强机制，基于 **渐进披露** 架构设计。

### 2.1 设计理念

- **按需加载**：工具只在技能激活时注入上下文
- **减少 Token 消耗**：避免全量加载所有工具
- **提高专注度**：AI 聚焦当前任务
- **三级覆盖**：内置 → 全局 → 项目级

### 2.2 指令型技能（4 个）

改变 AI 行为模式的预配置技能。

| 技能 ID | 名称 | 说明 | 适用场景 |
|---------|------|------|----------|
| `tutor-mode` | 导师模式 | 苏格拉底式学习导师，通过引导式提问帮助学生理解，不直接给答案 | 学习辅导、概念理解、作业指导 |
| `card-forge-mode` | 制卡模式 | Anki 制卡助手，将学习材料转化为记忆卡片，支持超大文档分段 | 知识点整理、考试复习、语言学习 |
| `literature-review` | 文献综述助手 | 学术文献调研、整理和综述撰写，支持研究方法对比 | 毕业论文、学术研究、开题报告 |
| `research-mode` | 调研模式 | 系统化调研助手，使用 todo 管理进度，网络搜索收集信息 | 技术调研、市场调研、竞品分析 |

**代码路径：** `src/chat-v2/skills/builtin/index.ts`

### 2.3 工具组技能（13 个，共 65 个工具）

按需加载的工具能力组，激活后 AI 可调用相关工具。

| 技能 ID | 名称 | 工具数 | 工具列表 |
|---------|------|--------|----------|
| `knowledge-retrieval` | 知识检索 | 5 | `rag_search`、`multimodal_search`、`unified_search`、`memory_search`、`web_search` |
| `canvas-note` | 画布笔记 | 7 | `note_read`、`note_append`、`note_replace`、`note_set`、`note_create`、`note_list`、`note_search` |
| `vfs-memory` | VFS 记忆 | 6 | `memory_read`、`memory_write`、`memory_update_by_id`、`memory_delete`、`memory_write_smart`、`memory_list` |
| `learning-resource` | 学习资源 | 4 | `resource_list`、`resource_read`、`resource_search`、`folder_list` |
| `mindmap-tools` | 思维导图 | 3 | `mindmap_create`、`mindmap_update`、`mindmap_delete` |
| `attachment-tools` | 附件工具 | 2 | `attachment_list`、`attachment_read` |
| `todo-tools` | 待办事项 | 4 | `todo_init`、`todo_update`、`todo_add`、`todo_get` |
| `anki-tools` | Anki 工具 | 6 | `anki_generate_cards`、`anki_control_task`、`anki_export_cards`、`anki_list_templates`、`anki_analyze_content`、`anki_query_progress` |
| `qbank-tools` | 题库工具 | 12 | `qbank_list`、`qbank_list_questions`、`qbank_get_question`、`qbank_submit_answer`、`qbank_update_question`、`qbank_get_stats`、`qbank_get_next_question`、`qbank_generate_variant`、`qbank_batch_import`、`qbank_reset_progress`、`qbank_export`、`qbank_import_document` |
| `workspace-tools` | 工作区工具 | 9 | `workspace_create`、`workspace_create_agent`、`workspace_send`、`workspace_query`、`workspace_set_context`、`workspace_get_context`、`workspace_update_document`、`workspace_read_document`、`coordinator_sleep` |
| `web-fetch` | 网页抓取 | 1 | `web_fetch` |
| `subagent-worker` | 子代理工作器 | 2 | `workspace_send`、`workspace_query` |

**代码路径：** `src/chat-v2/skills/builtin-tools/`

### 2.3.1 技能依赖关系

```
composite 技能依赖图：

card-forge-mode ──────► anki-tools

literature-review ────► knowledge-retrieval
                  ├───► todo-tools
                  ├───► canvas-note
                  ├───► web-fetch
                  ├───► learning-resource
                  └───► vfs-memory

research-mode ────────► knowledge-retrieval
                  ├───► todo-tools
                  ├───► canvas-note
                  └───► web-fetch

vfs-memory ───────────► knowledge-retrieval
mindmap-tools ────────► learning-resource
```

### 2.4 自定义技能

用户可创建、编辑、导入/导出自定义技能。

| 功能 | 说明 |
|------|------|
| 创建技能 | 填写元数据 + 编写指令内容 |
| 编辑内置技能 | 自定义版本覆盖内置版本 |
| 导入/导出 | `.skill.md` 文件格式 |
| 默认技能 | 新会话自动激活 |
| 技能收藏 | 常用技能快速访问 |

**存储位置：**
- 全局技能：`~/.deep-student/skills/`
- 项目技能：`<项目根目录>/.skills/`

**代码路径：** `src/components/skills-management/`

---

## 三、Tool Calls - 工具调用

工具调用通过 MCP（Model Context Protocol）协议实现，连接 AI 与各种能力。

### 3.1 MCP 服务

| 功能 | 说明 | 代码路径 |
|------|------|----------|
| SSE 传输 | Server-Sent Events | `src/mcp/mcpService.ts` |
| WebSocket 传输 | 双向通信 | `mcpService.ts` |
| HTTP 传输 | Streamable HTTP | `mcpService.ts` |
| Stdio 代理 | 本地命令行工具 | `src-tauri/src/mcp/stdio_proxy.rs` |
| 自动重连 | 断线自动恢复 | 内置机制 |
| 工具缓存 | 减少重复请求 | 本地缓存 |

### 3.2 内置工具

技能激活时按需加载的内置工具：

**知识检索工具：**
- `builtin-rag_search` - RAG 文本搜索
- `builtin-multimodal_search` - 多模态图片搜索
- `builtin-unified_search` - 统一搜索
- `builtin-memory_search` - 记忆搜索
- `builtin-web_search` - 网络搜索（支持 7 种引擎）

**Anki 工具：**
- `builtin-anki_generate_cards` - 生成卡片
- `builtin-anki_control_task` - 控制任务（暂停/恢复/重试/取消）
- `builtin-anki_export_cards` - 导出卡片
- `builtin-anki_list_templates` - 列出模板
- `builtin-anki_analyze_content` - 预分析内容
- `builtin-anki_query_progress` - 查询进度

**资源管理工具：**
- `builtin-resource_list` - 列出资源
- `builtin-resource_read` - 读取资源
- `builtin-resource_search` - 搜索资源
- `builtin-folder_list` - 列出文件夹

### 3.3 外部搜索引擎

| 引擎 | 说明 | 配置项 |
|------|------|--------|
| Google CSE | 自定义搜索 | `webSearchGoogleKey`, `webSearchGoogleCx` |
| SerpAPI | 付费搜索 API | `webSearchSerpApiKey` |
| Tavily | AI 优化搜索 | `webSearchTavilyKey` |
| Brave Search | 隐私优先 | `webSearchBraveKey` |
| SearXNG | 开源元搜索 | `webSearchSearxngEndpoint` |
| 智谱 AI | 中文优化 | `webSearchZhipuKey` |
| 博查 AI | AI 应用专用 | `webSearchBochaKey` |

**代码路径：** `src/chat-v2/skills/builtin-tools/knowledge-retrieval.ts`

---

## 四、VFS - 虚拟文件系统

VFS 是所有学习资源的统一数据源，AI 可读可检索。

### 4.1 资源类型

| 类型 | 前缀 | 说明 | 编辑器/查看器 |
|------|------|------|---------------|
| 笔记 | `nt_` | Markdown 格式 | Markdown 编辑器 |
| 教材 | `tb_` | PDF/Office 文档 | PDF 阅读器 |
| 题目集 | `ex_` | AI 识别的题目 | 题目查看器 |
| 作文 | `es_` | 作文批改 | 作文编辑器 |
| 翻译 | `tr_` | 翻译练习 | 翻译编辑器 |
| 知识导图 | `mm_` | 思维导图 | 导图编辑器 |
| 图片 | - | 图片资源 | 图片查看器 |
| 文件 | - | 其他文档 | 预览器 |

**代码路径：** `src/dstu/types/path.ts`

### 4.2 文档格式支持

```
支持的格式（15+）：
├── Office 文档
│   ├── Word (.docx)
│   ├── Excel (.xlsx, .xls, .xlsb, .ods)
│   └── PowerPoint (.pptx)
├── PDF
│   ├── 文本型 PDF（直接提取）
│   └── 扫描型 PDF（OCR 识别）
├── 电子书
│   └── EPUB (.epub)
├── 文本格式
│   ├── 纯文本 (.txt)
│   ├── Markdown (.md)
│   ├── HTML (.html, .htm)
│   └── 富文本 (.rtf)
└── 数据格式
    ├── CSV (.csv)
    ├── JSON (.json)
    └── XML (.xml)
```

**代码路径：** `src-tauri/src/vfs/handlers.rs` (1639-1644行)

### 4.3 向量化索引

| 功能 | 说明 | 代码路径 |
|------|------|----------|
| 自动索引 | 导入时自动向量化 | `embedding_service.rs` |
| LanceDB 存储 | 向量数据库 | `lance_store.rs` |
| 表命名 | `vfs_emb_{modality}_{dim}` | Schema 定义 |
| FTS 索引 | 全文检索（ngram 分词） | FTS 配置 |
| 批量处理 | 支持大文档分段 | 批量嵌入 |
| 重试机制 | 失败自动重试 | 重试逻辑 |

### 4.4 文件管理

| 功能 | 说明 |
|------|------|
| 访达式布局 | 熟悉的文件管理体验 |
| 桌面快捷方式 | 常用资源快速访问 |
| 收藏夹 | 重要资源标星收藏 |
| 回收站 | 已删除资源可恢复 |
| 全局搜索 | 名称 + 内容搜索 |
| 批量操作 | 多选、移动、删除 |

**代码路径：** `src/components/learning-hub/`

---

## 五、Applications - 各类应用

基于 VFS 构建的垂直应用场景。

### 5.1 Anki 智能制卡（CardForge 2.0）

| 功能 | 说明 | 代码路径 |
|------|------|----------|
| 文档解析 | 支持 15+ 格式 | `AnkiCardGeneration.tsx` |
| 智能分段 | 长文档自动切割 | 后端服务 |
| AI 制卡 | 知识点提取 + 问答生成 | `enhanced_anki_service.rs` |
| 自定义要求 | 指定制卡风格和重点 | 提示词配置 |
| 多模板支持 | 极简/代码/填空/概念等 | 模板系统 |
| 自定义模板 | HTML + CSS + Mustache | 模板编辑器 |
| 3D 预览 | 卡片 3D 翻转效果 | `Card3DPreview.tsx` |
| 断点续传 | 暂停/恢复大文档处理 | `pause/resume` 方法 |
| APKG 导出 | 标准 Anki 包格式 | 导出功能 |
| AnkiConnect | 一键推送到 Anki | `ankiConnectClient.ts` |

### 5.2 作文批改

| 功能 | 说明 | 代码路径 |
|------|------|----------|
| 流式批改 | 实时显示批改结果 | `EssayGradingWorkbench.tsx` |
| 多维评分 | 语法、结构、内容等 | `essay-grading/` |
| 修改建议 | 针对性改进意见 | AI 生成 |
| 批改历史 | 保存历史记录 | 数据存储 |
| OCR 识别 | 支持手写作文图片 | OCR 集成 |

### 5.3 知识导图

| 功能 | 说明 | 代码路径 |
|------|------|----------|
| 多种布局 | 思维导图、逻辑树、组织架构图等 | `mindmap/layouts/` |
| 节点编辑 | 添加/编辑/删除节点 | 编辑功能 |
| 节点搜索 | 快速定位节点 | 搜索功能 |
| 导出格式 | OPML、Markdown、JSON、图片 | 导出功能 |
| 样式自定义 | 颜色、字体、连线等 | 样式系统 |

**代码路径：** `src/components/mindmap/`

### 5.4 翻译工作台

| 功能 | 说明 |
|------|------|
| 文本翻译 | 输入文本即时翻译 |
| OCR 识别 | 图片/文档文字识别后翻译 |
| 对照视图 | 段落级双语对照显示 |
| 批量翻译 | 逐行翻译长文本 |
| 历史记录 | 收藏、搜索、恢复历史翻译 |
| 质量评分 | AI 评估翻译质量 |
| 语气选择 | 正式/非正式风格 |
| TTS 朗读 | 文本转语音朗读 |
| 自定义提示词 | 个性化翻译要求 |

**支持语言（11 种）：** 中文、英语、日语、韩语、法语、德语、西班牙语、俄语、阿拉伯语、葡萄牙语、意大利语

**代码路径：** `src/locales/zh-CN/translation.json`

### 5.5 题目集（拍照识题）

| 功能 | 说明 |
|------|------|
| 拍照上传 | 相机拍照识别题目 |
| OCR 识别 | DeepSeek OCR / PaddleOCR |
| 题型识别 | 自动识别题目类型 |
| 标签分类 | 自动打标签分类 |
| 题答分离 | 题目与答案/解析分离 |
| AI 解答 | 自动调用对话分析题目 |
| 向量化 | 支持语义检索 |

**练习模式（8 种）：**

| 模式 | 说明 |
|------|------|
| 顺序练习 | 按顺序逐题练习 |
| 随机练习 | 随机抽题练习 |
| 错题优先 | 优先复习错题 |
| 按标签 | 按知识点标签练习 |
| 限时练习 | 倒计时、进度、正确率统计 |
| 模拟考试 | 题型配比、难度配比、成绩单 |
| 每日一练 | 智能推荐、打卡日历、连续打卡 |
| 组卷练习 | 题型配置、难度筛选、标签筛选、导出 |

**代码路径：** `src/locales/zh-CN/practice.json`, `src/locales/zh-CN/exam_sheet.json`

### 5.6 工作区（多 Agent 协作）

| 功能 | 说明 |
|------|------|
| 主代理 | 协调整体任务 |
| 子代理 | 执行具体子任务 |
| 睡眠机制 | 主代理等待子代理完成 |
| 任务恢复 | 支持子代理任务恢复 |
| 上下文共享 | 代理间共享上下文 |
| 文档协作 | 共享文档读写 |

**代码路径：** `src/chat-v2/workspace/`

---

## 六、数据层

### 6.1 本地存储

| 数据库 | 用途 | 核心表数 | 技术 |
|--------|------|----------|------|
| `mistakes.db` | 错题、卡片、设置 | - | SQLite |
| `chat_v2.db` | 对话会话数据 | 11 | SQLite |
| `vfs.db` | VFS 资源元数据 | 27 | SQLite |
| `llm_usage.db` | LLM 使用统计 | - | SQLite |
| `lance/` | 向量索引 | - | LanceDB |

#### chat_v2.db 核心表

| 表名 | 说明 |
|------|------|
| `chat_v2_sessions` | 会话表（标题、模式、工作区等） |
| `chat_v2_messages` | 消息表（角色、块、变体等） |
| `chat_v2_blocks` | 块表（类型、内容、工具调用等） |
| `chat_v2_attachments` | 附件表 |
| `chat_v2_session_state` | 会话状态（参数、RAG 配置等） |
| `chat_v2_todo_lists` | TodoList 状态表 |
| `workspace_index` | 工作区索引表 |
| `sleep_block` | 睡眠块表（代理协调） |
| `subagent_task` | 子代理任务表 |

#### vfs.db 核心表

| 表名 | 说明 |
|------|------|
| `resources` | 资源表（SSOT，统一存储所有内容） |
| `notes` | 笔记元数据表 |
| `notes_versions` | 笔记版本表 |
| `files` | 文件统一存储表 |
| `exam_sheets` | 题目集元数据表 |
| `translations` | 翻译元数据表 |
| `essays` | 作文批改元数据表 |
| `essay_sessions` | 作文会话元数据表 |
| `blobs` | 大文件外部存储表（SHA-256） |
| `folders` | 文件夹表 |
| `folder_items` | 文件夹内容关联表 |
| `mindmaps` | 知识导图元数据表 |
| `questions` | 题目实体表 |
| `question_history` | 题目版本历史表 |
| `question_bank_stats` | 题目集统计缓存表 |
| `questions_fts` | 题目全文检索（FTS5） |
| `review_plans` | 复习计划表（SM-2 算法） |
| `review_history` | 复习历史记录表 |
| `vfs_indexing_config` | 索引配置表 |
| `vfs_index_units` | 索引单元表 |
| `vfs_index_segments` | 索引段表（最小检索单位） |
| `vfs_embedding_dims` | 向量维度注册表 |

**代码路径：** `src-tauri/src/database/mod.rs`

### 6.2 分层备份

| 层级 | 内容 | 说明 |
|------|------|------|
| Core (P0) | 数据库 + 配置 | 核心数据，必须备份 |
| Important (P1) | + 笔记资源 | 重要数据 |
| Rebuildable (P2) | + 向量索引 | 可重建数据 |
| LargeAssets (P3) | + 媒体文件 | 大型资产 |

**代码路径：** `src-tauri/src/data_governance/backup/mod.rs`

### 6.3 云同步

| 方式 | 说明 | 代码路径 |
|------|------|----------|
| WebDAV | 自建云盘同步 | `cloud_storage/webdav.rs` |
| S3 | 对象存储同步（可选） | `cloud_storage/s3.rs` |

---

## 七、系统配置

### 7.1 API 供应商（13+ 个）

| 供应商 | 适配器 | 说明 |
|--------|--------|------|
| OpenAI | `openai` | GPT 系列模型 |
| Anthropic | `anthropic` / `claude` | Claude 系列模型 |
| Google | `google` / `gemini` | Gemini 系列模型 |
| **SiliconFlow** ⭐ | `siliconflow` | 推荐，支持一键配置 |
| DeepSeek | `deepseek` | DeepSeek 系列模型 |
| Ollama | `ollama` | 本地部署模型 |
| Qwen | `qwen` | 阿里通义千问/百炼 |
| Zhipu | `zhipu` | 智谱 GLM 系列 |
| Doubao | `doubao` | 字节豆包/火山方舟 |
| Minimax | `minimax` | Minimax 模型 |
| Moonshot | `moonshot` | 月之暗面/Kimi |
| Grok | `grok` / `xai` | xAI Grok |
| Mistral | `mistral` | Mistral AI |
| Baidu | `ernie` / `baidu` | 百度文心 |

**适配器能力：**
- 流式响应：支持 SSE 流式输出
- 工具调用：支持 Function Calling
- 推理模式：支持 thinking/reasoning 参数
- 多模态：支持图片/视频输入
- 参数适配：自动处理各供应商参数差异

**代码路径：** `src-tauri/src/llm_adapters/`

### 7.2 模型分配系统（13 个配置点）

| 配置项 | 用途 | 说明 |
|--------|------|------|
| `model1_config_id` | 主模型（通用对话） | Chat V2 主对话 |
| `model2_config_id` | 副模型（备用/并行） | 多模型并行生成变体 |
| `anki_card_model_config_id` | Anki 制卡模型 | 卡片生成 |
| `embedding_model_config_id` | 嵌入模型 | RAG 文本向量化 |
| `reranker_model_config_id` | 重排序模型 | 检索结果重排序 |
| `summary_model_config_id` | 总结模型 | 内容总结 |
| `deep_research_model_config_id` | 深度研究模型 | 深度研究模式 |
| `chat_title_model_config_id` | 标题生成模型 | 会话标题自动生成 |
| `exam_sheet_ocr_model_config_id` | OCR 模型 | 题目集 OCR |
| `translation_model_config_id` | 翻译模型 | 文档翻译 |
| `vl_embedding_model_config_id` | 多模态嵌入模型 | 图片/视频向量化 |
| `vl_reranker_model_config_id` | 多模态重排序模型 | 多模态检索结果重排序 |
| `review_analysis_model_config_id` | 回顾分析模型 | 错题回顾分析 |

**代码路径：** `src-tauri/src/llm_manager/mod.rs`

### 7.3 SiliconFlow 一键配置

| 功能模块 | 默认模型 |
|----------|----------|
| 第一模型（OCR + 分类） | Qwen3-VL-30B |
| 第二模型（解答 + 对话） | DeepSeek-V3.2 |
| Anki 制卡模型 | Qwen3-30B |
| RAG 嵌入模型 | BGE-M3 |
| RAG 重排序模型 | BGE-Reranker-V2-M3 |
| 总结生成模型 | DeepSeek-V3.2 |
| 标题/标签生成模型 | Ling-mini-2.0 |
| 深度研究模型 | Qwen3-30B |
| 翻译模型 | Hunyuan-MT-7B |
| OCR 模型 | DeepSeek-OCR, PaddleOCR-VL |

**代码路径：** `src/components/settings/SiliconFlowSection.tsx`

### 7.4 OCR 引擎

| 引擎 | 说明 |
|------|------|
| DeepSeek OCR | 默认引擎 |
| PaddleOCR-VL-1.5 | 备选引擎 |

**功能特性：**
- 支持坐标定位（grounding）
- 支持图片、PDF 识别
- 支持扫描版 PDF 自动 OCR
- 引擎对比测试功能

**代码路径：** `src-tauri/src/ocr_adapters/`

---

## 八、功能数据汇总

| 类别 | 数量 | 说明 |
|------|------|------|
| API 供应商 | 13+ 个 | 支持主流 LLM 服务商 |
| 搜索引擎 | 7 个 | Google/SerpAPI/Tavily/Brave/SearXNG/智谱/博查 |
| 文档格式 | 15+ 种 | Office/PDF/EPUB/文本/数据 |
| 指令型技能 | 4 个 | 导师/制卡/文献综述/调研 |
| 工具组技能 | 12 个 | 按需加载工具能力 |
| **内置工具总数** | **65 个** | 知识检索/笔记/记忆/资源/导图/附件/Todo/Anki/题库/工作区/网页/子代理/模板设计/交互提问 |
| 块渲染插件 | 14 种 | Chat V2 内容块类型 |
| 资源类型 | 8 种 | 笔记/教材/题目集/作文/翻译/导图/图片/文件 |
| 支持语言 | 11 种 | 翻译功能支持的语言 |
| 练习模式 | 8 种 | 题目集练习模式 |
| 数据库实例 | 4 个 | SQLite 数据存储 |
| chat_v2.db 表 | 11 个 | 对话相关数据表 |
| vfs.db 表 | 27 个 | 资源相关数据表 |
| 模型配置点 | 13 个 | 模型分配系统 |
| 备份层级 | 4 级 | Core/Important/Rebuildable/LargeAssets |

---

## 九、官网展示建议

### 核心展示轴

```
用户对话 → AI 激活技能 → 调用工具 → 访问 VFS 资源 → 完成学习任务
```

### 推荐展示顺序

1. **智能对话**（入口）
   - RAG 知识增强（笔记/教材/题目集自动检索）
   - 推理模式（思维链展示）
   - 多模型并行对比
   - 14 种内容块渲染

2. **技能系统**（能力）
   - 导师模式（苏格拉底式教学）
   - 制卡模式（Anki 卡片生成助手）
   - 文献综述助手（学术研究工作流）
   - 调研模式（系统化调研）
   - 65 个内置工具按需加载

3. **学习资源**（VFS）
   - 笔记管理（Markdown 编辑器）
   - 教材阅读（PDF/Office 阅读器）
   - 拍照识题（OCR + AI 解答）
   - 8 种资源类型统一管理

4. **垂直应用**
   - Anki 智能制卡（3D 预览、断点续传、AnkiConnect）
   - 作文批改（多维评分、修改建议）
   - 翻译工作台（11 种语言、对照视图）
   - 题目集（8 种练习模式、组卷生成）
   - 知识导图（多种布局、导出格式）

5. **多 Agent 协作**
   - 工作区系统
   - 主代理/子代理协调
   - 任务分解与恢复

6. **本地优先**（安全）
   - SQLite + LanceDB 本地存储
   - 分层备份（P0-P3）
   - WebDAV/S3 云同步
   - 完整审计日志

### 差异化亮点

| 功能 | 亮点 |
|------|------|
| 渐进披露架构 | 工具按需加载，减少 Token 消耗 |
| 65 个内置工具 | 覆盖学习全场景 |
| 多模型并行对比 | 同时对比多个模型回答 |
| 思维链展示 | 支持推理模型完整推理过程 |
| 3D 卡片预览 | Anki 卡片 3D 翻转效果 |
| 断点续传 | 大文档制卡暂停/恢复 |
| 8 种练习模式 | 题目集多样化练习 |
| 多 Agent 协作 | 复杂任务分解执行 |
| 13+ API 供应商 | 灵活选择 LLM 服务 |
| SiliconFlow 一键配置 | 快速完成全部模型分配 |

---

*文档版本：2.0.0*
*最后更新：2026-02-02*
*基于代码调研（二轮），无臆测内容*
