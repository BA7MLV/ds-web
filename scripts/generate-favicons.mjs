import fs from 'node:fs'
import path from 'node:path'
import { initWasm, Resvg } from '@resvg/resvg-wasm'

const readUtf8 = (filePath) => fs.readFileSync(filePath, 'utf8')

const renderPng = (svg, size, background) => {
  const options = {
    fitTo: { mode: 'width', value: size },
    ...(background ? { background } : {}),
  }
  const resvg = new Resvg(svg, options)
  const rendered = resvg.render()
  const png = Buffer.from(rendered.asPng())
  rendered.free()
  resvg.free()
  return png
}

// Build an .ico that embeds PNGs (modern, widely supported).
const buildIco = (entries) => {
  const count = entries.length
  const headerSize = 6 + count * 16
  let offset = headerSize

  const dir = Buffer.alloc(headerSize)
  dir.writeUInt16LE(0, 0) // reserved
  dir.writeUInt16LE(1, 2) // type=icon
  dir.writeUInt16LE(count, 4)

  const images = []
  for (let i = 0; i < entries.length; i += 1) {
    const { size, png } = entries[i]
    const widthByte = size === 256 ? 0 : size
    const heightByte = size === 256 ? 0 : size
    const entryOffset = 6 + i * 16

    dir.writeUInt8(widthByte, entryOffset + 0)
    dir.writeUInt8(heightByte, entryOffset + 1)
    dir.writeUInt8(0, entryOffset + 2) // color count
    dir.writeUInt8(0, entryOffset + 3) // reserved
    dir.writeUInt16LE(1, entryOffset + 4) // planes
    dir.writeUInt16LE(32, entryOffset + 6) // bit count
    dir.writeUInt32LE(png.length, entryOffset + 8)
    dir.writeUInt32LE(offset, entryOffset + 12)

    images.push(png)
    offset += png.length
  }

  return Buffer.concat([dir, ...images])
}

const main = async () => {
  const rootDir = process.cwd()

  const wasmPath = path.join(rootDir, 'node_modules/@resvg/resvg-wasm/index_bg.wasm')
  await initWasm(fs.readFileSync(wasmPath))

  const svgPath = process.argv[2] ?? path.join(rootDir, 'public/favicon.svg')
  const svg = readUtf8(svgPath)

  // Transparent favicon keeps the browser tab UI background.
  // For iOS home screen, a solid background generally looks better.
  const faviconBackground = process.env.FAVICON_BG
  const appleTouchBackground = process.env.APPLE_TOUCH_BG ?? 'rgba(255,255,255,1)'

  const ico = buildIco(
    [16, 32, 48, 64].map((size) => ({ size, png: renderPng(svg, size, faviconBackground) }))
  )
  const appleTouch = renderPng(svg, 180, appleTouchBackground)

  const outputs = [
    ['public/favicon.ico', ico],
    ['public/apple-touch-icon.png', appleTouch],
    ['docs/public/favicon.ico', ico],
    ['docs/public/apple-touch-icon.png', appleTouch],
  ]

  for (const [relPath, content] of outputs) {
    const absPath = path.join(rootDir, relPath)
    fs.mkdirSync(path.dirname(absPath), { recursive: true })
    fs.writeFileSync(absPath, content)
  }

  // eslint-disable-next-line no-console
  console.log('Favicons generated:')
  // eslint-disable-next-line no-console
  console.log('- public/favicon.ico')
  // eslint-disable-next-line no-console
  console.log('- public/apple-touch-icon.png')
  // eslint-disable-next-line no-console
  console.log('- docs/public/favicon.ico')
  // eslint-disable-next-line no-console
  console.log('- docs/public/apple-touch-icon.png')
}

await main()
