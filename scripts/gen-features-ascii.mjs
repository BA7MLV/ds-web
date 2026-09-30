/**
 * 功能区四个场景的底图：字符画（ASCII art）生成器。
 *
 * 灰度场与形状原语在 `scripts/lib/dither.mjs`，量化与字形在 `scripts/lib/ascii.mjs`。
 * 这里只剩构图：四张各画一个符号，每个格子挑一个字符落到画布上。
 *
 * 前情：`docs/plans/2026-09-26-features-dither-design.md`（这一版取代了它的底图部分，
 * 构图与题眼沿用）、`docs/plans/2026-09-28-flow-ascii-design.md`（字符画这套的口径与全部踩坑）。
 *
 * ── 与「使用流程」那两张的同与不同 ──
 * 同：同一套字符格（6 × 11）、同一支笔法（解析几何 + 按格超采样）、同一份量化管线。
 * 不同有两处，都是这四张自己的处境决定的：
 *
 * 1. **墨色写死成浅色。** 资产按浅墨绘制；深色主题直接显示，浅色主题由消费者
 *    对 `<img>` 做 `filter: invert(1)`，变成深墨落在浅底上。这样不需要为两套主题
 *    各出一份 SVG，也不依赖无法从外部 `<img>` 继承的 `currentColor`。
 * 2. **不内联。** 那两张必须在 SSR 阶段就画进 HTML（`currentColor` 要在宿主文档里解析）；
 *    这四张不需要，于是仍然走 `docs/public` + `<img src>`：轮播一次只显示一张，
 *    另外三张该按需加载就按需加载（`HomePage.vue` 里那段预热就是为它们留的）。
 *    内联要把 ~10 kB gzip 塞进落地页 chunk，其中三张是用户可能一辈子不看的。
 *
 * ── 画布为什么是 75 × 26 格 ──
 * dither 那一版的画布是 452×282（226 × 141 格网点），照的是 1440 视口下
 * 功能区右侧展示区的实测尺寸。字符画一格里放不下一个网点那么小的东西，
 * 格宽 6px 已经是要认得出来的下限，于是右侧展示区换算过来是 75 × 26 格 = 450 × 286 px
 * —— 与 452×282 差 0.5%，展示区的比例跟着资产走（见 custom.css 里那一段）。
 *
 * ── 四张共用一个 viewBox，不裁到墨迹 ──
 * 这是这四张与「使用流程」那两张唯一的机制差别，理由在 `lib/ascii.mjs` 的 `opts.crop`：
 * 轮播里四张轮流进同一块展示区，各自裁一次的话 viewBox 比例各不相同（实测 1.69 ~ 1.99），
 * 固定展示区配上 `cover` 就变成每张各自缩放、切 tab 时图案跳大小。
 * 固定成 `0 0 450 286` 之后四张严格同尺同位，构图居中由 `bake()` 每次跑都量一遍。
 *
 * ── 没有边缘溶解 ──
 * dither 那一版四边都挂了缓坡（约 30px），名义是「硬边界交给展示区，图案在里面浮着」。
 * 字符画这边不需要，也不该要：溶解做在**档位**上，一条横跨形状的缓坡会把描边的一侧
 * 整体压低一两档 —— ① 的纸、③ 的卷子都是一整圈闭合的描边，四边同时被压、
 * 深浅各异，读起来是画错了，不是「长出来」。
 * 「浮着」这件事由固定 viewBox 与透明背景给到：墨迹之外透出卡片底色，随主题切换。
 *
 * 用法：node scripts/gen-features-ascii.mjs [--dump] [chat|mindmap|quiz|anki]
 * 产物：docs/public/feature-{chat,mindmap,quiz,anki}-ascii.svg
 */
import { ellipse, emit, hollow, rrect, shape } from './lib/dither.mjs'
import {
  asciiCanvas,
  bakeAscii,
  CELL_H,
  CELL_W,
  describeLevels,
  paintInk,
  printGrid,
  STROKE,
  wrapAscii,
} from './lib/ascii.mjs'

