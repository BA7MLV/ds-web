<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from '../i18n/index.js'
import FeatureShot from './FeatureShot.vue'

/**
 * 「想明白 / 记得住」—— Apple 产品页式的不对称双卡。
 *
 * 只取使用流程里的后两步（steps[1]、steps[2]）。左窄右宽，约 1:2。
 * 每张卡：小标签 + 短标题钉在左上，画面从右下裁进来，右下角一个 +。
 *
 * 两条交互上的口径：
 *
 * 1. **整张卡都能点**。标题里那个 <button> 的伪元素铺满卡片（stretched link），
 *    于是鼠标、手指、键盘、读屏拿到的是同一个目标，右下角的 + 退成纯提示
 *    （aria-hidden + pointer-events: none），不再是第二个可点区域。
 *    卡片本身不做 transform —— 点开的瞬间要量它的矩形，悬停/按压若改了尺寸，
 *    量到的就是被缩放过的值，浮层起点会偏。反馈做在画面和 + 上。
 *
 * 2. **打开是从卡片中心长出来，不是「居中淡入一个弹窗」，也不是描着卡片的矩形做形变**。
 *    量出卡片与浮层两个矩形，等比缩放到「起点那个盒子整个落在卡片内部」，
 *    把浮层的中心平移到卡片中心（transform-origin 用元素自己的中心），
 *    透明度只给前 200ms —— 前段就实起来，后半程是一块实心浮层把最后一点距离走完。
 *    内容全程可见：整段藏起来会在中间露出一块空壳，那才是上一版最「怪」的地方。
 *    关闭沿原路缩回卡片中心 —— 所以 fromRect 只在打开时量一次。
 *
 * 3. **画面是真实界面截图**（FeatureShot，和功能区同一套）：
 *    scripts/gen-features-live.mjs 在演示里打开对应界面截下取景框，深浅色各一张，跟着主题换。
 */
const { t, tm } = useI18n()

const steps = computed(() => tm('home.flow.steps').slice(1))

/** 卡片圆角。浮层起点用 CARD_RADIUS / scale 抵消缩放，视觉上才和卡片对得上 */
const CARD_RADIUS = 28
/** 浮层矩形小到不可信（截图还没加载出来）就别放大，直接出现在终点 */
const MIN_RECT = 48

/** 当前打开的卡片；-1 表示都收起 */
const openIndex = ref(-1)
const open = ref(false)
const closing = ref(false)
/**
 * 动画开关。
 * 浮层是带着起点态（透明 + 贴在卡片上）挂载的：新插入的元素没有「变化前」的样式，
 * 挂载那一刻就写终态的话，CSS 过渡根本不会跑。所以晚一帧再把它拨到 true，
 * 位移 / 缩放 / 圆角 / 透明度由 CSS 按各自的时长一起补间。
 */
const revealed = ref(false)

/** 卡片上的按钮。纯 DOM 引用，不需要响应式 */
const triggers = []
/** 被缩放 / 平移的浮层本体 */
const panelEl = ref(null)
/** 打开时卡片在视口里的矩形，关闭时沿原路缩回去 */
let fromRect = null
/**
 * 打开时量下的浮层终点矩形。
 * 关闭时不能现量：那会儿浮层可能正跑着打开动画（打开途中按 Esc），
 * 量到的是半路的矩形，往回缩的起点就会错。
 * 页面锁着滚动、期间也没法改视口尺寸，所以这份矩形到关闭时依然成立。
 */
let toRect = null
/** 关闭后要把焦点还给哪张卡 */
let triggerIndex = -1
let closeTimer = 0

const current = computed(() => (openIndex.value < 0 ? null : steps.value[openIndex.value]))

/**
 * 加号和底图的墨色都交给 CSS，脚本这边不再管颜色。
 *
 * 早先这里是**采图**：把底图右下角裁一块扔进 canvas 量亮度 —— 那时底图是两张
 * 深色 UI 截图，卡面浅、图深，不看图就不知道 + 该按哪一档做。现在截图跟着主题换
 * （浅色主题配浅色界面、深色配深色），+ 压着的右下角不是界面底色就是卡面底色，
 * 两者都只由主题决定 —— 也就是 `<html>` 上那个 `.dark` 类。
 *
 * 所以既没有 `data-tone`，也没有 `isDark` 参与：这条链上少一个「状态与样式可能不同步」
 * 的环节（实测过：手动切类时 VitePress 的 isDark 还没跟上，+ 就会留在上一档），
 * 顺带省掉一次 canvas 往返和一次 getImageData。
 */

