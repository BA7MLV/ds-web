/**
 * 字符画（ASCII art）图元库。
 *
 * 与 `lib/dither.mjs` 共用同一套思路：先把画面还原成一张 0–1 的灰度场
 * （形状仍是解析几何：圆角矩形 / 圆 / 环 / 椭圆弧 / 胶囊），最后再落到画布上。
 * 两处不同：
 *
 * 1. **量化不是阈值化**。dither 拿 Bayer 8×8 把灰度劈成「点亮 / 不点亮」两档，
 *    靠网点的疏密表达灰；这里把每个格子的墨量量化成 8 档，每档挑一个字符画上去
 *    （`.` `:` `-` `=` `+` `*` `#` `@`），**字符本身就是像素**。
 *    所以没有抖动矩阵 —— 梯度是「换字符」，不是「换点距」。
 * 2. **格子是字符格，不是网点**。字符要认得出来，格高就得在一个字号的量级上；
 *    这里取 6 × 11 CSS px（等宽字体的推进宽 × 行高）。代价是格子比原来的 2px
 *    网点粗 5 倍，画面分辨率随之掉下来 —— 这是字符画必然的代价，见设计文档。
 *
 * 为什么每个字符都写死成矢量笔画、不用 <text>：
 * 这两张图是被 <img> 引用的独立 SVG 文档，`<text>` 的字体由浏览器的系统字体栈解析，
 * macOS 的 Menlo、Windows 的 Consolas 度量都不一样，字体缺失时还会退回别的等宽体 ——
 * 同一份文件在不同机器上画出来的不是同一张图。字符集只有 8 个、格尺寸固定，
 * 笔画写死最省事，而且到处都一样。
 *
 * 这份模块**不 import `lib/dither.mjs`**：它只吃形状对象上的 `bbox` 与 `hit`
 * （形状由调用方从 dither 那边造好），本身不需要那边的任何函数。
 * 两个模块是一层「谁也用不着谁」的关系 —— 共用的是形状的**约定**，不是代码。
 */

/* ── 字符格 ──
 * CELL_W / CELL_H 是这套图案唯一的主控旋钮，两个一起定「一个字多大」。
 * 6 × 11 约等于 11px 等宽字体的推进宽与行高；再小字形开始糊成墨点，
 * 再大字符之间拉开距离、画面就散了。
 */
export const CELL_W = 6
export const CELL_H = 11

/** 笔画粗细（CSS px）。1.27 在 DPR 2 的屏上是 2.5 个物理像素，细而不虚 */
export const STROKE = 1.27

/**
 * 墨量梯度，由浅到深。
 *
 * 挑字形只按一件事：**落在格子里的一笔有多长**（笔宽固定 1.27）。
 * 按覆盖面积排下来大约是 0.2% / 0.8% / 8% / 15% / 22% / 35% / 44% / 56% 个格面积，
 * 八档之间大致等步 —— 换成别的字符也行，但这八笔的疏密是量过的。
 */
export const RAMP = ['.', ':', '-', '=', '+', '*', '#', '@']

/**
 * 字形表。坐标是**格内归一化坐标**（0–1，y 向下），笔画自己按 CELL_W / CELL_H 折算成 px，
 * 所以同一份字形换格子尺寸也不会变形。
 *
 * 横竖两笔都收在 0.14–0.86 之间：上下留出的那点空隙就是「一行字一行字」的感觉，
 * 占满整格会连成一块实心，读起来只剩纹理。
 */