/** 没有边缘溶解，见文件头 */
const RAMP_ON = () => 1

/** 75 × 26 格。见文件头「画布为什么是 75 × 26 格」 */
const COLS = 75
const ROWS = 26

/**
 * 水平笔画的标准高度：**整整一行**（11px）。
 *
 * 这是字符画最硬的约束，比 dither 那边严得多。一行只有 11px：
 * 高 8px 的横线要是骑在两行的分界线上，两行各吃 4px（覆盖率 0.36），
 * 双双被 `COV_KNEE` 打折 → 得到两排浅字，横线从实线变虚线。
 * 所以横条一律「高 11、上边落在 11 的整数倍上」，吃满且只吃一行。
 */
const LINE = CELL_H

/**
 * 竖直笔画的宽度：**两列**（12px），并且**骑在列的分界线上**（中心取 6 的整数倍）。
 *
 * 一列只有 6px，比一行窄得多，11px 的笔画放不进去，两列各自吃满才够重。
 * 骑线是为了让两列各吃 6px（覆盖率 1.0，越过 `COV_KNEE`）—— 偏半格就变成
 * 「一列满、两列各吃一角」，那两角被按覆盖率打折，同一根笔画上深浅不一，看着是毛的。
 */
const VBAR = CELL_W * 2

/**
 * 把一条折线量化成**格子阶梯**。
 *
 * 这是字符画里画斜线与曲线的正解。直接画几何斜线行不通：格子是 6 × 11 的长条，
 * 一根等宽斜线穿过去，每格吃到的面积在 0.2 到 0.7 之间摆动，被 `COV_KNEE`
 * 放大成两三档的明暗差 —— 画出来是一串毛刺而不是一根线（第一版把线加粗到 20
 * 都压不平这件事）。
 *
 * 量化成格子之后覆盖率恒为 1：斜线就是「一格一格地走」，每一格画一个字符 ——
 * 这正是字符画里斜线本来的样子。相邻两格共享边界，拼起来仍然是连续的一根。
 *
 * `weight` 是这条线的粗细，单位是**格**。1 格（6px）在 452px 宽的屏上是细的
 * 一根，适合曲线这种篇幅长的东西；`weight: 2` 得到与纸的描边同量级的一根，
 * 给 ① 那根「题眼」用。
 */
const trace = (points, weight = 1) => {
  const out = []
  const seen = new Set()
  const put = (c, r) => {
    const key = r * 256 + c
    if (seen.has(key)) return
    seen.add(key)
    out.push(rrect(c * CELL_W, r * CELL_H, CELL_W * weight, CELL_H))
  }
  /* Bresenham：每一步要么横走一格、要么竖落一行，所以每一格都是「实心的」 */
  const walk = (c0, r0, c1, r1) => {
    const dc = Math.abs(c1 - c0)
    const dr = Math.abs(r1 - r0)
    const sc = c1 >= c0 ? 1 : -1
    const sr = r1 >= r0 ? 1 : -1
    let c = c0
    let r = r0
    let err = dc - dr
    for (;;) {
      put(c, r)
      if (c === c1 && r === r1) return
      const e2 = 2 * err
      if (e2 > -dr) {
        err -= dr
        c += sc
      }
      if (e2 < dc) {
        err += dc
        r += sr
      }
    }
  }
  let pc = null
  let pr = null
  for (const [x, y] of points) {
    const c = Math.floor(x / CELL_W)
    const r = Math.floor(y / CELL_H)
    if (pc === null) put(c, r)
    else walk(pc, pr, c, r)
    pc = c
    pr = r
  }
  return out
}

