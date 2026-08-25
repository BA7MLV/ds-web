import { useEffect, useState } from 'react'
import { ThemeToggle } from '../theme-toggle'
import { LocaleToggle, useLocale } from '../locale-toggle'
import sharedDownloads from '../../data/downloads.json'
import { buildWebsiteDownloads } from '../../lib/website-downloads'
import {
  detectSystemProfile,
  getPreferredPlatformTab,
  getRecommendedCardId
} from '../../lib/download-recommendation'

export const normalizeReleaseVersion = (rawVersion) => {
  const value = typeof rawVersion === 'string' ? rawVersion.trim() : ''
  if (!value) return 'v--'
  return value.toLowerCase().startsWith('v') ? `v${value.slice(1)}` : `v${value}`
}

export const formatReleaseDate = (rawDate, locale) => {
  if (!rawDate) return '--'

  const parsed = new Date(rawDate)
  if (Number.isNaN(parsed.getTime())) return '--'

  const year = parsed.getUTCFullYear()
  const month = parsed.getUTCMonth() + 1
  const day = parsed.getUTCDate()

  if (locale === 'en') {
    return `${month}/${day}/${year}`
  }
  return `${year}/${month}/${day}`
}

export const DownloadPage = ({ onBack = () => {} }) => {
  const { t, locale } = useLocale()
  const platformDownloads = buildWebsiteDownloads(sharedDownloads, {
    macArmChannel: t('download.channel.macArm', 'Apple 芯片 · aarch64'),
    macX64Channel: t('download.channel.macX64', 'Intel 芯片 · x64'),
    windowsChannel: t('download.channel.windowsX64', 'Windows · x64'),
    androidChannel: t('download.channel.androidArm64', 'Android · arm64'),
    fallbackLabel: t('download.allReleases', '全部版本'),
    unknownSize: '--',
    macArmRequirements: t('download.requirements.macos', 'macOS 13+（Apple Silicon）'),
    macX64Requirements: t('download.requirements.macos', 'macOS 13+（Intel）'),
    windowsRequirements: t('download.requirements.windows', 'Windows 11 / 10 22H2+'),
    androidRequirements: t('download.requirements.android', 'Android 10+（ARM64）'),
    macArmDescription: t('download.description.macos', '适用于 Apple Silicon 设备的 DMG 安装包'),
    macX64Description: t('download.description.macos', '适用于 Intel 设备的 DMG 安装包'),
    windowsDescription: t('download.description.windows'),
    androidDescription: t('download.description.android', '适用于 Android 设备的 APK 安装包'),
    macArmCta: t('download.downloadDmg', '下载 DMG'),
    macX64Cta: t('download.downloadDmg', '下载 DMG'),
    windowsCta: t('download.downloadExe', '下载 EXE'),
    androidCta: t('download.downloadApk', '下载 APK'),
    fallbackRequirements: t('download.requirements.all', '请根据设备选择对应安装包'),
    fallbackDescription: t('download.description.all', '当前未获取到分平台安装包，请前往 Releases 查看全部资产'),
    fallbackCta: t('download.openReleases', '打开 GitHub Releases')
  })

  const tabs = [
    { id: 'macOS', label: 'macOS' },
    { id: 'Windows', label: 'Windows' },
    { id: 'Android', label: 'Android' }
  ]

  const [activeTab, setActiveTab] = useState('macOS')
  const [recommendedId, setRecommendedId] = useState(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const profile = detectSystemProfile(window.navigator)
    const preferredTab = getPreferredPlatformTab(profile)
    const preferredCardId = getRecommendedCardId(profile)

    if (preferredTab) setActiveTab(preferredTab)
    setRecommendedId(preferredCardId)
  }, [])

  const filteredDownloads = platformDownloads.filter((item) => item.platform === activeTab)
  const releaseVersion = normalizeReleaseVersion(sharedDownloads?.version)
  const updatedAtRaw = sharedDownloads?.generatedAt || sharedDownloads?.publishedAt
  const releaseUpdatedAt = formatReleaseDate(updatedAtRaw, locale)
  return (
    <div className="relative min-h-screen min-h-[100svh] bg-transparent pb-[6.854rem] sm:pb-[11.09rem]">
      <div className="sticky top-0 z-40 border-b border-[color:var(--apple-line)] bg-[color:var(--apple-nav-bg)] backdrop-blur-xl pt-safe">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3">
          <button
            type="button"
            onClick={onBack}
            className="focus-ring inline-flex items-center gap-2 text-sm font-medium text-[color:var(--apple-muted)] hover:text-[color:var(--apple-ink)] active:text-[color:var(--apple-ink)] transition-colors"
          >
← {t('download.backHome')}
          </button>
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <LocaleToggle compact className="w-[8.75rem]" />
          </div>
        </div>
      </div>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-[3.236rem] sm:pt-[4.236rem] md:pt-[5.854rem] text-center">
        <h1 className="text-[2.2rem] sm:text-[3.2rem] font-semibold text-[color:var(--apple-ink)] tracking-[-0.02em] font-display">
          {t('download.title', 'DeepStudent {version}', { version: releaseVersion })}
        </h1>
        <p className="mt-3 text-sm text-[color:var(--apple-muted)] max-w-md mx-auto">
          {t('download.subtitle', '更新时间：{updatedAt}', { updatedAt: releaseUpdatedAt })}
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-[3.236rem] sm:pt-[4.236rem]">
        <h2 className="text-[1.3rem] sm:text-[1.9rem] font-semibold text-[color:var(--apple-ink)] tracking-[-0.02em] font-display">
          {t('download.selectPlatform')}
        </h2>

        <div className="mt-4 inline-flex items-center rounded-full border border-[color:var(--apple-line)] bg-[color:var(--apple-card)] p-1">
          {tabs.map((tab) => {
            const active = tab.id === activeTab
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`focus-ring rounded-full px-4 py-2 text-xs font-medium transition-colors ${
                  active
                    ? 'bg-[color:var(--apple-btn-primary-bg)] text-[color:var(--apple-btn-primary-text)]'
                    : 'text-[color:var(--apple-muted)] hover:text-[color:var(--apple-ink)]'
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {filteredDownloads.map((platform) => (
              <article
                key={platform.id}
                className={`rounded-[1.5rem] bg-[color:var(--apple-card)] border p-[1.5rem] sm:p-[1.75rem] shadow-[var(--apple-shadow-sm)] transition-all duration-300 ease-apple hover-lift ${
                  platform.id === recommendedId
                    ? 'border-[color:var(--apple-blue)]/30 ring-1 ring-[color:var(--apple-blue)]/15'
                    : 'border-[color:var(--apple-line)]'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-base font-semibold text-[color:var(--apple-ink)]">{platform.platform}</p>
                    {platform.id === recommendedId ? (
                      <span className="rounded-full bg-[color:var(--apple-blue-soft)] px-2.5 py-0.5 text-[10px] font-semibold text-[color:var(--apple-blue)]">
                        {t('download.recommended', '推荐')}
                      </span>
                    ) : null}
                  </div>
                  <p className="text-xs text-[color:var(--apple-muted)] break-words">{platform.channel}</p>
                </div>

                <p className="mt-3 text-sm text-[color:var(--apple-muted)] leading-relaxed break-words text-pretty">{platform.description}</p>

                <div className="mt-4 text-xs text-[color:var(--apple-muted)] flex flex-wrap gap-x-3 gap-y-1">
                  <span>{t('download.version')} {platform.version}</span>
                  <span>{t('download.size')} {platform.size}</span>
                </div>

                <div className="mt-4">
                  <a
                    href={platform.ctaHref}
                    className="focus-ring inline-flex items-center justify-center gap-2 rounded-full bg-[color:var(--apple-btn-primary-bg)] px-4 py-2 text-xs font-medium text-[color:var(--apple-btn-primary-text)] leading-snug text-center whitespace-normal hover:bg-[color:var(--apple-btn-primary-bg-hover)] active:scale-95 transition-all shadow-[var(--apple-shadow-sm)]"
                  >
{platform.ctaLabel}
                  </a>
                </div>
              </article>
          ))}
        </div>

      </section>
    </div>
  )
}
