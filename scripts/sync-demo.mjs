/**
 * 网页演示的同源镜像同步（首页 hero、学习桌面一节、用户指南每章的功能演示）。
 *
 * 演示是主仓库 deep-student 的构建产物（npm run build:demo）。主仓库每次发正式版，
 * Demo Publish 工作流就用那一版的代码构建演示、逐章烟测，传到 R2：
 *   https://download.deepstudent.cn/demo/<版本>/       整份构建 + manifest.json（文件清单、各章演示目录）
 *   https://download.deepstudent.cn/demo/latest.json   指向最新一版
 * 这里按 manifest 把整份构建抓进 docs/public/demo/（同源：https 页面嵌 http 会被拦、跨域 iframe
 * 吃掉触摸滚动），各章演示目录写进 data/demo-mirror.json 给 GuideDemo 组件读。
 *
 * 增量：manifest 的文件清单（路径 + sha256）就是版本指纹，和本地一致就秒级跳过；
 * 变了才全量重抓（临时目录 + 原子替换，任何一个文件抓不到或校验不过都不动现有镜像）。
 *
 * 用法：
 *   node scripts/sync-demo.mjs            # 跟 latest.json；源站不可用就保留现有镜像并 exit 0
 *   node scripts/sync-demo.mjs --strict   # 抓不到直接失败
 *   node scripts/sync-demo.mjs --force    # 忽略指纹强制重抓
 *   DEMO_SOURCE=https://download.deepstudent.cn/demo/v0.10.4 node scripts/sync-demo.mjs
 *   DEMO_SOURCE=http://127.0.0.1:4173 DEMO_PIN="主仓库 <提交> 的本地构建" node scripts/sync-demo.mjs --force --strict
 *       # 本地构建（dist-demo 先跑 write-demo-manifest.mjs）换镜像并钉住：之后的构建不再跟 latest.json，
 *       # 主仓库发布了同一版后删掉 manifest 的 pinned
 */
import { createHash } from 'node:crypto'
import { mkdir, readFile, rename, rm, stat, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { isPinnedAgainstSync, pinEntryRefs } from './lib/demo-mirror.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DEST_DIR = resolve(__dirname, '../docs/public/demo')
const TMP_DIR = resolve(__dirname, '../docs/.vitepress/tmp-demo-mirror')
const MANIFEST_PATH = resolve(__dirname, '../docs/.vitepress/data/demo-mirror.json')

const LATEST_URL = process.env.DEMO_LATEST || 'https://download.deepstudent.cn/demo/latest.json'
/** 镜像挂在 public/demo/，线上就是 /demo/ —— 入口资源引用要钉在这个前缀下 */
const MOUNT_PATH = 'demo'
/**
 * 入口改名：对话演示叫 index.html（dev 下 VitePress 的 404 fallback 才抢不走 /demo/），
 * 单应用演示叫 app.html。两个入口的资源引用都钉成 /demo/ 下的绝对路径（见 pinEntryRefs）
 */
const ENTRY_RENAMES = { 'demo.html': 'index.html', 'demo-app.html': 'app.html' }
const CONCURRENCY = Number(process.env.DEMO_SYNC_CONCURRENCY || 16)
const TIMEOUT_MS = Number(process.env.DEMO_SYNC_TIMEOUT || 30000)
const USER_AGENT = 'ds-web-demo-sync'

const flags = new Set(process.argv.slice(2))
const STRICT = flags.has('--strict')
const FORCE = flags.has('--force')

const log = (...args) => console.log('[demo]', ...args)
const warn = (...args) => console.warn('[demo]', ...args)
const delay = (ms) => new Promise((r) => setTimeout(r, ms))

async function fetchBuffer(url, retries = 2) {
  let lastError
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(url, {
        redirect: 'follow',
        signal: AbortSignal.timeout(TIMEOUT_MS),
        headers: { 'user-agent': USER_AGENT }
      })
      if (!response.ok) throw new Error(`${url} 返回 ${response.status}`)
      return Buffer.from(await response.arrayBuffer())
    } catch (error) {
      lastError = error
      if (attempt < retries) await delay(400 * (attempt + 1))
    }
  }
  throw lastError
}

const fetchJson = async (url) => JSON.parse((await fetchBuffer(url)).toString('utf-8'))

async function readLocalManifest() {
  try {
    return JSON.parse(await readFile(MANIFEST_PATH, 'utf-8'))
  } catch {
    return null
  }
}

