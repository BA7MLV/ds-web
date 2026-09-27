<script setup>
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useData } from 'vitepress'
import { afterPageLoad } from '../lib/deferred-work.js'

/**
 * Hero 星空底图（ordered dithering starfield）。
 *
 * 做法：离屏低分辨率画布上，先把每颗星写成一段亮度场（叠加的抛物光斑），
 * 亮色再叠上预计算的密度场（外圈一圈网点暗角，见 buildField），
 * 最后用 Bayer 8×8 有序抖动矩阵把总亮度阈值化成 1-bit 点阵，
 * 靠 CSS `image-rendering: pixelated` 放大回全屏 ——
 * 得到硬边网点质感的星空。闪烁来自每颗星独立的相位/角速度：亮度场起伏 →
 * 同一点的阈值判定翻转 → 网点忽密忽疏。没有逐帧的整屏高斯求和，
 * 开销只跟星点数量成正比。
 *
 * 滚动编排（由 --sf-y / --sf-dim / --sf-cut 驱动）：
 *   0 → 0.5：星空从上方漂到视口正中（轻微错位，不做缩放）；
 *   0.5 → 1：原地淡出 —— 位置不动，只降不透明度。
 *   两段都用 easeInOutSine，在 0.5 处导数为 0，接缝不会「顿」一下。
 *   退场不再靠位移：原来后半程要把星空向下推 118vh，同时放大到 1.12 倍，
 *   而 pixelated 画布被非整数倍放大 = 网点变糊 + 摩尔纹；深色下星点对比度高，
 *   整片看着像被往下拽走。现在只淡出，安静得多。
 *
 * 再按 Hero 的底边把下面裁掉（--sf-cut）：
 *   光靠淡出挡不住紧跟其后的「使用流程」区块 —— 淡出基准是 Hero 的高度，
 *   而 Hero 才滚到一半，那一块就已经露出小半屏了，偏偏那时星空最亮（dim 还是 0）；
 *   等它淡尽，流程区块已经占满大半个视口。实测侵入窗口约 685px 的滚动距离。
 *   现在 Hero 滚出多少就裁掉多少，流程区块里一个星点都不会有。
 *
 * 主题：
 *   星点参数（密度、大小、边缘处理）深浅共用，只换墨色与不透明度 —— 之前深色
 *   单独一套（密度是亮色的 2.3 倍、星点更大更亮），结果两种主题看起来是两个不同的
 *   效果：深色像一层会飘的雪，亮色才是细网点。
 *   唯一按主题分叉的是密度场（外圈那层网点暗角）：只在亮色铺，深色为 0，
 *   理由见 VIGNETTE_LIGHT。
 *   画布背景透明，页面自身底色透出来，顶栏玻璃也能滤到身后的星点。
 *
 * 品牌标记（.sf__brand，另一张画布，同一套 Bayer 阈值）：
 *   把 logo 也做成网点，压在这一层的左上角。关键决定是「另起一层」而不是
 *   「并进星空层」—— 并进去只有一种下场：星空那张网屏是 16px 一格
 *   （SCALE 0.5 × Bayer 8×8，且受 MAX_OFF_W 限制没法再细），
 *   360px 的图标只横跨 22 格，阈值化之后认不出形状，只剩一圈看得见的轮廓线 ——
 *   正是 VIGNETTE_LIGHT 注释里警告过的那种「有边界的网点云」。
 *   独立成层后网屏能做到 3.6px 一格（细 4 倍多），形状才读得出来。
 *   顺带解决三件事：
 *     · 它是静态的，不进逐帧循环 —— 只在构建 / 换主题 / 缩放时重算一次；
 *     · 画布只开图标那么大（外接方框 + 出血余量），不是整屏，内存从 ~13MB 降到 ~4.5MB，
 *       分辨率也不必再和星空将就；
 *     · 浓度、网屏、落点都能各自调，不牵动星点。
 *   几何和算法见 buildBrand / paintBrand。
 */

const props = defineProps({
  /** 滚动进度基准元素（Hero section）。不传则退化成视口高度 */
  anchor: { type: Object, default: null },
  /**
   * 品牌标记的淡出基准元素：它的**上沿**是图标必须淡尽的那条线（传演示窗壳）。
   * 不传则退化成图层高度的 50%。
   */
  blocker: { type: Object, default: null }
})

const { isDark } = useData()

/* ── 可调参数 ── */
const SCALE = 0.5 // 离屏分辨率：每 CSS 像素对应的离屏像素数
const MAX_OFF_W = 960 // 离屏宽度上限，防止大屏上逐像素循环变慢
const FPS = 30 // 闪烁不需要 60 帧

/*
 * 星点密度（每 CSS 像素）：深浅共用一套。
 * 深色单独放大密度是「两种主题不一样」的主要来源之一，这里直接对齐亮色。
 */
const STAR_PER_PX = 1 / 12000
const MIN_STARS = 46
const MAX_STARS = 460

