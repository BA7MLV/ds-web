#!/usr/bin/env node
/** Audit the actual production files, without fetching remote URLs or installing tools. */
import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises'
import { resolve, relative, extname, dirname, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync, brotliCompressSync } from 'node:zlib'

const DEFAULT_DIST = resolve('docs/.vitepress/dist')
const DEFAULT_SITE = 'https://deepstudent.cn/'
const MERMAID_CHUNK = /(?:mermaid|flowDiagram|flowchart|mindmap|timeline|gantt|sequenceDiagram|classDiagram|stateDiagram|erDiagram|pieDiagram|infoDiagram|journey|quadrant|sankey|xychart|blockDiagram|packet|c4Diagram|architecture|requirementDiagram|kanban|gitGraph|elk)/i

export function isMermaidEnginePreload(url) {
  // The tiny component only creates a dynamic import after a diagram is visible.
  // Its presence is different from preloading Mermaid's engine/diagram implementations.
  if (/\/MermaidDiagram(?:[.-][^/]*)?\.js(?:[?#]|$)/i.test(url)) return false
  return MERMAID_CHUNK.test(url)
}

export function attributes(tag) {
  const result = {}
  for (const match of tag.matchAll(/([\w:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) {
    result[match[1].toLowerCase()] = decodeEntities(match[2] ?? match[3] ?? match[4] ?? '')
  }
  return result
}

function decodeEntities(value) {
  return value.replace(/&amp;/g, '&').replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
}

async function filesBelow(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const groups = await Promise.all(entries.map(async (entry) => {
    const path = resolve(directory, entry.name)
    return entry.isDirectory() ? filesBelow(path) : [path]
  }))
  return groups.flat()
}

/** Clean URLs are request paths; HTML filenames remain unchanged on disk. */
export function pagePath(file) {
  return `/${file.replaceAll(sep, '/').replace(/(^|\/)index\.html$/, '$1').replace(/\.html$/, '')}`
}

export function candidateFiles(pathname) {
  let path
  try { path = decodeURIComponent(pathname).replace(/^\/+/, '') } catch { return [] }
  if (path.split('/').includes('..')) return []
  if (!path || path.endsWith('/')) return [`${path}index.html`]
  if (extname(path)) return [path]
  return [`${path}.html`, `${path}/index.html`, path]
}

export function classifyHeadResource(tag) {
  const attrs = attributes(tag)
  if (/^<script\b/i.test(tag) && attrs.src) {
    return { url: attrs.src, kind: 'script', critical: true }
  }
  const rels = (attrs.rel || '').toLowerCase().split(/\s+/)
  if (rels.includes('stylesheet')) return { url: attrs.href, kind: 'stylesheet', critical: true }
  if (rels.includes('modulepreload')) return { url: attrs.href, kind: 'modulepreload', critical: true }
  if (rels.includes('preload')) return { url: attrs.href, kind: `preload:${attrs.as || 'unknown'}`, critical: true }
  if (rels.some((rel) => /^(?:icon|apple-touch-icon|mask-icon)$/.test(rel))) {
    return { url: attrs.href, kind: 'icon', critical: false }
  }
  return null
}

async function resourceReport(html, dist, site) {
  const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1] ?? ''
  const resources = new Map()
  for (const match of head.matchAll(/<(?:script|link)\b[^>]*>/gi)) {
    const entry = classifyHeadResource(match[0])
    if (!entry?.url) continue
    const url = new URL(entry.url, site)
    if (!resources.has(url.href)) resources.set(url.href, { ...entry, url: url.href })
  }
  for (const entry of resources.values()) {
    const url = new URL(entry.url)
    entry.local = url.origin === new URL(site).origin
    if (!entry.local) continue
    const buffer = await readFile(resolve(dist, `.${decodeURIComponent(url.pathname)}`)).catch(() => null)
    if (!buffer) { entry.missing = true; continue }
    entry.rawBytes = buffer.length
    entry.gzipBytes = gzipSync(buffer).length
    entry.brotliBytes = brotliCompressSync(buffer).length
  }
  const all = [...resources.values()]
  const initial = all.filter((entry) => entry.critical && entry.local && !entry.missing)
  const sum = (key) => initial.reduce((total, entry) => total + entry[key], 0)
  return {
    scope: 'Homepage head declarations only; icons excluded; dynamic imports, iframe and CSS imports are not included.',
    initialLocalResourceCount: initial.length,
    initialJavaScriptCount: initial.filter((entry) => ['script', 'modulepreload'].includes(entry.kind)).length,
    rawBytes: sum('rawBytes'), gzipBytes: sum('gzipBytes'), brotliBytes: sum('brotliBytes'),
    largestInitialResources: [...initial].sort((a, b) => b.gzipBytes - a.gzipBytes).slice(0, 12),
    nonCriticalHeadResources: all.filter((entry) => !entry.critical),
    externalHeadResources: all.filter((entry) => !entry.local),
    missingLocalResources: all.filter((entry) => entry.missing),
  }
}

export async function auditSite({ dist = DEFAULT_DIST, site = DEFAULT_SITE } = {}) {
  dist = resolve(dist)
  const inventory = await filesBelow(dist)
  const files = new Set(inventory.map((file) => relative(dist, file).replaceAll(sep, '/')))
  const errors = []
  const warnings = []
  const fail = (code, file, detail) => errors.push({ code, file, detail })
  const sitemap = await readFile(resolve(dist, 'sitemap.xml'), 'utf8').catch(() => '')
  const sitemapUrls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => decodeEntities(match[1]))
  const sitemapSet = new Set(sitemapUrls)
  if (!sitemapUrls.length) fail('sitemap-missing', 'sitemap.xml', 'No page URLs found.')
  if (sitemapSet.size !== sitemapUrls.length) fail('sitemap-duplicates', 'sitemap.xml', 'Duplicate page URLs.')
  const htmlFiles = [...files].filter((file) => file.endsWith('.html') && !/^(?:demo|assets)\//.test(file))
  const pages = []
  const pageByFile = new Map()
  for (const file of htmlFiles) {
    const html = await readFile(resolve(dist, file), 'utf8')
    const head = html.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i)?.[1] ?? ''
    const links = [...head.matchAll(/<link\b[^>]*>/gi)].map((match) => attributes(match[0]))
    const metas = [...head.matchAll(/<meta\b[^>]*>/gi)].map((match) => attributes(match[0]))
    const canonicals = links.filter((attrs) => attrs.rel === 'canonical')
    const robots = metas.filter((attrs) => attrs.name?.toLowerCase() === 'robots').map((attrs) => attrs.content).join(',')
    const noindex = /(?:^|[,\s])noindex(?:$|[,\s])/i.test(robots)
    const route = pagePath(file)
    const expected = new URL(route, site).href
    const jsonLd = []
    for (const match of head.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
      const attrs = attributes(match[1])
      if (attrs.type !== 'application/ld+json') continue
      try { jsonLd.push(JSON.parse(match[2])) } catch (error) { fail('jsonld-invalid', file, error.message) }
    }
    const page = { file, route, expected, canonical: canonicals[0]?.href, noindex, jsonLdCount: jsonLd.length, links, html }
    pages.push(page)
    pageByFile.set(file, page)
    if (file === '404.html') {
      if (!noindex) fail('404-indexable', file, '404 must declare noindex.')
      if (sitemapSet.has(expected)) fail('404-in-sitemap', file, expected)
      continue
    }
    if (noindex) {
      if (sitemapSet.has(expected)) fail('noindex-in-sitemap', file, expected)
      continue
    }
    if (/^(?:plans|perf|internal)\//.test(file)) fail('internal-page-published', file, expected)
    if (canonicals.length !== 1) fail('canonical-count', file, `Expected 1, found ${canonicals.length}.`)
    if (page.canonical !== expected) fail('canonical-mismatch', file, `Expected ${expected}; got ${page.canonical}.`)
    if (/\.html(?:$|[?#])/.test(page.canonical || '')) fail('canonical-not-clean', file, page.canonical)
    if (!sitemapSet.has(expected)) fail('page-missing-from-sitemap', file, expected)
    if (!jsonLd.length) fail('jsonld-missing', file, 'Indexable pages require structured data.')
    if (file !== 'index.html' && file !== 'en/index.html' && links.some((link) => link.hreflang)) {
      fail('untranslated-hreflang', file, 'Only the two landing pages currently have translations.')
    }
  }
  const indexedUrls = new Set(pages.filter((page) => !page.noindex && page.file !== '404.html').map((page) => page.expected))
  for (const url of sitemapSet) {
    if (!indexedUrls.has(url)) fail('sitemap-orphan', 'sitemap.xml', url)
    if (/\.html(?:$|[?#])/.test(url)) fail('sitemap-not-clean', 'sitemap.xml', url)
  }
  for (const file of ['index.html', 'en/index.html']) {
    const page = pageByFile.get(file)
    if (!page) { fail('landing-missing', file, 'Landing page missing.'); continue }
    const expectedAlternates = { 'zh-CN': new URL('/', site).href, 'en-US': new URL('/en/', site).href, 'x-default': new URL('/', site).href }
    const alternates = page.links.filter((link) => link.rel === 'alternate' && link.hreflang)
    for (const [language, href] of Object.entries(expectedAlternates)) {
      if (alternates.filter((link) => link.hreflang === language && link.href === href).length !== 1) {
        fail('hreflang-mismatch', file, `${language} must point once to ${href}.`)
      }
    }
    for (const link of page.links.filter((link) => link.rel === 'modulepreload')) {
      if (isMermaidEnginePreload(link.href || '')) fail('homepage-mermaid-preload', file, link.href)
    }
  }
  let checkedLinks = 0
  for (const page of pages) {
    for (const link of page.links.filter((link) => link.rel === 'stylesheet')) {
      if (/fonts\.googleapis\.com/i.test(link.href || '')) fail('blocking-google-fonts', page.file, link.href)
    }
    for (const match of page.html.matchAll(/<script\b[^>]*>/gi)) {
      const attrs = attributes(match[0])
      if (/51\.la|51la\./i.test(attrs.src || '') && !('defer' in attrs) && !('async' in attrs) && attrs.type !== 'module') {
        fail('blocking-analytics-script', page.file, attrs.src)
      }
    }
    for (const match of page.html.matchAll(/<a\b[^>]*>/gi)) {
      const { href } = attributes(match[0])
      if (!href || /^(?:mailto|tel|javascript|data):/i.test(href)) continue
      let url
      try { url = new URL(href, page.expected) } catch { fail('invalid-link', page.file, href); continue }
      if (url.origin !== new URL(site).origin) continue
      checkedLinks += 1
      const target = candidateFiles(url.pathname).find((file) => files.has(file))
      if (!target) { fail('broken-internal-link', page.file, href); continue }
      if (target.endsWith('.html') && !target.startsWith('demo/') && /\.html$/.test(url.pathname)) {
        fail('legacy-html-link', page.file, href)
      }
      if (/\.md$/.test(url.pathname) && !('download' in attributes(match[0]))) {
        fail('legacy-markdown-link', page.file, href)
      }
      if (url.hash && pageByFile.has(target)) {
        let id
        try { id = decodeURIComponent(url.hash.slice(1)) } catch { id = url.hash.slice(1) }
        const ids = [...pageByFile.get(target).html.matchAll(/\bid\s*=\s*["']([^"']+)["']/g)].map((match) => decodeEntities(match[1]))
        if (!ids.includes(id)) fail('broken-anchor', page.file, href)
      }
    }
  }
  const machineFiles = [...files].filter((file) => file.endsWith('.md') || /(?:^|\/)llms(?:-full)?\.txt$/.test(file))
  for (const file of machineFiles) {
    if (/^(?:plans|perf|internal)\//.test(file)) fail('internal-machine-page', file, 'Internal material is published.')
    const content = await readFile(resolve(dist, file), 'utf8')
    // Ignore code examples; unrendered Vue components in the surrounding prose are not useful machine content.
    const prose = content.replace(/^(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\1\s*$/gm, '')
    const source = prose.match(/<(?:[A-Z][A-Za-z0-9]*|script|style)\b[^>]*>|\{\{\s*(?:t\(|tm\(|[\w.]+\s*\}\})/)
    if (source) fail('source-component-leak', file, source[0])
    if (/(?:https?:\/\/[^\s)'"<>]+)?\/(?:plans|perf|internal)\//.test(prose)) {
      fail('internal-content-reference', file, 'Internal planning/benchmark paths appear in machine-readable content.')
    }
  }
  for (const file of ['llms.txt', 'llms-full.txt']) {
    if (!files.has(file)) fail('machine-entry-missing', file, 'Machine-readable entry is missing.')
  }
  const home = pageByFile.get('index.html')
  const resources = home ? await resourceReport(home.html, dist, site) : null
  for (const resource of resources?.missingLocalResources ?? []) fail('missing-head-resource', 'index.html', resource.url)
  const report = {
    generatedAt: new Date().toISOString(), dist, site,
    passed: errors.length === 0,
    counts: { htmlPages: pages.length, indexablePages: indexedUrls.size, sitemapUrls: sitemapSet.size, internalLinks: checkedLinks, machineFiles: machineFiles.length },
    homepage: resources, errors, warnings,
  }
  return report
}

async function main() {
  const args = process.argv.slice(2)
  const get = (name, fallback) => args.includes(name) ? args[args.indexOf(name) + 1] : fallback
  if (args.includes('--help')) {
    console.log('Usage: node scripts/audit-site.mjs [--dist docs/.vitepress/dist] [--site https://deepstudent.cn/] [--output perf/bench/audit.json]')
    return
  }
  const report = await auditSite({ dist: get('--dist', DEFAULT_DIST), site: get('--site', DEFAULT_SITE) })
  const output = resolve(get('--output', 'perf/bench/audit.json'))
  await mkdir(dirname(output), { recursive: true })
  await writeFile(output, `${JSON.stringify(report, null, 2)}\n`)
  const errorCounts = report.errors.reduce((counts, error) => ({ ...counts, [error.code]: (counts[error.code] || 0) + 1 }), {})
  console.log(JSON.stringify({ passed: report.passed, counts: report.counts, homepage: report.homepage, errorCounts, firstErrors: report.errors.slice(0, 20), output }, null, 2))
  if (!report.passed) process.exitCode = 1
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => { console.error(error); process.exitCode = 1 })
}
