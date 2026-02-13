# DeepStudent

DeepStudent 是一款基于 **Tauri 2.0** 构建的 **AI 原生、本地优先** 开源学习系统（AGPL-3.0），以「**对话即入口**」的方式，把错题整理、学习资源管理、RAG 知识检索、Anki 制卡、练习与回顾整合为可持续的学习闭环。你可以自由配置多家 LLM/VLM 服务商与外部搜索引擎，让 AI 真正"读得懂、找得到、用得上"你的学习资料。

## 核心功能概览

- **Chat V2 智能对话**：多会话管理、流式输出、附件预览（图片/PDF/Office）、上下文引用、推理模式（思维链展示）、多模型并行对比、工具调用可视化。
- **Skills 技能系统（渐进披露）**：内置导师模式/制卡模式/文献综述/调研模式/深度学术；13 组工具能力按需加载（共 65 个工具）；支持自定义技能并可接入 MCP 生态。
- **VFS 学习资源中心（单一数据源，SSOT）**：笔记/教材/题目集/作文/翻译/导图等 8 类资源统一管理；全局搜索（名称 + 内容）；全文检索 + 向量检索（LanceDB），导入即自动索引。
- **笔记系统**：Markdown 编辑器、版本历史、标签与收藏、AI 辅助写作。
- **教材/资料管理**：支持 15+ 文档格式（PDF/Word/Excel/PPT/EPUB/Markdown…）；扫描版 PDF 自动 OCR（DeepSeek OCR / PaddleOCR）；内置阅读器与语义检索。
- **智能题库**：拍照识题（OCR）、题型识别、标签分类、题答分离、AI 解答；支持顺序/随机/错题优先/限时/模拟考试/每日一练/组卷等 8 种练习模式；SM-2 间隔重复、多维统计、CSV 导入导出。
- **Anki 智能制卡（CardForge 2.0）**：长文档智能分段、模板系统（含自定义 HTML/CSS/Mustache）、3D 预览、任务暂停/恢复、APKG 导出与 AnkiConnect 一键推送。
- **作文批改**：流式批改、多维评分与修改建议，支持手写作文 OCR。
- **翻译工作台**：多语言互译、双语对照、批量翻译、历史记录、质量评估、语气选择、TTS 朗读与自定义提示词。
- **知识导图**：多种布局、节点编辑与搜索、导出 OPML/Markdown/JSON/图片，样式可定制。
- **工作区（多 Agent 协作）**：主代理/子代理协作、任务分解与恢复、上下文共享与文档协作，用于复杂学习/调研任务。
- **本地优先与数据治理**：SQLite + LanceDB 本地存储；无需注册登录；分层备份（P0–P3）；数据导入导出；可选 WebDAV/S3 云同步。

## 生态与可配置能力

- **API 供应商（13+）**：OpenAI、Anthropic（Claude）、Google（Gemini）、SiliconFlow、DeepSeek、Ollama、Qwen、智谱、豆包、Minimax、Moonshot、Grok、Mistral、百度等。
- **外部搜索引擎（7）**：Google CSE、SerpAPI、Tavily、Brave、SearXNG、智谱 AI、博查 AI。
- **模型分配系统**：覆盖对话、制卡、嵌入、重排、总结、深度研究、OCR、翻译、回顾分析等 13 个配置点，并支持 SiliconFlow 一键配置。

---

本仓库为 DeepStudent 的官网与文档站（`ds-web`），包含：

- 官网：React + Vite（根目录）
- 文档：VitePress（`docs/`）

## 本地开发

```bash
npm i

# 官网
npm run dev

# 文档
npm run dev:docs

# 官网 + 文档同时启动
npm run dev:all
```

## 构建

```bash
npm run build
npm run preview
```
