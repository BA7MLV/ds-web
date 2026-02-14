# 快速开始

DeepStudent 的 AI 能力依赖你配置的模型服务与（可选）外部搜索服务。以下步骤按“先能用、再增强”设计。

## 第一步：配置模型服务（必做）

1. 打开 DeepStudent，进入 **系统设置 → API 配置**。
2. 添加你的服务供应商并填写 API Key。
3. 完成模型分配（对话、检索、制卡等场景）。

> 推荐新手先用提供「一键分配」能力的供应商完成首配，再按需要细调。

### 参考：SiliconFlow 注册与密钥获取

<div>
<p><a href="https://cloud.siliconflow.cn/i/deadXN1B">https://cloud.siliconflow.cn/i/deadXN1B</a></p>
</div>

![注册硅基流动账号](/deepstudent-pic-start-register.png)

1. 在官网注册并登录。
2. 打开 API 密钥页面创建密钥。
3. 复制密钥并在 DeepStudent 设置页填写。

![apikey](/deepstudent-pic-start-apikey.png)
![设置](/deepstudent-pic-start-setting-new.png)

## 第二步：配置外部搜索（可选）

当你需要时效性信息或联网调研时，再开启此步骤。

1. 进入 **系统设置 → 外部搜索**。
2. 选择一个搜索服务并填写密钥。
3. 保存后在研究任务中启用搜索。

以下是 Tavily 示例流程：

![Tavily](/deepstudent-pic-start-tavily.png)
![Tavily register](/deepstudent-pic-start-tavily-register.png)
![Tavily Overview](/deepstudent-pic-start-tavily-apikey.png)
![联网搜索](/deepstudent-pic-start-search.png)

## 第三步：跑通完整学习闭环（建议）

1. 在 **Learning Hub** 导入一份资料（PDF / 文档 / 笔记）。
2. 等待 OCR 与索引完成（如有提示）。
3. 回到 **Chat V2**，引用该资源发起问题。
4. 视任务激活技能（如导师、调研、制卡）。
5. 需要复习时进入制卡任务导出到 Anki。

## 常用指令示例

- `/skill tutor-mode`：引导式学习对话
- `/skill research-mode`：多步调研与结构化输出
- `/skill chatanki`：从对话/资料发起制卡流程

## 常见建议

- 先保证“一个模型服务 + 一个真实资料 + 一次完整问答”跑通
- 外部搜索按需开启，避免无必要的 API 消耗
- 使用前先读一遍 [功能架构](./feature-architecture.md)，理解各模块如何协同
