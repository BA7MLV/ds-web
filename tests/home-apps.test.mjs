import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

import messages from '../docs/.vitepress/theme/i18n/messages/index.js'

/**
 * 首页「全部应用」（HomeApps.vue）：每个应用的图标要在 docs/public/apps/ 里、链接要落到真实的用户指南页，
 * 中英文两份列的是同一批应用、同一个顺序 —— 漏一张图或链到不存在的章节，页面不会报错，只会悄悄坏掉。
 */
const pages = JSON.parse(readFileSync(new URL('../docs/.vitepress/data/user-guide.json', import.meta.url), 'utf8')).pages
const routes = new Set(pages.map((page) => page.path))
const apps = (lang) => messages[lang].home.apps

test('every app has its own icon and a guide page that exists', () => {
  const { items, extras } = apps('zh-CN')
  for (const item of items) {
    assert.ok(existsSync(new URL(`../docs/public/apps/${item.icon}.svg`, import.meta.url)), `缺图标：${item.icon}`)
    assert.ok(routes.has(item.link), `${item.name} 链到了不存在的页面：${item.link}`)
  }
  for (const extra of extras) assert.ok(routes.has(extra.link), `${extra.name} 链到了不存在的页面：${extra.link}`)
  // 同一枚图标出现两次，访客分不清是两个应用
  assert.equal(new Set(items.map((item) => item.icon)).size, items.length)
})

test('english lists the same apps in the same order', () => {
  const zh = apps('zh-CN')
  const en = apps('en-US')
  assert.deepEqual(en.items.map(({ icon, link }) => [icon, link]), zh.items.map(({ icon, link }) => [icon, link]))
  assert.deepEqual(en.extras.map(({ link }) => link), zh.extras.map(({ link }) => link))
})
