/**
 * 有序抖动（ordered dithering）图元库。
 *
 * 口径与首页 hero 的星空层一致 —— 先把画面还原成一张 0–1 的灰度场，
 * 再用 Bayer 8×8 阈值化成 1-bit 网点。区别只有一处：这里**不逐帧**。
 * 画面是静态的，直接烘焙成 SVG 落盘，首页就不必为几张装饰图多背一个
 * canvas 与一套渲染循环（hero 那套是因为要跟着滚动跑，这里没有这个必要）。
 *
 * 为什么灰度场要自己画、不拿位图去抖动：
 * 图案要小、要能认出形状，边就得落在网点上。位图缩放后的边会被重采样
 * 糊成一条灰线，阈值化出来是一串忽断忽续的碎点。这里的每个形状都是解析几何
 * （圆角矩形 / 胶囊 / 多边形 / 圆 / 环 / 椭圆弧），按格超采样求覆盖率，边是干净的。
 *
 * 坐标系：**形状一律写 CSS px**，只有采样那一刻才折算成格（CELL）。
 * 画布尺寸 = 这张图在页面里的实际显示宽度，所以 1px 就是 1px，网点不会被二次缩放。
 *
 * 消费者（各自只管构图与写盘）：
 *   scripts/gen-flow-dither.mjs      「使用流程」两张卡：280×176 / 544×340
 *   scripts/gen-features-dither.mjs  功能区四扇窗口屏：452×282
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/* ── 网屏 ──
 * CELL 是「一个网点多少 CSS px」，是这套图案唯一的主控旋钮。
 * 取 2：在 DPR 2 的屏上正好落在 4 个物理像素上，网点是硬边的，不会糊成灰。
 * 再小就看不见点了，再大就从「网点」变成「马赛克」——hero 的细网屏也是 2–8px 这一档。
 */
export const CELL = 2

const BAYER8 = [
  0, 32, 8, 40, 2, 34, 10, 42,
  48, 16, 56, 24, 50, 18, 58, 26,
  12, 44, 4, 36, 14, 46, 6, 38,
  60, 28, 52, 20, 62, 30, 54, 22,
  3, 35, 11, 43, 1, 33, 9, 41,
  51, 19, 59, 27, 49, 17, 57, 25,
  15, 47, 7, 39, 13, 45, 5, 37,
  63, 31, 55, 23, 61, 29, 53, 21,
]
/** 阈值取 (b + 0.5) / 64：灰度 1.0 恒大于任何阈值（整块实心），灰度 0 恒不点亮 */
const THR = new Float32Array(64)
for (let i = 0; i < 64; i += 1) THR[i] = (BAYER8[i] + 0.5) / 64

export const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v)
export const smoothstep = (a, b, x) => {
  const t = clamp01((x - a) / (b - a))
  return t * t * (3 - 2 * t)
}

/* ── 形状：包围盒 + 命中测试，坐标都是 CSS px ──
 * 只给包围盒是为了别对整张画布逐形状扫描：图案里最贵的几个形状
 * （旋转的卡片、胶囊）铺满画面，少了这层裁剪就是白白多算十几倍。
 */
const shape = (bbox, hit) => ({ bbox, hit })

/** 圆角矩形。走 SDF：四个角的圆用「到圆心的距离」判，直边用 max(qx,qy) */
export const rrect = (x, y, w, h, r = 0) => {
  const rr = Math.min(r, w / 2, h / 2)
  const cx = x + w / 2
  const cy = y + h / 2
  return shape([x, y, x + w, y + h], (px, py) => {
    const qx = Math.abs(px - cx) - (w / 2 - rr)
    const qy = Math.abs(py - cy) - (h / 2 - rr)
    const dx = Math.max(qx, 0)
    const dy = Math.max(qy, 0)
    const d = Math.min(Math.max(qx, qy), 0) + Math.hypot(dx, dy)
    return d <= rr ? 1 : 0
  })
}

export const circle = (cx, cy, r) =>
  shape([cx - r, cy - r, cx + r, cy + r], (px, py) =>
    (px - cx) * (px - cx) + (py - cy) * (py - cy) <= r * r ? 1 : 0
  )

