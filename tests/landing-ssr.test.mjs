import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import { compileTemplate, parse } from '@vue/compiler-sfc'

import messages from '../docs/.vitepress/theme/i18n/messages/index.js'

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
        privacy: words.home.privacy.items,
        SHOW_VOICES: false,
        faqs: words.home.faq.items,
        openFaq: 0,
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
