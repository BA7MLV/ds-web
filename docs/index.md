# DeepStudent

![主图](/deepstudent-head.png)

<div class="hero-scroll-hint">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
</div>

---

<div style="text-align: center;">
    <p>关注我们的小红书账号：<a href="https://www.xiaohongshu.com/user/profile/648898bb0000000012037f8f?xsec_token=ABFtyTy-x0Maimelyl74sy1an9VAHPgOOEjqScJeuijI8%3D&xsec_source=pc_search">小红书</a></p>
    <p>加入我们的社群：<a href="https://qm.qq.com/q/1lTUkKSaB6">QQ群（310134919）</a></p>
</div>

---

::: warning 简介
DeepStudent 是一款基于 Tauri 2.0 构建的 **AI 原生、本地优先**开源学习系统（AGPL-3.0），以「**对话即入口**」的方式，把智能对话、学习资源管理、RAG 知识检索、Anki 制卡、题库练习与回顾整合为可持续的学习闭环。
:::

---

### 核心功能

| 模块 | 说明 |
|:---|:---|
| **Chat V2 智能对话** | 多会话管理、流式输出、上下文引用、推理模式、多模型对比、工具调用可视化 |
| **Skills 技能系统** | 65 个内置工具按需加载，5 个指令技能 + 13 组工具组，支持自定义技能与 MCP 生态 |
| **VFS 学习资源中心** | 笔记 / 教材 / 题目集 / 作文 / 翻译 / 导图等 8 类资源统一管理，全文检索 + 向量检索（LanceDB） |
| **CardForge 2.0** | 长文档智能分段、多模板系统、3D 预览、APKG 导出、AnkiConnect 一键推送 |
| **智能题库** | OCR 识题、AI 解析、8 种练习模式（顺序 / 随机 / 错题优先 / 限时 / 模拟考试 / 每日一练 / 组卷等） |
| **作文批改** | 7+ 考试类型、流式多维评分、手写作文 OCR、多轮迭代修改 |
| **翻译工作台** | 11 种语言互译、正式度调节、TTS 朗读、历史自动归档 |
| **知识导图** | 多种布局、双视图（导图/大纲）、背诵模式、导出 OPML / Markdown / JSON |
| **深度阅读** | PDF / Word 分屏阅读、AI 逐页精读、双引擎 OCR |
| **深度调研** | 多步搜索自动规划、结构化报告、自动归档至笔记 |
| **工作区** | 多 Agent 协作、子代理任务分解与恢复 |

### 技术亮点

- **AI 原生数据层**：统一 VFS 作为单一数据源（SSOT），资源自动向量化，AI 可读、可检索、可操作
- **渐进披露架构**：Skills 系统按需加载工具，减少上下文占用，AI 更聪明
- **本地优先**：所有数据存储在本地（SQLite + LanceDB + Blob），AES-256-GCM 加密，支持完整审计与分层备份
- **跨平台**：支持 macOS、Windows、iOS、Android
- **开源可扩展**：AGPL-3.0 协议，支持自定义技能与 MCP 工具扩展

### 生态与配置

- **13+ API 供应商**：OpenAI、Anthropic (Claude)、Google (Gemini)、SiliconFlow、DeepSeek、Ollama、Qwen、智谱、豆包、Minimax、Moonshot、Grok、Mistral 等
- **7 种外部搜索引擎**：Google CSE、SerpAPI、Tavily、Brave、SearXNG、智谱 AI、博查 AI
- **MCP 工具生态**：支持 Context7、Arxiv 等外部工具无缝集成
- **SiliconFlow 一键配置**：推荐新手使用，快速完成 AI 模型分配

### 获取帮助
- 📖 [常见问题](guide/A-Q.md)
- 📥 [客户端下载](guide/download.md)
- 🚀 [快速入门](guide/start.md)
- 💬 [加入用户群](https://qm.qq.com/q/1lTUkKSaB6)
