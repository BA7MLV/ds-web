/**
 * 首页功能区六扇窗：从演示里的真实界面生成字符画。
 *
 * gen-features-ascii.mjs 画的是解析几何符号（纸 + 气泡、卷子 + 徽章……），和产品界面无关。
 * 这里画的是产品本身：在同源演示镜像（docs/public/demo）里打开对应剧本会话、等它播完，
 * 把取景框里每个面板 / 卡片 / 胶囊的边框、每个字的位置和轻重读出来，落进等宽网格 ——
 * 框线用 ╭─╮│ 这类字符，字就是界面上的字。
 *
 * 产物（docs/public/features/）：
 *   <name>.json         字符网格，FeatureAscii.vue 画到 canvas 上，切场景时从乱码解码成画面
 *   <name>-light.webp   取景框的真实截图（浅色 / 深色各一），悬停时淡入，和字符画逐格对齐
 *   <name>-dark.webp
 *
 * 一格对应界面上 8 × 16 CSS px：正文半角字约 7–8px 宽，中文约 13–15px，
 * 所以半角字一格一个、中文占两格，不会两个字挤进同一格被吞掉。
 *
 * 用法：
 *   node scripts/gen-features-live.mjs              # 全部场景
 *   node scripts/gen-features-live.mjs chat quiz    # 只重出指定场景
 *   node scripts/gen-features-live.mjs --preview    # 另把字符画渲染成 PNG 放到系统临时目录，方便目检
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

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const PUBLIC = join(ROOT, 'docs/public')
const OUT = join(PUBLIC, 'features')
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const CWEBP = process.env.CWEBP || 'cwebp'

const GRID = { cols: 74, rows: 26, cellW: 8, cellH: 16 }

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
  // 取景框对准整张图的外框居中，再往右挪 24px：叶子的字在网格里比界面上宽，右边要多留点
  {
    name: 'mindmap',
    scene: 'demo-pdf-deepread',
    ready: { selector: '.react-flow__node', text: '数据并行训练' },
    prepare: prepareMindmap,
    anchor: { selector: '.react-flow__node', union: true, center: true },
    offset: { x: 24, y: 0 }
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
  // 双语表开 912 宽：取景框右缘正好在窗口边上、左缘不压侧栏，卡片（536 宽）两边各留 28px。
  // 表里的字只有 13px，网格一格按 15–16px 的正文定，两栏排进网格都比界面宽两成：
  // 英文栏撞上译文栏截成 …，译文栏伸到卡片右边框外的部分也截在框边上（见 extractGrid 画框那段）
  { name: 'reading', scene: 'demo-bilingual', viewport: { width: 912, height: 1000 }, anchor: { text: '英文原文', block: true }, offset: { x: -28, y: -12 } },
  // 「使用流程」两张卡（StepFlow.vue）：窄卡 40 列、宽卡 74 列，行数按卡片标题下面剩的高度定。
  // 窄卡用手机宽度打开，回答按 40 列左右自然折行，取景框里不会有被拦腰截断的句子。
  // 取景从「怎样接到自己的学习中」起：正文引的是学习档案里的记忆 [忆1] [忆2]，
  // 下面接着 AI 生成的研究路径对照卡 —— 正好是这张卡讲的「答案带出处、记得你的偏好」
  {
    name: 'flow-think',
    scene: 'demo-spaced-repetition',
    grid: { cols: 40, rows: 21 },
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
    grid: { cols: 74, rows: 19 },
    viewport: { width: 920, height: 640 },
    anchor: { text: '今日复习' },
    // 往左多让 8px：取景框右缘正好压着滚动区的边线，会画成一条贯穿的竖线
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
    // 和演示卡片同一段话，只在逗号处多断一行：一整行比取景框宽，居中排时两头都会被切掉
    back: '保留到三阶。\n展开 sin x = x − x³/6 + o(x³)，\n相减后首个非零项是 −x³/6，除以 x³ 得极限 −1/6。'
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
 * 截图和字符画只取框里那一块，框边落在一行字、一张卡片、一个胶囊或图标中间，
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
 * 翻到背面、被别的卡挡住的 iframe 用中心点命中测试排除（和 extractFrames 一样）；里面被切开的只报不藏
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

/**
 * 在页面（或 iframe）里跑：把取景框里的界面读成字符网格。
 *
 * 先字后框：
 *   1. 字：逐字取位置，半角一格、全角（按 Unicode 东亚宽字符判断）两格，第二格记 \u0000。
 *      同一行里字按顺序往右排，取整造成的一格空隙会合上，真空格保留一格，
 *      别的元素已经占了的格子不覆盖、顺延；小字号的英文比格子窄，排不下的部分
 *      在所属块的右边界截断成 …，不挤进隔壁那一栏
 *   2. 框：有边框或明显底色的元素画框；不到两行高的胶囊 / 标签只在两端画 [ ]；
 *      框线那一行要是压到了字，就往外挪一行，挪不开就不画那条边。
 *      细长实心条（进度条）有色画 ━、灰轨道画 ─，图片画 ░；图标没有语义类名，只认按钮的 aria-label
 *      和「成功」绿色，认不出的不画
 *   3. 线：SVG 里只描边不填充的路径（导图连线）沿路径取点，记成形状
 *   4. 环：描边的圆（进度环）也记成形状；这两类都不进网格，交给运行时画成一串点
 * 墨色只记四档语义（d 淡 / n 正文 / b 重 / a 强调），真正的颜色由运行时按主题给。
 * 另外每行字记一个竖向偏移（offsets），运行时按它把字挪回界面上的真实高度。
 */