/*
 * 密度场（阈值化后即「点阵覆盖率」）：只在亮色做。
 *
 * 作用是在外圈做一圈网点渐隐 —— 相当于给 Hero 加一层印刷质感的暗角。
 * 中间不能铺任何东西：有序抖动会把有边界的亮度场阈值化成一块看得见轮廓的网点云，
 * 盖在大标题上文字可读性直接崩（早前试过 0.6 / 0.1 / 0.055 / 0.035，都会留下可见边界）。
 *
 * 深色必须关掉（= 0）。深色的星点是压在近黑底上的高对比亮点，同一份「外圈密、中间空」
 * 在深色下读起来就是「背景上还压了一层黑」：那圈点阵的内边界成了一条看得见的轮廓，
 * 而它完全不随滚动走 —— 和滚动的星点叠在一起，视差一上来特别怪。
 * 深色的厚度改由星点本身表达（远近 / 大小 / 亮度 / 视差）。
 */
const VIGNETTE_LIGHT = 0.06

const INK_DARK = [245, 245, 247]
const INK_LIGHT = [29, 29, 31]
/*
 * 亮色墨点压在近白底上，0.3 已经够看；深色是浅墨压在近黑底上，
 * 同样的覆盖率会明显更抢眼（尤其是外圈那层暗角，会变成一条看得见的点状边框），
 * 所以这里比亮色还收一档，两种主题的「分量」才相当。
 */
const INK_ALPHA_DARK = 0.45
const INK_ALPHA_LIGHT = 0.3

/* 滚动编排 */
const Y_START = -18 // 起始位移（vh）：星空压在 Hero 偏上的位置
const Y_END = 0 // 结束位移（vh）：原地不动，退场只靠淡出
const CENTER_AT = 0.5 // 进度到这里时星空正好居中
const DIM_END = 1 // 退场时的淡出程度（1 = 淡尽）
const PARALLAX_VH = 22 // 层间视差幅度（vh），按星的深度错开

/*
 * 星空层高度（vh）。必须和 <style> 里 .sf 的 height 保持一致 ——
 * 下面算「Hero 底边以下裁掉多少」要用到它。
 */
const SF_HEIGHT_VH = 1.18

/*
 * 裁剪切口的软边宽度（px）。
 * 硬切的话 Hero 底边会留下一条「星点齐刷刷消失」的直线；留一段渐变，
 * 肉眼看到的只是星空自然收尾。切口小于这个值时按切口本身收窄，避免负的渐变段。
 */
const SF_EDGE_FADE = 110

/* ── 品牌标记（logo 网点）── */

/*
 * 图标来源。用 <img> 加载 docs/public/logo-black.svg 而不是把 path 抄进来：
 * 单一数据源，换 logo 不用同步两份。同源 SVG 画进 canvas 不会污染画布，
 * 可以正常 getImageData；颜色无所谓，只取 alpha 通道。
 */
const LOGO_URL = '/logo-black.svg'

/*
 * 品牌标记的网屏：画布按设备像素 1:1 开（scale = dpr），
 * 于是下面阈值化里那 8 个画布像素正好落到 8 个设备像素上 —— 缩放比恒为 1，
 * pixelated 下每个网点原样上屏，既不糊也不会整格丢点。
 * 代价是「一格的 CSS 尺寸」跟着 dpr 走：Retina 上 4px、1× 屏上 8px，
 * 都还是「比星空的 16px 细」。
 *
 * 为什么不能改成固定的 CSS 尺寸：那样画布与显示分辨率就不成整数比，canvas 变成
 * **降采样**，而 pixelated 走的是最近邻 —— 被采样漏掉的整格网点直接消失，
 * 规则网点会变得一块疏一块密（实测 380px 显示 / 608px 画布时肉眼可见）。
 * 星空层没这个问题是运气：它的缩放比恒为 0.5，乘上常见 dpr 恰好都是整数。
 */
/*
 * 画布像素预算。细网屏的代价是分辨率：一格 8 个离屏像素，
 * 3.6px 的格子在一个 478px 的方框上就是 1062×1062 —— 已经 4.5MB。
 * 大屏上必须封顶，否则内存按 (尺寸/格子)² 涨；触顶时网点会变粗，但不会崩。
 */
const BRAND_BUDGET = 1.6e6

/*
 * 浓度（阈值化之前的亮度）：0.14 意味着图标内部是 14% 的平铺网点。
 *
 * 不能更高：logo 是二值图形、没有灰阶，浓度给多大内部就整片多密 ——
 * 0.16 就已经从「水印」变成「贴纸」，比标题还抢眼（实测 0.42 更不用说了）。
 * 也不能更低：低于 0.06 只剩轮廓线，眼睛看到的是边界不是形状。
 */
const BRAND_TONE = 0.14

/*
 * 淡出：自上而下把图标化掉，终点是「blocker（演示窗壳）的上沿」。
 *
 * 不只是审美：图标的下半截会滑到演示窗壳后面，而窗壳是不透明的，
 * 它的左边界（x=180）是条竖直硬边 —— 图标右缘（x=256）已经伸到那条边右边，
 * 于是只要图标有任何一部分落在窗壳上沿之下，就会被切出一条直线。
 * 淡出必须在触到那条边之前就归零，否则那半截形状是被「切掉」的而不是「淡掉」的。
 * 所以这里配 smoothstep 而不是线性 —— 上半段保住浓度，下半段收得更快。
 */
