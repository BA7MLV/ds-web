import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import {
  finalizeMachineDocs,
  renderDownloadMarkdown,
  renderSupportMarkdown,
  replaceDownloadSection,
  replaceMachineSection
} from '../docs/.vitepress/machine-docs.mjs'

// Same SSR structure as DownloadRows / DownloadFaq / CopyLine, with an arbitrary release.
const fixture = (version = 'v2.3.4') => `<!DOCTYPE html><html><head>
  <meta name="description" content="下载 &amp; 安装 DeepStudent。">
</head><body><nav>导航内容不应进入机器文档</nav><main>
<div class="vp-doc _download" data-v-example data-v-example><div>
  <h1>下载<a class="header-anchor" href="#下载">&#8203;</a></h1>
  <p>软件免费开源，请阅读<a href="./start">快速上手</a>。</p>
  <p class="dl-version">当前版本 <strong>${version}</strong> · 发布于 <strong>2026年9月24日</strong></p>
  <div class="dl-pick"><p>推荐</p><div></div></div>
  <h2>桌面端</h2><ul class="dl-rows"><li class="dl-row">
    <div><p class="dl-row__name"><span>macOS</span><span class="dl-row__arch">Apple Silicon</span></p>
      <p class="dl-row__note">M 系列芯片的 Mac</p></div>
    <div class="dl-row__meta"><span class="dl-tag">${version}</span><span class="dl-row__size">79.0 MB</span></div>
    <div><a class="dl-btn" href="https://github.com/example/releases/download/${version}/app.dmg">
      <svg><path /></svg>下载</a>
      <a class="dl-btn dl-btn--ghost" href="https://download.example/${version}/app.dmg">镜像下载</a></div>
  </li></ul>
  <h2>安装说明</h2><ol><li>下载 <code>.dmg</code> 文件</li><li>安装到应用程序目录</li></ol>
  <div class="dl-copy"><code>sudo xattr -r -d com.apple.quarantine /Applications/DeepStudent.app</code>
    <button class="dl-copy__btn">复制</button></div>
  <h2>系统要求</h2><ul class="dl-notes">
    <li><strong>macOS</strong> —— macOS 13 或更高</li><li><strong>Android</strong> —— ARM64 设备</li></ul>
  <h2>常见问题</h2><div class="lp-faq dl-faq"><div class="lp-faq__item" data-open="false">
    <h3><button class="lp-faq__btn" aria-expanded="false"><span>下载很慢怎么办？</span><svg /></button></h3>
    <div class="lp-faq__panel"><div class="lp-faq__inner"><p>可以使用镜像下载。
      <a href="https://github.com/example/releases">历史版本</a></p></div></div>
  </div></div>
</div></div></main><footer>页脚不要复制</footer></body></html>`

const supportFixture = `<!DOCTYPE html><html><head>
  <meta name="description" content="支持与社区联系。">
</head><body><nav>导航内容不应进入机器文档</nav><main><div class="vp-doc _support"><div>
  <h1>支持<a class="header-anchor" href="#支持">&#8203;</a></h1>
  <p>遇到问题可以联系我们。</p>
  <h2>扫码联系</h2><ul class="sp-qr">
    <li class="sp-qr__item"><img src="/qr-wechat.png" alt="微信二维码，扫码添加好友">
      <p class="sp-qr__title">微信</p><p class="sp-qr__desc">扫码添加微信，直接聊合作</p></li>
    <li class="sp-qr__item"><img src="/qr-qq-group.png" alt="技术交流群（QQ 群 310134919）的二维码">
      <p class="sp-qr__title">DeepStudent 技术交流群</p>
      <p class="sp-qr__desc">扫码加入 QQ 群 310134919<br>在电脑上打开：
        <a href="https://qm.qq.com/q/1lTUkKSaB6">加群链接</a></p></li>
  </ul>
  <h2>直接联系我们</h2><table><thead><tr><th>事项</th><th>邮箱</th><th>适合的问题</th></tr></thead>
    <tbody><tr><td>一般支持</td><td><a href="mailto:support@deepstudent.cn">support@deepstudent.cn</a></td>
      <td>Bug | 文档纠错</td></tr>
    <tr><td>合作交流</td><td><a href="mailto:contact@deepstudent.cn">contact@deepstudent.cn</a></td>
      <td>商务合作与内容共建</td></tr></tbody></table>
  <h2>常用入口</h2><ul><li>查看<a href="download">下载页面</a></li><li>阅读<a href="A-Q">常见问题</a></li></ul>
</div></div></main><footer>页脚不要复制</footer></body></html>`

const first = '---\nurl: https://deepstudent.cn/start.md\ndescription: 上手\n---\n\n# 上手\n\n正文保持不变。\n\n---\n\n'
const download = '---\nurl: https://deepstudent.cn/download.md\ndescription: 下载\n---\n\n# 下载\n\n## 桌面端\n\n---\n\n'
const support = '---\nurl: https://deepstudent.cn/support.md\ndescription: 支持\n---\n\n# 支持\n\n## 扫码联系\n\n---\n\n'
const last = '---\nurl: https://deepstudent.cn/about.md\ndescription: 关于\n---\n\n# 关于\n\n后续章节。\n'