function extractGrid({ win, grid }) {
  const { cols, rows } = grid
  const cw = win.width / cols
  const ch = win.height / rows
  const chars = Array.from({ length: rows }, () => Array(cols).fill(' '))
  const inks = Array.from({ length: rows }, () => Array(cols).fill(' '))
  const taken = Array.from({ length: rows }, () => Array(cols).fill(false))

  // 计算样式里的颜色不全是 rgb()：Tailwind 4 的透明度修饰（bg-muted/40 这类）算出来是
  // color(srgb …) / oklab(…)，正则认不出就当没有底色，卡片的框就丢了。rgb() 走正则，别的交给 canvas 换算
  const swatch = document.createElement('canvas').getContext('2d', { willReadFrequently: true })
  const parsed = new Map()
  const parse = (color) => {
    if (!color) return null
    const m = color.match(/^rgba?\(([^)]+)\)$/)
    if (m) {
      const [r, g, b, a = 1] = m[1].split(/[ ,/]+/).filter(Boolean).map(Number)
      return { r, g, b, a }
    }
    if (!parsed.has(color)) {
      let value = null
      if (CSS.supports('color', color)) {
        swatch.clearRect(0, 0, 1, 1)
        swatch.fillStyle = color
        swatch.fillRect(0, 0, 1, 1)
        const [r, g, b, a] = swatch.getImageData(0, 0, 1, 1).data
        value = { r, g, b, a: a / 255 }
      }
      parsed.set(color, value)
    }
    return parsed.get(color)
  }
  const lum = ({ r, g, b }) => (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
  const sat = ({ r, g, b }) => {
    const max = Math.max(r, g, b)
    return max === 0 ? 0 : (max - Math.min(r, g, b)) / max
  }
  const colOf = (x) => Math.floor((x - win.x) / cw)
  const rowOf = (y) => Math.floor((y - win.y) / ch)
  const inside = (r, c) => r >= 0 && r < rows && c >= 0 && c < cols
  // checkVisibility 会顺着祖先查 opacity / visibility：应用把切走的视图留在 DOM 里保活，
  // 只在外层藏起来，单看元素自己的样式会把它们也画进来
  const visible = (el) => el.checkVisibility({ checkOpacity: true, checkVisibilityCSS: true }) &&
    Number(getComputedStyle(el).opacity) > 0.05
  const intersects = (b) => b.right > win.x && b.left < win.x + win.width && b.bottom > win.y && b.top < win.y + win.height
  const pageBg = parse(getComputedStyle(document.body).backgroundColor) || { r: 255, g: 255, b: 255, a: 1 }
  const bgOf = (el) => {
    for (let cur = el; cur; cur = cur.parentElement) {
      const c = parse(getComputedStyle(cur).backgroundColor)
      if (c && c.a > 0.5) return c
    }
    return pageBg.a > 0.5 ? pageBg : { r: 255, g: 255, b: 255, a: 1 }
  }
  const put = (r, c, chr, ink) => {
    if (!inside(r, c) || taken[r][c]) return
    chars[r][c] = chr
    inks[r][c] = ink
  }

  // ── 1. 字 ──
  // 先逐字量位置，按行切成「段」（界面上首尾相接的一串字，跨元素也算一段，比如粗体接正文），
  // 再逐段往网格里排：段内连续排，取整空隙合上、真空格留一格；一段最多排到下一段的起点，
  // 排不下就在末尾换成 …（表格两栏、按钮组之间不会互相挤占），排到取景框边上就直接切掉。
  // 胶囊 / 标签（不到两行高、有边框或底色的小块）跟着字一起排，前后各加一格 [ ]，
  // 括号才不会因为字被挤开而和字错位。
  const WIDE = /[\u1100-\u115f\u2e80-\u303e\u3041-\u33ff\u3400-\u4dbf\u4e00-\u9fff\ua000-\ua4cf\uac00-\ud7a3\uf900-\ufaff\ufe30-\ufe4f\uff00-\uff60\uffe0-\uffe6]/
  const inkOf = (el) => {
    const s = getComputedStyle(el)
    const color = parse(s.color) || { r: 0, g: 0, b: 0, a: 1 }
    if (sat(color) > 0.45 && color.a > 0.5) return 'a'
    if ((Number(s.fontWeight) || 400) >= 600 || parseFloat(s.fontSize) >= 17) return 'b'
    return color.a < 0.75 || Math.abs(lum(color) - lum(bgOf(el))) < 0.5 ? 'd' : 'n'
  }
  const surface = (el, threshold = 0.035) => {
    const s = getComputedStyle(el)
    const sides = ['Top', 'Right', 'Bottom', 'Left'].filter((side) => {
      const c = parse(s[`border${side}Color`])
      return parseFloat(s[`border${side}Width`]) >= 0.5 && c && c.a > 0.12
    })
    const bg = parse(s.backgroundColor)
    const distinct = Boolean(bg && bg.a > 0.2 && Math.abs(lum(bg) - lum(bgOf(el.parentElement || el))) > threshold)
    return { s, sides, bg, distinct, accent: Boolean(bg && bg.a > 0.2 && sat(bg) > 0.4) }
  }
  // 胶囊的底色往往只比卡片深一点点（浅灰标签），门槛放低
  const chips = new Map()
  for (const el of document.body.querySelectorAll('*')) {
    const b = el.getBoundingClientRect()
    if (b.height === 0 || b.height >= ch * 1.7 || b.width < cw * 2 || !intersects(b) || !el.textContent.trim()) continue
    const { sides, distinct, accent, bg } = surface(el, 0.015)
    if (sides.length >= 3 || distinct) chips.set(el, { ink: accent || (bg && sat(bg) > 0.15 && bg.a > 0.2) ? 'a' : 'd' })
  }
  const chipOf = (el) => {
    // 导图节点的字套了五六层 div / span 才到带边框的那层，往上多找几层
    for (let cur = el, depth = 0; cur && cur !== document.body && depth < 8; cur = cur.parentElement, depth += 1) {
      if (chips.has(cur)) return chips.get(cur)
    }
    return null
  }
  const found = []
  const range = document.createRange()
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const parent = node.parentElement
    if (!parent || !visible(parent) || ['SCRIPT', 'STYLE', 'TEXTAREA'].includes(parent.tagName)) continue
    if (parent.closest('svg') && !parent.closest('foreignObject')) continue
    // 读屏专用的 sr-only 文本（1px 裁切框，如「收到新消息」播报）界面上看不见
    const pb = parent.getBoundingClientRect()
    if (pb.width <= 1 || pb.height <= 1) continue
    const ink = inkOf(parent)
    const chip = chipOf(parent)
    const center = getComputedStyle(parent).textAlign === 'center'
    let space = false
    let i = 0
    // 按码点走：数学斜体这类字在 UTF-16 里占两个单元，按单元切会切成两半
    for (const chr of node.textContent) {
      const start = i
      i += chr.length
      if (/\s/.test(chr)) {
        space = true
        continue
      }
      range.setStart(node, start)
      range.setEnd(node, i)
      const b = range.getBoundingClientRect()
      if (b.width === 0 || !intersects(b)) continue
      found.push({ chr, ink, chip, center, wide: WIDE.test(chr), left: b.left, right: b.right, space, cy: b.top + b.height / 2 })
      space = false
    }
  }
  // 先按「视觉行」聚类再落格：同一行里的引用角标、胶囊字号小、基线低几像素，
  // 单按每个字的中心取整，赶上整行正好压在格线附近，角标就会掉到下一行去。
  // 竖向中心相差不到半格的算同一行，整行按中位数落进同一格
  found.sort((p, q) => p.cy - q.cy)
  const visualLines = []
  for (const g of found) {
    const line = visualLines[visualLines.length - 1]
    if (line && g.cy - line.first <= ch * 0.45) line.glyphs.push(g)
    else visualLines.push({ first: g.cy, glyphs: [g] })
  }
  const glyphRows = Array.from({ length: rows }, () => [])
  const rowSpans = Array(rows).fill(null)
  for (const line of visualLines) {
    const ys = line.glyphs.map((g) => g.cy).sort((p, q) => p - q)
    const cy = ys[Math.floor(ys.length / 2)]
    const left = Math.min(...line.glyphs.map((g) => g.left))
    const right = Math.max(...line.glyphs.map((g) => g.right))
    let r = rowOf(cy)
    // 小字号行距不到一格时两行会落进同一格、交错成一串：后一行顺延一格（只顺延一次）
    const span = rowSpans[r]
    if (span && left < span.right && right > span.left && r + 1 < rows && !rowSpans[r + 1]) r += 1
    if (r < 0 || r >= rows) continue
    const prev = rowSpans[r]
    rowSpans[r] = prev ? { left: Math.min(prev.left, left), right: Math.max(prev.right, right) } : { left, right }
    const dy = (cy - win.y) / ch - (r + 0.5)
    for (const g of line.glyphs) glyphRows[r].push({ ...g, dy })
  }
  // 界面行距多是 1.5–1.9 格，按格取整后行距会一会儿 1 格、一会儿 2 格。
  // 每段字记下它在界面上的真实高度（相对格心，单位是格高），画的时候挪回去，行距就和界面一样匀；
  // 最多挪 0.4 格，离上下的框线至少还隔着几个像素
  const median = (list) => [...list].sort((p, q) => p - q)[Math.floor(list.length / 2)]
  const clampDy = (dy) => Math.round(Math.max(-0.4, Math.min(0.4, dy)) * 100) / 100
  const runs = Array.from({ length: rows }, () => [])
  // 一段字排进网格要占几格，和下面逐字排的规则一致：空格 / 取整空隙算一格，胶囊两端各一格括号
  const layoutWidth = (list) => {
    let need = 0
    let prevRight = null
    let chip = null
    for (const g of list) {
      if (chip && g.chip !== chip) {
        need += 1
        chip = null
      }
      if (prevRight !== null && (g.space || g.left - prevRight > cw * 0.45)) need += 1
      if (g.chip && g.chip !== chip) {
        need += 1
        chip = g.chip
      }
      need += g.wide ? 2 : 1
      prevRight = g.right
    }
    return need + (chip ? 1 : 0)
  }
  for (let r = 0; r < rows; r += 1) {
    const glyphs = glyphRows[r].sort((p, q) => p.left - q.left)
    // 相邻两字之间的空白超过 3 格 = 换了一段（分栏、左右两端对齐的按钮组）；
    // 不到 3 格的（词间空格、一排标签之间的间距）留在同一段里，挤不下就整段顺延
    const segments = []
    for (const g of glyphs) {
      const seg = segments[segments.length - 1]
      if (seg && g.left - seg.right < cw * 3) {
        seg.glyphs.push(g)
        seg.right = Math.max(seg.right, g.right)
      } else {
        segments.push({ glyphs: [g], left: g.left, right: g.right })
      }
    }
    let rowEnd = 0
    segments.forEach((seg, j) => {
      const next = segments[j + 1]
      // 最多排到下一段起点那一格之前；隔得远（分栏）时再多留一格空
      const limit = next ? Math.max(colOf(next.left + cw / 2) - (next.left - seg.right > cw * 3 ? 1 : 0), 0) : cols
      let pos = Math.max(0, colOf(seg.left + cw / 2))
      // 居中的字（按钮、环心的百分比）按中心对齐：网格里中文两格 16px，比界面上宽，
      // 左对齐会整体往右偏出去
      if (seg.glyphs.filter((g) => g.center).length * 2 > seg.glyphs.length) {
        const need = layoutWidth(seg.glyphs)
        const mid = ((seg.left + seg.right) / 2 - win.x) / cw
        pos = Math.max(rowEnd ? rowEnd + 1 : 0, Math.round(mid - need / 2))
      }
      const run = { c0: pos, c1: pos, dy: clampDy(median(seg.glyphs.map((g) => g.dy))) }
      runs[r].push(run)
      let prevRight = null
      let chip = null
      const write = (chr, ink, wide = false) => {
        chars[r][pos] = chr
        inks[r][pos] = ink
        taken[r][pos] = true
        if (wide) {
          chars[r][pos + 1] = '\u0000'
          inks[r][pos + 1] = ink
          taken[r][pos + 1] = true
        }
        pos += wide ? 2 : 1
      }
      let overflow = false
      for (const g of seg.glyphs) {
        if (chip && g.chip !== chip) {
          if (pos + 1 <= limit) write(']', chip.ink)
          chip = null
        }
        if (prevRight !== null && (g.space || g.left - prevRight > cw * 0.45)) pos += 1
        const opening = g.chip && g.chip !== chip
        if (pos + (g.wide ? 2 : 1) + (opening ? 1 : 0) > limit) {
          overflow = true
          break
        }
        if (opening) {
          write('[', g.chip.ink)
          chip = g.chip
        }
        write(g.chr, g.ink, g.wide)
        prevRight = g.right
      }
      if (!overflow && chip && pos + 1 <= limit) write(']', chip.ink)
      if (overflow && limit < cols) {
        // 撞到下一段：把这一段最后一个字换成省略号
        let last = pos - 1
        while (last > 0 && chars[r][last] === ' ') last -= 1
        if (chars[r][last] === '\u0000') {
          chars[r][last] = ' '
          last -= 1
        }
        if (last >= 0 && taken[r][last]) chars[r][last] = '…'
      }
      run.c1 = pos
      rowEnd = Math.max(rowEnd, pos)
    })
  }
  // 上下两行的字在同一列范围里挨着时，挪完之后中心至少隔 0.9 格，不然就叠在一起了
  // （常见于一栏的长句在网格里排宽了、伸进隔壁那栏，而隔壁那栏的下一行字往上挪）
  for (let pass = 0; pass < 2; pass += 1) {
    for (let r = 0; r + 1 < rows; r += 1) {
      for (const upper of runs[r]) {
        for (const lower of runs[r + 1]) {
          if (Math.max(upper.c0, lower.c0) >= Math.min(upper.c1, lower.c1)) continue
          const short = 0.9 - (1 + lower.dy - upper.dy)
          if (short <= 0) continue
          upper.dy = clampDy(upper.dy - short / 2)
          lower.dy = clampDy(lower.dy + short / 2)
        }
      }
    }
  }
  // 每行一个数；同一行里几段字高度不一样（两栏行距不同）时记成 [[起始列, 偏移], …]
  const offsets = runs.map((list) => {
    if (!list.length) return null
    return list.every((run) => Math.abs(run.dy - list[0].dy) < 0.05) ? list[0].dy : list.map((run) => [run.c0, run.dy])
  })

  // 复选框（题目草稿的勾选）
  for (const box of document.querySelectorAll('input[type="checkbox"], [role="checkbox"]')) {
    const b = box.getBoundingClientRect()
    if (!intersects(b) || !visible(box)) continue
    const checked = box.checked || box.getAttribute('aria-checked') === 'true' || box.dataset.state === 'checked'
    const r = rowOf(b.top + b.height / 2)
    const c = colOf(b.left + b.width / 2)
    if (!inside(r, c)) continue
    chars[r][c] = checked ? '☑' : '☐'
    inks[r][c] = checked ? 'a' : 'd'
    taken[r][c] = true
  }

  // ── 2. 框 ──
  const rowHasText = (r, c0, c1) => {
    if (r < 0 || r >= rows) return false
    for (let c = Math.max(c0, 0); c <= Math.min(c1, cols - 1); c += 1) if (taken[r][c]) return true
    return false
  }
  const ICONS = [
    [/上一|prev/i, '‹'], [/下一|next/i, '›'], [/放大|zoom in/i, '+'], [/缩小|zoom out/i, '−'],
    [/播放|play/i, '▶'], [/翻转|flip/i, '⟲'], [/复制|copy/i, '⧉'], [/刷新|重新|retry/i, '↻'],
    [/关闭|close/i, '×'], [/go to card/i, '•']
  ]
  const labelOf = (el) => el?.getAttribute('aria-label') || el?.getAttribute('title') || ''
  const isGreen = (c) => c && c.g > c.r * 1.4 && c.g > c.b * 1.2 && sat(c) > 0.4
  // 判断方向要在屏幕坐标里看：展开 / 收起按钮常拿同一个向下箭头 rotate(180deg) 当向上用
  const onScreen = (el, q) => {
    const m = el.getScreenCTM()
    return m ? { x: m.a * q.x + m.c * q.y + m.e, y: m.b * q.x + m.d * q.y + m.f } : q
  }
  // 没有标签的单笔画图标看形状：起点、中点、终点围成的折角朝哪边，就是哪个方向的箭头
  const chevron = (svg) => {
    const strokes = svg.querySelectorAll('path, polyline')
    if (strokes.length !== 1 || !strokes[0].getTotalLength) return null
    const p = strokes[0]
    // 填充的轮廓（闭合、起止点重合）交给下面的 caret，这里按起止点判断会认错方向
    if (getComputedStyle(p).fill !== 'none') return null
    const total = p.getTotalLength()
    const [a, m, z] = [0, total / 2, total].map((len) => onScreen(p, p.getPointAtLength(len)))
    const span = Math.max(Math.abs(a.x - z.x), Math.abs(a.y - z.y))
    if (Math.abs(a.x - z.x) < span * 0.2 && Math.abs(m.x - a.x) > span * 0.25) return m.x < a.x ? '‹' : '›'
    if (Math.abs(a.y - z.y) < span * 0.2 && Math.abs(m.y - a.y) > span * 0.25) return m.y > a.y ? '⌄' : '⌃'
    return null
  }
  // 填充轮廓的箭头（Phosphor 的 CaretLeft 这类）是闭合路径，起止点重合，上面那招不灵：
  // 沿轮廓取点，尖头那一侧最外缘的点挤在中线附近，另一侧最外缘是上下两个端点、拉得很开
  const caret = (svg) => {
    const shapes = svg.querySelectorAll('path')
    if (shapes.length !== 1 || !shapes[0].getTotalLength) return null
    const p = shapes[0]
    const total = p.getTotalLength()
    const pts = Array.from({ length: 48 }, (_, i) => onScreen(p, p.getPointAtLength((total * i) / 48)))
    const xs = pts.map((q) => q.x)
    const ys = pts.map((q) => q.y)
    const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)]
    const w = x1 - x0
    const h = y1 - y0
    if (!w || !h) return null
    const spread = (list, key) => (list.length ? Math.max(...list.map((q) => q[key])) - Math.min(...list.map((q) => q[key])) : 0)
    const left = spread(pts.filter((q) => q.x < x0 + w * 0.1), 'y')
    const right = spread(pts.filter((q) => q.x > x1 - w * 0.1), 'y')
    const top = spread(pts.filter((q) => q.y < y0 + h * 0.1), 'x')
    const bottom = spread(pts.filter((q) => q.y > y1 - h * 0.1), 'x')
    if (left < h * 0.3 && right > h * 0.6) return '‹'
    if (right < h * 0.3 && left > h * 0.6) return '›'
    if (top < w * 0.3 && bottom > w * 0.6) return '⌃'
    if (bottom < w * 0.3 && top > w * 0.6) return '⌄'
    return null
  }
  const iconGlyph = (svg) => {
    const named = ICONS.find(([re]) => re.test(labelOf(svg.closest('button, [role="button"], a'))))
    if (named) return named[1]
    // 「成功」绿：步骤完成、执行完成这类对勾
    if (isGreen(parse(getComputedStyle(svg).color))) return '✓'
    const button = svg.closest('button, [role="button"]')
    if (!button) return null
    // 填充轮廓只认纯图标按钮（轮播的左右箭头）：带字的按钮里多是下载、列表这类图标，会被认成箭头
    return chevron(svg) || (button.textContent.trim() ? null : caret(svg))
  }
  const blocks = []
  const frames = []
  for (const el of document.body.querySelectorAll('*')) {
    const tag = el.tagName.toLowerCase()
    if (el.closest('svg') && tag !== 'svg') continue
    if (chips.has(el)) continue
    const b = el.getBoundingClientRect()
    if (b.width === 0 || b.height === 0 || !intersects(b) || !visible(el)) continue
    if (b.left <= win.x && b.right >= win.x + win.width && b.top <= win.y && b.bottom >= win.y + win.height) continue
    if (tag === 'img' || tag === 'canvas' || tag === 'video') {
      blocks.push({ kind: 'image', b })
      continue
    }
    if (tag === 'iframe') {
      // 卡片正反面：只框看得见的那一面（背面、被挡住的用中心点命中测试排除）。
      // 取景框边压过的不框：卡片和底色同色，截图上看不出边，字符画里画半个框反倒像被切了
      const whole = b.left >= win.x && b.right <= win.x + win.width && b.top >= win.y && b.bottom <= win.y + win.height
      const cx = Math.min(Math.max(b.left + b.width / 2, win.x + 1), win.x + win.width - 1)
      const cy = Math.min(Math.max(b.top + b.height / 2, win.y + 1), win.y + win.height - 1)
      if (whole && document.elementFromPoint(cx, cy) === el) frames.push(b)
      continue
    }
    if (tag === 'svg') {
      const glyph = b.width <= 28 && b.height <= 28 ? iconGlyph(el) : null
      if (glyph) blocks.push({ kind: 'icon', b, glyph })
      continue
    }
    const { s, sides, bg, distinct, accent } = surface(el)
    const named = (tag === 'button' || el.getAttribute('role') === 'button') && ICONS.find(([re]) => re.test(labelOf(el)))
    if (named && b.width <= cw * 7) {
      blocks.push({ kind: 'icon', b, glyph: named[1], ink: named[1] === '•' ? 'd' : 'n' })
    } else if (b.width <= 22 && b.height <= 22 && Math.abs(b.width - b.height) < 4 && distinct && accent) {
      blocks.push({ kind: 'icon', b, glyph: isGreen(bg) ? '✓' : '●', ink: 'a' })
    } else if (b.width <= 14 && b.height <= 14 && distinct) {
      blocks.push({ kind: 'icon', b, glyph: '•', ink: 'd' })
    } else if (b.height < ch * 0.6 && b.width > cw * 2 && distinct) {
      blocks.push({ kind: 'bar', b, accent })
    } else if (sides.length >= 3 || distinct) {
      if (b.height >= ch * 1.7) blocks.push({ kind: 'box', b, accent, round: parseFloat(s.borderTopLeftRadius) >= 6 })
    } else if (sides.length === 1 && (sides[0] === 'Bottom' || sides[0] === 'Top') && b.width > cw * 6) {
      // 只有一条横边的（表格行线、分隔线）画成一道横线
      blocks.push({ kind: 'rule', b, at: sides[0] === 'Bottom' ? b.bottom : b.top })
    }
  }
  // 轮播里旁边那张卡缩小、错开叠在后面，外框和正中那张交叠，画出来是两个框互相穿过、竖线切进字里：
  // 从大到小，和已经框了的卡片相交的就不框（字照样画）
  const framed = []
  for (const b of frames.sort((p, q) => q.width * q.height - p.width * p.height)) {
    if (framed.some((f) => b.left < f.right && b.right > f.left && b.top < f.bottom && b.bottom > f.top)) continue
    framed.push(b)
    blocks.push({ kind: 'box', b, round: true })
  }
  // 字比框宽一点点时（界面字号大于格子），框的右边往外让到字后面
  const textEnd = (r0, r1, c0, c1) => {
    let end = c1 - 1
    for (let r = Math.max(r0, 0); r <= Math.min(r1, rows - 1); r += 1) {
      for (let c = Math.max(c0, 0); c <= Math.min(c1 + 3, cols - 1); c += 1) if (taken[r][c]) end = Math.max(end, c)
    }
    return end
  }
  // 让到取景框外面就画不出右边了，框像被切开一样：那就把框里伸到 edge 列及以后的字截掉、
  // 末尾换成 …（终端里的表格单元格放不下也是这么截），右边照原位画
  const clipRight = (r0, r1, c0, edge) => {
    for (let r = Math.max(r0, 0); r <= Math.min(r1, rows - 1); r += 1) {
      if (!taken[r].slice(edge).some(Boolean)) continue
      // 截在宽字中间：前半个也去掉，不留半个字
      const from = chars[r][edge] === '\u0000' ? edge - 1 : edge
      for (let c = from; c < cols; c += 1) {
        chars[r][c] = ' '
        inks[r][c] = ' '
        taken[r][c] = false
      }
      let last = from - 1
      while (last > c0 && chars[r][last] === ' ') last -= 1
      if (chars[r][last] === '\u0000') {
        chars[r][last] = ' '
        last -= 1
      }
      if (last >= c0 && taken[r][last]) chars[r][last] = '…'
    }
  }
  // 大块先画，小块后画，嵌套的框不会被外框盖掉
  blocks.sort((p, q) => q.b.width * q.b.height - p.b.width * p.b.height)
  for (const { kind, b, round, accent, glyph, ink, at } of blocks) {
    const c0 = Math.round((b.left - win.x) / cw)
    let c1 = Math.round((b.right - win.x) / cw) - 1
    let r0 = Math.round((b.top - win.y) / ch)
    let r1 = Math.round((b.bottom - win.y) / ch) - 1
    const midRow = rowOf((b.top + b.bottom) / 2)
    if (kind === 'icon') {
      put(midRow, colOf((b.left + b.right) / 2), glyph, ink || (glyph === '✓' ? 'a' : 'n'))
      continue
    }
    if (kind === 'image') {
      for (let r = r0; r <= r1; r += 1) for (let c = c0; c <= c1; c += 1) put(r, c, '░', 'd')
      continue
    }
    if (kind === 'bar') {
      // 有色的是填充段，画粗线；灰的是空轨道（还没开始的进度），只画一道淡细线，不然看着像已经满了
      for (let c = c0; c <= c1; c += 1) put(midRow, c, accent ? '━' : '─', accent ? 'a' : 'd')
      continue
    }
    if (kind === 'rule') {
      // 行线落在两行字之间：取离它最近、又没压到字的那一行
      const near = Math.round((at - win.y) / ch) - 1
      const r = !rowHasText(near, c0, c1) ? near : !rowHasText(near + 1, c0, c1) ? near + 1 : null
      if (r !== null) for (let c = c0; c <= c1; c += 1) put(r, c, '─', 'd')
      continue
    }
    if (c1 - c0 < 2) continue
    const end = textEnd(r0 + 1, r1 - 1, c0 + 1, c1)
    if (end + 1 < cols) c1 = end + 1
    else clipRight(r0 + 1, r1 - 1, c0 + 1, c1)
    // 框线压到字就往外挪一行，挪不开就不画这条边
    const top = !rowHasText(r0, c0, c1) ? r0 : !rowHasText(r0 - 1, c0, c1) ? r0 - 1 : null
    const bottom = !rowHasText(r1, c0, c1) ? r1 : !rowHasText(r1 + 1, c0, c1) ? r1 + 1 : null
    r0 = top ?? r0
    r1 = bottom ?? r1
    const [tl, tr, bl, br] = round ? ['╭', '╮', '╰', '╯'] : ['┌', '┐', '└', '┘']
    for (let c = c0 + 1; c < c1; c += 1) {
      if (top !== null) put(r0, c, '─', 'd')
      if (bottom !== null) put(r1, c, '─', 'd')
    }
    for (let r = r0 + (top !== null ? 1 : 0); r <= r1 - (bottom !== null ? 1 : 0); r += 1) {
      put(r, c0, '│', 'd')
      put(r, c1, '│', 'd')
    }
    if (top !== null) {
      put(r0, c0, tl, 'd')
      put(r0, c1, tr, 'd')
    }
    if (bottom !== null) {
      put(r1, c0, bl, 'd')
      put(r1, c1, br, 'd')
    }
  }

  // 下面两类不落进网格，记成形状（网格坐标，一格 = cellW × cellH），运行时画成一串点：
  // 一格 8 × 16，竖向太粗，曲线和圆按格子落点会画成台阶和歪八边形，还会挤到旁边的字
  const unit = grid.cellW / cw
  const shapes = []

  // ── 3. 线（导图连线等）：只描边不填充的路径，沿路径每 4.5 网格像素取一个点 ──
  // 图标里的小路径（24px 以内）不算
  for (const path of document.querySelectorAll('svg path')) {
    const s = getComputedStyle(path)
    if (s.fill !== 'none' || s.stroke === 'none' || !visible(path)) continue
    const b = path.getBoundingClientRect()
    if (!intersects(b) || (b.width < cw * 3 && b.height < ch * 1.5)) continue
    const ctm = path.getScreenCTM()
    if (!ctm) continue
    const scale = Math.hypot(ctm.a, ctm.b) || 1
    const total = path.getTotalLength()
    const points = []
    for (let len = 0; len <= total; len += 4.5 / unit / scale) {
      const p = path.getPointAtLength(len)
      const x = (ctm.a * p.x + ctm.c * p.y + ctm.e - win.x) * unit
      const y = (ctm.b * p.x + ctm.d * p.y + ctm.f - win.y) * unit
      if (x < -4 || y < -4 || x > cols * grid.cellW + 4 || y > rows * grid.cellH + 4) continue
      points.push([Math.round(x * 2) / 2, Math.round(y * 2) / 2])
    }
    if (points.length > 1) {
      shapes.push({ kind: 'path', w: Math.round((parseFloat(s.strokeWidth) || 1) * scale * unit * 10) / 10, points })
    }
  }

  // ── 4. 圆环（进度环等）：运行时沿真圆周画一圈点 ──
  // 同心同半径的两个圆（轨道 + 带 dasharray 的进度弧）合成一个：fill = 进度，track = 有没有轨道
  const rings = new Map()
  for (const circle of document.querySelectorAll('svg circle')) {
    const s = getComputedStyle(circle)
    if (s.stroke === 'none' || !visible(circle)) continue
    const b = circle.getBoundingClientRect()
    if (!intersects(b) || b.width < cw * 3) continue
    const ctm = circle.getScreenCTM()
    const scale = ctm ? Math.hypot(ctm.a, ctm.b) : 1
    const x = (b.left + b.width / 2 - win.x) * unit
    const y = (b.top + b.height / 2 - win.y) * unit
    const r = (b.width / 2) * unit
    const key = [x, y, r].map(Math.round).join()
    const ring = rings.get(key) || { kind: 'ring', x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10, r: Math.round(r * 10) / 10, w: 0, fill: null, track: false, start: -90 }
    ring.w = Math.max(ring.w, Math.round((parseFloat(s.strokeWidth) || 1) * scale * unit * 10) / 10)
    const dash = parseFloat(s.strokeDasharray)
    if (dash > 0) {
      // 进度弧：可见的那段 = dasharray 第一段 − dashoffset；起点跟着 rotate() 走，SVG 默认从三点钟开始
      const total = 2 * Math.PI * (parseFloat(circle.getAttribute('r')) || b.width / 2 / scale)
      ring.fill = Math.round(Math.max(0, Math.min(1, (dash - (parseFloat(s.strokeDashoffset) || 0)) / total)) * 1000) / 1000
      if (ctm) ring.start = Math.round((Math.atan2(ctm.b, ctm.a) * 180) / Math.PI)
    } else {
      ring.track = true
    }
    rings.set(key, ring)
  }

  return {
    lines: chars.map((line) => line.join('')),
    inks: inks.map((line) => line.join('')),
    offsets,
    shapes: [...shapes, ...rings.values()]
  }
}

