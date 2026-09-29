<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useData } from 'vitepress'
import { useI18n } from '../i18n/index.js'
import { afterPageLoad, observeNearViewport } from '../lib/deferred-work.js'

/**
 * 应用演示壳。
 * 视觉与行为复刻自团队提供的演示页（47.88.78.106:8010 的那套壳）：
 *   · 无边框窗壳，靠 ::after 做「顶缘受光、底缘回暗」的物理窗沿
 *   · 内屏按应用真实窗口尺寸 1112×773 渲染，再等比缩放到窗壳宽度
 *     —— 这样应用永远走桌面布局，不会被 768 断点切到移动端
 *   · 红绿灯放在内屏里跟着一起缩放（应用顶栏预留了空位）
 *   · iframe 就绪前铺一张真实界面截图（不是灰条骨架）
 *
 * 演示产物是同源镜像（scripts/sync-demo.mjs 抓进 docs/public/demo/），
 * 不是远程地址 —— 远程 iframe 有三个绕不过的坑：
 *   · https 站点嵌 http 演示会被浏览器按混合内容直接拦掉，线上只能退回截图；
 *   · 演示源站慢或挂，首页就白一块；
 *   · 跨域 iframe 的 touch 事件在子文档里被吃掉，手指落在演示上滑不动页面。
 * props.src / VITE_DEMO_URL 仍可覆盖成绝对地址，方便对着远程改版调试。
 *
 * 截图（docs/public/demo-poster*.webp）就是演示的真实界面。
 * 用本机 Chrome 的 headless 截图抓（--force-device-scale-factor 指定密度，
 * --virtual-time-budget 把演示脚本快进到「已生成 5 张卡片」那一屏）：
 *
 *   1. 临时在 docs/public/ 放一个只含单个 iframe 的页面，尺寸按下表，
 *      src 指向 /demo/index.html?theme=light|dark；
 *   2. 起一个能供静态资源的服务器（npm run dev 也行）；
 *   3. Chrome --headless --force-device-scale-factor=<密度>
 *      --window-size=<宽>,<高> --virtual-time-budget=40000
 *      --screenshot=<落点.png> "http://localhost:5174/__poster.html?w=<宽>&h=<高>&theme=<主题>"
 *   4. 编码成 WebP：桌面 q76，手机 q76。
 *
 * 密度不是越高越好，是算过账的（tests/poster-density.test.mjs 守着这条线）：
 *   桌面 2× —— 3× 要 119 KB（+51 KB），而 DPR 3 的桌面屏极少，不值；
 *   手机 3× —— 44 KB，比 2× 的 37 KB 只多 7 KB，而手机几乎全是 3× 屏，
 *             2× 时正好欠 1.5×，文字发虚。这 7 KB 换的是多数人的清晰度。
 * 演示镜像同步过（demo-mirror.json 的 signature 变了）就该重拍一次，
 * 否则截图和真应用对不上。
 *
 *   POSTER_VIEWPORT = { 桌面: 1112×773, 手机: 296×569 }
 */
const NATIVE_W = 1112
const NATIVE_H = 773

/**
 * 同源镜像入口（docs/public/demo/index.html）。
 * 写全 index.html 而不是 /demo/：dev 模式下带尾斜杠的路径会被
 * VitePress 的 404 fallback 接管，iframe 里就变成一个 404 页。
 * 线上 cleanUrls 会把 /demo/index.html 308 到 /demo，两种地址都留着 ——
 * 镜像入口的资源引用已由 sync-demo.mjs 钉成 /demo/ 下的根绝对路径，
 * 所以最终落在哪个 URL 上都指向同一批资源（见 pinEntryRefs）。
 */
const MIRROR_SRC = '/demo/index.html'

const props = defineProps({
  /** 覆盖演示地址；不传则用 VITE_DEMO_URL / 同源镜像 */
  src: { type: String, default: '' }
})

const { isDark } = useData()
const { t } = useI18n()

const resolvedSrc = computed(
  () => props.src || import.meta.env.VITE_DEMO_URL || MIRROR_SRC
)

/**
 * 相对路径 = 同源镜像，永远嵌得进去；
 * 只有被覆盖成绝对地址时才要防混合内容（https 页面嵌 http 会被拦掉）。
 */
