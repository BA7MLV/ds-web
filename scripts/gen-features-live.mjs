/**
 * 首页的真实界面截图：功能区六扇窗、「使用流程」两张卡。
 *
 * 在同源演示镜像（docs/public/demo）里打开对应剧本会话、等它播完，按每扇窗的取景框截深浅两张 2 倍图。
 * 截之前先查取景框的四条边有没有切开界面（见 frameCuts）：首页上看到的就是这张图，
 * 框边落在一行字、一张卡片中间，访客看到的就是半句话、少条边的残缺界面。
 *
 * 产物（docs/public/features/）：<name>-light.webp、<name>-dark.webp，由 FeatureShot.vue 按主题显示其中一张。
 *
 * 用法：
 *   node scripts/gen-features-live.mjs              # 全部场景
 *   node scripts/gen-features-live.mjs chat quiz    # 只重出指定场景
 *   node scripts/gen-features-live.mjs --check      # 只查取景框四条边有没有切开界面，上下文图放到系统临时目录，不写产物
 * 取景框的边切开了一行字或一张卡片：上下两边的会在截图前藏掉（框里留白），左右两边的直接报错不出图。
 * 依赖：playwright-core（devDependency）+ 本机 Google Chrome（CHROME=... 可换路径）、cwebp（brew install webp）。
 * 演示镜像换了（docs/.vitepress/data/demo-mirror.json 的 signature 变了）就该重跑。
 */
