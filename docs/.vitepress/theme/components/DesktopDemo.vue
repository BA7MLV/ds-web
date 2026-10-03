<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useData } from 'vitepress'
import { useI18n } from '../i18n/index.js'
import { track } from '../lib/analytics.js'
import { afterPageLoad, observeNearViewport } from '../lib/deferred-work.js'
import { featureShot } from '../utils/feature-shot.js'
import FeatureShot from './FeatureShot.vue'

/**
 * 学习桌面的实时演示（首页「学习桌面」一节，占页面宽度的 95%）。
 *
 * 和首屏 AppShell 是同一份同源演示镜像，入口多带一个 desktop=1：开出来就是桌面端的默认界面——
 * 菜单栏、日程和 AI 学习简报小组件、Dock，对话和闪卡两扇窗并排摆好（主仓库 src/demo/desktop.tsx）。
 *
 * 尺寸：宽度 95%，高度最多到「一屏减去顶栏」、也不超过 16:10（见下方 .dd__stage）。
 * 应用的渲染尺寸跟着舞台走，宽夹在 NATIVE_WIDTH 之间、高不低于 NATIVE_MIN_HEIGHT（见 screenStyle）：
 * 常见笔记本到 1080p 屏幕上基本 1:1；窄或矮的舞台按下限渲染再整体缩小，两扇窗和小组件不会挤成一团、
 * 窗口也不会伸进 Dock 带；超宽屏按上限渲染再放大，不会只占左边一角、右边大片空着。
 *
 * 只在宽屏 + 鼠标 / 触控板上载入（LIVE_QUERY）：学习桌面是桌面端的界面，触屏上拖窗、点 Dock 都别扭，
 * 那些设备上就是一张截图（scripts/gen-features-live.mjs 的 workbench 场景，16:10 正好铺满舞台）。
 * 宽屏上舞台比 16:10 宽，清晰截图放进去两边会空出来，看着像桌面没铺满：载入中只铺同一张图的模糊放大、
 * 中间一枚状态，演示发 demo-shell-ready（窗口摆好、对话首答落定）后淡出；载入也提前到离视口还有一屏多就开始。
 */
const MIRROR_SRC = '/demo/index.html'
const SCENE = 'demo-anki-cards'
const NATIVE_WIDTH = { min: 1440, max: 1920 }
const NATIVE_MIN_HEIGHT = 720
const LIVE_QUERY = '(min-width: 1024px) and (pointer: fine)'
const READY_TIMEOUT_MS = 20000

const props = defineProps({
  /** 海报截图，对应 features/<art>-light|dark.webp */
  art: { type: String, default: 'workbench' },
  alt: { type: String, default: '' }
})

const { isDark } = useData()
const { t } = useI18n()

const resolvedSrc = computed(() => import.meta.env.VITE_DEMO_URL || MIRROR_SRC)

/** 覆盖成绝对地址调试时，https 页面嵌 http 会被浏览器当混合内容拦掉 */
const embeddable = () => {
  try {
    const url = new URL(resolvedSrc.value, window.location.href)
    return ['http:', 'https:'].includes(url.protocol)
      && !(window.location.protocol === 'https:' && url.protocol === 'http:')
  } catch {
    return false
  }
}

/** 学习桌面 + 跟随主题 + 开场那条剧本会话；覆盖地址里的其他 query 和 hash 原样保留 */
const frameSrc = computed(() => {
  const url = resolvedSrc.value
  const hashAt = url.indexOf('#')
  const pathAndQuery = hashAt < 0 ? url : url.slice(0, hashAt)
  const hash = hashAt < 0 ? '' : url.slice(hashAt)
  const queryAt = pathAndQuery.indexOf('?')
  const path = queryAt < 0 ? pathAndQuery : pathAndQuery.slice(0, queryAt)
  const query = new URLSearchParams(queryAt < 0 ? '' : pathAndQuery.slice(queryAt + 1))
  query.set('desktop', '1')
  query.set('theme', isDark.value ? 'dark' : 'light')
  if (!query.has('scene')) query.set('scene', SCENE)
  return `${path}?${query}${hash}`
})

const demoOrigin = computed(() => {
  try {
    return new URL(resolvedSrc.value, window.location.href).origin
  } catch {
    return ''
  }
})