const embeddable = () => {
  if (!resolvedSrc.value || typeof window === 'undefined') return false
  try {
    const url = new URL(resolvedSrc.value, window.location.href)
    return ['http:', 'https:'].includes(url.protocol)
      && !(window.location.protocol === 'https:' && url.protocol === 'http:')
  } catch {
    return false
  }
}

/** 显式覆盖演示的深浅色参数，同时保留覆盖地址的其他 query 和 hash。 */
const frameSrc = computed(() => {
  const url = resolvedSrc.value
  if (!url) return url
  const hashAt = url.indexOf('#')
  const pathAndQuery = hashAt < 0 ? url : url.slice(0, hashAt)
  const hash = hashAt < 0 ? '' : url.slice(hashAt)
  const queryAt = pathAndQuery.indexOf('?')
  const path = queryAt < 0 ? pathAndQuery : pathAndQuery.slice(0, queryAt)
  const query = new URLSearchParams(queryAt < 0 ? '' : pathAndQuery.slice(queryAt + 1))
  query.set('theme', isDark.value ? 'dark' : 'light')
  return `${path}?${query}${hash}`
})

/** 同源后 demo 的 postMessage 才收得到（跨域时它发给自己 origin） */
const demoOrigin = computed(() => {
  if (typeof window === 'undefined') return ''
  try {
    return new URL(resolvedSrc.value, window.location.href).origin
  } catch {
    return ''
  }
})

const windowEl = ref(null)
const screenEl = ref(null)
const frameEl = ref(null)
const loading = ref(true)
const started = ref(false)
const timedOut = ref(false)
const frameKey = ref(0)
const measured = ref(false)
/** SSR 保留完整预览和相同尺寸，只把 iframe 的网络请求延后。 */
const mounted = ref(false)
const canEmbed = computed(() => mounted.value && embeddable())
const showFrame = computed(() => canEmbed.value && started.value)
/**
 * 图注右侧的状态，**只在非就绪时说话**。
 *
 * 这一行存在的意义是解释「为什么还没动」和「出事了怎么办」：
 * 还没开始（waiting）、正在载入（loading）、超时可重试（delayed）、
 * 嵌不进来（unavailable）。一旦真应用就绪，「已载入，可以直接操作」是废话 ——
 * 用户看得到、能点，告诉他这件事不产生任何新信息，所以返回空串让整块消失。
 */
const previewStatus = computed(() => {
  if (timedOut.value) return t('appShell.delayed')
  if (showFrame.value) return loading.value ? t('appShell.loading') : ''
  if (mounted.value && !canEmbed.value) return t('appShell.unavailable')
  return t('appShell.waiting')
})

let hideTimer = null
let fitFrame = 0
let cancelAutomaticStart = () => {}
let stopObserving = () => {}
let nearViewport = false
let pageReady = false
let readyFrameWindow = null

/** 只接收本次挂载的 iframe 消息；重载到 DOM 更新之间保持关闭。 */
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

const hideLoading = () => {
  clearHideTimer()
  loading.value = false
  timedOut.value = false
}

const armTimeout = () => {
  clearHideTimer()
  hideTimer = setTimeout(() => {
    timedOut.value = true
  }, 15000)
}

const startDemo = () => {
  if (!canEmbed.value || (started.value && !timedOut.value)) return
  cancelAutomaticStart()
  stopObserving()
  readyFrameWindow = null
  if (started.value) frameKey.value += 1
  started.value = true
  timedOut.value = false
  loading.value = true
  armTimeout()
}

const maybeStartDemo = () => {
  if (pageReady && nearViewport && !started.value && !document.hidden) startDemo()
}

/** 意图可以提前启动，但滚动时经过窗壳不算主动体验。 */
const onPointerIntent = (event) => {
  if (event.pointerType === 'mouse' && !timedOut.value) startDemo()
}

const onFocusIntent = () => {
  if (!timedOut.value) startDemo()
}

/**
 * 把演示页的滚动限制在 iframe 内。
 *
 * 不加这层时，演示内容滚到顶部 / 底部后，浏览器会把剩余的滚轮或触摸惯性
 * 继续传给外层落地页，看起来就像「软件和页面一起在滑」。同源镜像可以安全地
 * 向子文档注入 overscroll-behavior；调试时如果换成跨域地址，则安静退化。
 */