/* global window, document, getComputedStyle, NodeFilter, CSS, DOMMatrix -- 下面带「在页面里跑」的函数经 page.evaluate 在浏览器里执行 */
import { execFileSync } from 'node:child_process'
import { createReadStream } from 'node:fs'
import { mkdir, mkdtemp, rm, stat, writeFile } from 'node:fs/promises'
import { createServer } from 'node:http'
import { tmpdir } from 'node:os'
import { dirname, extname, join, normalize, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'
import { shotSize } from '../docs/.vitepress/theme/utils/feature-shot.js'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const PUBLIC = join(ROOT, 'docs/public')
const OUT = join(PUBLIC, 'features')
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const CWEBP = process.env.CWEBP || 'cwebp'

/**
 * 每扇窗：在哪个剧本会话里、取景框怎么定位。
 * anchor 按文字或选择器找到一块界面（两者都给 = 选择器匹配里文字正好相同的那个）：
 * block 时再往上找到带边框的容器；取景框左上角 = 锚点左上角 + offset，
 * center 时改成让取景框中心对准锚点中心。
 */
const SCENES = [
  // 对话、题库、Anki、双语四扇窗口都开 940 宽：侧栏 320 之后、左右各留 28，对话栏 564 宽，
  // 取景框 592 宽、两边各让 14px 正好框住一整栏 —— 开 1280 宽时对话栏比取景框宽，每行字、每张卡片的右半截都被切掉
  { name: 'chat', scene: 'demo-pdf-deepread', viewport: { width: 940, height: 1000 }, anchor: { text: '沿着页码理解章节' }, offset: { x: -14, y: -12 } },
  // 导图默认左右两侧展开，扁长一条（约 6 : 1），放进 592 × 416 的取景框上下全是空白、两头的叶子还被切掉。
  // 切到应用自带的「单侧布局」再「回中」：根节点在左，三个分支竖着排，宽高比和取景框差不多。
  // 取景框对准整张图的外框居中
  {
    name: 'mindmap',
    scene: 'demo-pdf-deepread',
    ready: { selector: '.react-flow__node', text: '数据并行训练' },
    prepare: prepareMindmap,
    anchor: { selector: '.react-flow__node', union: true, center: true },
    offset: { x: 0, y: 0 }
  },
  { name: 'quiz', scene: 'demo-qbank', viewport: { width: 940, height: 1000 }, anchor: { text: 'AI 出题结果', block: true }, offset: { x: -14, y: -12 } },
  // 取景框上沿压在正中那张卡空着的上半截（卡片和底色同色、没有边，看不出被压），
  // 底下才装得下收起后的「路由 → 生成 → 完成」整栏
  {
    name: 'anki',
    scene: 'demo-anki-cards',
    viewport: { width: 940, height: 1000 },
    prepare: prepareAnki,
    anchor: { text: '共 5 张卡片' },
    offset: { x: -14, y: -241 }
  },
  // 复习页的四个评分键横跨整个主区：窗口收到 920 × 470，主区 600 宽，卡片也跟着矮下来，
  // 取景框一屏装下「退出 / 复习 2 / 已评 0 / 计时」那一栏、翻过来的答案和四个评分键
  {
    name: 'review',
    scene: 'demo-weekly-report',
    ready: { text: '本周学习看板' },
    init: unlockViews,
    prepare: prepareReview,
    viewport: { width: 920, height: 470 },
    anchor: { text: '保留到三阶', center: true },
    offset: { x: 0, y: 0 }
  },
  { name: 'reading', scene: 'demo-bilingual', viewport: { width: 940, height: 1000 }, anchor: { text: '英文原文', block: true }, offset: { x: -14, y: -12 } },
  // 「使用流程」两张卡（StepFlow.vue）：窄卡 320 宽、宽卡 592 宽，高度按卡片标题下面剩的地方定。
  // 窄卡用手机宽度打开，回答在 320 宽里自然折行，取景框里不会有被拦腰截断的句子。
  // 取景从「怎样接到自己的学习中」起：正文引的是学习档案里的记忆 [忆1] [忆2]，
  // 下面接着 AI 生成的研究路径对照卡 —— 正好是这张卡讲的「答案带出处、记得你的偏好」
  {
    name: 'flow-think',
    scene: 'demo-spaced-repetition',
    viewport: { width: 344, height: 900 },
    anchor: { text: '怎样接到自己的学习中' },
    // 正文栏 16–328，取景框 320 宽左右各让 4px：「AI 生成」那条框差不多和栏一样宽，偏一边就贴到框边
    offset: { x: -4, y: -12 }
  },
  {
    name: 'flow-review',
    scene: 'demo-weekly-report',
    ready: { text: '本周学习看板' },
    init: unlockViews,
    prepare: prepareToday,
    viewport: { width: 920, height: 640 },
    anchor: { text: '今日复习' },
    // 往左多让 8px：取景框右缘正好压着滚动区的边线
    offset: { x: -16, y: -12 }
  }
]

/**
 * 闪卡复习不在聊天页里：演示壳只放行聊天页（主仓库 App.tsx 的 isDemoShell 守卫），
 * 演示的 mock IPC 也没有 FSRS 那一套。所以借演示把应用拉起来之后：
 *   · 页面脚本执行前把 __DS_DEMO_SHELL__ 钉成 false，放开视图切换；
 *   · 在 mock IPC 外再包一层，给 fsrs_* 等几条命令返回固定数据 ——
 *     卡片正文取自演示「高数错题 → Anki 卡片」，间隔是一张复习卡的典型值；
 *   · 切到闪卡 → 开始复习 → 显示答案，停在评分那一步。
 */
const REVIEW_CARDS = [
  {
    front: '求 lim(x→0) (sin x − x) / x³ 时，泰勒展开应保留到哪一阶？',
    back: '保留到三阶。\n展开 sin x = x − x³/6 + o(x³)，相减后首个非零项是 −x³/6，除以 x³ 得极限 −1/6。'
  },
  {
    front: '∫₀^π sin²x dx 用换元 u = cos x 时，上下限和微分怎样变化？',
    back: 'x = 0 对应 u = 1，x = π 对应 u = −1，du = −sin x dx。\n在 [0, π] 上 sin x ≥ 0，原式转为 ∫₋₁¹ √(1 − u²) du = π/2。'
  }
]

function unlockViews() {
  Object.defineProperty(window, '__DS_DEMO_SHELL__', { configurable: true, get: () => false, set: () => {} })
}

function mockFsrs(cards) {
  const internals = window.__TAURI_INTERNALS__
  const original = internals.invoke.bind(internals)
  const now = Date.now()
  const preview = (minutes, days) => ({ dueMs: now + minutes * 60000, scheduledDays: days, intervalMs: minutes * 60000 })
  const replies = {
    fsrs_get_due: () => cards.map((card, i) => ({
      id: `fsrs-demo-${i + 1}`,
      ankiCardId: `anki-demo-${i + 1}`,
      front: card.front,
      back: card.back,
      tags: ['高等数学'],
      images: [],
      templateId: null,
      extraFields: {},
      stability: 4.2 + i,
      difficulty: 5.1,
      lastReviewMs: now - 3 * 86400000
    })),
    fsrs_get_stats: () => ({
      total: 128, due: cards.length, newCount: 12, learning: 3, review: 109, relearning: 1,
      suspended: 3, reviewsToday: 18, backlog: 0, backlogReview: 0, backlogNew: 0, learningWaiting: 0
    }),
    fsrs_preview_intervals: () => ({ previews: { 1: preview(10, 0), 2: preview(2880, 2), 3: preview(8640, 6), 4: preview(21600, 15) } }),
    fsrs_get_scheduler_config: () => ({ learnAheadMinutes: 20 }),
    list_anki_library_cards: () => ({ total: 128, items: [] })
  }
  internals.invoke = (cmd, args, options) => (cmd in replies ? Promise.resolve(replies[cmd](args)) : original(cmd, args, options))
}

/**
 * 导图切到单侧布局、回中、再缩小一档：回中之后整张图正好撑满取景框，
 * 而网格里的中文一个两格（16px）比界面上的字宽，右边的叶子会排出框外。
 * 左下角的工具条只是画布控件，藏起来；鼠标也挪开，免得留下提示气泡
 */
async function prepareMindmap(page) {
  const card = page.locator('.mindmap-container').first()
  await card.locator('button[aria-label="切换为单侧布局"]').click()
  await page.waitForTimeout(1200)
  await card.locator('button[aria-label="回中"]').click()
  await page.waitForTimeout(1200)
  await card.locator('button[aria-label="缩小"]').click()
  await page.waitForTimeout(1200)
  await page.mouse.move(0, 0)
  await page.addStyleTag({ content: '.mindmap-container button{visibility:hidden!important}' })
}

/**
 * Anki 卡片轮播：后面四张卡斜着叠在正中那张后头，被它挡住半边，截出来是一列列半截字，
 * 只留最上面那张（z-index 最大）。「路由 → 生成 → 完成」那一栏收起详情：
 * 展开时底下的进度条和卡片数伸出取景框，收起后整栏正好留在框里
 */
async function prepareAnki(page) {
  await page.evaluate(() => {
    const cards = [...document.querySelectorAll('.card-3d')]
    const z = (el) => Number(getComputedStyle(el).zIndex) || 0
    const front = cards.reduce((top, card) => (z(card) > z(top) ? card : top), cards[0])
    for (const card of cards) if (card !== front) card.style.visibility = 'hidden'
  })
  await page.getByRole('button', { name: '收起详情' }).first().click()
}

/** 「记得住」那张卡停在闪卡的「今日」页：进度环、待复习 / 新卡 / 学习中，不点开始复习 */
async function prepareToday(page) {
  await page.evaluate(mockFsrs, REVIEW_CARDS)
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('NAVIGATE_TO_VIEW', { detail: { view: 'flashcards' } })))
  await page.getByText('今日复习', { exact: true }).first().waitFor({ timeout: 20000 })
}

