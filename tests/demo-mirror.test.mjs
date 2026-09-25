import test from 'node:test'
import assert from 'node:assert/strict'

import { extractRefs, normalizeRef, signatureOf } from '../scripts/lib/demo-mirror.mjs'

const BASE = 'http://demo.local/demo.html'

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