const containFrameScroll = () => {
  try {
    const doc = frameEl.value?.contentDocument
    if (!doc?.head) return

    const styleId = 'deepstudent-demo-scroll-boundary'
    if (doc.getElementById(styleId)) return

    const style = doc.createElement('style')
    style.id = styleId
    style.textContent = `
      html,
      body,
      #root {
        overscroll-behavior-y: contain;
      }
    `
    doc.head.appendChild(style)
  } catch {
    // 跨域 demo 不允许读取 contentDocument，保留原有行为。
  }
}

/** 跨域时收不到 demo 的 postMessage（它发给自己 origin），用 load 事件兜底 */
const onFrameLoad = (event) => {
  if (!readyFrameWindow || event.currentTarget !== frameEl.value) return
  containFrameScroll()
  // 同源镜像由应用真正挂载后发 ready；跨域调试不能收到它，才用 load 兜底。
  if (demoOrigin.value !== window.location.origin) {
    clearHideTimer()
    hideTimer = setTimeout(hideLoading, 600)
  }
}

const onMessage = (event) => {
  if (!demoOrigin.value || event.origin !== demoOrigin.value) return
  if (!readyFrameWindow || event.source !== readyFrameWindow) return
  if (event.data?.type === 'demo-shell-ready') hideLoading()
}

/*
 * 只有 MOBILE 这一个断点要进 JS：内屏在 768 以下不再缩放
 * （缩完字太小），直接让应用走自己的移动端布局。
 * 手机壳的开关（≤639px）纯靠 CSS 媒体查询，不在 JS 里重复一份，
 * 那样 SSR 首屏就是手机壳，不会先渲染成普通窗壳再跳一下。
 */
const MOBILE_QUERY = '(max-width: 767px)'

const isMobile = () =>
  typeof window !== 'undefined' && window.matchMedia(MOBILE_QUERY).matches

/**
 * 内屏双模式（与演示页一致）：
 * 桌面——1112×773 等比缩放到窗壳宽度，窗壳高度由 aspect-ratio 兜住；
 * 手机——不缩放，iframe 以容器真实宽度渲染，走应用自己的移动端布局。
 */
const fit = () => {
  const win = windowEl.value
  const scr = screenEl.value
  if (!win || !scr) return

  if (isMobile()) {
    scr.style.transform = ''
    return
  }

  scr.style.transform = `scale(${win.clientWidth / NATIVE_W})`
  measured.value = true
}

watch(frameSrc, () => {
  if (!showFrame.value) return
  // 同步失效旧窗口，避免旧 ready 在 Vue 更新 iframe 之前被当作新文档的消息。
  readyFrameWindow = null
  frameKey.value += 1
  loading.value = true
  timedOut.value = false
  armTimeout()
}, { flush: 'sync' })

onMounted(() => {
  mounted.value = true
  window.addEventListener('message', onMessage)
  window.addEventListener('resize', fit)
  document.addEventListener('visibilitychange', maybeStartDemo)
  fit()
  fitFrame = requestAnimationFrame(fit)
  stopObserving = observeNearViewport(windowEl.value, (near) => {
    nearViewport = near
    maybeStartDemo()
  }, 240)
  cancelAutomaticStart = afterPageLoad(() => {
    pageReady = true
    maybeStartDemo()
  }, { delay: 800 })
})

onUnmounted(() => {
  readyFrameWindow = null
  window.removeEventListener('message', onMessage)
  window.removeEventListener('resize', fit)
  document.removeEventListener('visibilitychange', maybeStartDemo)
  cancelAnimationFrame(fitFrame)
  cancelAutomaticStart()
  stopObserving()
  clearHideTimer()
})
</script>

