import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import { computed, effectScope, markRaw, nextTick, ref, watch } from 'vue'
import { parse } from '@vue/compiler-sfc'

/** Execute the actual setup script with Vue reactivity and controllable browser deliveries. */
const component = (t, name, exports, { props = {}, demoUrl = '' } = {}) => {
  const filename = new URL(`../docs/.vitepress/theme/components/${name}.vue`, import.meta.url)
  const { descriptor } = parse(readFileSync(filename, 'utf8'))
  const source = descriptor.scriptSetup.content
    .replace(/^import .*\n/gm, '')
    .replaceAll('import.meta.env.VITE_DEMO_URL', 'DEMO_URL')
  const mounted = []
  const unmounted = []
  const frames = new Map()
  const timers = new Map()
  const deferred = []
  const observers = []
  const isDark = ref(false)
  let id = 0
  let now = 0
  let disposed = false
  const events = (extra = {}) => ({
    ...extra,
    listeners: new Map(),
    addEventListener(name, callback) { this.listeners.set(name, callback) },
    removeEventListener(name, callback) {
      if (this.listeners.get(name) === callback) this.listeners.delete(name)
    },
  })
  const motionQuery = events({ matches: false })
  const window = events({
    location: { protocol: 'https:', href: 'https://site.test/', origin: 'https://site.test' },
    innerHeight: 100,
    scrollY: 0,
    matchMedia: () => motionQuery,
  })
  const document = events({ hidden: false })
  const scope = effectScope()
  const tracked = []
  const context = vm.createContext({
    console, URL, URLSearchParams, computed, ref, watch, nextTick,
    window, document, DEMO_URL: demoUrl,
    track: (event, props) => tracked.push([event, props]),
    performance: { now: () => now },
    defineProps: () => ({ src: '', anchor: null, blocker: null, ...props }),
    useData: () => ({ isDark }),
    useI18n: () => ({ t: (key) => key }),
    onMounted: (callback) => mounted.push(callback),
    onUnmounted: (callback) => unmounted.push(callback),
    afterPageLoad: (callback) => {
      const task = { callback, cancelled: false }
      deferred.push(task)
      return () => { task.cancelled = true }
    },
    observeNearViewport: () => () => {},
    requestAnimationFrame: (callback) => { frames.set(++id, callback); return id },
    cancelAnimationFrame: (key) => frames.delete(key),
    setTimeout: (callback, delay) => { timers.set(++id, { callback, delay }); return id },
    clearTimeout: (key) => timers.delete(key),
    Image: class { removeAttribute() {} },
    IntersectionObserver: class {
      constructor(callback) { this.callback = callback; observers.push(this) }
      observe() {}
      disconnect() { this.disconnected = true }
    },
  })
  const api = scope.run(() => vm.runInContext(
    `(function () { ${source}\nreturn { ${exports.join(', ')} } })()`,
    context,
    { filename: filename.pathname }
  ))
  const unmount = () => {
    if (disposed) return
    disposed = true
    scope.stop()
    unmounted.forEach((callback) => callback())
  }
  t.after(unmount)
  return {
    api, isDark, frames, timers, observers, window, document, motionQuery, unmount, tracked,
    mount: () => mounted.forEach((callback) => callback()),
    afterLoad: () => deferred.filter((task) => !task.cancelled).forEach(({ callback }) => callback()),
    frame: () => {
      const callbacks = [...frames.values()]
      frames.clear()
      now += 40
      callbacks.forEach((callback) => callback(now))
    },
    timeout: (delay) => {
      for (const [key, task] of timers) {
        if (task.delay !== delay) continue
        timers.delete(key)
        task.callback()
      }
    },
  }
}

const shell = (t, options) => component(t, 'AppShell', [
  'frameSrc', 'frameKey', 'frameEl', 'setFrame', 'startDemo', 'onMessage', 'onFrameLoad',
  'loading', 'timedOut', 'showFrame', 'previewStatus',
], options)

const frame = (name) => markRaw({
  contentWindow: { name, posted: [], postMessage(data, origin) { this.posted.push([data, origin]) } },
  contentDocument: null,
})
// 消息对象在 vm 里创建，原型不同于测试这边，先过一遍 JSON 再比
const plain = (value) => JSON.parse(JSON.stringify(value))
const ready = (source, origin = 'https://site.test') => ({
  source: source.contentWindow,
  origin,
  data: { type: 'demo-shell-ready' },
})

test('demo URL overrides both themes without losing query values or fragments', async (t) => {
  const env = shell(t, {
    demoUrl: 'https://demo.test/demo.html?theme=dark&theme=light&source=home#intro',
  })
  env.mount()
  for (const dark of [false, true, false]) {
    env.isDark.value = dark
    await nextTick()
    const url = new URL(env.api.frameSrc.value)
    assert.deepEqual(url.searchParams.getAll('theme'), [dark ? 'dark' : 'light'])
    assert.equal(url.searchParams.get('source'), 'home')
    assert.equal(url.hash, '#intro')
    assert.equal(url.origin + url.pathname, 'https://demo.test/demo.html')
  }
})