const GLYPHS = {
  '.': [{ k: 'dot', x: 0.5, y: 0.8 }],
  ':': [
    { k: 'dot', x: 0.5, y: 0.5 },
    { k: 'dot', x: 0.5, y: 0.8 },
  ],
  '-': [{ k: 'h', y: 0.5, x0: 0.16, x1: 0.84 }],
  '=': [
    { k: 'h', y: 0.36, x0: 0.16, x1: 0.84 },
    { k: 'h', y: 0.64, x0: 0.16, x1: 0.84 },
  ],
  '+': [
    { k: 'h', y: 0.5, x0: 0.14, x1: 0.86 },
    { k: 'v', x: 0.5, y0: 0.16, y1: 0.84 },
  ],
  '*': [
    { k: 'v', x: 0.5, y0: 0.16, y1: 0.84 },
    { k: 's', x0: 0.17, y0: 0.3, x1: 0.83, y1: 0.7 },
    { k: 's', x0: 0.17, y0: 0.7, x1: 0.83, y1: 0.3 },
  ],
  '#': [
    { k: 'v', x: 0.35, y0: 0.16, y1: 0.84 },
    { k: 'v', x: 0.65, y0: 0.16, y1: 0.84 },
    { k: 'h', y: 0.36, x0: 0.14, x1: 0.86 },
    { k: 'h', y: 0.64, x0: 0.14, x1: 0.86 },
  ],
  '@': [
    { k: 'ring', r: 0.36 },
    { k: 'dot', x: 0.5, y: 0.5 },
  ],
}

/* ── 画布 ──
 * 尺寸按**格数**给，不按 px 给（dither 那边反过来，因为 1px 就是 1px）。
 * 字符画的格尺寸是固定的、画幅由格数决定，反着写更贴近「一张 46 列 × 16 行」
 * 这种描述方式。
 */
export const asciiCanvas = (cols, rows) => ({
  gw: cols,
  gh: rows,
  w: cols * CELL_W,
  h: rows * CELL_H,
  cov: new Float32Array(cols * rows),
  tone: new Float32Array(cols * rows),
})

/**
 * 把一个形状「画」进画布，**覆盖率与墨量分开记**。
 *
 * dither 那边 `paint` 是把两者混成一个灰度值（`field = field*(1-cov) + tone*cov`），
 * 混完再阈值化是对的 —— 灰本身就同时表达了「多黑」和「占了多少」。
 * 字符画不行：混完再量化，形状的**边缘格**因为覆盖率只有一半，墨量也被打折一半，
 * 于是边上一圈比内部更浅，形状读起来是「亮边」而不是「实心形状的边界」。
 *
 * 所以这里分开：`cov` 决定这个格够不够格画字，`tone` 决定画哪一档。
 * 两者在 `bakeAscii` 里再按「覆盖率补足墨量」的方式合起来（见那里的注释）。
 *
 * `tone` 取 max 而不是覆盖写入：同一格上后画的形状（比如气泡上的问号）
 * 只该把它调深，不该被先画的浅色底子拉回来。
 */
export const paintInk = (cv, s, tone, SS = 4) => {
  const { gw, gh } = cv
  const [bx0, by0, bx1, by1] = s.bbox
  const gx0 = Math.max(0, Math.floor(bx0 / CELL_W))
  const gx1 = Math.min(gw - 1, Math.ceil(bx1 / CELL_W))
  const gy0 = Math.max(0, Math.floor(by0 / CELL_H))
  const gy1 = Math.min(gh - 1, Math.ceil(by1 / CELL_H))
  const stepX = CELL_W / SS
  const stepY = CELL_H / SS
  const total = SS * SS
  for (let gy = gy0; gy <= gy1; gy += 1) {
    for (let gx = gx0; gx <= gx1; gx += 1) {
      let hits = 0
      const ox = gx * CELL_W
      const oy = gy * CELL_H
      for (let sy = 0; sy < SS; sy += 1) {
        for (let sx = 0; sx < SS; sx += 1) {
          if (s.hit(ox + stepX * (sx + 0.5), oy + stepY * (sy + 0.5))) hits += 1
        }
      }
      if (!hits) continue
      const i = gy * gw + gx
      const cov = hits / total
      if (cov > cv.cov[i]) cv.cov[i] = cov
      const t = typeof tone === 'function' ? tone(ox + CELL_W / 2, oy + CELL_H / 2) : tone
      if (t > cv.tone[i]) cv.tone[i] = t
    }
  }
}