<template>
  <figure class="sh sh--phone sh--embed" :class="{ 'sh--measured': measured }">
    <div
      ref="windowEl"
      class="sh__window"
      @pointerenter="onPointerIntent"
      @focusin="onFocusIntent"
    >
      <div ref="screenEl" class="sh__screen">
        <div class="sh__stage">
          <iframe
            v-if="showFrame"
            :key="frameKey"
            :ref="setFrame"
            class="sh__frame"
            :src="frameSrc"
            :title="t('appShell.title')"
            loading="lazy"
            @load="onFrameLoad"
          />

          <!--
            真实界面截图：随 HTML 一起到达，首屏就是成品而不是灰条骨架。
            应用 ready 后才淡出，不把空白当加载成功。
            尺寸按 iframe 实际渲染尺寸抓（桌面 1112×773、手机 296×569），
            所以换成真应用时几乎不发生重排。

            四张图由 <picture> 按视口宽度与 prefers-color-scheme 选，
            一次只会下载一张。src / 第三条 source 额外绑到 isDark：
            手动切外观与系统偏好相反时也能对上（系统偏好优先那条 source
            不受影响，唯一兜不住的是「系统暗色 + 手动切亮 + 窄屏」这一种）。
          -->
          <Transition name="sh-poster">
            <div v-if="!showFrame || loading" class="sh__poster">
              <picture>
                <source
                  media="(max-width: 639px) and (prefers-color-scheme: dark)"
                  srcset="/demo-poster-mobile-dark@3x.webp"
                />
                <source media="(prefers-color-scheme: dark)" srcset="/demo-poster-dark.webp" />
                <source
                  media="(max-width: 639px)"
                  :srcset="isDark ? '/demo-poster-mobile-dark@3x.webp' : '/demo-poster-mobile@3x.webp'"
                />
                <img
                  class="sh__poster-img"
                  :src="isDark ? '/demo-poster-dark.webp' : '/demo-poster.webp'"
                  :alt="t('appShell.posterAlt')"
                  width="1112"
                  height="773"
                  decoding="async"
                  fetchpriority="high"
                />
              </picture>
            </div>
          </Transition>

          <div class="sh__lights" aria-hidden="true">
            <i /><i /><i />
          </div>
        </div>

        <!--
         * 手机壳的状态栏：灵动岛在这里占掉一块真实高度，
         * 演示内容自然被推到下面 —— 跟 iOS 一样，应用不会跑到岛底下。
         * 靠 order: -1 放在演示区域前面。
         * 窄屏之外一律 display: none，所以桌面端看不到它。
         * -->
        <div class="sh__status" aria-hidden="true">
          <span class="sh__island" />
        </div>

        <!--
         * 底部安全区：**只占位，不上色**。
         * 演示应用跑在 iframe 里，量不到 env(safe-area-inset-bottom)（恒为 0），
         * 它的输入框会一路贴到屏幕物理底边 —— 看着像被切掉了。
         * 所以这里真占一段高度把 iframe 顶上去，而不是画一条指示条盖在内容上
         * （盖上去的话内容该贴边还是贴边，只是被遮住了）。
         * 留白露出的是内屏底色，与真机安全区一样，应用背景自然延伸下来。
         * 放 DOM 末尾是为了排在 iframe 之后，靠 order 兜底。
         * -->
        <span class="sh__safe" aria-hidden="true" />
      </div>
    </div>

    <!--
      说明与状态放在窗壳**下面**当图注：上面只留成品画面。
      文案仍在 SSR HTML 里（爬虫和关掉 JS 的人要看得到），
      只是不再压在截图上方抢视觉。
    -->
    <figcaption class="sh__caption">
      <p class="sh__caption-title">{{ t('appShell.previewTitle') }}</p>
      <p class="sh__caption-text">{{ t('appShell.previewDescription') }}</p>
      <!-- 就绪后整块连同「重新载入」一起消失，剩标题与说明当图注 -->
      <p v-if="previewStatus" class="sh__caption-actions">
        <span role="status">{{ previewStatus }}</span>
        <button
          v-if="canEmbed && (!started || timedOut)"
          type="button"
          @click="startDemo"
        >{{ timedOut ? t('appShell.retry') : t('appShell.start') }}</button>
      </p>
    </figcaption>
  </figure>
</template>