/** 海报四周的柔光底：同一张截图放大模糊，舞台比截图宽时两边不留硬边 */
const posterVars = computed(() => ({
  '--dd-shot-light': `url(${featureShot(props.art, false)})`,
  '--dd-shot-dark': `url(${featureShot(props.art, true)})`
}))

const stageEl = ref(null)
const frameEl = ref(null)
const mounted = ref(false)
const liveCapable = ref(false)
const started = ref(false)
const loading = ref(true)
const timedOut = ref(false)
const frameKey = ref(0)
const stageSize = ref({ width: 0, height: 0 })

const canEmbed = computed(() => mounted.value && liveCapable.value && embeddable())
const showFrame = computed(() => canEmbed.value && started.value)

/**
 * 应用的渲染尺寸：宽取舞台宽夹在 NATIVE_WIDTH 里，高不足 NATIVE_MIN_HEIGHT 时再按高缩，
 * 渲染框和舞台同比例，整体缩放进舞台
 */
const screenStyle = computed(() => {
  const { width, height } = stageSize.value
  if (!width || !height) return {}
  const nativeWidth = Math.min(Math.max(width, NATIVE_WIDTH.min), NATIVE_WIDTH.max)
  const scale = Math.min(width / nativeWidth, height / NATIVE_MIN_HEIGHT)
  return {
    width: `${Math.round(width / scale)}px`,
    height: `${Math.round(height / scale)}px`,
    transform: scale === 1 ? 'none' : `scale(${Number(scale.toFixed(4))})`
  }
})

/**
 * 触屏 / 窄窗口上那张截图缩到屏幕宽，字只有两三像素：点开全屏看大图，
 * 图按视口高度铺（竖着拿手机时差不多是原尺寸），左右滑看整张桌面
 */
const viewerOpen = ref(false)
const viewerClose = ref(null)
const viewerSrc = computed(() => featureShot(props.art, isDark.value))
let viewerOpener = null

const openViewer = () => {
  if (canEmbed.value) return
  viewerOpener = document.activeElement
  viewerOpen.value = true
}

const closeViewer = () => {
  viewerOpen.value = false
}

const onViewerKey = (event) => {
  if (event.key === 'Escape') closeViewer()
}

watch(viewerOpen, async (open) => {
  document.documentElement.style.overflow = open ? 'hidden' : ''
  if (open) {
    document.addEventListener('keydown', onViewerKey)
    await nextTick()
    viewerClose.value?.focus()
  } else {
    document.removeEventListener('keydown', onViewerKey)
    viewerOpener?.focus?.()
    viewerOpener = null
  }
})

/** 图注右侧的状态：只解释「为什么还没动」和「出事了怎么办」，演示活了就不出声 */
const status = computed(() => {
  if (!canEmbed.value) return ''
  if (timedOut.value) return t('home.desktop.live.delayed')
  if (showFrame.value) return loading.value ? t('home.desktop.live.loading') : ''
  return t('home.desktop.live.waiting')
})

let readyFrameWindow = null
let hideTimer = null
let startedAt = 0
let nearViewport = false
let pageReady = false
let liveQuery = null
let resizeObserver = null
let cancelAutomaticStart = () => {}
let stopObserving = () => {}

/** 只认本次挂载的 iframe 发来的消息；重载到 DOM 更新之间一律不认 */
const setFrame = (frame) => {
  frameEl.value = frame
  readyFrameWindow = frame?.contentWindow ?? null
}

const clearHideTimer = () => {
  if (hideTimer) {
    clearTimeout(hideTimer)
    hideTimer = null
  }
}

const armTimeout = () => {
  clearHideTimer()
  hideTimer = setTimeout(() => {
    timedOut.value = true
  }, READY_TIMEOUT_MS)
}

/**
 * 桌面占了大半屏，滚轮停在上面翻不动页面，访客就卡在这一节了：
 * 应用全局给 html / body / #root 写了 overscroll-behavior: none（防安卓整页回弹），
 * 滚动因此传不出 iframe。这里放开根节点，指针停在壁纸、标题栏这些不滚的地方时照常翻页；
 * 窗口里的滚动区仍然 contain，对话滚到底不会带着整个首页走。
 */
