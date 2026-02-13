# 关于 DeepStudent

## 项目简介

DeepStudent 是一款基于 Tauri 2.0 构建的 **AI 原生、本地优先**开源学习系统，遵循 AGPL-3.0 开源许可证。

我们以「**对话即入口**」为核心理念，将智能对话、学习资源管理、RAG 知识检索、Anki 制卡、题库练习与回顾整合为可持续的学习闭环。

## 核心理念

### AI 原生数据层
统一虚拟文件系统（VFS）作为所有学习资源的单一数据源（SSOT）。资源存入后自动进入向量化流水线（OCR 识别 → 内容分块 → 嵌入生成 → LanceDB 存储），成为 AI 可读、可检索、可操作的标准资产。

### 以数据为中心
Chat、Learning Hub、CardForge 是对 VFS 数据的不同视图。AI 通过 Skills 工具组原生检索、阅读、编辑所有子应用数据。

### 本地优先
所有数据存储在用户本地设备上（SQLite + LanceDB + Blob 文件），采用 AES-256-GCM 加密保护敏感数据，支持完整审计与分层备份。无需注册账户，无数据上报，你对自己的数据拥有完全控制权。

## 开源与共建

DeepStudent 完全开源，欢迎社区参与：

- **源代码**：[GitHub](https://github.com/deepstudents/ai-mistake-manager)
- **Issue 反馈**：在 GitHub 提交 Bug 或功能建议
- **Pull Request**：欢迎提交代码改进
- **社区交流**：[QQ群（310134919）](https://qm.qq.com/q/1lTUkKSaB6)

我们保持透明的开发节奏与版本发布记录，持续吸收社区的真实需求反馈。

## 项目历程

- **2025-03-18**：项目初步构思
- **2025-06-18**：开启第一次公开技术测试（PC 端）
- **2025-08-08**：发布 macOS 端
- **2026-01**：Chat V2、Skills 系统、VFS、数据治理等核心架构落地
- **2026-02**：CardForge 2.0、多平台构建、文档体系完善

## 联系我们

- **邮件**：support@deepstudent.cn
- **小红书**：[DeepStudent 官方账号](https://www.xiaohongshu.com/user/profile/648898bb0000000012037f8f)
- **QQ 群**：310134919

感谢你与我们一起打造更聪明、更高效的学习方式。