/**
 * 图标有多少落在窗壳上沿**之上**（占图标边长）—— 这个效果唯一的「下沉量」旋钮。
 *
 * 1 = 整块都在上面（上一版的行为，图标正好贴着窗壳上沿淡尽）；
 * 调小就是整体往下沉，「实心」的部分越来越少、越来越早化掉。
 * 0.75 是折中：实心段从 35% 开始（和上一版一致，见 BRAND_FADE_BAND），
 * 在 1440×900 上比原来低 48px，形状照样读得出。
 * 再往下就是「实心部分越来越少」，0.6 以下基本只剩顶部一条边。
 */
const BRAND_VISIBLE = 0.75

/*
 * 淡出带的宽度（占图标边长）：从终点往上留这么一段做渐变。
 * 取 0.4 而不是上一版的 0.6，是为了让起点落在 0.35 —— 和上一版「实心段从 35% 开始」
 * 对齐，于是这次改动的效果就只剩「整体下沉」，形状的浓度分布没有被顺手改掉。
 */
const BRAND_FADE_BAND = 0.4

/*
 * 落点与尺寸。
 *
 * 纵向不再按图层高度的比例定位，而是**贴住窗壳上沿**：图层高 118vh，
 * 按比例定的话视口一变高图标就跟着漂，而窗壳是排版撑出来的、不跟视口高度走，
 * 两者必然错位（实测 900 高时方框顶边 235、1400 高时 440、1800 高时 604，
 * 而窗壳上沿一直是 477 —— 1400 高就已经沉进去了）。
 * 贴住上沿之后，「淡尽的那条线」和「窗壳的上沿」在任何视口高度下都重合。
 *
 * 横向：内容栅格 --lp-max 是 1080px，而演示窗壳（不透明）在 1440 视口下占
 * x 180→1260、y 477→1227 —— 左右只剩边距、下方一直到 Hero 底边都被它占着，
 * 真正空着的只有左上角一块。所以图标只能落在标题左侧那条空白里。
 *
 * 宽度上限由「标题左边界」反推：大标题在栅格里居中、桌面端约 576px 宽，
 * 于是屏幕中线往左 348px（288 半宽 + 60 呼吸）之内是安全的。
 * 可用宽度 = 视口半宽 − 348 − 两侧留白，不够 BRAND_SIZE_MIN 就不画 ——
 * 窄屏上栅格没有余量，放哪都会压到文案。
 *
 * 注意是「完整落进来」而不是出血：早前让图标左半裁到屏外（cx 取 6%），
 * 结果被裁掉一半的圆角方块读起来是个「不知道是什么的碎片」，不像水印。
 */
const BRAND_SAFE = 348
const BRAND_MARGIN = 16
const BRAND_SIZE_MIN = 200
const BRAND_SIZE_MAX = 240

/*
 * 外接方框之外多留的一点余量（占图标边长）。
 * 纯保险：logo 的圆角与描边是抗锯齿的，画布贴着外接方框会有半个像素被切。
 * 之前图标左半出血到屏外时这一圈是必须的，现在不出血了，只需要防切边。
 */
const BRAND_PAD = 0.06

/*
 * 墨色不透明度。比星点的 0.3 高一档（这一层网点更细、更稀，需要补一点分量），
 * 但深色要比亮色收一档：浅墨压在近黑底上，同样的覆盖率会明显更亮，
 * 不压住就会在深色下变成一块发灰的斑。
 */
const BRAND_ALPHA_DARK = 0.28
const BRAND_ALPHA_LIGHT = 0.55

/** 密度场的分量：只有亮色铺暗角，深色为 0（理由见 VIGNETTE_LIGHT） */
const vignette = () => (isDark.value ? 0 : VIGNETTE_LIGHT)

/* ── Bayer 8×8 有序抖动阈值 ── */
const BAYER8 = new Uint8Array([
  0, 32, 8, 40, 2, 34, 10, 42,
  48, 16, 56, 24, 50, 18, 58, 26,
  12, 44, 4, 36, 14, 46, 6, 38,
  60, 28, 52, 20, 62, 30, 54, 22,
  3, 35, 11, 43, 1, 33, 9, 41,
  51, 19, 59, 27, 49, 17, 57, 25,
  15, 47, 7, 39, 13, 45, 5, 37,
  63, 31, 55, 23, 61, 29, 53, 21
])

const BAYER_THR = new Float32Array(64)
for (let i = 0; i < 64; i += 1) BAYER_THR[i] = (BAYER8[i] + 0.5) / 64

const hostEl = ref(null)
const canvasEl = ref(null)
const brandEl = ref(null)
const ready = ref(false)
const reduced = ref(false)

let ctx = null
let imageData = null
let intensity = null
let mask = null
let field = null
let stars = []
let ow = 0
let oh = 0
let builtWidth = 0
let builtHeight = 0
let progress = 0
let loopId = 0
let lastFrame = 0
let scrollId = 0
let scrollPending = false
let resizeTimer = 0
let ro = null
let io = null
let running = false
let inView = false
let animationReady = false
let firstPaint = 0
let staticPaint = 0
let motionQuery = null
let pendingLogo = null
let cancelAnimationStart = () => {}

/* 品牌标记：logo 的栅格化结果 + 画布几何，换主题时只需重跑阈值化 */
let logoImg = null
let brandGeo = null

/** 闪烁循环只在「页面可见 + 星空在视口内」时跑；滑出画面后就别再烧帧了 */
const syncLoop = () => {
  if (!animationReady || !ready.value || reduced.value || document.hidden || !inView) stopLoop()
  else startLoop()
}

