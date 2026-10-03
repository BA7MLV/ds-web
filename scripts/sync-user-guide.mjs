/**
 * 用户指南同步：主仓库 deep-student 的 docs/user-guide 是唯一来源，这里把它转成官网页面。
 *
 * 为什么在主仓库写：开发改功能时文档就在旁边，能一起改、一起评审；官网这边只管网址和排版。
 * 官网原来那套 user-guide 就是两边各写一份，8/30 以后再没人同步，和应用越差越远。
 *
 * 做的事：
 *   · 章节文件（01-快速上手.md …）换成干净网址（/start、/user-guide/chat …），映射见 CHAPTERS；
 *     快速上手沿用 /start，首页「快速上手」按钮和打点都指着它
 *   · 章与章之间的相对链接改成站内网址，主仓库里别的文件改成 GitHub 地址
 *   · 补 frontmatter：description 取标题下那段引言；editLink 关掉 —— 这些页在官网改了会被下次同步覆盖，
 *     页尾改放一行出处，指回主仓库的源文件
 *   · 去掉章末给维护者看的 HTML 注释（调研基线之类）
 *   · 侧栏分组和来源提交写进 docs/.vitepress/data/user-guide.json，config.js 读它拼侧栏
 *   · docs/user-guide/ 整个目录归这个脚本管：每次清空重写，删掉的章节不会残留
 *
 * 用法：
 *   node scripts/sync-user-guide.mjs --from ~/code/deep-student   # 从本地主仓库
 *   node scripts/sync-user-guide.mjs [--ref main]                  # 从 GitHub 公开仓库
 * 同步后跑 npm test：tests/user-guide.test.mjs 会检查站内链接都有落点、旧网址都有重定向。
 */
import { execFileSync } from 'node:child_process'
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DOCS = join(ROOT, 'docs')
const GUIDE_DIR = join(DOCS, 'user-guide')
const DATA_FILE = join(DOCS, '.vitepress/data/user-guide.json')
const REPO = 'helixnow/deep-student'
const SOURCE_DIR = 'docs/user-guide'

/** 源文件 → 网址与侧栏位置。顺序就是侧栏顺序；group 为空的不进分组（快速上手、学习桌面由 config.js 放进「开始」） */
export const CHAPTERS = [
  { file: 'README.md', path: '/user-guide/', out: 'user-guide/index.md', title: '用户指南总览' },
  { file: '01-快速上手.md', path: '/start', out: 'start.md', title: '快速上手' },
  { file: '18-学习桌面.md', slug: 'workbench', title: '学习桌面' },
  { file: '02-AI对话与会话管理.md', slug: 'chat', title: 'AI 对话与会话管理', group: '对话与调研' },
  { file: '03-深度调研与智能记忆.md', slug: 'research-memory', title: '深度调研与智能记忆', group: '对话与调研' },
  { file: '04-学习资源中心.md', slug: 'learning-hub', title: '学习资源中心', group: '资料与阅读' },
  { file: '05-文档阅读与翻译.md', slug: 'reading-translation', title: '文档阅读与翻译', group: '资料与阅读' },
  { file: '06-论文搜索.md', slug: 'paper-search', title: '论文搜索', group: '资料与阅读' },
  { file: '07-笔记.md', slug: 'notes', title: '笔记', group: '笔记与创作' },
  { file: '08-知识导图.md', slug: 'mindmap', title: '知识导图', group: '笔记与创作' },
  { file: '09-作文批改.md', slug: 'essay', title: '作文批改', group: '笔记与创作' },
  { file: '10-效率工具.md', slug: 'productivity', title: '待办、番茄钟与命令面板', group: '笔记与创作' },
  { file: '11-题库与练习.md', slug: 'question-bank', title: '题库与练习', group: '练习与记忆' },
  { file: '12-Anki制卡与模板.md', slug: 'anki', title: 'Anki 制卡与模板', group: '练习与记忆' },
  { file: '13-闪卡复习.md', slug: 'flashcards', title: '闪卡复习', group: '练习与记忆' },
  { file: '14-模型与供应商配置.md', slug: 'models', title: '模型与供应商配置', group: '配置与数据' },
  { file: '15-技能与MCP扩展.md', slug: 'skills-mcp', title: '技能与 MCP 扩展', group: '配置与数据' },
  { file: '16-数据管理与云同步.md', slug: 'data-sync', title: '数据管理与云同步', group: '配置与数据' },
  { file: '17-移动端指南.md', slug: 'mobile', title: '移动端指南', group: '移动端' }
].map((chapter) => chapter.slug
  ? { ...chapter, path: `/user-guide/${chapter.slug}`, out: `user-guide/${chapter.slug}.md` }
  : chapter)

const args = process.argv.slice(2)
const option = (name) => {
  const at = args.indexOf(name)
  return at >= 0 ? args[at + 1] : undefined
}

async function readLocal(dir) {
  const root = resolve(dir.replace(/^~(?=\/|$)/, process.env.HOME))
  const files = new Map()
  for (const name of await readdir(join(root, SOURCE_DIR))) {
    if (name.endsWith('.md')) files.set(name, await readFile(join(root, SOURCE_DIR, name), 'utf-8'))
  }
  const commit = execFileSync('git', ['-C', root, 'log', '-1', '--format=%H', '--', SOURCE_DIR], { encoding: 'utf-8' }).trim()
  const dirty = execFileSync('git', ['-C', root, 'status', '--porcelain', '--', SOURCE_DIR], { encoding: 'utf-8' }).trim()
  return { files, commit, dirty: Boolean(dirty) }
}