/* ── 从卡片长出来 ── */
const motionOff = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * 读 :root 上的时长变量（毫秒数）。
 *
 * 必须按单位分档：生产构建的压缩器会把 `220ms` 写成 `.22s`，
 * 直接 parseFloat 会拿到 0.22 —— 关闭计时器等于当场触发，收起动画整个消失
 * （dev 下不会压缩，所以只在构建产物上暴露）。
 */
const readMs = (name, fallback) => {
  if (typeof window === 'undefined') return fallback
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  if (!raw) return fallback
  const value = Number.parseFloat(raw)
  if (!Number.isFinite(value)) return fallback
  return raw.endsWith('ms') ? value : value * 1000
}

/**
 * 把「浮层从哪儿长出来」翻译成一组 transform。
 *
 * 等比缩放，原点就是元素自己的中心（默认值）。缩放比取两个方向里较小的那个，
 * 起点那个盒子必定落在卡片内部 —— 不会先探出卡片去。
 *
 * 为什么不做「描着卡片矩形长过去」的非等比形变：卡片和浮层是两套排版，
 * 长宽比也不一样（卡片 1.6 : 1，浮层 1.16 : 1），硬拉过去等于把里面的截图
 * 当橡皮筋拉。Apple 的卡片形变之所以成立，是它两边本来就在渲染同一份内容。
 * 等比缩放没有这个前提，任何一刻都不会变形。
 */
const morphFrame = (from, to) => {
  const scale = Math.min(from.width / to.width, from.height / to.height)
  const dx = from.left + from.width / 2 - (to.left + to.width / 2)
  const dy = from.top + from.height / 2 - (to.top + to.height / 2)
  return {
    transform: `translate3d(${dx}px, ${dy}px, 0) scale(${scale})`,
    // 圆角跟着等比缩放，一视同仁地反向补偿，全程看起来都是 28px
    radius: CARD_RADIUS / scale,
  }
}

/**
 * instant=true：先关掉过渡把浮层「贴」到卡片上，强制一次样式结算，
 * 再把过渡交还给样式表 —— 下一帧改值才会补间，而不是从终点直接跳。
 */
const paintFrame = (panel, frame, instant) => {
  if (instant) panel.style.transition = 'none'
  panel.style.transform = frame.transform
  panel.style.setProperty('--morph-r', `${frame.radius}px`)
  if (instant) {
    void panel.offsetWidth
    panel.style.transition = ''
  }
}

const paintRest = (panel) => {
  panel.style.transform = 'none'
  panel.style.setProperty('--morph-r', `${CARD_RADIUS}px`)
}

/* ── 滚动锁与背景 inert ── */

const background = () => document.querySelector('.home-apple')

const lockPage = (locked) => {
  if (typeof document === 'undefined') return
  document.documentElement.classList.toggle('flow-locked', locked)
  const behind = background()
  if (!behind) return
  if (locked) behind.setAttribute('inert', '')
  else behind.removeAttribute('inert')
}

/* ── 焦点 ── */

const focusables = () => {
  const panel = panelEl.value
  if (!panel) return []
  const selector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  return [...panel.querySelectorAll(selector)].filter((el) => !el.hasAttribute('disabled'))
}

const onKey = (event) => {
  if (!open.value) return
  if (event.key === 'Escape') {
    event.preventDefault()
    closeSheet()
    return
  }
  if (event.key !== 'Tab') return
  // 浮层之外还能聚焦的只有顶栏，Tab 不该跑出去
  const list = focusables()
  if (!list.length) return
  const first = list[0]
  const last = list[list.length - 1]
  const active = document.activeElement
  const inside = panelEl.value?.contains(active)
  if (event.shiftKey && (active === first || !inside)) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && (active === last || !inside)) {
    event.preventDefault()
    first.focus()
  }
}

/* ── 开 / 关 ── */

