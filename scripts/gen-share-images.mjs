/**
 * 分享图与「什么是 DeepStudent」主图：都从首页演示的海报截图（demo-poster.webp）出。
 *
 * 为什么留脚本：两张图都该跟着真界面走。演示镜像一重拍海报（见 AppShell.vue 顶部注释），
 * 或者首屏标题 / 副标改了，照着跑一遍即可，不用回忆当初的排版和尺寸。
 *
 *   docs/public/img/og-2026-10-agent.png                 1200×630 分享卡（og:image / twitter:image）
 *   docs/public/img/example/软件主页图-<宽>.webp    带窗壳的界面图，640 / 960 / 1280 / 1600 四档
 *
 * 取值的理由：
 * · 分享卡 1200×630 是 Open Graph / Twitter large card 的通用比例；用 PNG 不用 WebP，
 *   微信、QQ 等抓取方对 WebP 的支持参差不齐。换图要换文件名（带年月），
 *   各平台按 URL 缓存分享图，同名替换会一直显示旧图。
 * · 文案直接读 i18n 的 home.hero.title / lede，首屏改了这里跟着变。
 * · 窗壳的圆角、描边、阴影、红绿灯照抄 AppShell.vue 的浅色窗壳，和首页那扇窗是同一个样子。
 * · 主图按 2× 渲染再由 cwebp 缩到四档（q80，保留透明阴影）。
 *
 * 依赖本机 Google Chrome（无头截图）与 cwebp（brew install webp）：
 *   node scripts/gen-share-images.mjs
 *   CHROME=/path/to/chrome CWEBP=/path/to/cwebp node scripts/gen-share-images.mjs
 */
import { execFileSync } from 'node:child_process'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

import zh from '../docs/.vitepress/theme/i18n/messages/zh-CN.js'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const PUBLIC = join(ROOT, 'docs/public')
const POSTER = join(PUBLIC, 'demo-poster.webp')
const OG_OUT = join(PUBLIC, 'img/og-2026-10-agent.png')
const MAIN_OUT = (width) => join(PUBLIC, `img/example/软件主页图-${width}.webp`)
const MAIN_WIDTHS = [640, 960, 1280, 1600]

const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
const CWEBP = process.env.CWEBP || 'cwebp'

/** 海报的原生尺寸 = 演示内屏 1112×773（AppShell 的 NATIVE_W / NATIVE_H） */
const SCREEN = { w: 1112, h: 773 }
/** 窗壳四周给阴影留的地方：阴影最远一层是 0 48px 96px -40px，往下最多伸出 104px */
const PAD = { top: 40, side: 56, bottom: 104 }

const escape = (text) => text.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c])

/** 红绿灯在 AppShell 里跟着内屏一起缩放，这里同样按窗宽 / 原生宽换算（--k） */
const windowShell = (posterUrl, width) => `
  <div class="win" style="width:${width}px; --k:${width / SCREEN.w}">
    <img src="${posterUrl}" alt="">
    <div class="lights"><i></i><i></i><i></i></div>
  </div>`

const windowStyles = `
  .win { position: relative; aspect-ratio: ${SCREEN.w} / ${SCREEN.h}; overflow: hidden;
    border-radius: 12px; border: 1px solid hsl(0 0% 85%); background: #fff;
    box-shadow: 0 1px 1px hsl(0 0% 0% / 0.04), 0 12px 28px -12px hsl(0 0% 0% / 0.16),
      0 48px 96px -40px hsl(0 0% 0% / 0.22); }
  .win img { display: block; width: 100%; height: 100%; }
  .lights { position: absolute; top: calc(14px * var(--k)); left: calc(12px * var(--k));
    display: flex; gap: calc(8px * var(--k)); }
  .lights i { width: calc(12px * var(--k)); height: calc(12px * var(--k)); border-radius: 50%;
    box-shadow: inset 0 0 1px rgba(0,0,0,.18); }
  .lights i:nth-child(1) { background: #ff5f57; }
  .lights i:nth-child(2) { background: #febc2e; }
  .lights i:nth-child(3) { background: #28c840; }`

