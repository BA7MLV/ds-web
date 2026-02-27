# 关于 DeepStudent

## 项目定位

DeepStudent 是一款基于 Tauri 2 的 **AI 原生、本地优先**开源学习系统（AGPL-3.0）。

它不是“多个孤立功能页”的拼接，而是以 Chat V2 为统一入口，串联 Learning Hub、Skills、MCP 与 CardForge 的学习工作台。

## 核心理念

### 1) 对话即入口
用户通过 Chat V2 发起任务，系统按需调用技能与工具，而不是让用户在多个子系统间反复切换。

### 2) 数据即中枢
学习资料统一沉淀到 VFS，经过 OCR、索引与检索流程后，被对话、制卡、复习和调研链路共同复用。

### 3) 本地优先
元数据、向量索引和文件资产默认存储在本地设备，支持备份、恢复与审计，尽量把数据控制权留在用户侧。

## 系统组成（对齐当前实现）

- **Chat V2**：任务入口与执行反馈
- **Learning Hub**：资源管理与上下文注入
- **Skills**：能力编排与按需工具注入
- **MCP**：外部服务扩展层（SSE/WebSocket/HTTP）
- **CardForge**：任务化制卡与导出同步
- **Settings / Data Governance**：模型接入、搜索、同步与治理

## 开源与共建

- **主项目仓库**：[deep-student](https://github.com/000haoji/deep-student)
- **网站仓库**：[ds-web](https://github.com/BA7MLV/ds-web)
- **社区交流**：[QQ群（310134919）](https://qm.qq.com/q/1lTUkKSaB6)

欢迎通过 Issue / PR 参与共建，帮助我们持续校准产品与文档。

## 联系方式

- **邮件**：support@deepstudent.cn
- **小红书**：[DeepStudent 官方账号](https://www.xiaohongshu.com/user/profile/648898bb0000000012037f8f)
