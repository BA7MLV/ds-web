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
 * 每行字按网格里记的 offsets 挪回界面上的真实高度（行距才匀）；导图连线、进度环不在格子里，
 * 按 shapes 画成一串点（连线沿路径、进度环沿真圆周），进度那段在扫描带过去之后顺时针依次亮起。
 * 墨色只有四档语义，颜色读 --fa-* 变量，跟着深浅主题走。
 */
const props = defineProps({
  /** 对应 features/<name>.json 与 features/<name>-light|dark.webp */
  name: { type: String, required: true },
  alt: { type: String, default: '' },
  /** 网格行列：只用来在 SSR 首帧占好宽高比，要和生成器里这一扇的 grid 一致 */
  cols: { type: Number, default: 74 },
  rows: { type: Number, default: 26 },
  /**
   * 由外层决定何时露出真实截图（「使用流程」整张卡是一个按钮，指针事件到不了这里）。
   * 不传就自己管：鼠标悬停 / 触屏轻点。
   */
  reveal: { type: Boolean, default: undefined }
})

const external = computed(() => props.reveal !== undefined)
const frameStyle = computed(() => ({ aspectRatio: `${props.cols * 8} / ${props.rows * 16}` }))

const { isDark } = useData()

/** 扫描：第一列到最后一列依次开始；每格先乱码一会儿，定格时亮一下 */
const SWEEP_MS = 620
const JITTER_MS = 300
const SCRAMBLE_MS = 240
const FLASH_MS = 160
const TICK_MS = 55
const FILL_MS = 520
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
let dots = []
let endMs = END_MS
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

/** 这一格的字要往上 / 下挪多少格高：offsets 每行一个数，或几段各自的 [[起始列, 偏移], …] */
const offsetAt = (r, c) => {
  const row = grid.offsets?.[r]
  if (typeof row !== 'object' || !row) return row || 0
  let dy = 0
  for (const [c0, value] of row) if (c >= c0) dy = value
  return dy
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
        dy: STROKES.has(chr) ? 0 : offsetAt(r, c),
        settle: (c / grid.cols) * SWEEP_MS + Math.random() * JITTER_MS + SCRAMBLE_MS,
        seed: Math.floor(Math.random() * GLITCH.length)
      })
    })
  })
}

/**
 * 连线和圆环拆成点（坐标是网格像素，一格 = cellW × cellH）。
 * 连线：生成器已经按 4.5 网格像素取好点，每点一颗小点，和字一样随扫描带闪一下再定格。
 * 圆环：点距约为描边宽，点径约为它的一半；轨道上的点同上，进度弧上的点扫描带一到就以淡墨出现，
 * 等扫描带过了环心，再从起点顺时针依次亮成重墨。
 */
const buildDots = () => {
  dots = []
  const width = grid.cols * grid.cellW
  const sweepAt = (x) => (x / width) * SWEEP_MS + Math.random() * JITTER_MS
  for (const path of grid.shapes || []) {
    if (path.kind !== 'path') continue
    const rad = Math.min(Math.max(path.w * 0.42, 0.8), 1.4)
    for (const [x, y] of path.points) {
      const appear = sweepAt(x)
      dots.push({ x, y, rad, ink: 'n', appear, settle: appear + SCRAMBLE_MS, flicker: true, seed: Math.floor(Math.random() * 3) })
    }
  }
  for (const ring of grid.shapes || []) {
    if (ring.kind !== 'ring') continue
    const n = Math.max(12, Math.round((2 * Math.PI * ring.r) / Math.max(ring.w * 0.8, 5)))
    const rad = Math.max(ring.w * 0.28, 1)
    const reach = (ring.x / width) * SWEEP_MS + SCRAMBLE_MS
    for (let i = 0; i < n; i += 1) {
      const t = i / n
      const progress = ring.fill !== null && t < ring.fill
      if (!progress && ring.fill !== null && !ring.track) continue
      const a = (ring.start * Math.PI) / 180 + t * 2 * Math.PI
      const x = ring.x + ring.r * Math.cos(a)
      const sweep = sweepAt(x)
      dots.push({
        x,
        y: ring.y + ring.r * Math.sin(a),
        rad,
        ink: progress ? 'b' : 'd',
        appear: sweep,
        settle: progress ? Math.max(reach + (t / ring.fill) * FILL_MS, sweep) : sweep + SCRAMBLE_MS,
        flicker: !progress,
        seed: Math.floor(Math.random() * 3)
      })
    }
  }
  endMs = Math.max(END_MS, ...dots.map((dot) => dot.settle + FLASH_MS))
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
    ctx.fillText(chr, cell.wide ? x + cw : x + cw / 2, y + ch / 2 + cell.dy * ch)
  }
  ctx.lineCap = 'round'
  for (const [bucket, width] of [[lines, 1], [bars, Math.max(2, ch * 0.18)]]) {
    ctx.lineWidth = width
    for (const [color, path] of bucket) {
      ctx.strokeStyle = color
      ctx.stroke(path)
    }
  }
  const scale = cw / grid.cellW
  const spots = new Map()
  for (const dot of dots) {
    if (elapsed < dot.appear) continue
    let color = colors[dot.ink] || colors.d
    if (elapsed < dot.settle) {
      if (dot.flicker && (dot.seed + Math.floor(elapsed / TICK_MS)) % 3 === 0) continue
      color = colors.d
    } else if (elapsed < dot.settle + FLASH_MS) {
      color = colors.b
    }
    if (!spots.has(color)) spots.set(color, new Path2D())
    const path = spots.get(color)
    const px = dot.x * scale
    const py = dot.y * scale
    path.moveTo(px + dot.rad * scale, py)
    path.arc(px, py, dot.rad * scale, 0, 2 * Math.PI)
  }
  for (const [color, path] of spots) {
    ctx.fillStyle = color
    ctx.fill(path)
  }
}

const tick = (now) => {
  if (disposed) return
  if (!startedAt) startedAt = now
  const elapsed = now - startedAt
  if (elapsed >= endMs) {
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
  if (external.value || event.pointerType !== 'mouse') return
  wantShot.value = true
  revealed.value = true
}
const onPointerLeave = (event) => {
  if (!external.value && event.pointerType === 'mouse') revealed.value = false
}
const onPointerUp = (event) => {
  if (external.value || event.pointerType === 'mouse') return
  wantShot.value = true
  revealed.value = !revealed.value
}

watch(() => props.reveal, (value) => {
  if (value === undefined) return
  if (value) wantShot.value = true
  revealed.value = value
})

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
  buildDots()
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
    :style="frameStyle"
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
/* 尺寸跟着网格走（默认 74 × 26 格，一格 8 × 16，宽高比由 frameStyle 给）：SSR 首帧就占好位置，canvas 画上去不重排 */
.fa {
  position: relative;
  width: min(100%, var(--fa-max-width, 520px));
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
