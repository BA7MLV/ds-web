#!/usr/bin/env node
/** Repeatable cold-cache, compressed production A/B benchmark; no dependency downloads. */
/* global document, window, requestAnimationFrame, getComputedStyle */
import { readFile, stat, mkdir, writeFile } from 'node:fs/promises'
import { resolve, dirname, extname, sep } from 'node:path'
import { pathToFileURL, fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import { createServer } from 'node:http'
import { gzipSync } from 'node:zlib'
import { candidateFiles } from './audit-site.mjs'

const FALLBACK_PLAYWRIGHT = '/Users/ba7mlv/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs'
const NETWORK = { offline: false, latency: 150, downloadThroughput: 1_600_000 / 8, uploadThroughput: 750_000 / 8, connectionType: 'cellular4g' }
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.txt': 'text/plain; charset=utf-8', '.md': 'text/markdown; charset=utf-8', '.xml': 'application/xml', '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.ico': 'image/x-icon', '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.wasm': 'application/wasm', '.mp4': 'video/mp4' }
const DEVICES = {
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, isMobile: false, hasTouch: false },
  mobile: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true },
}

export function percentile(values, fraction) {
  const sorted = values.filter(Number.isFinite).sort((a, b) => a - b)
  if (!sorted.length) return null
  const position = (sorted.length - 1) * fraction
  const lower = Math.floor(position)
  return Math.round((sorted[lower] + (sorted[Math.ceil(position)] - sorted[lower]) * (position - lower)) * 10) / 10
}

export async function startStaticServer(directory) {
  const root = resolve(directory)
  if (!(await stat(resolve(root, 'index.html')).catch(() => null))?.isFile()) throw new Error(`Production homepage not found: ${root}`)
  const cache = new Map()
  const server = createServer(async (request, response) => {
    try {
      const url = new URL(request.url, 'http://localhost')
      let filename = null
      for (const candidate of candidateFiles(url.pathname)) {
        const path = resolve(root, candidate)
        if (!path.startsWith(`${root}${sep}`)) continue
        if ((await stat(path).catch(() => null))?.isFile()) { filename = path; break }
      }
      const status = filename ? 200 : 404
      filename ||= resolve(root, '404.html')
      let entry = cache.get(filename)
      if (!entry) {
        const body = await readFile(filename)
        const type = MIME[extname(filename)] || 'application/octet-stream'
        const compressible = /^(?:text\/|application\/(?:json|xml|wasm))|^image\/svg\+xml/.test(type)
        entry = { body, gzip: compressible ? gzipSync(body) : null, type }
        cache.set(filename, entry)
      }
      const gzip = entry.gzip && /\bgzip\b/.test(request.headers['accept-encoding'] || '')
      const body = gzip ? entry.gzip : entry.body
      response.writeHead(status, {
        'content-type': entry.type, 'content-length': body.length,
        'cache-control': 'no-store', 'vary': 'Accept-Encoding',
        ...(gzip ? { 'content-encoding': 'gzip' } : {}),
      })
      response.end(request.method === 'HEAD' ? undefined : body)
    } catch (error) {
      response.writeHead(500, { 'content-type': 'text/plain' })
      response.end(error.message)
    }
  })
  await new Promise((accept, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', accept)
  })
  return {
    root, origin: `http://127.0.0.1:${server.address().port}`,
    close: () => new Promise((accept) => { server.closeAllConnections(); server.close(accept) }),
  }
}

