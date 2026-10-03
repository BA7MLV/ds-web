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
 * 依赖：playwright-core（devDependency）+ 本机 Google Chrome（CHROME=... 可换路径）、cwebp（brew install webp）。
 * 演示镜像换了（docs/.vitepress/data/demo-mirror.json 的 signature 变了）就该重跑。
 */
/* global window, document, getComputedStyle, NodeFilter -- 下面带「在页面里跑」的函数经 page.evaluate 在浏览器里执行 */
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
const WINDOW = { width: GRID.cols * GRID.cellW, height: GRID.rows * GRID.cellH }

/**
 * 每扇窗：在哪个剧本会话里、取景框怎么定位。
 * anchor 按文字或选择器找到一块界面（两者都给 = 选择器匹配里文字正好相同的那个）：
 * block 时再往上找到带边框的容器；取景框左上角 = 锚点左上角 + offset，
 * center 时改成让取景框中心对准锚点中心。
 */
const SCENES = [
  { name: 'chat', scene: 'demo-pdf-deepread', anchor: { text: '沿着页码理解章节' }, offset: { x: -8, y: -12 } },
  // 导图保持 fitView 的缩放：放大一档字是大了，但两侧的叶子节点会被取景框切掉。
  // 右侧叶子（mini-batch、AllReduce……）信息更多，取景框往右偏一点
  {
    name: 'mindmap',
    scene: 'demo-pdf-deepread',
    anchor: { selector: '.react-flow__node', text: '数据并行训练', center: true },
    offset: { x: 48, y: 0 }
  },
  { name: 'quiz', scene: 'demo-qbank', anchor: { text: 'AI 出题结果', block: true }, offset: { x: -8, y: -12 } },
  { name: 'anki', scene: 'demo-anki-cards', anchor: { text: '共 5 张卡片' }, offset: { x: -8, y: -232 } },
  // 复习页的四个评分键横跨整个主区，窗口收窄到 880 宽，取景框才装得下「答案 + 评分」
  {
    name: 'review',
    scene: 'demo-weekly-report',
    ready: { text: '本周学习看板' },
    init: unlockViews,
    prepare: prepareReview,
    viewport: { width: 880, height: 640 },
    anchor: { text: '保留到三阶', center: true },
    offset: { x: 0, y: 110 }
  },
  { name: 'reading', scene: 'demo-bilingual', anchor: { text: '英文原文', block: true }, offset: { x: -8, y: -12 } }
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
 * 在页面（或 iframe）里跑：把取景框里的界面读成字符网格。
 *
 * 先字后框：
 *   1. 字：逐字取位置，半角一格、全角（按 Unicode 东亚宽字符判断）两格，第二格记 \u0000。
 *      同一行里字按顺序往右排，取整造成的一格空隙会合上，真空格保留一格，
 *      别的元素已经占了的格子不覆盖、顺延；小字号的英文比格子窄，排不下的部分
 *      在所属块的右边界截断成 …，不挤进隔壁那一栏
 *   2. 框：有边框或明显底色的元素画框；不到两行高的胶囊 / 标签只在两端画 [ ]；
 *      框线那一行要是压到了字，就往外挪一行，挪不开就不画那条边。
 *      细长实心条（进度条）画 ━，图片画 ░；图标没有语义类名，只认按钮的 aria-label
 *      和「成功」绿色，认不出的不画
 *   3. 线：SVG 里只描边不填充的路径（导图连线）沿路径取点，横 ─ 竖 │ 斜 ·
 * 墨色只记四档语义（d 淡 / n 正文 / b 重 / a 强调），真正的颜色由运行时按主题给。
 */
function extractGrid({ win, grid }) {
  const { cols, rows } = grid
  const cw = win.width / cols
  const ch = win.height / rows
  const chars = Array.from({ length: rows }, () => Array(cols).fill(' '))
  const inks = Array.from({ length: rows }, () => Array(cols).fill(' '))
  const taken = Array.from({ length: rows }, () => Array(cols).fill(false))

  const parse = (color) => {
    const m = color && color.match(/rgba?\(([^)]+)\)/)
    if (!m) return null
    const [r, g, b, a = 1] = m[1].split(/[ ,/]+/).filter(Boolean).map(Number)
    return { r, g, b, a }
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
    for (let cur = el, depth = 0; cur && cur !== document.body && depth < 5; cur = cur.parentElement, depth += 1) {
      if (chips.has(cur)) return chips.get(cur)
    }
    return null
  }
  const glyphRows = Array.from({ length: rows }, () => [])
  const range = document.createRange()
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const parent = node.parentElement
    if (!parent || !visible(parent) || ['SCRIPT', 'STYLE', 'TEXTAREA'].includes(parent.tagName)) continue
    if (parent.closest('svg') && !parent.closest('foreignObject')) continue
    const ink = inkOf(parent)
    const chip = chipOf(parent)
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
      const r = rowOf(b.top + b.height / 2)
      if (r < 0 || r >= rows) continue
      glyphRows[r].push({ chr, ink, chip, wide: WIDE.test(chr), left: b.left, right: b.right, space })
      space = false
    }
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
    segments.forEach((seg, j) => {
      const next = segments[j + 1]
      // 最多排到下一段起点那一格之前；隔得远（分栏）时再多留一格空
      const limit = next ? Math.max(colOf(next.left + cw / 2) - (next.left - seg.right > cw * 3 ? 1 : 0), 0) : cols
      let pos = Math.max(0, colOf(seg.left + cw / 2))
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
    })
  }

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
  // 没有标签的单笔画图标看形状：起点、中点、终点围成的折角朝哪边，就是哪个方向的箭头
  const chevron = (svg) => {
    const strokes = svg.querySelectorAll('path, polyline')
    if (strokes.length !== 1 || !strokes[0].getTotalLength) return null
    const p = strokes[0]
    const total = p.getTotalLength()
    const [a, m, z] = [0, total / 2, total].map((len) => p.getPointAtLength(len))
    const span = Math.max(Math.abs(a.x - z.x), Math.abs(a.y - z.y))
    if (Math.abs(a.x - z.x) < span * 0.2 && Math.abs(m.x - a.x) > span * 0.25) return m.x < a.x ? '‹' : '›'
    if (Math.abs(a.y - z.y) < span * 0.2 && Math.abs(m.y - a.y) > span * 0.25) return m.y > a.y ? '⌄' : '⌃'
    return null
  }
  const iconGlyph = (svg) => {
    const named = ICONS.find(([re]) => re.test(labelOf(svg.closest('button, [role="button"], a'))))
    if (named) return named[1]
    // 「成功」绿：步骤完成、执行完成这类对勾
    if (isGreen(parse(getComputedStyle(svg).color))) return '✓'
    return svg.closest('button, [role="button"]') ? chevron(svg) : null
  }
  const blocks = []
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
      // 卡片正反面：只框看得见的那一面（背面、被挡住的用中心点命中测试排除）
      const cx = Math.min(Math.max(b.left + b.width / 2, win.x + 1), win.x + win.width - 1)
      const cy = Math.min(Math.max(b.top + b.height / 2, win.y + 1), win.y + win.height - 1)
      if (document.elementFromPoint(cx, cy) === el) blocks.push({ kind: 'box', b, round: true })
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
  // 字比框宽一点点时（界面字号大于格子），框的右边往外让到字后面
  const textEnd = (r0, r1, c0, c1) => {
    let end = c1 - 1
    for (let r = Math.max(r0, 0); r <= Math.min(r1, rows - 1); r += 1) {
      for (let c = Math.max(c0, 0); c <= Math.min(c1 + 3, cols - 1); c += 1) if (taken[r][c]) end = Math.max(end, c)
    }
    return end
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
      for (let c = c0; c <= c1; c += 1) put(midRow, c, '━', accent ? 'a' : 'n')
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
    c1 = textEnd(r0 + 1, r1 - 1, c0 + 1, c1) + 1
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

  // ── 3. 线（导图连线等）──
  for (const path of document.querySelectorAll('svg path')) {
    const s = getComputedStyle(path)
    if (s.fill !== 'none' || s.stroke === 'none' || !visible(path)) continue
    const b = path.getBoundingClientRect()
    if (!intersects(b) || (b.width < cw * 2 && b.height < ch)) continue
    const ctm = path.getScreenCTM()
    if (!ctm) continue
    const total = path.getTotalLength()
    let prev = null
    for (let len = 0; len <= total; len += Math.max(1, cw / 3)) {
      const p = path.getPointAtLength(len)
      const x = ctm.a * p.x + ctm.c * p.y + ctm.e
      const y = ctm.b * p.x + ctm.d * p.y + ctm.f
      if (prev) {
        const dx = (x - prev.x) / cw
        const dy = (y - prev.y) / ch
        const glyph = Math.abs(dy) < Math.abs(dx) * 0.35 ? '─' : Math.abs(dx) < Math.abs(dy) * 0.35 ? '│' : '·'
        put(rowOf(y), colOf(x), glyph, 'd')
      }
      prev = { x, y }
    }
  }

  return { lines: chars.map((line) => line.join('')), inks: inks.map((line) => line.join('')) }
}

