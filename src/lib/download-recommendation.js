function normalize(value) {
  return typeof value === 'string' ? value.toLowerCase() : ''
}

export function detectSystemProfile(navigatorLike) {
  const ua = normalize(navigatorLike?.userAgent)
  const platform = normalize(navigatorLike?.platform)
  const uaPlatform = normalize(navigatorLike?.userAgentData?.platform)
  const uaArch = normalize(navigatorLike?.userAgentData?.architecture)

  let os = null
  if (uaPlatform.includes('mac') || platform.includes('mac') || ua.includes('macintosh')) os = 'macOS'
  else if (uaPlatform.includes('windows') || platform.includes('win') || ua.includes('windows nt')) os = 'Windows'
  else if (uaPlatform.includes('android') || ua.includes('android')) os = 'Android'

  let arch = null
  if (os === 'macOS') {
    if (uaArch.includes('arm') || uaArch.includes('aarch64')) arch = 'arm64'
    else if (uaArch.includes('x86') || uaArch.includes('x64')) arch = 'x64'
    else if (ua.includes('arm64') || ua.includes('aarch64')) arch = 'arm64'
    else if (ua.includes('x86_64')) arch = 'x64'
    else arch = 'arm64'
  }

  return { os, arch }
}

export function getRecommendedCardId(profile) {
  if (profile?.os === 'macOS' && profile?.arch === 'arm64') return 'macArm64'
  if (profile?.os === 'macOS' && profile?.arch === 'x64') return 'macX64'
  if (profile?.os === 'Windows') return 'windowsX64'
  if (profile?.os === 'Android') return 'androidArm64'
  return null
}

export function getPreferredPlatformTab(profile) {
  if (profile?.os === 'macOS') return 'macOS'
  if (profile?.os === 'Windows') return 'Windows'
  if (profile?.os === 'Android') return 'Android'
  return null
}