const smoothstep = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

/** 两段编排共用：在 0.5 处导数为 0，接缝处不会「顿」一下 */
const easeInOutSine = (t) => -(Math.cos(Math.PI * t) - 1) / 2

const makeStars = (w, h, cssW, cssH) => {
  const count = Math.round(Math.min(MAX_STARS, Math.max(MIN_STARS, cssW * cssH * STAR_PER_PX)))
  const list = []
  for (let i = 0; i < count; i += 1) {
    const depth = Math.random()
    const bright = Math.random() < 0.12
    /* 深度越大越「近」：更大、更亮、视差位移更明显 */
    const near = 0.55 + depth * 0.75
    list.push({
      x: Math.random() * w,
      y: Math.random() * h,
      r: (bright ? 2.6 + Math.random() * 2.2 : 0.9 + Math.random() * 0.9) * near,
      gain: (bright ? 1.2 + Math.random() * 0.5 : 0.8 + Math.random() * 0.5) * near,
      base: 0.35 + Math.random() * 0.65,
      depth,
      phase: Math.random() * Math.PI * 2,
      speed: 0.5 + Math.random() * 1.6
    })
  }
  return list
}

/**
 * 密度掩膜：四周软收边（星空不是一块硬边矩形），
 * 中间再压一档 —— 压暗的位置对着 Hero 的大标题，
 * 免得网点和大字互相干扰。
 */
const buildMask = (w, h) => {
  const m = new Float32Array(w * h)
  for (let y = 0; y < h; y += 1) {
    const v = (y + 0.5) / h
    const vFade = smoothstep(0, 0.12, v) * smoothstep(0, 0.16, 1 - v)
    const dv = (v - 0.36) / 0.3
    for (let x = 0; x < w; x += 1) {
      const u = (x + 0.5) / w
      const du = (u - 0.5) / 0.42
      const dip = 1 - 0.5 * Math.exp(-(du * du + dv * dv))
      m[y * w + x] = vFade * smoothstep(0, 0.06, u) * smoothstep(0, 0.06, 1 - u) * dip
    }
  }
  return m
}

/**
 * 密度场：预计算一次，逐帧只做一次加法。
 * amp = 0（深色）直接返回全零场，等于这层不存在 —— 连逐像素循环都省掉。
 */
const buildField = (w, h, amp) => {
  const f = new Float32Array(w * h)
  if (!amp) return f

  const cx = w * 0.5
  const cy = h * 0.46
  const rx = w * 0.5
  const ry = h * 0.5
  for (let y = 0; y < h; y += 1) {
    const ny = (y + 0.5 - cy) / ry
    for (let x = 0; x < w; x += 1) {
      const nx = (x + 0.5 - cx) / rx
      const e = Math.sqrt(nx * nx + ny * ny)
      f[y * w + x] = smoothstep(0.62, 1.3, e) * amp
    }
  }
  return f
}

/** RGB 只在主题变化时写一次，之后每帧只改 alpha 通道 */
const paintInk = () => {
  if (!imageData) return
  const ink = isDark.value ? INK_DARK : INK_LIGHT
  const data = imageData.data
  for (let i = 0; i < data.length; i += 4) {
    data[i] = ink[0]
    data[i + 1] = ink[1]
    data[i + 2] = ink[2]
  }
}

const renderFrame = () => {
  if (!ctx || !imageData) return
  const tSec = performance.now() / 1000
  intensity.fill(0)

  /* 层间视差：深度不同的星在滚动时错开，星空才有厚度 */
  const parallax = progress * (PARALLAX_VH / 100) * oh

  for (let s = 0; s < stars.length; s += 1) {
    const st = stars[s]
    const wave = 0.5 + 0.5 * Math.sin(tSec * st.speed + st.phase)
    const amp = st.gain * st.base * (0.4 + 0.6 * wave)
    const r2 = st.r * st.r
    /* 纵向循环取模：星滚出上沿就从下沿回来，密度保持均匀 */
    const sy = (((st.y + (st.depth - 0.5) * parallax) % oh) + oh) % oh
    const x0 = Math.max(0, Math.floor(st.x - st.r))
    const x1 = Math.min(ow - 1, Math.ceil(st.x + st.r))
    const y0 = Math.max(0, Math.floor(sy - st.r))
    const y1 = Math.min(oh - 1, Math.ceil(sy + st.r))

    for (let y = y0; y <= y1; y += 1) {
      const dy = y + 0.5 - sy
      const dy2 = dy * dy
      const row = y * ow
      for (let x = x0; x <= x1; x += 1) {
        const dx = x + 0.5 - st.x
        const d2 = dx * dx + dy2
        if (d2 >= r2) continue
        const f = 1 - d2 / r2
        intensity[row + x] += amp * f * f
      }
    }
  }

  const data = imageData.data
  const alpha = Math.round(255 * (isDark.value ? INK_ALPHA_DARK : INK_ALPHA_LIGHT))
  let i = 0
  for (let y = 0; y < oh; y += 1) {
    const by = (y & 7) << 3
    for (let x = 0; x < ow; x += 1, i += 1) {
      /* 密度场不走掩膜：它自己已经带了形状（中心核 / 外圈渐隐） */
      const v = intensity[i] * mask[i] + field[i]
      data[(i << 2) + 3] = v > BAYER_THR[by | (x & 7)] ? alpha : 0
    }
  }

  ctx.putImageData(imageData, 0, 0)
}

