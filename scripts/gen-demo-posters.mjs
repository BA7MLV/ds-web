/**
 * 首页 Hero 应用窗壳海报截图生成器（中英双语 × 桌面 2× / 手机 3× × 浅色 / 深色）。
 *
 * 从同源演示镜像（docs/public/demo/index.html）截取真实播放完成后的「高数错题 → Anki 卡片」界面，
 * 精确匹配 AppShell.vue 渲染尺寸与 tests/poster-density.test.mjs 密度及体积预算：
 *   - 桌面 1112×773 @2x（2224×1546，<= 96 KB）
 *   - 手机 296×569  @3x（888×1707，<= 60 KB）
 *
 * 输出：
 *   - 中文：demo-poster.webp, demo-poster-dark.webp, demo-poster-mobile@3x.webp, demo-poster-mobile-dark@3x.webp
 *   - 英文：demo-poster-en.webp, demo-poster-en-dark.webp, demo-poster-en-mobile@3x.webp, demo-poster-en-mobile-dark@3x.webp
 *
 * 用法：
 *   node scripts/gen-demo-posters.mjs                # 中英全部 8 张
 *   node scripts/gen-demo-posters.mjs --lang zh      # 仅中文 4 张
 *   node scripts/gen-demo-posters.mjs --lang en      # 仅英文 4 张
 */
import { execFileSync } from 'node:child_process'
import { createReadStream } from 'node:fs'
import { mkdtemp, rm, stat } from 'node:fs/promises'
import { createServer } from 'node:http'
import { tmpdir } from 'node:os'
import { dirname, extname, join, normalize, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright-core'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const PUBLIC = join(ROOT, 'docs/public')
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const CWEBP = process.env.CWEBP || 'cwebp'
const POSTER_SCENE = 'demo-anki-cards'
const MOBILE_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'

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

function readOpt(argv, name, fallback) {
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === `--${name}`) return argv[i + 1]
    if (argv[i]?.startsWith(`--${name}=`)) return argv[i].slice(name.length + 3)
  }
  return fallback
}

async function serve(root) {
  const server = createServer(async (req, res) => {
    const reqPath = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname))
    const file = join(root, reqPath.endsWith('/') ? `${reqPath}index.html` : reqPath)
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

async function waitUntilDemoSettled(page, lang) {
  const anchorText = lang === 'en' ? '5 cards' : '共 5 张卡片'
  await page.waitForFunction(
    (needle) => document.body.innerText.includes(needle),
    anchorText,
    { timeout: 90_000, polling: 300 }
  )
  let last = ''
  let stableSince = Date.now()
  const deadline = Date.now() + 60_000
  while (Date.now() < deadline) {
    const text = await page.evaluate(() => document.body.innerText.replace(/\d/g, ''))
    if (text !== last) {
      last = text
      stableSince = Date.now()
    }
    if (Date.now() - stableSince > 2200) return
    await page.waitForTimeout(300)
  }
}

async function encodeWithinBudget(pngPath, outPath, maxKb) {
  const qualities = [78, 74, 70, 66, 62, 56, 50]
  let finalKb = 0
  for (const q of qualities) {
    execFileSync(CWEBP, ['-quiet', '-q', String(q), '-m', '6', pngPath, '-o', outPath])
    const { size } = await stat(outPath)
    finalKb = size / 1024
    if (finalKb <= maxKb) return { quality: q, kb: finalKb }
  }
  throw new Error(`${outPath} 压缩后仍为 ${finalKb.toFixed(1)} KB，超出预算 ${maxKb} KB`)
}

function posterSpecsForLang(lang) {
  const suffix = lang === 'en' ? '-en' : ''
  return [
    { file: `demo-poster${suffix}.webp`, width: 1112, height: 773, dpr: 2, theme: 'light', mobile: false, maxKb: 96 },
    { file: `demo-poster${suffix}-dark.webp`, width: 1112, height: 773, dpr: 2, theme: 'dark', mobile: false, maxKb: 96 },
    { file: `demo-poster${suffix}-mobile@3x.webp`, width: 296, height: 569, dpr: 3, theme: 'light', mobile: true, maxKb: 60 },
    { file: `demo-poster${suffix}-mobile-dark@3x.webp`, width: 296, height: 569, dpr: 3, theme: 'dark', mobile: true, maxKb: 60 }
  ]
}

async function main() {
  const argv = process.argv.slice(2)
  const langOpt = (readOpt(argv, 'lang', 'all') ?? 'all').toLowerCase()
  const langs = langOpt === 'zh' ? ['zh'] : langOpt === 'en' ? ['en'] : ['zh', 'en']

  const tmp = await mkdtemp(join(tmpdir(), 'demo-posters-'))
  const server = await serve(PUBLIC)
  const browser = await chromium.launch({ executablePath: CHROME })

  try {
    for (const lang of langs) {
      const specs = posterSpecsForLang(lang)
      for (const spec of specs) {
        const context = await browser.newContext({
          viewport: { width: spec.width, height: spec.height },
          deviceScaleFactor: spec.dpr,
          locale: lang === 'en' ? 'en-US' : 'zh-CN',
          colorScheme: spec.theme,
          ...(spec.mobile ? { isMobile: true, hasTouch: true, userAgent: MOBILE_UA } : {})
        })
        const page = await context.newPage()
        try {
          const query = new URLSearchParams({ theme: spec.theme, scene: POSTER_SCENE })
          if (lang === 'en') query.set('lang', 'en')
          await page.goto(`${server.origin}/demo/index.html?${query}`, { waitUntil: 'load', timeout: 60_000 })
          await waitUntilDemoSettled(page, lang)
          await page.addStyleTag({
            content:
              'button[aria-label="回到底部"],button[aria-label="Scroll to bottom"]{visibility:hidden!important}'
          })
          await page.waitForTimeout(400)
          const pngPath = join(tmp, `${spec.file}.png`)
          await page.screenshot({ path: pngPath, fullPage: false })
          const { quality, kb } = await encodeWithinBudget(pngPath, join(PUBLIC, spec.file), spec.maxKb)
          console.log(
            `[poster] [${lang}] ${spec.file.padEnd(36)} ${spec.width * spec.dpr}×${spec.height * spec.dpr}  q=${quality}  ${kb.toFixed(1)} KB`
          )
        } finally {
          await context.close()
        }
      }
    }
  } finally {
    await browser.close()
    server.close()
    await rm(tmp, { recursive: true, force: true })
  }
}

main().catch((error) => {
  console.error('[poster] 失败:', error)
  process.exit(1)
})
