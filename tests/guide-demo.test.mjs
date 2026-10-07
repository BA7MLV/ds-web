import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

import { signatureOfManifest } from '../scripts/sync-demo.mjs'
import { CHAPTERS, insertDemo } from '../scripts/sync-user-guide.mjs'

const root = (path) => fileURLToPath(new URL(`../${path}`, import.meta.url))
const mirror = JSON.parse(readFileSync(root('docs/.vitepress/data/demo-mirror.json'), 'utf-8'))

test('insertDemo puts the demo right after the lead quote', () => {
  const body = '# 笔记\n\n> 一句引言\n> 第二行\n\n## 功能概览\n正文'
  assert.equal(insertDemo(body), '# 笔记\n\n> 一句引言\n> 第二行\n\n<GuideDemo />\n\n## 功能概览\n正文')
})

test('insertDemo falls back to right after the title when there is no lead quote', () => {
  assert.equal(insertDemo('# 标题\n\n正文'), '# 标题\n\n<GuideDemo />\n\n正文')
})

test('the manifest signature depends on file contents, not listing order', () => {
  const a = { files: [{ path: 'a.js', sha256: '1' }, { path: 'b.js', sha256: '2' }] }
  const b = { files: [{ path: 'b.js', sha256: '2' }, { path: 'a.js', sha256: '1' }] }
  const c = { files: [{ path: 'a.js', sha256: '1' }, { path: 'b.js', sha256: '3' }] }
  assert.equal(signatureOfManifest(a), signatureOfManifest(b))
  assert.notEqual(signatureOfManifest(a), signatureOfManifest(c))
})

test('every chapter page carries the demo slot', () => {
  for (const chapter of CHAPTERS.filter((c) => c.slug)) {
    const page = readFileSync(root(`docs/${chapter.out}`), 'utf-8')
    assert.match(page, /<GuideDemo \/>/, chapter.out)
  }
})

test('every demo in the mirror has its entry and posters on disk', () => {
  const apps = mirror.apps ?? []
  if (!apps.length) return
  assert.ok(existsSync(root('docs/public/demo/app.html')), 'single-app entry missing')
  assert.ok(existsSync(root('docs/public/demo/index.html')), 'shell entry missing')
  for (const app of apps) {
    for (const theme of app.posters) {
      assert.ok(existsSync(root(`docs/public/demo/posters/${app.id}-${theme}.webp`)), `${app.id}-${theme} poster missing`)
    }
  }
})

test('every chapter with a page has a demo once the mirror lists demos', () => {
  const apps = new Set((mirror.apps ?? []).map((app) => app.id))
  if (!apps.size) return
  const missing = CHAPTERS.filter((c) => c.slug && !apps.has(c.slug)).map((c) => c.slug)
  assert.deepEqual(missing, [])
})
