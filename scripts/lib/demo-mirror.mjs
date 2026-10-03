import { createHash } from 'node:crypto'

/**
 * 首页实时演示镜像的纯逻辑部分：引用提取、路径归一化、闭包签名。
 * 抓取与写盘放在 ../sync-demo.mjs，两者拆开是为了能单测。
 */

/** 只有这些扩展名才值得镜像，其余（页面地址、脚本里的普通字符串）一律跳过 */
const MIRROR_EXT =
  /\.(?:js|mjs|css|png|jpe?g|svg|webp|avif|gif|ico|woff2?|ttf|otf|eot|json|wasm|mp3|mp4|webm|txt|xml)$/i

/** 打包器产出的 chunk / 样式表，缺一个整站就崩，404 必须当错误 */
const CRITICAL_EXT = /\.(?:js|mjs|css)$/i

/**
 * Vite 产物文件名带 8 位内容 hash（`chatV2-BXfVFfUK.js`），这是它和
 * 「依赖里残留的 Node 路径字符串」（`/assets/v1.js`、`/node_modules/...`）的
 * 唯一可靠区别：后者 404 无害，前者 404 就是镜像坏了。
 */
const HASHED_CHUNK = /-[A-Za-z0-9_-]{8}\.(?:js|mjs|css)$/i

/** 打包工具内部路径，源站也不存在，不必浪费请求 */
const NOISE_PATH = /\/node_modules\/|\.pnpm\//

/** 会去解析内部引用的文本类型 */
export const TEXT_EXT = /\.(?:js|mjs|css|html|json|svg|txt|xml)$/i

/**
 * 运行期拼出来的路径（"./${name}.js"、CSS 里的 "#fd_back"、
 * 依赖内部写着 "/package.json" 这类假路径）。
 * 它们抓不到不代表源站缺文件，直接跳过。
 */
const DYNAMIC_PATH = /[{}$`<>|\\\s[\]]|\$%7B|%7B|%7D|%24|\.\.$/

/**
 * 把引用归一化成镜像里的绝对路径。
 * 非同源、非文件、动态拼接的一律返回 null。
 */
export function normalizeRef(raw, baseUrl) {
  if (!raw) return null

  const value = raw.trim()
  if (!value) return null
  if (value.startsWith('#') || value.startsWith('//')) return null
  if (/^(?:data|blob|mailto|tel|javascript|about):/i.test(value)) return null
  if (DYNAMIC_PATH.test(value) || NOISE_PATH.test(value)) return null

  let url
  try {
    url = new URL(value, baseUrl)
  } catch {
    return null
  }

  // 外站资源（字体 CDN、社交链接）留在原地，不镜像
  if (url.origin !== new URL(baseUrl).origin) return null
  if (!MIRROR_EXT.test(url.pathname)) return null

  return url.pathname
}

/**
 * 抽取文本里所有可能要去抓的资源。
 * 返回 Map<pathname, { strict }>；strict 表示「这是打包产物，404 就是镜像不完整」。
 */
export function extractRefs(text, baseUrl) {
  const found = new Map()

  const add = (raw, fromHtml = false) => {
    const path = normalizeRef(raw, baseUrl)
    if (!path) return

    // html 里的 src/href 是入口，带 hash 的则是打包产物，两者缺失都算镜像坏了
    const strict = fromHtml || (CRITICAL_EXT.test(path) && HASHED_CHUNK.test(path))
    const prev = found.get(path)
    if (!prev || (strict && !prev.strict)) found.set(path, { strict })
  }

  // html 属性：<script src> / <link href> / <img src>
  // \b 不能省：workerSrc="a.mjs" 这种属性赋值会被误判成入口引用
  for (const m of text.matchAll(/\b(?:src|href)\s*=\s*["']([^"']+)["']/gi)) add(m[1], true)

  // js 静态 import 与动态 import()
  for (const m of text.matchAll(/(?:from|import)\s*\(?\s*["']([^"']+)["']/g)) add(m[1])

  // 其余字符串字面量里的相对路径：图片、字体、wasm 之类
  for (const m of text.matchAll(/["'`](\.{0,2}\/[^"'`\s]+)["'`]/g)) add(m[1])

  // Vite（base './'）给 JS 里引用的静态资源写成 new URL("todo-RSpTCeB8.svg", import.meta.url)：
  // 文件名前面没有 ./，上一条抓不到（学习桌面的 Dock 图标就是这样漏掉的）
  for (const m of text.matchAll(/new URL\(\s*["'`]([^"'`\s]+)["'`]\s*,\s*import\.meta\.url\s*\)/g)) add(m[1])

  // css url()
  for (const m of text.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)) add(m[1])

  return found
}

/** html 属性里的资源引用，入口改写与抓取引用共用这一个形状 */
const ATTR_REF = /\b(src|href)\s*=\s*(["'])([^"']*)\2/gi

/**
 * 把入口 HTML 里的资源引用钉到镜像的挂载路径上。
 *
 * 打包器给出的入口引用是 `./assets/x.js` 这类相对路径，浏览器按**当前 URL** 解析，
 * 所以镜像换个地址打开就指向另一批文件：
 *   · /demo/index.html → /demo/assets/x.js  ✓
 *   · /demo/           → /demo/assets/x.js  ✓
 *   · /demo            → /assets/x.js       ✗ 落到站点根目录，整站白屏
 * 线上 `cleanUrls: true` 正好把 /demo/index.html 308 到 /demo，演示应用因此起不来，
 * 首页一直停在「正在载入可交互的实时演示…」。写盘前统一改写成根绝对路径，
 * 镜像就与最终 URL 无关了：dev 走 /demo/index.html、线上走 /demo，结果一样。
 *
 * 只改同源且属于镜像范围（MIRROR_EXT）的引用：外站 CDN、页内锚点、
 * 指向非资源页面的链接都原样保留。query 一并带上，避免丢掉带版本参数的资源。
 */
export function pinEntryRefs(html, baseUrl, mountPath) {
  const mount = `/${mountPath.replace(/^\/+/, '').replace(/\/+$/, '')}`
  const origin = new URL(baseUrl).origin

  return html.replace(ATTR_REF, (match, attr, quote, value) => {
    let url
    try {
      url = new URL(value, baseUrl)
    } catch {
      return match
    }
    if (url.origin !== origin || !MIRROR_EXT.test(url.pathname)) return match
    return `${attr}=${quote}${mount}${url.pathname}${url.search}${quote}`
  })
}

/**
 * 镜像钉在一份本地构建上时（manifest.pinned，演示服务器还没部署这一版），构建期的自动同步要跳过：
 * 否则会按服务器入口把新镜像抓回旧版。显式同步（--force 或指定 DEMO_SOURCE）照常进行
 */
export function isPinnedAgainstSync(manifest, { force = false, explicitSource = false } = {}) {
  return Boolean(manifest?.pinned) && !force && !explicitSource
}

/** 入口 HTML 引用的那组资源名就是整站的版本指纹（Vite 文件名带内容 hash） */
export function signatureOf(paths) {
  return createHash('sha256').update([...paths].sort().join('\n')).digest('hex')
}
