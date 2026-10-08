import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { compileTemplate, parse } from '@vue/compiler-sfc'

import messages from '../docs/.vitepress/theme/i18n/messages/index.js'
import { needsOpticalCenter } from '../docs/.vitepress/theme/utils/optical-center.js'

const require = createRequire(import.meta.url)
const template = (name) => {
  const filename = new URL(`../docs/.vitepress/theme/components/${name}.vue`, import.meta.url)
  const { descriptor, errors } = parse(readFileSync(filename, 'utf8'))
  assert.deepEqual(errors, [])
  const compiled = compileTemplate({
    filename: filename.pathname,
    source: descriptor.template.content,
    id: name,
    ssr: true,
    ssrCssVars: descriptor.cssVars,
    compilerOptions: { mode: 'function' },
  })
  assert.deepEqual(compiled.errors, [])
  return { descriptor, ssrRender: new Function('require', compiled.code)(require) }
}

const home = template('HomePage')
const shell = template('AppShell')
const download = template('HomeDownload')
const emptyDecoration = { render: () => null }

/** 只渲染 AppShell（默认语言），用来单独检查壳本身的 SSR 输出。 */
const shellOnly = () => {
  const t = (path, params = {}) => {
    const value = path.split('.').reduce((acc, key) => acc[key], messages['zh-CN'])
    return String(value).replace(/\{(\w+)\}/g, (_, key) => params[key] ?? '')
  }
  return createSSRApp({
    ssrRender: shell.ssrRender,
    setup: () => ({
      t,
      measured: false,
      showFrame: false,
      loading: true,
      canEmbed: false,
      previewStatus: t('appShell.waiting')
    })
  })
}

