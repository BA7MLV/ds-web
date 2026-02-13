# 快速开始

DeepStudent的AI功能依赖外部大模型服务。你需要从服务商获取大模型访问以及联网搜索的密钥（Key）并配置到软件中。

## 配置大模型API密钥

我们推荐使用硅基流动的API，使用以下邀请链接注册可获得14元赠款，且进行学生认证还能再获得50元赠款。

<div style="text-align: center;">
<p><a href="https://cloud.siliconflow.cn/i/deadXN1B">https://cloud.siliconflow.cn/i/deadXN1B</a></p>
</div>

当前`DeepStudent`支持 13+ 家 API 供应商，包括 OpenAI、Anthropic (Claude)、Google (Gemini)、SiliconFlow、DeepSeek、Ollama、Qwen、智谱、豆包、Minimax、Moonshot、Grok、Mistral 等。

### 1.1 获取硅基流动 (SiliconFlow) API 密钥

若您希望使用已有的API密钥或很熟悉注册流程可以跳过该步骤。

![注册硅基流动账号](/deepstudent-pic-start-register.png)

1. 访问官网：打开浏览器，访问 [硅基流动](https://cloud.siliconflow.cn/i/deadXN1B "点击跳转") 官方网站。
2. 注册/登录：完成账户注册并登录。
3. 创建API密钥：在"API 密钥"页面，创建一个新的密钥。
   ![apikey](/deepstudent-pic-start-apikey.png)
   给它起个名字（如 deep_student_key），然后立即复制并妥善保管这串 `sk-` 开头的密钥。

### 1.2 在 DeepStudent 中配置密钥

⚠️这是你首次使用软件时**必须完成**的步骤。  
⚠️如果你对模型没有了解，只想直接使用，推荐完全按照以下默认配置来。
![设置](/deepstudent-pic-start-setting-new.png)

1. 启动应用，点击左侧导航栏底部的齿轮图标进入 **设置** 界面。
2. 导航至 API 配置：在 **设置** 页面中找到 **API配置** ，输入 `sk-` 开头的密钥，点击 **一键分配** 即可。

如果您使用的是其他供应商或本地的API，可以点击**添加供应商**来创建新供应商。注意：此时您需要前往**模型分配**设置项中按照提示手动设置各个功能使用的模型。

## 配置联网搜索API（可选）

联网搜索可以使大模型检索互联网上的信息来帮助生成回复，使之可以更好地回答具有时效性的问题和需要专门知识的问题。  
当前`DeepStudent`支持`Google CSE`、`SerpAPI`、`Tavily`、`Brave`、`SearXNG`、`智谱AI搜索`和`博查AI搜索`的联网搜索服务。

`Tavily`是一个提供面向AI agent的联网搜索服务与MCP服务器的服务商，它向个人用户提供了每月1000点免费使用点数，每次联网搜索请求会消耗2点数。下面我们以Tavily为例演示联网搜索服务的注册和配置。

### 2.1 获取Tavily API密钥

1. 访问官网：打开浏览器，访问[Tavily](https://www.tavily.com/"点击跳转")官方网站。
  ![Tavily](/deepstudent-pic-start-tavily.png)
2. 注册/登录：在网站右上角点击**Login**,在跳转到的登陆页面中找到**Continue**下方的**Sign up**跳转至注册页，使用邮箱注册并登录。
  ![Tavily register](/deepstudent-pic-start-tavily-register.png)
3. 获取API密钥：登录后跳转到控制台，`Tavily`会自动生成一个API密钥，把它复制下来。
  ![Tavily Overview](/deepstudent-pic-start-tavily-apikey.png)

### 2.2 在DeepStudent中配置联网搜索

1. 启动应用，点击左侧导航栏底部的齿轮图标进入 **设置** 界面。
2. 导航至 API 配置：在 **设置** 页面中找到 **外部搜索** ，找到`Tavily`的配置项输入 `tvly-` 开头的密钥即可。
  ![联网搜索](/deepstudent-pic-start-search.png)

至此，您可以使用软件的所有功能了。您还可以为软件配置多样的MCP工具和Skills以增强软件的功能。

## 快速体验核心功能

### 3.1 体验技能系统

在智能对话中输入以下命令来激活不同技能：

- `/skill tutor-mode` — 苏格拉底式导师模式，引导你深度思考
- `/skill chatanki` — 上传文档或发送文本，AI 自动生成 Anki 卡片
- `/skill research-mode` — 联网搜索，多步调研，生成结构化报告

### 3.2 管理学习资源

1. 点击左侧导航栏的「学习资源」
2. 创建第一个笔记，或导入一份 PDF 教材
3. 导入的资源会自动进行 OCR 识别和向量化索引
4. 回到对话中，AI 即可通过 RAG 检索引用你的学习资料

### 3.3 更多功能

- **知识导图**：在学习资源中创建思维导图，或在对话中让 AI 生成
- **题库练习**：上传试卷照片，AI 自动识题、拆分、生成解析
- **作文批改**：在学习资源中创建作文，AI 流式多维评分
- **翻译工作台**：11 种语言互译，正式度调节，TTS 朗读