export function installTelemetry() {
  const data = {
    timeOrigin: performance.timeOrigin, lcp: null, cls: 0, longTasks: [],
    titleVisibleAt: null, ctaActionableAt: null, homepageUsableAt: null,
    demoReadyMessageAt: null, demoDomActionableAt: null,
    demoEvidence: null, demoDiagnostic: null, measureErrors: [],
  }
  window.__siteBench = data
  performance.setResourceTimingBufferSize(5000)
  const observe = (type, callback) => {
    try { new PerformanceObserver((list) => list.getEntries().forEach(callback)).observe({ type, buffered: true }) }
    catch (error) { data.measureErrors.push(`${type}: ${error.message}`) }
  }
  observe('largest-contentful-paint', (entry) => {
    data.lcp = { milliseconds: entry.startTime, size: entry.size, element: entry.element?.tagName || null, text: entry.element?.textContent?.trim().slice(0, 100) || null, url: entry.url || null }
  })
  observe('layout-shift', (entry) => { if (!entry.hadRecentInput) data.cls += entry.value })
  observe('longtask', (entry) => { data.longTasks.push({ startTime: entry.startTime, duration: entry.duration }) })
  if (window.top !== window) return
  window.addEventListener('message', (event) => {
    const frame = document.querySelector('iframe.sh__frame')
    if (event.data?.type === 'demo-shell-ready' && event.source === frame?.contentWindow && event.origin === window.location.origin) {
      data.demoReadyMessageAt = performance.now()
    }
  })
  function visible(element, inViewport = true) {
    if (!element || !element.getClientRects().length) return false
    const box = element.getBoundingClientRect()
    if (!box.width || !box.height) return false
    if (inViewport && (box.bottom <= 0 || box.top >= window.innerHeight || box.right <= 0 || box.left >= window.innerWidth)) return false
    for (let ancestor = element; ancestor?.nodeType === 1; ancestor = ancestor.parentElement) {
      const style = getComputedStyle(ancestor)
      // The site intentionally uses slightly-muted but fully visible controls
      // (for example the navigation brand at opacity .94). Only treat an
      // element as hidden when opacity is effectively zero.
      if (style.visibility === 'hidden' || style.display === 'none' || Number(style.opacity) <= 0.01) return false
    }
    return true
  }
  function actionable(element) {
    if (!visible(element) || element.matches(':disabled,[aria-disabled="true"]')) return false
    const box = element.getBoundingClientRect()
    const top = document.elementFromPoint(Math.max(0, Math.min(window.innerWidth - 1, box.x + box.width / 2)), Math.max(0, Math.min(window.innerHeight - 1, box.y + box.height / 2)))
    return element === top || element.contains(top)
  }
  let stableUsableFrames = 0
  let stableDemoFrames = 0
  function tick() {
    const now = performance.now()
    const title = document.querySelector('.lp-hero__title')
    const primary = document.querySelector('.lp-hero__actions a.home-btn-primary')
    const secondary = document.querySelector('.lp-hero__actions a.lp-hero__more')
    const navigation = document.querySelector('.SNav__brand')
    if (data.titleVisibleAt === null && visible(title) && title.textContent.trim()) data.titleVisibleAt = now
    if (data.ctaActionableAt === null && actionable(primary) && actionable(secondary)) data.ctaActionableAt = now
    if (visible(title) && actionable(primary) && actionable(secondary) && actionable(navigation)) stableUsableFrames += 1
    else stableUsableFrames = 0
    if (data.homepageUsableAt === null && stableUsableFrames >= 2) data.homepageUsableAt = now
    try {
      const frame = document.querySelector('iframe.sh__frame')
      const doc = frame?.contentDocument
      const root = doc?.querySelector('#root')
      const text = root?.innerText.trim() || ''
      const controls = [...(root?.querySelectorAll('button:not([disabled]),textarea:not([disabled]),input:not([disabled]),[contenteditable="true"],[role="button"]') || [])]
      const activeControl = controls.find((control) => {
        const box = control.getBoundingClientRect()
        const style = doc.defaultView.getComputedStyle(control)
        if (box.width < 1 || box.height < 1 || style.visibility === 'hidden' || style.display === 'none') return false
        const hit = doc.elementFromPoint(box.x + box.width / 2, box.y + box.height / 2)
        return hit === control || control.contains(hit)
      })
      data.demoDiagnostic = {
        frame: Boolean(frame), document: Boolean(doc), root: Boolean(root),
        textLength: text.length, controlCount: controls.length,
        hasActiveControl: Boolean(activeControl),
        alertCount: root?.querySelectorAll('[role="alert"]').length ?? 0,
        overlays: [...document.querySelectorAll('.sh__preview,.sh__loading:not(.is-done)')].map((overlay) => overlay.className),
      }
      // A message alone is insufficient: it can precede React's nested lazy view.
      // Require mounted, meaningful application text and an actual hit-testable control.
      const appReady = frame && visible(frame, false) && text.length >= 60 && activeControl &&
        !/^(?:正在加载|加载中|Loading)[.。…\s]*$/i.test(text) &&
        !root.querySelector('[role="alert"]') &&
        !document.querySelector('.sh__preview,.sh__loading:not(.is-done)')
      stableDemoFrames = appReady ? stableDemoFrames + 1 : 0
      if (data.demoDomActionableAt === null && stableDemoFrames >= 2) {
        data.demoDomActionableAt = now
        data.demoEvidence = { textExcerpt: text.slice(0, 160), textLength: text.length, controlTag: activeControl.tagName, controlLabel: (activeControl.getAttribute('aria-label') || activeControl.innerText || activeControl.getAttribute('placeholder') || '').slice(0, 100), rootChildCount: root.children.length, frameUrl: frame.src }
      }
    } catch (error) {
      if (!data.measureErrors.includes(error.message)) data.measureErrors.push(error.message)
    }
    window.__siteBenchRaf = requestAnimationFrame(tick)
  }
  window.__siteBenchRaf = requestAnimationFrame(tick)
}