/** 任意多边形。气泡尾巴和循环箭头都用它，避免为了两个小尖角引入 SVG 原语。 */
export const polygon = (points) => {
  const xs = points.map(([x]) => x)
  const ys = points.map(([, y]) => y)
  return shape(
    [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)],
    (px, py) => {
      let inside = false
      for (let i = 0, j = points.length - 1; i < points.length; j = i, i += 1) {
        const [xi, yi] = points[i]
        const [xj, yj] = points[j]
        const crosses = yi > py !== yj > py
        const edgeX = ((xj - xi) * (py - yi)) / (yj - yi || 1) + xi
        if (crosses && px < edgeX) inside = !inside
      }
      return inside ? 1 : 0
    }
  )
}

/** 胶囊（带圆头的线段）：引线、对勾的两笔、星芒都用它 */
export const seg = (x1, y1, x2, y2, thick) => {
  const r = thick / 2
  const dx = x2 - x1
  const dy = y2 - y1
  const len2 = dx * dx + dy * dy || 1
  return shape(
    [Math.min(x1, x2) - r, Math.min(y1, y2) - r, Math.max(x1, x2) + r, Math.max(y1, y2) + r],
    (px, py) => {
      const t = clamp01(((px - x1) * dx + (py - y1) * dy) / len2)
      const ex = px - (x1 + dx * t)
      const ey = py - (y1 + dy * t)
      return ex * ex + ey * ey <= r * r ? 1 : 0
    }
  )
}

/**
 * 等粗折线：一串点连成一根胶囊链，所以拐点是圆的。
 *
 * 为什么不「逐段调 seg 画上去」：相邻两段在拐点会重叠。`paint` 的混合式
 * `field = field*(1-cov) + tone*cov` 同色重叠是幂等的、不会算错，但每一段都要
 * 单独跑一遍包围盒裁剪，白白多算。这里把命中测试收在一个形状里，
 * 顺便让「曲线」这种几百个采样点的东西只付一次包围盒的钱。
 */
export const polyline = (points, thick) => {
  const r = thick / 2
  const xs = points.map(([x]) => x)
  const ys = points.map(([, y]) => y)
  const parts = []
  for (let i = 1; i < points.length; i += 1) {
    const [x1, y1] = points[i - 1]
    const [x2, y2] = points[i]
    const dx = x2 - x1
    const dy = y2 - y1
    parts.push([x1, y1, dx, dy, dx * dx + dy * dy || 1])
  }
  return shape(
    [Math.min(...xs) - r, Math.min(...ys) - r, Math.max(...xs) + r, Math.max(...ys) + r],
    (px, py) => {
      for (let i = 0; i < parts.length; i += 1) {
        const [x1, y1, dx, dy, len2] = parts[i]
        const t = clamp01(((px - x1) * dx + (py - y1) * dy) / len2)
        const ex = px - (x1 + dx * t)
        const ey = py - (y1 + dy * t)
        if (ex * ex + ey * ey <= r * r) return 1
      }
      return 0
    }
  )
}

/* ── 科幻语汇：环、轨道、弧 ── */

/** 圆环。恒星周围那两圈光环用它 */
export const ring = (cx, cy, r, thick) => {
  const ri = r - thick / 2
  const ro = r + thick / 2
  return shape([cx - ro, cy - ro, cx + ro, cy + ro], (px, py) => {
    const d2 = (px - cx) * (px - cx) + (py - cy) * (py - cy)
    return d2 >= ri * ri && d2 <= ro * ro ? 1 : 0
  })
}

/**
 * 椭圆弧：轨道线 / 行星环。deg 是整条轨道的倾角，fromDeg→toDeg 是**椭圆自身坐标系**里的张角
 * （0° 指向长轴正向，顺时针为正）—— 环要靠它拆成「球后面那半个」与「球前面那半个」，
 * 拆不开就只能整圈一起画，压在球上会读成一道缺口，而不是环绕。
 *
 * 距离用「归一化到单位圆再乘回短半轴」近似 —— 轨道线只有两三 px 宽，
 * 精确解（椭圆积分）换不来任何看得见的差别。
 */
