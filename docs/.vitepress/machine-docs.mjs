import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ErrorCodes, parse } from '@vue/compiler-dom'
import { getPageUrl } from './seo.mjs'

const DOWNLOAD_URL = getPageUrl('download.md')
const COMPONENT_PAGES = ['download.md', 'support.md']
const SKIP_TAGS = new Set(['script', 'style', 'svg', 'template'])
const SKIP_CLASSES = new Set(['header-anchor', 'dl-pick', 'dl-copy__btn'])

function attribute(node, name) {
  return node.props?.find((prop) => prop.type === 6 && prop.name === name)?.value?.content
}

function hasClass(node, name) {
  return (attribute(node, 'class') || '').split(/\s+/).includes(name)
}

function findElement(node, predicate) {
  if (node.type === 1 && predicate(node)) return node
  for (const child of node.children || []) {
    const found = findElement(child, predicate)
    if (found) return found
  }
}

function findElements(node, predicate) {
  return [
    ...(node.type === 1 && predicate(node) ? [node] : []),
    ...(node.children || []).flatMap((child) => findElements(child, predicate))
  ]
}

function skip(node) {
  return SKIP_TAGS.has(node.tag) || attribute(node, 'aria-hidden') === 'true' ||
    [...SKIP_CLASSES].some((name) => hasClass(node, name))
}

function plainText(node) {
  if (!node || skip(node)) return ''
  if (node.type === 2) return node.content
  if (node.type === 5) throw new Error('Cannot generate machine Markdown: Vue interpolation unresolved')
  // Block and span separators keep adjacent OS / architecture / version labels legible.
  return (node.children || []).map(plainText).join(node.tag === 'p' ? ' ' : '')
}

function cleanText(value) {
  return value.replace(/[\t\r\n ]+/g, ' ').trim()
}

