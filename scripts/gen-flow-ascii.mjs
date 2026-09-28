/**
 * 「使用流程」两张卡的底图：字符画（ASCII art）生成器。
 *
 * 灰度场、形状原语都在 `scripts/lib/dither.mjs`，
 * 量化与字形在 `scripts/lib/ascii.mjs`。这里只管构图：
 * 两张卡各画一个单主体符号，每个格子挑一个字符落到画布上。
 *
 * 用法：node scripts/gen-flow-ascii.mjs
 * 产物：docs/.vitepress/theme/assets/flow-think-ascii.svg、flow-review-ascii.svg
 *       （组件以 `?raw` 引入后内联，见 theme/utils/flow-art.js）
 */
import {
  arcRing,
  clamp01,
  ellipse,
  emit,
  hollow,
  polygon,
  polyline,
  rrect,
  seg,
  smoothstep,
} from './lib/dither.mjs'
import {
  asciiCanvas,
  bakeAscii,
  CELL_H,
  CELL_W,
  describeLevels,
  paintInk,
  STROKE,
  wrapAscii,
} from './lib/ascii.mjs'

/**
 * 没有边缘溶解。
 *
 * dither 那一版在这里挂了一条左 / 上的缓坡，名义是「让图案从卡面里长出来」——
 * 但那两张图的主体都离画布边很远（气泡左边空 4 格、画布右边还空 4 格），
 * 缓坡根本没碰到图案，只有一句注释以为它碰到了。
 *
 * 字符画这边更不该挂：溶解做在**档位**上，一条横跨形状的缓坡会把边框的一侧
 * 整体压低一两档 —— 上下两条边一个深一个浅，读起来是画错了，不是「长出来」。
 * 深度感交给下面各自的渐变（`frameTone` / `loopTone`），那是沿对角线走的，
 * 两边都有深浅，眼睛认它是光，不认它是缺陷。
 */
const ramp = () => 1

/**
 * 圆弧采样成折线。
 *
 * 不用 `arcRing`：环的两端是**径向的薄片** —— 在 168° 那一端，薄片几乎是水平的，
 * 落进 6 × 11 的格子只有 0.08 的覆盖率，被 `COV_MIN` 吃掉，钩的左下起笔就断了，
 * 问号读成了「n + 一竖」。`polyline` 的每一段都是带圆头的胶囊，两端自然是圆的，
 * 起笔落得住一个格子。
 *
 * 采样步长 6° 是量过的：r=20 时每段弦长 2px，远小于 9px 的笔宽，
 * 拼出来的弧看不出是折线。
 */
const arcPath = (cx, cy, r, fromDeg, toDeg, stroke) => {
  const steps = Math.max(8, Math.ceil(Math.abs(toDeg - fromDeg) / 6))
  const points = []
  for (let i = 0; i <= steps; i += 1) {
    const a = ((fromDeg + ((toDeg - fromDeg) * i) / steps) * Math.PI) / 180
    points.push([cx + r * Math.cos(a), cy + r * Math.sin(a)])
  }
  return polyline(points, stroke)
}

/**
 * 问号。三段拼出来：钩、竖、点。
 *
 * **钩**从左下起笔（168°），经正上方绕到正右，收在圆心正下方（450° = 90°），
 * 缺口正好留在左下 —— 这是问号的开口方向。上一版扫的是 190°→455°，两端几乎接上，
 * 圆成了圈，放大看是个「6」。
 *
 * **竖与点都骑在字符格的分界线上**（横坐标取 6 的整数倍）。笔宽 9 跨两格时，
 * 压在分界线上两格各吃 4.5px、覆盖率 0.75 —— 越过 `COV_KNEE`，两格都按满档
 * 画成实心的 `@`。偏半格就变成「一格满、两格各吃一角」，那两角被按覆盖率打折，
 * 画出来是一对浅字，整根笔画看着是毛的。
 *
 * **点不是一个圆而是一个按格比例压扁的椭圆**：占满整格宽（两格 = 12px）、
 * 整行高（11px），于是正好是两个实心 `@`，读起来是问号下面那个点，
 * 而不是一条小短横。
 */
