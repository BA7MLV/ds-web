/**
 * 功能区字符画的网格数据（scripts/gen-features-live.mjs 产出的 docs/public/features/<name>.json）。
 * 同一张只取一次；轮播切到别的场景前可以先 warm，切过去时就不用等网络。
 */
const cache = new Map()

export const loadFeatureArt = (name) => {
  if (!cache.has(name)) {
    const request = fetch(`/features/${name}.json`).then((response) => {
      if (!response.ok) throw new Error(`features/${name}.json ${response.status}`)
      return response.json()
    })
    // 失败的请求不留在缓存里，下次还能重试
    request.catch(() => cache.delete(name))
    cache.set(name, request)
  }
  return cache.get(name)
}

export const warmFeatureArt = (names) => {
  for (const name of names) loadFeatureArt(name).catch(() => {})
}

/** 真实截图的地址：和网格同一个取景框，深浅色各一张 */
export const featureShot = (name, dark) => `/features/${name}-${dark ? 'dark' : 'light'}.webp`