/**
 * 卡片正反面渲染在 sandbox 的 srcdoc iframe 里，页面里的 DOM 遍历进不去，
 * 只能从外面按 iframe 逐个进去再抽一遍，结果盖到主网格上。
 * 翻到背面、被别的卡挡住的 iframe 用中心点命中测试排除掉。
 */
async function extractFrames(page, win, base, grid) {
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
    if (!sub) continue
    const frame = await handle.contentFrame()
    if (!frame) continue
    // 逐格看格心上最上面的是不是这个 iframe：轮播里叠在后面那张卡，被正中那张挡住的半截不画
    const mask = await handle.evaluate((el, { win, cols, rows }) => {
      const cw = win.width / cols
      const ch = win.height / rows
      return Array.from({ length: rows }, (_, r) => Array.from({ length: cols }, (_, c) =>
        document.elementFromPoint(win.x + (c + 0.5) * cw, win.y + (r + 0.5) * ch) === el))
    }, { win, cols: grid.cols, rows: grid.rows })
    const over = await frame.evaluate(extractGrid, { win: sub, grid })
    const used = Array(grid.rows).fill(false)
    for (let r = 0; r < grid.rows; r += 1) {
      // 按码点拆：数学斜体这类字占两个 UTF-16 单元，按下标取会错位
      const chars = [...base.lines[r]]
      const inks = [...base.inks[r]]
      const top = [...over.lines[r]]
      const topInks = [...over.inks[r]]
      for (let c = 0; c < grid.cols; c += 1) {
        if (top[c] === ' ' || top[c] === '\u0000' || !mask[r][c]) continue
        const wide = top[c + 1] === '\u0000'
        if (wide && !mask[r][c + 1]) continue
        // 盖掉的是底下宽字的一半：另一半也清掉，免得剩半个字
        if (chars[c] === '\u0000' && c > 0) chars[c - 1] = ' '
        if (chars[wide ? c + 2 : c + 1] === '\u0000') chars[wide ? c + 2 : c + 1] = ' '
        chars[c] = top[c]
        inks[c] = topInks[c]
        if (wide) {
          chars[c + 1] = '\u0000'
          inks[c + 1] = topInks[c + 1]
        }
        used[r] = true
      }
      base.lines[r] = chars.join('')
      base.inks[r] = inks.join('')
    }
    base.offsets = base.offsets.map((dy, r) => (used[r] ? over.offsets[r] ?? dy : dy))
    base.shapes = [...base.shapes, ...over.shapes]
  }
  return base
}

