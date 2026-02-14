# DeepStudent

![主图](/deepstudent-head.png)

---

<div style="text-align: center;">
  <p>关注我们的小红书账号：<a href="https://www.xiaohongshu.com/user/profile/648898bb0000000012037f8f?xsec_token=ABFtyTy-x0Maimelyl74sy1an9VAHPgOOEjqScJeuijI8%3D&xsec_source=pc_search">小红书</a></p>
  <p>加入我们的社群：<a href="https://qm.qq.com/q/1lTUkKSaB6">QQ群（310134919）</a></p>
</div>

---

::: warning 简介
DeepStudent 是一款基于 Tauri 2 构建的 **AI 原生、本地优先**开源学习系统（AGPL-3.0）。

实际代码实现以 **Chat V2 作为统一入口**，将 Learning Hub（学习资源中心）、Skills、MCP 工具生态与 CardForge 制卡任务连接为一个可持续学习闭环。
:::

---

### 核心能力（按当前主项目实现校准）

| 模块 | 对应能力 |
|:---|:---|
| **Chat V2 智能对话** | 多会话、流式回复、上下文引用、工具调用可视化、研究任务编排 |
| **Learning Hub 学习资源中心** | 访达式资源管理、拖拽注入对话、统一索引状态、跨资源检索 |
| **Skills 系统** | 指令型技能 + 工具组按需注入，支持内置 / 全局 / 项目级技能 |
| **MCP 扩展层** | 支持 SSE / WebSocket / HTTP 传输，外部工具与内置链路协同 |
| **CardForge 制卡任务** | 文档到卡片的任务化流程、模板管理、预览、导出与同步 |
| **VFS 本地数据层** | 学习资源统一进入 VFS，OCR + 向量化后可被检索与引用 |
| **系统配置与治理** | API 供应商接入、外部搜索配置、备份/同步、审计与恢复 |

### 技术基线

- **前端**：React 18 + Vite + TypeScript
- **桌面运行时**：Tauri 2（Rust）
- **数据层**：SQLite（元数据）+ LanceDB（向量检索）+ Blob（资产文件）
- **安全策略**：本地优先、敏感数据加密存储、可审计可备份
- **平台支持**：macOS、Windows，并提供 iOS / Android 构建链路

### 你可以从这里开始

- 🚀 [快速入门](guide/start.md)
- 📥 [客户端下载](guide/download.md)
- 🧭 [功能介绍](guide/function.md)
- 🏗️ [功能架构](guide/feature-architecture.md)
- ❓ [常见问题](guide/A-Q.md)
