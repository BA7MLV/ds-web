/**
 * 首页实时演示（hero 里的应用窗壳）的同源镜像同步。
 *
 * 演示是另一个工程的构建产物。之前直接 iframe 远程地址（47.88.78.106:8010），
 * 带来三个问题：
 *   1. https 站点嵌 http 会被浏览器按混合内容拦掉，线上只能退回骨架；
 *   2. 对方服务器慢或挂，首页就白一块；
 *   3. 跨域 iframe 的 touch 事件在自己的文档里被吃掉，手指落在演示上滑不动页面。
 * 所以改成同源：把 demo 站的静态产物抓进 docs/public/demo/，iframe 走 /demo/。
 *
 * 增量策略：Vite 产物文件名带内容 hash，入口 HTML 引用的那一组 hash 不变就说明
 * 整站没变，秒级跳过；变了才全量重抓（临时目录 + 原子替换，失败不动现有镜像）。
 *
 * 用法：
 *   node scripts/sync-demo.mjs            # 增量同步，抓不到就保留现有镜像并 exit 0
 *   node scripts/sync-demo.mjs --strict   # 抓不到直接失败（用于人工确认发布内容）
 *   node scripts/sync-demo.mjs --force    # 忽略指纹，强制重抓
 *   DEMO_SOURCE=https://... node scripts/sync-demo.mjs
 */
import { mkdir, readFile, rename, rm, stat, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { extractRefs, pinEntryRefs, signatureOf, TEXT_EXT } from './lib/demo-mirror.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DEST_DIR = resolve(__dirname, '../docs/public/demo')
const TMP_DIR = resolve(__dirname, '../docs/.vitepress/tmp-demo-mirror')
const MANIFEST_PATH = resolve(__dirname, '../docs/.vitepress/data/demo-mirror.json')

const SOURCE = (process.env.DEMO_SOURCE || 'http://47.88.78.106:8010').replace(/\/+$/, '')
const ENTRY_PATH = '/demo.html'
/** 入口在镜像里改名叫 index.html，dev 下 VitePress 404 fallback 才抢不走 */
const ENTRY_DEST = 'index.html'
/** 镜像挂在 public/demo/，线上就是 /demo/ —— 入口资源引用要钉在这个前缀下 */
const MOUNT_PATH = 'demo'
/**
 * 入口写盘方式改了就把指纹算作变一次，逼着重抓一次把老镜像换掉；
 * 否则增量跳过会让改写前的镜像一直留在盘上。
 */
const ENTRY_REVISION = 'entry-pinned-v1'
const CONCURRENCY = Number(process.env.DEMO_SYNC_CONCURRENCY || 16)
const TIMEOUT_MS = Number(process.env.DEMO_SYNC_TIMEOUT || 30000)
const USER_AGENT = 'ds-web-demo-sync'

const flags = new Set(process.argv.slice(2))
const STRICT = flags.has('--strict')
const FORCE = flags.has('--force')

const log = (...args) => console.log('[demo]', ...args)
const warn = (...args) => console.warn('[demo]', ...args)

async function fetchWithTimeout(url) {
  return fetch(url, {
    redirect: 'follow',
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: { 'user-agent': USER_AGENT }
  })
}

const delay = (ms) => new Promise((r) => setTimeout(r, ms))

/**
 * 抓一个资源，返回 { body } 或 { status }。
 * 超时与连接错误重试（对方服务器是台普通机器，偶尔顶不住并发），4xx 不重试。
 */
async function fetchResource(pathname, retries = 2) {
  let lastError

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetchWithTimeout(`${SOURCE}${pathname}`)
      if (!response.ok) return { status: response.status }
      return { body: Buffer.from(await response.arrayBuffer()) }
    } catch (error) {
      lastError = error
      if (attempt < retries) await delay(400 * (attempt + 1))
    }
  }

  throw lastError
}

async function readManifest() {
  try {
    return JSON.parse(await readFile(MANIFEST_PATH, 'utf-8'))
  } catch {
    return null
  }
}

async function fileSize(path) {
  try {
    return (await stat(path)).size
  } catch {
    return -1
  }
}

async function readEntryHtml() {
  const response = await fetchWithTimeout(`${SOURCE}${ENTRY_PATH}`)
  if (!response.ok) {
    throw new Error(`入口 ${ENTRY_PATH} 返回 ${response.status} ${response.statusText}`)
  }
  return response.text()
}

/**
 * 指纹一致还不够，得确认镜像真的在盘上（首次 clone 后 manifest 可能先于目录存在）。
 */
async function mirrorIntact(manifest, signature) {
  if (!manifest || manifest.signature !== signature) return false
  return (await fileSize(resolve(DEST_DIR, ENTRY_DEST))) >= 0
}

/**
 * 按层展开引用：同一层并发抓，抓完解析出下一层再继续。
 * 用「层」而不是共享队列，是为了避免 worker 看到队列暂时为空就提前退出。
 */
