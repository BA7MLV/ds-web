import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const readJson = async (relativePath) => {
  const raw = await readFile(new URL(`../${relativePath}`, import.meta.url), 'utf8')
  return JSON.parse(raw)
}

test('三套 locale 都声明语言切换短文案 key', async () => {
  const [zh, zhHant, en] = await Promise.all([
    readJson('src/locales/zh.json'),
    readJson('src/locales/zh-Hant.json'),
    readJson('src/locales/en.json'),
  ])

  for (const messages of [zh, zhHant, en]) {
    assert.equal(typeof messages['locale.zhShort'], 'string')
    assert.equal(typeof messages['locale.zhHantShort'], 'string')
    assert.equal(typeof messages['locale.enShort'], 'string')
  }
})

test('三套 locale 的长文案使用统一的语言自称', async () => {
  const [zh, zhHant, en] = await Promise.all([
    readJson('src/locales/zh.json'),
    readJson('src/locales/zh-Hant.json'),
    readJson('src/locales/en.json'),
  ])

  for (const messages of [zh, zhHant, en]) {
    assert.equal(messages['locale.zh'], '简体中文')
    assert.equal(messages['locale.zhHant'], '繁體中文')
    assert.equal(messages['locale.en'], 'English')
  }
})

test('LocaleSlider 的短文案不再依赖 fallback', async () => {
  const source = await readFile(new URL('../src/components/locale-toggle.jsx', import.meta.url), 'utf8')

  assert.match(source, /short:\s*t\('locale\.zhShort'\)/)
  assert.match(source, /short:\s*t\('locale\.zhHantShort'\)/)
  assert.match(source, /short:\s*t\('locale\.enShort'\)/)
  assert.doesNotMatch(source, /locale\.zhShort',\s*'简中'/)
  assert.doesNotMatch(source, /locale\.zhHantShort',\s*'繁中'/)
  assert.doesNotMatch(source, /locale\.enShort',\s*'EN'/)
})

test('语言切换组件的长文案不再依赖 fallback', async () => {
  const source = await readFile(new URL('../src/components/locale-toggle.jsx', import.meta.url), 'utf8')

  assert.match(source, /label:\s*t\('locale\.zh'\)/)
  assert.match(source, /label:\s*t\('locale\.zhHant'\)/)
  assert.match(source, /label:\s*t\('locale\.en'\)/)
  assert.match(source, /<option value="zh">\{t\('locale\.zh'\)\}<\/option>/)
  assert.match(source, /<option value="zh-Hant">\{t\('locale\.zhHant'\)\}<\/option>/)
  assert.match(source, /<option value="en">\{t\('locale\.en'\)\}<\/option>/)
  assert.doesNotMatch(source, /locale\.zh',\s*'简体中文'/)
  assert.doesNotMatch(source, /locale\.zhHant',\s*'繁體中文'/)
  assert.doesNotMatch(source, /locale\.en',\s*'English'/)
})
