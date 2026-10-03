<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useData } from 'vitepress'
import { featureShot, loadFeatureArt } from '../utils/feature-art.js'

/**
 * 功能区的一扇字符画窗。
 *
 * 网格来自 scripts/gen-features-live.mjs：演示里真实界面的框线和文字，一格一个字符。
 * 这里把它画到 canvas 上：
 *   · 第一次进入视口（轮播切过来也算）时，一道乱码带从左往右扫过，扫过的地方定格成画面；
 *   · 悬停（触屏是轻点）淡入同一取景框的真实截图，和字符逐格对齐；
 *   · 系统开了「减少动态效果」就不扫，直接画成品。
 * 框线字符（─│╭╮…）画成真的线段而不是字形：等宽字体里的框线字形比格子窄一点，
 * 连起来会断成虚线，圆角也只是个直角。
 * 墨色只有四档语义，颜色读 --fa-* 变量，跟着深浅主题走。
 */
const props = defineProps({
  /** 对应 features/<name>.json 与 features/<name>-light|dark.webp */
  name: { type: String, required: true },
  alt: { type: String, default: '' }
})

const { isDark } = useData()

/** 扫描：第一列到最后一列依次开始；每格先乱码一会儿，定格时亮一下 */
const SWEEP_MS = 620
const JITTER_MS = 300
const SCRAMBLE_MS = 240
const FLASH_MS = 160
const TICK_MS = 55
const END_MS = SWEEP_MS + JITTER_MS + SCRAMBLE_MS + FLASH_MS
const GLITCH = '<>/\\|[]{}-_=+*^#%&@$01'
const FONT = 'ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace'
const STROKES = new Set(['─', '│', '┌', '┐', '└', '┘', '╭', '╮', '╰', '╯', '━'])

const rootEl = ref(null)
const canvasEl = ref(null)
const revealed = ref(false)
const wantShot = ref(false)
const shot = computed(() => featureShot(props.name, isDark.value))

let grid = null
let cells = []
let colors = {}
let size = { width: 0, height: 0, cw: 0, ch: 0 }
/** null = 还没开始扫；Infinity = 画成品 */
let elapsedAt = null
let startedAt = 0
let frame = 0
let viewport = null
let resizer = null
let disposed = false

const readColors = () => {
  const style = getComputedStyle(canvasEl.value)
  const read = (prop) => style.getPropertyValue(prop).trim()
  colors = { d: read('--fa-dim'), n: read('--fa-ink'), b: read('--fa-strong'), a: read('--fa-accent') }
}

const measure = () => {
  const width = rootEl.value.clientWidth
  const cw = width / grid.cols
  const ch = cw * (grid.cellH / grid.cellW)
  size = { width, height: ch * grid.rows, cw, ch }
  const ratio = Math.min(window.devicePixelRatio || 1, 2)
  canvasEl.value.width = Math.round(size.width * ratio)
  canvasEl.value.height = Math.round(size.height * ratio)
  canvasEl.value.getContext('2d').setTransform(ratio, 0, 0, ratio, 0, 0)
}

const buildCells = () => {
  cells = []
  grid.lines.forEach((line, r) => {
    const row = [...line]
    const inks = [...grid.inks[r]]
    row.forEach((chr, c) => {
      if (chr === ' ' || chr === '\u0000') return
      cells.push({
        r,
        c,
        chr,
        ink: inks[c],
        wide: row[c + 1] === '\u0000',
        settle: (c / grid.cols) * SWEEP_MS + Math.random() * JITTER_MS + SCRAMBLE_MS,
        seed: Math.floor(Math.random() * GLITCH.length)
      })
    })
  })
}

/** 框线字符按格子画成线段：横线贯穿整格、竖线贯穿整格，转角在格心拐弯 */
const strokeCell = (path, chr, x, y) => {
  const { cw, ch } = size
  const mx = x + cw / 2
  const my = y + ch / 2
  const right = x + cw
  const bottom = y + ch
  switch (chr) {
    case '─':
    case '━':
      path.moveTo(x, my)
      path.lineTo(right, my)
      break
    case '│':
      path.moveTo(mx, y)
      path.lineTo(mx, bottom)
      break
    case '┌':
      path.moveTo(mx, bottom)
      path.lineTo(mx, my)
      path.lineTo(right, my)
      break
    case '┐':
      path.moveTo(x, my)
      path.lineTo(mx, my)
      path.lineTo(mx, bottom)
      break
    case '└':
      path.moveTo(mx, y)
      path.lineTo(mx, my)
      path.lineTo(right, my)
      break
    case '┘':
      path.moveTo(x, my)
      path.lineTo(mx, my)
      path.lineTo(mx, y)
      break
    case '╭':
      path.moveTo(mx, bottom)
      path.quadraticCurveTo(mx, my, right, my)
      break
    case '╮':
      path.moveTo(x, my)
      path.quadraticCurveTo(mx, my, mx, bottom)
      break
    case '╰':
      path.moveTo(mx, y)
      path.quadraticCurveTo(mx, my, right, my)
      break
    case '╯':
      path.moveTo(x, my)
      path.quadraticCurveTo(mx, my, mx, y)
      break
  }
}

