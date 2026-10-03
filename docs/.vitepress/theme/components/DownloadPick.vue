<script setup>
/**
 * 下载页顶部的推荐位：按当前设备给一个主按钮。
 *
 * 眉标只写「推荐」，不报「检测到 macOS」—— 下面按钮上的「下载 Apple Silicon DMG」
 * 已经把这件事说清楚了，再念一遍设备名只是噪音（认不出的设备还会变成一句废话）。
 *
 * 设备判定放在 onMounted —— SSR 里没有 navigator，若在 setup 顶层直接算，
 * 服务端会渲染成「认不出设备，去发布页」、客户端再变成 macOS 的两个 DMG，水合时两边对不上。
 * 所以整块按钮与元信息都等挂载后再出，宁可晚一行也不要报错。
 *
 * 按钮走当前语言的主通道（中文页是国内镜像），另一条通道放在元信息下面一行，
 * 主通道下不动时一眼就能找到，见 download-channel.js。
 *
 * iPhone / iPad 是例外：没有 iOS 安装包，下面那一排 dmg / exe 对他们一个都用不上。
 * 推荐位改成「在电脑上下载」—— 系统分享面板（隔空投送到 Mac、发到微信）+ 复制链接，
 * 小红书、微信里点进来的手机访客多，得给他们一条把链接带到电脑上的路。
 */
import { computed, onMounted, ref } from 'vue'
import CopyLine from './CopyLine.vue'
import DlIcon from './DlIcon.vue'
import { useI18n } from '../i18n/index.js'
import { track } from '../lib/analytics.js'
import { backupUrl, primaryUrl } from '../utils/download-channel.js'
import { buildRecommendation, formatDate, release } from '../utils/downloads.js'

const { locale } = useI18n()
const pick = ref(null)
const pageUrl = ref('')
const canShare = ref(false)

/** 点过之后按钮文案变一下，给一个「确实点到了」的反馈 */
const active = ref('')

onMounted(() => {
  pick.value = buildRecommendation()
  pageUrl.value = `${window.location.origin}/download`
  canShare.value = typeof navigator.share === 'function'
})

const isIos = computed(() => pick.value?.key === 'ios')
const primary = computed(() => pick.value?.primary ?? null)
const secondary = computed(() => pick.value?.secondary ?? null)
const hrefOf = (item) => primaryUrl(item, locale.value)

/** 主按钮那个包的另一条通道；认不出设备（只给发布页）时没有 */
const backup = computed(() => {
  const url = primary.value ? backupUrl(primary.value, locale.value) : ''
  return url ? { url, github: url === primary.value.url } : null
})

const labelFor = (item) => (active.value === item.key ? '开始下载…' : item.text)

const trackDownload = (item, url, from) => track('download', {
  package: item.key,
  channel: url === item.url ? 'github' : 'mirror',
  from,
  locale: locale.value,
  version: release?.version ?? ''
})

const onClick = (item) => {
  active.value = item.key
  trackDownload(item, hrefOf(item), 'pick')
  window.setTimeout(() => {
    if (active.value === item.key) active.value = ''
  }, 1600)
}

const share = async () => {
  track('send_to_computer', { method: 'share' })
  try {
    await navigator.share({
      title: 'DeepStudent 下载',
      text: '在电脑上打开这个链接，下载 DeepStudent',
      url: pageUrl.value
    })
  } catch {
    // 用户关掉分享面板也会走到这里，不算出错；下面还有复制链接可用。
  }
}

/** 文件名 · 体积 · 发布日期；认不出设备时退化成「版本 · 发布日期」 */
const meta = computed(() => {
  const parts = []

  if (primary.value?.name) {
    parts.push(primary.value.name)
    if (primary.value.sizeText) parts.push(primary.value.sizeText)
  } else if (release?.version) {
    parts.push(release.version)
  }

  const date = formatDate(release?.publishedAt)
  if (date) parts.push(`发布于 ${date}`)

  return parts.join(' · ')
})
</script>

<template>
  <div v-if="isIos" class="dl-pick">
    <p class="lp-eyebrow">在电脑上下载</p>
    <p class="dl-pick__alt">
      暂时没有 iPhone / iPad 安装包。把下载页链接发到电脑上，打开就能装：
    </p>
    <div v-if="canShare" class="dl-pick__actions">
      <button type="button" class="dl-btn" @click="share">
        <DlIcon name="download" />
        发送到电脑
      </button>
    </div>
    <CopyLine :command="pageUrl" />
  </div>

  <div v-else class="dl-pick">
    <p class="lp-eyebrow">推荐</p>

    <div class="dl-pick__actions">
      <a
        v-if="primary"
        class="dl-btn"
        :href="hrefOf(primary)"
        @click="onClick(primary)"
      >
        <DlIcon name="download" />
        {{ labelFor(primary) }}
      </a>

      <a
        v-if="secondary"
        class="dl-btn dl-btn--ghost"
        :href="hrefOf(secondary)"
        @click="onClick(secondary)"
      >
        <DlIcon name="download" />
        {{ labelFor(secondary) }}
      </a>
    </div>

    <p v-if="meta" class="dl-pick__meta">{{ meta }}</p>
    <p v-if="backup" class="dl-pick__alt">
      下载慢或中断？<a
        :href="backup.url"
        @click="trackDownload(primary, backup.url, 'pick-backup')"
      >{{ backup.github ? '改从 GitHub 下载' : '改用镜像下载' }}</a>
    </p>
  </div>
</template>
