/**
 * 官网英文海报与精选升级截图生成器。
 *
 * 从同源演示镜像（docs/public/demo/）截取深浅双色 2× / 3× WebP：
 *   - 英文实时演示载入前海报：Hero（桌面 + 手机）、学习桌面、手机版、音视频
 *   - 首页功能区与使用流程（中英双语，换掉不美观的旧示例，尺寸严格对齐 utils/feature-shot.js）
 *
 * 用法：
 *   node scripts/gen-en-demo-posters.mjs                 # 全部目标
 *   node scripts/gen-en-demo-posters.mjs chat anki media # 只重出指定目标
 */
/* global document, getComputedStyle, NodeFilter -- 仅在 page.evaluate 内执行 */
import { execFileSync } from 'node:child_process'
import { createReadStream } from 'node:fs'
import { mkdir, mkdtemp, rm, stat } from 'node:fs/promises'
import { createServer } from 'node:http'
import { tmpdir } from 'node:os'
import { dirname, extname, join, normalize, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const PUBLIC = join(ROOT, 'docs/public')
const FEATURES = join(PUBLIC, 'features')
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const CWEBP = process.env.CWEBP || 'cwebp'

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
  '.wasm': 'application/wasm',
}

async function serve(root) {
  const server = createServer(async (req, res) => {
    let path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname))
    if (path.startsWith('/demo/assets/pdf.worker')) {
      path = path.replace('/demo/assets/', '/demo/')
    }
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

async function waitUntilSettled(page, predicate, stableMs = 2000) {
  if (typeof predicate === 'string') {
    await page.waitForFunction(
      (needle) => document.body && (document.body.textContent || '').toLowerCase().includes(needle.toLowerCase()),
      predicate,
      { timeout: 60000, polling: 300 },
    )
  } else if (typeof predicate === 'function') {
    await page.waitForFunction(predicate, undefined, { timeout: 60000, polling: 300 })
  }
  let last = ''
  let stableSince = Date.now()
  const deadline = Date.now() + 40000
  while (Date.now() < deadline) {
    const text = await page.evaluate(() => (document.body.textContent || '').replace(/\d/g, ''))
    if (text !== last) {
      last = text
      stableSince = Date.now()
    }
    if (Date.now() - stableSince > stableMs) return
    await page.waitForTimeout(300)
  }
}

async function encodeWebp(png, output, { quality = 80, maxKb, resize } = {}) {
  let q = quality
  const resizeArgs = resize ? ['-resize', String(resize[0]), String(resize[1])] : []
  while (q >= 50) {
    execFileSync(CWEBP, ['-quiet', '-q', String(q), '-m', '6', ...resizeArgs, png, '-o', output])
    const { size } = await stat(output)
    const kb = size / 1024
    if (!maxKb || kb <= maxKb) return { q, kb }
    q -= 4
  }
  const { size } = await stat(output)
  return { q, kb: size / 1024 }
}

async function translateDomText(page, dict) {
  await page.evaluate((entries) => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
    let node
    while ((node = walker.nextNode())) {
      let val = node.nodeValue
      if (!val || !/[\u4e00-\u9fff]/.test(val)) continue
      for (const [from, to] of entries) {
        if (val.includes(from)) val = val.replaceAll(from, to)
      }
      if (val !== node.nodeValue) node.nodeValue = val
    }
  }, Object.entries(dict))
}

const ANKI_EN_DICT = {
  '考研英语::Unit10 核心词汇': 'GRE Vocab::Unit 10 Core Words',
  '机器学习系统::第 7 章 分布式训练': 'ML Systems::Ch. 7 Distributed Training',
  '有机化学::亲核取代反应讲义': 'Organic Chemistry::Nucleophilic Substitution',
  '高等数学::极限与导数 错题': 'Calculus::Limits & Derivatives Mistakes',
  '线性代数::特征值与特征向量': 'Linear Algebra::Eigenvalues & Eigenvectors',
  '划词制卡::机器学习系统': 'Selection Cards::ML Systems',
}