async function loadPlaywright(explicitPath) {
  const require = createRequire(import.meta.url)
  let path = explicitPath
  if (!path) {
    try { path = require.resolve('playwright') } catch { path = FALLBACK_PLAYWRIGHT }
  }
  return { package: await import(pathToFileURL(resolve(path)).href), path }
}

async function oneRun(browser, server, options, device, variant, round) {
  const context = await browser.newContext({ ...DEVICES[device], locale: 'zh-CN', colorScheme: 'light', serviceWorkers: 'block' })
  const page = await context.newPage()
  const requests = []
  const responses = []
  const errors = []
  const externalRequests = []
  let cdp
  let result
  const startedAt = new Date().toISOString()
  try {
    await context.addInitScript(installTelemetry)
    if (options.thirdParty === 'block') {
      await context.route('**/*', (route) => {
        const url = new URL(route.request().url())
        if (url.origin === server.origin || !/^https?:$/.test(url.protocol)) return route.continue()
        externalRequests.push({ url: url.href, resourceType: route.request().resourceType(), action: 'aborted:blockedbyclient' })
        return route.abort('blockedbyclient')
      })
    }
    page.on('request', (request) => {
      let frame = null
      try { frame = request.frame()?.url() || null } catch { /* Worker requests can lack an associated frame. */ }
      requests.push({ url: request.url(), type: request.resourceType(), frame })
    })
    page.on('response', (response) => responses.push({ url: response.url(), status: response.status(), type: response.request().resourceType() }))
    page.on('pageerror', (error) => errors.push(error.message))
    page.on('requestfailed', (request) => {
      const external = new URL(request.url()).origin !== server.origin
      if (!external || options.thirdParty !== 'block') errors.push(`${request.url()}: ${request.failure()?.errorText}`)
    })
    cdp = await context.newCDPSession(page)
    await cdp.send('Network.enable')
    await cdp.send('Network.clearBrowserCache')
    await cdp.send('Network.setCacheDisabled', { cacheDisabled: true })
    await cdp.send('Network.emulateNetworkConditions', NETWORK)
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })
    const navigationErrors = []
    await page.goto(`${server.origin}/`, { waitUntil: 'commit', timeout: options.timeout }).catch((error) => navigationErrors.push(error.message))
    const usable = await page.waitForFunction(() => window.__siteBench?.homepageUsableAt != null, null, { timeout: options.timeout }).then(() => true).catch(() => false)
    let ctaTrial = { passed: false, note: 'Homepage did not reach the visible/actionable milestone.' }
    if (usable) {
      const checks = await page.evaluate(() => {
        const actionable = (selector) => {
          const element = document.querySelector(selector)
          if (!element || element.matches(':disabled,[aria-disabled="true"]')) return false
          const style = getComputedStyle(element)
          const rect = element.getBoundingClientRect()
          if (!element.getClientRects().length || !rect.width || !rect.height || style.visibility === 'hidden' || style.display === 'none' || Number(style.opacity) <= 0.01) return false
          if (rect.bottom <= 0 || rect.top >= window.innerHeight || rect.right <= 0 || rect.left >= window.innerWidth) return false
          const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2)
          return element === hit || element.contains(hit)
        }
        return {
          primary: actionable('.lp-hero__actions a.home-btn-primary'),
          secondary: actionable('.lp-hero__actions a.lp-hero__more'),
        }
      })
      ctaTrial = {
        passed: checks.primary && checks.secondary,
        note: 'Both real homepage links passed non-mutating visibility, enabled-state and hit-test checks; navigation was not triggered.',
        checks,
      }
    }
    const passive = await page.evaluate(() => ({ ...window.__siteBench, resources: performance.getEntriesByType('resource').map((entry) => ({ name: entry.name, initiatorType: entry.initiatorType, startTime: entry.startTime, duration: entry.duration, transferSize: entry.transferSize, encodedBodySize: entry.encodedBodySize })) }))
    const demoElement = page.locator('iframe.sh__frame')
    // A mobile viewport may intentionally keep the demo below the fold. Measure
    // natural loading separately, then perform the same explicit demo intent in A/B.
    const interactionAt = await page.evaluate(() => performance.now())
    await page.locator('.lp-hero__demo').scrollIntoViewIfNeeded({ timeout: 5000 }).catch(() => {})
    const startButton = page.locator('.sh__preview-actions button').first()
    // The preview can be replaced by the iframe between the actionability
    // check and the click. Force the explicit user intent through that benign
    // transition; the readiness milestone below still requires real iframe
    // content and a hit-testable control.
    const startVisible = await startButton.isVisible().catch(() => false)
    if (startVisible) await startButton.click({ force: true, timeout: 5000 }).catch(() => {})
    const demoInteraction = await page.evaluate(() => ({
      iframeCount: document.querySelectorAll('iframe.sh__frame').length,
      preview: Boolean(document.querySelector('.sh__preview')),
      loading: Boolean(document.querySelector('.sh__loading:not(.is-done)')),
    }))
    const demoReady = await page.waitForFunction(() => window.__siteBench?.demoDomActionableAt != null, null, { timeout: options.timeout }).then(() => true).catch(() => false)
    let demoTrial = { passed: false, note: 'The actual application did not become ready before the timeout.' }
    if (demoReady) {
      try {
        const frame = await (await demoElement.elementHandle())?.contentFrame()
        if (!frame) throw new Error('Demo frame not found after readiness.')
        const controls = frame.locator('#root button:not([disabled]),#root textarea:not([disabled]),#root input:not([disabled]),#root [contenteditable="true"],#root [role="button"]')
        for (let index = 0; index < await controls.count(); index += 1) {
          const control = controls.nth(index)
          if (!await control.isVisible()) continue
          try {
            const hit = await control.evaluate((element) => {
              const rect = element.getBoundingClientRect()
              const style = getComputedStyle(element)
              if (!rect.width || !rect.height || style.visibility === 'hidden' || style.display === 'none' || Number(style.opacity) <= 0.01) return false
              const target = element.ownerDocument.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2)
              return target === element || element.contains(target)
            })
            if (!hit) continue
            demoTrial = { passed: true, note: 'A visible control inside the actual mounted demo passed non-mutating visibility, enabled-state and hit-test checks.', controlText: ((await control.textContent()) || '').trim().slice(0, 100) }
            break
          } catch { /* Try the next actual application control. */ }
        }
      } catch (error) { demoTrial = { passed: false, note: error.message } }
    }
    // Use the same post-interaction observation window for both builds.
    await page.waitForTimeout(options.settle)
    const telemetry = await page.evaluate(() => ({ ...window.__siteBench, navigation: performance.getEntriesByType('navigation')[0]?.toJSON(), resources: performance.getEntriesByType('resource').map((entry) => ({ name: entry.name, initiatorType: entry.initiatorType, startTime: entry.startTime, duration: entry.duration, transferSize: entry.transferSize, encodedBodySize: entry.encodedBodySize })) }))
    const frameTelemetry = []
    for (const frame of page.frames().filter((frame) => frame !== page.mainFrame())) {
      try {
        frameTelemetry.push(await frame.evaluate(() => ({ url: window.location.href, ...window.__siteBench, resources: performance.getEntriesByType('resource').map((entry) => ({ name: entry.name, initiatorType: entry.initiatorType, startTime: entry.startTime, duration: entry.duration, transferSize: entry.transferSize, encodedBodySize: entry.encodedBodySize })) })))
      } catch (error) { errors.push(`frame telemetry: ${error.message}`) }
    }
    const allResources = [telemetry, ...frameTelemetry].flatMap((frame) => frame.resources || [])
    const mainLongTasksBeforeUsable = telemetry.longTasks.filter((task) => task.startTime <= telemetry.homepageUsableAt)
    result = {
      variant, device, round, startedAt, status: usable && ctaTrial.passed && demoReady && demoTrial.passed ? 'passed' : 'incomplete',
      titleVisibleMs: telemetry.titleVisibleAt, ctaActionableMs: telemetry.ctaActionableAt,
      homepageUsableMs: telemetry.homepageUsableAt,
      lcpMs: telemetry.lcp?.milliseconds ?? null, lcpElement: telemetry.lcp,
      lcpBeforeDemoIntentMs: passive.lcp?.milliseconds ?? null,
      demoReadyMessageMs: telemetry.demoReadyMessageAt,
      demoDomActionableMs: telemetry.demoDomActionableAt,
      demoNaturalReadyBeforeIntent: passive.demoDomActionableAt !== null,
      demoIntentMs: interactionAt,
      demoAfterIntentMs: telemetry.demoDomActionableAt == null ? null : Math.max(0, telemetry.demoDomActionableAt - interactionAt),
      ctaTrial, demoTrial, demoEvidence: telemetry.demoEvidence, demoDiagnostic: telemetry.demoDiagnostic,
      demoInteraction: { startVisible, ...demoInteraction },
      cls: telemetry.cls,
      longTasks: { mainCount: telemetry.longTasks.length, mainTotalMs: telemetry.longTasks.reduce((sum, task) => sum + task.duration, 0), mainBeforeUsableCount: mainLongTasksBeforeUsable.length, mainBeforeUsableBlockingMs: mainLongTasksBeforeUsable.reduce((sum, task) => sum + Math.max(0, task.duration - 50), 0), iframeCount: frameTelemetry.reduce((sum, frame) => sum + (frame.longTasks?.length || 0), 0) },
      resources: { requestedCount: requests.length, completedTimingCount: allResources.length, scripts: requests.filter((request) => request.type === 'script').length, stylesheets: requests.filter((request) => request.type === 'stylesheet').length, encodedBodyBytes: allResources.reduce((sum, entry) => sum + entry.encodedBodySize, 0), transferBytes: allResources.reduce((sum, entry) => sum + entry.transferSize, 0), topDocumentBeforeHomepageUsableCount: passive.resources.filter((entry) => entry.startTime <= passive.homepageUsableAt).length },
      navigationErrors, errors, externalRequests, requests, responses, telemetry, frameTelemetry,
    }
  } catch (error) {
    result = { variant, device, round, startedAt, status: 'failed', error: error.message, errors, requests, responses, externalRequests }
  } finally {
    await cdp?.detach().catch(() => {})
    await context.close()
  }
  return result
}