async function exists(path) {
  try {
    await stat(path)
    return true
  } catch {
    return false
  }
}

/** 要同步的那份构建：DEMO_SOURCE 指定，或者 latest.json 指向的最新版 */
async function resolveSource() {
  if (process.env.DEMO_SOURCE) return process.env.DEMO_SOURCE.replace(/\/+$/, '')
  const latest = await fetchJson(`${LATEST_URL}?t=${Date.now()}`)
  if (!latest?.base) throw new Error(`${LATEST_URL} 没有 base`)
  return String(latest.base).replace(/\/+$/, '')
}

/** 文件清单（路径 + sha256）的摘要就是这份构建的指纹 */
export function signatureOfManifest(remote) {
  const lines = remote.files.map((f) => `${f.path}\t${f.sha256}`).sort()
  return createHash('sha256').update(lines.join('\n')).digest('hex')
}

async function download(base, remote) {
  await rm(TMP_DIR, { recursive: true, force: true })
  await mkdir(TMP_DIR, { recursive: true })
  let bytes = 0

  const one = async (file) => {
    let body = await fetchBuffer(`${base}/${file.path.split('/').map(encodeURIComponent).join('/')}`)
    const digest = createHash('sha256').update(body).digest('hex')
    if (digest !== file.sha256) throw new Error(`${file.path} 校验不符（源站文件和清单对不上）`)
    let dest = file.path
    if (ENTRY_RENAMES[file.path]) {
      dest = ENTRY_RENAMES[file.path]
      body = Buffer.from(pinEntryRefs(body.toString('utf-8'), `${base}/${file.path}`, MOUNT_PATH, `${base}/`), 'utf-8')
    }
    const target = resolve(TMP_DIR, dest)
    if (!target.startsWith(TMP_DIR)) throw new Error(`镜像路径越界：${file.path}`)
    await mkdir(dirname(target), { recursive: true })
    await writeFile(target, body)
    bytes += body.length
  }

  const files = remote.files
  for (let i = 0; i < files.length; i += CONCURRENCY) {
    await Promise.all(files.slice(i, i + CONCURRENCY).map(one))
  }
  return { files: files.length, bytes }
}

async function install(stats, info) {
  await rm(DEST_DIR, { recursive: true, force: true })
  await rename(TMP_DIR, DEST_DIR)
  await mkdir(dirname(MANIFEST_PATH), { recursive: true })
  const manifest = { ...info, syncedAt: new Date().toISOString(), ...stats }
  await writeFile(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`, 'utf-8')
}

async function main() {
  const local = await readLocalManifest()
  const mib = (bytes) => ((bytes || 0) / 1048576).toFixed(1)

  if (isPinnedAgainstSync(local, { force: FORCE, explicitSource: Boolean(process.env.DEMO_SOURCE) })) {
    log(`镜像钉在「${local.pinned}」，不跟 latest.json：${local.files} 个文件 / ${mib(local.bytes)} MiB`)
    return
  }

  let base
  let remote
  try {
    base = await resolveSource()
    remote = await fetchJson(`${base}/manifest.json`)
    if (!Array.isArray(remote?.files) || remote.files.length === 0) {
      throw new Error(`${base}/manifest.json 没有文件清单`)
    }
  } catch (error) {
    if (STRICT) throw error
    const installed = await exists(resolve(DEST_DIR, 'index.html'))
    warn(`演示源不可用（${error.message}），${installed ? '沿用已提交的镜像继续构建' : '本地还没有镜像，演示位会退回截图'}`)
    return
  }

  const signature = signatureOfManifest(remote)
  if (!FORCE && local?.signature === signature && (await exists(resolve(DEST_DIR, 'index.html')))) {
    log(`镜像已是最新：演示 ${remote.version}，${local.files} 个文件 / ${mib(local.bytes)} MiB`)
    return
  }

  log(`开始同步演示 ${remote.version}（${base}）→ docs/public/demo/`)
  const stats = await download(base, remote)
  await install(stats, {
    source: base,
    version: remote.version,
    commit: remote.commit ?? null,
    builtAt: remote.builtAt ?? null,
    signature,
    apps: remote.apps ?? [],
    ...(process.env.DEMO_PIN ? { pinned: process.env.DEMO_PIN } : {})
  })
  log(`完成：${stats.files} 个文件 / ${mib(stats.bytes)} MiB，指纹 ${signature.slice(0, 12)}`)
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    warn(error.message)
    process.exit(1)
  })
}
