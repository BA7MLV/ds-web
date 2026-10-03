import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join, relative } from 'node:path'
import {
  applyPageSeo,
  getNotFoundHead,
  getPageTitle,
  getPageUrl,
  serializeJsonLd,
  SITE_URL
} from '../docs/.vitepress/seo.mjs'

const docsRoot = fileURLToPath(new URL('../docs/', import.meta.url))
const makePage = (overrides = {}) => ({
  relativePath: 'start.md',
  title: '快速上手',
  frontmatter: { description: '配置 AI 服务并开始第一次学习对话。' },
  ...overrides
})
const head = (page) => applyPageSeo(page).frontmatter.head
const findMeta = (items, key) => items.find(([, attrs]) =>
  attrs?.property === key || attrs?.name === key)?.[1].content
const getGraph = (items) => JSON.parse(items.find(([, attrs]) =>
  attrs?.id === 'deepstudent-schema')[2])['@graph']

test('canonical URLs match clean document paths while preserving directory indexes and case', () => {
  assert.equal(getPageUrl('index.md'), SITE_URL)
  assert.equal(getPageUrl('en/index.md'), `${SITE_URL}en/`)
  assert.equal(getPageUrl('start.md'), `${SITE_URL}start`)
  assert.equal(getPageUrl('A-Q.md'), `${SITE_URL}A-Q`)
  assert.equal(getPageUrl('user-guide/index.md'), `${SITE_URL}user-guide/`)
  assert.equal(getPageUrl('user-guide/notes.md'), `${SITE_URL}user-guide/notes`)
})

test('browser and social titles share the same page title and VitePress template rules', () => {
  assert.equal(getPageTitle(makePage()), '快速上手｜DeepStudent')
  assert.equal(getPageTitle(makePage({ titleTemplate: false })), '快速上手')
  assert.equal(getPageTitle(makePage({ titleTemplate: true })), '快速上手 | DeepStudent')
  assert.equal(getPageTitle(makePage({ titleTemplate: '学习文档' })), '快速上手 | 学习文档')
  assert.equal(getPageTitle(makePage({ titleTemplate: 'DeepStudent' })), '快速上手')
  for (const relativePath of ['index.md', 'en/index.md']) {
    const page = makePage({ relativePath, title: 'DeepStudent — Learn',
      frontmatter: { layout: 'home', titleTemplate: false } })
    assert.equal(findMeta(head(page), 'og:title'), 'DeepStudent — Learn')
    assert.equal(findMeta(page.frontmatter.head, 'twitter:title'), 'DeepStudent — Learn')
  }
})

test('only the translated landing pages advertise reciprocal hreflang links', () => {
  const expected = [
    ['zh-CN', SITE_URL], ['en-US', `${SITE_URL}en/`], ['x-default', SITE_URL]
  ]
  for (const relativePath of ['index.md', 'en/index.md']) {
    const items = head(makePage({ relativePath }))
    assert.deepEqual(items.filter(([, attrs]) => attrs?.hreflang)
      .map(([, attrs]) => [attrs.hreflang, attrs.href]), expected)
    assert.equal(findMeta(items, 'og:type'), 'website')
    assert.ok(!getGraph(items).some((entity) => entity['@type'] === 'TechArticle'))
  }
  const document = head(makePage())
  assert.ok(!document.some(([, attrs]) => attrs?.hreflang))
  assert.equal(findMeta(document, 'og:type'), 'article')
})

test('article graph connects real entities, dates and guide breadcrumbs without invented ratings', () => {
  const page = makePage({
    relativePath: 'user-guide/notes.md',
    title: '笔记 (Notes)',
    lastUpdated: Date.UTC(2026, 8, 25)
  })
  const items = head(page)
  const graph = getGraph(items)
  const ids = new Set(graph.map((entity) => entity['@id']))
  assert.equal(ids.size, graph.length)
  const visit = (value) => {
    if (value && typeof value === 'object') {
      if (value['@id']) assert.ok(ids.has(value['@id']), `unresolved entity ${value['@id']}`)
      Object.values(value).forEach(visit)
    }
  }
  graph.forEach(visit)
  const article = graph.find((entity) => entity['@type'] === 'TechArticle')
  assert.equal(article.dateModified, '2026-09-25T00:00:00.000Z')
  assert.equal(article.headline, '笔记 (Notes)')
  const breadcrumb = graph.find((entity) => entity['@type'] === 'BreadcrumbList')
  assert.deepEqual(breadcrumb.itemListElement.map(({ name, position, item }) => [name, position, item]), [
    ['首页', 1, SITE_URL],
    ['用户指南', 2, `${SITE_URL}user-guide/`],
    ['笔记 (Notes)', 3, getPageUrl(page.relativePath)]
  ])
  assert.doesNotMatch(JSON.stringify(graph), /aggregateRating|reviewCount|offers|priceCurrency/)
  const invalidDateGraph = getGraph(head(makePage({ lastUpdated: 'not-a-date' })))
  assert.ok(invalidDateGraph.every((entity) => !('dateModified' in entity)))
})