const questionMark = (cv, { cx, hookCy, hookR, stemTo, dotCy, gray = 0.95 }) => {
  // 叫 WEIGHT 不叫 STROKE：STROKE 是 lib/ascii.mjs 里那个全局笔宽（1.27），
  // 问号这一处单独加粗，重名会被遮住、后面对不上账
  const WEIGHT = 9
  paintInk(cv, arcPath(cx, hookCy, hookR, 168, 450, WEIGHT), gray)
  paintInk(cv, seg(cx, hookCy + hookR, cx, stemTo, WEIGHT), gray)
  paintInk(cv, ellipse(cx, dotCy, CELL_W, CELL_H / 2), gray)
}

/* ── 落盘的收尾 ──
 * 与 dither 那个生成器同一个口径：算完、写盘、打一行「多大 / 各档多少个字符」。
 * 梯度那行是留给自己的：八个字符有没有真的都用上、有没有全挤在一档，
 * 不看图也能先从这里看出来。
 *
 * 产物写进 `theme/assets` 而不是 `docs/public`：这两张图是被 `StepFlow.vue`
 * 用 `?raw` 引进来、**内联进 DOM** 的，墨色靠 `currentColor` 继承主题。
 * 放进 public 就会被原样复制一份到产物里、谁也不引用它。
 */
const OUT = 'docs/.vitepress/theme/assets'

const bake = (name, cv) => {
  const { groups, counts, ink } = bakeAscii(cv, ramp)
  const svg = wrapAscii(cv, groups, ink)
  emit([[name, svg]], { dir: OUT, unit: '笔' })
  console.log(`  ${describeLevels(counts)}`)

  /* 把 viewBox 反解出来核一遍四边留白。wrapAscii 把四条边各自取整，
     所以四个数最多差 0.5 —— 差得多就说明「墨迹在图片里居中」这件事没成立。 */
  const [, vx, vy, vw, vh] = svg.match(/viewBox="(-?\d+) (-?\d+) (\d+) (\d+)"/).map(Number)
  const half = STROKE / 2
  const pad = [
    ink.x0 - half - vx,
    ink.y0 - half - vy,
    vx + vw - ink.x1 - half,
    vy + vh - ink.y1 - half,
  ]
  console.log(`  viewBox ${vw}×${vh}  留白 左${pad[0].toFixed(1)} 上${pad[1].toFixed(1)} 右${pad[2].toFixed(1)} 下${pad[3].toFixed(1)}`)
}

/* ══════════════════════════════════════════════════════════════════════
 * ① 想明白 · 围绕你的材料对话
 *
 * 一个描边的问答气泡，里面一个实心的问号 —— 问答本身就是「轮廓 + 提问」。
 *
 * 气泡**不填实**：字符画一格只有一个档位，实心的气泡会把轮廓和内部画成同一个
 * 档，整块读出来是一片均匀的字，气泡的形状反而糊掉（这一版之前就是这么糊的）。
 * 描边把「有边界」和「有内部」分成两件事，三层重量从浅到深排开，符号才立得住。
 *
 * 画布 46 × 16 格（276 × 176 px）。格数不是随手取的：1440 视口下窄卡 356px 宽，
 * .pair__shot 取 84% ≈ 299px —— 46 列字符铺上去，一格约 6.5px，
 * 在 DPR 2 的屏上是 13 个物理像素，字形站得住。
 * ══════════════════════════════════════════════════════════════════════ */
