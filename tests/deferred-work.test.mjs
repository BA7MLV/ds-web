import test from 'node:test'
import assert from 'node:assert/strict'

import {
  afterPageLoad,
  observeNearViewport,
} from '../docs/.vitepress/theme/lib/deferred-work.js'

const browser = (t, { readyState = 'complete', idleSupport = true } = {}) => {
  let nextId = 0
  const frames = new Map()
  const timers = new Map()
  const idle = new Map()
  const document = Object.assign(new EventTarget(), { readyState, hidden: false })
  const window = Object.assign(new EventTarget(), {
    innerHeight: 800,
    setTimeout: (callback, delay) => {
      timers.set(++nextId, { callback, delay })
      return nextId
    },
  })
  if (idleSupport) {
    window.requestIdleCallback = (callback, options) => {
      idle.set(++nextId, { callback, options })
      return nextId
    }
    window.cancelIdleCallback = (id) => idle.delete(id)
  }

  const originals = new Map()
  const cleanups = []
  const replaceGlobal = (key, value) => {
    if (!originals.has(key)) originals.set(key, Object.getOwnPropertyDescriptor(globalThis, key))
    Object.defineProperty(globalThis, key, { configurable: true, writable: true, value })
  }
  replaceGlobal('window', window)
  replaceGlobal('document', document)
  replaceGlobal('requestAnimationFrame', (callback) => {
    frames.set(++nextId, { callback })
    return nextId
  })
  replaceGlobal('cancelAnimationFrame', (id) => frames.delete(id))
  replaceGlobal('clearTimeout', (id) => timers.delete(id))
  replaceGlobal('IntersectionObserver', undefined)

  t.after(() => {
    cleanups.forEach((cleanup) => cleanup())
    for (const [key, descriptor] of originals) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor)
      else delete globalThis[key]
    }
  })

  const flush = (queue) => {
    const entries = [...queue.values()]
    queue.clear()
    entries.forEach(({ callback }) => callback())
  }
  const dispatch = (target, type) => target.dispatchEvent(new Event(type))
  return {
    window, document, frames, timers, idle, replaceGlobal, dispatch,
    cleanup: (callback) => cleanups.push(callback),
    frame: () => flush(frames),
    timer: () => flush(timers),
    idleCallback: () => flush(idle),
    paint: () => { flush(frames); flush(frames) },
  }
}

test('noncritical work waits for load, two frames, delay and idle', (t) => {
  const env = browser(t, { readyState: 'loading' })
  let called = 0
  const cancel = afterPageLoad(() => called++, { delay: 800, timeout: 2200 })
  env.cleanup(cancel)

  assert.equal(env.frames.size, 0)
  env.dispatch(env.window, 'load')
  env.frame()
  assert.equal(called, 0)
  assert.equal(env.timers.size, 0)
  env.frame()
  assert.equal([...env.timers.values()][0].delay, 800)
  env.timer()
  assert.equal(called, 0)
  assert.equal([...env.idle.values()][0].options.timeout, 2200)
  env.idleCallback()
  assert.equal(called, 1)

  env.dispatch(env.window, 'load')
  env.paint()
  env.timer()
  env.idleCallback()
  assert.equal(called, 1)
})

test('already loaded pages skip the load event and support browsers without idle callbacks', (t) => {
  const env = browser(t, { idleSupport: false })
  let called = 0
  env.cleanup(afterPageLoad(() => called++))

  env.paint()
  env.timer()
  assert.equal(called, 0)
  assert.equal([...env.timers.values()][0].delay, 50)
  env.timer()
  assert.equal(called, 1)
})

for (const phase of ['load', 'first frame', 'second frame', 'delay', 'idle']) {
  test(`cancellation stops pending work during ${phase}`, (t) => {
    const env = browser(t, { readyState: 'loading' })
    let called = 0
    const cancel = afterPageLoad(() => called++)

    if (phase !== 'load') env.dispatch(env.window, 'load')
    if (['second frame', 'delay', 'idle'].includes(phase)) env.frame()
    if (['delay', 'idle'].includes(phase)) env.frame()
    if (phase === 'idle') env.timer()
    cancel()

    env.dispatch(env.window, 'load')
    env.paint()
    env.timer()
    env.idleCallback()
    assert.equal(called, 0)
    assert.equal(env.frames.size + env.timers.size + env.idle.size, 0)
  })
}

