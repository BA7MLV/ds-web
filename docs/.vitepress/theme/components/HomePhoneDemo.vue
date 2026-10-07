<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useData } from 'vitepress'
import mirror from '../../data/demo-mirror.json'
import { useI18n } from '../i18n/index.js'
import { afterPageLoad, observeNearViewport } from '../lib/deferred-work.js'

/**
 * 首页「手机上」一节的手机：Android 版界面的实时演示。
 *
 * 同一份同源演示镜像（/demo/index.html，主仓库 demo.html）在 390px 宽度下自然落进移动端布局
 * ——顶栏、抽屉、输入栏都是手机版的真实界面。
 * 只在宽屏 + 鼠标 / 触控板上载入（LIVE_QUERY），滚到附近才开始下载；手机和平板上就是一张海报
 * （发布演示时按同一画面拍的 posters/mobile-*.webp）：在手机里再套一台手机没有意义，还白耗流量。
 * 演示载入后等进入视口再发 demo:activate，访客看着它打字提问、流式回答。
 */
const NATIVE = { width: 390, height: 780 }
const LIVE_QUERY = '(min-width: 900px) and (pointer: fine)'
const READY_TIMEOUT_MS = 20000

const { isDark } = useData()
const { locale } = useI18n()

const entry = computed(() => (mirror.apps || []).find((app) => app.id === 'mobile') || null)
const theme = computed(() => (isDark.value ? 'dark' : 'light'))
const poster = computed(() => {
  const posters = entry.value?.posters || []
  if (!posters.length) return ''
  return `/demo/posters/mobile-${posters.includes(theme.value) ? theme.value : posters[0]}.webp`
})
const frameSrc = computed(() => {
  const params = new URLSearchParams({ theme: theme.value })
  if (locale.value === 'en-US') params.set('lang', 'en')
  return `/demo/index.html?${params}`
})

const root = ref(null)
const frame = ref(null)
const live = ref(false)
const ready = ref(false)
const visible = ref(false)
let activated = false
let cleanups = []

const activate = () => {
  if (activated || !ready.value || !visible.value) return
  activated = true
  frame.value?.contentWindow?.postMessage({ type: 'demo:activate' }, window.location.origin)
}

const onMessage = (event) => {
  if (event.origin !== window.location.origin || event.source !== frame.value?.contentWindow) return
  if (event.data?.type === 'demo-shell-ready') {
    ready.value = true
    activate()
  }
}

onMounted(() => {
  if (!entry.value || !window.matchMedia(LIVE_QUERY).matches) return
  window.addEventListener('message', onMessage)
  let started = false
  const stopObserving = observeNearViewport(root.value, (near) => {
    if (!near || started) return
    started = true
    cleanups.push(afterPageLoad(() => {
      live.value = true
      const timer = window.setTimeout(() => {
        ready.value = true
        activate()
      }, READY_TIMEOUT_MS)
      cleanups.push(() => clearTimeout(timer))
    }))
  }, 900)
  const stopVisible = observeNearViewport(root.value, (inView) => {
    visible.value = inView
    activate()
  }, 0)
  cleanups.push(stopObserving, stopVisible, () => window.removeEventListener('message', onMessage))
})

onUnmounted(() => {
  cleanups.forEach((stop) => stop?.())
  cleanups = []
})
</script>

<template>
  <div v-if="entry" ref="root" class="phone" :style="{ '--phone-w': `${NATIVE.width}px`, '--phone-h': `${NATIVE.height}px` }">
    <div class="phone__body">
      <div class="phone__screen">
        <img v-if="poster" :src="poster" alt="" class="phone__poster" :class="{ 'phone__poster--hidden': ready }" loading="lazy" decoding="async" />
        <iframe
          v-if="live"
          :key="frameSrc"
          ref="frame"
          :src="frameSrc"
          class="phone__frame"
          :class="{ 'phone__frame--ready': ready }"
          title="Deep Student Android 界面实时演示"
          tabindex="-1"
          loading="lazy"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
/*
 * 机身：屏幕按原生 390×780 渲染，整台手机等比缩到容器里（--phone-scale），
 * 文字和点按区域和真机一样，只是整体缩小一点
 */
.phone {
  --bezel: 12px;
  --phone-scale: 0.86;
  width: calc((var(--phone-w) + var(--bezel) * 2) * var(--phone-scale));
  height: calc((var(--phone-h) + var(--bezel) * 2) * var(--phone-scale));
  margin: 0 auto;
}

.phone__body {
  position: relative;
  width: calc(var(--phone-w) + var(--bezel) * 2);
  height: calc(var(--phone-h) + var(--bezel) * 2);
  padding: var(--bezel);
  border-radius: 54px;
  background: linear-gradient(145deg, #2b2f36, #121418 60%, #23272d);
  box-shadow:
    inset 0 0 0 1.5px rgba(255, 255, 255, 0.08),
    0 2px 4px rgba(0, 0, 0, 0.08),
    0 30px 70px rgba(0, 0, 0, 0.22);
  transform: scale(var(--phone-scale));
  transform-origin: 0 0;
}

.phone__screen {
  position: relative;
  width: var(--phone-w);
  height: var(--phone-h);
  overflow: hidden;
  border-radius: 42px;
  background: var(--vp-c-bg);
}

.phone__poster,
.phone__frame {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  border: 0;
}

.phone__poster {
  object-fit: cover;
  object-position: top center;
  transition: opacity 0.3s ease;
}

.phone__poster--hidden {
  opacity: 0;
}

.phone__frame {
  opacity: 0;
  transition: opacity 0.3s ease;
}

.phone__frame--ready {
  opacity: 1;
}

@media (max-width: 899px) {
  .phone {
    --phone-scale: 0.72;
  }
}

@media (max-width: 380px) {
  .phone {
    --phone-scale: 0.62;
  }
}
</style>