async function readRemote(ref) {
  const api = (path) => fetch(`https://api.github.com/repos/${REPO}/${path}`, {
    headers: { accept: 'application/vnd.github+json', 'user-agent': 'ds-web-sync-user-guide' }
  }).then((response) => {
    if (!response.ok) throw new Error(`GitHub API ${path} → ${response.status}`)
    return response.json()
  })
  const listing = await api(`contents/${SOURCE_DIR}?ref=${encodeURIComponent(ref)}`)
  const files = new Map()
  for (const entry of listing) {
    if (entry.type !== 'file' || !entry.name.endsWith('.md')) continue
    const response = await fetch(entry.download_url)
    if (!response.ok) throw new Error(`${entry.name} → ${response.status}`)
    files.set(entry.name, await response.text())
  }
  const [latest] = await api(`commits?path=${SOURCE_DIR}&sha=${encodeURIComponent(ref)}&per_page=1`)
  return { files, commit: latest?.sha ?? '', dirty: false }
}

/** 出处链到 main 上的源文件（要改就去那儿改）；同步自哪个提交记在 data/user-guide.json */
const blobUrl = (file) => `https://github.com/${REPO}/blob/main/${SOURCE_DIR}/${encodeURIComponent(file)}`

/** 标题下第一段引言（> 开头）当 description；没有就取第一段正文 */
function describe(body) {
  const lines = body.split('\n')
  const start = lines.findIndex((line, i) => i > 0 && line.trim() && !line.startsWith('#'))
  if (start < 0) return ''
  const para = []
  for (let i = start; i < lines.length && lines[i].trim(); i += 1) para.push(lines[i].replace(/^>\s?/, ''))
  return para.join('')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*`_]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 150)
}

function transform(chapter, source) {
  const byFile = new Map(CHAPTERS.map((c) => [c.file, c]))
  let body = source
    .replace(/\r\n/g, '\n')
    // 章末给维护者看的注释（调研基线、对齐记录）
    .replace(/\n*<!--[\s\S]*?-->\s*$/g, '\n')
    // ](./02-AI对话与会话管理.md#锚点) → ](/user-guide/chat#锚点)；主仓库别的文件 → GitHub
    .replace(/\]\((\.\/)?([^)\s#]+\.md)(#[^)\s]*)?\)/g, (match, _dot, target, hash = '') => {
      if (/^[a-z]+:/i.test(target)) return match
      const linked = byFile.get(decodeURIComponent(target))
      if (linked) return `](${linked.path}${hash})`
      return `](${new URL(target, `https://github.com/${REPO}/blob/main/${SOURCE_DIR}/`).href}${hash})`
    })
    .trimEnd()
  const description = describe(body).replaceAll('"', '\\"')
  const front = ['---', `description: "${description}"`, 'editLink: false', '---', ''].join('\n')
  const credit = [
    '',
    '---',
    '',
    `> 本页同步自主仓库 [\`${SOURCE_DIR}/${chapter.file}\`](${blobUrl(chapter.file)})。` +
      `发现文档和应用对不上，欢迎在 [GitHub Issues](https://github.com/${REPO}/issues) 反馈。`,
    ''
  ].join('\n')
  return `${front}\n${body}\n${credit}`
}

async function main() {
  const from = option('--from')
  const ref = option('--ref') || 'main'
  const { files, commit, dirty } = from ? await readLocal(from) : await readRemote(ref)

  const missing = CHAPTERS.filter((c) => !files.has(c.file)).map((c) => c.file)
  if (missing.length) throw new Error(`主仓库里找不到：${missing.join('、')}（CHAPTERS 要跟着改）`)
  const unmapped = [...files.keys()].filter((name) => !CHAPTERS.some((c) => c.file === name))
  if (unmapped.length) throw new Error(`主仓库新增了章节，还没配网址：${unmapped.join('、')}`)

  await rm(GUIDE_DIR, { recursive: true, force: true })
  await mkdir(GUIDE_DIR, { recursive: true })
  for (const chapter of CHAPTERS) {
    await writeFile(join(DOCS, chapter.out), transform(chapter, files.get(chapter.file)))
  }

  const groups = []
  for (const chapter of CHAPTERS.filter((c) => c.group)) {
    let group = groups.find((g) => g.text === chapter.group)
    if (!group) groups.push((group = { text: chapter.group, items: [] }))
    group.items.push({ text: chapter.title, link: chapter.path })
  }
  await mkdir(dirname(DATA_FILE), { recursive: true })
  await writeFile(DATA_FILE, `${JSON.stringify({
    source: { repo: REPO, path: SOURCE_DIR, commit, dirty, syncedAt: new Date().toISOString() },
    pages: CHAPTERS.map(({ file, path, title }) => ({ file, path, title })),
    groups
  }, null, 2)}\n`)

  console.log(`[user-guide] ${CHAPTERS.length} 页，来源 ${REPO}@${commit.slice(0, 9)}${dirty ? '（含未提交改动）' : ''}`)
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(`[user-guide] ${error.message}`)
    process.exit(1)
  })
}