/**
 * 元素在**文档坐标**里的排版位置：累加 offsetParent 链上的 offsetTop。
 *
 * 不用 getBoundingClientRect：它把 transform 也算进去，而 Hero 的入场动画
 * （`.t-stagger-line` 的 translateY）正是压在这个元素上的 —— logo 的 <img> 通常
 * 在动画还没跑完时就 onload 了，那一瞬间量到的顶边带着 12px 的位移，
 * 图标就被永久地按下沉 12px 落位。offsetTop 只反映排版结果，与动画无关。
 */
const layoutTop = (el) => {
  let top = 0
  let node = el
  while (node) {
    top += node.offsetTop
    node = node.offsetParent
  }
  return top
}

/**
 * 品牌标记：把 logo 栅格化成一张覆盖率表。
 *
 * 画布只开图标那么大（外接方框 + 出血余量），不是整屏 ——
 * 细网屏要的是「每格 8 个离屏像素」，铺满整屏就是几百万像素、十几 MB，
 * 而这里只有一块图标。方框小了，格子才能细，内存还更省。
 *
 * 覆盖率取 logo 的 alpha（边缘自带抗锯齿），不是灰阶图：
 * 后面阈值化时乘上 BRAND_TONE 才是「网点浓度」。
 */
const buildBrand = () => {
  const canvas = brandEl.value
  const host = hostEl.value
  if (!canvas || !host) return

  const cssW = host.clientWidth
  const room = cssW / 2 - BRAND_SAFE - BRAND_MARGIN * 2
  const size = Math.min(BRAND_SIZE_MAX, Math.round(room))
  if (!cssW || size < BRAND_SIZE_MIN || !logoImg) {
    brandGeo = null
    canvas.width = 0
    canvas.height = 0
    canvas.style.width = '0px'
    canvas.style.height = '0px'
    return
  }

  const pad = Math.round(size * BRAND_PAD)
  const box = size + pad * 2

  /* 画布按设备像素 1:1 开（见 BAYER_BLOCK），再受像素预算封顶 */
  const dpr = window.devicePixelRatio || 1
  const scale = Math.min(dpr, Math.sqrt(BRAND_BUDGET / (box * box)))
  const bw = Math.max(1, Math.round(box * scale))

  canvas.width = bw
  canvas.height = bw
  const bctx = canvas.getContext('2d', { alpha: true })
  if (!bctx) return
  bctx.imageSmoothingEnabled = false

  /* logo 画进同尺寸的临时画布，读回 alpha 当覆盖率 */
  const scratch = document.createElement('canvas')
  scratch.width = bw
  scratch.height = bw
  const sctx = scratch.getContext('2d', { willReadFrequently: true })
  const inner = size * scale
  const off = (bw - inner) / 2
  sctx.drawImage(logoImg, off, off, inner, inner)

  brandGeo = { bw, off, inner, src: sctx.getImageData(0, 0, bw, bw).data }

  /*
   * 落点：左缘距屏 BRAND_MARGIN，纵向让窗壳上沿正好落在图标的 BRAND_VISIBLE 处
   * —— 也就是「淡尽的那条线」＝「窗壳的上沿」。
   *
   * 全部按**文档坐标**算：blocker 的上沿与滚动位置无关，而 .sf 自带一段自己坐标系
   * 之外的偏移，换算回图层局部坐标时要显式减掉，否则在任意滚动位置 resize
   * 都会把图标落点带偏。这段偏移有两块：
   *   · fixed 态下的 --sf-y 位移（静止态 = Y_START）；
   *   · 降级态（.sf 改成 absolute、跟着文档走）它的顶边不在 0 —— 顶栏占了 64px 的位，
   *     不减掉的话图标会正好被窗壳横切一刀。
   */
  const vh = window.innerHeight || 1
  const layerShift = reduced.value ? layoutTop(host) : (Y_START / 100) * vh

  const blocker = props.blocker
  const lineAtRest = blocker?.offsetTop !== undefined && blocker.offsetHeight
    ? layoutTop(blocker) // 窗壳上沿（文档坐标；静止态 scrollY = 0，两者等价）
    : host.clientHeight * 0.5 // 没传 blocker：退回旧行为，锚在图层正中

  const centerViewport = lineAtRest - size * (BRAND_VISIBLE - 0.5)
  const centerLocal = centerViewport - layerShift

  const cx = BRAND_MARGIN + size / 2
  canvas.style.width = `${box}px`
  canvas.style.height = `${box}px`
  canvas.style.setProperty('--sf-brand-x', `${Math.round(cx - box / 2)}px`)
  canvas.style.setProperty('--sf-brand-y', `${Math.round(centerLocal - box / 2)}px`)

  paintBrand()
}

