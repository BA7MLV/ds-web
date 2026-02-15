---
prev: false
next: false
editLink: false
---

# 下载

<script setup>
import { computed, ref } from 'vue'
import downloads from './.vitepress/data/downloads.json'

const release = downloads
const macArm = release?.platforms?.macArm64
const macX64 = release?.platforms?.macX64
const windowsX64 = release?.platforms?.windowsX64
const androidArm64 = release?.platforms?.androidArm64

const activeDownload = ref('')

const formatSize = (sizeBytes) => {
  if (!sizeBytes || Number.isNaN(sizeBytes)) return '大小未知'

  const mb = sizeBytes / (1024 * 1024)
  return `${mb.toFixed(1)} MB`
}

const formatDate = (isoDate) => {
  if (!isoDate) return '未知时间'
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return '未知时间'

  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date)
}

const detectPlatform = () => {
  if (typeof navigator === 'undefined') return 'other'

  const platform = `${navigator.platform || ''}`.toLowerCase()
  const ua = `${navigator.userAgent || ''}`.toLowerCase()

  if (platform.includes('mac') || ua.includes('mac')) {
    return ua.includes('arm') || ua.includes('apple') ? 'mac-arm' : 'mac-x64'
  }

  if (platform.includes('win') || ua.includes('windows')) return 'win-x64'
  if (ua.includes('android')) return 'android-arm64'

  return 'other'
}

const recommendedDownload = computed(() => {
  const platform = detectPlatform()

  if (platform === 'mac-arm' && macArm) {
    return { key: 'mac-arm', label: '下载 Apple Silicon DMG', asset: macArm, url: macArm.url, platformName: 'macOS (Apple Silicon)' }
  }

  if (platform === 'mac-x64' && macX64) {
    return { key: 'mac-x64', label: '下载 Intel DMG', asset: macX64, url: macX64.url, platformName: 'macOS (Intel)' }
  }

  if (platform === 'win-x64' && windowsX64) {
    return { key: 'win-x64', label: '下载 EXE 安装程序', asset: windowsX64, url: windowsX64.url, platformName: 'Windows x64' }
  }

  if (platform === 'android-arm64' && androidArm64) {
    return { key: 'android-arm64', label: '下载 APK 安装包', asset: androidArm64, url: androidArm64.url, platformName: 'Android ARM64' }
  }

  return {
    key: 'release-all',
    label: '前往 GitHub Releases 下载',
    asset: null,
    url: release.releaseUrl,
    platformName: '全部平台'
  }
})

const clickDownload = (key) => {
  activeDownload.value = key
  window.setTimeout(() => {
    if (activeDownload.value === key) activeDownload.value = ''
  }, 1600)
}

const getLinkText = (key, defaultText) => {
  return activeDownload.value === key ? '开始下载…' : defaultText
}
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

.download-quick {
  margin-top: 1rem;
  border: 1px solid var(--vp-c-brand-1);
  border-radius: 14px;
  padding: 1rem;
  background: color-mix(in srgb, var(--vp-c-brand-1) 8%, var(--vp-c-bg));
}

.download-quick-title {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--vp-c-text-1);
  font-size: 1rem;
}

.download-quick-meta {
  margin: 0.55rem 0 0;
  color: var(--vp-c-text-2);
  font-size: 0.86rem;
}

.download-highlight {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.15rem 0.5rem;
  border-radius: 999px;
  color: #fff;
  background: var(--vp-c-brand-1);
  font-size: 0.72rem;
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
  transition: border-color 0.2s ease, transform 0.2s ease;
}

.download-link:hover {
  color: var(--vp-c-brand-1);
  border-color: var(--vp-c-brand-1);
  transform: translateY(-1px);
}

.download-link:focus-visible {
  outline: 2px solid color-mix(in srgb, var(--vp-c-brand-1) 80%, white);
  outline-offset: 2px;
}

.download-link.is-active {
  border-color: var(--vp-c-brand-1);
}

.download-link-primary {
  margin-top: 0.75rem;
  border-color: var(--vp-c-brand-1);
}

.download-link-label {
  display: inline-flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.05rem;
}

