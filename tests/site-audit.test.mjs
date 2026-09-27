import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { attributes, auditSite, candidateFiles, classifyHeadResource, isMermaidEnginePreload, pagePath } from '../scripts/audit-site.mjs'
import { percentile } from '../scripts/bench-site.mjs'

test('clean URL paths keep directory indexes and case-sensitive filenames', () => {
  assert.equal(pagePath('index.html'), '/')
  assert.equal(pagePath('en/index.html'), '/en/')
  assert.equal(pagePath('A-Q.html'), '/A-Q')
  assert.deepEqual(candidateFiles('/en/'), ['en/index.html'])
  assert.deepEqual(candidateFiles('/start'), ['start.html', 'start/index.html', 'start'])
  assert.deepEqual(candidateFiles('/start.md'), ['start.md'])
  assert.deepEqual(candidateFiles('/%2e%2e/secrets'), [])
  assert.deepEqual(candidateFiles('/%INVALID'), [])
})

test('resource accounting excludes icons and connection hints from critical bytes', () => {
  assert.deepEqual(classifyHeadResource('<link rel="icon" href="/favicon.ico">'), { url: '/favicon.ico', kind: 'icon', critical: false })
  assert.equal(classifyHeadResource('<link rel="preconnect" href="https://fonts.example">'), null)
  assert.deepEqual(classifyHeadResource('<link rel="modulepreload" href="/assets/app.js">'), { url: '/assets/app.js', kind: 'modulepreload', critical: true })
  assert.deepEqual(classifyHeadResource('<script type="module" src="/assets/app.js">'), { url: '/assets/app.js', kind: 'script', critical: true })
  assert.deepEqual(classifyHeadResource('<link rel="preload" as="font" href="/body.woff2">'), { url: '/body.woff2', kind: 'preload:font', critical: true })
})

test('HTML attribute reading distinguishes boolean defer and decodes link ampersands', () => {
  const attrs = attributes('<script src="https://example.test/a?x=1&amp;y=2" defer>')
  assert.equal(attrs.src, 'https://example.test/a?x=1&y=2')
  assert.equal('defer' in attrs, true)
  assert.equal('async' in attrs, false)
})

test('Mermaid audit distinguishes the tiny lazy component from diagram engine chunks', () => {
  assert.equal(isMermaidEnginePreload('/assets/MermaidDiagram.ABC.js'), false)
  assert.equal(isMermaidEnginePreload('/assets/chunks/mermaid.ABC.js'), true)
  assert.equal(isMermaidEnginePreload('/assets/chunks/flowchart-elk-definition-123.ABC.js'), true)
  assert.equal(isMermaidEnginePreload('/assets/framework.ABC.js'), false)
})

test('performance percentiles never count missing runs as instantaneous success', () => {
  assert.equal(percentile([null, undefined, NaN], 0.75), null)
  assert.equal(percentile([100, 200, null, 300, 400], 0.75), 325)
  assert.equal(percentile([200], 0.95), 200)
})

test('production audit accepts reciprocal clean URLs and detects real output regressions', async (t) => {
  const root = await mkdtemp(join(tmpdir(), 'site-audit-fixture-'))
  t.after(() => rm(root, { recursive: true, force: true }))
  await mkdir(join(root, 'en'))
  const base = 'https://deepstudent.cn'
  const head = (path) => `<head><link rel="canonical" href="${base}${path}"><link rel="alternate" hreflang="zh-CN" href="${base}/"><link rel="alternate" hreflang="en-US" href="${base}/en/"><link rel="alternate" hreflang="x-default" href="${base}/"><script type="application/ld+json">{"@type":"WebPage"}</script></head>`
  await Promise.all([
    writeFile(join(root, 'index.html'), `${head('/')}<body><h1 id="hero">Hello</h1><a href="/en/">English</a><a href="#hero">Top</a></body>`),
    writeFile(join(root, 'en/index.html'), `${head('/en/')}<body><a href="/">中文</a></body>`),
    writeFile(join(root, '404.html'), '<head><meta name="robots" content="noindex, follow"></head>'),
    writeFile(join(root, 'sitemap.xml'), `<urlset><url><loc>${base}/</loc></url><url><loc>${base}/en/</loc></url></urlset>`),
    ...['llms.txt', 'llms-full.txt'].map((file) => writeFile(join(root, file), '# Real product content\n')),
  ])
  const valid = await auditSite({ dist: root })
  assert.equal(valid.passed, true, JSON.stringify(valid.errors))
  assert.equal(valid.counts.indexablePages, 2)
  assert.equal(valid.counts.internalLinks, 3)
  await writeFile(join(root, 'en/index.html'), `${head('/en/')}<body><a href="/en/missing">Invalid translation</a><a href="/#absent">Bad anchor</a></body>`)
  await writeFile(join(root, 'index.md'), '# Home\n<HomePage />\n')
  const invalid = await auditSite({ dist: root })
  assert.equal(invalid.passed, false)
  assert.deepEqual(invalid.errors.map((error) => error.code).sort(), ['broken-anchor', 'broken-internal-link', 'source-component-leak'])
})
