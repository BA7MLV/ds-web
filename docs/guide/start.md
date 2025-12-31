# 快速开始

应用的 AI 功能依赖外部大模型服务。你需要从服务商获取密钥（Key）并配置到软件中。

我们推荐使用硅基流动的API，使用以下邀请链接注册可获得14元赠款，且进行学生认证还能再获得50元赠款。

<div style="text-align: center;">
<p><a href="https://cloud.siliconflow.cn/i/deadXN1B">https://cloud.siliconflow.cn/i/deadXN1B</a></p>
</div>

当前`DeepStudent`支持调用基于`OpenAI`兼容接口的大模型，原生`Gemini`和`Claude`将在未来适配。

## 步骤1：获取硅基流动 (SiliconFlow) API 密钥

![注册](/deepstudent-pic-start-register.png)

1. 访问官网：打开浏览器，访问 [硅基流动](https://cloud.siliconflow.cn/i/deadXN1B "点击跳转") 官方网站。
2. 注册/登录：完成账户注册并登录。
3. 创建API密钥：在"API 密钥"页面，创建一个新的密钥。
   ![apikey](/deepstudent-pic-start-apikey.png)
   给它起个名字（如 deep_student_key），然后立即复制并妥善保管这串 `sk-` 开头的密钥。

## 步骤2：在 DeepStudent 中配置密钥

⚠️这是你首次使用软件时必须完成的步骤。
⚠️如果你对模型没有了解，只想直接使用，推荐完全按照以下默认配置来。
![设置](/deepstudent-pic-start-setting.png)
1. 启动应用，点击左侧导航栏底部的齿轮图标进入 设置 界面。
2. 导航至 API 配置：在 设置 页面中，输入 `sk-` 开头的密钥，点击 一键分配 即可

至此，您已经可以使用软件的所有功能了。

---

## 切换模型

你可以从硅基流动官网的模型广场找到所有可用的免费或付费模型。

- API 地址: 硅基流动的地址是 
  ```txt
  https://api.siliconflow.cn/v1
  ```
（注意，如果没有在硅基流动充值，完全使用赠款的情况下请不要使用`Pro/`开头的模型。）
- API 密钥: 粘贴你刚才复制的 sk- 密钥。
- 多模态模型：如`Qwen2.5-VL`系列，`Gemini`，`GPT`等
- 推理模型：如`Deepseek-R1`等（如果使用DeepSeek-R1还需要在模型适配器里选择Deepseek-R1）
如果想使用RAG知识库功能，请设置嵌入模型为`BAAI/bge-m3`
