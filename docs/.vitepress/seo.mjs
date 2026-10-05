import messages from './theme/i18n/messages/index.js'

export const SITE_ORIGIN = 'https://deepstudent.cn'
export const SITE_URL = `${SITE_ORIGIN}/`
export const SITE_NAME = 'DeepStudent'
export const TITLE_TEMPLATE = ':title｜DeepStudent'

const REPOSITORY_URL = 'https://github.com/helixnow/deep-student'
/** 由 scripts/gen-share-images.mjs 生成；换图必须换文件名，各平台按 URL 缓存分享图 */
const OG_IMAGE = `${SITE_ORIGIN}/img/og-2026-10-agent.png`
const SCHEMA_ID = 'deepstudent-schema'
const DEFAULT_DESCRIPTION = {
  'zh-CN':
    'DeepStudent 官方文档：了解开源、本地优先的 AI 学习工作台，配置模型服务，使用学习 Agent、笔记、思维导图、题目集与闪卡。',
  'en-US':
    'DeepStudent is an open-source, local-first AI learning workbench whose study agent works in notes, mind maps, exam sets and flashcards.'
}
const LANDING_PATHS = new Set(['index.md', 'en/index.md'])
const GUIDE_INDEX = 'user-guide/index.md'

/** Keep canonical URLs aligned with VitePress cleanUrls and directory index routes. */
export function getPageUrl(relativePath) {
  const pathname = relativePath
    .replaceAll('\\', '/')
    .replace(/^\/+/, '')
    .replace(/(^|\/)index\.md$/, '$1')
    .replace(/\.md$/, '')
  return new URL(pathname, SITE_URL).href
}

/** Match VitePress's title-template rules so social previews match the browser title. */
export function getPageTitle(pageData) {
  const title = pageData.title || SITE_NAME
  const template = pageData.titleTemplate ?? pageData.frontmatter?.titleTemplate ?? TITLE_TEMPLATE
  if (template === false) return title
  if (typeof template === 'string' && template.includes(':title')) {
    return template.replaceAll(':title', title)
  }
  const suffix = template === true ? SITE_NAME : template
  return title === suffix || suffix === SITE_NAME && template !== true
    ? title
    : `${title} | ${suffix}`
}

/** JSON embedded in a script element must not be able to close that element. */
export function serializeJsonLd(value) {
  return JSON.stringify(value)
    .replaceAll('<', '\\u003c')
    .replaceAll('>', '\\u003e')
    .replaceAll('&', '\\u0026')
    .replaceAll('\u2028', '\\u2028')
    .replaceAll('\u2029', '\\u2029')
}

export function isNotFoundPage(pageData) {
  return pageData.isNotFound === true || pageData.relativePath === '404.md'
}

// VitePress's generated 404 bypasses transformPageData; use this in transformHead too.
export function getNotFoundHead() {
  return [['meta', { name: 'robots', content: 'noindex, follow' }]]
}

function getModifiedDate(timestamp) {
  if (!timestamp) return undefined
  const date = new Date(timestamp)
  return Number.isNaN(date.valueOf()) ? undefined : date.toISOString()
}

function isTechnicalArticle(relativePath) {
  return relativePath === 'start.md' ||
    relativePath.startsWith('user-guide/') && relativePath !== GUIDE_INDEX
}

function getBreadcrumbs(pageData, pageUrl, locale) {
  const paths = [{ name: locale === 'en-US' ? 'Home' : '首页', item: SITE_URL }]
  const relativePath = pageData.relativePath
  if (relativePath.startsWith('user-guide/') && relativePath !== GUIDE_INDEX) {
    paths.push({ name: '用户指南', item: getPageUrl(GUIDE_INDEX) })
  }
  paths.push({ name: pageData.title || SITE_NAME, item: pageUrl })
  return {
    '@type': 'BreadcrumbList',
    '@id': `${pageUrl}#breadcrumb`,
    itemListElement: paths.map((item, index) => ({
      '@type': 'ListItem', position: index + 1, ...item
    }))
  }
}

