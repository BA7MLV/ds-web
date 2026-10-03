---
prev: false
next: false
editLink: false
description: 下载 DeepStudent：macOS（Apple Silicon / Intel）、Windows 与 Android 安装包，提供 GitHub Releases 与 Cloudflare 镜像双通道。
---

<script setup>
import CopyLine from './.vitepress/theme/components/CopyLine.vue'
import DownloadFaq from './.vitepress/theme/components/DownloadFaq.vue'
import DownloadPick from './.vitepress/theme/components/DownloadPick.vue'
import DownloadRows from './.vitepress/theme/components/DownloadRows.vue'
import { formatDate, release } from './.vitepress/theme/utils/downloads.js'

const publishedAt = formatDate(release?.publishedAt)
</script>

# 下载

选择适合设备的 DeepStudent 安装包，可从 GitHub Releases 或镜像下载。
软件免费开源；安装后请按[快速上手](./start.md)配置自己的 AI 模型服务，模型调用费用由所选服务商决定。

<p class="dl-version">
  当前版本 <strong>{{ release.version }}</strong><template v-if="publishedAt"> · 发布于 <strong>{{ publishedAt }}</strong></template>
</p>

<DownloadPick />

## 桌面端

<DownloadRows group="desktop" />

## 移动端

<DownloadRows group="mobile" />

## 安装说明

### macOS

1. 下载 `.dmg` 文件
2. 双击打开，把 DeepStudent 拖进「应用程序」文件夹
3. 如果首次打开提示「已损坏」或「无法验证开发者」，在「终端」里执行下面这行，输入开机密码后重新打开：

<CopyLine command='sudo xattr -r -d com.apple.quarantine "/Applications/Deep Student.app"' />

应用名中间有空格，路径两边的引号不能省。如果你没装在 `/Applications/Deep Student.app`，把引号里的路径换成真实路径。

### Windows

1. 下载 `.exe` 安装程序
2. 双击运行，按向导完成安装
3. 安装完成后从开始菜单或桌面快捷方式启动

### 安装之后

1. 先完成[准备工作](./start.md)的模型服务配置
2. 导入一份真实学习资料到学习资源中心
3. 在智能对话（Chat V2）里引用该资料，完成一次完整问答

## 系统要求

<ul class="dl-notes">
  <li class="dl-notes__item"><strong>macOS</strong> —— macOS 13 或更高，Apple Silicon 与 Intel 均可。</li>
  <li class="dl-notes__item"><strong>Windows</strong> —— Windows 11，或 Windows 10 22H2 及以上。</li>
  <li class="dl-notes__item"><strong>Android</strong> —— ARM64 设备。</li>
</ul>

## 常见问题

<DownloadFaq />