test('demo opens the poster scene unless the override already names one', (t) => {
  const mirror = shell(t)
  mirror.mount()
  const mirrorUrl = new URL(mirror.api.frameSrc.value, 'https://site.test')
  assert.equal(mirrorUrl.pathname, '/demo/index.html')
  assert.equal(mirrorUrl.searchParams.get('scene'), 'demo-anki-cards')

  const pinned = shell(t, { demoUrl: 'https://demo.test/demo.html?scene=demo-pdf-deepread' })
  pinned.mount()
  assert.deepEqual(new URL(pinned.api.frameSrc.value).searchParams.getAll('scene'), ['demo-pdf-deepread'])
})

test('ready starts playback only in the frame that reported it', async (t) => {
  const env = shell(t)
  env.mount()
  env.api.startDemo()
  const retired = frame('retired')
  env.api.setFrame(retired)
  env.isDark.value = true
  await nextTick()
  env.api.onMessage(ready(retired))
  assert.deepEqual(retired.contentWindow.posted, [])

  env.api.setFrame(null)
  const current = frame('current')
  env.api.setFrame(current)
  env.api.onMessage(ready(current, 'https://unrelated.test'))
  env.api.onMessage({ ...ready(current), data: { type: 'unrelated' } })
  assert.deepEqual(current.contentWindow.posted, [])
  assert.equal(env.api.loading.value, true)

  env.api.onMessage(ready(current))
  assert.equal(env.api.loading.value, false)
  assert.deepEqual(plain(current.contentWindow.posted), [[{ type: 'demo:activate' }, 'https://site.test']])
})

test('theme reload invalidates old ready messages before and after the DOM patch', async (t) => {
  const env = shell(t)
  env.mount()
  env.api.startDemo()
  const oldFrame = frame('light')
  env.api.setFrame(oldFrame)
  env.api.onMessage(ready(oldFrame))
  assert.equal(env.api.loading.value, false)
  const oldKey = env.api.frameKey.value

  env.isDark.value = true
  // No nextTick or ref replacement yet: the old iframe still occupies frameEl.
  assert.equal(env.api.frameEl.value, oldFrame)
  assert.equal(env.api.frameKey.value, oldKey + 1)
  assert.equal(env.api.loading.value, true)
  env.api.onMessage(ready(oldFrame))
  assert.equal(env.api.loading.value, true)
  await nextTick()
  env.api.onMessage(ready(oldFrame))
  assert.equal(env.api.loading.value, true)

  env.api.setFrame(null)
  const newFrame = frame('dark')
  env.api.setFrame(newFrame)
  env.api.onMessage(ready(oldFrame))
  env.api.onMessage(ready(newFrame, 'https://unrelated.test'))
  env.api.onMessage({ ...ready(newFrame), data: { type: 'unrelated' } })
  assert.equal(env.api.loading.value, true)
  env.api.onMessage(ready(newFrame))
  assert.equal(env.api.loading.value, false)
})

test('manual retry rejects the previous iframe and accepts current ready before load', async (t) => {
  const env = shell(t)
  env.mount()
  env.api.startDemo()
  const oldFrame = frame('timed-out')
  env.api.setFrame(oldFrame)
  env.timeout(15000)
  assert.equal(env.api.timedOut.value, true)

  env.api.startDemo()
  assert.equal(env.api.frameKey.value, 1)
  assert.equal(env.api.timedOut.value, false)
  env.api.onMessage(ready(oldFrame))
  assert.equal(env.api.loading.value, true)
  await nextTick()
  const currentFrame = frame('retry')
  env.api.setFrame(currentFrame)
  env.api.onMessage(ready(currentFrame))
  assert.equal(env.api.loading.value, false)
  env.api.onFrameLoad({ currentTarget: currentFrame })
  env.timeout(15000)
  assert.equal(env.api.timedOut.value, false)
  assert.equal(env.api.loading.value, false)
  assert.equal(env.timers.size, 0)
})

test('demo start, retry and readiness are tracked once each', async (t) => {
  const env = shell(t)
  env.mount()
  env.api.startDemo('pointer')
  env.api.startDemo('focus')
  env.timeout(15000)
  env.api.startDemo('button')
  await nextTick()
  const current = frame('tracked')
  env.api.setFrame(current)
  env.api.onMessage(ready(current))
  env.api.onMessage(ready(current))
  assert.deepEqual(JSON.parse(JSON.stringify(env.tracked)), [
    ['demo_start', { trigger: 'pointer' }],
    // 超时后再点是重试，不再算一次新的开始
    ['demo_start', { trigger: 'retry' }],
    ['demo_ready', { seconds: '0' }],
  ])
})