/** 覆盖率补足的拐点。低于它按比例减弱，高于它就当整格都在形状里 */
const COV_KNEE = 0.55
/**
 * 一格要被算进形状，至少得占这么多。
 *
 * 门槛比 dither 那边高得多（那边是 0.05）：dither 里「擦到一点」的格子点亮一个
 * 网点、正好当抗锯齿用；字符画里同一格会被画成**一个完整的字**，哪怕是 `:` 也
 * 有实体。所以笔画末端那个圆帽压到下一行的一角（覆盖率 0.08 上下）会凭空多出
 * 一排浅字 —— 问号的竖与点之间本该空着，那里却冒出一排 `::`，看着像噪点。
 * 0.15 把这些「只擦到一点」的格子收干净，同时不影响任何一笔主体（最细的笔画
 * 覆盖率也在 0.6 以上）。
 */
const COV_MIN = 0.15
/** 墨量低到这个值以下就不画字 —— 溶解的尾巴、形状外的零头都从这儿收干净 */
const FLOOR = 0.1

/**
 * 一个格子该画哪一档：返回 0–7，或 -1 表示留白。
 *
 * 三步：
 * 1. `tone`（这个格该多黑）乘上边缘溶解的 `ramp`；
 * 2. 乘一个**覆盖率补足**系数 —— 细笔画（问号那一竖、对勾那两笔）和形状边缘
 *    天然只占格子的一部分，不补的话它们会比周围淡一大截，笔画就断了；
 * 3. 量化成 8 档。
 *
 * 溶解做在**档位上**而不是做在「画不画」上：图案由密到疏自己化掉，
 * 而不是齐刷刷地在一个地方断掉 —— 这是这套图案在卡面上「长出来」的那一下。
 */
export const levelAt = (cv, i, u, v, ramp) => {
  const cov = cv.cov[i]
  if (cov < COV_MIN) return -1
  const t = cv.tone[i]
  if (t <= 0) return -1
  const e = t * ramp(u, v) * Math.min(1, cov / COV_KNEE)
  if (e < FLOOR) return -1
  return Math.min(RAMP.length - 1, Math.floor(e * RAMP.length))
}

const round2 = (n) => Math.round(n * 100) / 100

/**
 * 一个字形的包围盒（**不含笔宽**），相对格子左上角，单位 px。
 *
 * 字形只有八个、格子尺寸恒定，所以每个只算一次。
 * 这是给 `bakeAscii` 量墨迹范围用的：事后去解析路径数据也能算，
 * 但 `d` 里混着相对指令（`h` / `v` / `a`），解析出来的边界容易差一两个单位；
 * 从字形表直接推则不会有歧义。
 *
 * 环走椭圆的两个极值点（`a` 指令画的整椭圆，外接盒就是 (cx±rx, cy±ry)）；
 * 点是一段长 0.02 的零头，几何盒退化成一个点 —— 它在最终裁 viewBox 时
 * 靠「四边各外扩半个笔宽」补成一整个圆点。
 */
const GLYPH_BOX = new Map()
const glyphBox = (ch) => {
  const cached = GLYPH_BOX.get(ch)
  if (cached) return cached
  let x0 = Infinity
  let y0 = Infinity
  let x1 = -Infinity
  let y1 = -Infinity
  const add = (px, py) => {
    if (px < x0) x0 = px
    if (py < y0) y0 = py
    if (px > x1) x1 = px
    if (py > y1) y1 = py
  }
  for (const g of GLYPHS[ch]) {
    if (g.k === 'h') {
      add(g.x0 * CELL_W, g.y * CELL_H)
      add(g.x1 * CELL_W, g.y * CELL_H)
    } else if (g.k === 'v') {
      add(g.x * CELL_W, g.y0 * CELL_H)
      add(g.x * CELL_W, g.y1 * CELL_H)
    } else if (g.k === 's') {
      add(g.x0 * CELL_W, g.y0 * CELL_H)
      add(g.x1 * CELL_W, g.y1 * CELL_H)
    } else if (g.k === 'ring') {
      add(0.5 * CELL_W - g.r * CELL_W, 0.5 * CELL_H - g.r * CELL_H)
      add(0.5 * CELL_W + g.r * CELL_W, 0.5 * CELL_H + g.r * CELL_H)
    } else {
      add(g.x * CELL_W, g.y * CELL_H)
    }
  }
  const box = { x0, y0, x1, y1 }
  GLYPH_BOX.set(ch, box)
  return box
}