/**
 * 卡片正反面渲染在 sandbox 的 srcdoc iframe 里，页面里的 DOM 遍历进不去，
 * 只能从外面按 iframe 逐个进去再抽一遍，结果盖到主网格上。
 * 翻到背面、被别的卡挡住的 iframe 用中心点命中测试排除掉。
 */
async function extractFrames(page, win, base) {
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
    const grid = await frame.evaluate(extractGrid, { win: sub, grid: GRID })
    base.lines = base.lines.map((line, r) => [...line].map((chr, c) => {
      const over = grid.lines[r][c]
      return over === ' ' ? chr : over
    }).join(''))
    base.inks = base.inks.map((line, r) => [...line].map((ink, c) => (grid.lines[r][c] === ' ' ? ink : grid.inks[r][c])).join(''))
  }
  return base
}

/** 把网格画成 PNG，只用于目检（运行时的画法在 FeatureAscii.vue） */
async function renderPreview(browser, grid, file) {
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
    grid.lines.forEach((line, r) => {
      ;[...line].forEach((chr, c) => {
        if (chr === ' ' || chr === '\u0000') return
        const wide = line[c + 1] === '\u0000'
        ctx.fillStyle = colors[grid.inks[r][c]] || colors.n
        ctx.font = `${wide ? 11 : 10.5}px "SF Mono", Menlo, "PingFang SC", monospace`
        ctx.fillText(chr, c * cw, r * chh + chh / 2, wide ? cw * 2 : cw)
      })
    })
  }, { grid, GRID })
  await page.locator('#c').screenshot({ path: file })
  await page.close()
}

