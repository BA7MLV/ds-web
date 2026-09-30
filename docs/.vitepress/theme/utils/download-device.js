/** 只读取浏览器提供的信息；iPad 的桌面 UA 不能当成 Mac。 */
export const detectPlatform = (device = globalThis.navigator) => {
  const ua = (device?.userAgent || '').toLowerCase()
  const platform = (device?.userAgentData?.platform || device?.platform || '').toLowerCase()

  if (/iphone|ipad|ipod/.test(ua) || (platform.includes('mac') && device?.maxTouchPoints > 1)) {
    return 'other'
  }
  if (ua.includes('android') || platform === 'android') return 'android'
  if (ua.includes('macintosh') || ua.includes('mac os x') || platform.includes('mac')) return 'mac'
  if (ua.includes('windows') || platform.includes('win')) return 'win'
  return 'other'
}

/**
 * 首页直下载的默认选项。Mac 的 Intel UA 也可能来自 Apple Silicon，不能据此选 Intel。
 * 有 Client Hints 时用实际架构；没有时默认 Apple Silicon，界面始终允许手动切换。
 * 未支持的平台返回空值，不能随便派发另一个系统的包。
 */
export const recommendedDownloadKey = (device, hints = {}) => {
  switch (detectPlatform(device)) {
    case 'mac': return hints.architecture === 'x86' ? 'mac-x64' : 'mac-arm'
    case 'win': return 'win-x64'
    case 'android': return 'android-arm64'
    default: return ''
  }
}