<style scoped>
.sh {
  --sh-window-bg: hsl(0 0% 100%);
  --sh-window-border: hsl(0 0% 85%);
  --sh-ink-3: hsl(220 5% 56%);
  --sh-accent: hsl(215 72% 42%);
  --sh-window-shadow:
    0 1px 1px hsl(0 0% 0% / 0.04),
    0 12px 28px -12px hsl(0 0% 0% / 0.16),
    0 48px 96px -40px hsl(0 0% 0% / 0.22);

  /* 手机壳：深石墨中框，靠顶缘高光做出金属厚度 */
  --sh-phone-frame: hsl(220 6% 16%);
  --sh-phone-edge: hsl(220 6% 29%);
  --sh-phone-island: hsl(220 8% 5%);
  --sh-phone-island-ring: rgba(255, 255, 255, 0.18);
  --sh-phone-shadow:
    0 1px 1px hsl(0 0% 0% / 0.16),
    0 18px 40px -16px hsl(0 0% 0% / 0.42),
    0 64px 104px -48px hsl(0 0% 0% / 0.44);
  --sh-phone-radius: 48px;
  --sh-phone-screen-radius: 36px;

  /* 中框等宽（iPhone 那种窄边），灵动岛叠在内屏上、底部安全区占内屏内的真实高度 */
  --sh-phone-bezel: 11px;

  /* 内屏比例 = iPhone 15/16 Pro 的 393×852 pt */
  --sh-phone-screen-ratio: 393 / 852;

  /* 灵动岛：按内屏宽度的百分比走，比例固定，比真机更宽更扁 */
  --sh-phone-island-w: 34%;
  --sh-phone-island-max-w: 118px;
  --sh-phone-island-ratio: 3.9 / 1;
  --sh-phone-island-top: 9px;
  /* 岛下方的余量，加上岛高就得到状态栏总高（≈ 真机的 59pt 安全区） */
  --sh-phone-island-gap: 8px;

  /*
   * 底部安全区高度：≈ iOS 的 34pt / 852pt。
   * 内屏宽上限 380（减去两侧 11px 中框 ≈358）→ 高 ≈776px，34/852 约 31px，取整 30px。
   * 窄屏上内屏更矮，这段占比会略大一点，但仍在合理范围。
   */
  --sh-phone-safe-h: 30px;

  margin: 0;
  width: 100%;
}

.dark .sh {
  --sh-window-bg: hsl(0 0% 9%);
  --sh-window-border: hsl(0 0% 21%);
  --sh-ink-3: hsl(0 0% 46%);
  --sh-accent: hsl(214 64% 72%);
  --sh-window-shadow:
    0 1px 1px hsl(0 0% 0% / 0.4),
    0 12px 32px -10px hsl(0 0% 0% / 0.55),
    0 56px 112px -32px hsl(0 0% 0% / 0.6);

  /* 深色底上把中框提亮一档，否则整台机器会糊进背景 */
  --sh-phone-frame: hsl(220 5% 23%);
  --sh-phone-edge: hsl(220 5% 36%);
  /* 深色下内屏是 9% 灰，岛比它更黑才看得出是个「洞」 */
  --sh-phone-island: hsl(220 10% 4%);
  --sh-phone-island-ring: rgba(255, 255, 255, 0.1);
  --sh-phone-shadow:
    0 1px 1px hsl(0 0% 0% / 0.5),
    0 18px 40px -14px hsl(0 0% 0% / 0.6),
    0 64px 104px -44px hsl(0 0% 0% / 0.65);
}

.sh__window {
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: 12px;
  border: 1px solid var(--sh-window-border);
  background: var(--sh-window-bg);
  box-shadow: var(--sh-window-shadow);
  animation: sh-rise 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.18s both;
}

/* 窗沿边缘光：顶缘受光、底缘回暗 */
.sh__window::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 3;
  border-radius: inherit;
  pointer-events: none;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.35),
    inset 0 -1px 0 rgba(0, 0, 0, 0.04);
}

.dark .sh__window::after {
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    inset 0 -1px 0 rgba(0, 0, 0, 0.35);
}

.sh__screen {
  position: relative;
  width: 100%;
}

/* 嵌入模式：窗壳按真实窗口比例定高，内屏以 1112×773 渲染后缩放 */
.sh--embed .sh__window {
  aspect-ratio: 1112 / 773;
}

.sh--embed .sh__screen {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  transform-origin: top left;
}

@media (min-width: 768px) {
  .sh--measured .sh__screen {
    width: 1112px;
    height: 773px;
  }
}

.sh__stage {
  position: relative;
  width: 100%;
  height: 100%;
}

.sh__frame {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
}

/*
 * 真实界面截图。
 *
 * 铺满 .sh__stage —— 也就是 iframe 实际占的那块：桌面下 stage 就是整块内屏，
 * 手机下 stage 是状态栏与安全区之间的那一段。截图按同样的尺寸抓（1112×773 /
 * 296×569），所以换帧时基本不重排。
 *
 * object-fit: cover 只在 640–767 那一档（窗壳 480×680，比例对不上）起作用，
 * 裁掉一截而不是把画面拉变形；另两档比例一致，cover 等于原尺寸。
 */