export const ellipseArc = (cx, cy, rx, ry, thick, deg, fromDeg, toDeg) => {
  const a = (deg * Math.PI) / 180
  const cos = Math.cos(a)
  const sin = Math.sin(a)
  const reach = Math.max(rx, ry) + thick
  const k = Math.min(rx, ry)
  const a0 = (fromDeg * Math.PI) / 180
  const a1 = (toDeg * Math.PI) / 180
  return shape([cx - reach, cy - reach, cx + reach, cy + reach], (px, py) => {
    const ux = px - cx
    const uy = py - cy
    const x = ux * cos + uy * sin
    const y = -ux * sin + uy * cos
    const d = (Math.hypot(x / rx, y / ry) - 1) * k
    if (Math.abs(d) > thick / 2) return 0
    let ang = Math.atan2(y / ry, x / rx)
    while (ang < a0) ang += Math.PI * 2
    return ang <= a1 ? 1 : 0
  })
}

/** 圆弧：信号波纹、轨道弧、循环箭头。fromDeg → toDeg，0° 指向 +x，顺时针为正（屏幕坐标） */
export const arcRing = (cx, cy, r, thick, fromDeg, toDeg) => {
  const ri = r - thick / 2
  const ro = r + thick / 2
  const a0 = (fromDeg * Math.PI) / 180
  const a1 = (toDeg * Math.PI) / 180
  return shape([cx - ro, cy - ro, cx + ro, cy + ro], (px, py) => {
    const dx = px - cx
    const dy = py - cy
    const d = Math.hypot(dx, dy)
    if (d < ri || d > ro) return 0
    let a = Math.atan2(dy, dx)
    while (a < a0) a += Math.PI * 2
    return a <= a1 ? 1 : 0
  })
}

/**
 * 把一个形状「画」进灰度场。
 * 格心采样会漏掉细过一格的边（引线、对勾那几笔都只有一两格宽），
 * 所以每格打 SS×SS 个点求覆盖率 —— 覆盖率同时也就是抗锯齿，
 * 阈值化之后边是「点由密到疏」的自然收口，不是锯齿。
 */
export const paint = (field, s, gray, cv, SS = 4) => {
  const { gw, gh } = cv
  const [bx0, by0, bx1, by1] = s.bbox
  const gx0 = Math.max(0, Math.floor(bx0 / CELL))
  const gx1 = Math.min(gw - 1, Math.ceil(bx1 / CELL))
  const gy0 = Math.max(0, Math.floor(by0 / CELL))
  const gy1 = Math.min(gh - 1, Math.ceil(by1 / CELL))
  const step = CELL / SS
  const off = step / 2
  const total = SS * SS
  for (let gy = gy0; gy <= gy1; gy += 1) {
    for (let gx = gx0; gx <= gx1; gx += 1) {
      let hits = 0
      const ox = gx * CELL
      const oy = gy * CELL
      for (let sy = 0; sy < SS; sy += 1) {
        for (let sx = 0; sx < SS; sx += 1) {
          if (s.hit(ox + off + sx * step, oy + off + sy * step)) hits += 1
        }
      }
      if (!hits) continue
      const cov = hits / total
      const i = gy * gw + gx
      const tone = typeof gray === 'function' ? gray(ox + CELL / 2, oy + CELL / 2) : gray
      field[i] = field[i] * (1 - cov) + clamp01(tone) * cov
    }
  }
}

/**
 * 边缘溶解：给一个「缓坡宽度」的工厂，按边给，单位是**该边长的比例**。
 *
 * 只在指定的那几条边拉缓坡，其余边留硬边。用哪几条边由图案在页面里的处境决定：
 * - 「使用流程」两张只化左边与顶边（`{ left: 0.1, top: 0.11 }`）—— 它们定位在
 *   right:-6% / bottom:-8%，右边和底边本来就落在卡片外被切掉，那儿留硬边才对；
 *   左上两边的缓坡是给文字让路，网点由密到疏自己化掉，图案才像从卡面里长出来。
 * - 功能区四张四边都化 —— 硬边界交给窗口壳，图案在屏里「浮」着。
 *
 * 缓坡宽度按比例给是因为两张画布的尺寸差着量级：
 * 0.066 × 452 与 0.106 × 282 都约等于 30px，四边化掉的范围一样宽。
 */