/**
 * 环带，按**格心采样**成整格。
 *
 * 这是「字符画里的圆环」最直接的做法：把环带 bbox 里的格子逐个量一遍，
 * 格心落在环带内就画满这一格。覆盖率恒为 1，没有浅档、没有断口。
 *
 * 为什么不是 `ring`（几何环带），也不是「几个同心圆各走一遍 `trace`」：
 * · `ring` 的环带厚度按 px 给，格子却是 6 × 11 的长条 —— 环走到 45° 时
 *   一个格子横跨环的内外两侧，覆盖率在 0.2 到 0.9 之间跳。厚 24 画出来是一圈
 *   断断续续的散点，厚 33 干脆糊成一个实心圆盘（内径只剩 34px）。
 * · 同心圆只是「1 格宽的线」，两个圆的间距在 12 点方向是 11px、在 3 点方向是 6px，
 *   补到三圈仍然在斜向露出缝（实测过）。
 *
 * 环带厚度按 px 给，转成格之后在横竖两个方向上自然不等（3.5 列 vs 2 行）——
 * 这是字符格长宽比的必然结果，跟 ① 的「框比横厚」是同一件事，看着不像瑕疵。
 */
const ringCells = (cx, cy, outer, inner) => {
  const out = []
  const gx0 = Math.floor((cx - outer) / CELL_W)
  const gx1 = Math.ceil((cx + outer) / CELL_W)
  const gy0 = Math.floor((cy - outer) / CELL_H)
  const gy1 = Math.ceil((cy + outer) / CELL_H)
  for (let gy = gy0; gy <= gy1; gy += 1) {
    for (let gx = gx0; gx <= gx1; gx += 1) {
      const dx = gx * CELL_W + CELL_W / 2 - cx
      const dy = gy * CELL_H + CELL_H / 2 - cy
      const d = Math.hypot(dx, dy)
      if (d <= outer && d >= inner) {
        out.push(rrect(gx * CELL_W, gy * CELL_H, CELL_W, CELL_H))
      }
    }
  }
  return out
}

/**
 * 整张挪若干**格**。
 *
 * 四张共用一个 `viewBox`（见文件头），于是「在框里居中」成了每张各自的责任。
 * 构图是照着 dither 那一版的绝对坐标搬过来的，搬完必然有一两张偏个十几像素 ——
 * 与其把上百个坐标挨个重算，不如搬完之后整张挪一下。
 *
 * 位移的**单位是格**（6 × 11），不是像素：字符画最硬的一条约束就是形状要压在格线上，
 * 平移半个格子会让每一格的覆盖率重新算一遍，描边边上立刻挂出一圈毛边。
 * 代价是居中只能精确到**半格**（横 3px / 纵 5.5px）—— 这是格子的必然结果，
 * `bake()` 那行「墨迹居中偏差」量出来差的就是它，超过半格才说明挪少了。
 *
 * 收的是 `[形状, 档位]` 的数组而不是单个形状：档位与形状是一一对应的，
 * 拆开再配对迟早配错。
 */
const shift = (pairs, cols = 0, rows = 0) => {
  const dx = cols * CELL_W
  const dy = rows * CELL_H
  return pairs.map(([s, tone]) => [
    shape(
      [s.bbox[0] + dx, s.bbox[1] + dy, s.bbox[2] + dx, s.bbox[3] + dy],
      (px, py) => s.hit(px - dx, py - dy)
    ),
    tone,
  ])
}

/* ── 落盘的收尾 ──
 * 与另外两个生成器同一个口径：算完、写盘、打一行「多大 / 各档多少个字符」。
 * 产物写进 `docs/public`：这四张是被 `HomePage.vue` 以 `<img src>` 引用的，
 * `currentColor` 用不上（见文件头「不内联」），也就没有内联的理由。
 */
const OUT = 'docs/public'
const DUMP = process.argv.includes('--dump')

/** 浅色主题会由 HomePage.vue 反相；深色主题直接显示。 */
const INK = '#e8e8ea'