async function prepareReview(page) {
  await page.evaluate(mockFsrs, REVIEW_CARDS)
  await page.evaluate(() => window.dispatchEvent(new CustomEvent('NAVIGATE_TO_VIEW', { detail: { view: 'flashcards' } })))
  await page.getByRole('button', { name: '开始复习' }).first().click({ timeout: 20000 })
  await page.getByText('显示答案', { exact: true }).first().click({ timeout: 20000 })
}

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2',
  '.wasm': 'application/wasm'
}

/** 演示镜像引用的是 /demo/ 下的根绝对路径，要一个真的 http 源，file:// 不行 */
async function serve(root) {
  const server = createServer(async (req, res) => {
    const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname))
    const file = join(root, path.endsWith('/') ? `${path}index.html` : path)
    if (!file.startsWith(root)) return res.writeHead(403).end()
    try {
      if (!(await stat(file)).isFile()) throw new Error('not a file')
      res.writeHead(200, { 'content-type': MIME[extname(file)] || 'application/octet-stream' })
      createReadStream(file).pipe(res)
    } catch {
      res.writeHead(404).end()
    }
  })
  await new Promise((done) => server.listen(0, '127.0.0.1', done))
  return { origin: `http://127.0.0.1:${server.address().port}`, close: () => server.close() }
}

/** 剧本播完 = 锚点出现之后，正文连续 2.5 秒不再变化（数字不算：复习页的计时器每秒都在跳） */
async function waitUntilSettled(page, anchor) {
  await page.waitForFunction(locateWindow, { anchor, probe: true }, { timeout: 90000, polling: 300 })
  let last = ''
  let stableSince = Date.now()
  const deadline = Date.now() + 60000
  while (Date.now() < deadline) {
    const text = await page.evaluate(() => document.body.innerText.replace(/\d/g, ''))
    if (text !== last) {
      last = text
      stableSince = Date.now()
    }
    if (Date.now() - stableSince > 2500) return
    await page.waitForTimeout(300)
  }
  throw new Error('剧本 60 秒内没有播完')
}

/**
 * 在页面里跑：把取景框挪进视口，返回它在视口里的位置。probe 时只回答锚点出现了没有。
 * 文字可能被拆成好几个文本节点，所以按元素找包含这段文字的最深那个。
 */
