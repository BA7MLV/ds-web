const DEFAULT_RELEASE_URL = 'https://github.com/000haoji/deep-student/releases/latest'

function formatSize(sizeBytes, fallback) {
  if (!Number.isFinite(sizeBytes) || sizeBytes <= 0) return fallback

  if (sizeBytes >= 1024 * 1024 * 1024) {
    return `${(sizeBytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
  }

  if (sizeBytes >= 1024 * 1024) {
    return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return `${(sizeBytes / 1024).toFixed(1)} KB`
}

function resolveLink(asset, releaseUrl) {
  return asset?.url || releaseUrl || DEFAULT_RELEASE_URL
}

function buildAssetCard(spec, asset, version, releaseUrl, labels) {
  return {
    id: spec.id,
    platform: spec.platform,
    channel: spec.channel,
    version,
    size: formatSize(asset?.sizeBytes, labels.unknownSize),
    requirements: spec.requirements,
    description: spec.description,
    ctaLabel: spec.ctaLabel,
    ctaHref: resolveLink(asset, releaseUrl)
  }
}

export function buildWebsiteDownloads(downloadsData, labels) {
  const releaseUrl = downloadsData?.releaseUrl || DEFAULT_RELEASE_URL
  const version = downloadsData?.version || 'unknown'
  const platforms = downloadsData?.platforms || {}

  const specs = [
    {
      id: 'macArm64',
      key: 'macArm64',
      platform: 'macOS',
      channel: labels.macArmChannel,
      requirements: labels.macArmRequirements,
      description: labels.macArmDescription,
      ctaLabel: labels.macArmCta
    },
    {
      id: 'macX64',
      key: 'macX64',
      platform: 'macOS',
      channel: labels.macX64Channel,
      requirements: labels.macX64Requirements,
      description: labels.macX64Description,
      ctaLabel: labels.macX64Cta
    },
    {
      id: 'windowsX64',
      key: 'windowsX64',
      platform: 'Windows',
      channel: labels.windowsChannel,
      requirements: labels.windowsRequirements,
      description: labels.windowsDescription,
      ctaLabel: labels.windowsCta
    },
    {
      id: 'androidArm64',
      key: 'androidArm64',
      platform: 'Android',
      channel: labels.androidChannel,
      requirements: labels.androidRequirements,
      description: labels.androidDescription,
      ctaLabel: labels.androidCta
    }
  ]

  const cards = specs
    .map((spec) => {
      const asset = platforms[spec.key]
      if (!asset) return null
      return buildAssetCard(spec, asset, version, releaseUrl, labels)
    })
    .filter(Boolean)

  if (cards.length > 0) return cards

  return [
    {
      id: 'allReleases',
      platform: 'GitHub Releases',
      channel: labels.fallbackLabel,
      version,
      size: labels.unknownSize,
      requirements: labels.fallbackRequirements,
      description: labels.fallbackDescription,
      ctaLabel: labels.fallbackCta,
      ctaHref: releaseUrl
    }
  ]
}
