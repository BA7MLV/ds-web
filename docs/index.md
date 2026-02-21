# 简介

![主图](/img/example/软件主页图-1280.webp)


::: tip 简介
**DeepStudent** 是一款基于 Tauri 2 构建的 **AI 原生、本地优先**开源学习系统（AGPL-3.0）。

实际代码实现以 **Chat V2（智能对话）作为统一入口**，将学习资源中心 (Learning Hub)、技能系统 (Skills)、MCP 工具生态与 CardForge 制卡任务连接为一个可持续学习闭环。
:::

<div>
  <p>关注我们的小红书账号：<a href="https://www.xiaohongshu.com/user/profile/648898bb0000000012037f8f">小红书</a></p>
  <p>加入我们的社群：<a href="https://qm.qq.com/q/1lTUkKSaB6">QQ群（310134919）</a></p>
</div>

---

### 核心能力（按当前主项目实现校准）

| 模块 | 对应能力 |
|:---|:---|
| **智能对话 (Chat V2)** | 多会话、流式回复、上下文引用、工具调用可视化、研究任务编排 |
| **学习资源中心 (Learning Hub)** | 访达式资源管理、拖拽注入对话、统一索引状态、跨资源检索 |
| **技能系统 (Skills)** | 指令型技能 + 工具组按需注入，支持内置 / 全局 / 项目级技能 |
| **MCP 扩展层** | 支持 SSE / WebSocket / HTTP 传输，外部工具与内置链路协同 |
| **制卡任务 (CardForge)** | 文档到卡片的任务化流程、模板管理、预览、导出与同步 |
| **统一数据层 (VFS)** | 学习资源统一进入 VFS，OCR + 向量化后可被检索与引用 |
| **系统设置与治理** | 模型服务接入、外部搜索配置、备份/同步、审计与恢复 |

### 技术基线

- **前端**：React 18 + Vite + TypeScript
- **桌面运行时**：Tauri 2（Rust）
- **数据层**：SQLite（元数据）+ LanceDB（向量检索）+ Blob（资产文件）
- **安全策略**：本地优先、敏感数据加密存储、可审计可备份
- **平台支持**：macOS、Windows，并提供 iOS / Android 构建链路

### 你可以从这里开始

- 🚀 [快速入门](start.md)
- 📥 [客户端下载](download.md)
- 🧭 [功能介绍](function.md)
- 🏗️ [功能架构](feature-architecture.md)
- ❓ [常见问题](A-Q.md)