function locateWindow({ anchor, offset = { x: 0, y: 0 }, size, probe, settled }) {
  let els = []
  if (anchor.selector) {
    els = [...document.querySelectorAll(anchor.selector)]
      .filter((el) => !anchor.text || el.textContent.trim() === anchor.text)
    // 节点外壳可能比看得见的那块大（连接点、隐藏的展开区），对准里面真正装着文字的元素
    if (anchor.text && els.length) {
      let inner = els[0]
      for (const el of els[0].querySelectorAll('*')) if (el.textContent.trim() === anchor.text) inner = el
      els = [inner]
    }
  } else {
    let best = null
    for (const el of document.body.querySelectorAll('*')) {
      if (el.textContent.includes(anchor.text) && (!best || best.contains(el))) best = el
    }
    if (best) els = [best]
  }
  if (probe) return els.length > 0
  if (!els.length) throw new Error(`找不到锚点 ${anchor.selector || anchor.text}`)
  // union：选择器匹配到的全部元素合成一个矩形（整张导图的外框）
  if (anchor.union) {
    const all = [...document.querySelectorAll(anchor.selector)].filter((el) => el.checkVisibility())
    els = [{
      getBoundingClientRect: () => {
        const rects = all.map((el) => el.getBoundingClientRect())
        const left = Math.min(...rects.map((b) => b.left))
        const top = Math.min(...rects.map((b) => b.top))
        return { left, top, width: Math.max(...rects.map((b) => b.right)) - left, height: Math.max(...rects.map((b) => b.bottom)) - top }
      },
      scrollIntoView: (options) => all[0].scrollIntoView(options),
      parentElement: all[0].parentElement
    }]
  }
  if (anchor.block) {
    for (let cur = els[0]; cur && cur !== document.body; cur = cur.parentElement) {
      const s = getComputedStyle(cur)
      const bordered = parseFloat(s.borderTopWidth) > 0 && !/rgba\(0, 0, 0, 0\)|transparent/.test(s.borderTopColor)
      if (bordered && cur.getBoundingClientRect().width > 300) {
        els = [cur]
        break
      }
    }
  }
  const bounds = () => els[0].getBoundingClientRect()
  const place = (b) => anchor.center
    ? { x: b.left + b.width / 2 - size.width / 2 + offset.x, y: b.top + b.height / 2 - size.height / 2 + offset.y }
    : { x: b.left + offset.x, y: b.top + offset.y }
  // 第二次量（滚动之后界面可能还会再挪一下，比如导图重新 fitView）：只量不滚
  if (settled) return { ...place(bounds()), width: size.width, height: size.height }
  // 让取景框（不是锚点）的上沿落在会话标题栏下面一点
  els[0].scrollIntoView({ block: 'start' })
  let scroller = document.scrollingElement
  for (let cur = els[0].parentElement; cur; cur = cur.parentElement) {
    const s = getComputedStyle(cur)
    if (/(auto|scroll)/.test(s.overflowY) && cur.scrollHeight > cur.clientHeight) {
      scroller = cur
      break
    }
  }
  scroller.scrollTop += place(bounds()).y - 64
  return { ...place(bounds()), width: size.width, height: size.height }
}

/**
 * 在页面里跑：找取景框四条边切开的东西。
 *
 * 截图只取框里那一块，框边落在一行字、一张卡片、一个胶囊或图标中间，
 * 截出来就是半句话、少条边的卡片 —— 看的人会以为界面坏了。查法：
 *   · 字按行查（Range.getClientRects），一行只框进来一部分就算切开；
 *   · 卡片 / 面板 / 胶囊（有底色、三条边以上的边框或阴影）、图标、图片、iframe 按外框查，
 *     某个方向上一头在框里、一头在框外才算切开 —— 比取景框还宽 / 还高、整个横穿过去的
 *     （对话栏的底色、通栏分隔线）是底，不算；
 *   · 只有一两条边框的（行线、分隔线）把每条边当一根线查；
 *   · 先扣掉被界面自己的 overflow 裁掉的部分：那是界面本来的样子，不是取景框切的。
 *
 * trim 时把上下两条边切开的东西藏起来（visibility: hidden，排版不动）：底边切开的那一块
 * 和它下面的一切、顶边切开的那一块和它上面的一切。字按所在的整段藏，段落前几行没被切也一起藏，
 * 框里只留完整的段落和卡片，框底 / 框顶留白。左右两条边切开的藏了就缺半栏正文，
 * 只能收窄窗口或挪取景框，所以只报不藏。
 */
