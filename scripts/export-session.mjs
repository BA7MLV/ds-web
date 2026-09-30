#!/usr/bin/env node
/**
 * 把 WorkBuddy 的会话上下文导出成 JSON（或 Markdown）。
 *
 * 数据源是本机 ~/.workbuddy/projects/<cwd 转成的目录名>/<sessionId>.jsonl，
 * 每行一条记录（message / function_call / function_call_result / reasoning /
 * ai-title / file-history-snapshot）。这份脚本只做读取与整理，不改任何东西。
 *
 * 用法：
 *   node scripts/export-session.mjs --list              # 列出当前项目的所有会话
 *   node scripts/export-session.mjs                      # 导出当前会话，打到标准输出
 *   node scripts/export-session.mjs --out ctx.json       # 导出到文件
 *   node scripts/export-session.mjs --format md          # 导出成 Markdown 可读稿
 *   node scripts/export-session.mjs --session <id|latest>
 *   node scripts/export-session.mjs --include-reasoning --tool-output full
 *
 * 截取一段（「上下文从这条开始」）：
 *   node scripts/export-session.mjs --from "你觉得 hero 页面的 dithering"
 *   node scripts/export-session.mjs --from 15 --to 20              # 按消息序号（闭区间）
 *   node scripts/export-session.mjs --from "…" --from-occurrence first
 *
 *   --from / --to 给数字是消息序号；给文字就在正文里找包含它的那条。
 *   文字默认匹配**最后**一次出现（说「从这里开始」通常指的是最近这一次提问）；
 *   要匹配第一次就加 --from-occurrence first。匹配的序号与摘要会打到标准错误，
 *   导出文件里的 range 字段也记着，方便事后确认切对了没有。
 *   匹配会先忽略空白与常见中英文标点，失败时再退化成只比前 10 个字。
 *   counts / filesTouched 都按截取后的范围重算，不是全会话的。
 *
 * 默认行为（都是为了避免把注入内容当成对话倒出去）：
 *   - 剥掉 <system-reminder>…</system-reminder>：那是每轮注入的 user_info /
 *     identity_context / project_context，不是人说的话，占了绝大部分体积。
 *   - 不带 reasoning：那是模型的原始思考链，默认不外带。
 *   - 工具输出只留前 N 字符预览（--tool-output 控制）。
 */

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { homedir } from 'node:os'

const HOME = homedir()
const SESSIONS_DIR = join(HOME, '.workbuddy', 'sessions')
const PROJECTS_DIR = join(HOME, '.workbuddy', 'projects')

const SCHEMA = 'workbuddy-session-export/v1'
const DEFAULT_PREVIEW = 1200

/* ── 参数 ─────────────────────────────────────────────────────────── */

const argv = process.argv.slice(2)
const flag = (name) => argv.includes(`--${name}`)
const value = (name, fallback) => {
  const i = argv.indexOf(`--${name}`)
  return i >= 0 && argv[i + 1] ? argv[i + 1] : fallback
}

const cwd = process.cwd()
const wantList = flag('list')
const wantReasoning = flag('include-reasoning')
const keepReminders = flag('keep-system-reminders')
const format = value('format', 'json')
const outPath = value('out', '')
const sessionArg = value('session', 'current')
const toolOutputMode = value('tool-output', 'preview')
const maxChars = Number(value('max-output-chars', DEFAULT_PREVIEW))
const fromArg = value('from', '')
const toArg = value('to', '')
const occurrence = value('from-occurrence', 'last') // 文字匹配取第一次还是最后一次

/* ── 定位会话 ─────────────────────────────────────────────────────── */

