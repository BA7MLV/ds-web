---
prev: false
next: false
editLink: false
description: 下载 DeepStudent：macOS（Apple Silicon / Intel）、Windows、Linux（AppImage / deb）与 Android 安装包，以及自托管 WebUI & PWA 指引，提供 GitHub Releases 与 Cloudflare 镜像双通道。
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

选择适合设备的 DeepStudent 安装包。默认走国内镜像，也可以从 GitHub Releases 下载，两边是同一个文件。
软件免费开源；安装后打开欢迎弹窗即可一键配置自己的 AI 模型服务，模型调用费用由所选服务商决定。

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
3. 正式发布包已通过 Apple 签名与公证；如果运行未公证构建时提示「已损坏」或「无法验证开发者」，在「终端」里执行下面这行，输入开机密码后重新打开：

<CopyLine command='sudo xattr -r -d com.apple.quarantine "/Applications/Deep Student.app"' />

应用名中间有空格，路径两边的引号不能省。如果你没装在 `/Applications/Deep Student.app`，把引号里的路径换成真实路径。

### Windows

1. 下载 `.exe` 安装程序
2. 双击运行，按向导完成安装（v0.20 起内置运行环境，不再依赖系统 WebView2 Runtime）
3. 安装完成后从开始菜单或桌面快捷方式启动

### Linux

两种主力格式装的是同一个应用，任选其一（均为 x86_64）：

- **AppImage**：免安装且支持应用内原地更新，加上执行权限即可运行；若报 FUSE 相关错误，先装 `libfuse2`（Ubuntu 24.04 起叫 `libfuse2t64`），或在启动命令后加上 `--appimage-extract-and-run`

<CopyLine command="chmod +x Deep.Student_*.AppImage && ./Deep.Student_*.AppImage" />

- **deb**（Debian、Ubuntu 及其衍生版）：在下载目录执行

<CopyLine command="sudo apt install ./Deep.Student_*_amd64.deb" />

> 说明：v0.20 起不再提供 `.rpm` 安装包；如需旧版 `0.11.x` 的 `.rpm` 包，仍可在 [GitHub Releases](https://github.com/helixnow/deep-student/releases) 获取。

### 安装之后（约 1 分钟开始使用）

1. 打开应用后，在欢迎弹窗的「**一键 API Key 自动配置**」里粘贴一把模型密钥即可自动配好（完整配置与免费/本机方案见[快速上手](./start.md)）
2. 把一份 PDF 教材或笔记拖进**资源库**
3. 在**对话**里引用这份资料，试着问一个问题或让它生成一张思维导图

## 进阶方式：自托管 WebUI & PWA / 预览版

- **WebUI & PWA（自托管，可选）**：桌面与手机用户直接装上面的安装包即可；如果你想在自己的电脑、NAS 或服务器上部署，再用任意浏览器或手机主屏幕以 PWA 方式访问，只需 **Node.js 24+** 并运行：

<CopyLine command="npm run web" />

  生产构建、访问令牌、反向代理与 PWA 安装步骤见 [WebUI 与 PWA 自托管指南](/user-guide/webui-pwa)。

- **v0.20 预发布版与升级说明**：想提前体验 `v0.20.x` 新架构（AI 插件工坊、生成式 UI、Sync V5 等）可在 [GitHub Releases](https://github.com/helixnow/deep-student/releases) 下载对应预发布版。从 `0.11.x` 升级时，原有 SQLite 与 LanceDB 数据目录会原地挂载并自动迁移配置（跨大版本升级前建议先导出一次备份）。

## 系统要求

<ul class="dl-notes">
  <li class="dl-notes__item"><strong>macOS</strong> —— macOS 13.0 及以上，Apple Silicon 与 Intel 均可（正式发布包经 Apple 签名与公证）。</li>
  <li class="dl-notes__item"><strong>Windows</strong> —— Windows 10（64 位）及以上（v0.20 起不再依赖系统 WebView2 Runtime）。</li>
  <li class="dl-notes__item"><strong>Linux</strong> —— 64 位 x86_64 现代发行版（v0.20 起内置 Electron 运行时，不再需要 WebKitGTK 4.1）。</li>
  <li class="dl-notes__item"><strong>Android</strong> —— Android 7.0（API 24）及以上 ARM64 设备。</li>
  <li class="dl-notes__item"><strong>iPhone / iPad</strong> —— iOS 15 及以上，暂无官方安装包，需通过 Xcode + Capacitor 从源码构建。</li>
</ul>

## 常见问题

<DownloadFaq />