const bake = (name, cv, shapes) => {
  shapes.forEach(([shape, tone]) => paintInk(cv, shape, tone))

  const { groups, counts, ink } = bakeAscii(cv, RAMP_ON)
  const svg = wrapAscii(cv, groups, ink, { crop: false, color: INK })
  emit([[name, svg]], { dir: OUT, unit: '笔' })
  console.log(`  ${describeLevels(counts)}`)

  /* viewBox 固定住了，四张共用一个框；能偏的只剩「墨迹在框里居不居中」。
     量墨迹中心与画布中心的偏差（取整到 0.1px）。横竖都该在 1px 以内 ——
     差得多就是构图偏了，图案在屏里会看着往一边倒。 */
  const half = STROKE / 2
  const dx = (ink.x0 + ink.x1) / 2 - cv.w / 2
  const dy = (ink.y0 + ink.y1) / 2 - cv.h / 2
  console.log(
    `  viewBox ${cv.w}×${cv.h}  墨迹居中偏差 横${dx.toFixed(1)} 纵${dy.toFixed(1)}` +
      `  四周留白 上${(ink.y0 - half).toFixed(1)} 下${(cv.h - ink.y1 + half).toFixed(1)}`
  )
  if (DUMP) printGrid(name, cv, RAMP_ON)
}

/* ══════════════════════════════════════════════════════════════════════
 * ① 资料学习与智能对话 · 围绕你自己的材料学习
 *
 * 题眼是那根**引线** —— 对应 desc 里的「引用面板直接调取你的资料」：
 * 答案不是凭空来的，它指着材料里的某一段。
 *
 * 左边一页材料（描边圆角矩形 + 四行正文，其中一行是实心高亮条），
 * 右边一个对话气泡（描边 + 三行字 + 朝左下的尾巴），引线从高亮条右端
 * 斜着连到气泡尾巴尖，末端在材料上钉一个小圆点。
 *
 * 主次照 dither 版的教训：**纸是底、不是主体**。
 * 纸的描边压到 0.5，正文行 0.6，高亮条 0.9 —— 纸一重，正文就全糊在纸里了。
 * ══════════════════════════════════════════════════════════════════════ */
const chat = () => {
  const cv = asciiCanvas(COLS, ROWS)

  /* 纸。描边宽 11 = 一整行，两条水平边分别落在第 3 行与第 21 行的分界线上 */
  const paper = hollow(rrect(24, 33, 180, 198, 12), rrect(35, 44, 158, 176, 6))

  /* 正文四行（第 8 行留给高亮条）。宽度参差才像一段文字 */
  const rows = [
    [66, 120],
    [121, 108],
    [154, 132],
    [187, 84],
  ]

  /* 高亮条：纸面上最重的东西，也是引线的起点。两行高，左端与正文行对齐 */
  const mark = rrect(48, 88, 120, LINE * 2, 6)

  /* 气泡。与纸同一套对齐：两条水平边落在第 5 行与第 15 行的分界线上 */
  const bubble = hollow(rrect(246, 55, 192, 110, 22), rrect(257, 66, 170, 88, 16))

  /* 气泡里的三行「答案」，比纸上的正文重一档 —— 这是主体 */
  const lines = [
    [77, 140],
    [99, 104],
    [121, 68],
  ]

  /* 尾巴：一个朝左下的阶梯三角，从气泡左下伸出，尖落在引线的终点格 (38, 14) 上。
     逐行向左加宽而不是画一个几何三角 —— 三角的两条斜边在字符格上
     同样会被覆盖率折成浅档（`-`），尾巴尖那里会散成一撮灰点 */
  const tail = [
    rrect(246, 132, 24, LINE),
    rrect(240, 143, 30, LINE),
    rrect(228, 154, 42, LINE),
  ]

  /* 引线：从高亮条右端的锚点走到气泡尾巴尖，量化成格子阶梯，粗两格。
     格坐标 (28, 8) → (38, 14)：横走 10 格、竖落 6 行，视觉上接近 45°。
     这一根是这张图的题眼，所以除了高亮条就数它最重 */
  const lead = trace(
    [
      [168, 93.5],
      [232, 157.5],
    ],
    2
  )

  /* 引用锚点：跨两列、一行高的椭圆（按格比例给半径），钉在引线起点上。
     正圆在这个格子里要么伸进邻格、要么占不满一行，两种都被覆盖率打折 */
  const dot = ellipse(168, 93.5, CELL_W, CELL_H / 2)

  bake(
    'feature-chat-ascii.svg',
    cv,
    shift(
      [
        [paper, 0.5],
        ...rows.map(([y, w]) => [rrect(48, y, w, LINE, 5), 0.6]),
        [mark, 0.9],
        [bubble, 0.5],
        ...lines.map(([y, w]) => [rrect(275, y, w, LINE, 5), 0.88]),
        ...tail.map((s) => [s, 0.6]),
        ...lead.map((s) => [s, 0.8]),
        [dot, 0.92],
      ],
      -1,
      1
    )
  )
}

