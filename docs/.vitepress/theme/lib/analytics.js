import { afterPageLoad } from './deferred-work.js'

let scheduled = false

/**
 * Non-blocking, once per document; the SDK must load before LA.init is called.
 *
 * `autoTrack` turns on 51.la's event analysis (off by default since 2022-05): without it
 * the SDK installs an `LA.track` stub that only logs a warning, so custom events go nowhere.
 * The event module is fetched by the SDK itself after init; the dashboard's 事件分析 must be on.
 */
export function scheduleAnalytics(config) {
  if (!config?.id || scheduled || typeof document === 'undefined') return
  scheduled = true
  afterPageLoad(() => {
    const script = document.createElement('script')
    script.id = 'LA_COLLECT'
    script.src = 'https://sdk.51.la/js-sdk-pro.min.js'
    script.async = true
    script.charset = 'UTF-8'
    script.onload = () => window.LA?.init({ ...config, hashMode: true, autoTrack: true })
    script.onerror = () => { script.remove() }
    document.head.appendChild(script)
  }, { delay: 2000, timeout: 2000 })
}

/**
 * Custom event for 51.la's event analysis. Dropped silently while the SDK is still deferred,
 * blocked or not configured: analytics must never get in the way of a download.
 * 51.la keeps property keys up to 25 characters and values up to 64.
 */
export function track(event, props) {
  try {
    window.LA?.track?.(event, props)
  } catch {
    // An analytics failure is not the visitor's problem.
  }
}
