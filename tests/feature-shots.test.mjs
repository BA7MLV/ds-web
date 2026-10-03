import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readdirSync, readFileSync } from 'node:fs'

import messages from '../docs/.vitepress/theme/i18n/messages/index.js'
import { shotSize } from '../docs/.vitepress/theme/utils/feature-shot.js'

const FEATURES = new URL('../docs/public/features/', import.meta.url)

/**
 * 首页的真实界面截图都是 scripts/gen-features-live.mjs 从演示里截的：同一取景框深浅各一张。
 * 文案里点到的场景缺一张，那扇窗就是空白，或者切到深色主题时空白。
 */
/** 功能区六扇窗 + 「使用流程」带画面的那几步（steps[].art） */
const allShots = (words) => [
  ...words.home.features.scenes.map((scene) => scene.art),
  ...words.home.flow.steps.filter((step) => 'art' in step).map((step) => step.art)
]

/** WebP 的画布尺寸：有损（VP8）、无损（VP8L）、扩展（VP8X）三种文件头 */
const webpSize = (buffer) => {
  assert.equal(buffer.toString('ascii', 0, 4), 'RIFF')
  assert.equal(buffer.toString('ascii', 8, 12), 'WEBP')
  const chunk = buffer.toString('ascii', 12, 16)
  if (chunk === 'VP8 ') return { width: buffer.readUInt16LE(26) & 0x3fff, height: buffer.readUInt16LE(28) & 0x3fff }
  if (chunk === 'VP8L') {
    const bits = buffer.readUInt32LE(21)
    return { width: (bits & 0x3fff) + 1, height: ((bits >>> 14) & 0x3fff) + 1 }
  }
  if (chunk === 'VP8X') return { width: buffer.readUIntLE(24, 3) + 1, height: buffer.readUIntLE(27, 3) + 1 }
  throw new Error(`未知的 WebP 块 ${chunk}`)
}

test('every feature scene ships both real screenshots', () => {
  const shots = new Set()
  for (const [locale, words] of Object.entries(messages)) {
    for (const scene of words.home.features.scenes) {
      assert.ok(scene.art, `${locale} 的「${scene.tab}」没有 art`)
    }
    for (const art of allShots(words)) shots.add(art)
  }
  for (const art of shots) {
    for (const file of [`${art}-light.webp`, `${art}-dark.webp`]) {
      assert.ok(existsSync(new URL(file, FEATURES)), `缺少 features/${file}，重跑 node scripts/gen-features-live.mjs`)
    }
  }
})

test('both locales show the same scenes in the same order', () => {
  const [first, ...rest] = Object.values(messages).map((words) => words.home.features.scenes.map((s) => s.art))
  for (const order of rest) assert.deepEqual(order, first)
})

/**
 * 截图是取景框的 2 倍图，首页组件按 shotSize 写 width / height 占宽高比：
 * 尺寸对不上就会被拉伸或留白；深浅两张不一样大，切主题时版面会跳
 */
test('screenshots match their declared frame size in both themes', () => {
  for (const art of new Set(allShots(messages['zh-CN']))) {
    const { width, height } = shotSize(art)
    for (const theme of ['light', 'dark']) {
      const size = webpSize(readFileSync(new URL(`${art}-${theme}.webp`, FEATURES)))
      assert.deepEqual(size, { width: width * 2, height: height * 2 },
        `features/${art}-${theme}.webp 是 ${size.width}×${size.height}，取景框 ${width}×${height} 应出 ${width * 2}×${height * 2}`)
    }
  }
})

/** 目录里只放首页用得到的截图：换掉的场景、旧的字符画网格（*.json）不该留着跟着部署 */
test('features directory holds only screenshots in use', () => {
  const used = new Set([...new Set(allShots(messages['zh-CN']))].flatMap((art) => [`${art}-light.webp`, `${art}-dark.webp`]))
  const orphans = readdirSync(FEATURES).filter((file) => !used.has(file))
  assert.deepEqual(orphans, [], `features/ 里有没人用的文件：${orphans.join('、')}`)
})
