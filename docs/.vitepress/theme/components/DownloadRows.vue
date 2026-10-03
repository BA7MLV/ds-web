<script setup>
/**
 * 一组平台行：一行一个安装包，发丝线分隔。
 *
 * 结构参考 openchamber.dev/download —— 平台名、版本、体积、下载按钮摆在同一行，
 * 扫一眼就能对上号，不用先点开卡片。
 *
 * 没有安装包的行由 `buildRows()` 直接过滤掉（不显示一个点下去必然 404 的按钮）。
 * 这里不标「推荐」：只能认出设备类别、认不出芯片架构，标错了反而把人引到下错的包。
 *
 * 实心「下载」走当前语言的主通道（中文页是国内镜像），旁边的空心按钮是另一条通道，
 * 两边是同一个文件，见 download-channel.js。
 */
import { computed, ref } from 'vue'
import DlIcon from './DlIcon.vue'
import { useI18n } from '../i18n/index.js'
import { backupUrl, primaryUrl } from '../utils/download-channel.js'
import { buildRows, formatSize, release } from '../utils/downloads.js'

const props = defineProps({
  /** 'desktop' | 'mobile' */
  group: { type: String, required: true }
})

const { locale } = useI18n()

const rows = computed(() => buildRows(props.group).map((item) => {
  const backup = backupUrl(item.asset, locale.value)
  return {
    ...item,
    primary: primaryUrl(item.asset, locale.value),
    backup,
    backupIsGithub: backup === item.asset.url
  }
}))

/** 点过之后按钮文案变一下，给一个「确实点到了」的反馈 */
const active = ref('')

const onClick = (key) => {
  active.value = key
  window.setTimeout(() => {
    if (active.value === key) active.value = ''
  }, 1600)
}

const labelFor = (key, text) => (active.value === key ? '开始下载…' : text)
</script>

<template>
  <ul class="dl-rows">
    <li v-for="item in rows" :key="item.key" class="dl-row">
      <div>
        <p class="dl-row__name">
          <span>{{ item.os }}</span>
          <span class="dl-row__arch">{{ item.arch }}</span>
        </p>
        <p class="dl-row__note">{{ item.note }}</p>
      </div>

      <div class="dl-row__meta">
        <span class="dl-tag">{{ release.version }}</span>
        <span class="dl-row__size">{{ formatSize(item.asset.sizeBytes) }}</span>
      </div>

      <div class="dl-row__act">
        <a
          class="dl-btn"
          :href="item.primary"
          @click="onClick(item.key)"
        >
          <DlIcon name="download" />
          {{ labelFor(item.key, '下载') }}
        </a>
        <a
          v-if="item.backup"
          class="dl-btn dl-btn--ghost"
          :href="item.backup"
          @click="onClick(`${item.key}-backup`)"
        >
          <DlIcon :name="item.backupIsGithub ? 'github' : 'cloudflare'" />
          {{ labelFor(`${item.key}-backup`, item.backupIsGithub ? 'GitHub' : '镜像下载') }}
        </a>
      </div>
    </li>
  </ul>
</template>
