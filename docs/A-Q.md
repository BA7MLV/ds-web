# 常见问题（FAQ）

## macOS 提示“已损坏，无法打开”怎么办？

这是常见的系统隔离属性问题，可在终端执行：

```bash
sudo xattr -r -d com.apple.quarantine /Applications/DeepStudent.app
```

如果你的安装路径不是 `/Applications/DeepStudent.app`，请替换成真实路径。

## 数据会上传到云端吗？

DeepStudent 采用本地优先架构，核心数据默认保存在本机（SQLite + LanceDB + Blob）。
如你主动配置了云同步（如 WebDAV / S3），才会进行对应同步。

## 第一次安装后优先做什么？

1. 在系统设置完成模型服务配置
2. 导入一份学习资料到学习资源中心
3. 回到智能对话（Chat V2）进行一次资源引用问答

## 为什么文档里不再写固定工具数量？

主项目迭代较快，固定数量容易过时。当前文档改为描述“能力结构与链路关系”，确保长期准确。

## 如何反馈问题或共建？

- 项目仓库：[deep-student](https://github.com/helixnow/deep-student)
- 社区交流：[QQ群（310134919）](https://qm.qq.com/q/1lTUkKSaB6)
