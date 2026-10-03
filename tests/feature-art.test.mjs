import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

import messages from '../docs/.vitepress/theme/i18n/messages/index.js'

const FEATURES = new URL('../docs/public/features/', import.meta.url)

/**
 * 功能区每个场景的字符画都是 scripts/gen-features-live.mjs 从演示界面生成的：
 * 一份网格 JSON + 同一取景框的深浅两张截图。文案里点到的场景缺一样，
 * 那一张就会是空白窗或悬停后什么也不出现。
 */
test('every feature scene ships its character grid and both real screenshots', () => {
  const arts = new Set()
  for (const [locale, words] of Object.entries(messages)) {
    for (const scene of words.home.features.scenes) {
      assert.ok(scene.art, `${locale} 的「${scene.tab}」没有 art`)
      arts.add(scene.art)
    }
  }
  for (const art of arts) {
    for (const file of [`${art}.json`, `${art}-light.webp`, `${art}-dark.webp`]) {
      assert.ok(existsSync(new URL(file, FEATURES)), `缺少 features/${file}，重跑 node scripts/gen-features-live.mjs`)
    }
  }
})

test('both locales show the same scenes in the same order', () => {
  const [first, ...rest] = Object.values(messages).map((words) => words.home.features.scenes.map((s) => s.art))
  for (const order of rest) assert.deepEqual(order, first)
})

/**
 * 运行时按码点切每一行（[...line]），全角字后面跟一个 \u0000 占第二格；
 * 行数、每行格数、墨色档位都得和网格声明的一致，否则画出来会错位。
 */
test('feature grids are well-formed', () => {
  const arts = new Set(messages['zh-CN'].home.features.scenes.map((s) => s.art))
  for (const art of arts) {
    const grid = JSON.parse(readFileSync(new URL(`${art}.json`, FEATURES), 'utf8'))
    assert.equal(grid.lines.length, grid.rows, `${art}：行数不对`)
    assert.equal(grid.inks.length, grid.rows, `${art}：墨色行数不对`)
    grid.lines.forEach((line, r) => {
      const cells = [...line]
      assert.equal(cells.length, grid.cols, `${art} 第 ${r} 行有 ${cells.length} 格`)
      assert.equal([...grid.inks[r]].length, grid.cols, `${art} 第 ${r} 行墨色格数不对`)
      assert.match(grid.inks[r], /^[ dnba]*$/, `${art} 第 ${r} 行有未知墨色`)
      cells.forEach((chr, c) => {
        if (chr === '\u0000') assert.ok(c > 0 && cells[c - 1] !== ' ', `${art} 第 ${r} 行第 ${c} 格：占位前面没有字`)
      })
    })
    // 一扇窗至少得画出点东西：一屏里少于 60 个字说明取景框没对准
    const ink = grid.lines.join('').replaceAll('\u0000', '').replace(/\s/g, '').length
    assert.ok(ink >= 60, `${art} 只有 ${ink} 个字符，取景框可能落空了`)
  }
})