export const rampEdges = ({ left = 0, right = 0, top = 0, bottom = 0 }) => {
  const hasL = left > 0
  const hasR = right > 0
  const hasT = top > 0
  const hasB = bottom > 0
  return (u, v) => {
    let k = 1
    if (hasL) k *= smoothstep(0, left, u)
    if (hasR) k *= smoothstep(0, right, 1 - u)
    if (hasT) k *= smoothstep(0, top, v)
    if (hasB) k *= smoothstep(0, bottom, 1 - v)
    return k
  }
}

/**
 * 阈值化 + 横向游程编码 + 纵向归并。
 *
 * 逐点吐 <rect> 是几万个元素；游程合并之后一行连续的实心区就是一条矩形，
 * 再叠一层「与上一行同起止」的纵向归并 —— Bayer 是 8×8 周期的，均匀灰度区
 * 天然会以 8 行为步长重复，这一层能把大块区域压成很少的几条。
 */
export const bake = (field, cv, ramp) => {
  const { gw, gh } = cv
  const on = (x, y) =>
    field[y * gw + x] * ramp((x * CELL) / (gw * CELL), (y * CELL) / (gh * CELL)) >
    THR[((y & 7) << 3) | (x & 7)]

  const rects = []
  let open = new Map()
  for (let y = 0; y < gh; y += 1) {
    const next = new Map()
    let x = 0
    while (x < gw) {
      if (!on(x, y)) {
        x += 1
        continue
      }
      const s = x
      while (x < gw && on(x, y)) x += 1
      const key = `${s}:${x}`
      const prev = open.get(key)
      if (prev) {
        prev.h += 1
        next.set(key, prev)
      } else {
        const r = { x: s, y, w: x - s, h: 1 }
        rects.push(r)
        next.set(key, r)
      }
    }
    open = next
  }
  return rects
    .map((r) => `M${r.x * CELL} ${r.y * CELL}h${r.w * CELL}v${r.h * CELL}h${-r.w * CELL}z`)
    .join('')
}

/**
 * 包成一份自包含的 SVG。
 *
 * 墨色写在 `<svg>` 的 `style="color:…"` 上、由 `<path fill="currentColor">` 取 ——
 * 被 `<img>` 引用时 SVG 是个独立文档，`currentColor` 就在这里解析，
 * 所以一份文件走到哪儿都是同一个颜色，不需要外部 CSS 参与。
 */
export const wrap = (cv, d, ink = '#1d1d1f') =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${cv.gw * CELL}" height="${cv.gh * CELL}" ` +
  `viewBox="0 0 ${cv.gw * CELL} ${cv.gh * CELL}" style="color:${ink}">` +
  `<path fill="currentColor" d="${d}"/></svg>\n`

export const canvas = (w, h) => {
  const gw = Math.round(w / CELL)
  const gh = Math.round(h / CELL)
  return { gw, gh, w: gw * CELL, h: gh * CELL, field: new Float32Array(gw * gh) }
}

/* ── 写盘 ──
 * 两个生成器共用的收尾：算完、写盘、打一行「多大 / 几条矩形」。
 * 路径按「脚本 → 仓库根 → docs/public」推，两个生成器都在 scripts/ 下。
 */
const PUBLIC = resolve(dirname(fileURLToPath(import.meta.url)), '../../docs/public')

export const emit = (files) => {
  mkdirSync(PUBLIC, { recursive: true })
  for (const [name, svg] of files) {
    writeFileSync(resolve(PUBLIC, name), svg)
    console.log(`✓ ${name}  ${(svg.length / 1024).toFixed(1)} kB  ${(svg.match(/M/g) || []).length} 条矩形`)
  }
}