function frameCuts({ win, trim }) {
  const EPS = 1.5
  const F = { left: win.x, top: win.y, right: win.x + win.width, bottom: win.y + win.height }
  const swatch = document.createElement('canvas').getContext('2d', { willReadFrequently: true })
  const colors = new Map()
  const color = (value) => {
    if (!colors.has(value)) {
      let parsed = null
      if (value && CSS.supports('color', value)) {
        swatch.clearRect(0, 0, 1, 1)
        swatch.fillStyle = value
        swatch.fillRect(0, 0, 1, 1)
        const [r, g, b, a] = swatch.getImageData(0, 0, 1, 1).data
        parsed = { r, g, b, a: a / 255 }
      }
      colors.set(value, parsed)
    }
    return colors.get(value)
  }
  const lum = (c) => (0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b) / 255
  const bgOf = (el) => {
    for (let cur = el; cur; cur = cur.parentElement) {
      const c = color(getComputedStyle(cur).backgroundColor)
      if (c && c.a > 0.5) return c
    }
    return { r: 255, g: 255, b: 255, a: 1 }
  }
  // Tailwind 的 ring / shadow 工具类没生效时也会留一串全透明的 box-shadow，不算阴影
  const shadowed = (s) => s.boxShadow !== 'none' &&
    (s.boxShadow.match(/(?:rgba?|color|oklab|oklch|hsla?)\([^)]*\)|#[0-9a-f]{3,8}\b/gi) || []).some((c) => (color(c)?.a || 0) > 0.04)
  // 翻转卡片的背面（rotateY(180deg) + backface-visibility: hidden）checkVisibility 认不出：
  // 把它和祖先的变换乘起来，z 轴翻到背面朝外的就是看不见的那一面
  const facing = new Map()
  const facingAway = (el) => {
    for (let cur = el; cur && cur !== document.body; cur = cur.parentElement) {
      if (getComputedStyle(cur).backfaceVisibility !== 'hidden') continue
      if (!facing.has(cur)) {
        let m = new DOMMatrix()
        for (let up = cur; up && up !== document.documentElement; up = up.parentElement) {
          const t = getComputedStyle(up).transform
          if (t && t !== 'none') m = new DOMMatrix(t).multiply(m)
        }
        facing.set(cur, m.m33 < 0)
      }
      if (facing.get(cur)) return true
    }
    return false
  }
  const visible = (el) => el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }) &&
    Number(getComputedStyle(el).opacity) > 0.05 && !facingAway(el)
  const near = (b) => b.right > F.left - 2 && b.left < F.right + 2 && b.bottom > F.top - 2 && b.top < F.bottom + 2

  // 元素的内容被哪些祖先的 overflow 裁掉：逐层取交集，按父元素记（兄弟共用一份）
  const NONE = { left: -Infinity, top: -Infinity, right: Infinity, bottom: Infinity }
  const clips = new Map()
  const clipOf = (el) => {
    const parent = el.parentElement
    if (!parent) return NONE
    if (!clips.has(parent)) {
      let clip = clipOf(parent)
      const s = getComputedStyle(parent)
      const x = s.overflowX !== 'visible'
      const y = s.overflowY !== 'visible'
      if (x || y) {
        const b = parent.getBoundingClientRect()
        clip = {
          left: x ? Math.max(clip.left, b.left) : clip.left,
          right: x ? Math.min(clip.right, b.right) : clip.right,
          top: y ? Math.max(clip.top, b.top) : clip.top,
          bottom: y ? Math.min(clip.bottom, b.bottom) : clip.bottom
        }
      }
      clips.set(parent, clip)
    }
    return clips.get(parent)
  }
  const clipped = (r, el, min = 1) => {
    const c = clipOf(el)
    const v = { left: Math.max(r.left, c.left), top: Math.max(r.top, c.top), right: Math.min(r.right, c.right), bottom: Math.min(r.bottom, c.bottom) }
    return v.right - v.left >= min && v.bottom - v.top >= min ? v : null
  }
  // 一个方向上：out = 不在框里，in = 整个在框里，span = 两头都出框（横穿），start / end = 前端 / 后端出框。
  // 卡片、胶囊、图标贴着框边也像被切了（看不见它那条边和留白），要离框边 inset 以上才算整个在框里
  const axis = (a0, a1, lo, hi, inset) => {
    if (a1 <= lo + EPS || a0 >= hi - EPS) return 'out'
    const head = a0 >= lo + inset
    const tail = a1 <= hi - inset
    if (head && tail) return 'in'
    if (!head && !tail) return 'span'
    return head ? 'end' : 'start'
  }
  const describe = (el) => {
    const cls = typeof el.className === 'string' ? el.className.trim().split(/\s+/).slice(0, 2).join('.') : ''
    return `<${el.tagName.toLowerCase()}${cls ? `.${cls}` : ''}>`
  }

  const scan = () => {
    const items = []
    const range = document.createRange()
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const parent = node.parentElement
      if (!parent || !node.textContent.trim() || ['SCRIPT', 'STYLE', 'TEXTAREA', 'NOSCRIPT'].includes(parent.tagName)) continue
      if (parent.closest('svg') && !parent.closest('foreignObject')) continue
      const pb = parent.getBoundingClientRect()
      // 读屏专用的 sr-only 文本是 1px 的裁切框，界面上看不见
      if (pb.width <= 1 || pb.height <= 1 || !near(pb) || !visible(parent)) continue
      range.selectNodeContents(node)
      for (const r of range.getClientRects()) {
        const rect = r.width >= 1 && r.height >= 1 && near(r) ? clipped(r, parent) : null
        if (rect) items.push({ kind: 'text', el: parent, rect, label: node.textContent.trim().slice(0, 16) })
      }
    }
    for (const el of document.body.querySelectorAll('*')) {
      const tag = el.tagName.toLowerCase()
      if (el.closest('svg') && tag !== 'svg') continue
      const b = el.getBoundingClientRect()
      if (b.width < 1 || b.height < 1 || !near(b) || !visible(el)) continue
      // iframe 自己多半没边没底（卡片正反面白底贴白底），框边压过它空着的那截看不出来，
      // 它里面的字另由 iframeCuts 进去查；有边框 / 底色的照下面的规矩当卡片查
      if (['img', 'canvas', 'video', 'svg', 'input'].includes(tag)) {
        const rect = clipped(b, el)
        if (rect) items.push({ kind: tag, el, rect, label: describe(el) })
        continue
      }
      const s = getComputedStyle(el)
      const sides = ['Top', 'Right', 'Bottom', 'Left'].filter((side) => {
        const c = color(s[`border${side}Color`])
        return parseFloat(s[`border${side}Width`]) >= 0.5 && c && c.a > 0.12
      })
      const bg = color(s.backgroundColor)
      const distinct = Boolean(bg && bg.a > 0.2 && Math.abs(lum(bg) - lum(bgOf(el.parentElement || el))) > 0.015)
      if (distinct || sides.length >= 3 || shadowed(s)) {
        const rect = clipped(b, el)
        if (rect) items.push({ kind: 'panel', el, rect, label: describe(el) })
        continue
      }
      for (const side of sides) {
        const w = parseFloat(s[`border${side}Width`])
        const line = {
          Top: { left: b.left, right: b.right, top: b.top, bottom: b.top + w },
          Bottom: { left: b.left, right: b.right, top: b.bottom - w, bottom: b.bottom },
          Left: { left: b.left, right: b.left + w, top: b.top, bottom: b.bottom },
          Right: { left: b.right - w, right: b.right, top: b.top, bottom: b.bottom }
        }[side]
        const rect = clipped(line, el, 0.4)
        if (rect) items.push({ kind: 'line', el, rect, label: `${describe(el)} ${side}` })
      }
    }
    const live = []
    for (const it of items) {
      const inset = it.kind === 'text' ? -EPS : 3
      it.h = axis(it.rect.left, it.rect.right, F.left, F.right, inset)
      it.v = axis(it.rect.top, it.rect.bottom, F.top, F.bottom, inset)
      if (it.h === 'out' || it.v === 'out') continue
      it.cut = it.kind === 'text' ? it.h !== 'in' || it.v !== 'in' : [it.h, it.v].some((a) => a === 'start' || a === 'end')
      live.push(it)
    }
    return live
  }
  const report = (list) => list.map((it) => ({
    kind: it.kind,
    label: it.label,
    edges: [
      ...(it.h === 'start' || it.h === 'span' ? ['左'] : []),
      ...(it.h === 'end' || it.h === 'span' ? ['右'] : []),
      ...(it.v === 'start' || it.v === 'span' ? ['顶'] : []),
      ...(it.v === 'end' || it.v === 'span' ? ['底'] : [])
    ].join(''),
    rect: Object.fromEntries(Object.entries(it.rect).map(([k, v]) => [k, Math.round(v)]))
  }))

  const live = scan()
  const cuts = live.filter((it) => it.cut)
  if (!trim) return { cuts: report(cuts), items: report(live) }

  // 字藏它所在的整段（最近的块级祖先），别的按元素藏
  const unitOf = (it) => {
    if (it.kind !== 'text') return it.el
    for (let cur = it.el; cur && cur !== document.body; cur = cur.parentElement) {
      if (!getComputedStyle(cur).display.startsWith('inline')) return cur
    }
    return it.el
  }
  const boundsOf = (el) => clipped(el.getBoundingClientRect(), el, 0) || el.getBoundingClientRect()
  const hide = new Set()
  // 底边：从切开的那一块的顶上起往下全藏；某段的前几行在线上面，就把线提到段首再来一遍
  let floor = Math.min(...cuts.filter((it) => it.v === 'end').map((it) => it.rect.top))
  for (let moved = floor < Infinity; moved;) {
    moved = false
    for (const it of live) {
      if (it.rect.top < floor - EPS) continue
      const unit = unitOf(it)
      const top = boundsOf(unit).top
      // 行线 / 分隔线的元素从线上面就开始了（比如整节的下边线）：线留着，不为它把整节藏掉
      if (it.kind === 'line' && !it.cut && top < floor - EPS) continue
      if (top < floor - EPS) {
        floor = Math.max(top, F.top)
        moved = true
      }
      hide.add(unit)
    }
  }
  // 顶边：反过来，从切开的那一块的底下起往上全藏
  let ceiling = Math.max(...cuts.filter((it) => it.v === 'start').map((it) => it.rect.bottom))
  for (let moved = ceiling > -Infinity; moved;) {
    moved = false
    for (const it of live) {
      if (it.rect.bottom > ceiling + EPS) continue
      const unit = unitOf(it)
      const bottom = boundsOf(unit).bottom
      if (it.kind === 'line' && !it.cut && bottom > ceiling + EPS) continue
      if (bottom > ceiling + EPS) {
        ceiling = Math.min(bottom, F.bottom)
        moved = true
      }
      hide.add(unit)
    }
  }
  for (const el of hide) el.setAttribute('data-fa-trim', '')
  if (hide.size && !document.getElementById('fa-trim-style')) {
    const style = document.createElement('style')
    style.id = 'fa-trim-style'
    // 带 transition 的元素（按钮多是 transition-all）visibility 要等过渡播完才变，截图时还看得见
    style.textContent = '[data-fa-trim],[data-fa-trim] *{visibility:hidden!important;transition:none!important}'
    document.head.appendChild(style)
  }
  return {
    cuts: report(cuts),
    trimmed: {
      count: hide.size,
      top: ceiling > -Infinity ? Math.round(ceiling - F.top) : 0,
      bottom: floor < Infinity ? Math.round(F.bottom - floor) : 0
    },
    remaining: report(scan().filter((it) => it.cut))
  }
}