const draw = (elapsed) => {
  const ctx = canvasEl.value.getContext('2d')
  const { cw, ch } = size
  ctx.clearRect(0, 0, size.width, size.height)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const narrowFont = `${Math.min(cw / 0.6, ch * 0.84).toFixed(2)}px ${FONT}`
  const wideFont = `${Math.min(cw * 1.84, ch * 0.92).toFixed(2)}px ${FONT}`
  const lines = new Map()
  const bars = new Map()
  for (const cell of cells) {
    const x = cell.c * cw
    const y = cell.r * ch
    let chr = cell.chr
    let color = colors[cell.ink] || colors.n
    if (elapsed < cell.settle) {
      if (elapsed < cell.settle - SCRAMBLE_MS) continue
      chr = GLITCH[(cell.seed + Math.floor(elapsed / TICK_MS)) % GLITCH.length]
      color = colors.d
    } else if (elapsed < cell.settle + FLASH_MS) {
      color = colors.b
    }
    if (chr === cell.chr && STROKES.has(chr)) {
      const bucket = chr === '━' ? bars : lines
      if (!bucket.has(color)) bucket.set(color, new Path2D())
      strokeCell(bucket.get(color), chr, x, y)
      continue
    }
    ctx.font = cell.wide && chr === cell.chr ? wideFont : narrowFont
    ctx.fillStyle = color
    ctx.fillText(chr, cell.wide ? x + cw : x + cw / 2, y + ch / 2)
  }
  ctx.lineCap = 'round'
  for (const [bucket, width] of [[lines, 1], [bars, Math.max(2, ch * 0.18)]]) {
    ctx.lineWidth = width
    for (const [color, path] of bucket) {
      ctx.strokeStyle = color
      ctx.stroke(path)
    }
  }
}

const tick = (now) => {
  if (disposed) return
  if (!startedAt) startedAt = now
  const elapsed = now - startedAt
  if (elapsed >= END_MS) {
    elapsedAt = Infinity
    draw(Infinity)
    return
  }
  elapsedAt = elapsed
  draw(elapsed)
  frame = requestAnimationFrame(tick)
}

const start = () => {
  if (elapsedAt !== null) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    elapsedAt = Infinity
    draw(Infinity)
    return
  }
  elapsedAt = 0
  frame = requestAnimationFrame(tick)
}

const redraw = () => {
  if (!grid) return
  measure()
  if (elapsedAt === Infinity) draw(Infinity)
}

/** 鼠标悬停看真实截图；触屏没有悬停，轻点切换 */
const onPointerEnter = (event) => {
  if (event.pointerType !== 'mouse') return
  wantShot.value = true
  revealed.value = true
}
const onPointerLeave = (event) => {
  if (event.pointerType === 'mouse') revealed.value = false
}
const onPointerUp = (event) => {
  if (event.pointerType === 'mouse') return
  wantShot.value = true
  revealed.value = !revealed.value
}

watch(isDark, async () => {
  await nextTick()
  if (!canvasEl.value) return
  readColors()
  if (elapsedAt === Infinity) draw(Infinity)
})

onMounted(async () => {
  try {
    grid = await loadFeatureArt(props.name)
  } catch {
    return
  }
  if (disposed) return
  readColors()
  measure()
  buildCells()
  resizer = new ResizeObserver(redraw)
  resizer.observe(rootEl.value)
  viewport = new IntersectionObserver(([entry]) => {
    if (!entry?.isIntersecting) return
    viewport.disconnect()
    start()
  }, { threshold: 0.3 })
  viewport.observe(rootEl.value)
})

onUnmounted(() => {
  disposed = true
  cancelAnimationFrame(frame)
  viewport?.disconnect()
  resizer?.disconnect()
})
</script>

<template>
  <div
    ref="rootEl"
    class="fa"
    :class="{ 'fa--revealed': revealed }"
    role="img"
    :aria-label="alt"
    @pointerenter="onPointerEnter"
    @pointerleave="onPointerLeave"
    @pointerup="onPointerUp"
  >
    <canvas ref="canvasEl" class="fa__canvas" aria-hidden="true" />
    <img v-if="wantShot" class="fa__shot" :src="shot" alt="" decoding="async" />
  </div>
</template>

<style scoped>
/* 尺寸跟着网格走（74 × 26 格，一格 8 × 16）：SSR 首帧就占好位置，canvas 画上去不重排 */
.fa {
  position: relative;
  width: min(100%, 520px);
  aspect-ratio: 592 / 416;
  cursor: default;
  touch-action: manipulation;
}

.fa__canvas,
.fa__shot {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  transition: opacity 0.35s var(--lp-ease, ease);
}

.fa__shot {
  object-fit: cover;
  border-radius: 10px;
  opacity: 0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.06), 0 8px 24px rgba(0, 0, 0, 0.08);
}

.fa--revealed .fa__shot {
  opacity: 1;
}

.fa--revealed .fa__canvas {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .fa__canvas,
  .fa__shot {
    transition: none;
  }
}
</style>