/** 把一个字形翻译成 SVG 子路径。坐标落在 (x, y) 这个格子左上角 */
const glyphSubpaths = (ch, x, y) => {
  const px = (u) => round2(x + u * CELL_W)
  const py = (v) => round2(y + v * CELL_H)
  return GLYPHS[ch].map((g) => {
    if (g.k === 'h') return `M${px(g.x0)} ${py(g.y)}h${round2((g.x1 - g.x0) * CELL_W)}`
    if (g.k === 'v') return `M${px(g.x)} ${py(g.y0)}v${round2((g.y1 - g.y0) * CELL_H)}`
    if (g.k === 's') return `M${px(g.x0)} ${py(g.y0)}L${px(g.x1)} ${py(g.y1)}`
    if (g.k === 'ring') {
      // 整椭圆拆两段 180° 弧：rx / ry 各自按格宽格高折算，才是贴在字符格里的那个椭圆
      const rx = round2(g.r * CELL_W)
      const ry = round2(g.r * CELL_H)
      const cx = px(0.5)
      const cy = py(0.5)
      return (
        `M${round2(cx - rx)} ${cy}a${rx} ${ry} 0 1 0 ${round2(rx * 2)} 0` +
        `a${rx} ${ry} 0 1 0 ${round2(-rx * 2)} 0`
      )
    }
    // 点：零长度子路径配 round 线帽，规格里就是一个直径 = 笔宽的圆点。
    // 给 0.02 而不是 0 是为了绕开个别渲染器对零长度子路径的处理差异，
    // 长短上肉眼分不出来。
    return `M${px(g.x)} ${py(g.y)}h0.02`
  })
}

/**
 * 量化整张画布，按档位归拢，顺便量出**墨迹的包围盒**。
 *
 * 每档汇成**一条 `<path>`**：八个字形各自是一组固定的相对笔画，
 * 同档的所有实例只是平移，拼进同一个 `d` 就够了 ——
 * 逐格吐元素是几千个节点，八条路径省下来的不只是体积，还有渲染时的节点数。
 *
 * 墨迹包围盒是给 `wrapAscii` 裁 `viewBox` 用的（见那里）。
 * 只对**真的画了字**的格子求并集，字形自身的尺寸查 `glyphBox` 的表 ——
 * 比事后去解析路径数据可靠，也不受 `d` 里那些相对指令的影响。
 */
export const bakeAscii = (cv, ramp) => {
  const groups = RAMP.map(() => [])
  const counts = RAMP.map(() => 0)
  const ink = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity }
  for (let gy = 0; gy < cv.gh; gy += 1) {
    for (let gx = 0; gx < cv.gw; gx += 1) {
      const i = gy * cv.gw + gx
      const lv = levelAt(cv, i, gx / cv.gw, gy / cv.gh, ramp)
      if (lv < 0) continue
      const ch = RAMP[lv]
      groups[lv].push(...glyphSubpaths(ch, gx * CELL_W, gy * CELL_H))
      counts[lv] += 1
      const box = glyphBox(ch)
      const ox = gx * CELL_W
      const oy = gy * CELL_H
      if (ox + box.x0 < ink.x0) ink.x0 = ox + box.x0
      if (oy + box.y0 < ink.y0) ink.y0 = oy + box.y0
      if (ox + box.x1 > ink.x1) ink.x1 = ox + box.x1
      if (oy + box.y1 > ink.y1) ink.y1 = oy + box.y1
    }
  }
  return { groups, counts, ink }
}

