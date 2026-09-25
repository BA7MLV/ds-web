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
 */
import { computed, onMounted, ref } from 'vue'
import DlIcon from './DlIcon.vue'
import { buildRecommendation, formatDate, release } from '../utils/downloads.js'

const pick = ref(null)

/** 点过之后按钮文案变一下，给一个「确实点到了」的反馈 */
const active = ref('')

onMounted(() => {
  pick.value = buildRecommendation()
})

const primary = computed(() => pick.value?.primary ?? null)
const secondary = computed(() => pick.value?.secondary ?? null)

const labelFor = (item) => (active.value === item.key ? '开始下载…' : item.text)

const onClick = (item) => {
  active.value = item.key
  window.setTimeout(() => {
    if (active.value === item.key) active.value = ''
  }, 1600)
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
  <div class="dl-pick">
    <p class="lp-eyebrow">推荐</p>

    <div class="dl-pick__actions">
      <a
        v-if="primary"
        class="dl-btn"
        :href="primary.url"
        @click="onClick(primary)"
      >
        <DlIcon name="download" />
        {{ labelFor(primary) }}
      </a>

      <a
        v-if="secondary"
        class="dl-btn dl-btn--ghost"
        :href="secondary.url"
        @click="onClick(secondary)"
      >
        <DlIcon name="download" />
        {{ labelFor(secondary) }}
      </a>
    </div>

    <p v-if="meta" class="dl-pick__meta">{{ meta }}</p>
  </div>
</template>