.sh__poster {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: var(--sh-window-bg);
}

.sh__poster picture,
.sh__poster img {
  display: block;
  width: 100%;
  height: 100%;
}

.sh__poster img {
  object-fit: cover;
  object-position: center;
  /* 截图自带界面配色，不参与主题反色 */
  user-select: none;
}

/* 截图淡出：真应用已经就位，交叉一下再撤，避免硬跳 */
.sh-poster-leave-active {
  transition: opacity 0.22s ease;
}

.sh-poster-leave-to {
  opacity: 0;
}

/* 图注：窗壳下方的说明 + 状态 + 手动开始 */
.sh__caption {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 4px 18px;
  margin-top: 14px;
  text-align: left;
}

.sh__caption-title {
  margin: 0;
  color: var(--vp-c-text-1);
  font-size: 15px;
  font-weight: 600;
  line-height: 1.6;
}

.sh__caption-text {
  flex: 1 1 260px;
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 13px;
  line-height: 1.6;
}

.sh__caption-actions {
  display: flex;
  flex: 0 0 auto;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 12px;
  margin: 0;
  color: var(--sh-ink-3);
  font-size: 12px;
  line-height: 1.6;
}

.sh__caption-actions button {
  padding: 3px 10px;
  border: 1px solid var(--sh-window-border);
  border-radius: 999px;
  background: transparent;
  color: var(--sh-accent);
  font-weight: 500;
  cursor: pointer;
}

.sh__caption-actions button:focus-visible {
  outline: 2px solid var(--sh-accent);
  outline-offset: 3px;
}

/* macOS 红绿灯：放在内屏里随应用一起缩放，与应用顶栏预留空位对齐 */
.sh__lights {
  position: absolute;
  top: 14px;
  left: 12px;
  z-index: 2;
  display: flex;
  gap: 8px;
  pointer-events: none;
}

.sh__lights i {
  display: block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  box-shadow: inset 0 0 1px rgba(0, 0, 0, 0.18);
}

.sh__lights i:nth-child(1) {
  background: #ff5f57;
}

.sh__lights i:nth-child(2) {
  background: #febc2e;
}

.sh__lights i:nth-child(3) {
  background: #28c840;
}

@keyframes sh-rise {
  from {
    transform: translateY(12px);
  }
}

/*
 * 手机壳的状态栏与底部安全区：只在 ≤639px 的手机壳里存在，
 * 其余尺寸一律关掉，所以它们可以无条件写在模板里（SSR 也不会闪）。
 */
.sh__status,
.sh__safe {
  display: none;
}

/*
 * 底部安全区：内屏纵向 flex 的最后一个子项，实打实占掉一段高度 ——
 * iframe 因此矮 30px，应用自己的输入框就不会贴到屏幕物理底边。
 * 不上色、不描边：留白露出内屏底色就够了，画一条指示条反而会重新盖住内容。
 */
.sh__safe {
  order: 1;
  flex: 0 0 auto;
  height: var(--sh-phone-safe-h);
  pointer-events: none;
}

/*
 * 平板 / 横屏手机：去窗壳化，不缩放，走应用自己的布局。
 *
 * 这一档的应用宽度 <768，会切到**竖屏形态**的界面，所以框也必须是竖的：
 * 宽度封顶 480px，高度按视口比例兜底。否则会得到一个横着的方盒子装着竖屏界面 ——
 * 左右全是空的，纵向还被压得只剩几行。
 *
 * 高度这条必须**卡在 640 以上**：下面手机壳的内屏高度是由宽度按 393:852 推出来的
 * （390 视口下 ≈689px），如果这里再用 height 硬压一档，内屏就会比壳子高，
 * 多出来的正好是下圆角与底部安全区 —— 被 .sh__window 的 overflow: hidden 整块切掉，
 * 手机看上去像被刀削了底。
 */
@media (min-width: 640px) and (max-width: 767px) {
  .sh--embed .sh__window {
    width: min(100%, 480px);
    margin-inline: auto;
    aspect-ratio: auto;
    height: min(86svh, 680px);
    border-radius: 20px;
  }

  .sh--embed .sh__screen {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    transform: none;
  }
}