test('non-article pages retain their semantic role instead of becoming technical articles', () => {
  for (const [relativePath, type] of [
    ['about.md', 'AboutPage'], ['support.md', 'ContactPage'],
    ['download.md', 'WebPage'], ['user-guide/index.md', 'CollectionPage']
  ]) {
    const graph = getGraph(head(makePage({ relativePath })))
    assert.ok(graph.some((entity) => entity['@type'] === type))
    assert.ok(!graph.some((entity) => entity['@type'] === 'TechArticle'))
  }
})

test('metadata regeneration is idempotent and preserves unrelated page head entries', () => {
  const page = makePage({ frontmatter: { description: '一个具体的摘要。', head: [
    ['link', { rel: 'canonical', href: `${SITE_URL}start.html` }],
    ['meta', { property: 'og:title', content: 'old title' }],
    ['meta', { name: 'custom-meta', content: 'keep me' }]
  ] } })
  applyPageSeo(page)
  const first = structuredClone(page)
  applyPageSeo(page)
  assert.deepEqual(page, first)
  assert.equal(page.frontmatter.head.filter(([, attrs]) => attrs?.rel === 'canonical').length, 1)
  assert.equal(findMeta(page.frontmatter.head, 'custom-meta'), 'keep me')
  assert.equal(page.description, '一个具体的摘要。')
})

test('404 metadata is non-indexable and does not claim a canonical product page', () => {
  const page = makePage({ relativePath: '404.md', isNotFound: true })
  const items = head(page)
  assert.equal(findMeta(items, 'robots'), 'noindex, follow')
  assert.ok(!items.some(([, attrs]) => attrs?.rel === 'canonical'))
  assert.ok(!items.some(([, attrs]) => attrs?.type === 'application/ld+json'))
  assert.deepEqual(getNotFoundHead(), [['meta', { name: 'robots', content: 'noindex, follow' }]])
})

test('JSON-LD cannot escape its script element and round-trips Unicode text', () => {
  const value = { title: '</script><script>alert("x")</script>&中文\u2028\u2029' }
  const serialized = serializeJsonLd(value)
  assert.doesNotMatch(serialized, /[<>&\u2028\u2029]/u)
  assert.deepEqual(JSON.parse(serialized), value)
})

function publicMarkdown(dir = docsRoot) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.isDirectory()) {
      return ['.vitepress', 'public', 'plans', 'node_modules'].includes(entry.name)
        ? [] : publicMarkdown(join(dir, entry.name))
    }
    return entry.name.endsWith('.md') && entry.name !== 'AGENTS.md' ? [join(dir, entry.name)] : []
  })
}

test('public pages have specific descriptions and are discoverable from canonical llms links', () => {
  const llms = readFileSync(join(docsRoot, 'public/llms.txt'), 'utf8')
  const urls = new Set([...llms.matchAll(/\]\((https:\/\/deepstudent\.cn\/[^)]*)\)/g)]
    .map((match) => match[1]))
  const descriptions = new Set()
  for (const file of publicMarkdown()) {
    const source = readFileSync(file, 'utf8')
    const description = source.match(/^description:\s*(.+)$/m)?.[1]
    assert.ok(description?.trim(), `missing description in ${file}`)
    assert.ok(!descriptions.has(description), `duplicate description in ${file}`)
    descriptions.add(description)
    const pageUrl = getPageUrl(relative(docsRoot, file))
    assert.ok(urls.has(pageUrl), `missing canonical llms link for ${pageUrl}`)
  }
  assert.ok([...urls].every((url) => !url.endsWith('.html')))
  assert.match(llms, /模型服务.*收费/)
  assert.match(llms, /云同步为实验性/)
})

test('robots exclusions apply to every crawler while public assets remain crawlable', () => {
  const source = readFileSync(join(docsRoot, 'public/robots.txt'), 'utf8')
  const userAgents = [...source.matchAll(/^User-agent:\s*(.+)$/gm)].map((match) => match[1])
  assert.deepEqual(userAgents, ['*'])
  assert.match(source, /^Allow: \/$/m)
  assert.match(source, /^Disallow: \/demo\/$/m)
  assert.equal([...source.matchAll(/^Disallow:/gm)].length, 1)
  assert.match(source, /^Sitemap: https:\/\/deepstudent.cn\/sitemap.xml$/m)
})
