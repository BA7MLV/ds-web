import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync } from 'node:fs'

import messages from '../docs/.vitepress/theme/i18n/messages/index.js'

const DOCS = new URL('../docs/', import.meta.url)
const guide = JSON.parse(readFileSync(new URL('.vitepress/data/user-guide.json', DOCS), 'utf8'))
const vercel = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'))

/** 站内网址 → 对应的源文件（cleanUrls：/x → x.md，/x/ → x/index.md） */
const pageExists = (path) => {
  const clean = path.split('#')[0].replace(/^\//, '')
  if (!clean || clean.endsWith('/')) return existsSync(new URL(`${clean}index.md`, DOCS))
  return existsSync(new URL(`${clean.replace(/\.md$/, '')}.md`, DOCS))
}

const markdownFiles = (dir) => readdirSync(new URL(dir, DOCS), { withFileTypes: true }).flatMap((entry) => {
  const rel = `${dir}${entry.name}`
  if (entry.isDirectory()) return ['plans', 'public', 'node_modules', '.vitepress'].includes(entry.name) ? [] : markdownFiles(`${rel}/`)
  return entry.name.endsWith('.md') ? [rel] : []
})

/**
 * 用户指南由 scripts/sync-user-guide.mjs 从主仓库同步：
 * data/user-guide.json 里登记的每一页都得真的写出来了，侧栏才不会指向空页。
 */
test('every synced guide page in the sidebar data exists', () => {
  for (const { path, file } of guide.pages) assert.ok(pageExists(path), `${file} → ${path} 没有写出来`)
  for (const group of guide.groups) {
    for (const item of group.items) assert.ok(pageExists(item.link), `侧栏「${item.text}」→ ${item.link} 不存在`)
  }
})

test('synced pages say where they come from and do not offer an edit link that would be overwritten', () => {
  for (const { path } of guide.pages) {
    const clean = path.replace(/^\//, '')
    const file = clean.endsWith('/') ? `${clean}index.md` : `${clean}.md`
    const source = readFileSync(new URL(file, DOCS), 'utf8')
    assert.match(source, /^---\n[\s\S]*?editLink: false[\s\S]*?\n---/, `${file} 缺 editLink: false`)
    assert.match(source, /本页同步自主仓库/, `${file} 缺出处`)
  }
})

/** 站内所有指向用户指南 / 快速上手的链接都要有落点（含首页功能区每个场景的「了解更多」） */
test('links into the guide resolve to real pages', () => {
  const broken = []
  for (const file of markdownFiles('')) {
    const source = readFileSync(new URL(file, DOCS), 'utf8')
    for (const [, target] of source.matchAll(/\]\((\/(?:user-guide\/[^)\s]*|start(?:#[^)\s]*)?))\)/g)) {
      if (!pageExists(target)) broken.push(`${file} → ${target}`)
    }
  }
  for (const [locale, words] of Object.entries(messages)) {
    for (const scene of words.home.features.scenes) {
      if (!pageExists(scene.link)) broken.push(`${locale} 功能区「${scene.tab}」→ ${scene.link}`)
    }
  }
  assert.deepEqual(broken, [])
})

/** 旧版用户指南的网址被外链和搜索引擎收录过，全部 301 到新页，落点必须存在 */
test('every retired guide URL redirects to a page that exists', () => {
  const retired = [
    'README', '01-chat-v2', '02-learning-hub', '02-learning-hub-assets/01-notes',
    '02-learning-hub-assets/02-textbooks', '02-learning-hub-assets/03-question-bank',
    '02-learning-hub-assets/04-translation-essay', '02-learning-hub-assets/05-mindmap',
    '03-chatanki', '04-settings', '05-data-management', '06-command-palette', '07-skills',
    '08-todo-pomodoro', '09-memory'
  ].map((name) => `/user-guide/${name}`)
  for (const source of retired) {
    const rule = vercel.redirects.find((r) => r.source === source)
    assert.ok(rule, `${source} 没有重定向`)
    assert.equal(rule.permanent, true)
    assert.ok(pageExists(rule.destination), `${source} → ${rule.destination} 不存在`)
  }
})