const MEDIA_EN_DICT = {
  '线性代数 · 第五讲': 'Linear Algebra · Lecture 5',
  '线性代数第五讲 特征值与对角化 P4 对角化的条件': 'Linear Algebra L5: Eigenvalues & Diagonalization · P4 Conditions',
  '线性代数第五讲 特征值与对角化 P3 相似矩阵': 'Linear Algebra L5: Eigenvalues & Diagonalization · P3 Similar Matrices',
  '线性代数第五讲 特征值与对角化 P2 特征多项式': 'Linear Algebra L5: Eigenvalues & Diagonalization · P2 Characteristic Polynomial',
  '线性代数第五讲 特征值与对角化 P1 特征值与特征向量': 'Linear Algebra L5: Eigenvalues & Diagonalization · P1 Eigenvalues & Eigenvectors',
  '线性代数第五讲 特征值与对角化 P5 例题精讲': 'Linear Algebra L5: Eigenvalues & Diagonalization · P5 Worked Examples',
  '有机化学 亲核取代反应演示.mp4': 'Organic Chemistry — Nucleophilic Substitution.mp4',
  '概率论 第 7 讲 课堂录音.m4a': 'Probability Theory — Lecture 7 Recording.m4a',
  '英语听力 Unit 5 精讲.mp3': 'Academic English Listening — Unit 5.mp3',
  '英语六级听力真题 2025.mp3': 'Academic English Listening Practice 2025.mp3',
  '物理实验 第 7 讲': 'Physics Lab · Lecture 7',
  'B站': 'Bilibili',
}

const READING_EN_DICT = {
  '第 45 页': 'Page 45',
  '第 47 页': 'Page 47',
  '第 52 页': 'Page 52',
  '筛选批注内容...': 'Filter annotations...',
  '导出为笔记': 'Export to note',
}

const FLASHCARDS_EN_DICT = {
  '洛必达法则使用前要先确认什么？': "What conditions must be checked before applying L'Hôpital's rule?",
  'eˣ 在 x = 0 处的三阶麦克劳林展开是什么？': 'What is the 3rd-order Maclaurin expansion of eˣ around x = 0?',
  '分部积分求 ∫ x·eˣ dx 时，u 和 dv 怎么选？': 'How should you choose u and dv when integrating ∫ x·eˣ dx by parts?',
  '高等数学': 'Calculus',
  '极限': 'Limits',
  '泰勒公式': 'Taylor Series',
  '不定积分': 'Integration',
  '星期一': 'Mon',
  '星期二': 'Tue',
  '星期三': 'Wed',
  '星期四': 'Thu',
  '星期五': 'Fri',
  '星期六': 'Sat',
  '星期日': 'Sun',
}

const RESEARCH_EN_DICT = {
  '用调研模式帮我调研间隔重复：记忆模型和复习调度各有哪些代表性研究，开源实现做到了什么程度，结合我的复习习惯给出建议，最后把报告存进笔记。':
    'Research spaced repetition: survey key memory models and scheduling studies, check open-source implementations, tailor advice to my review habits, and save the brief to Notes.',
  '复习时长 到期卡 新卡': 'review time · due · new cards',
  '复习时长': 'review time',
  '到期卡': 'due cards',
  '新卡': 'new cards',
  '已调用': 'Called',
  '个工具': 'tools',
  '网络搜索': 'Web search',
  '学术搜索': 'Academic search',
  '统一搜索': 'Unified search',
  '记忆搜索': 'Memory search',
  '创建笔记': 'Create note',
  '执行完成': 'Done',
  '已用时': 'Thought for',
  '秒': 's',
  '个任务完成': 'tasks done',
  '回顾学习档案与复习偏好': 'Review learning profile & study preferences',
  '联网检索开源实现与文档': 'Search open-source implementations & docs',
  '检索学术论文：记忆模型与调度': 'Search papers: memory models & scheduling',
  '对照本地复习记录': 'Cross-check local review history',
  '撰写调研报告并存入笔记': 'Write research report and save to Notes',
  '所有任务已完成': 'All tasks completed',
  '对比模型假设与调度策略': 'Compare modeling assumptions & schedules',
  '整理研究报告并存笔记': 'Compile research brief and save to Notes',
  '间隔重复调研': 'Spaced repetition research',
  '存笔记': 'Save note',
}