test('cross-origin load fallback ignores a retiring frame and safely handles access denial', (t) => {
  const env = shell(t, { demoUrl: 'https://demo.test/demo.html' })
  env.mount()
  env.api.startDemo()
  const oldFrame = frame('old-remote')
  env.api.setFrame(oldFrame)
  env.isDark.value = true
  env.api.onFrameLoad({ currentTarget: oldFrame })
  assert.equal([...env.timers.values()].some(({ delay }) => delay === 600), false)

  const currentFrame = markRaw({
    contentWindow: {},
    get contentDocument() { throw new Error('SecurityError') },
  })
  env.api.setFrame(currentFrame)
  env.api.onFrameLoad({ currentTarget: oldFrame })
  assert.equal([...env.timers.values()].some(({ delay }) => delay === 600), false)
  assert.doesNotThrow(() => env.api.onFrameLoad({ currentTarget: currentFrame }))
  env.timeout(600)
  assert.equal(env.api.loading.value, false)
})

test('caption speaks only while the demo is not live, and never swallows a retry', (t) => {
  const env = shell(t)
  env.mount()

  // 还没开始：得解释「为什么不动」，并给一个立刻开始的口子
  assert.equal(env.api.previewStatus.value, 'appShell.waiting')

  env.api.startDemo()
  assert.equal(env.api.previewStatus.value, 'appShell.loading')

  // 真应用就绪 = 用户看得见点得着，再报一次「已载入」纯属噪音，整行消失
  const live = frame('live')
  env.api.setFrame(live)
  env.api.onMessage(ready(live))
  assert.equal(env.api.previewStatus.value, '')

  // 演示已经活着时再点开始是个空操作，不该把这行又变回「正在载入」
  env.api.startDemo()
  assert.equal(env.api.previewStatus.value, '')

  // 另一条路径：一直没就绪 → 超时。这行必须出声，
  // 不然「重新载入」按钮凭空浮在图注右边，没有上下文
  const slow = shell(t)
  slow.mount()
  slow.api.startDemo()
  slow.api.setFrame(frame('stuck'))
  slow.timeout(15000)
  assert.equal(slow.api.timedOut.value, true)
  assert.equal(slow.api.previewStatus.value, 'appShell.delayed')

  // 图注里那行是按状态渲染的：空串必须真的不占位，否则留下一条空的 role="status"
  const template = parse(
    readFileSync(new URL('../docs/.vitepress/theme/components/AppShell.vue', import.meta.url), 'utf8')
  ).descriptor.template.content
  assert.match(template, /<p v-if="previewStatus" class="sh__caption-actions">/)
})

test('starfield pauses and resumes normally but late callbacks cannot restart it after unmount', async (t) => {
  const anchor = { offsetHeight: 100, getBoundingClientRect: () => ({ top: 0, bottom: 100 }) }
  const env = component(t, 'HeroStarfield', ['hostEl', 'canvasEl'], { props: { anchor } })
  env.api.hostEl.value = markRaw({
    clientWidth: 100,
    clientHeight: 118,
    style: { setProperty() {} },
    offsetTop: 0,
    offsetParent: null,
  })
  env.api.canvasEl.value = markRaw({
    getContext: () => ({
      createImageData: (width, height) => ({ data: new Uint8ClampedArray(width * height * 4) }),
      putImageData() {},
    }),
  })
  env.mount()
  env.frame()
  env.frame()
  assert.equal(env.frames.size, 0, 'the initial starfield is static')
  env.afterLoad()
  assert.equal(env.frames.size, 1)

  const onIntersect = env.observers.at(-1).callback
  const onVisibility = env.document.listeners.get('visibilitychange')
  const onMotion = env.motionQuery.listeners.get('change')
  onIntersect([{ isIntersecting: false }])
  assert.equal(env.frames.size, 0)
  onIntersect([{ isIntersecting: true }])
  assert.equal(env.frames.size, 1)
  env.document.hidden = true
  onVisibility()
  assert.equal(env.frames.size, 0)
  env.document.hidden = false
  onVisibility()
  assert.equal(env.frames.size, 1)
  await onMotion({ matches: true })
  assert.equal(env.frames.size, 0)
  await onMotion({ matches: false })
  assert.equal(env.frames.size, 1)

  env.unmount()
  assert.equal(env.frames.size, 0)
  onIntersect([{ isIntersecting: true }])
  onVisibility()
  assert.equal(env.frames.size, 0, 'already queued callbacks must not revive the loop')
  env.frame()
  assert.equal(env.frames.size, 0)
  assert.equal(env.document.listeners.has('visibilitychange'), false)
  assert.equal(env.motionQuery.listeners.has('change'), false)
})