/**
 * 品牌标记的阈值化。和星空同一套 Bayer 8×8，只是量纲不同：
 * 那边是「星点叠加出来的亮度」，这边是「覆盖率 × 浓度 × 自上而下的淡出」。
 *
 * logo 是二值图形、内部覆盖率恒为 1，所以阈值化给的不是灰阶图像，
 * 而是一张等浓度的平铺网屏 —— 层次全靠 BRAND_FADE_BAND 那个缓变撑。
 * 想让图标「由星点自己长出来」得走 intensity 那条路，试过，不成：
 * 星点总数太少（1440×900 全屏才 127 颗），局部放大 40 倍也凑不出可辨形状。
 *
 * 换主题只重跑这一步（覆盖率与几何都不变），所以切主题不会「重新掷骰子」。
 *
 * 注意这里的 fy 是**归一化到图标外接方框**的，跟画布分辨率无关 ——
 * 而落点那边保证「窗壳上沿」正好落在 fy = BRAND_VISIBLE 处，两边才对得上。
 */
const paintBrand = () => {
  const canvas = brandEl.value
  if (!canvas || !brandGeo) return
  const { bw, off, inner, src } = brandGeo
  const bctx = canvas.getContext('2d', { alpha: true })
  if (!bctx) return

  const rampEnd = BRAND_VISIBLE
  const rampStart = Math.max(0, rampEnd - BRAND_FADE_BAND)

  const img = bctx.createImageData(bw, bw)
  const ink = isDark.value ? INK_DARK : INK_LIGHT
  const alpha = Math.round(255 * (isDark.value ? BRAND_ALPHA_DARK : BRAND_ALPHA_LIGHT))
  const data = img.data
  for (let i = 0; i < data.length; i += 4) {
    data[i] = ink[0]
    data[i + 1] = ink[1]
    data[i + 2] = ink[2]
  }

  for (let y = 0; y < bw; y += 1) {
    const by = (y & 7) << 3
    const fy = Math.min(1, Math.max(0, (y + 0.5 - off) / inner))
    const ramp = 1 - smoothstep(rampStart, rampEnd, fy)
    const row = y * bw
    for (let x = 0; x < bw; x += 1) {
      const i = row + x
      const cov = src[(i << 2) + 3]
      if (!cov) continue
      const v = (cov / 255) * BRAND_TONE * ramp
      data[(i << 2) + 3] = v > BAYER_THR[by | (x & 7)] ? alpha : 0
    }
  }
  bctx.putImageData(img, 0, 0)
}

const startLoop = () => {
  if (running || reduced.value) return
  running = true
  lastFrame = 0
  const tick = (ts) => {
    loopId = requestAnimationFrame(tick)
    if (ts - lastFrame < 1000 / FPS - 1) return
    lastFrame = ts
    renderFrame()
  }
  loopId = requestAnimationFrame(tick)
}

const stopLoop = () => {
  running = false
  if (loopId) cancelAnimationFrame(loopId)
  loopId = 0
}

const onIntersect = (entries) => {
  inView = entries[0]?.isIntersecting ?? false
  syncLoop()
}

/** fixed 背景永远在视口中，必须观察它对应的 Hero 内容区域。 */
const observeHero = () => {
  io?.disconnect()
  const anchor = props.anchor
  if (!anchor || !hostEl.value) return
  if (typeof IntersectionObserver !== 'undefined') {
    io = new IntersectionObserver(onIntersect)
    io.observe(anchor)
  }
  updateProgress()
}

watch(() => props.anchor, observeHero)

const updateProgress = () => {
  const host = hostEl.value
  if (!host) return
  if (reduced.value) {
    /*
     * 降级模式下 .sf 是 absolute，跟着文档走、高度只有 118vh，
     * 本来就落在 Hero 高度之内，不需要裁剪。
     */
    host.style.setProperty('--sf-y', '0vh')
    host.style.setProperty('--sf-dim', '0')
    host.style.setProperty('--sf-cut', '0px')
    host.style.setProperty('--sf-fade', '0px')
    progress = 0
    return
  }

  const anchor = props.anchor
  const vh = window.innerHeight || 1
  let p
  let heroBottom = vh
  if (anchor && anchor.getBoundingClientRect) {
    const rect = anchor.getBoundingClientRect()
    const total = Math.max(1, anchor.offsetHeight || rect.height)
    p = -rect.top / total
    heroBottom = rect.bottom
    const visible = rect.bottom > 0 && rect.top < vh
    if (visible !== inView) {
      inView = visible
      syncLoop()
    }
  } else {
    p = window.scrollY / vh
    inView = p < 1
  }
  p = Math.min(1, Math.max(0, p))
  progress = p

  let y
  let dim
  if (p <= CENTER_AT) {
    const t = easeInOutSine(p / CENTER_AT)
    y = Y_START * (1 - t)
    dim = 0
  } else {
    const t = easeInOutSine((p - CENTER_AT) / (1 - CENTER_AT))
    y = Y_END
    dim = DIM_END * t
  }

  /*
   * 只靠淡出挡不住「使用流程」区块。
   *
   * 这一层是 fixed 铺满视口的，而「使用流程」紧贴 Hero 之后、且没有背景色。
   * 淡出基准是 Hero 的高度，可 Hero 才滚到一半，流程区块就已经露出小半屏了 ——
   * 而那时正是星空最亮的时候（p = 0.5，dim = 0）。等它淡尽（p = 1），
   * 流程区块已经占满 84% 视口。实测侵入窗口约 685px 的滚动距离。
   *
   * 所以按 Hero 的底边把下面裁掉：Hero 滚出多少，星空就被裁掉多少。
   * --sf-cut 是元素自身坐标系下要裁掉的高度（元素高 118vh，且带 --sf-y 位移）。
   */
  const limit = Math.min(vh, Math.max(0, heroBottom))
  const cut = Math.max(0, (y / 100) * vh + SF_HEIGHT_VH * vh - limit)

  host.style.setProperty('--sf-y', `${y.toFixed(2)}vh`)
  host.style.setProperty('--sf-dim', dim.toFixed(4))
  host.style.setProperty('--sf-cut', `${cut.toFixed(1)}px`)
  host.style.setProperty('--sf-fade', `${Math.min(cut, SF_EDGE_FADE).toFixed(1)}px`)
}