const tuneFrameScroll = () => {
  try {
    const doc = frameEl.value?.contentDocument
    if (!doc?.head || doc.getElementById('deepstudent-desktop-scroll')) return
    const style = doc.createElement('style')
    style.id = 'deepstudent-desktop-scroll'
    style.textContent = 'html, body, #root { overscroll-behavior: auto !important; } .wb-window, .wb-window * { overscroll-behavior: contain; }'
    doc.head.appendChild(style)
  } catch {
    // 跨域调试地址读不到 contentDocument，保持原样
  }
}

const hideLoading = () => {
  clearHideTimer()
  if (loading.value && started.value) {
    track('desktop_demo_ready', { seconds: String(Math.round((performance.now() - startedAt) / 1000)) })
  }
  loading.value = false
  timedOut.value = false
}

/** trigger：auto（滚到附近）/ pointer / focus / button，只用于打点 */
const startDemo = (trigger = 'button') => {
  if (!canEmbed.value || (started.value && !timedOut.value)) return
  cancelAutomaticStart()
  stopObserving()
  readyFrameWindow = null
  track('desktop_demo_start', { trigger: started.value ? 'retry' : trigger })
  startedAt = performance.now()
  if (started.value) frameKey.value += 1
  started.value = true
  timedOut.value = false
  loading.value = true
  armTimeout()
}

const maybeStartDemo = () => {
  if (pageReady && nearViewport && !started.value && !document.hidden) startDemo('auto')
}

/** 滚动经过不算想用；鼠标停上来、键盘焦点进来才提前开 */
const onPointerIntent = (event) => {
  if (event.pointerType === 'mouse' && !timedOut.value) startDemo('pointer')
}

const onFocusIntent = () => {
  if (!timedOut.value) startDemo('focus')
}

const onMessage = (event) => {
  if (!demoOrigin.value || event.origin !== demoOrigin.value) return
  if (!readyFrameWindow || event.source !== readyFrameWindow) return
  if (event.data?.type !== 'demo-shell-ready') return
  hideLoading()
  tuneFrameScroll()
}

/** 跨域调试时收不到 ready（演示只发给自己的 origin），用 load 兜底 */
const onFrameLoad = (event) => {
  if (!readyFrameWindow || event.currentTarget !== frameEl.value) return
  if (demoOrigin.value !== window.location.origin) {
    clearHideTimer()
    hideTimer = setTimeout(hideLoading, 600)
  }
}

const measure = () => {
  const stage = stageEl.value
  if (!stage) return
  const width = Math.round(stage.clientWidth)
  const height = Math.round(stage.clientHeight)
  if (width !== stageSize.value.width || height !== stageSize.value.height) stageSize.value = { width, height }
}

const onLiveQueryChange = () => {
  liveCapable.value = liveQuery.matches
  maybeStartDemo()
}

/** 换主题就是换一份演示：旧 iframe 立刻失效，免得它的 ready 被当成新文档的 */
watch(frameSrc, () => {
  if (!showFrame.value) return
  readyFrameWindow = null
  frameKey.value += 1
  loading.value = true
  timedOut.value = false
  armTimeout()
}, { flush: 'sync' })

onMounted(() => {
  mounted.value = true
  liveQuery = window.matchMedia(LIVE_QUERY)
  liveCapable.value = liveQuery.matches
  liveQuery.addEventListener('change', onLiveQueryChange)
  window.addEventListener('message', onMessage)
  document.addEventListener('visibilitychange', maybeStartDemo)
  measure()
  if (typeof ResizeObserver !== 'undefined' && stageEl.value) {
    resizeObserver = new ResizeObserver(measure)
    resizeObserver.observe(stageEl.value)
  }
  stopObserving = observeNearViewport(stageEl.value, (near) => {
    nearViewport = near
    maybeStartDemo()
  }, 900)
  // 首屏演示先载（访客第一眼看的是它），这一节晚一拍再开始
  cancelAutomaticStart = afterPageLoad(() => {
    pageReady = true
    maybeStartDemo()
  }, { delay: 2500 })
})

onUnmounted(() => {
  viewerOpen.value = false
  document.removeEventListener('keydown', onViewerKey)
  readyFrameWindow = null
  liveQuery?.removeEventListener('change', onLiveQueryChange)
  window.removeEventListener('message', onMessage)
  document.removeEventListener('visibilitychange', maybeStartDemo)
  resizeObserver?.disconnect()
  cancelAutomaticStart()
  stopObserving()
  clearHideTimer()
})
</script>