/*
 * 红绿灯是「macOS 窗壳」的一部分：一旦离开桌面窗壳（≤767 去窗壳化、
 * ≤639 换成手机中框）就没有存在的理由。这条要独立于上面的高度规则，
 * 否则会被区间收窄漏掉，红绿灯就跑到手机屏里去了。
 */
@media (max-width: 767px) {
  .sh__lights {
    display: none;
  }
}

/*
 * 手机壳：把内屏装进设备中框。
 * 中框等宽（iPhone 那种窄边）；灵动岛不浮在内容上，而是占用状态栏的真实高度，
 * 内屏比例锁死 393×852，整体就是一台竖着的 iPhone。
 * 宽度封顶 380px：窄屏上填满，宽一点的窄屏上也不会被拉成横屏比例。
 *
 * 高度必须由内屏推出来（aspect-ratio + height: auto），
 * 这里显式写 height: auto 是为了把「高度归内屏管」这条约束钉死：
 * 一旦有更宽的媒体查询给 .sh__window 塞了固定高度，内屏就会被 overflow 裁掉底部。
 */
@media (max-width: 639px) {
  .sh--phone .sh__window {
    width: min(100%, 380px);
    margin-inline: auto;
    aspect-ratio: auto;
    height: auto;
    padding: var(--sh-phone-bezel);
    border-color: var(--sh-phone-edge);
    border-radius: var(--sh-phone-radius);
    background: var(--sh-phone-frame);
    box-shadow: var(--sh-phone-shadow);
  }

  /*
   * 状态栏：灵动岛在这里占掉一块真实高度，内屏剩下多少就给 iframe 多少。
   * 底色用 --sh-window-bg，与演示应用自己的画布同色，
   * 所以它看上去就是 iOS 那条状态栏，而不是一条硬边。
   */
  .sh--phone .sh__status {
    position: relative;
    z-index: 2;
    order: -1; /* DOM 里排在 iframe 之后，视觉上要在最上面 */
    display: flex;
    flex: 0 0 auto;
    justify-content: center;
    padding-top: var(--sh-phone-island-top);
    padding-bottom: var(--sh-phone-island-gap);
    background: var(--sh-window-bg);
  }

  /* 灵动岛本体：比真机更宽更扁，描边 + 极淡投影把它从内容上托起来 */
  .sh--phone .sh__island {
    display: block;
    width: min(var(--sh-phone-island-w), var(--sh-phone-island-max-w));
    aspect-ratio: var(--sh-phone-island-ratio);
    min-height: 24px;
    border-radius: 999px;
    background: var(--sh-phone-island);
    box-shadow:
      inset 0 0 0 1px var(--sh-phone-island-ring),
      0 1px 2px rgba(0, 0, 0, 0.22);
  }

  /* 中框边缘光：比桌面窗壳亮一档，才像金属而不是一圈描边 */
  .sh--phone .sh__window::after {
    box-shadow:
      inset 0 1px 0 rgba(255, 255, 255, 0.22),
      inset 0 -1px 0 rgba(0, 0, 0, 0.45);
  }

  /*
   * 内屏：比例锁死 iPhone 15/16 Pro 的 393×852，高度全部由宽度推出来，
   * 所以不管容器多宽，它都是一台竖着的 iPhone，不会被拉成横屏。
   * 内部改成纵向 flex：状态栏自适应 + 演示区吃掉剩余高度。
   */
  .sh--phone .sh__screen {
    position: relative;
    inset: auto;
    display: flex;
    flex-direction: column;
    width: 100%;
    aspect-ratio: var(--sh-phone-screen-ratio);
    height: auto;
    overflow: hidden;
    transform: none;
    border-radius: var(--sh-phone-screen-radius);
    /* 退回骨架时没有 iframe 铺底，内屏得自己给底色 */
    background: var(--sh-window-bg);
    /* 内屏与中框之间那道暗缝，不用 border 是为了不占内屏宽度 */
    box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.55);
  }

  /* 演示与截图共用同一块剩余空间，给状态栏和底部安全区让位。 */
  .sh--phone .sh__stage {
    flex: 1 1 auto;
    min-height: 0;
    width: 100%;
    height: auto;
  }

  .sh--phone .sh__safe {
    display: block;
  }
}

@media (prefers-reduced-motion: reduce) {
  .sh__window {
    animation: none;
  }

  .sh-poster-leave-active {
    transition: none;
  }
}
</style>
