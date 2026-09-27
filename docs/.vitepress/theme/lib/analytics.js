import { afterPageLoad } from './deferred-work.js'

let scheduled = false

/** Non-blocking, once per document; the SDK must load before LA.init is called. */
export function scheduleAnalytics(config) {
  if (!config?.id || scheduled || typeof document === 'undefined') return
  scheduled = true
  afterPageLoad(() => {
    const script = document.createElement('script')
    script.id = 'LA_COLLECT'
    script.src = 'https://sdk.51.la/js-sdk-pro.min.js'
    script.async = true
    script.charset = 'UTF-8'
    script.onload = () => window.LA?.init({ ...config, hashMode: true })
    script.onerror = () => { script.remove() }
    document.head.appendChild(script)
  }, { delay: 2000, timeout: 2000 })
}