async function main() {
  const args = process.argv.slice(2)
  const preview = args.includes('--preview')
  const only = new Set(args.filter((a) => !a.startsWith('--')))
  const scenes = SCENES.filter((s) => !only.size || only.has(s.name))
  if (!scenes.length) throw new Error(`没有这个场景：${[...only].join(', ')}`)

  await mkdir(OUT, { recursive: true })
  const tmp = await mkdtemp(join(tmpdir(), 'features-live-'))
  const server = await serve(PUBLIC)
  const browser = await chromium.launch({ executablePath: CHROME })
  try {
    for (const spec of scenes) {
      const shots = {}
      let grid = null
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
        const locate = { anchor: spec.anchor, offset: spec.offset, size: WINDOW }
        await page.evaluate(locateWindow, locate)
        await page.waitForTimeout(1000)
        const win = await page.evaluate(locateWindow, { ...locate, settled: true })
        if (theme === 'light') grid = await extractFrames(page, win, await page.evaluate(extractGrid, { win, grid: GRID }))
        const png = join(tmp, `${spec.name}-${theme}.png`)
        await page.screenshot({ path: png, clip: win })
        shots[theme] = png
        await context.close()
      }
      await writeFile(join(OUT, `${spec.name}.json`), `${JSON.stringify({ ...GRID, ...grid })}\n`)
      for (const [theme, png] of Object.entries(shots)) {
        execFileSync(CWEBP, ['-quiet', '-q', '80', '-m', '6', png, '-o', join(OUT, `${spec.name}-${theme}.webp`)])
      }
      if (preview) {
        const file = join(tmpdir(), `features-live-${spec.name}.png`)
        await renderPreview(browser, grid, file)
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