const think = () => {
  const cv = asciiCanvas(46, 16)

  /* 气泡框左下浅、右上深，沿对角线拉开层次。档次压在 0.5–0.86：低档落在 `+`、
     高档落在 `#`。再往下压试过 0.44–0.78，低档落到 `=`（两条细横），
     整条边框读起来是虚线而不是实线，气泡当场散架 —— 字重的主次交给问号的笔画去分。 */
  const frameTone = (x, y) => {
    const diagonal = clamp01(((x - 24) / 228) * 0.7 + ((143 - y) / 132) * 0.3)
    return 0.5 + 0.36 * smoothstep(0, 1, diagonal)
  }

  /*
   * 描边宽度取 11px = 整整一行，而且**两条边都落在字符行的分界线上**。
   *
   * 这两件事都得做：窄于一行，上下两条边落不满格子，覆盖率补足也救不回来，
   * 边框会从实线变成虚线；对不齐行边界，一行被吃满、邻行只吃到一角，
   * 那一角被按覆盖率打折、画成浅一档的字 —— 边框上会挂出一条毛边。
   * 所以 y 从 11 起（第 1 行与第 2 行的分界）、高 132（12 行），描边 11 正好吃满一行。
   * 左右方向一格只有 6px，同一条描边折过去是 1.8 格，比上下厚一点 ——
   * 这是 6 × 11 的格子必然的结果，看起来是「框比横厚」，不像瑕疵。
   */
  const FRAME = 11
  paintInk(
    cv,
    hollow(
      rrect(24, 11, 228, 132, 42),
      rrect(24 + FRAME, 11 + FRAME, 228 - FRAME * 2, 132 - FRAME * 2, 31)
    ),
    frameTone
  )

  /* 尾巴是整个符号的一部分，跟框同档（略压一点），读起来才是一个整体 */
  paintInk(cv, polygon([[78, 148], [52, 174], [112, 158]]), 0.72)

  /* 问号：钩半径 20、笔画 9，竖到 y=94，点落在第 10 行、跨第 22–23 列。
     整套高度 31.5–121，落在气泡内腔（22–132）的中段。
     横坐标 138 是 6 的整数倍，也就是第 22 列与第 23 列的分界线 —— 竖与点都骑在这条线上。
     竖收在 94 而不是更下面：`seg` 是胶囊，末端还多出半个笔宽的圆头（+4.5），
     收到 94 正好压在 99 这条行界线上，问号那个「点前面的空档」才留得住。 */
  questionMark(cv, { cx: 138, hookCy: 56, hookR: 20, stemTo: 94, dotCy: 115.5 })

  bake('flow-think-ascii.svg', cv)
}

/* ══════════════════════════════════════════════════════════════════════
 * ② 记得住 · 变成能复习的东西
 *
 * 一个循环复习符号：一条有方向的回环与中心对勾组成一个整体。
 * 不画卡片堆、知识节点和进度点 —— 「反复回来并最终掌握」由一个符号说完。
 *
 * 画布 90 × 30 格（540 × 330 px）：1440 视口下宽卡 712px，.pair__shot 取 75% ≈ 534px。
 * 格宽格高与 ① 一致 —— 两张图案的字一样大，只是这一张画幅更宽，容得下更多细节。
 * ══════════════════════════════════════════════════════════════════════ */
const review = () => {
  const cv = asciiCanvas(90, 30)

  /* 回环整体在 0.55–0.87 档，左上深、右下浅，大符号上仍有层次。 */
  const loopTone = (x, y) => {
    const dx = (x - 270) / 150
    const dy = (y - 165) / 150
    return 0.55 + 0.32 * clamp01((dx - dy + 2) / 4)
  }

  /* 粗回环与箭头连成单个轮廓。箭头压到 `#` 一档：它是实心三角，
     满档的 `@` 会在环的右上角糊出一根九格宽的实心横杠，比环里那个对勾还抢眼。 */
  paintInk(cv, arcRing(270, 165, 116, 22, 42, 338), loopTone)
  paintInk(cv, polygon([[364, 89], [416, 87], [388, 131]]), 0.8)

  /* 对勾是回环内部唯一内容，代表复习完成和掌握。笔画最重，是整张图的焦点。 */
  paintInk(cv, seg(218, 169, 258, 211, 18), 0.95)
  paintInk(cv, seg(258, 211, 332, 121, 18), 0.95)

  bake('flow-review-ascii.svg', cv)
}

think()
review()
