<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { useData, useRoute } from 'vitepress'
import { useI18n } from '../i18n/index.js'
import shotsData from '../../data/guide-shots.json'

/**
 * 用户指南每章顶部的静态多端实景预览（由 sync-user-guide.mjs 插在章首引言之后）。
 *
 * 相比过去的实时演示 iframe，静态实景图零脚本开销、首屏秒开，且自带丰富示例学习数据：
 *   · 同时提供桌面版 / 移动版时，右上角提供轻量切换胶囊；
 *   · 自动跟随站点浅色 / 深色主题切换对应 2× Retina WebP 截图；
 *   · 点击图片可直接触发全屏缩放（medium-zoom）查看细节。
 *
 * 图片与清单由主仓库 `npm run docs:screenshots` 生成，并经 `scripts/sync-user-guide.mjs`
 * 同步至 `docs/public/img/user-guide/` 与 `docs/.vitepress/data/guide-shots.json`。
 */
const props = defineProps({
  /** 章节 slug；不给就取当前页网址的最后一段 */
  id: { type: String, default: '' }
})

const route = useRoute()
const { isDark, page } = useData()
const { locale } = useI18n()
const isEn = computed(() => locale.value === 'en-US')

const chapterId = computed(() => props.id || route.path.replace(/\.html$/, '').replace(/\/$/, '').split('/').pop())
const entry = computed(() => shotsData?.chapters?.[chapterId.value] || null)

const hasDesktop = computed(() => Boolean(entry.value?.desktop?.light || entry.value?.desktop?.dark))
const hasMobile = computed(() => Boolean(entry.value?.mobile?.light || entry.value?.mobile?.dark))
const hasBoth = computed(() => hasDesktop.value && hasMobile.value)

const mode = ref('desktop')

watch(
  [hasDesktop, hasMobile],
  ([desktop, mobile]) => {
    if (!desktop && mobile) mode.value = 'mobile'
    else if (desktop && !mobile) mode.value = 'desktop'
    else if (mode.value !== 'desktop' && mode.value !== 'mobile') mode.value = 'desktop'
  },
  { immediate: true }
)

const activeMode = computed(() => {
  if (mode.value === 'mobile' && hasMobile.value) return 'mobile'
  if (hasDesktop.value) return 'desktop'
  return 'mobile'
})

const isPhone = computed(() => activeMode.value === 'mobile')
const theme = computed(() => (isDark.value ? 'dark' : 'light'))
const title = computed(() => page.value?.title || entry.value?.title || '')

const imageSrc = computed(() => {
  const bucket = entry.value?.[activeMode.value]
  if (!bucket) return ''
  const file = bucket[theme.value] || bucket.light || bucket.dark || ''
  if (!file) return ''
  return isEn.value ? `/img/user-guide/en/${file}` : `/img/user-guide/${file}`
})

const imageAlt = computed(() => {
  const formLabel = isPhone.value ? '移动端' : '桌面端'
  return `${title.value}（${formLabel}界面示例）`
})

const caption = computed(() => {
  const base = entry.value?.caption || `「${title.value}」的真实界面示例。`
  if (hasBoth.value) return `${base} 支持右上角切换桌面版 / 移动版，点击图片可放大查看。`
  return `${base} 点击图片可放大查看。`
})

const switchMode = async (next) => {
  if (mode.value === next) return
  mode.value = next
  await nextTick()
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('ds-docs-zoom-refresh'))
  }
}
</script>

<template>
  <figure v-if="entry && imageSrc" class="gd" :class="{ 'gd--phone': isPhone }">
    <div v-if="hasBoth" class="gd__bar">
      <div class="gd__tabs" role="tablist" :aria-label="`${title} 界面形态切换`">
        <button
          type="button"
          role="tab"
          class="gd__tab"
          :class="{ 'is-active': !isPhone }"
          :aria-selected="!isPhone"
          @click="switchMode('desktop')"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="3" y="4" width="18" height="12" rx="2" fill="none" stroke="currentColor" stroke-width="1.8" />
            <path d="M8 20h8M12 16v4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
          </svg>
          桌面版
        </button>
        <button
          type="button"
          role="tab"
          class="gd__tab"
          :class="{ 'is-active': isPhone }"
          :aria-selected="isPhone"
          @click="switchMode('mobile')"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="6" y="2.5" width="12" height="19" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.8" />
            <circle cx="12" cy="18.2" r="0.9" fill="currentColor" />
          </svg>
          移动版
        </button>
      </div>
    </div>

    <div class="gd__frame">
      <img
        :key="imageSrc"
        class="gd__img"
        :src="imageSrc"
        :alt="imageAlt"
        loading="lazy"
        decoding="async"
      />
    </div>

    <figcaption class="gd__caption">{{ caption }}</figcaption>
  </figure>
</template>

<style scoped>
.gd {
  margin: 20px 0 32px;
}

.gd__bar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
}

.gd__tabs {
  display: inline-flex;
  gap: 2px;
  padding: 3px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 999px;
  background: var(--vp-c-bg-soft);
}

.gd__tab {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--vp-c-text-2);
  font-size: 13px;
  font-weight: 500;
  line-height: 1.2;
  cursor: pointer;
  transition: background-color 0.18s ease, color 0.18s ease, box-shadow 0.18s ease;
}

.gd__tab:hover {
  color: var(--vp-c-text-1);
}

.gd__tab.is-active {
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.gd__tab:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 1px;
}

.gd__tab svg {
  width: 14px;
  height: 14px;
}

.gd__frame {
  overflow: hidden;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04), 0 12px 32px rgba(0, 0, 0, 0.07);
}

.gd--phone .gd__frame {
  width: min(100%, 312px);
  margin: 0 auto;
  border-radius: 26px;
}

.gd__img {
  display: block;
  width: 100%;
  height: auto;
  margin: 0;
  border: 0;
  border-radius: 0;
  box-shadow: none;
  cursor: zoom-in;
}

.gd__caption {
  margin-top: 10px;
  color: var(--vp-c-text-2);
  font-size: 13px;
  line-height: 1.6;
  text-align: center;
}
</style>