/* ══════════════════════════════════════════════════════════════════════
 * ② 知识导图 · 把知识整理成结构
 *
 * 题眼是**层级**：根 0.92 / 一级 0.66 / 二级 0.44 —— 三级明度差本身就是「结构」。
 *
 * 节点用**实心胶囊**，不是描边。两条理由：
 * · 最小的一级节点只有 2 行高，描边 11 上下各占一行、内腔就没了，出来的是一块糊墨；
 * · 实心块在字符画里读得出「这是一块」，只要它够大（≥ 2 × 2 格）且周围有空白 ——
 *   ① 的气泡之所以必须描边，是因为它又大、内部还要放东西，跟这里不是一回事。
 *
 * 连线先画、节点压在上面 —— 反过来线会横穿节点，读成「被划掉」。
 * 连线一律正交，全部落在格线上：竖条骑列分界线（x 取 6 的倍数），
 * 横条吃满一整行（y 取 11 的倍数）。
 * ══════════════════════════════════════════════════════════════════════ */
const mindmap = () => {
  const cv = asciiCanvas(COLS, ROWS)

  /* 一级到二级的 L 形：先横出到子节点那一列，再竖直穿过两个子节点。
     二级因此排成上下两枚，而不是斜向散开 —— 斜线在这个格子里只能画成阶梯，
     节点又是实心块，两者叠起来会读成「一串噪点」 */
  const branches = [
    rrect(42, 132, 30, LINE),
    rrect(384, 132, 30, LINE),
    rrect(30, 99, VBAR, 88),
    rrect(408, 99, VBAR, 88),
  ]

  /* 根到四个一级节点的干。竖直的两根骑在 x = 228 这条列分界线上 */
  const trunks = [
    rrect(222, 55, VBAR, 66),
    rrect(222, 165, VBAR, 66),
    rrect(138, 132, 39, LINE),
    rrect(279, 132, 39, LINE),
  ]

  /* 二级节点：最外侧、最淡 */
  const leaves = [
    rrect(12, 99, 48, LINE * 2, 8),
    rrect(12, 165, 48, LINE * 2, 8),
    rrect(390, 99, 48, LINE * 2, 8),
    rrect(390, 165, 48, LINE * 2, 8),
  ]

  /* 一级节点：上下左右各一枚，两行高 */
  const nodes = [
    rrect(195, 33, 66, LINE * 2, 8),
    rrect(195, 231, 66, LINE * 2, 8),
    rrect(72, 132, 66, LINE * 2, 8),
    rrect(318, 132, 66, LINE * 2, 8),
  ]

  /* 根最后画：盖住四根连线的接头。
     根用**描边**，一级与二级用实心 —— 这一手是为了让「最重的一块」不至于变成
     一块砖。17 列 × 4 行的实心块在 75 × 26 的画布上占 3.5% 的面积，
     同一档画出来是一整片均匀的 `@`，读起来是「这里被涂掉了」而不是「这里是根」。
     描边之后它的墨量（周长 × 一行的宽）仍然大于任何一枚实心节点，
     再加上最深的一档，主次照样成立 */
  const root = hollow(rrect(177, 121, 102, LINE * 4, 22), rrect(188, 132, 80, LINE * 2, 11))

  bake('feature-mindmap-ascii.svg', cv, [
    ...branches.map((s) => [s, 0.42]),
    ...trunks.map((s) => [s, 0.5]),
    ...leaves.map((s) => [s, 0.44]),
    ...nodes.map((s) => [s, 0.66]),
    [root, 0.92],
  ])
}