<template>
  <figure class="dd">
    <div ref="stageEl" class="dd__stage" @pointerenter="onPointerIntent" @focusin="onFocusIntent">
      <!-- iframe 直接挂在常驻的 .dd__screen 里：函数 ref 是同步调用的，
           要是连外层一起新建，调用时 iframe 还没进文档，contentWindow 是 null -->
      <div class="dd__screen" :style="screenStyle">
        <iframe
          v-if="showFrame"
          :key="frameKey"
          :ref="setFrame"
          class="dd__frame"
          :src="frameSrc"
          :title="t('home.desktop.live.title')"
          @load="onFrameLoad"
        />
      </div>

      <!-- 截图随 HTML 一起到达（alt 给爬虫和读屏）；宽屏上它藏起来，只留铺满舞台的模糊底，演示 ready 后淡出 -->
      <Transition name="dd-poster">
        <div v-if="!showFrame || loading" class="dd__poster" :style="posterVars">
          <FeatureShot class="dd__shot" :name="art" :alt="alt" />
          <!-- 只在截图版（触屏 / 窄窗口）出现：整张图都是这个按钮的点击区 -->
          <button type="button" class="dd__zoom" @click="openViewer">
            <span class="dd__zoom-chip">{{ t('home.desktop.live.zoom') }}</span>
          </button>
          <p v-if="status" class="dd__status">
            <span role="status">{{ status }}</span>
            <button
              v-if="!started || timedOut"
              type="button"
              @click="startDemo('button')"
            >{{ timedOut ? t('appShell.retry') : t('home.desktop.live.start') }}</button>
          </p>
        </div>
      </Transition>
    </div>

    <figcaption class="dd__caption">
      <!-- 三句都进 SSR，按设备只显示一句（CSS 媒体查询与 LIVE_QUERY 同一条件），首帧不跳 -->
      <p class="dd__hint dd__hint--live">{{ t('home.desktop.live.hint') }}</p>
      <p class="dd__hint dd__hint--narrow">{{ t('home.desktop.live.narrow') }}</p>
      <p class="dd__hint dd__hint--touch">{{ t('home.desktop.live.touch') }}</p>
    </figcaption>

    <Teleport to="body">
      <div
        v-if="viewerOpen"
        class="dd-viewer"
        role="dialog"
        aria-modal="true"
        :aria-label="t('home.desktop.live.zoom')"
        @click.self="closeViewer"
      >
        <div class="dd-viewer__scroll">
          <img class="dd-viewer__img" :src="viewerSrc" :alt="alt" width="1440" height="900" />
        </div>
        <p class="dd-viewer__hint" aria-hidden="true">{{ t('home.desktop.live.pan') }}</p>
        <button ref="viewerClose" type="button" class="dd-viewer__close" :aria-label="t('home.desktop.live.close')" @click="closeViewer">
          <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true">
            <path d="M4 4l8 8M12 4l-8 8" />
          </svg>
        </button>
      </div>
    </Teleport>
  </figure>
</template>

<style scoped>
/* 跳出正文栏，占页面宽度的 95%：窗口要有地方摆 */
.dd {
  width: 95%;
  margin: clamp(2rem, 4vw, 3rem) auto 0;
}

/*
 * 舞台：默认（手机、平板、触屏）是一张 16:10 的截图；
 * 宽屏 + 鼠标时高度改成「一屏减去顶栏和上下留白」，但不比 16:10 更高、也不矮于 560（再矮就摆不下两扇窗）。
 * 59.375vw = 95vw × 10 / 16，就是 16:10 的高度
 */
.dd__stage {
  position: relative;
  overflow: hidden;
  aspect-ratio: 16 / 10;
  border: 1px solid var(--lp-hair);
  border-radius: 16px;
  background: #cfd6da;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05), 0 24px 60px rgba(0, 0, 0, 0.12);
}

.dark .dd__stage {
  background: #10161c;
}

@media (min-width: 1024px) and (pointer: fine) {
  .dd__stage {
    aspect-ratio: auto;
    height: max(560px, min(calc(100svh - var(--vp-nav-height, 64px) - 56px), 59.375vw));
  }
}

