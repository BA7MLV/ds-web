<script setup>
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'
import { useData, useRoute } from 'vitepress'
import mirror from '../../data/demo-mirror.json'
import { track } from '../lib/analytics.js'

/**
 * 用户指南每章顶部的功能演示（sync-user-guide.mjs 插在章首引言之后）。
 *
 * 演示来自主仓库每次正式版构建的网页演示（scripts/sync-demo.mjs 镜像到 /demo/）：
 *   · 单应用演示 /demo/app.html?app=<章节 slug>：只有这一章的应用，页面只下载这一个应用的代码
 *   · 学习桌面、移动端两章演示整个壳：/demo/index.html（entry 见 demo-mirror.json 的 apps）
 * 哪些章有演示、标题、海报都读 demo-mirror.json —— 主仓库加了新章节的演示，这里不用改。
 *
 * 正文栏只有 ~690px，塞不下桌面尺寸的应用：页面里只放一张海报（发布时按真实界面截的，深浅各一张），
 * 点开才在大浮层里载入实时演示，按原生尺寸渲染。没打开的访客一个字节的演示代码都不用下。
 */
const props = defineProps({
  /** 章节 slug；不给就取当前页网址的最后一段 */
  id: { type: String, default: '' }
})

const route = useRoute()
const { isDark, page } = useData()

const demoId = computed(() => props.id || route.path.replace(/\.html$/, '').replace(/\/$/, '').split('/').pop())
const app = computed(() => (mirror.apps || []).find((entry) => entry.id === demoId.value) || null)
const isPhone = computed(() => Boolean(app.value?.width))
/** 用本页标题（章节名）称呼演示：manifest 的 title 是剧本包里写的，可能是某条示例数据的名字 */
const title = computed(() => page.value?.title || app.value?.title || '')
const theme = computed(() => (isDark.value ? 'dark' : 'light'))

const poster = computed(() => {
  const posters = app.value?.posters || []
  if (!posters.length) return ''
  const pick = posters.includes(theme.value) ? theme.value : posters[0]
  return `/demo/posters/${app.value.id}-${pick}.webp`
})

const frameSrc = computed(() => {
  if (!app.value) return ''
  if (app.value.entry) {
    const [file, query = ''] = app.value.entry.split('?')
    const params = new URLSearchParams(query)
    params.set('theme', theme.value)
    return `/demo/${file === 'demo.html' ? 'index.html' : file}?${params}`
  }
  return `/demo/app.html?${new URLSearchParams({ app: app.value.id, theme: theme.value })}`
})

const open = ref(false)
const ready = ref(false)
const slow = ref(false)
const frame = ref(null)
const closeButton = ref(null)
let lastFocus = null
let slowTimer = 0

const onMessage = (event) => {
  if (event.origin !== window.location.origin || event.source !== frame.value?.contentWindow) return
  const type = event.data?.type
  if (type === 'demo-app-ready' || type === 'demo-shell-ready') {
    ready.value = true
    // 整壳演示被嵌入时等父页发 demo:activate 才开始自动播放；要等它就绪再发，早发的消息没人接
    if (app.value?.entry) frame.value?.contentWindow?.postMessage({ type: 'demo:activate' }, window.location.origin)
  }
}

const onKey = (event) => {
  if (event.key === 'Escape') closeDemo()
}

const openDemo = async () => {
  if (!app.value) return
  lastFocus = document.activeElement
  ready.value = false
  slow.value = false
  open.value = true
  window.addEventListener('message', onMessage)
  window.addEventListener('keydown', onKey)
  document.documentElement.classList.add('guide-demo-open')
  clearTimeout(slowTimer)
  slowTimer = window.setTimeout(() => {
    slow.value = true
  }, 12000)
  track('guide_demo_open', { demo: app.value.id })
  await nextTick()
  closeButton.value?.focus()
}

function closeDemo() {
  if (!open.value) return
  open.value = false
  clearTimeout(slowTimer)
  window.removeEventListener('message', onMessage)
  window.removeEventListener('keydown', onKey)
  document.documentElement.classList.remove('guide-demo-open')
  lastFocus?.focus?.()
}

// 换主题时演示跟着换：重新载入（演示里的改动只在内存里，本来就不保留）
watch(theme, () => {
  if (open.value) ready.value = false
})

onUnmounted(closeDemo)
</script>