const openSheet = async (index) => {
  if (closeTimer) clearTimeout(closeTimer)
  if (open.value) return

  // 量的是整张卡（li），不是按钮 —— 按钮的盒子只有那行字，伪元素铺出来的
  // 那片热区不在它的 border box 里，量错了起点就对不上卡片。
  const card = triggers[index]?.closest('.pair__card')
  fromRect = card ? card.getBoundingClientRect() : null
  triggerIndex = index
  revealed.value = false
  closing.value = false
  openIndex.value = index
  open.value = true
  lockPage(true)

  await nextTick()

  const panel = panelEl.value
  if (panel) {
    panel.scrollTop = 0
    const to = panel.getBoundingClientRect()
    const usable = fromRect && to.width >= MIN_RECT && to.height >= MIN_RECT && !motionOff()
    toRect = usable ? to : null
    if (usable) paintFrame(panel, morphFrame(fromRect, to), true)
    else void panel.offsetWidth // 不缩放也要先让初始态落地，透明度才有过渡
    requestAnimationFrame(() => {
      if (usable) paintRest(panel)
      revealed.value = true
    })
    panel.focus({ preventScroll: true })
  }
}

const finishClose = () => {
  closing.value = false
  revealed.value = false
  openIndex.value = -1
  fromRect = null
  toRect = null
  lockPage(false)
  const card = triggers[triggerIndex]
  triggerIndex = -1
  card?.focus?.({ preventScroll: true })
}

const closeSheet = async () => {
  if (!open.value) return
  open.value = false
  closing.value = true
  revealed.value = false

  await nextTick()

  // 不做 instant：CSS 过渡会从「当前正在跑的那一帧」接着往回缩，
  // 打开途中按 Esc 也不会跳回去再走一遍。
  const panel = panelEl.value
  if (panel && fromRect && toRect) paintFrame(panel, morphFrame(fromRect, toRect), false)

  if (closeTimer) clearTimeout(closeTimer)
  closeTimer = setTimeout(finishClose, motionOff() ? 0 : readMs('--morph-close-dur', 220))
}

onMounted(() => {
  window.addEventListener('keydown', onKey)
})

onUnmounted(() => {
  if (closeTimer) clearTimeout(closeTimer)
  window.removeEventListener('keydown', onKey)
  lockPage(false)
})
</script>

<template>
  <section id="flow" class="flow">
    <div class="lp-wrap flow__inner">
      <ul class="pair">
        <li
          v-for="(step, index) in steps"
          :key="step.label"
          class="pair__card"
        >
          <p class="pair__label">{{ step.label }}</p>
          <h3 class="pair__title">
            <!-- 卡片的唯一交互元素：伪元素铺满整张卡，见 .pair__hit::after -->
            <button
              :ref="(el) => (triggers[index] = el)"
              type="button"
              class="pair__hit"
              aria-haspopup="dialog"
              :aria-expanded="open && openIndex === index"
              @click="openSheet(index)"
            >{{ step.statement }}</button>
          </h3>

          <!-- 一扇「窗」：真实界面截图，从卡片底边升上来 -->
          <span :class="['pair__shot', `pair__shot--${index}`]">
            <FeatureShot :name="step.art" :alt="step.alt" />
          </span>

          <span class="pair__plus" aria-hidden="true">
            <svg viewBox="0 0 16 16">
              <path d="M8 3.5v9M3.5 8h9" />
            </svg>
          </span>
        </li>
      </ul>
    </div>

    <Teleport to="body">
      <div
        v-if="current"
        class="sheet"
        :class="{ 'is-open': open, 'is-closing': closing, 'is-revealed': revealed }"
      >
        <button
          type="button"
          class="sheet__backdrop"
          :aria-label="t('home.flow.close')"
          tabindex="-1"
          @click="closeSheet"
        />

        <div
          ref="panelEl"
          class="sheet__panel"
          role="dialog"
          aria-modal="true"
          tabindex="-1"
          aria-labelledby="flow-sheet-title"
        >
          <button type="button" class="sheet__close" :aria-label="t('home.flow.close')" @click="closeSheet">
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>

          <div class="sheet__stage">
            <div :class="['sheet__shot', `sheet__shot--${openIndex}`]">
              <FeatureShot :key="current.art" :name="current.art" :alt="current.alt" />
            </div>
          </div>

          <div class="sheet__copy">
            <p class="sheet__label">{{ current.label }}</p>
            <h3 id="flow-sheet-title" class="sheet__title">{{ current.statement }}</h3>
            <ul class="sheet__items">
              <li v-for="item in current.items" :key="item.title" class="sheet__item">
                <h4 class="sheet__item-title">{{ item.title }}</h4>
                <p class="sheet__item-desc">{{ item.desc }}</p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Teleport>
  </section>
