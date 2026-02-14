---
prev: false
next: false
editLink: false
---

# 下载

<script setup>
import downloads from './.vitepress/data/downloads.json'

const release = downloads
const macArm = release?.platforms?.macArm64
const macX64 = release?.platforms?.macX64
const windowsX64 = release?.platforms?.windowsX64
const androidArm64 = release?.platforms?.androidArm64
</script>

::: tip 系统要求
- **macOS**：macOS 13+（Apple Silicon / Intel）
- **Windows**：Windows 11 / Windows 10 22H2+
:::

<style>
.download-version {
  margin-top: 1rem;
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
}

.download-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.download-box {
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px;
  padding: 1.1rem;
  background: var(--vp-c-bg-soft);
}

.download-box h3 {
  margin: 0;
  color: var(--vp-c-text-1);
  font-size: 1.05rem;
}

.download-box p {
  margin: 0.5rem 0 0.9rem;
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
  line-height: 1.5;
}

.download-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.58rem 0.85rem;
  border: 1px solid var(--vp-c-divider);
  border-radius: 10px;
  color: var(--vp-c-brand-1);
  background: var(--vp-c-bg);
  text-decoration: none;
  font-weight: 600;
}

.download-link:hover {
  color: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
}

.download-badge {
  display: inline-block;
  margin-left: 0.45rem;
  padding: 0.1rem 0.45rem;
  border-radius: 999px;
  font-size: 0.72rem;
  vertical-align: middle;
}

.badge-release {
  background: rgba(26, 26, 26, 0.1);
  color: #1a1a1a;
}

.dark .badge-release {
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
}
</style>

<p class="download-version">
  当前版本：<strong>{{ release.version }}</strong>
</p>

<div class="download-container">
  <div class="download-box">
    <h3>macOS <span class="download-badge badge-release">正式版</span></h3>
    <p>
      Apple Silicon / Intel<br/>
      根据设备架构选择对应安装包
    </p>
    <a v-if="macArm" class="download-link" target="_blank" :href="macArm.url">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 21L12 3M12 21L17 16M12 21L7 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      下载 Apple Silicon DMG
    </a>
    <a v-if="macX64" class="download-link" target="_blank" :href="macX64.url">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 21L12 3M12 21L17 16M12 21L7 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      下载 Intel DMG
    </a>
    <a v-if="!macArm && !macX64" class="download-link" target="_blank" :href="release.releaseUrl">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 21L12 3M12 21L17 16M12 21L7 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      前往 GitHub Releases 下载
    </a>
  </div>

  <div class="download-box">
    <h3>Windows <span class="download-badge badge-release">正式版</span></h3>
    <p>
      x64 安装程序<br/>
      推荐直接使用 Setup 安装
    </p>
    <a v-if="windowsX64" class="download-link" target="_blank" :href="windowsX64.url">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 21L12 3M12 21L17 16M12 21L7 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      下载 EXE 安装程序
    </a>
    <a v-else class="download-link" target="_blank" :href="release.releaseUrl">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 21L12 3M12 21L17 16M12 21L7 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      前往 GitHub Releases 下载
    </a>
  </div>

  <div v-if="androidArm64" class="download-box">
    <h3>Android <span class="download-badge badge-release">正式版</span></h3>
    <p>
      ARM64 APK 安装包
    </p>
    <a class="download-link" target="_blank" :href="androidArm64.url">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 21L12 3M12 21L17 16M12 21L7 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      下载 APK 安装包
    </a>
  </div>

  <div class="download-box">
    <h3>全部版本</h3>
    <p>
      查看完整发布记录与校验文件
    </p>
    <a class="download-link" :href="release.releaseUrl" target="_blank">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 21L12 3M12 21L17 16M12 21L7 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      打开 GitHub Releases
    </a>
  </div>
</div>

---

## 安装说明

### macOS

1. 下载 `.dmg` 文件
2. 双击打开并拖入“应用程序”文件夹
3. 如首次打开提示“已损坏”，执行：

```bash
sudo xattr -r -d com.apple.quarantine /Applications/DeepStudent.app
```

### Windows

1. 下载 `.exe` 安装程序
2. 双击执行安装
3. 安装后从开始菜单或桌面快捷方式启动

---

## 安装后建议

1. 先完成 [快速入门](./start.md) 的 API 配置
2. 导入一份真实学习资料到 Learning Hub
3. 在 Chat V2 引用该资源并完成一次完整问答
