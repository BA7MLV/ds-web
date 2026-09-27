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
const emptyDecoration = { render: () => null }

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
    for (const component of ['HeroStarfield', 'StepFlow', 'DemoSkeleton']) {
      app.component(component, emptyDecoration)
    }

    // SSR runs without mount hooks: no browser frame can make the hero visible here.
    const html = await renderToString(app)
    assert.match(html, /class="t-stagger is-shown [^"]*"/)
    assert.match(html, /<h1[^>]*>[^<]+<\/h1>/)
    assert.ok(html.includes(words.home.hero.title))
    assert.match(html, /href="\/download"/)
    assert.match(html, /href="\/start"/)
    assert.ok(html.includes(words.appShell.previewTitle))
    assert.ok(html.includes(words.appShell.previewDescription))
    assert.ok(html.includes(words.appShell.waiting))
    assert.doesNotMatch(html, /<iframe\b/)
  })
}

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
