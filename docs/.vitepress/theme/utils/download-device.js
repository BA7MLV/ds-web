/**
 * 只读取浏览器提供的信息；iPad 的桌面 UA 不能当成 Mac。
 * iPhone / iPad 单独认出来（'ios'）：没有安装包，但要告诉他们「在电脑上下载」，而不是当成认不出的设备。
 */
export const detectPlatform = (device = globalThis.navigator) => {
  const ua = (device?.userAgent || '').toLowerCase()
  const platform = (device?.userAgentData?.platform || device?.platform || '').toLowerCase()

  if (/iphone|ipad|ipod/.test(ua) || (platform.includes('mac') && device?.maxTouchPoints > 1)) {
    return 'ios'
  }
  if (ua.includes('android') || platform === 'android') return 'android'
  if (ua.includes('macintosh') || ua.includes('mac os x') || platform.includes('mac')) return 'mac'
  if (ua.includes('windows') || platform.includes('win')) return 'win'
  if (ua.includes('linux') || platform.includes('linux')) return 'linux'
  return 'other'
}

/**
 * Linux 包只有 x86_64 一种。UA 里写着 ARM 或 32 位、或 Client Hints 报了 arm，
 * 都不能派发 x86_64 的包；什么都没写时按 x86_64 算（桌面 Linux 绝大多数是它）。
 */
const isLinuxX64 = (device, hints) => {
  if (hints.architecture && hints.architecture !== 'x86') return false
  const ua = `${device?.userAgent || ''} ${device?.platform || ''}`.toLowerCase()
  return !/aarch64|arm64|armv\d|\bi[3-6]86\b/.test(ua)
}

/**
 * 首页直下载的默认选项。Mac 的 Intel UA 也可能来自 Apple Silicon，不能据此选 Intel。
 * 有 Client Hints 时用实际架构；没有时默认 Apple Silicon，界面始终允许手动切换。
 * Linux 默认给 AppImage：不挑发行版，下载即可运行；deb / rpm 留在清单里。
 * 未支持的平台返回空值，不能随便派发另一个系统的包。
 */
export const recommendedDownloadKey = (device, hints = {}) => {
  switch (detectPlatform(device)) {
    case 'mac': return hints.architecture === 'x86' ? 'mac-x64' : 'mac-arm'
    case 'win': return 'win-x64'
    case 'linux': return isLinuxX64(device, hints) ? 'linux-appimage' : ''
    case 'android': return 'android-arm64'
    default: return ''
  }
}