<template>
  <figure v-if="app" class="gd" :class="{ 'gd--phone': isPhone }">
    <button type="button" class="gd__poster" :aria-label="`打开「${title}」的实时演示`" @click="openDemo">
      <img v-if="poster" :src="poster" :alt="`${title}的界面`" loading="lazy" decoding="async" />
      <span v-else class="gd__blank">{{ title }}</span>
      <span class="gd__cta">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z" fill="currentColor" /></svg>
        试一试实时演示
      </span>
    </button>
    <figcaption class="gd__caption">
      上图是「{{ title }}」的真实界面。点开可以直接操作：数据是示例，改动只留在这次浏览里。
    </figcaption>

    <Teleport to="body">
      <div v-if="open" class="gd-modal" role="dialog" aria-modal="true" :aria-label="`${title} 实时演示`" @click.self="closeDemo">
        <div class="gd-modal__panel" :class="{ 'gd-modal__panel--phone': isPhone }">
          <div class="gd-modal__bar">
            <span class="gd-modal__title">{{ title }} · 实时演示</span>
            <span class="gd-modal__hint">示例数据，刷新即还原</span>
            <button ref="closeButton" type="button" class="gd-modal__close" aria-label="关闭演示" @click="closeDemo">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
            </button>
          </div>
          <div class="gd-modal__stage">
            <iframe
              :key="frameSrc"
              ref="frame"
              class="gd-modal__frame"
              :class="{ 'gd-modal__frame--ready': ready }"
              :src="frameSrc"
              :title="`${title} 实时演示`"
              allow="clipboard-write; fullscreen"
            />
            <div v-if="!ready" class="gd-modal__loading" aria-live="polite">
              <img v-if="poster" :src="poster" alt="" class="gd-modal__loading-shot" />
              <span class="gd-modal__spinner">{{ slow ? '演示还在载入，网络较慢时需要多等一会儿…' : '正在载入实时演示…' }}</span>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </figure>
</template>

<style scoped>
.gd {
  margin: 24px 0 32px;
}

.gd__poster {
  position: relative;
  display: block;
  width: 100%;
  padding: 0;
  overflow: hidden;
  aspect-ratio: 16 / 10;
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04), 0 12px 32px rgba(0, 0, 0, 0.08);
  cursor: pointer;
}

.gd--phone .gd__poster {
  width: min(100%, 300px);
  margin: 0 auto;
  aspect-ratio: 1 / 2;
  border-radius: 28px;
}

.gd__poster img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top left;
  transition: transform 0.4s ease, filter 0.4s ease;
}

.gd__poster:hover img,
.gd__poster:focus-visible img {
  transform: scale(1.012);
  filter: brightness(0.94);
}

.gd__blank {
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: center;
  color: var(--vp-c-text-2);
}

.gd__cta {
  position: absolute;
  right: 16px;
  bottom: 16px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px 8px 12px;
  border-radius: 999px;
  background: rgba(20, 24, 30, 0.82);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  line-height: 1;
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.18);
}

.gd--phone .gd__cta {
  right: 50%;
  transform: translateX(50%);
  white-space: nowrap;
}

.gd__cta svg {
  width: 16px;
  height: 16px;
}

.gd__caption {
  margin-top: 10px;
  color: var(--vp-c-text-2);
  font-size: 13px;
  line-height: 1.6;
  text-align: center;
}

.gd-modal {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(10, 12, 16, 0.55);
  backdrop-filter: blur(6px);
}

.gd-modal__panel {
  display: flex;
  flex-direction: column;
  width: min(1280px, 100%);
  height: min(820px, 100%);
  overflow: hidden;
  border: 1px solid var(--vp-c-divider);
  border-radius: 14px;
  background: var(--vp-c-bg);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.35);
}

.gd-modal__panel--phone {
  width: min(400px, 100%);
  height: min(860px, 100%);
  border-radius: 28px;
}

.gd-modal__bar {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 44px;
  padding: 0 8px 0 16px;
  border-bottom: 1px solid var(--vp-c-divider);
}

.gd-modal__title {
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.gd-modal__hint {
  flex: 1;
  color: var(--vp-c-text-3);
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.gd-modal__close {
  display: inline-flex;
  width: 32px;
  height: 32px;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  color: var(--vp-c-text-2);
}

.gd-modal__close:hover {
  background: var(--vp-c-default-soft);
  color: var(--vp-c-text-1);
}

.gd-modal__close svg {
  width: 18px;
  height: 18px;
}

.gd-modal__stage {
  position: relative;
  flex: 1;
  min-height: 0;
}

.gd-modal__frame {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
  opacity: 0;
  transition: opacity 0.25s ease;
}

.gd-modal__frame--ready {
  opacity: 1;
}

.gd-modal__loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.gd-modal__loading-shot {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top left;
  filter: blur(3px) saturate(0.9);
  opacity: 0.55;
}

.gd-modal__spinner {
  position: relative;
  padding: 8px 14px;
  border-radius: 999px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-2);
  font-size: 13px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12);
}

@media (max-width: 640px) {
  .gd-modal {
    padding: 0;
  }

  .gd-modal__panel,
  .gd-modal__panel--phone {
    width: 100%;
    height: 100%;
    border: 0;
    border-radius: 0;
  }
}
</style>

<style>
/* 浮层打开时页面不跟着滚 */
html.guide-demo-open {
  overflow: hidden;
}
</style>