const projectDirFor = (dir) => join(PROJECTS_DIR, dir.slice(1).replace(/\//g, '-'))

const readJson = (file) => {
  try {
    return JSON.parse(readFileSync(file, 'utf8'))
  } catch {
    return null
  }
}

/** 当前目录下所有会话，按最近修改排序 */
const listSessions = (dir) => {
  const dirPath = projectDirFor(dir)
  if (!existsSync(dirPath)) return []
  return readdirSync(dirPath)
    .filter((f) => f.endsWith('.jsonl'))
    .map((f) => {
      const file = join(dirPath, f)
      const id = f.replace(/\.jsonl$/, '')
      let title = ''
      let firstTs = null
      // 标题在 ai-title 记录里，文件可能很大，只读前若干行找它
      const head = readFileSync(file, 'utf8').slice(0, 200_000)
      for (const line of head.split('\n')) {
        if (!line.trim()) continue
        let o
        try {
          o = JSON.parse(line)
        } catch {
          continue
        }
        if (firstTs == null && o.timestamp) firstTs = o.timestamp
        if (o.type === 'ai-title' && o.aiTitle) {
          title = o.aiTitle
          break
        }
      }
      return { id, file, title, mtimeMs: statSync(file).mtimeMs, startedAt: firstTs }
    })
    .sort((a, b) => b.mtimeMs - a.mtimeMs)
}

/** 「当前会话」：进程表里记着哪个 session 属于这个 cwd 且心跳最新 */
const currentSessionId = (dir) => {
  if (!existsSync(SESSIONS_DIR)) return null
  const alive = readdirSync(SESSIONS_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => readJson(join(SESSIONS_DIR, f)))
    .filter((s) => s && s.sessionId && s.cwd === dir)
    .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
  return alive.length ? alive[0].sessionId : null
}

const sessions = listSessions(cwd)

if (wantList) {
  const current = currentSessionId(cwd)
  for (const s of sessions) {
    const mark = s.id === current ? '*' : ' '
    const when = new Date(s.startedAt || s.mtimeMs).toLocaleString('zh-CN')
    const size = (statSync(s.file).size / 1024 / 1024).toFixed(1)
    console.log(`${mark} ${s.id}  ${when}  ${size}MB  ${s.title || '(无标题)'}`)
  }
  process.exit(0)
}

if (!sessions.length) {
  console.error(`找不到会话：${projectDirFor(cwd)} 下没有 .jsonl`)
  process.exit(1)
}

let target
if (sessionArg === 'latest') {
  target = sessions[0]
} else if (sessionArg === 'current') {
  const id = currentSessionId(cwd) || sessions[0].id
  target = sessions.find((s) => s.id === id) || sessions[0]
} else {
  target = sessions.find((s) => s.id.startsWith(sessionArg))
  if (!target) {
    console.error(`没有 id 以 ${sessionArg} 开头的会话，用 --list 看看`)
    process.exit(1)
  }
}

/* ── 整理 ─────────────────────────────────────────────────────────── */

const stripReminders = (text) =>
  text
    .replace(/<system-reminder[\s\S]*?<\/system-reminder>\s*/g, '')
    .replace(/<system-reminder[\s\S]*$/g, '')
    /* <user_query> 是端侧包在真正提问外面的壳，脱掉它拿到的才是人说的话 */
    .replace(/^\s*<user_query>([\s\S]*?)<\/user_query>\s*$/, '$1')
    .trim()

const joinContent = (content) =>
  Array.isArray(content)
    ? content
        .map((c) => (typeof c?.text === 'string' ? c.text : ''))
        .filter(Boolean)
        .join('\n')
        .trim()
    : ''

const parseArgs = (raw) => {
  if (raw == null) return null
  if (typeof raw === 'object') return raw
  try {
    return JSON.parse(raw)
  } catch {
    return raw
  }
}

const clip = (text) => {
  if (toolOutputMode === 'full') return text
  if (toolOutputMode === 'none') return ''
  return text.length > maxChars ? `${text.slice(0, maxChars)}\n…[截断 ${text.length - maxChars} 字符]` : text
}

/** 从工具参数里捡出看起来像本仓库文件的路径 */
const filesInArgs = (args, dir) => {
  const found = []
  const walk = (node) => {
    if (typeof node === 'string') {
      if (node.includes('/') && /^\.?\/?[\w.-]+\//.test(node)) found.push(node)
      return
    }
    if (Array.isArray(node)) return node.forEach(walk)
    if (node && typeof node === 'object') return Object.values(node).forEach(walk)
  }
  walk(args)
  return found
    .map((p) => (p.startsWith('/') ? p : `${dir}/${p}`))
    .filter((p) => p.startsWith(dir))
    .map((p) => p.slice(dir.length + 1))
}

const counts = { user: 0, assistant: 0, toolCalls: 0, toolResults: 0, reasoning: 0 }
const messages = []
const touched = new Set()
const resultsById = new Map()
const callsById = new Map()

/** 先收齐所有记录，再按 parentId 把结果挂回调用上 */
const records = []
const raw = readFileSync(target.file, 'utf8')
for (const line of raw.split('\n')) {
  if (!line.trim()) continue
  try {
    records.push(JSON.parse(line))
  } catch {
    /* 最后一行可能写了一半，跳过 */
  }
}

for (const o of records) {
  if (o.type === 'function_call_result') {
    counts.toolResults += 1
    const text = typeof o.output?.text === 'string' ? o.output.text : ''
    resultsById.set(o.parentId ?? o.callId, text)
  }
}

for (const o of records) {
  if (o.type === 'ai-title' && o.aiTitle && !target.title) target.title = o.aiTitle
  if (o.type === 'file-history-snapshot' || o.type === 'ai-title') continue

  if (o.type === 'message' && o.role) {
    const rawText = joinContent(o.content)
    const text = (o.role === 'user' && !keepReminders ? stripReminders(rawText) : rawText).trim()
    if (!text) continue
    counts[o.role] += 1
    messages.push({ id: o.id, ts: o.timestamp, role: o.role, text, tools: [], reasoning: [] })
    continue
  }

  if (o.type === 'function_call') {
    counts.toolCalls += 1
    const args = parseArgs(o.arguments)
    const result = resultsById.get(o.id) ?? ''
    filesInArgs(args, cwd).forEach((f) => touched.add(f))
    callsById.set(o.id, {
      id: o.id,
      ts: o.timestamp,
      name: o.name,
      args,
      status: resultsById.has(o.id) ? 'completed' : 'unknown',
      result: clip(result)
    })
    const host = messages[messages.length - 1]
    if (host && host.role === 'assistant') host.tools.push(callsById.get(o.id))
    else {
      messages.push({
        id: o.parentId || o.id,
        ts: o.timestamp,
        role: 'assistant',
        text: '',
        tools: [callsById.get(o.id)],
        reasoning: []
      })
    }
    continue
  }

  if (o.type === 'reasoning') {
    counts.reasoning += 1
    if (!wantReasoning) continue
    const text = joinContent(o.rawContent ?? o.content)
    if (!text) continue
    const host = messages[messages.length - 1]
    if (host && host.role === 'assistant') host.reasoning.push(text)
    else
      messages.push({
        id: o.id,
        ts: o.timestamp,
        role: 'assistant',
        text: '',
        tools: [],
        reasoning: [text]
      })
  }
}

/* 工具调用先于最终回复出现，这里把它们归到「最近一条 assistant」而不是新建一条 */
messages.forEach((m) => {
  if (!m.reasoning.length) delete m.reasoning
})

const iso = (ms) => (ms ? new Date(ms).toISOString() : null)

/* ── 截取范围：--from / --to ──────────────────────────────────────── */

/** 归一化后再比：忽略空白与常见标点，容忍全角/半角与换行差异 */
const norm = (s) =>
  String(s)
    .replace(/\s+/g, '')
    .replace(/[，。！？、；：""''（）《》「」.,!?;:'"()]/g, '')

/**
 * 定位一条消息。数字 = 序号；文字 = 正文里找包含它的那条。
 * pick='last' 时取最后一次出现 —— 「从这里开始」一般指最近这次提问。
 */
const locate = (list, spec, pick) => {
  if (/^\d+$/.test(spec)) {
    return { index: Math.max(0, Math.min(Number(spec), list.length - 1)), how: 'index', hits: 1 }
  }
  const key = norm(spec)
  const hitAt = (k) => list.reduce((acc, m, i) => (norm(m.text).includes(k) ? [...acc, i] : acc), [])
  let hits = hitAt(key)
  let how = 'text'
  if (!hits.length) {
    /* 退化：只比前 10 个字，容忍用户只记得半句 */
    hits = hitAt(key.slice(0, 10))
    how = 'text/prefix'
  }
  if (!hits.length) {
    console.error(`--from/--to 没匹配到任何消息：${spec}`)
    console.error('提示：先不带参数全量导出一次，看 messages[].n 的序号，再用数字指定。')
    process.exit(1)
  }
  return { index: pick === 'first' ? hits[0] : hits[hits.length - 1], how, hits }
}

const summary = (m, i, how, hits = []) => ({
  n: i,
  ts: iso(m.ts),
  role: m.role,
  matchedBy: how,
  matchedCount: hits.length,
  /* 命中多条时把候选都记下来，方便核对是不是切到了想要的那条 */
  candidates:
    hits.length > 1
      ? hits.map((h) => ({ n: h, ts: iso(messages[h].ts), preview: messages[h].text.replace(/\s+/g, ' ').slice(0, 50) }))
      : undefined,
  preview: m.text.replace(/\s+/g, ' ').slice(0, 80)
})

let ranged = messages
let range = { from: null, to: null, total: messages.length, exported: messages.length }

if (fromArg || toArg) {
  const a = fromArg ? locate(messages, fromArg, occurrence) : { index: 0, how: 'start', hits: 1 }
  const b = toArg ? locate(messages, toArg, occurrence) : { index: messages.length - 1, how: 'end', hits: 1 }
  const lo = Math.min(a.index, b.index)
  const hi = Math.max(a.index, b.index)
  ranged = messages.slice(lo, hi + 1)
  range = {
    from: summary(messages[lo], lo, a.how, a.hits),
    to: summary(messages[hi], hi, b.how, b.hits),
    total: messages.length,
    exported: ranged.length
  }
}

/* counts 与 filesTouched 按截取后的范围重算：不截取时沿用全会话的 */
const recount = (list) => {
  const c = { user: 0, assistant: 0, toolCalls: 0, toolResults: 0, reasoning: 0 }
  for (const m of list) {
    if (m.role === 'user') c.user += 1
    else c.assistant += 1
    const tools = m.tools || []
    c.toolCalls += tools.length
    c.toolResults += tools.filter((t) => t.status === 'completed').length
    c.reasoning += (m.reasoning || []).length
  }
  return c
}

const rangeCounts = ranged === messages ? counts : recount(ranged)

const rangeFiles = new Set()
for (const m of ranged) {
  for (const t of m.tools || []) filesInArgs(t.args, cwd).forEach((f) => rangeFiles.add(f))
}

const payload = {
  schema: SCHEMA,
  exportedAt: new Date().toISOString(),
  session: {
    id: target.id,
    cwd,
    title: target.title || null,
    startedAt: iso(target.startedAt),
    lastWriteAt: iso(target.mtimeMs),
    sourceFile: target.file
  },
  counts: rangeCounts,
  filesTouched: [...rangeFiles].sort(),
  range,
  messages: ranged.map((m, i) => ({
    i,
    n: range.from ? range.from.n + i : i,
    id: m.id,
    ts: iso(m.ts),
    role: m.role,
    text: m.text,
    ...(m.reasoning ? { reasoning: m.reasoning } : {}),
    ...(m.tools.length ? { tools: m.tools } : {})
  }))
}

/* ── 输出 ─────────────────────────────────────────────────────────── */

const toMarkdown = (data) => {
  const lines = [
    `# ${data.session.title || '会话导出'}`,
    '',
    `- 会话 ID：\`${data.session.id}\``,
    `- 目录：\`${data.session.cwd}\``,
    `- 导出时间：${data.exportedAt}`,
    `- 计数：用户 ${data.counts.user} 条 / 助手 ${data.counts.assistant} 条 / 工具调用 ${data.counts.toolCalls} 次`,
    ''
  ]
  if (data.range?.from) {
    lines.push(
      `- 范围：第 ${data.range.from.n} 条 → 第 ${data.range.to.n} 条（共 ${data.range.total} 条，导出 ${data.range.exported} 条）`,
      '',
      `  起点是 ${data.range.from.role} 在 ${data.range.from.ts} 说的：${data.range.from.preview}`,
      ''
    )
  }
  if (data.filesTouched.length) {
    lines.push('## 涉及的文件', '', ...data.filesTouched.map((f) => `- \`${f}\``), '')
  }
  lines.push('## 对话', '')
  for (const m of data.messages) {
    lines.push(`### ${m.role === 'user' ? '你' : '助手'} · ${m.ts || ''}`, '')
    if (m.text) lines.push(m.text, '')
    for (const t of m.tools || []) {
      lines.push(`- 工具 \`${t.name}\``)
      if (t.args) lines.push('  ```json', `  ${JSON.stringify(t.args)}`, '  ```')
      if (t.result) lines.push('  <details><summary>输出</summary>', '', '```', t.result, '```', '', '</details>')
    }
    lines.push('')
  }
  return lines.join('\n')
}

const body = format === 'md' ? toMarkdown(payload) : `${JSON.stringify(payload, null, 2)}\n`

if (outPath) {
  writeFileSync(outPath, body, 'utf8')
  const kb = (Buffer.byteLength(body) / 1024).toFixed(1)
  const span = range.from
    ? `${range.exported}/${range.total} 条（#${range.from.n}→#${range.to.n}）`
    : `${payload.messages.length} 条（全会话）`
  console.error(`已导出 ${span} → ${outPath}（${kb} kB）`)
  if (range.from) {
    console.error(`  起点 #${range.from.n} ${range.from.role} · ${range.from.ts}`)
    console.error(`  ${range.from.preview}`)
    if (range.from.matchedBy === 'text/prefix') {
      console.error(`  ⚠️ 整句没匹配上，是按前 10 个字退化的匹配，请核对`)
    }
    if (range.from.candidates?.length) {
      console.error(`  ⚠️ 这句话在会话里出现了 ${range.from.candidates.length} 次，取的是最后一次（#${range.from.n}）：`)
      for (const c of range.from.candidates) console.error(`     #${c.n} ${c.ts}  ${c.preview}`)
      console.error(`  要另选就换成数字，例如 --from ${range.from.candidates[0].n}`)
    }
  }
} else {
  process.stdout.write(body)
}
