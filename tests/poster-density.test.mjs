import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile, stat } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const PUBLIC_DIR = fileURLToPath(new URL('../docs/public/', import.meta.url))

/**
 * Hero 界面截图的密度与体积。
 *
 * 截图按 iframe 的真实渲染尺寸抓（桌面 1112×773、手机 296×569），
 * 密度不够时高分屏会把它放大、文字发虚。这里的下限是算过账的，不是随手定的：
 *
 *   桌面 2× —— 升到 3× 要 119 KB（+51 KB），而 DPR 3 的桌面屏极少，不值；
 *   手机 3× —— 44 KB，只比 2× 的 37 KB 多 7 KB，而手机几乎全是 3× 屏。
 *             2× 时正好欠 1.5×，最多数人看的是发虚的那版。
 *
 * 抓法与重拍步骤见 theme/components/AppShell.vue 顶部注释。
 * 手抖用 2× 重拍就是拿多数人的清晰度换 7 KB，这条测试就是为了不让它溜过去。
 */
const POSTERS = [
  { file: 'demo-poster.webp', css: 1112, ratio: 773 / 1112, minPpi: 2, maxKb: 96 },
  { file: 'demo-poster-dark.webp', css: 1112, ratio: 773 / 1112, minPpi: 2, maxKb: 96 },
  { file: 'demo-poster-mobile@3x.webp', css: 296, ratio: 569 / 296, minPpi: 3, maxKb: 60 },
  { file: 'demo-poster-mobile-dark@3x.webp', css: 296, ratio: 569 / 296, minPpi: 3, maxKb: 60 }
]

test('hero posters are dense enough for the screens that will show them', async () => {
  for (const { file, css, ratio, minPpi } of POSTERS) {
    const size = readWebpSize(await readFile(`${PUBLIC_DIR}${file}`))
    const ppi = size.width / css

    assert.ok(
      ppi >= minPpi,
      `${file} 只有 ${ppi.toFixed(2)} px/CSS px，低于 ${minPpi} —— 重拍时 DPR 掉了？`
    )
    // 比例必须和 iframe 实际渲染尺寸一致，否则换帧时整屏重排
    const actual = size.height / size.width
    assert.ok(
      Math.abs(actual - ratio) / ratio < 0.01,
      `${file} 比例 ${actual.toFixed(3)} 与渲染尺寸 ${ratio.toFixed(3)} 不符`
    )
  }
})

test('hero posters stay inside their byte budget', async () => {
  for (const { file, maxKb } of POSTERS) {
    const { size } = await stat(`${PUBLIC_DIR}${file}`)
    assert.ok(
      size / 1024 <= maxKb,
      `${file} ${Math.round(size / 1024)} KB，超过 ${maxKb} KB 的预算`
    )
  }
})

/** 从 WebP 容器读画布尺寸：VP8X / VP8 / VP8L 三种变体各有一处。 */
function readWebpSize(bytes) {
  assert.equal(bytes.subarray(0, 4).toString('ascii'), 'RIFF', '不是 RIFF 容器')
  assert.equal(bytes.subarray(8, 12).toString('ascii'), 'WEBP', '不是 WebP')

  let offset = 12
  while (offset + 8 <= bytes.length) {
    const fourcc = bytes.subarray(offset, offset + 4).toString('ascii')
    const chunkSize = bytes.readUIntLE(offset + 4, 4)
    if (fourcc === 'VP8X') {
      return {
        width: 1 + bytes.readUIntLE(offset + 12, 3),
        height: 1 + bytes.readUIntLE(offset + 15, 3)
      }
    }
    if (fourcc === 'VP8 ') {
      // 有损位流：payload 头 3 字节帧标记 + 3 字节起始码 9d012a，其后才是宽高
      assert.equal(
        bytes.subarray(offset + 11, offset + 14).toString('hex'),
        '9d012a',
        'VP8 起始码不对，位流解析可能失效'
      )
      return {
        width: bytes.readUInt16LE(offset + 14) & 0x3fff,
        height: bytes.readUInt16LE(offset + 16) & 0x3fff
      }
    }
    if (fourcc === 'VP8L') {
      const bits = bytes.readUInt32LE(offset + 9)
      return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 }
    }
    offset += 8 + chunkSize + (chunkSize % 2)
  }
  throw new Error('WebP 容器里找不到画布尺寸')
}
