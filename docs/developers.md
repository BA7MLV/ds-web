---
description: DeepStudent v0.20 架构与开发者文档：Electron 45、Capacitor 8.6、WebUI/PWA 与 Cordis 4 双内核插件架构概览、本地开发构建命令及主仓库技术文档索引。
---

# 架构与开发者文档

本页为参与 DeepStudent 源码构建、自托管部署或 `.dstuplugin` 插件开发的开发者提供快速入口。日常使用说明请阅读 [用户指南总览](/user-guide/)，架构演进背景见 [项目历程](/timeline)。

## v0.20 双内核插件架构概览

自 `v0.20.x` 起，DeepStudent 正式退役上一代 Tauri 2 / Rust 后端，全面切换为 **100% TypeScript** 的多端双内核插件架构（Node.js 24+）：

- **统一多端宿主**：桌面端采用 **Electron 45**（内置 Chromium 运行时，摆脱系统 WebView2 / WebKitGTK 差异），移动端采用 **Capacitor 8.6**，并原生提供可自托管的 **WebUI & PWA** 服务端；
- **Cordis 4 双内核插件架构**：后端宿主（Host）基于 `@deepseek-ai/cordis` 4 管理服务依赖、生命周期与隔离边界，前端提供 **19 个官方 UI 插件**与可扩展插件槽位，支持 `.dstuplugin` 热加载扩展；
- **Hybrid N-API + WASI-WASM 原生引擎**：本地数据库、向量检索、PDF 解析、密钥库与系统调用等核心模块采用 N-API 原生扩展（`better-sqlite3`、`@lancedb/lancedb`、`@embedpdf/pdfium`、`@napi-rs/keyring`、`@node-rs/argon2`、`koffi`）与预编译 WASI-WASM（`f7-native-wasm.wasm`）混合架构，兼顾桌面性能与跨端可移植性；
- **安全与升级护栏**：桌面端集成 Electron Fuses、更新前插件兼容性预检、`--safe-mode` 安全模式及连续启动失败自动恢复弹窗，并支持从 `0.11.x` 原地挂载迁移数据目录。

## 本地开发与构建快速命令

本地开发只需要 **Node.js 24+** 与 `npm`，**不再需要安装 Rust 或 Tauri CLI**。

```bash
# 1. 安装依赖
npm ci --legacy-peer-deps

# 2. 启动 Electron 桌面端开发模式
npm run dev:electron

# 3. 启动自托管 WebUI 开发服务
npm run web

# 4. 构建并运行 WebUI / PWA 生产模式
npm run build:web && npm run web:prod

# 5. 构建 Android Debug APK（需 JDK 21 与 Android SDK Platform 36）
node mobile/scripts/build-apk.mjs

# 6. 校验插件契约、边界约束与 TypeScript 类型
npm run check:plugins
```

常用打包与测试命令：

```bash
# 桌面端打包（按目标平台选择 --mac / --win / --linux，或 --dir 仅生成解包目录）
npm run build
node electron/scripts/package.mjs --mac

# 运行 Host 与插件测试套件
npm run test:host
npm run test:plugins
```

## 主仓库技术文档索引

以下权威技术文档维护在主项目仓库 [`helixnow/deep-student`](https://github.com/helixnow/deep-student) 中，随代码同步更新：

### 构建、自托管与模型接口

- [构建与打包指南（`docs/BUILD-CONFIG.md`）](https://github.com/helixnow/deep-student/blob/main/docs/BUILD-CONFIG.md) — Electron 桌面端、Capacitor Android/iOS 与 CI 打包流程说明。
- [WebUI 与 PWA 部署架构（`docs/WEBUI-AND-PWA.md`）](https://github.com/helixnow/deep-student/blob/main/docs/WEBUI-AND-PWA.md) — 自托管服务端架构、身份认证、PWA 离线与安装机制、反向代理参考。
- [DeepSeek 官方应用 API 接入说明（`docs/DEEPSEEK-API.md`）](https://github.com/helixnow/deep-student/blob/main/docs/DEEPSEEK-API.md) — DeepSeek 官方应用接口、搜索与 Fetch 集成规范。

### 插件系统与安全模型

- [插件系统架构（`docs/plugins/ARCHITECTURE.md`）](https://github.com/helixnow/deep-student/blob/main/docs/plugins/ARCHITECTURE.md) — Cordis 4 双内核宿主、19 个官方 UI 插件与用户插件运行模型。
- [插件开发 SDK（`docs/plugins/SDK.md`）](https://github.com/helixnow/deep-student/blob/main/docs/plugins/SDK.md) — `.dstuplugin` 包格式、清单字段、前后端 API 与开发示例。
- [插件能力清单（`docs/plugins/CAPABILITIES.md`）](https://github.com/helixnow/deep-student/blob/main/docs/plugins/CAPABILITIES.md) — 插件可声明权限、工具面与宿主能力边界参考。
- [插件安全模型（`docs/plugins/SECURITY.md`）](https://github.com/helixnow/deep-student/blob/main/docs/plugins/SECURITY.md) — 同进程运行信任边界、Electron Fuses、`--safe-mode` 与故障自愈机制。
- [插件与宿主升级兼容（`docs/plugins/UPGRADES.md`）](https://github.com/helixnow/deep-student/blob/main/docs/plugins/UPGRADES.md) — 更新前插件兼容性预检、`0.11.x → 0.20.x` 迁移策略与版本兼容规则。
- [插件工坊与 Harness 对比（`docs/plugins/WORKSHOP-HARNESS-COMPARISON.md`）](https://github.com/helixnow/deep-student/blob/main/docs/plugins/WORKSHOP-HARNESS-COMPARISON.md) — AI 插件工坊工程设计与测试验证体系分析。

## 参与贡献

DeepStudent 遵循 [AGPL-3.0](https://github.com/helixnow/deep-student/blob/main/LICENSE) 开源协议。欢迎在 [GitHub Issues](https://github.com/helixnow/deep-student/issues) 反馈缺陷、讨论架构或提交 Pull Request。
