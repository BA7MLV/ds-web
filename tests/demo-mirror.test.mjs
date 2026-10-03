import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

import { extractRefs, isPinnedAgainstSync, normalizeRef, pinEntryRefs, signatureOf } from '../scripts/lib/demo-mirror.mjs'

const BASE = 'http://demo.local/demo.html'
const MIRROR_ENTRY = fileURLToPath(new URL('../docs/public/demo/index.html', import.meta.url))

test('extractRefs picks up html entry assets', () => {
  const html = `
    <link rel="stylesheet" href="./assets/demo-CtfNMWfk.css" />
    <script type="module" src="./assets/demo-DFjhO9op.js"></script>
    <img src="./app-icon.png" />
  `

  const refs = extractRefs(html, BASE)

  assert.deepEqual([...refs.keys()].sort(), [
    '/app-icon.png',
    '/assets/demo-CtfNMWfk.css',
    '/assets/demo-DFjhO9op.js'
  ])
  // 入口引用的东西缺一个整站就崩，必须算关键资源
  assert.equal(refs.get('/assets/demo-CtfNMWfk.css').strict, true)
  assert.equal(refs.get('/app-icon.png').strict, true)
})

test('extractRefs marks hashed chunks as critical but ignores loose node paths', () => {
  // 引用是相对「当前 chunk」解析的，所以 base 用 assets 里的文件
  const base = 'http://demo.local/assets/vendor-x.js'
  const js = `
    import("./chatV2-BXfVFfUK.js");
    const v1 = require("./v1.js");
    go.workerSrc="./pdf.worker.mjs";
  `

  const refs = extractRefs(js, base)

  // 带内容 hash 才是 Vite 产物，404 就是镜像坏了
  assert.equal(refs.get('/assets/chatV2-BXfVFfUK.js')?.strict, true)
  // 依赖里残留的 Node 路径、pdf.worker 源站本来就没有，只做尽力抓取
  assert.equal(refs.get('/assets/v1.js')?.strict, false)
  assert.equal(refs.get('/assets/pdf.worker.mjs')?.strict, false)
})

test('extractRefs follows bare asset names that Vite resolves against import.meta.url', () => {
  const base = 'http://demo.local/assets/App-BOsi5h8O.js'
  const js = `
    const icon = "" + new URL("todo-RSpTCeB8.svg", import.meta.url).href;
    const wallpaper = new URL("../wallpapers/study-os/mountain-mist.webp", import.meta.url);
    const later = new URL(name + ".svg", import.meta.url);
  `

  const refs = extractRefs(js, base)

  assert.equal(refs.has('/assets/todo-RSpTCeB8.svg'), true)
  assert.equal(refs.has('/wallpapers/study-os/mountain-mist.webp'), true)
  // 运行期拼出来的名字没法预先抓
  assert.equal([...refs.keys()].some((ref) => ref.includes('name')), false)
})

test('normalizeRef drops dynamic, foreign and non-asset paths', () => {
  assert.equal(normalizeRef('${name}.js', BASE), null)
  assert.equal(normalizeRef('/assets/list.json', BASE), '/assets/list.json')
  assert.equal(normalizeRef('#fd_back', BASE), null)
  assert.equal(normalizeRef('data:image/svg+xml;base64,AAA', BASE), null)
  assert.equal(normalizeRef('https://fonts.gstatic.com/s/x.woff2', BASE), null)
  assert.equal(normalizeRef('https://cdn.example.com/lib.js', BASE), null)
  assert.equal(normalizeRef('/node_modules/.pnpm/pkg/index.js', BASE), null)
  assert.equal(normalizeRef('./', BASE), null)
})

test('extractRefs resolves parent-relative and css url references', () => {
  const css = `@font-face { src: url("../assets/font-ABC12345.woff2") format("woff2"); }`

  const refs = extractRefs(css, 'http://demo.local/assets/demo-CtfNMWfk.css')

  assert.deepEqual([...refs.keys()], ['/assets/font-ABC12345.woff2'])
})

test('signatureOf is order independent and changes with the asset set', () => {
  const a = signatureOf(['/assets/a-AAAAAAAA.js', '/assets/b-BBBBBBBB.js'])
  const b = signatureOf(['/assets/b-BBBBBBBB.js', '/assets/a-AAAAAAAA.js'])

  assert.equal(a, b)
  assert.notEqual(a, signatureOf(['/assets/a-AAAAAAAA.js']))
})

test('pinEntryRefs rewrites relative entry assets to the mount path', () => {
  const html = `
    <link rel="icon" href="./app-icon.png" />
    <script type="module" src="./assets/demo-DFjhO9op.js"></script>
    <link rel="modulepreload" href="../assets/vendor-x.js" />
  `

  const pinned = pinEntryRefs(html, BASE, 'demo')

  assert.match(pinned, /href="\/demo\/app-icon\.png"/)
  assert.match(pinned, /src="\/demo\/assets\/demo-DFjhO9op\.js"/)
  // ../ 也是按源站入口的目录解析，落盘后同样要挂到 /demo 下
  assert.match(pinned, /href="\/demo\/assets\/vendor-x\.js"/)
})

test('pinEntryRefs keeps foreign, inline and non-asset references intact', () => {
  const html = `
    <link rel="stylesheet" href="https://fonts.example/x.css" />
    <a href="#top">top</a>
    <a href="/user-guide/01-chat-v2">guide</a>
    <img src="data:image/svg+xml;base64,AAA" />
    <script type="module" src="/assets/already-rooted-AAAAAAAA.js"></script>
  `

  assert.equal(
    pinEntryRefs(html, BASE, 'demo'),
    html.replace('/assets/already-rooted-AAAAAAAA.js', '/demo/assets/already-rooted-AAAAAAAA.js')
  )
})

test('pinEntryRefs preserves query strings and normalizes the mount path', () => {
  assert.match(
    pinEntryRefs('<img src="./app-icon.png?v=2" />', BASE, '/demo/'),
    /src="\/demo\/app-icon\.png\?v=2"/
  )
})

test('a pinned mirror survives the build-time sync unless a sync is asked for explicitly', () => {
  const pinned = { pinned: '主仓库 536238582 的本地构建' }
  assert.equal(isPinnedAgainstSync(pinned), true)
  assert.equal(isPinnedAgainstSync(pinned, { force: true }), false)
  assert.equal(isPinnedAgainstSync(pinned, { explicitSource: true }), false)
  assert.equal(isPinnedAgainstSync({ source: 'http://47.88.78.106:8010' }), false)
  assert.equal(isPinnedAgainstSync(null), false)
})

test('committed mirror entry pins its own assets, so any URL resolves them', async () => {
  const html = await readFile(MIRROR_ENTRY, 'utf8')

  // 线上 cleanUrls 把 /demo/index.html 308 到 /demo，入口若还留着相对引用，
  // 资源就会被解析到站点根目录 /assets/…，演示应用起不来，首页永远停在载入态。
  for (const [, value] of html.matchAll(/\b(?:src|href)\s*=\s*["']([^"']+)["']/gi)) {
    assert.match(value, /^\/demo\//, `入口引用未钉到 /demo/ 下：${value}`)
  }
})