</template>

<style scoped>
.flow {
  position: relative;
  margin-bottom: var(--lp-block);
  scroll-margin-top: calc(var(--vp-nav-height) + 24px);
}

.flow__inner {
  padding-top: 2.5rem;
}

.pair {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.pair__card {
  position: relative;
  min-height: 440px;
  padding: 28px;
  border-radius: 28px;
  background: var(--lp-tile);
  overflow: hidden;
  /*
   * 自成一格（stacking context），好让画面用 z-index: -1 沉到文字下面、
   * 又不掉到卡片背景后面去。
   * 另外：标签和标题都不能 position，否则 .pair__hit::after 的包含块会从
   * 卡片变成它们，铺不满整张卡（铺满整卡就靠那个包含块）。
   */
  isolation: isolate;
}

.pair__label {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.3;
  letter-spacing: -0.01em;
  color: var(--lp-text);
}

.pair__title {
  margin: 8px 0 0;
  max-width: 16em;
  font-size: clamp(1.5rem, 2.4vw, 2rem);
  font-weight: 600;
  line-height: 1.15;
  letter-spacing: -0.028em;
  color: var(--lp-text);
}

/*
 * 文字本身是按钮，外形完全交给 .pair__title 定，按钮只负责可点。
 * 焦点环画在铺满卡片的伪元素上，不画在字上。
 */
.pair__hit {
  display: inline;
  margin: 0;
  padding: 0;
  border: 0;
  background: none;
  font: inherit;
  letter-spacing: inherit;
  color: inherit;
  text-align: left;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
}

.pair__hit:focus {
  outline: none;
}

.pair__hit::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 1;
  border-radius: 28px;
}

.pair__hit:focus-visible::after {
  outline: 2px solid var(--lp-text);
  outline-offset: -4px;
}

/*
 * 画面是一扇「窗」：左边对齐卡片内边距，从卡片底边升上来（窗的底边压在卡片底边下面），
 * 右下角的 + 压在窗上。窗里整张铺满真实截图，窗本身只有一层很淡的描边和投影，
 * 深浅两套都读 --lp-* 变量。宽度给窗，高度由截图的宽高比决定，卡片的 min-height 留够了。
 * 截图的取景框本身是完整的（生成器保证框边不切开界面），这里不再裁它。
 */
.pair__shot {
  position: absolute;
  z-index: -1;
  left: 28px;
  bottom: -1px;
  box-sizing: border-box;
  overflow: hidden;
  border: 1px solid var(--lp-hair);
  border-bottom: 0;
  border-radius: 14px 14px 0 0;
  background: var(--lp-surface);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04), 0 12px 32px rgba(0, 0, 0, 0.05);
  pointer-events: none;
  user-select: none;
  transition: transform 420ms var(--lp-ease);
}

/* 窄卡：窗占满内边距之间的宽度 */
.pair__shot--0 {
  right: 28px;
}

/* 宽卡：窗不贴到右边，给右下角的 + 留出位置 */
.pair__shot--1 {
  width: min(calc(100% - 96px), 640px);
}

/*
 * + 的档位是**照主题写的**，不是设计稿里另挑的一对颜色：
 * 浅色卡面 #f5f5f7 → 黑圆白加；深色卡面 #26262a → 白圆黑加。
 * 挂在 `.dark` 上而不是某个 JS 状态上 —— 只要页面确实是深色，它就一定对。
 */
.pair__plus {
  position: absolute;
  right: 18px;
  bottom: 18px;
  z-index: 2;
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 999px;
  background: #1d1d1f;
  color: #f5f5f7;
  pointer-events: none;
  transition: transform 260ms var(--lp-ease);
}

.dark .pair__plus {
  background: #f5f5f7;
  color: #1d1d1f;
}

.pair__plus svg {
  width: 14px;
  height: 14px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.6;
  stroke-linecap: round;
}

