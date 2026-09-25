import test from 'node:test'
import assert from 'node:assert/strict'

import messages, { FALLBACK_LOCALE } from '../docs/.vitepress/theme/i18n/messages/index.js'

/**
 * i18n 消息表的防退化测试。
 *
 * 主题里的文案全部来自 docs/.vitepress/theme/i18n/messages/<lang>.js，
 * 新增语言或改文案时最容易出的错是「只在一种语言里加/删了 key」，
 * 页面上不会报错，只会静默回退成默认语言 —— 所以这里把结构一致性钉住。
 */

/** 摊平成「点路径 → 值」，数组与字符串都当叶子 */
const flatten = (value, prefix = '', out = new Map()) => {
  if (Array.isArray(value) || typeof value !== 'object' || value === null) {
    out.set(prefix, value)
    return out
  }

  for (const [key, child] of Object.entries(value)) {
    flatten(child, prefix ? `${prefix}.${key}` : key, out)
  }
  return out
}

const placeholders = (text) => [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort()

const locales = Object.keys(messages)

test('i18n：默认语言在消息表里存在', () => {
  assert.ok(locales.includes(FALLBACK_LOCALE), `缺少默认语言 ${FALLBACK_LOCALE}`)
  assert.ok(locales.length > 1, '消息表里只有一种语言，多语言站点应至少有两份')
})

test('i18n：各语言消息表的 key 完全一致', () => {
  const base = flatten(messages[FALLBACK_LOCALE])

  for (const locale of locales) {
    const keys = flatten(messages[locale])
    assert.deepEqual(
      [...base.keys()].filter((key) => !keys.has(key)),
      [],
      `${locale} 缺少这些 key（会在页面上静默回退成 ${FALLBACK_LOCALE}）`
    )
    assert.deepEqual(
      [...keys.keys()].filter((key) => !base.has(key)),
      [],
      `${locale} 多出这些 key（${FALLBACK_LOCALE} 里没有，多半是漏了）`
    )
  }
})

test('i18n：同一个 key 在各语言里的类型一致', () => {
  const base = flatten(messages[FALLBACK_LOCALE])
  const kind = (value) => (Array.isArray(value) ? 'array' : typeof value)

  for (const locale of locales) {
    for (const [key, value] of flatten(messages[locale])) {
      /*
       * 只比 key 是否存在、数组长度是否相等还不够：
       * 若默认语言是数组、译文写成字符串，key 一样、长度比较也会被跳过，
       * 但组件里的 v-for 会开始逐字符迭代 —— 页面直接崩成一行乱码。
       */
      assert.equal(
        kind(value),
        kind(base.get(key)),
        `${locale} 的 ${key} 是 ${kind(value)}，${FALLBACK_LOCALE} 是 ${kind(base.get(key))}`
      )
    }
  }
})

test('i18n：没有空文案，列表长度与默认语言一致', () => {
  const base = flatten(messages[FALLBACK_LOCALE])

  for (const locale of locales) {
    for (const [key, value] of flatten(messages[locale])) {
      if (typeof value === 'string') {
        assert.ok(value.trim().length > 0, `${locale} 的 ${key} 是空字符串`)
        continue
      }
      if (Array.isArray(value)) {
        assert.ok(value.length > 0, `${locale} 的 ${key} 是空数组`)
        assert.equal(
          value.length,
          base.get(key)?.length,
          `${locale} 的 ${key} 条目数与 ${FALLBACK_LOCALE} 不一致`
        )
      }
    }
  }
})

test('i18n：列表条目的字段与默认语言一致', () => {
  const base = flatten(messages[FALLBACK_LOCALE])

  for (const locale of locales) {
    for (const [key, value] of flatten(messages[locale])) {
      if (!Array.isArray(value) || typeof value[0] !== 'object' || value[0] === null) continue

      value.forEach((entry, index) => {
        assert.deepEqual(
          Object.keys(entry).sort(),
          Object.keys(base.get(key)[index]).sort(),
          `${locale} 的 ${key}[${index}] 字段与 ${FALLBACK_LOCALE} 不一致`
        )
      })
    }
  }
})

test('i18n：{占位符} 在各语言里保持一致', () => {
  const base = flatten(messages[FALLBACK_LOCALE])

  for (const locale of locales) {
    for (const [key, value] of flatten(messages[locale])) {
      if (typeof value !== 'string') continue
      assert.deepEqual(
        placeholders(value),
        placeholders(base.get(key) ?? ''),
        `${locale} 的 ${key} 占位符与 ${FALLBACK_LOCALE} 不一致`
      )
    }
  }
})