test('hidden tabs resume only after visibility, two frames and an idle opportunity', (t) => {
  const env = browser(t)
  let called = 0
  env.cleanup(afterPageLoad(() => called++))
  env.paint()
  env.timer()
  env.document.hidden = true
  env.idleCallback()
  assert.equal(called, 0)

  env.dispatch(env.document, 'visibilitychange')
  assert.equal(env.frames.size, 0)
  env.document.hidden = false
  env.dispatch(env.document, 'visibilitychange')
  env.frame()
  assert.equal(called, 0)
  env.frame()
  env.timer()
  env.idleCallback()
  assert.equal(called, 1)

  env.dispatch(env.document, 'visibilitychange')
  assert.equal(env.frames.size, 0)
})

test('cancelling while hidden removes the pending visibility resume', (t) => {
  const env = browser(t)
  let called = 0
  const cancel = afterPageLoad(() => called++)
  env.paint()
  env.timer()
  env.document.hidden = true
  env.idleCallback()
  cancel()

  env.document.hidden = false
  env.dispatch(env.document, 'visibilitychange')
  env.paint()
  env.timer()
  env.idleCallback()
  assert.equal(called, 0)
  assert.equal(env.frames.size + env.timers.size + env.idle.size, 0)
})

test('viewport observer applies its margin and disconnects on cleanup', (t) => {
  const env = browser(t)
  let handler, options, observed, disconnected = 0
  env.replaceGlobal('IntersectionObserver', class {
    constructor(callback, init) { handler = callback; options = init }
    observe(element) { observed = element }
    disconnect() { disconnected++ }
  })
  const element = {}
  const changes = []
  const stop = observeNearViewport(element, (near) => changes.push(near), 240)
  assert.equal(observed, element)
  assert.deepEqual(options, { rootMargin: '240px 0px' })
  handler([{ isIntersecting: false }])
  handler([{ isIntersecting: true }])
  assert.deepEqual(changes, [false, true])
  stop()
  assert.equal(disconnected, 1)
  handler([{ isIntersecting: false }])
  assert.deepEqual(changes, [false, true], 'cleanup also ignores an already queued callback')
})

test('viewport fallback coalesces scrolling and handles entering, leaving and cleanup', (t) => {
  const env = browser(t)
  let bounds = { top: 1500, bottom: 1800 }
  let measurements = 0
  const changes = []
  const element = {
    getBoundingClientRect: () => { measurements++; return bounds },
  }
  const stop = observeNearViewport(element, (near) => changes.push(near), 300)
  assert.equal(measurements, 0)
  env.frame()
  assert.deepEqual(changes, [false])

  bounds = { top: 1000, bottom: 1300 }
  env.dispatch(env.window, 'scroll')
  env.dispatch(env.window, 'scroll')
  env.dispatch(env.window, 'resize')
  assert.equal(env.frames.size, 1)
  env.frame()
  assert.deepEqual(changes, [false, true])

  bounds = { top: -700, bottom: -301 }
  env.dispatch(env.window, 'scroll')
  env.frame()
  assert.deepEqual(changes, [false, true, false])

  env.dispatch(env.window, 'scroll')
  stop()
  env.dispatch(env.window, 'resize')
  env.frame()
  assert.equal(measurements, 3)
  assert.equal(env.frames.size, 0)
  assert.doesNotThrow(() => observeNearViewport(null, () => {})())
})

test('analytics loads once after the page and only initializes after SDK load', async (t) => {
  const env = browser(t)
  const scripts = []
  const calls = []
  env.document.createElement = (tag) => ({ tag, remove() {} })
  env.document.head = { appendChild: (script) => scripts.push(script) }
  env.window.LA = { init: (config) => calls.push(config) }
  const { scheduleAnalytics } = await import('../docs/.vitepress/theme/lib/analytics.js')
  const config = { id: 'test-site', ck: 'test-counter' }

  scheduleAnalytics(config)
  scheduleAnalytics(config)
  assert.equal(scripts.length, 0)
  assert.equal(calls.length, 0)
  env.paint()
  assert.equal([...env.timers.values()][0].delay, 2000)
  env.timer()
  env.idleCallback()
  assert.equal(scripts.length, 1)
  assert.equal(scripts[0].tag, 'script')
  assert.equal(scripts[0].async, true)
  assert.match(scripts[0].src, /sdk\.51\.la/)
  assert.equal(calls.length, 0)

  scripts[0].onload()
  assert.deepEqual(calls, [{ ...config, hashMode: true }])
  scheduleAnalytics(config)
  env.paint()
  env.timer()
  env.idleCallback()
  assert.equal(scripts.length, 1)
  assert.equal(calls.length, 1)
})