.download-link-sub {
  font-size: 0.76rem;
  color: var(--vp-c-text-2);
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

<div class="download-quick">
  <p class="download-quick-title">
    <span class="download-highlight">推荐</span>
    当前设备建议下载 {{ recommendedDownload.platformName }}
  </p>
  <a
    class="download-link download-link-primary"
    :class="{ 'is-active': activeDownload === recommendedDownload.key }"
    :href="recommendedDownload.url"
    target="_blank"
    rel="noreferrer"
    @click="clickDownload(recommendedDownload.key)"
  >
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 21L12 3M12 21L17 16M12 21L7 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    <span class="download-link-label">
      <span>{{ getLinkText(recommendedDownload.key, recommendedDownload.label) }}</span>
      <span v-if="recommendedDownload.asset" class="download-link-sub">
        {{ recommendedDownload.asset.name }} · {{ formatSize(recommendedDownload.asset.sizeBytes) }}
      </span>
    </span>
  </a>
  <p class="download-quick-meta">
    发布日期：{{ formatDate(release.publishedAt) }}
  </p>
</div>

<div class="download-container">
  <div class="download-box">
    <h3>macOS <span class="download-badge badge-release">正式版</span></h3>
    <p>
      Apple Silicon / Intel<br/>
      根据设备架构选择对应安装包
    </p>
    <a
      v-if="macArm"
      class="download-link"
      :class="{ 'is-active': activeDownload === 'mac-arm' }"
      target="_blank"
      rel="noreferrer"
      :href="macArm.url"
      @click="clickDownload('mac-arm')"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 21L12 3M12 21L17 16M12 21L7 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span class="download-link-label">
        <span>{{ getLinkText('mac-arm', '下载 Apple Silicon DMG') }}</span>
        <span class="download-link-sub">{{ macArm.name }} · {{ formatSize(macArm.sizeBytes) }}</span>
      </span>
    </a>
    <a
      v-if="macX64"
      class="download-link"
      :class="{ 'is-active': activeDownload === 'mac-x64' }"
      target="_blank"
      rel="noreferrer"
      :href="macX64.url"
      @click="clickDownload('mac-x64')"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 21L12 3M12 21L17 16M12 21L7 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span class="download-link-label">
        <span>{{ getLinkText('mac-x64', '下载 Intel DMG') }}</span>
        <span class="download-link-sub">{{ macX64.name }} · {{ formatSize(macX64.sizeBytes) }}</span>
      </span>
    </a>
    <a
      v-if="!macArm && !macX64"
      class="download-link"
      :class="{ 'is-active': activeDownload === 'mac-release-all' }"
      target="_blank"
      rel="noreferrer"
      :href="release.releaseUrl"
      @click="clickDownload('mac-release-all')"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 21L12 3M12 21L17 16M12 21L7 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      {{ getLinkText('mac-release-all', '前往 GitHub Releases 下载') }}
    </a>
  </div>

  <div class="download-box">
    <h3>Windows <span class="download-badge badge-release">正式版</span></h3>
    <p>
      x64 安装程序<br/>
      推荐直接使用 Setup 安装
    </p>
    <a
      v-if="windowsX64"
      class="download-link"
      :class="{ 'is-active': activeDownload === 'windows-x64' }"
      target="_blank"
      rel="noreferrer"
      :href="windowsX64.url"
      @click="clickDownload('windows-x64')"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 21L12 3M12 21L17 16M12 21L7 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span class="download-link-label">
        <span>{{ getLinkText('windows-x64', '下载 EXE 安装程序') }}</span>
        <span class="download-link-sub">{{ windowsX64.name }} · {{ formatSize(windowsX64.sizeBytes) }}</span>
      </span>
    </a>
    <a
      v-else
      class="download-link"
      :class="{ 'is-active': activeDownload === 'windows-release-all' }"
      target="_blank"
      rel="noreferrer"
      :href="release.releaseUrl"
      @click="clickDownload('windows-release-all')"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 21L12 3M12 21L17 16M12 21L7 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      {{ getLinkText('windows-release-all', '前往 GitHub Releases 下载') }}
    </a>
  </div>

  <div v-if="androidArm64" class="download-box">
    <h3>Android <span class="download-badge badge-release">正式版</span></h3>
    <p>
      ARM64 APK 安装包
    </p>
    <a
      class="download-link"
      :class="{ 'is-active': activeDownload === 'android-arm64' }"
      target="_blank"
      rel="noreferrer"
      :href="androidArm64.url"
      @click="clickDownload('android-arm64')"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 21L12 3M12 21L17 16M12 21L7 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span class="download-link-label">
        <span>{{ getLinkText('android-arm64', '下载 APK 安装包') }}</span>
        <span class="download-link-sub">{{ androidArm64.name }} · {{ formatSize(androidArm64.sizeBytes) }}</span>
      </span>
    </a>
  </div>

  <div class="download-box">
    <h3>全部版本</h3>
    <p>
      查看完整发布记录与校验文件
    </p>
    <a
      class="download-link"
      :class="{ 'is-active': activeDownload === 'release-all' }"
      :href="release.releaseUrl"
      target="_blank"
      rel="noreferrer"
      @click="clickDownload('release-all')"
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 21L12 3M12 21L17 16M12 21L7 16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      {{ getLinkText('release-all', '打开 GitHub Releases') }}
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
