/**
 * 把 docs/public/logo-black.svg 的路径数据注入原型模板。
 *
 * 为什么不直接在 HTML 里手抄路径：`d` 是一长串数字，抄错一位就变形，
 * 而这里改一次 SVG 就该重新生成一次。提取 `d` 属性 → JSON → 占位替换，
 * 保证原型用的是与站点同一份路径数据。
 *
 * 用法：node plans/dither-logo/build.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const svgPath = resolve(here, '../../docs/public/logo-black.svg')

const svg = readFileSync(svgPath, 'utf8')
const paths = [...svg.matchAll(/<path\b[^>]*\bd="([^"]+)"/g)].map((m) => m[1])
if (!paths.length) throw new Error(`没从 ${svgPath} 里提取到任何 <path d>`)

const viewBox = svg.match(/viewBox="([^"]+)"/)?.[1] ?? '0 0 126 126'

const tpl = readFileSync(resolve(here, 'template.html'), 'utf8')
const out = tpl
  .replace('/* __LOGO_PATHS__ */ []', JSON.stringify(paths, null, 2))
  .replace('__LOGO_VIEWBOX__', `[${viewBox.split(/\s+/).join(', ')}]`)

writeFileSync(resolve(here, 'prototype.html'), out)
console.log(`✓ prototype.html（${paths.length} 条路径，viewBox ${viewBox}）`)