/* ══════════════════════════════════════════════════════════════════════
 * ③ 题目集与练习 · 把教材、试卷变成可练习的题库
 *
 * 题眼是**勾徽章 + 掌握度条** —— 对应 desc 的「自动判分，掌握度按知识点追踪」。
 * 左边一张卷子（描边 + 页眉线 + 两道题：题号块、题干线、三个选项点，
 * 各有一个选项是实心选中的），右边一枚圆环勾徽章，下方一条掌握度条。
 *
 * 与 ① 同一条教训：卷子是「底」，描边压到 0.5、页眉 0.7、题号块 0.85、
 * 题干 0.62、选项 0.5 / 选中 0.9 —— 卷子一重，这些就全糊在纸里了。
 *
 * 掌握度条用**叠着画的两条**：先一条浅的长条当底，再在左半边压一条深的当进度。
 * `paintInk` 的 tone 与 cov 都取 max，所以压上去只把左半段加深，
 * 不会把底条的右半段擦掉 —— 一次就画出「进度」这件事。
 * ══════════════════════════════════════════════════════════════════════ */
const quiz = () => {
  const cv = asciiCanvas(COLS, ROWS)

  const sheet = hollow(rrect(24, 33, 174, 198, 12), rrect(35, 44, 152, 176, 6))
  const header = rrect(48, 66, 108, LINE, 5)

  /* 两道题。题号块四列两行，题干一行，三个选项各占两列一行 */
  const marks = []
  const stems = []
  const options = []
  const questions = [
    { y: 99, stem: 84, picked: 1 },
    { y: 165, stem: 72, picked: 3 },
  ]
  questions.forEach(({ y, stem, picked }) => {
    marks.push([rrect(48, y, 24, LINE * 2, 6), 0.85])
    stems.push([rrect(84, y, stem, LINE, 5), 0.68])
    for (let i = 0; i < 3; i += 1) {
      const x = 60 + 24 * i
      const y0 = y + LINE * 3 + CELL_H / 2
      options.push([
        ellipse(x, y0, CELL_W, CELL_H / 2),
        i + 1 === picked ? 0.9 : 0.5,
      ])
    }
  })

  /* 判分徽章：圆环 + 勾。
     环按格心采样（见 `ringCells`），勾走格子阶梯 —— 两样都不留浅档。
     勾的两笔撑到内圈的边上（内径 72px，勾横跨 9 格 = 54px），
     小了在洞里读不出来；`weight: 2` 让它和环带是同一个量级 */
  const badge = ringCells(336, 120, 54, 36)
  const check = [
    ...trace(
      [
        [306, 99],
        [330, 132],
      ],
      2
    ),
    ...trace(
      [
        [330, 132],
        [360, 88],
      ],
      2
    ),
  ]

  /* 掌握度条：底 + 进度。与徽章同一条中心线（x = 336），右侧那一栏才立得正 */
  const track = rrect(270, 187, 132, LINE * 2, 11)
  const progress = rrect(270, 187, 78, LINE * 2, 11)

  bake(
    'feature-quiz-ascii.svg',
    cv,
    shift(
      [
        [sheet, 0.5],
        [header, 0.7],
        ...marks,
        ...stems,
        ...options,
        ...badge.map((s) => [s, 0.78]),
        ...check.map((s) => [s, 0.92]),
        [track, 0.26],
        [progress, 0.82],
      ],
      2,
      1
    )
  )
}