async function crawl(entryHtml) {
  await rm(TMP_DIR, { recursive: true, force: true })
  await mkdir(TMP_DIR, { recursive: true })

  const seen = new Set()
  const missing = []
  let bytes = 0
  let files = 0

  const writeFileSafe = async (pathname, body) => {
    // 资源是 /assets/x 这种绝对路径，落盘要挂到临时目录下；入口的 index.html 不带斜杠
    const relative = pathname.startsWith('/') ? `.${pathname}` : pathname
    const dest = resolve(TMP_DIR, relative)
    if (!dest.startsWith(TMP_DIR)) throw new Error(`镜像路径越界：${pathname}`)
    await mkdir(dirname(dest), { recursive: true })
    await writeFile(dest, body)
    bytes += body.length
    files += 1
  }

  /** 抓一个资源，返回它里面发现的下一层引用 */
  const readOne = async (pathname, strict) => {
    let result
    try {
      result = await fetchResource(pathname)
    } catch (error) {
      missing.push({ pathname, strict, reason: error.message })
      return []
    }

    if (result.status) {
      missing.push({ pathname, strict, reason: String(result.status) })
      return []
    }

    const body = result.body
    let decoded = pathname
    try {
      decoded = decodeURIComponent(pathname)
    } catch {
      /* 保留编码形式写盘 */
    }
    await writeFileSafe(decoded, body)

    if (!TEXT_EXT.test(pathname)) return []

    const next = []
    for (const [ref, meta] of extractRefs(body.toString('utf-8'), `${SOURCE}${pathname}`)) {
      if (ref === pathname || seen.has(ref)) continue
      seen.add(ref)
      next.push([ref, meta.strict])
    }
    return next
  }

  // 入口先写盘（改名为 index.html，并把资源引用钉到 /demo/ 下），再展开它的引用。
  // 抓取仍按源站的原始 HTML 走：pin 只改落盘形态，不该影响往哪抓。
  await writeFileSafe(
    ENTRY_DEST,
    Buffer.from(pinEntryRefs(entryHtml, `${SOURCE}${ENTRY_PATH}`, MOUNT_PATH), 'utf-8')
  )

  let layer = []
  for (const [ref, meta] of extractRefs(entryHtml, `${SOURCE}${ENTRY_PATH}`)) {
    if (seen.has(ref)) continue
    seen.add(ref)
    layer.push([ref, meta.strict])
  }

  while (layer.length) {
    const results = []
    for (let i = 0; i < layer.length; i += CONCURRENCY) {
      const slice = layer.slice(i, i + CONCURRENCY)
      results.push(...(await Promise.all(slice.map(([ref, strict]) => readOne(ref, strict)))).flat())
    }
    layer = results
  }

  // 打包产物缺失说明源站自相矛盾（部署到一半、产物被清过），不能上线
  const broken = missing.filter((item) => item.strict)
  if (broken.length) {
    const detail = broken.map((item) => `${item.pathname}（${item.reason}）`).join('\n  ')
    throw new Error(`镜像不完整，缺失 ${broken.length} 个打包产物：\n  ${detail}`)
  }

  const skipped = missing.length
  if (skipped) {
    warn(`跳过 ${skipped} 个抓不到的资源（运行期拼接的假路径，源站同样 404）`)
  }

  return { files, bytes, missing: skipped }
}

async function installMirror(stats, signature) {
  await rm(DEST_DIR, { recursive: true, force: true })
  await rename(TMP_DIR, DEST_DIR)

  await mkdir(dirname(MANIFEST_PATH), { recursive: true })
  await writeFile(
    MANIFEST_PATH,
    `${JSON.stringify(
      {
        source: SOURCE,
        entry: ENTRY_PATH,
        signature,
        syncedAt: new Date().toISOString(),
        files: stats.files,
        bytes: stats.bytes,
        skipped: stats.missing
      },
      null,
      2
    )}\n`,
    'utf-8'
  )
}

async function main() {
  const manifest = await readManifest()

  let entryHtml
  try {
    entryHtml = await readEntryHtml()
  } catch (error) {
    const installed = (await fileSize(resolve(DEST_DIR, ENTRY_DEST))) >= 0
    const explain = installed
      ? '沿用已提交的镜像继续构建'
      : '本地还没有镜像，首页会退回界面截图'
    if (STRICT) throw error
    warn(`源站不可用（${error.message}），${explain}`)
    return
  }

  const entryRefs = [...extractRefs(entryHtml, `${SOURCE}${ENTRY_PATH}`).keys()]
  const signature = signatureOf([...entryRefs, ENTRY_REVISION])

  if (!FORCE && (await mirrorIntact(manifest, signature))) {
    const size = ((manifest.bytes || 0) / 1024 / 1024).toFixed(1)
    log(`镜像已是最新：${manifest.files} 个文件 / ${size} MiB（源站 ${SOURCE}）`)
    return
  }

  log(`开始同步 ${SOURCE}${ENTRY_PATH} → docs/public/demo/`)
  const stats = await crawl(entryHtml)
  await installMirror(stats, signature)

  const size = (stats.bytes / 1024 / 1024).toFixed(1)
  log(`完成：${stats.files} 个文件 / ${size} MiB，指纹 ${signature.slice(0, 12)}`)
}

main().catch((error) => {
  warn(error.message)
  process.exit(1)
})