/*
 * 悬停 / 按压反馈只做在画面和 + 上 —— 卡片的几何尺寸保持不变，
 * 点开时量出来的矩形才是干净的。（见脚本里的口径 1）
 */
@media (hover: hover) {
  .pair__card:hover .pair__shot {
    transform: translate3d(0, -6px, 0) scale(1.012);
  }

  .pair__card:hover .pair__plus {
    transform: scale(1.08);
  }
}

.pair__card:active .pair__shot {
  transform: none;
  transition-duration: 140ms;
}

.pair__card:active .pair__plus {
  transform: scale(0.94);
  transition-duration: 140ms;
}

/*
 * ── 展开浮层：上半画面，下半文案 ──
 *
 * 一条硬约束：**浮层不许超出可视区**。顶出去的那一截是滚不回来的 ——
 * 垂直居中会把「比容器高的部分」均分到上下两头，上面那截正好落在滚动区之外，
 * 内容就永久看不到了。三道保险：
 *
 * 1. 高度用 dvh。移动端地址栏收起前后可视高度差一截，vh 取的是「大」的那一档，
 *    地址栏在场时浮层就正好高出可视区一段。dvh 跟的是当下这一档。
 * 2. 外层自己 overflow: auto，浮层固定从上内边距开始排。
 *    这样无论内容高矮都不会越过视口顶部，超高时由外层继续向下滚。
 * 3. max-height 与 padding 共用一个 --sheet-pad，两边不会各说各话。
 */
.sheet {
  --sheet-pad: 32px;
  position: fixed;
  inset: 0;
  z-index: 80;
  display: grid;
  align-items: start;
  justify-items: center;
  padding: var(--sheet-pad) 20px;
  overflow: auto;
}

/* 背板钉在视口上：外层可滚，absolute 的背板会跟着滚出边界 */
.sheet__backdrop {
  position: fixed;
  inset: 0;
  border: 0;
  padding: 0;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  opacity: 0;
  cursor: pointer;
  transition: opacity 220ms ease;
}

.sheet.is-revealed .sheet__backdrop {
  opacity: 1;
}

.sheet.is-closing .sheet__backdrop {
  opacity: 0;
  transition-duration: 180ms;
}

/*
 * 从卡片长出来的主角。位移 / 缩放由脚本内联写入，圆角跟着 --morph-r 一起补间。
 * transform-origin 用默认的 50% 50%（浮层从卡片中心长出来）。
 *
 * 基础态就是「关掉的样子」，也是刚挂载时的起点态：透明 + 贴在卡片上。
 * 打开时 .is-revealed 一挂上，CSS 用它自己的时长把这两件事一起跑起来；
 * 关闭时把 .is-revealed 摘掉，基础态那套（更短的）时长接手。
 * 所以不需要再给关闭单独写一条 transition。
 *
 * 内容全程可见 —— 上一版把内容整段藏起来，于是中间露出一大块空壳，
 * 看上去像先弹出一块灰板再往里填东西。
 */
.sheet__panel {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  width: min(100%, 980px);
  /* 终态固定贴着浮层的上内边距，不再垂直居中；内容再高也只向下延伸。 */
  margin: 0 auto auto;
  max-height: calc(100vh - var(--sheet-pad) * 2); /* 老浏览器兜底 */
  max-height: calc(100dvh - var(--sheet-pad) * 2);
  overflow: auto;
  border-radius: var(--morph-r, 28px);
  background: var(--lp-surface);
  box-shadow: 0 40px 90px -50px rgba(0, 0, 0, 0.55);
  opacity: 0;
  transition:
    transform var(--morph-close-dur) var(--morph-ease),
    --morph-r var(--morph-close-dur) var(--morph-ease),
    opacity 180ms var(--morph-ease);
}

/*
 * 展开：容器走 420ms，透明度只给前 200ms —— 让它在前半程就实起来，
 * 后半程是一块实心浮层继续把最后一点距离走完，不会半透明地晃到最后。
 */
.sheet.is-revealed .sheet__panel {
  opacity: 1;
  transition:
    transform var(--morph-open-dur) var(--morph-ease),
    --morph-r var(--morph-open-dur) var(--morph-ease),
    opacity 200ms var(--morph-ease);
}