const onScroll = () => {
  if (scrollPending) return
  scrollPending = true
  scrollId = requestAnimationFrame(() => {
    scrollPending = false
    updateProgress()
  })
}

const onResize = () => {
  if (resizeTimer) clearTimeout(resizeTimer)
  resizeTimer = setTimeout(() => {
    build()
    updateProgress()
  }, 150)
}

const onVisibility = () => {
  syncLoop()
}

const onMotionChange = async (event) => {
  reduced.value = event.matches
  syncLoop()
  // 等 is-static 的定位规则落地，再按新的坐标系计算品牌图层。
  await nextTick()
  updateProgress()
  buildBrand()
  if (!running) renderFrame()
}

const build = () => {
  const host = hostEl.value
  const canvas = canvasEl.value
  if (!host || !canvas) return

  const cssW = host.clientWidth
  const cssH = host.clientHeight
  if (!cssW || !cssH) return
  // ResizeObserver 首次通知也会触发 resize；尺寸没变就复用像素缓冲和星点。
  if (imageData && cssW === builtWidth && cssH === builtHeight) {
    buildBrand()
    return
  }

  const scale = Math.min(SCALE, MAX_OFF_W / cssW)
  ow = Math.max(1, Math.round(cssW * scale))
  oh = Math.max(1, Math.round(cssH * scale))

  canvas.width = ow
  canvas.height = oh
  ctx = canvas.getContext('2d', { alpha: true })
  if (!ctx) return
  builtWidth = cssW
  builtHeight = cssH
  ctx.imageSmoothingEnabled = false

  imageData = ctx.createImageData(ow, oh)
  intensity = new Float32Array(ow * oh)
  mask = buildMask(ow, oh)
  field = buildField(ow, oh, vignette())
  stars = makeStars(ow, oh, cssW, cssH)

  paintInk()
  renderFrame()
  buildBrand()
  ready.value = true
}

const onThemeChange = () => {
  /*
   * 切主题：换墨色（RGB 写一次）+ 重算密度场的分量（深色为 0，只有亮色有暗角）。
   * 星点不重建，所以切主题时星空不会「重新掷一次骰子」跳一下。
   * 品牌标记同理：只重跑阈值化，不重新栅格化。
   */
  paintInk()
  paintBrand()
  if (ow && oh) field = buildField(ow, oh, vignette())
  if (!running) renderFrame()
}

watch(isDark, onThemeChange)

onMounted(() => {
  motionQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)')
  reduced.value = motionQuery?.matches === true
  motionQuery?.addEventListener('change', onMotionChange)

  // 首屏文字先获得绘制机会；星空先只画一帧，持续动画交给 load 后的空闲时段。
  firstPaint = requestAnimationFrame(() => {
    staticPaint = requestAnimationFrame(() => {
      updateProgress()
      build()
      observeHero()
    })
  })

  /*
   * 品牌标记：logo 走 <img> 加载，首帧通常赶不上 —— 先把星空铺上，
   * 图到了再补画一层。加载失败就静默跳过，退化成原来的纯星空。
   */
  cancelAnimationStart = afterPageLoad(() => {
    animationReady = true
    syncLoop()
    pendingLogo = new Image()
    pendingLogo.decoding = 'async'
    pendingLogo.fetchPriority = 'low'
    pendingLogo.onload = () => {
      logoImg = pendingLogo
      buildBrand()
    }
    pendingLogo.src = LOGO_URL
  }, { delay: 1400 })

  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onResize)
  document.addEventListener('visibilitychange', onVisibility)

  if (hostEl.value && typeof ResizeObserver !== 'undefined') {
    ro = new ResizeObserver(onResize)
    ro.observe(hostEl.value)
  }

  observeHero()
})

onUnmounted(() => {
  // 已排队的观察器或可见性回调仍可能到达，不再允许它们重新启动循环。
  animationReady = false
  stopLoop()
  cancelAnimationFrame(firstPaint)
  cancelAnimationFrame(staticPaint)
  cancelAnimationStart()
  motionQuery?.removeEventListener('change', onMotionChange)
  if (pendingLogo) {
    pendingLogo.onload = null
    pendingLogo.removeAttribute('src')
  }
  if (scrollId) cancelAnimationFrame(scrollId)
  if (resizeTimer) clearTimeout(resizeTimer)
  ro?.disconnect()
  ro = null
  io?.disconnect()
  io = null
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('resize', onResize)
  document.removeEventListener('visibilitychange', onVisibility)
})
</script>