/**
 * 卡片正反面渲染在 iframe 里，主文档的 frameCuts 看不见里面的字：按 iframe 逐个进去再查一遍。
 * 翻到背面、被别的卡挡住的 iframe 用中心点命中测试排除；里面被切开的只报不藏
 */
async function iframeCuts(page, win) {
  const cuts = []
  for (const handle of await page.$$('iframe')) {
    const sub = await handle.evaluate((frame, win) => {
      const b = frame.getBoundingClientRect()
      if (b.right <= win.x || b.left >= win.x + win.width || b.bottom <= win.y || b.top >= win.y + win.height) return null
      const cx = Math.min(Math.max(b.left + b.width / 2, win.x + 1), win.x + win.width - 1)
      const cy = Math.min(Math.max(b.top + b.height / 2, win.y + 1), win.y + win.height - 1)
      if (document.elementFromPoint(cx, cy) !== frame || !frame.clientWidth) return null
      const sx = b.width / frame.clientWidth
      const sy = b.height / frame.clientHeight
      return { x: (win.x - b.left) / sx, y: (win.y - b.top) / sy, width: win.width / sx, height: win.height / sy }
    }, win)
    const frame = sub && (await handle.contentFrame())
    if (frame) cuts.push(...(await frame.evaluate(frameCuts, { win: sub, trim: false })).cuts)
  }
  return cuts
}