/** 写盘前收一收：没有偏移的行记 0，整张都没有偏移 / 形状就不写这两个字段 */
function packGrid(grid) {
  const offsets = grid.offsets.map((dy) => dy ?? 0)
  return {
    lines: grid.lines,
    inks: grid.inks,
    ...(offsets.some(Boolean) ? { offsets } : {}),
    ...(grid.shapes.length ? { shapes: grid.shapes } : {})
  }
}

/** 把网格画成 PNG，只用于目检（运行时的画法在 FeatureAscii.vue） */
async function renderPreview(browser, grid, file, GRID) {
  const page = await browser.newPage({ viewport: { width: 640, height: 480 }, deviceScaleFactor: 2 })
  await page.setContent('<canvas id="c"></canvas>')
  await page.evaluate(({ grid, GRID }) => {
    const cw = 6.2
    const chh = 12.4
    const canvas = document.getElementById('c')
    canvas.width = GRID.cols * cw * 2
    canvas.height = GRID.rows * chh * 2
    canvas.style.width = `${GRID.cols * cw}px`
    const ctx = canvas.getContext('2d')
    ctx.scale(2, 2)
    ctx.fillStyle = '#f5f5f7'
    ctx.fillRect(0, 0, GRID.cols * cw, GRID.rows * chh)
    const colors = { d: 'rgba(29,29,31,0.32)', n: 'rgba(29,29,31,0.72)', b: '#1d1d1f', a: '#0071e3' }
    ctx.textBaseline = 'middle'
    const dyAt = (r, c) => {
      const row = grid.offsets?.[r]
      if (typeof row !== 'object' || !row) return row || 0
      let dy = 0
      for (const [c0, value] of row) if (c >= c0) dy = value
      return dy
    }
    grid.lines.forEach((line, r) => {
      ;[...line].forEach((chr, c) => {
        if (chr === ' ' || chr === '\u0000') return
        const wide = line[c + 1] === '\u0000'
        const dy = /[─│┌┐└┘╭╮╰╯━]/.test(chr) ? 0 : dyAt(r, c) * chh
        ctx.fillStyle = colors[grid.inks[r][c]] || colors.n
        ctx.font = `${wide ? 11 : 10.5}px "SF Mono", Menlo, "PingFang SC", monospace`
        ctx.fillText(chr, c * cw, r * chh + chh / 2 + dy, wide ? cw * 2 : cw)
      })
    })
    const k = cw / GRID.cellW
    for (const path of (grid.shapes || []).filter((shape) => shape.kind === 'path')) {
      ctx.fillStyle = colors.n
      for (const [x, y] of path.points) {
        ctx.beginPath()
        ctx.arc(x * k, y * k, Math.min(Math.max(path.w * 0.42, 0.8), 1.4) * k, 0, 2 * Math.PI)
        ctx.fill()
      }
    }
    for (const ring of (grid.shapes || []).filter((shape) => shape.kind === 'ring')) {
      const n = Math.max(12, Math.round((2 * Math.PI * ring.r) / Math.max(ring.w * 0.8, 5)))
      for (let i = 0; i < n; i += 1) {
        const t = i / n
        const on = ring.fill === null || t < ring.fill
        if (!on && !ring.track) continue
        const a = (ring.start * Math.PI) / 180 + t * 2 * Math.PI
        ctx.fillStyle = on ? colors.b : colors.d
        ctx.beginPath()
        ctx.arc((ring.x + ring.r * Math.cos(a)) * k, (ring.y + ring.r * Math.sin(a)) * k, Math.max(ring.w * 0.28, 1) * k, 0, 2 * Math.PI)
        ctx.fill()
      }
    }
  }, { grid, GRID })
  await page.locator('#c').screenshot({ path: file })
  await page.close()
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
  const preview = args.includes('--preview')
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
      let grid = null
      const cells = { ...GRID, ...spec.grid }
      const size = { width: cells.cols * cells.cellW, height: cells.rows * cells.cellH }
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
        // 字符画只从浅色读一次，深浅两张截图都得和它对得上：两边藏掉的必须一样
        const light = trims.light
        if (theme === 'dark' && light && ['count', 'top', 'bottom'].some((key) => light[key] !== trimmed[key])) {
          problems.push(`深浅两色藏掉的不一样（浅色 ${light.count} 块 / 顶 ${light.top} / 底 ${light.bottom}，深色 ${trimmed.count} 块 / 顶 ${trimmed.top} / 底 ${trimmed.bottom}），深色截图会和字符画对不上`)
        }
        if (check) {
          for (const problem of problems) console.log(`  ✗ ${problem}`)
          await page.screenshot({ path: join(checkDir, `${spec.name}-${theme}-frame.png`), clip: win })
          await context.close()
          continue
        }
        if (problems.length) throw new Error(`${where} 取景框切开了界面：\n  ${problems.join('\n  ')}`)
        if (theme === 'light') grid = await extractFrames(page, win, await page.evaluate(extractGrid, { win, grid: cells }), cells)
        const png = join(tmp, `${spec.name}-${theme}.png`)
        await page.screenshot({ path: png, clip: win })
        shots[theme] = png
        await context.close()
      }
      if (check) continue
      await writeFile(join(OUT, `${spec.name}.json`), `${JSON.stringify({ ...cells, ...packGrid(grid) })}\n`)
      for (const [theme, png] of Object.entries(shots)) {
        execFileSync(CWEBP, ['-quiet', '-q', '80', '-m', '6', png, '-o', join(OUT, `${spec.name}-${theme}.webp`)])
      }
      if (preview) {
        const file = join(tmpdir(), `features-live-${spec.name}.png`)
        await renderPreview(browser, grid, file, cells)
        console.log(`[features] 预览 ${file}`)
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