const mainHtml = (posterUrl) => `<!doctype html><meta charset="utf-8">
<style>
  html, body { margin: 0; background: transparent; }
  body { padding: ${PAD.top}px ${PAD.side}px ${PAD.bottom}px; }
  ${windowStyles}
</style>
${windowShell(posterUrl, SCREEN.w)}`

const ogHtml = (posterUrl, logoSvg) => `<!doctype html><meta charset="utf-8">
<style>
  html, body { margin: 0; width: 1200px; height: 630px; overflow: hidden; }
  body {
    position: relative;
    font-family: -apple-system, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
    color: #1d1d1f;
    background-color: #f7f7f8;
    background-image: radial-gradient(circle, rgb(0 0 0 / 0.09) 1px, transparent 1.2px);
    background-size: 18px 18px;
  }
  .copy { position: absolute; left: 72px; top: 0; bottom: 0; width: 520px;
    display: flex; flex-direction: column; justify-content: center; gap: 22px; }
  .brand { display: flex; align-items: center; gap: 12px; font-size: 26px; font-weight: 600; }
  .brand svg { width: 40px; height: 40px; }
  h1 { margin: 0; font-size: 44px; line-height: 1.2; white-space: nowrap; font-weight: 600; letter-spacing: -0.02em; }
  p { margin: 0; font-size: 24px; line-height: 1.6; color: #55555a; }
  .foot { margin-top: 10px; font-size: 18px; color: #86868b; }
  .shot { position: absolute; left: 640px; top: 96px; }
  ${windowStyles}
</style>
<div class="copy">
  <div class="brand">${logoSvg}DeepStudent</div>
  <h1>${escape(zh.home.hero.title).replace('\n', '<br>')}</h1>
  <p>${zh.home.hero.lede.map(escape).join('<br>')}</p>
  <div class="foot">deepstudent.cn · macOS / Windows / Linux / Android</div>
</div>
<div class="shot">${windowShell(posterUrl, 760)}</div>`

const shoot = (html, out, { width, height, scale = 1, transparent = false }) => {
  const args = [
    '--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run',
    `--force-device-scale-factor=${scale}`, `--window-size=${width},${height}`,
    `--screenshot=${out}`
  ]
  if (transparent) args.push('--default-background-color=00000000')
  execFileSync(CHROME, [...args, pathToFileURL(html).href], { stdio: 'ignore' })
}

const work = await mkdtemp(join(tmpdir(), 'ds-share-'))
try {
  const posterUrl = pathToFileURL(POSTER).href
  const logoSvg = (await readFile(join(PUBLIC, 'logo-black.svg'), 'utf8')).replace(/<\?xml[^>]*>/, '')

  const ogPage = join(work, 'og.html')
  await writeFile(ogPage, ogHtml(posterUrl, logoSvg))
  shoot(ogPage, OG_OUT, { width: 1200, height: 630 })
  console.log(`[share] ${OG_OUT}`)

  const mainPage = join(work, 'main.html')
  const mainPng = join(work, 'main@2x.png')
  await writeFile(mainPage, mainHtml(posterUrl))
  shoot(mainPage, mainPng, {
    width: SCREEN.w + PAD.side * 2,
    height: SCREEN.h + PAD.top + PAD.bottom,
    scale: 2,
    transparent: true
  })
  for (const width of MAIN_WIDTHS) {
    execFileSync(CWEBP, ['-quiet', '-q', '80', '-alpha_q', '100', '-resize', String(width), '0',
      mainPng, '-o', MAIN_OUT(width)])
    console.log(`[share] ${MAIN_OUT(width)}`)
  }
} finally {
  await rm(work, { recursive: true, force: true })
}