test('SSR download components become complete Markdown using the actual rendered release', () => {
  const markdown = renderDownloadMarkdown(fixture('v9.8.7'))
  assert.match(markdown, /url: https:\/\/deepstudent.cn\/download\n/)
  assert.match(markdown, /description: "下载 & 安装 DeepStudent。"/)
  assert.match(markdown, /当前版本 \*\*v9.8.7\*\*/)
  assert.match(markdown, /### macOS Apple Silicon/)
  assert.match(markdown, /79.0 MB/)
  assert.match(markdown, /\[下载\]\(https:\/\/github.com\/example\/releases\/download\/v9.8.7\/app.dmg\)/)
  assert.match(markdown, /\[镜像下载\]\(https:\/\/download.example\/v9.8.7\/app.dmg\)/)
  assert.match(markdown, /```bash\nsudo xattr -r -d com.apple.quarantine \/Applications\/DeepStudent.app\n```/)
  assert.match(markdown, /macOS 13 或更高/)
  assert.match(markdown, /ARM64 设备/)
  assert.match(markdown, /### 下载很慢怎么办？/)
  assert.match(markdown, /可以使用镜像下载/)
  assert.match(markdown, /\[快速上手\]\(https:\/\/deepstudent.cn\/start\)/)
  assert.match(markdown, /1\. 下载 `.dmg` 文件\n2\. 安装到应用程序目录/)
  assert.doesNotMatch(markdown, /<svg|<button|推荐|复制|导航内容|页脚|header-anchor|\{\{/)
})

test('download section replacement preserves adjacent documents and is idempotent', () => {
  const markdown = renderDownloadMarkdown(fixture())
  const updated = replaceDownloadSection(first + download + last, markdown)
  assert.ok(updated.startsWith(first))
  assert.ok(updated.endsWith(last))
  assert.equal(updated.match(/^url: https:\/\/deepstudent.cn\/download$/gm)?.length, 1)
  assert.equal(replaceDownloadSection(updated, markdown), updated)
  assert.equal(replaceDownloadSection(download, markdown), markdown)
})

test('support Markdown preserves QR contacts, group links and native contact tables', () => {
  const markdown = renderSupportMarkdown(supportFixture)
  assert.match(markdown, /url: https:\/\/deepstudent.cn\/support\n/)
  assert.match(markdown, /### 微信/)
  assert.match(markdown, /!\[微信二维码，扫码添加好友\]\(https:\/\/deepstudent.cn\/qr-wechat.png\)/)
  assert.match(markdown, /!\[技术交流群（QQ 群 310134919）的二维码\]\(https:\/\/deepstudent.cn\/qr-qq-group.png\)/)
  assert.match(markdown, /扫码加入 QQ 群 310134919/)
  assert.match(markdown, /\[加群链接\]\(https:\/\/qm.qq.com\/q\/1lTUkKSaB6\)/)
  assert.match(markdown, /\| 事项 \| 邮箱 \| 适合的问题 \|\n\| --- \| --- \| --- \|/)
  assert.match(markdown, /\| 一般支持 \| \[support@deepstudent.cn\]\(mailto:support@deepstudent.cn\) \| Bug \\\| 文档纠错 \|/)
  assert.match(markdown, /\| 合作交流 \| \[contact@deepstudent.cn\]\(mailto:contact@deepstudent.cn\) \| 商务合作与内容共建 \|/)
  assert.match(markdown, /\[下载页面\]\(https:\/\/deepstudent.cn\/download\)/)
  assert.doesNotMatch(markdown, /<table|<img|导航内容|页脚|header-anchor/)
  const updated = replaceMachineSection(first + support + last, markdown, 'https://deepstudent.cn/support')
  assert.ok(updated.startsWith(first))
  assert.ok(updated.endsWith(last))
  assert.ok(updated.includes(markdown.trim()))
})

test('missing or duplicated download sections fail instead of appending inconsistent documents', () => {
  assert.throws(() => replaceDownloadSection(first + last, 'new'), /found 0/)
  assert.throws(() => replaceDownloadSection(download + download, 'new'), /found 2/)
  assert.throws(() => renderDownloadMarkdown('<main>wrong template</main>'), /content is missing/)
  assert.throws(() => renderDownloadMarkdown(fixture('{{ release.version }}')), /interpolation unresolved/)
})

test('buildEnd updates both component pages and their bundle chapters from the same SSR content', async () => {
  const outDir = await mkdtemp(join(tmpdir(), 'ds-machine-docs-'))
  try {
    await Promise.all([
      writeFile(join(outDir, 'download.html'), fixture('v10.0.0')),
      writeFile(join(outDir, 'support.html'), supportFixture),
      writeFile(join(outDir, 'download.md'), '# incomplete'),
      writeFile(join(outDir, 'support.md'), '# incomplete'),
      writeFile(join(outDir, 'llms-full.txt'), first + download + support + last)
    ])
    await finalizeMachineDocs({ outDir })
    const markdown = await readFile(join(outDir, 'download.md'), 'utf8')
    const supportMarkdown = await readFile(join(outDir, 'support.md'), 'utf8')
    const bundle = await readFile(join(outDir, 'llms-full.txt'), 'utf8')
    assert.match(markdown, /v10.0.0/)
    assert.ok(bundle.includes(markdown.trim()))
    assert.ok(bundle.includes(supportMarkdown.trim()))
    assert.match(supportMarkdown, /310134919/)
    assert.match(supportMarkdown, /\[support@deepstudent.cn\]\(mailto:support@deepstudent.cn\)/)
    assert.ok(bundle.startsWith(first))
    assert.ok(bundle.endsWith(last))
  } finally {
    await rm(outDir, { recursive: true, force: true })
  }
})