/**
 * 裁 `viewBox` 用的留白，单位是用户单位（≈ 2 个字符列 / 1 个字符行）。
 *
 * 取**四边等宽**：图片的边界不再是「作者画稿时用的那张网格」，而是
 * 「墨迹 + 一圈等宽留白」。这样打开这份 SVG 时图案天然落在正中 ——
 * 之前 viewBox 就是那张网格，气泡下边只剩 1.8 个单位、上边却有 12.8，
 * 单看这张图会以为底下被切了。
 */
const MARGIN = 12

/**
 * 包成一份 SVG。
 *
 * **`viewBox` 由墨迹决定，四边各留 `MARGIN`**（四条边各自取整，所以留白最多差 0.5）。
 * 画布的网格只服务于「怎么把字摆上去」，不再兼任图片的边框。
 *
 * **`width` / `height` 照 viewBox 给**：这份文件也会被人直接打开看，
 * 没有固有尺寸的话各家的查看器只能自己猜（猜成 300×150 的有、猜成铺满窗口的有），
 * 猜出来的长宽比与 viewBox 不一致时图案就被摆歪了。给了尺寸，它就是一张正常的图片。
 * 组件里是内联使用，那两处 CSS 会把宽高整个接管过去，属性值不影响页面。
 *
 * `preserveAspectRatio` 写出来是**声明意图**：默认值就是 xMidYMid meet，
 * 但「装不下时按比例缩到装得下、居中」这件事对这份图是硬要求，写明白不吃亏。
 *
 * **墨色不写死**：`stroke="currentColor"`，颜色由页面给。这份文件是被组件
 * `?raw` 引进来、内联进 DOM 的（不再是 `<img src>`），所以 `currentColor`
 * 解析在**宿主文档**里 —— 深色模式直接继承主题色，不需要 `filter: invert(1)`
 * 把近黑反成一片 #e2e2e0，也就没有「反相出来的灰」和站点正文色对不上这回事。
 *
 * `fill="none"`：八个字形全是笔画，没有一个靠填充。`stroke-linecap: round`
 * 兼作圆点、也把折线的拐角磨圆 —— 与 dither 那边胶囊笔的观感是同一条。
 *
 * **八个档位固定各出一条 `<path>`，哪怕这一档一个字符都没有**（空的 `d=""`）。
 * 于是「第 n 条路径 = 第 n 档」永远成立，读这份文件的人（比如把字符网格
 * dump 成文本去校对的脚本）可以直接按序号取档，不必靠「出现顺序」去猜 ——
 * 上面已经因为跳空档位踩过一次，白白多看了两轮错图。
 * 代价是每份多一百来字节，在十几 kB 的产物里看不出来。
 */
export const wrapAscii = (cv, groups, ink) => {
  // 可见墨迹 = 几何包围盒四边各外扩半个笔宽（笔画是圆头的，端点会探出去）
  const x0 = ink.x0 - STROKE / 2
  const y0 = ink.y0 - STROKE / 2
  const x1 = ink.x1 + STROKE / 2
  const y1 = ink.y1 + STROKE / 2
  const vx = Math.round(x0 - MARGIN)
  const vy = Math.round(y0 - MARGIN)
  const vw = Math.round(x1 + MARGIN) - vx
  const vh = Math.round(y1 + MARGIN) - vy
  const paths = groups.map((list) => `<path d="${list.join('')}"/>`).join('')
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${vw}" height="${vh}" ` +
    `viewBox="${vx} ${vy} ${vw} ${vh}" preserveAspectRatio="xMidYMid meet" ` +
    `role="presentation" focusable="false">` +
    `<g fill="none" stroke="currentColor" stroke-width="${STROKE}" ` +
    `stroke-linecap="round" stroke-linejoin="round">${paths}</g></svg>`
  )
}

/** 打一行「各档各多少个字符」，生成器收尾用 —— 梯度有没有真的用起来一眼能看出来 */
export const describeLevels = (counts) =>
  RAMP.map((ch, i) => `${ch}:${counts[i]}`).join('  ') + `  共 ${counts.reduce((a, b) => a + b, 0)}`

