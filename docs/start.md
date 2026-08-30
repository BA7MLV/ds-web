---
description: DeepStudent 快速上手指南：首次启动引导、配置 AI 模型服务（DeepSeek、SiliconFlow 等）与 API 密钥，约 10 分钟开始第一次 AI 学习对话。
---

# 快速上手

安装完成后，跟着本页走一遍，大约 10 分钟即可开始你的第一次 AI 学习对话。
还没有安装？请先查看 [下载与安装](download.md)。

## 首次启动会看到什么

1. **用户协议与隐私政策**：首次打开会弹出「欢迎使用 DeepStudent」窗口，阅读并同意后进入应用。
2. **欢迎引导**：选择界面语言，浏览三大核心能力介绍（学习资料库、AI 对话与解题、制卡与复习）。
3. 引导最后一步提供「**去配置 AI 服务**」按钮，点击即可直达模型配置页；也可以选择
   「先随便看看」，之后再从 **设置 → 模型服务** 配置。

> DeepStudent 本身不内置 AI 模型，所有 AI 能力都依赖你自己配置的模型服务（API 密钥），
> 因此配置模型服务是使用前的必做步骤。

## 第一步：配置模型服务（必做）

打开 **设置 → 模型服务**，选择一家供应商并填写 API 密钥。

应用内置了以下供应商模板，填好密钥即可使用：

SiliconFlow（硅基流动）、DeepSeek、通义千问、智谱AI、字节豆包、MiniMax、
月之暗面、OpenAI、NVIDIA、Xiaomi MiMo、Google Gemini。

此外还支持添加任意 **OpenAI 兼容接口** 的自定义供应商（如各类中转/代理服务）。

**任何一家供应商都可以**，流程都是：注册账号 → 获取 API 密钥 → 在 DeepStudent 中粘贴密钥 →
点击「测试」确认连接正常。下面以 SiliconFlow 为例演示，仅因为它提供「一键分配」能力，
对新手最省事；你完全可以换成自己习惯的供应商。

### 示例：SiliconFlow 注册与密钥获取

注册入口：<https://cloud.siliconflow.cn/i/deadXN1B>

![注册硅基流动账号](/deepstudent-pic-start-register.png)

1. 在官网注册并登录。
2. 打开「API 密钥」页面创建密钥。
3. 复制密钥，回到 DeepStudent 的 **设置 → 模型服务**，选中 SiliconFlow 并粘贴。
4. 点击「**一键分配**」，系统会自动创建对话、嵌入、制卡、OCR 等一整套模型配置。

![apikey](/deepstudent-pic-start-apikey.png)
![设置](/deepstudent-pic-start-setting-new.png)

## 第二步：完成模型分配

如果你使用了「一键分配」，这一步已自动完成，可跳过。

使用其他供应商时，请打开 **设置 → 模型分配**，至少配置以下两项：

| 分配项 | 作用 | 是否必须 |
|--------|------|---------|
| **对话模型** | 所有 AI 对话、解题、翻译等能力的基础 | 必须 |
| **嵌入模型** | 让 AI 能检索你导入的资料（RAG） | 使用资料问答时必须 |

其余分配项（Anki制卡模型、翻译专用模型、OCR引擎等）都可以先留空，默认回退到对话模型，
以后按需再细调。详见 [系统设置](user-guide/04-settings.md)。

## 第三步：配置外部搜索（可选）

当你需要时效性信息或联网调研时，再开启此步骤。

1. 进入 **设置 → 外部搜索**。
2. 选择一个搜索服务并填写密钥。支持 Google CSE、SerpAPI、Tavily、Brave、SearXNG、
   智谱 AI 搜索、博查 AI 搜索等，任选其一即可。
3. 点击「测试可用性」确认后保存。

下面以 Tavily 为例（其他引擎流程类似）：

![Tavily](/deepstudent-pic-start-tavily.png)
![Tavily register](/deepstudent-pic-start-tavily-register.png)
![Tavily Overview](/deepstudent-pic-start-tavily-apikey.png)
![联网搜索](/deepstudent-pic-start-search.png)

## 第四步：跑通完整学习闭环（建议）

1. 打开侧边栏「**学习资源**」，导入一份资料（PDF / 文档 / 笔记）。
2. 等待 OCR 与索引完成（资源列表会显示「索引中」→「已索引」）。
3. 回到「**新会话**」（智能对话），点击回形针图标引用该资源，发起提问。
4. 视任务激活技能（如导师模式、调研模式、ChatAnki 制卡）。
5. 需要复习时，让 AI 制卡并从「**制卡任务**」页导出到 Anki。

## 你的数据保存在哪里

DeepStudent 是本地优先的应用，聊天记录、笔记、资料和向量索引默认都保存在本机：

| 平台 | 默认位置 |
|------|---------|
| macOS | `~/Library/Application Support/com.deepstudent.app/` |
| Windows | `%APPDATA%\com.deepstudent.app\` |
| Linux | `~/.local/share/com.deepstudent.app/`（或对应 XDG 数据目录） |

建议定期通过 **设置 → 数据治理** 导出备份，详见 [备份与同步](user-guide/05-data-management.md)。

## 隐私须知

- **本地优先**：资料、笔记、聊天记录和向量索引默认只存在本机，不会上传到官方服务器。
- **API 密钥**：以 AES-256-GCM 加密保存在本地。
- **AI 内容**：使用 AI 功能时，你的提问和引用的资料内容会发送给**你自己配置的**第三方模型
  服务商（如 DeepSeek、OpenAI 等），请留意对应服务商的隐私政策。
- **记忆功能**：可在 **设置 → 常规** 中关闭，关闭后 AI 不再提取、检索或注入个人记忆。
- **云同步**：为实验性功能，仅在你主动配置 WebDAV / S3 后才会同步数据。

## 想同步卡片到 Anki？

Anki 一键同步需要两个前提：

1. 本机已安装并打开 [Anki 桌面端](https://apps.ankiweb.net/)。
2. Anki 中已安装 **AnkiConnect** 插件（插件代码：`2055492159`）。

未满足前提时也可以导出 APKG 文件手动导入 Anki。详见 [Anki 智能制卡](user-guide/03-chatanki.md)。

## 常见建议

- 先保证「一个模型服务 + 一份真实资料 + 一次完整问答」跑通，再探索其他功能。
- 外部搜索按需开启，避免不必要的 API 消耗。
- 按 `Cmd/Ctrl + K` 打开命令面板，能快速到达应用的所有功能。