/** --check 用：取景框描红、切开的东西涂橙，连同框外一圈截下来，看得出是哪里被切、框该往哪挪 */
async function snapContext(page, win, cuts, file) {
  await page.evaluate(({ win, cuts }) => {
    const layer = document.createElement('div')
    layer.id = 'fa-check'
    layer.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:2147483647'
    const box = (r, css) => {
      const d = document.createElement('div')
      d.style.cssText = `position:fixed;left:${r.left}px;top:${r.top}px;width:${r.right - r.left}px;height:${r.bottom - r.top}px;${css}`
      layer.appendChild(d)
    }
    for (const cut of cuts) box(cut.rect, 'background:rgba(255,120,0,.25);outline:1px solid #f70')
    box({ left: win.x, top: win.y, right: win.x + win.width, bottom: win.y + win.height }, 'outline:2px solid #e00')
    document.body.appendChild(layer)
  }, { win, cuts })
  const view = page.viewportSize()
  const x = Math.max(0, win.x - 96)
  const y = Math.max(0, win.y - 96)
  const width = Math.min(view.width, win.x + win.width + 96) - x
  const height = Math.min(view.height, win.y + win.height + 96) - y
  await page.screenshot({ path: file, scale: 'css', clip: { x, y, width, height } })
  await page.evaluate(() => document.getElementById('fa-check').remove())
}