/* ══════════════════════════════════════════════════════════════════════
 * ④ Anki 智能制卡 · 把理解变成长期记忆
 *
 * 题眼是那条**遗忘曲线** —— 全页只有这一处出现曲线，辨识度靠它。
 *
 * 卡片堆的画法跟 dither 版不一样。那边是三张**实心**矩形按 0.1 / 0.17 / 0.25
 * 叠着画，靠 `paint` 的加权混合让后画的盖住先画的；字符画没有「盖住」这回事
 * （`paintInk` 的 tone 取 max，两层只会变深），三张完整描边的卡片叠起来，
 * 后面那两张的底边会横穿最前面那张的内部，读成一团。
 * 所以后两张只画**左边 + 顶边**那截 L 形 —— 正好是「叠放的卡片」实际露出来的部分，
 * 最前面那张才画完整描边。三组 L 互不重叠，叠出来的角自己说明了「一摞」。
 *
 * 曲线用「采样成点 + polyline」：图元库里只有解析几何，多一个曲线原语不值当。
 * 线宽 11 —— 与横条同一个道理，薄了在斜段上会被覆盖率打折。
 * ══════════════════════════════════════════════════════════════════════ */
const anki = () => {
  const cv = asciiCanvas(COLS, ROWS)

  /* 后两张卡的 L 形。错开 24px（4 列）/ 22px（2 行）—— 小了这个错位看不出来，
     三张会糊成一块，dither 版量过同一件事。
     档位 0.52：这是量出来的，不是「淡一点当背景」。0.3 出来的是一撮散在左上角的
     `-`，读起来像划痕而不是「后面还压着两张卡」；0.52 落在 `+` 上，
     与最前面那张的描边（0.5）同量级 —— 仍然是「底」，但那三条边确实是在那儿。 */
  const stack = [
    rrect(120, 33, 198, LINE),
    rrect(120, 33, VBAR, 88),
    rrect(144, 55, 198, LINE),
    rrect(144, 55, VBAR, 88),
  ]

  /* 最前面那张：完整描边，也是曲线之外唯一带内部内容的东西 */
  const front = hollow(rrect(168, 77, 198, 99, 12), rrect(179, 88, 176, 77, 6))
  const card = [
    rrect(192, 99, 108, LINE * 2, 6),
    rrect(192, 132, 132, LINE, 5),
    rrect(192, 154, 84, LINE, 5),
  ]

  /* 遗忘曲线：三次下坠、三次被复习拉回，峰值都回到同一条水平线上。
     与 ① 的引线同一条路子 —— 采样成点，再整体量化成格子阶梯 */
  const PEAK = 204
  const DROP = 55
  const SPAN = 120
  const pts = [[48, PEAK]]
  const decay = (x0) => {
    const n = 20
    const k = 1 - Math.exp(-3.2)
    for (let i = 1; i <= n; i += 1) {
      const t = i / n
      pts.push([x0 + SPAN * t, PEAK + DROP * ((1 - Math.exp(-3.2 * t)) / k)])
    }
  }
  decay(48)
  pts.push([180, PEAK])
  decay(180)
  pts.push([312, PEAK])
  decay(312)
  const curve = trace(pts)

  /* 复习节点：钉在每次被拉回的位置上 */
  const dots = [48, 180, 312].map((x) => ellipse(x, PEAK, CELL_W, CELL_H / 2))

  bake(
    'feature-anki-ascii.svg',
    cv,
    shift(
      [
        ...stack.map((s) => [s, 0.52]),
        [front, 0.5],
        ...card.map((s, i) => [s, i === 0 ? 0.9 : 0.62]),
        ...curve.map((s) => [s, 0.72]),
        ...dots.map((s) => [s, 0.88]),
      ],
      -2,
      -1
    )
  )
}

/* 一次画四张。给个名字就只画那一张 —— `--dump` 一次刷 112 行，调构图时按张看来回翻
   太费眼，`node scripts/gen-features-ascii.mjs --dump chat` 这种用法是常态 */
const SCENES = { chat, mindmap, quiz, anki }
const only = process.argv.slice(2).find((arg) => !arg.startsWith('--'))
for (const [name, draw] of Object.entries(SCENES)) {
  if (!only || only === name) draw()
}
