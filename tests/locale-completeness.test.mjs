import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const readJson = async (relativePath) => {
  const raw = await readFile(new URL(`../${relativePath}`, import.meta.url), 'utf8')
  return JSON.parse(raw)
}

const readSource = async (relativePath) => {
  return readFile(new URL(`../${relativePath}`, import.meta.url), 'utf8')
}

const flatten = (obj, prefix = '', result = {}) => {
  for (const key of Object.keys(obj)) {
    const value = obj[key]
    if (value !== null && typeof value === 'object') {
      flatten(value, `${prefix}${key}.`, result)
    } else {
      result[`${prefix}${key}`] = value
    }
  }
  return result
}

test('三套 locale 的扁平 key 集合完全一致', async () => {
  const [zh, zhHant, en] = await Promise.all([
    readJson('src/locales/zh.json'),
    readJson('src/locales/zh-Hant.json'),
    readJson('src/locales/en.json'),
  ])

  const keysZh = Object.keys(flatten(zh)).sort()
  const keysZhHant = Object.keys(flatten(zhHant)).sort()
  const keysEn = Object.keys(flatten(en)).sort()

  assert.deepEqual(keysZh, keysZhHant, 'zh 与 zh-Hant 的 key 集合不一致')
  assert.deepEqual(keysZh, keysEn, 'zh 与 en 的 key 集合不一致')
})

test('三套 locale 不允许存在空值文案', async () => {
  const [zh, zhHant, en] = await Promise.all([
    readJson('src/locales/zh.json'),
    readJson('src/locales/zh-Hant.json'),
    readJson('src/locales/en.json'),
  ])

  for (const [label, messages] of [
    ['zh', zh],
    ['zh-Hant', zhHant],
    ['en', en],
  ]) {
    const flat = flatten(messages)
    const empty = Object.keys(flat).filter((k) => !String(flat[k]).trim())
    assert.deepEqual(empty, [], `${label} 存在空值文案 key：${empty.join(', ')}`)
  }
})

test('zh.json 的 stats 保持扁平结构，不再嵌套', async () => {
  const zh = await readJson('src/locales/zh.json')
  assert.equal(zh.stats, undefined, 'stats 不应是嵌套对象')
  assert.equal(typeof zh['stats.title'], 'string')
  assert.equal(typeof zh['stats.subtitle'], 'string')
})

test('zh.json 头部文案与另外两语言对齐（hero/stats/terms）', async () => {
  const [zh, zhHant, en] = await Promise.all([
    readJson('src/locales/zh.json'),
    readJson('src/locales/zh-Hant.json'),
    readJson('src/locales/en.json'),
  ])

  for (const key of [
    'hero.headline.top',
    'hero.headline.bottom',
    'stats.title',
    'policy.terms.description',
    'hero.note',
    'head.title',
    'head.description',
    'image.offlineMsg',
    'image.timeoutMsg',
    'image.retryMsg',
    'image.failedMsg',
  ]) {
    for (const [label, messages] of [
      ['zh', zh],
      ['zh-Hant', zhHant],
      ['en', en],
    ]) {
      assert.ok(String(messages[key]).trim().length > 0, `${label} 的 ${key} 为空`)
    }
  }
})

test('新增 i18n key 在组件源码中不再出现硬编码中文', async () => {
  const sources = await Promise.all([
    readSource('src/components/network-provider.jsx'),
    readSource('src/components/mode-switch-panel.jsx'),
    readSource('src/components/lazy-image-with-fallback.jsx'),
    readSource('src/components/horizontal-feature-scroll.jsx'),
    readSource('src/components/mobile-nav-menu.jsx'),
    readSource('src/components/theme-toggle.jsx'),
    readSource('src/components/scatter-section.jsx'),
    readSource('src/hooks/useImageLoader.js'),
  ])

  const forbidden = [
    '网络连接已断开',
    '网络已恢复',
    '关闭提示',
    '网络已断开',
    '加载失败',
    '重新加载',
    '当前处于离线状态',
    '加载超时，请检查网络连接',
    '秒后自动重试',
    '已重试',
    '模式切换',
    '快速切换常用模式',
    '已开启',
    '已关闭',
    '深度思考',
    '学习模式',
    '关闭菜单',
    '打开菜单',
    '跳过功能展示',
    '跟随系统',
    '深色模式',
    '浅色模式',
    '百度网盘',
    '学习通',
    '知网',
  ]

  for (const source of sources) {
    // 剥离 t('key', 'fallback') 与 label: 'fallback'（合法的兜底文案）
    const withoutFallbacks = source
      .replace(/t\(['"][^'"]+['"],\s*['"][^'"]*['"]/g, 't()')
      .replace(/label:\s*['"][^'"]*['"]/g, 'label: ""')
    for (const text of forbidden) {
      assert.ok(!withoutFallbacks.includes(text), `组件源码仍包含硬编码中文「${text}」`)
    }
  }
})