for (const [locale, words] of Object.entries(messages)) {
  test(`${locale} landing SSR includes visible hero, actions and an informative preview`, async () => {
    const tm = (path) => path.split('.').reduce((value, key) => value[key], words)
    const t = (path, params = {}) => tm(path).replace(/\{(\w+)\}/g, (_, key) => params[key] ?? '')
    const app = createSSRApp({
      ssrRender: home.ssrRender,
      setup: () => ({
        t, tm,
        heroEl: null,
        demoEl: null,
        GITHUB_URL: 'https://github.com/helixnow/deep-student',
        starsLabel: words.home.stars.idle,
        direction: 1,
        displayedScene: 0,
        activeScene: 0,
        scenes: words.home.features.scenes,
        currentScene: words.home.features.scenes[0],
        agent: words.home.agent.items,
        privacy: words.home.privacy.items,
        SHOW_VOICES: false,
        faqs: words.home.faq.items,
        openFaq: 0,
        // 用真的判定，别在这里拿桩糊过去 —— SSR 输出里那个类就是它算出来的
        optical: (text) => (needsOpticalCenter(text) ? 'lp-optical' : undefined),
      }),
    })
    app.component('AppShell', {
      ssrRender: shell.ssrRender,
      setup: () => ({
        t,
        measured: false,
        showFrame: false,
        loading: true,
        canEmbed: false,
        previewStatus: words.appShell.waiting,
      }),
    })
    app.component('HomeDownload', {
      ssrRender: download.ssrRender,
      setup: () => ({
        t,
        options: Object.keys(words.home.hero.downloadOptions).map((key) => ({
          key,
          asset: { name: `${key}.bin`, url: `https://files.test/${key}`, sizeBytes: 1024 },
        })),
        key: '',
        icon: 'download',
        label: words.home.hero.download,
        href: '/download',
        fileName: '',
        open: false,
        formatSize: (bytes) => `${bytes} B`,
        toggle: () => {},
        pick: () => {},
      }),
    })
    for (const component of ['HeroStarfield', 'StepFlow', 'DlIcon', 'FeatureAscii']) {
      app.component(component, emptyDecoration)
    }

    // SSR runs without mount hooks: no browser frame can make the hero visible here.
    const html = await renderToString(app)
    assert.match(html, /class="t-stagger is-shown [^"]*"/)
    assert.match(html, /<h1[^>]*>[^<]+<\/h1>/)
    assert.ok(html.includes(words.home.hero.title))
    assert.match(html, /href="\/download"/)
    // 服务端认不出设备：按钮一律指向下载页，不替用户选包、也不带 download 属性
    assert.ok(html.includes(words.home.hero.download))
    assert.doesNotMatch(html, /\sdownload="/)
    // 版本清单是自写面板、默认收起 —— 展开态属于客户端才知道的事，SSR 里不能先画出来
    assert.match(html, /<button[^>]*aria-expanded="false"/)
    assert.ok(html.includes(words.home.hero.switchDownload))
    assert.doesNotMatch(html, /home-download__menu/)
    assert.match(html, /href="\/start"/)
    assert.ok(html.includes(words.appShell.previewTitle))
    assert.ok(html.includes(words.appShell.previewDescription))
    assert.ok(html.includes(words.appShell.waiting))
    // 居中标题若以全角标点收尾，SSR 里就得带上视觉校正的类（爬虫看到的与用户看到的一致）。
    // 只查功能区那个标题：其它区块的标题要么左对齐、要么文案不带标点，判不准就不是漏。
    if (needsOpticalCenter(words.home.features.title)) {
      assert.match(html, /class="[^"]*\blp-optical\b[^"]*"/, '居中标题缺了视觉校正的类')
    }
    // 壳内先铺真实界面截图，所以首屏 HTML 里有图，而不是等 JS 再画
    assert.match(html, /<img[^>]+src="\/demo-poster\.webp"[^>]+alt="[^"]+"/)
    assert.doesNotMatch(html, /<iframe\b/)
  })
}

test('hero ships every poster variant so no layout is left without a real screenshot', async () => {
  const html = await renderToString(shellOnly())
  for (const src of [
    '/demo-poster.webp',
    '/demo-poster-dark.webp',
    '/demo-poster-mobile@3x.webp',
    '/demo-poster-mobile-dark@3x.webp'
  ]) {
    assert.ok(html.includes(src), `缺少截图：${src}`)
  }
  // 深浅色各配一张，靠 prefers-color-scheme 选，不额外发请求
  assert.match(html, /media="\(prefers-color-scheme: dark\)"/)
  assert.match(html, /media="\(max-width: 639px\) and \(prefers-color-scheme: dark\)"/)
  // 截图铺在 iframe 那一块上，铺满内屏
  assert.match(html, /class="sh__poster"/)
  // 替代文字要说清这张图是什么（截图与实时演示是同一个界面）
  assert.ok(html.includes(messages['zh-CN'].appShell.posterAlt))
})

test('landing visibility does not depend on mounted state or transparent window animation', () => {
  assert.doesNotMatch(home.descriptor.scriptSetup.content, /heroShown/)
  const styles = shell.descriptor.styles.map(({ content }) => content).join('\n')
  const rise = styles.match(/@keyframes sh-rise\s*\{[\s\S]*?\n\}/)?.[0] ?? ''
  assert.doesNotMatch(rise, /opacity\s*:\s*0/)
})

/*
 * 演示窗下方的图注：只在「画面不会再动」时开口。
 * 删掉的是「正在载入…」那一档 —— 壳里铺的本来就是真实界面截图（不是骨架屏），
 * 画面从头到尾没有一秒是空的，这句状态只是把眼前已有的东西重复一遍。
 * 标题与说明那句要留着（并且居中）：那是对这张演示的一句话解释，
 * 出问题的两种（超时 / 嵌不进来）与它们的「重新载入」出口也必须留着 ——
 * 那两种情况画面会一直停在截图上，不给按钮用户就只能干看着。
 */
test('演示窗的图注只在画面不会再动时说话', () => {
  assert.doesNotMatch(shell.descriptor.scriptSetup.content, /appShell\.loading/)
  for (const state of ['appShell.delayed', 'appShell.unavailable', 'appShell.waiting']) {
    assert.match(shell.descriptor.scriptSetup.content, new RegExp(state.replace('.', '\\.')))
  }
  // 手动开始 / 重试的按钮还在，图注的 flex 行才留得住
  assert.match(shell.descriptor.template.content, /@click="startDemo/)
  for (const words of Object.values(messages)) {
    assert.equal('loading' in words.appShell, false, '「正在载入」的文案还留在消息表里')
    // 说明那句不许被顺手删掉 —— 它是这张演示唯一的一句解释
    assert.ok(words.appShell.previewDescription?.trim(), '图注说明的文案不在消息表里')
  }
})

/*
 * 居中标题的视觉校正（custom.css 的 .lp-optical）：只认末尾的全角标点。
 * 判错方向很关键 —— 漏判只是校正没做，误判会把一句没有标点的标题也推歪。
 */
test('居中标题的视觉校正只认末尾的全角标点', () => {
  for (const text of ['从读到记，装进同一个窗口。', '数据默认存在本机。', '来自用它的人。']) {
    assert.equal(needsOpticalCenter(text), true, `漏判：${text}`)
  }
  // 逗号、顿号的墨迹同样偏左下，只要收尾就要校正 —— 「…就够了，」这种也认。
  assert.equal(needsOpticalCenter('只专注学习本身就够了，'), true, '漏判（逗号收尾）')
  // 断行写在文案里（`\n` + pre-line）：末行以标点收尾，字符串末尾却是换行符。
  // 判定必须剥掉换行才认得出来 —— 首屏标题和手机/网课那两栏都靠这一条。
  for (const text of ['电脑上整理，\n手机上接着学。', '只专注学习本身就够了，\n剩下的都交给我。']) {
    assert.equal(needsOpticalCenter(text), true, `漏判（换行收尾）：${JSON.stringify(text)}`)
  }
  for (const text of [
    '常见问题',
    // 中间有换行、但末行没有标点：只剥末尾换行，不能顺手把首行也算进来
    '开放的终身学习空间\n开源、本地优先',
    // 英文收尾是半角句号，本身就窄，偏心量在半个像素以内
    'From reading to remembering, in one window.',
    // 数组（Hero 导语那种分行写法）末行不在最后一个元素里，判不准就不校正
    ['第一行，', '第二行。'],
    undefined,
    null
  ]) {
    assert.equal(needsOpticalCenter(text), false, `误判：${JSON.stringify(text)}`)
  }
})

test('both theme entry points keep unused bundled fonts out of the system-font site', () => {
  for (const file of ['index.js', 'Layout.vue']) {
    const source = readFileSync(new URL(`../docs/.vitepress/theme/${file}`, import.meta.url), 'utf8')
    assert.match(source, /from ['"]vitepress\/theme-without-fonts['"]/)
    assert.doesNotMatch(source, /from ['"]vitepress\/theme['"]/)
  }
})

test('Tailwind excludes the independently styled demo mirror from site class scanning', () => {
  const css = readFileSync(new URL('../docs/.vitepress/theme/custom.css', import.meta.url), 'utf8')
  assert.match(css, /@source not ['"]\.\.\/\.\.\/public\/demo['"];?/)
})