const langQuery = (lang) => (lang === 'en' ? '&lang=en' : '')
const outFeature = (name, lang, theme) => join(FEATURES, `${name}${lang === 'en' ? '-en' : ''}-${theme}.webp`)

async function hideFloatingControls(page) {
  await page.addStyleTag({
    content: 'button[aria-label="Scroll to bottom"], button[aria-label="回到底部"] { visibility: hidden !important; }',
  })
}

async function runJob(browser, origin, tmp, job) {
  for (const lang of job.langs) {
    for (const theme of ['light', 'dark']) {
      const context = await browser.newContext({
        viewport: job.viewport,
        deviceScaleFactor: job.dpr || 2,
        locale: lang === 'en' ? 'en-US' : 'zh-CN',
        colorScheme: theme,
      })
      if (job.init) await context.addInitScript(job.init)
      const page = await context.newPage()
      await job.capture(page, { origin, lang, theme })
      await hideFloatingControls(page)
      await page.waitForTimeout(300)

      if (lang === 'en' && job.checkNoCjk) {
        const cjk = await page.evaluate(() => (document.body.innerText || '').match(/[\u4e00-\u9fff]+/g) || [])
        if (cjk.length > 0) {
          console.warn(`[warn] ${job.id} (${lang}/${theme}) still has CJK:`, [...new Set(cjk)].slice(0, 8))
        }
      }

      const clip = job.getClip ? await job.getClip(page, { lang, theme }) : undefined
      const png = join(tmp, `${job.id}-${lang}-${theme}.png`)
      await page.screenshot({ path: png, clip })
      const output = job.out(lang, theme)
      const { q, kb } = await encodeWebp(png, output, {
        quality: job.quality ?? 80,
        maxKb: job.maxKb,
        resize: job.resize,
      })
      console.log(`[shot] ${job.id} (${lang}/${theme}) -> ${output.replace(`${ROOT}/`, '')} (${kb.toFixed(1)} KB, q=${q})`)
      await context.close()
    }
  }
}

async function scrollElementToTop(page, needle, offsetY = 16) {
  return page.evaluate(({ text, offset }) => {
    let el = null
    for (const c of document.body.querySelectorAll('*')) {
      if ((c.textContent || '').includes(text) && (!el || el.contains(c))) el = c
    }
    if (!el) return null
    let scroller = document.scrollingElement
    for (let cur = el.parentElement; cur; cur = cur.parentElement) {
      const s = getComputedStyle(cur)
      if (/(auto|scroll)/.test(s.overflowY) && cur.scrollHeight > cur.clientHeight) {
        scroller = cur
        break
      }
    }
    const r = el.getBoundingClientRect()
    const sr = scroller === document.scrollingElement ? { top: 0 } : scroller.getBoundingClientRect()
    scroller.scrollTop += (r.top - sr.top) - offset
    return true
  }, { text: needle, offset: offsetY })
}