function createGraph(pageData, { pageUrl, pageTitle, description, locale, isLanding }) {
  const organizationId = `${SITE_URL}#organization`
  const websiteId = `${SITE_URL}#website`
  const applicationId = `${SITE_URL}#software`
  const pageId = `${pageUrl}#webpage`
  const pageType = {
    'about.md': 'AboutPage',
    'support.md': 'ContactPage',
    [GUIDE_INDEX]: 'CollectionPage'
  }[pageData.relativePath] || 'WebPage'
  const modifiedDate = getModifiedDate(pageData.lastUpdated)
  const graph = [
    {
      '@type': 'Organization',
      '@id': organizationId,
      name: 'DeepStudent Team',
      url: SITE_URL
    },
    {
      '@type': 'WebSite',
      '@id': websiteId,
      name: SITE_NAME,
      url: SITE_URL,
      inLanguage: ['zh-CN', 'en-US'],
      publisher: { '@id': organizationId }
    },
    {
      '@type': 'SoftwareApplication',
      '@id': applicationId,
      name: SITE_NAME,
      url: SITE_URL,
      applicationCategory: 'EducationalApplication',
      operatingSystem: 'macOS, Windows, Linux, Android',
      // 和首页「全部应用」同一份清单，搜索引擎和 AI 摘要能直接读到有哪些模块
      featureList: messages[locale].home.apps.items.map((app) => app.name),
      license: `${REPOSITORY_URL}/blob/main/LICENSE`,
      downloadUrl: getPageUrl('download.md'),
      sameAs: [REPOSITORY_URL],
      publisher: { '@id': organizationId }
    },
    {
      '@type': pageType,
      '@id': pageId,
      url: pageUrl,
      name: pageTitle,
      description,
      inLanguage: locale,
      isPartOf: { '@id': websiteId },
      about: { '@id': applicationId },
      ...(modifiedDate && { dateModified: modifiedDate }),
      ...(isLanding && { mainEntity: { '@id': applicationId } }),
      ...(!isLanding && { breadcrumb: { '@id': `${pageUrl}#breadcrumb` } })
    }
  ]
  if (isTechnicalArticle(pageData.relativePath)) {
    graph.push({
      '@type': 'TechArticle',
      '@id': `${pageUrl}#article`,
      headline: pageData.title || SITE_NAME,
      description,
      url: pageUrl,
      image: OG_IMAGE,
      inLanguage: locale,
      mainEntityOfPage: { '@id': pageId },
      about: { '@id': applicationId },
      publisher: { '@id': organizationId },
      ...(modifiedDate && { dateModified: modifiedDate })
    })
    graph[3].mainEntity = { '@id': `${pageUrl}#article` }
  }
  if (!isLanding) graph.push(getBreadcrumbs(pageData, pageUrl, locale))
  return { '@context': 'https://schema.org', '@graph': graph }
}

function isManagedHead([tag, attrs = {}]) {
  return tag === 'link' && (attrs.rel === 'canonical' || attrs.hreflang) ||
    tag === 'meta' && (attrs.property?.startsWith('og:') || attrs.name?.startsWith('twitter:')) ||
    tag === 'script' && attrs.id === SCHEMA_ID
}

/** Mutate only page metadata; call after git author/lastUpdated data has been set. */
export function applyPageSeo(pageData) {
  pageData.frontmatter ??= {}
  const retainedHead = (pageData.frontmatter.head || []).filter((item) => !isManagedHead(item))
  if (isNotFoundPage(pageData)) {
    pageData.frontmatter.head = [
      ...retainedHead.filter(([tag, attrs]) => !(tag === 'meta' && attrs?.name === 'robots')),
      ...getNotFoundHead()
    ]
    return pageData
  }
  if (!pageData.relativePath?.endsWith('.md')) return pageData

  const locale = pageData.relativePath.startsWith('en/') ? 'en-US' : 'zh-CN'
  const isLanding = LANDING_PATHS.has(pageData.relativePath)
  const pageUrl = getPageUrl(pageData.relativePath)
  const pageTitle = getPageTitle(pageData)
  const description = pageData.frontmatter.description || pageData.description ||
    DEFAULT_DESCRIPTION[locale]
  pageData.description = description
  const alternates = isLanding ? [
    ['link', { rel: 'alternate', hreflang: 'zh-CN', href: SITE_URL }],
    ['link', { rel: 'alternate', hreflang: 'en-US', href: `${SITE_URL}en/` }],
    ['link', { rel: 'alternate', hreflang: 'x-default', href: SITE_URL }],
    ['meta', { property: 'og:locale:alternate', content: locale === 'en-US' ? 'zh_CN' : 'en_US' }]
  ] : []

  pageData.frontmatter.head = [
    ...retainedHead,
    ['link', { rel: 'canonical', href: pageUrl }],
    ...alternates,
    ['meta', { property: 'og:site_name', content: SITE_NAME }],
    ['meta', { property: 'og:type', content: isTechnicalArticle(pageData.relativePath) ? 'article' : 'website' }],
    ['meta', { property: 'og:locale', content: locale.replace('-', '_') }],
    ['meta', { property: 'og:title', content: pageTitle }],
    ['meta', { property: 'og:description', content: description }],
    ['meta', { property: 'og:url', content: pageUrl }],
    ['meta', { property: 'og:image', content: OG_IMAGE }],
    ['meta', { property: 'og:image:width', content: '1200' }],
    ['meta', { property: 'og:image:height', content: '630' }],
    ['meta', { property: 'og:image:alt', content: SITE_NAME }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:title', content: pageTitle }],
    ['meta', { name: 'twitter:description', content: description }],
    ['meta', { name: 'twitter:image', content: OG_IMAGE }],
    ['meta', { name: 'twitter:image:alt', content: SITE_NAME }],
    ['script', { type: 'application/ld+json', id: SCHEMA_ID }, serializeJsonLd(createGraph(
      pageData, { pageUrl, pageTitle, description, locale, isLanding }
    ))]
  ]
  return pageData
}