@media (max-width: 520px) {
  .dd__stage {
    border-radius: 10px;
  }
}

.dd__screen {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform-origin: top left;
}

.dd__frame {
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
}

/* 触屏 / 窄屏：舞台 16:10，截图正好铺满；宽屏：只留铺满舞台的模糊底和中间那枚状态 */
.dd__poster {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.dd__poster::before {
  content: '';
  position: absolute;
  inset: -48px;
  background: var(--dd-shot-light) center / cover no-repeat;
  filter: blur(32px) saturate(1.1);
}

.dark .dd__poster::before {
  background-image: var(--dd-shot-dark);
}

.dd__shot {
  position: relative;
  width: 100%;
}

.dd__shot :deep(.fs__img) {
  user-select: none;
}

@media (min-width: 1024px) and (pointer: fine) {
  .dd__shot {
    display: none;
  }
}

.dd__status {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
  padding: 8px 16px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.12);
  color: rgba(0, 0, 0, 0.72);
  font-size: 13px;
  line-height: 1.5;
  backdrop-filter: blur(12px);
}

.dark .dd__status {
  background: rgba(20, 24, 28, 0.72);
  color: rgba(255, 255, 255, 0.82);
}

.dd__status button {
  padding: 2px 10px;
  border: 1px solid currentColor;
  border-radius: 999px;
  background: transparent;
  color: inherit;
  font-weight: 500;
  cursor: pointer;
}

.dd__status button:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 3px;
}

/* 截图版（触屏 / 窄窗口）：整张图都能点开大图；宽屏 + 鼠标是实时桌面，用不着 */
.dd__zoom {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;
  padding: 10px;
  border: 0;
  background: transparent;
  cursor: zoom-in;
}

.dd__zoom-chip {
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  font-size: 12px;
  line-height: 1.5;
  backdrop-filter: blur(8px);
}

.dd__zoom:focus-visible {
  outline: 2px solid #0066cc;
  outline-offset: -2px;
}

@media (min-width: 1024px) and (pointer: fine) {
  .dd__zoom {
    display: none;
  }
}

/* 大图：按视口高度铺开，竖着拿手机时接近原尺寸，左右滑动看整张；比视口窄（横屏）时居中 */
.dd-viewer {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(10, 12, 14, 0.94);
}

.dd-viewer__scroll {
  height: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  overscroll-behavior: contain;
}

.dd-viewer__img {
  display: block;
  width: auto;
  max-width: none;
  height: 100%;
  margin-inline: auto;
}

.dd-viewer__hint {
  position: absolute;
  bottom: calc(16px + env(safe-area-inset-bottom));
  left: 50%;
  margin: 0;
  padding: 6px 14px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-size: 13px;
  transform: translateX(-50%);
  pointer-events: none;
  animation: dd-hint 3.2s ease forwards;
}

@keyframes dd-hint {
  0%,
  70% {
    opacity: 1;
  }

  100% {
    opacity: 0;
  }
}

.dd-viewer__close {
  position: absolute;
  top: calc(12px + env(safe-area-inset-top));
  right: calc(12px + env(safe-area-inset-right));
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border: 0;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  cursor: pointer;
}

.dd-viewer__close:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 2px;
}

.dd-poster-leave-active {
  transition: opacity 0.3s ease;
}

.dd-poster-leave-to {
  opacity: 0;
}

.dd__caption {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 4px 18px;
  margin-top: 14px;
}

.dd__hint {
  flex: 1 1 320px;
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 13px;
  line-height: 1.6;
}

/* 触屏：去电脑上看；鼠标但窗口太窄：把窗口拉宽；宽屏 + 鼠标：怎么玩 */
.dd__hint--live,
.dd__hint--narrow {
  display: none;
}

@media (pointer: fine) {
  .dd__hint--touch {
    display: none;
  }

  .dd__hint--narrow {
    display: block;
  }
}

@media (min-width: 1024px) and (pointer: fine) {
  .dd__hint--narrow {
    display: none;
  }

  .dd__hint--live {
    display: block;
  }
}

@media (prefers-reduced-motion: reduce) {
  .dd-poster-leave-active {
    transition: none;
  }
}
</style>
