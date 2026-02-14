# DeepStudent

![主图](/img/example/软件主页图-1280.webp)

DeepStudent 是一款基于 Tauri 2.0 构建的 **AI 原生、本地优先**开源学习系统（AGPL-3.0），以「对话即入口」的方式，把智能对话、学习资源管理、RAG 知识检索、Anki 制卡、题库练习与回顾整合为可持续的学习闭环。

## 核心功能

- **Chat V2 智能对话**：多会话管理、流式输出、上下文引用、推理模式、多模型并行对比、工具调用可视化
- **Skills 技能系统**：内置导师模式 / 制卡模式 / 文献综述 / 调研模式 / 深度学术；13 组工具能力按需加载（共 65 个工具）；支持自定义技能并可接入 MCP 生态
- **VFS 学习资源中心**：笔记 / 教材 / 题目集 / 作文 / 翻译 / 导图等 8 类资源统一管理；全文检索 + 向量检索（LanceDB），导入即自动索引
- **Anki 智能制卡（CardForge 2.0）**：长文档智能分段、多模板系统、3D 预览、任务暂停/恢复、APKG 导出与 AnkiConnect 一键推送
- **智能题库**：OCR 识题、AI 解析、8 种练习模式、SM-2 间隔重复、多维统计、CSV 导入导出
- **作文批改**：流式批改、多维评分与修改建议，支持手写作文 OCR，7+ 考试类型
- **翻译工作台**：11 种语言互译、正式度调节、TTS 朗读、历史记录自动归档
- **知识导图**：多种布局、双视图（导图/大纲）、背诵模式、导出 OPML / Markdown / JSON
- **深度阅读**：PDF / Word 分屏阅读、AI 逐页精读、双引擎 OCR 精准识别
- **深度调研**：联网搜索、多步任务自动规划、结构化报告、自动归档至笔记
- **工作区（多 Agent 协作）**：主代理 / 子代理协作、任务分解与恢复、上下文共享与文档协作

## 快速开始

### 安装

请参考 [客户端下载](download.md) 了解如何下载和安装 DeepStudent。

### 入门指南

- [快速入门](start.md) — 配置 API 密钥和基本设置
- [功能介绍](function.md) — 核心功能模块使用指南
- [功能架构](feature-architecture.md) — 技术架构基准文档

## 技术栈

| 层级 | 技术 |
|:---|:---|
| 前端 | React 18 + TypeScript + Vite |
| UI | Tailwind CSS + Ant Design + Radix UI |
| 桌面运行时 | Tauri 2 (Rust) |
| 状态管理 | Zustand + Immer |
| 编辑器 | Milkdown (Markdown) + CodeMirror |
| 文档处理 | PDF.js + DeepSeek/Paddle OCR |
| 数据存储 | SQLite (Rusqlite) + LanceDB (向量检索) |
| 加密 | AES-256-GCM |

## 致谢

感谢所有为 DeepStudent 项目做出贡献的开发者和用户。DeepStudent 遵循 AGPL-3.0 开源许可证。