<template>
  <div
    ref="hostEl"
    class="sf"
    :class="{ 'is-ready': ready, 'is-static': reduced }"
    aria-hidden="true"
  >
    <canvas ref="brandEl" class="sf__brand" />
    <canvas ref="canvasEl" class="sf__canvas" />
    <!-- 切口的软边（为什么不是 mask：见 .sf 与 .sf__fade 的注释） -->
    <span class="sf__fade" />
  </div>
</template>

<style scoped>
.sf {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1;
  width: 100%;
  height: 118vh;
  overflow: hidden;
  opacity: 0;
  pointer-events: none;
  /*
   * 只做位移，不做缩放。
   * 退场幕布（原来那层用页面底色盖住星点的 .sf__veil）已经去掉：它和页面底色等色，
   * 从来没改过页面的明暗，唯一作用是盖星点 —— 而这只用一个「淡到全透明」就够了，
   * 少一层「背景色」也少一份误会。
   */
  transform: translate3d(0, var(--sf-y, -18vh), 0);
  transition: opacity 600ms ease;
  will-change: transform, opacity;
  /*
   * Hero 底边以下裁掉。--sf-cut 由 JS 按 Hero 的位置算出来（见 updateProgress），
   * 因为只靠淡出挡不住「使用流程」：Hero 才滚到一半，那一块就已经露出小半屏了，
   * 而那时正是星空最亮的时候。
   *
   * 本来该用 mask：一处就能同时表达硬边界和渐变收尾。但实测 mask 在无头软件
   * 渲染下完全不生效，等于这条路径没法验证 —— 验证不了的效果不留。
   * 所以拆成「clip-path 管硬边界 + .sf__fade 那层底色渐变管软边」。
   */
  clip-path: inset(0 0 var(--sf-cut, 0px) 0);
}

.sf.is-ready {
  opacity: 1;
}

/*
 * 降低动效偏好：不做闪烁、也不做滚动位移，
 * 改成随文档滚走的一层静态星空（fixed 会一直盖在整页上，不能用）。
 */
.sf.is-static {
  position: absolute;
  transform: none;
}

.sf__canvas {
  display: block;
  width: 100%;
  height: 100%;
  /* 低分辨率画布放大：保住 1-bit 网点的硬边，不要被插值糊掉 */
  image-rendering: pixelated;
  /* 退场就是「原地淡出」：位置不动，这一层直接淡到全透明 */
  opacity: calc(1 - var(--sf-dim, 0));
}

/*
 * 品牌标记：另起一张画布，压在星点之下（DOM 在前 = 画在底层）。
 *
 * 为什么不是画进星空那张画布：星空是 16px 一格，logo 并进去只剩一圈可见轮廓。
 * 这里是 3.6px 一格，细四倍多，形状才成立。详见组件顶部注释。
 *
 * 尺寸与落点都由 JS 写在行内样式上（--sf-brand-x / -y / width / height），
 * 因为画布的分辨率是照着它们算的 —— 两处各写一份必然会错位。
 * 左半出血到屏外，由 .sf 的 overflow: hidden 裁掉。
 *
 * 它和星点共用 --sf-dim：退场时一起淡出，不会有一块水印单独留在屏幕上。
 */
.sf__brand {
  position: absolute;
  left: var(--sf-brand-x, 0px);
  top: var(--sf-brand-y, 0px);
  /* 同 .sf__canvas：细网点放大后必须是硬的，否则细小网点先被插值糊掉 */
  image-rendering: pixelated;
  opacity: calc(1 - var(--sf-dim, 0));
}

/*
 * 切口的软边：用页面底色盖一段，星点在切口前先淡下去，不至于「齐刷刷消失」。
 *
 * 它盖在 clip-path 那条硬边界之前；高度取
 * --sf-fade = min(cut, SF_EDGE_FADE)，切口为 0 时高度也是 0 —— 首屏根本看不到这一层。
 *
 * 底边特意再往下探 2px（calc(cut - 2px)）：渐变的底边和 clip 的边界各自由
 * 浏览器取整，实测会差出约 1px，于是紧贴切口的那一行星点既没被裁掉也没被盖住，
 * 等于在渐变末尾又留了一行硬边 —— 正是这一层要消掉的东西。多铺的 2px 会被
 * clip 裁掉，没有副作用。
 *
 * 底色必须和切口后面的东西同色，否则渐变本身会变成一条看得见的色带。
 * Hero 区块自身没有背景（.lp-hero 是透明的，见 HomePage.vue），透出来的就是
 * --vp-c-bg；这也正是 .lp-hero__glow 的取色方式。写死白色的话深色下会亮一条。
 *
 * 起点用 transparent 而不是某个半透明色：CSS 渐变按预乘 alpha 插值，
 * transparent 会被当作「同色、alpha 0」处理，中间不会掺出灰。
 * 这里的渐变只覆盖 Hero 自身的范围（band 底边 = min(vh, heroBottom)），
 * 可见部分永远压不到下面的「使用流程」区块。
 */
.sf__fade {
  position: absolute;
  left: 0;
  right: 0;
  bottom: calc(var(--sf-cut, 0px) - 2px);
  height: var(--sf-fade, 0px);
  background: linear-gradient(to bottom, transparent, var(--vp-c-bg, #ffffff));
}

@media (prefers-reduced-motion: reduce) {
  .sf {
    transition: none;
  }
}
</style>