const JOBS = [
  /* ── 1. flow-think（320×336 → 640×672）：升级为深度调研工具调用 + 笔记创建 + 任务完成清单 ── */
  {
    id: 'flow-think',
    langs: ['zh', 'en'],
    viewport: { width: 460, height: 760 },
    dpr: 2,
    resize: [640, 672],
    checkNoCjk: true,
    out: (lang, theme) => outFeature('flow-think', lang, theme),
    async capture(page, { origin, lang, theme }) {
      await page.goto(`${origin}/demo/app.html?app=research-memory&theme=${theme}${langQuery(lang)}`, { waitUntil: 'load' })
      await waitUntilSettled(page, '5/5')
      if (lang === 'en') await translateDomText(page, RESEARCH_EN_DICT)
      // 滚到「已用时 / Used 1s」起点，整宽 460×483（精确 320:336 比例），完整呈现工具链 + 创建笔记 + 5/5 清单
      await scrollElementToTop(page, lang === 'en' ? 'Used 1s' : '已用时', 18)
      await page.waitForTimeout(400)
    },
    async getClip(page, { lang }) {
      const needle = lang === 'en' ? 'Used 1s' : '已用时'
      const top = await page.evaluate((text) => {
        let el = null
        for (const c of document.body.querySelectorAll('*')) {
          if ((c.textContent || '').includes(text) && (!el || el.contains(c))) el = c
        }
        return el ? Math.max(0, Math.round(el.getBoundingClientRect().top - 10)) : 120
      }, needle)
      return { x: 0, y: Math.min(760 - 462, top), width: 440, height: 462 }
    },
  },

  /* ── 2. flow-review（592×304 → 1184×608）：真实闪卡今日复习页（中英双语，完整无裁切） ── */
  {
    id: 'flow-review',
    langs: ['zh', 'en'],
    viewport: { width: 740, height: 380 },
    dpr: 2,
    resize: [1184, 608],
    checkNoCjk: true,
    out: (lang, theme) => outFeature('flow-review', lang, theme),
    async capture(page, { origin, lang, theme }) {
      await page.goto(`${origin}/demo/app.html?app=flashcards&theme=${theme}${langQuery(lang)}`, { waitUntil: 'load' })
      await waitUntilSettled(page, '86%')
      if (lang === 'en') await translateDomText(page, FLASHCARDS_EN_DICT)
      await page.waitForTimeout(300)
    },
  },

  /* ── 3. chat（592×416 → 1184×832）：升级为带 PDF 附件 + 思考/搜索轨迹 + 页码引用的完整对话首屏 ── */
  {
    id: 'chat',
    langs: ['zh', 'en'],
    viewport: { width: 980, height: 689 },
    dpr: 2,
    resize: [1184, 832],
    checkNoCjk: true,
    out: (lang, theme) => outFeature('chat', lang, theme),
    async capture(page, { origin, lang, theme }) {
      await page.goto(`${origin}/demo/app.html?app=chat&theme=${theme}${langQuery(lang)}`, { waitUntil: 'load' })
      await waitUntilSettled(page, lang === 'en' ? 'AllReduce' : '第45页')
      await page.evaluate(() => {
        for (const el of document.querySelectorAll('*')) {
          const s = getComputedStyle(el)
          if (/(auto|scroll)/.test(s.overflowY) && el.scrollHeight > el.clientHeight + 80) {
            el.scrollTop = 0
          }
        }
      })
      await page.waitForTimeout(400)
    },
  },

  /* ── 4. mindmap（592×416 → 1184×832）：英文版思维导图 ── */
  {
    id: 'mindmap',
    langs: ['en'],
    viewport: { width: 1280, height: 1100 },
    dpr: 2,
    checkNoCjk: true,
    out: (lang, theme) => outFeature('mindmap', lang, theme),
    async capture(page, { origin, lang, theme }) {
      await page.goto(`${origin}/demo/index.html?theme=${theme}&scene=demo-pdf-deepread${langQuery(lang)}`, { waitUntil: 'load' })
      await waitUntilSettled(page, 'Data-Parallel')
      const card = page.locator('.mindmap-container').first()
      await card.scrollIntoViewIfNeeded()
      await page.waitForTimeout(600)
      const buttons = card.locator('button')
      const count = await buttons.count()
      for (const pattern of [/single|one-side|单侧/i, /center|fit|回中/i, /zoom out|缩小/i]) {
        for (let i = 0; i < count; i++) {
          const label = (await buttons.nth(i).getAttribute('aria-label')) || (await buttons.nth(i).getAttribute('title')) || ''
          if (pattern.test(label)) {
            await buttons.nth(i).click()
            await page.waitForTimeout(900)
            break
          }
        }
      }
      await page.mouse.move(0, 0)
      await page.addStyleTag({ content: '.mindmap-container button{visibility:hidden!important}' })
      await page.waitForTimeout(400)
    },
    async getClip(page) {
      const rect = await page.evaluate(() => {
        const nodes = [...document.querySelectorAll('.react-flow__node')].filter((el) => el.checkVisibility())
        if (!nodes.length) return null
        const rects = nodes.map((el) => el.getBoundingClientRect())
        const left = Math.min(...rects.map((b) => b.left))
        const top = Math.min(...rects.map((b) => b.top))
        const right = Math.max(...rects.map((b) => b.right))
        const bottom = Math.max(...rects.map((b) => b.bottom))
        return {
          x: Math.max(0, Math.round((left + right) / 2 - 592 / 2)),
          y: Math.max(0, Math.round((top + bottom) / 2 - 416 / 2)),
        }
      })
      return { x: rect?.x ?? 340, y: rect?.y ?? 200, width: 592, height: 416 }
    },
  },

  /* ── 5. quiz（592×416 → 1184×832）：英文版 AI 出题确认卡 ── */
  {
    id: 'quiz',
    langs: ['en'],
    viewport: { width: 940, height: 1000 },
    dpr: 2,
    resize: [1184, 832],
    checkNoCjk: true,
    out: (lang, theme) => outFeature('quiz', lang, theme),
    async capture(page, { origin, lang, theme }) {
      await page.goto(`${origin}/demo/index.html?theme=${theme}&scene=demo-qbank${langQuery(lang)}`, { waitUntil: 'load' })
      await waitUntilSettled(page, '2/2')
      await scrollElementToTop(page, '2/2', 390)
      await page.waitForTimeout(500)
    },
    async getClip(page) {
      const box = await page.evaluate(() => {
        let el = null
        for (const c of document.body.querySelectorAll('*')) {
          if ((c.textContent || '').includes('2/2') && (!el || el.contains(c))) el = c
        }
        if (!el) return null
        for (let cur = el; cur && cur !== document.body; cur = cur.parentElement) {
          const s = getComputedStyle(cur)
          const r = cur.getBoundingClientRect()
          const bordered = parseFloat(s.borderTopWidth) > 0 && !/rgba\(0, 0, 0, 0\)|transparent/.test(s.borderTopColor)
          if (bordered && r.width > 420 && r.height > 260) {
            // 按卡片真实高度 + 上下留白，再按 592:416 比例反算宽高，保证 Q2 的 Answer: A 和底栏完整不裁
            const h = Math.max(416, Math.round(r.height + 24))
            const w = Math.round((h * 592) / 416)
            return {
              x: Math.max(0, Math.min(940 - w, Math.round(r.left + r.width / 2 - w / 2))),
              y: Math.max(0, Math.min(1000 - h, Math.round(r.top - 12))),
              width: w,
              height: h,
            }
          }
        }
        return null
      })
      return box || { x: 320, y: 110, width: 616, height: 433 }
    },
  },

  /* ── 6. anki（592×416 → 1184×832）：升级为真实 Anki 制卡工作台总览（中英双语） ── */
  {
    id: 'anki',
    langs: ['zh', 'en'],
    viewport: { width: 960, height: 675 },
    dpr: 2,
    resize: [1184, 832],
    checkNoCjk: true,
    out: (lang, theme) => outFeature('anki', lang, theme),
    async capture(page, { origin, lang, theme }) {
      await page.goto(`${origin}/demo/app.html?app=anki&theme=${theme}${langQuery(lang)}`, { waitUntil: 'load' })
      await waitUntilSettled(page, lang === 'en' ? 'Total Cards' : '总卡片')
      if (lang === 'en') await translateDomText(page, ANKI_EN_DICT)
      await page.waitForTimeout(300)
    },
  },

  /* ── 7. review（592×416 → 1184×832）：紧凑饱满的 FSRS-6 闪卡复习页（中英双语，无顶条裁切） ── */
  {
    id: 'review',
    langs: ['zh', 'en'],
    viewport: { width: 640, height: 450 },
    dpr: 2,
    resize: [1184, 832],
    checkNoCjk: true,
    out: (lang, theme) => outFeature('review', lang, theme),
    async capture(page, { origin, lang, theme }) {
      await page.goto(`${origin}/demo/app.html?app=flashcards&theme=${theme}${langQuery(lang)}`, { waitUntil: 'load' })
      await waitUntilSettled(page, '86%')
      const startBtn = lang === 'en' ? /Start review/i : /开始复习/
      await page.getByRole('button', { name: startBtn }).first().click({ timeout: 20000 })
      const showBtn = lang === 'en' ? /Show answer/i : /显示答案/
      await page.getByText(showBtn).first().click({ timeout: 20000 })
      await page.waitForTimeout(400)
      if (lang === 'en') await translateDomText(page, FLASHCARDS_EN_DICT)
      await page.waitForTimeout(300)
    },
  },

  /* ── 8. reading（592×416 → 1184×832）：升级为真实 PDF 阅读器与四色批注侧栏（中英双语） ── */
  {
    id: 'reading',
    langs: ['zh', 'en'],
    viewport: { width: 1080, height: 759 },
    dpr: 2,
    resize: [1184, 832],
    checkNoCjk: true,
    out: (lang, theme) => outFeature('reading', lang, theme),
    async capture(page, { origin, lang, theme }) {
      await page.goto(`${origin}/demo/app.html?app=reading-translation&theme=${theme}${langQuery(lang)}`, { waitUntil: 'load' })
      await waitUntilSettled(page, 'Data-Parallel Protocol', 2500)
      // 展开左侧侧栏并切换到「批注 (4)」标签页，同时确保右侧正文停在 3.1 标题与黄绿双色高亮处
      const hasInput = await page.evaluate(() => !!document.querySelector('input[placeholder]'))
      if (!hasInput) {
        await page.locator('button').first().click().catch(() => {})
        await page.waitForTimeout(400)
        // 侧栏顶部第 3 个图标按钮为批注列表（带数字 4）
        const annTab = page.locator('button').filter({ hasText: /^4$/ }).first()
        if (await annTab.count()) {
          await annTab.click()
          await page.waitForTimeout(400)
        }
      }
      await scrollElementToTop(page, '3.1', 42)
      await page.waitForTimeout(300)
      if (lang === 'en') {
        await translateDomText(page, READING_EN_DICT)
        await page.evaluate(() => {
          for (const input of document.querySelectorAll('input[placeholder]')) {
            if (/[\u4e00-\u9fff]/.test(input.placeholder)) input.placeholder = 'Filter annotations...'
          }
        })
      }
      await page.waitForTimeout(400)
    },
  },

  /* ── 9. media（1120×700 → 2240×1400）：英文版音视频双主题海报 ── */
  {
    id: 'media',
    langs: ['en'],
    viewport: { width: 1120, height: 700 },
    dpr: 2,
    quality: 80,
    maxKb: 120,
    checkNoCjk: true,
    out: (_lang, theme) => join(PUBLIC, `demo-media-poster-en-${theme}.webp`),
    async capture(page, { origin, lang, theme }) {
      await page.goto(`${origin}/demo/app.html?app=media&theme=${theme}${langQuery(lang)}`, { waitUntil: 'load' })
      await waitUntilSettled(page, 'Subtitles imported')
      await translateDomText(page, MEDIA_EN_DICT)
      await page.waitForTimeout(300)
    },
  },
]

async function main() {
  const only = new Set(process.argv.slice(2).filter((a) => !a.startsWith('--')))
  const selected = JOBS.filter((j) => !only.size || only.has(j.id))
  if (!selected.length) throw new Error(`Unknown target: ${[...only].join(', ')}`)

  await mkdir(FEATURES, { recursive: true })
  const tmp = await mkdtemp(join(tmpdir(), 'ds-web-shots-'))
  const server = await serve(PUBLIC)
  const browser = await chromium.launch({ executablePath: CHROME })

  try {
    for (const job of selected) {
      await runJob(browser, server.origin, tmp, job)
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