async function main() {
  const args = process.argv.slice(2)
  // --check：只看取景框有没有切开东西，上下文图放临时目录，不写产物
  const check = args.includes('--check')
  const only = new Set(args.filter((a) => !a.startsWith('--')))
  const scenes = SCENES.filter((s) => !only.size || only.has(s.name))
  if (!scenes.length) throw new Error(`没有这个场景：${[...only].join(', ')}`)

  await mkdir(OUT, { recursive: true })
  const tmp = await mkdtemp(join(tmpdir(), 'features-live-'))
  const checkDir = join(tmpdir(), 'features-check')
  if (check) await mkdir(checkDir, { recursive: true })
  const server = await serve(PUBLIC)
  const browser = await chromium.launch({ executablePath: CHROME })
  try {
    for (const spec of scenes) {
      const shots = {}
      const trims = {}
      // 取景框尺寸和首页组件共用一份（utils/feature-shot.js）
      const size = shotSize(spec.name)
      for (const theme of ['light', 'dark']) {
        const context = await browser.newContext({
          viewport: spec.viewport || { width: 1280, height: 1100 },
          deviceScaleFactor: 2,
          locale: 'zh-CN',
          colorScheme: theme
        })
        if (spec.init) await context.addInitScript(spec.init)
        const page = await context.newPage()
        await page.goto(`${server.origin}/demo/index.html?theme=${theme}&scene=${spec.scene}`, { waitUntil: 'load' })
        await waitUntilSettled(page, spec.ready || spec.anchor)
        if (spec.prepare) {
          await spec.prepare(page)
          await waitUntilSettled(page, spec.anchor)
        }
        // 浮在会话上的「回到底部」按钮不是界面内容
        await page.addStyleTag({ content: 'button[aria-label="回到底部"]{visibility:hidden!important}' })
        const locate = { anchor: spec.anchor, offset: spec.offset, size }
        await page.evaluate(locateWindow, locate)
        await page.waitForTimeout(1000)
        const win = await page.evaluate(locateWindow, { ...locate, settled: true })
        const where = `${spec.name}（${theme}）`
        if (check) {
          const { cuts, items } = await page.evaluate(frameCuts, { win, trim: false })
          await writeFile(join(checkDir, `${spec.name}-${theme}-items.json`), JSON.stringify(items, null, 1))
          await snapContext(page, win, cuts, join(checkDir, `${spec.name}-${theme}-context.png`))
          const view = page.viewportSize()
          console.log(`[check] ${where} 窗口 ${view.width}×${view.height}，取景框 (${Math.round(win.x)}, ${Math.round(win.y)}) ${win.width}×${win.height}，切开 ${cuts.length} 处`)
          for (const cut of cuts) console.log(`  ${cut.edges} ${cut.kind} ${cut.label} ${JSON.stringify(cut.rect)}`)
        }
        // 框边切开的：上下两边的藏掉、框里留白；左右两边切开的（或者藏掉一大片）说明框没对准，这一扇不出
        const { trimmed, remaining } = await page.evaluate(frameCuts, { win, trim: true })
        trims[theme] = trimmed
        if (trimmed.count) console.log(`[features] ${where} 藏掉框边切开的 ${trimmed.count} 块，框顶留白 ${trimmed.top}px、框底留白 ${trimmed.bottom}px`)
        const problems = [...remaining, ...(await iframeCuts(page, win))].map((cut) => `${cut.edges}边切开 ${cut.kind} ${cut.label}`)
        // 截窗口外面那截时 Chrome 会临时把页面撑大重排，截出来的就不是量过的这一版了
        const view = page.viewportSize()
        if (win.x < 0 || win.y < 0 || win.x + win.width > view.width || win.y + win.height > view.height) {
          problems.push(`取景框越出了 ${view.width}×${view.height} 的窗口`)
        }
        if (trimmed.top + trimmed.bottom > win.height * 0.4) {
          problems.push(`藏掉的高度占了取景框的 ${Math.round(((trimmed.top + trimmed.bottom) / win.height) * 100)}%，框没对准完整的一块`)
        }
        // 深浅两张截图是同一个取景框，主题一换内容就变了说不过去：两边藏掉的必须一样
        const light = trims.light
        if (theme === 'dark' && light && ['count', 'top', 'bottom'].some((key) => light[key] !== trimmed[key])) {
          problems.push(`深浅两色藏掉的不一样（浅色 ${light.count} 块 / 顶 ${light.top} / 底 ${light.bottom}，深色 ${trimmed.count} 块 / 顶 ${trimmed.top} / 底 ${trimmed.bottom}））`)
        }
        if (check) {
          for (const problem of problems) console.log(`  ✗ ${problem}`)
          await page.screenshot({ path: join(checkDir, `${spec.name}-${theme}-frame.png`), clip: win })
          await context.close()
          continue
        }
        if (problems.length) throw new Error(`${where} 取景框切开了界面：\n  ${problems.join('\n  ')}`)
        const png = join(tmp, `${spec.name}-${theme}.png`)
        await page.screenshot({ path: png, clip: win })
        shots[theme] = png
        await context.close()
      }
      if (check) continue
      for (const [theme, png] of Object.entries(shots)) {
        execFileSync(CWEBP, ['-quiet', '-q', '80', '-m', '6', png, '-o', join(OUT, `${spec.name}-${theme}.webp`)])
      }
      console.log(`[features] ${spec.name}（${spec.scene}）`)
    }
  } finally {
    await browser.close()
    server.close()
    await rm(tmp, { recursive: true, force: true })
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
