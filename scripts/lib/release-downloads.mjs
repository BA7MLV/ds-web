const DEFAULT_RELEASE_URL = 'https://github.com/000haoji/deep-student/releases/latest'

const ASSET_MATCHERS = {
  macArm64: [/(aarch64|arm64)\.dmg$/i],
  macX64: [/(x64|x86_64)\.dmg$/i],
  windowsX64: [/(x64|x86_64).*setup\.exe$/i, /setup\.exe$/i],
  androidArm64: [/arm64\.apk$/i, /\.apk$/i]
}

function toAssetEntry(asset) {
  if (!asset?.name || !asset?.browser_download_url) return null

  return {
    name: asset.name,
    url: asset.browser_download_url,
    sizeBytes: Number.isFinite(asset.size) ? asset.size : null
  }
}

function findAsset(assets, patterns) {
  for (const pattern of patterns) {
    const match = assets.find((asset) => pattern.test(asset?.name || ''))
    if (match) return toAssetEntry(match)
  }

  return null
}

export function buildDownloadsData(release) {
  const assets = Array.isArray(release?.assets) ? release.assets : []

  return {
    version: release?.tag_name || 'unknown',
    publishedAt: release?.published_at || null,
    releaseUrl: release?.html_url || DEFAULT_RELEASE_URL,
    generatedAt: new Date().toISOString(),
    platforms: {
      macArm64: findAsset(assets, ASSET_MATCHERS.macArm64),
      macX64: findAsset(assets, ASSET_MATCHERS.macX64),
      windowsX64: findAsset(assets, ASSET_MATCHERS.windowsX64),
      androidArm64: findAsset(assets, ASSET_MATCHERS.androidArm64)
    }
  }
}