.sheet__panel:focus {
  outline: none;
}

.sheet__close {
  position: absolute;
  top: 18px;
  right: 18px;
  z-index: 2;
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: var(--lp-text);
  color: var(--lp-surface);
  cursor: pointer;
}

.sheet__close svg {
  width: 12px;
  height: 12px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
}

.sheet__close:focus-visible {
  outline: 2px solid var(--lp-text);
  outline-offset: 3px;
}

/*
 * 上半画面区必须是一个有明确上限的“窗口”，不能再被底图的固有比例撑高。
 * 之前这里只写 min-height，280×176 的图按 720px 宽度放大后会反过来扩大这一行，
 * 结果图案越过分界线、压进下面的会话文案区。现在高度由视口决定。
 *
 * 底图从 `<img>` 换成内联 SVG 之后，「contain」不用再自己写：这一层是定死的盒子，
 * 里面的 svg 铺满它，剩下的交给 SVG 自带的 `preserveAspectRatio="xMidYMid meet"` ——
 * 那正是 `object-fit: contain` 的语义（按比例缩到装得下、居中、留白）。
 */
.sheet__stage {
  display: grid;
  grid-template-rows: minmax(0, 1fr);
  place-items: center;
  box-sizing: border-box;
  height: clamp(180px, 42vh, 420px);
  height: clamp(180px, 42dvh, 420px);
  padding: 56px 48px 40px;
  overflow: hidden;
  background: var(--lp-tile);
}

.sheet__shot {
  display: grid;
  place-items: center;
  width: 100%;
  max-width: 720px;
  height: 100%;
  min-height: 0;
}

/*
 * 展开态的截图按舞台收：宽高都不超出、按比例缩到装得下、居中（object-fit: contain 的语义）。
 * 截图是 2 倍图（srcset 2x），自然尺寸就是取景框的 CSS 尺寸，舞台再大也不会放糊
 */
.sheet__shot :deep(.fs) {
  display: contents;
}

.sheet__shot :deep(.fs__img) {
  width: auto;
  height: auto;
  max-width: 100%;
  max-height: 100%;
  border: 1px solid var(--lp-hair);
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05), 0 10px 28px rgba(0, 0, 0, 0.08);
}

.sheet__copy {
  padding: 56px 10% 72px;
}

.sheet__label {
  margin: 0;
  font-size: 15px;
  line-height: 1.4;
  color: var(--lp-text-3);
}

.sheet__title {
  margin: 10px 0 0;
  max-width: 14em;
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 600;
  line-height: 1.08;
  letter-spacing: -0.03em;
  color: var(--lp-text);
}

.sheet__items {
  margin: 22px 0 0;
  padding: 0;
  max-width: 38em;
  list-style: none;
}

.sheet__item + .sheet__item {
  margin-top: 16px;
}

.sheet__item-title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.4;
  letter-spacing: -0.012em;
  color: var(--lp-text);
}

.sheet__item-desc {
  margin: 2px 0 0;
  font-size: 1.0625rem;
  line-height: 1.55;
  color: var(--lp-text-2);
}

@media (max-width: 760px) {
  .pair {
    grid-template-columns: minmax(0, 1fr);
  }

  .pair__card {
    min-height: 360px;
  }

  /*
   * 单列时卡片高度跟着内容走：窗回到文档流里，接在标题下面、贴住卡片底边，
   * 不再靠 min-height 撑出一块空白。宽卡那张截图整张缩进卡宽，不放宽、不裁边。
   */
  .pair__card {
    min-height: 0;
    padding-bottom: 0;
  }

  .pair__shot,
  .pair__shot--0,
  .pair__shot--1 {
    position: relative;
    left: auto;
    right: auto;
    bottom: auto;
    display: block;
    width: auto;
    margin: 28px 0 -1px;
  }

  .sheet {
    --sheet-pad: 16px;
    padding: var(--sheet-pad) 12px;
  }

  .sheet__stage {
    height: clamp(160px, 34dvh, 240px);
    padding: 40px 16px 24px;
  }

  .sheet__copy {
    padding: 32px 24px 40px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .pair__shot,
  .pair__plus,
  .sheet__backdrop,
  .sheet__panel {
    transition: none !important;
  }
}
</style>