function codeSpan(value) {
  const fence = '`'.repeat(Math.max(0, ...[...value.matchAll(/`+/g)]
    .map(([match]) => match.length)) + 1)
  return `${fence}${value}${fence}`
}

function absoluteLink(href, pageUrl) {
  const url = new URL(href, pageUrl)
  if (!['http:', 'https:', 'mailto:'].includes(url.protocol)) return ''
  return url.href.replaceAll('(', '%28').replaceAll(')', '%29')
}

function renderDownloadRow(node, pageUrl) {
  const readClass = (name) => cleanText(plainText(findElement(node, (item) => hasClass(item, name))))
  const title = readClass('dl-row__name')
  const details = [readClass('dl-row__note'), readClass('dl-tag'), readClass('dl-row__size')]
    .filter(Boolean).join(' · ')
  const links = findElements(node, (item) => item.tag === 'a' && hasClass(item, 'dl-btn'))
    .map((item) => renderNode(item, pageUrl)).filter(Boolean)
  return `### ${title}\n\n${details}\n\n${links.join(' · ')}\n\n`
}

function renderSupportCard(node, pageUrl) {
  const title = findElement(node, (item) => hasClass(item, 'sp-qr__title'))
  const description = findElement(node, (item) => hasClass(item, 'sp-qr__desc'))
  const images = findElements(node, (item) => item.tag === 'img')
    .map((item) => renderNode(item, pageUrl)).join('\n\n')
  return `### ${cleanText(plainText(title))}\n\n${images}\n\n${description ? renderNode(description, pageUrl) : ''}`
}

function renderTable(node, pageUrl) {
  const rows = findElements(node, (item) => item.tag === 'tr').map((row) =>
    (row.children || []).filter((cell) => cell.tag === 'th' || cell.tag === 'td')
      .map((cell) => cleanText(renderNode(cell, pageUrl)).replaceAll('|', '\\|')))
    .filter((cells) => cells.length)
  if (!rows.length) return ''
  const line = (cells) => `| ${cells.join(' | ')} |`
  return `\n\n${line(rows[0])}\n${line(rows[0].map(() => '---'))}\n` +
    rows.slice(1).map(line).join('\n') + '\n\n'
}

function renderNode(node, pageUrl) {
  if (node.type === 2) return node.content
  if (node.type === 5) throw new Error('Cannot generate machine Markdown: Vue interpolation unresolved')
  if (node.type !== 1 || skip(node)) return ''
  if (hasClass(node, 'dl-row')) return renderDownloadRow(node, pageUrl)
  if (hasClass(node, 'sp-qr__item')) return renderSupportCard(node, pageUrl)
  if (node.tag === 'table') return renderTable(node, pageUrl)
  if (hasClass(node, 'dl-copy')) {
    const code = findElement(node, (item) => item.tag === 'code')
    return `\n\n\`\`\`bash\n${plainText(code).trim()}\n\`\`\`\n\n`
  }
  const content = (node.children || []).map((child) => renderNode(child, pageUrl)).join('')
  if (/^h[1-6]$/.test(node.tag)) {
    return `\n\n${'#'.repeat(Number(node.tag[1]))} ${cleanText(content)}\n\n`
  }
  if (node.tag === 'a') {
    const href = attribute(node, 'href')
    if (!href) return content
    const destination = absoluteLink(href, pageUrl)
    const label = cleanText(content).replaceAll('[', '\\[').replaceAll(']', '\\]')
    return destination ? `[${label}](${destination})` : label
  }
  if (node.tag === 'img') {
    const src = attribute(node, 'src')
    if (!src) return ''
    const destination = absoluteLink(src, pageUrl)
    const alt = (attribute(node, 'alt') || '').replaceAll('[', '\\[').replaceAll(']', '\\]')
    return destination ? `![${alt}](${destination})` : ''
  }
  if (node.tag === 'code') return codeSpan(plainText(node))
  if (node.tag === 'strong' || node.tag === 'b') return `**${content}**`
  if (node.tag === 'em' || node.tag === 'i') return `*${content}*`
  if (node.tag === 'br') return '\n'
  if (node.tag === 'hr') return '\n\n---\n\n'
  if (node.tag === 'ul' || node.tag === 'ol') {
    if (hasClass(node, 'dl-rows') || hasClass(node, 'sp-qr')) return `\n\n${content}\n\n`
    const items = (node.children || []).filter((child) => child.type === 1 && child.tag === 'li')
    return '\n\n' + items.map((item, index) => {
      const marker = node.tag === 'ol' ? `${index + 1}. ` : '- '
      return marker + renderNode(item, pageUrl).trim().replaceAll('\n', `\n${' '.repeat(marker.length)}`)
    }).join('\n') + '\n\n'
  }
  if (node.tag === 'p') return `\n\n${content.trim()}\n\n`
  if (node.tag === 'span') return ` ${content}`
  return content
}

/**
 * Use SSR as the single source for pages containing important HTML/component content.
 * This retains release data, FAQ answers, commands, QR contacts and native tables
 * that llms stripHTML otherwise removes. Other Markdown pages keep the plugin output.
 */
export function renderMachineMarkdown(html, relativePath) {
  const pageUrl = getPageUrl(relativePath)
  const tree = parse(html, {
    // SSR can repeat scoped data-v attributes. HTML consumers keep the first value;
    // Vue's template parser is stricter, but that duplication does not alter content.
    onError(error) {
      if (error.code !== ErrorCodes.DUPLICATE_ATTRIBUTE) throw error
    }
  })
  const main = findElement(tree, (node) => node.tag === 'main')
  const document = main && findElement(main, (node) => hasClass(node, 'vp-doc'))
  if (!document) throw new Error(`Cannot generate ${relativePath}: rendered .vp-doc content is missing`)
  const heading = findElement(document, (node) => node.tag === 'h1')
  const description = findElement(tree, (node) =>
    node.tag === 'meta' && attribute(node, 'name') === 'description')
  const title = cleanText(plainText(heading))
  const body = renderNode(document, pageUrl).replace(/[\t ]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim()
  if (!title || /\{\{[\s\S]*?\}\}/.test(body)) {
    throw new Error(`Cannot generate ${relativePath}: heading missing or Vue interpolation unresolved`)
  }
  const metadata = [
    `url: ${pageUrl}`,
    `title: ${JSON.stringify(title)}`,
    ...(description ? [`description: ${JSON.stringify(attribute(description, 'content') || '')}`] : [])
  ].join('\n')
  return `---\n${metadata}\n---\n\n${body}\n`
}

export const renderDownloadMarkdown = (html) => renderMachineMarkdown(html, 'download.md')
export const renderSupportMarkdown = (html) => renderMachineMarkdown(html, 'support.md')

/** Replace one generated section; preserve every other document byte-for-byte. */
export function replaceMachineSection(bundle, markdown, pageUrl) {
  const sections = [...bundle.matchAll(/^---\r?\nurl:\s*([^\r\n]+)\r?\n/gm)]
  const matches = sections.map((section, index) => ({ section, index })).filter(({ section }) =>
    section[1].replace(/^['"]|['"]$/g, '').replace(/\.(md|html)$/, '') === pageUrl)
  if (matches.length !== 1) {
    throw new Error(`Expected one ${pageUrl} section in llms-full.txt, found ${matches.length}`)
  }
  const { section, index } = matches[0]
  const next = sections[index + 1]
  return bundle.slice(0, section.index) + markdown.trimEnd() +
    (next ? `\n\n---\n\n${bundle.slice(next.index)}` : '\n')
}

export const replaceDownloadSection = (bundle, markdown) =>
  replaceMachineSection(bundle, markdown, DOWNLOAD_URL)

/** VitePress buildEnd hook; llms plugin has no public per-page content transform hook. */
export async function finalizeMachineDocs(siteConfig) {
  const { outDir } = siteConfig
  if (!outDir) throw new Error('Machine documentation requires the VitePress output directory')
  const [bundle, documents] = await Promise.all([
    readFile(join(outDir, 'llms-full.txt'), 'utf8'),
    Promise.all(COMPONENT_PAGES.map(async (page) => ({
      page,
      markdown: renderMachineMarkdown(
        await readFile(join(outDir, page.replace(/\.md$/, '.html')), 'utf8'), page
      )
    })))
  ])
  let updatedBundle = bundle
  for (const { page, markdown } of documents) {
    updatedBundle = replaceMachineSection(updatedBundle, markdown, getPageUrl(page))
  }
  await Promise.all([
    ...documents.map(({ page, markdown }) => writeFile(join(outDir, page), markdown, 'utf8')),
    writeFile(join(outDir, 'llms-full.txt'), updatedBundle, 'utf8')
  ])
  return documents.map(({ page, markdown }) => ({
    page, url: getPageUrl(page), bytes: Buffer.byteLength(markdown)
  }))
}