function summarize(runs, devices) {
  const metrics = ['titleVisibleMs', 'ctaActionableMs', 'homepageUsableMs', 'lcpMs', 'lcpBeforeDemoIntentMs', 'demoDomActionableMs', 'demoAfterIntentMs']
  const groups = {}
  for (const device of devices) {
    groups[device] = {}
    for (const variant of ['baseline', 'optimized']) {
      const entries = runs.filter((run) => run.device === device && run.variant === variant)
      groups[device][variant] = { attempts: entries.length, passed: entries.filter((run) => run.status === 'passed').length }
      for (const metric of metrics) {
        const values = entries.map((run) => run[metric]).filter(Number.isFinite)
        groups[device][variant][metric] = { validSamples: values.length, p50: percentile(values, 0.5), p75: percentile(values, 0.75), p95: percentile(values, 0.95) }
      }
    }
    const before = groups[device].baseline.homepageUsableMs.p75
    const after = groups[device].optimized.homepageUsableMs.p75
    groups[device].homepageP75ImprovementPercent = before && after ? Math.round((1 - after / before) * 1000) / 10 : null
  }
  return groups
}

async function main() {
  const args = process.argv.slice(2)
  const get = (name, fallback) => args.includes(name) ? args[args.indexOf(name) + 1] : fallback
  if (args.includes('--help')) {
    console.log('Usage: node scripts/bench-site.mjs --baseline /path/to/baseline [--optimized docs/.vitepress/dist] [--runs 10] [--devices desktop,mobile] [--third-party block|live] [--timeout 90000] [--settle 2000] [--playwright /path/to/index.mjs] [--executable-path /path/to/chromium] [--output perf/bench/benchmark.json]')
    return
  }
  const options = { baseline: get('--baseline'), optimized: get('--optimized', 'docs/.vitepress/dist'), runs: Number(get('--runs', 10)), devices: get('--devices', 'desktop,mobile').split(','), thirdParty: get('--third-party', 'block'), timeout: Number(get('--timeout', 90000)), settle: Number(get('--settle', 2000)), playwright: get('--playwright'), executablePath: get('--executable-path') }
  if (!options.baseline) throw new Error('--baseline is required; capture the unmodified production build before optimizing.')
  if (!Number.isInteger(options.runs) || options.runs < 1) throw new Error('--runs must be a positive integer.')
  if (options.devices.some((device) => !DEVICES[device])) throw new Error('--devices accepts desktop,mobile.')
  if (!['block', 'live'].includes(options.thirdParty)) throw new Error('--third-party accepts block or live.')
  const output = resolve(get('--output', 'perf/bench/benchmark.json'))
  const report = {
    generatedAt: new Date().toISOString(), status: 'running', options,
    protocol: {
      network: { label: 'Explicit mobile profile (not a browser preset)', ...NETWORK }, cpuSlowdown: 4, compression: 'gzip for HTML, JS, CSS, SVG and other compressible resources',
      cache: 'New browser context per run, service workers blocked, browser disk cache cleared and disabled, static HTTP Cache-Control:no-store. OS DNS/cache and browser process startup are outside the measurement.',
      order: 'For each device, A/B on even rounds, B/A on odd rounds; runs means samples per variant per device.',
      thirdParty: options.thirdParty === 'block' ? 'All requests outside the local production server are aborted deterministically, for both variants. This isolates first-party cost and does not measure real Google Fonts, analytics or remote API latency/success.' : 'Live third-party responses; external timing is uncontrolled and can add variance or fail offline.',
      usable: 'Actual title, primary and secondary CTA and brand navigation visible, not occluded, stable for 2 frames; both CTA links must pass non-mutating visibility, enabled-state and hit-test checks.',
      demo: 'After the homepage milestone, scroll the actual demo into view and click the start button when present. The mounted iframe must expose meaningful app text and a hit-testable enabled control, the loading overlay must be gone, and the control must pass non-mutating DOM actionability checks. Placeholder content and ready messages alone never count.',
      lcp: 'Top-document LCP captured before explicit demo intent and again at end; iframe readiness is reported separately because browser LCP does not represent iframe usability.',
      percentiles: 'Linear interpolation over finite samples; missing samples are never treated as zero. Valid counts and failed runs must accompany comparisons.',
      goal: 'Mobile homepage usable p75 at least 50% lower; only judge with 10 successful runs per variant, and examine real demo readiness separately.',
    }, runs: [],
  }
  const save = async () => { await mkdir(dirname(output), { recursive: true }); await writeFile(output, `${JSON.stringify(report, null, 2)}\n`) }
  let baseline, optimized, browser
  try {
    baseline = await startStaticServer(options.baseline)
    optimized = await startStaticServer(options.optimized)
    const imported = await loadPlaywright(options.playwright)
    report.playwright = imported.path
    browser = await imported.package.chromium.launch({ headless: true, ...(options.executablePath ? { executablePath: options.executablePath } : {}) })
    report.browserVersion = browser.version()
    report.servers = { baseline: baseline.origin, optimized: optimized.origin }
    for (const device of options.devices) {
      for (let round = 0; round < options.runs; round += 1) {
        const order = round % 2 ? ['optimized', 'baseline'] : ['baseline', 'optimized']
        for (const variant of order) {
          const result = await oneRun(browser, variant === 'baseline' ? baseline : optimized, options, device, variant, round + 1)
          report.runs.push(result)
          report.summary = summarize(report.runs, options.devices)
          await save()
          console.log(JSON.stringify({ device, variant, round: round + 1, status: result.status, homepageUsableMs: result.homepageUsableMs, demoDomActionableMs: result.demoDomActionableMs, error: result.error }))
        }
      }
    }
    report.status = report.runs.every((run) => run.status === 'passed') ? 'completed' : 'incomplete'
    const mobile = report.summary.mobile
    report.mobileGoal = {
      eligible: options.runs >= 10 && mobile?.baseline.passed === options.runs && mobile?.optimized.passed === options.runs,
      homepageP75ImprovementPercent: mobile?.homepageP75ImprovementPercent ?? null,
      reached: options.runs >= 10 && mobile?.baseline.passed === options.runs && mobile?.optimized.passed === options.runs && mobile.homepageP75ImprovementPercent >= 50,
    }
    if (report.status !== 'completed') process.exitCode = 1
  } catch (error) {
    report.status = 'blocked'
    report.failure = { name: error.name, message: error.message, stack: error.stack }
    process.exitCode = 1
    console.error(`Benchmark could not complete: ${error.message}`)
  } finally {
    await browser?.close().catch(() => {})
    await baseline?.close()
    await optimized?.close()
    report.finishedAt = new Date().toISOString()
    await save()
  }
  console.log(JSON.stringify({ status: report.status, summary: report.summary, mobileGoal: report.mobileGoal, output }, null, 2))
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => { console.error(error); process.exitCode = 1 })
}
