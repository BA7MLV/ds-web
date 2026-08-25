import { useEffect, useRef, useState } from 'react'
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
  const tabRefs = useRef([])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const profile = detectSystemProfile(window.navigator)
    const preferredTab = getPreferredPlatformTab(profile)
    const preferredCardId = getRecommendedCardId(profile)

    if (preferredTab) setActiveTab(preferredTab)
    setRecommendedId(preferredCardId)
  }, [])

  const activeIndex = Math.max(0, tabs.findIndex((tab) => tab.id === activeTab))

  const handleTabKeyDown = (event) => {
    const isNext = event.key === 'ArrowRight' || event.key === 'ArrowDown'
    const isPrev = event.key === 'ArrowLeft' || event.key === 'ArrowUp'
    if (!isNext && !isPrev) return
    event.preventDefault()
    const nextIndex = (activeIndex + (isNext ? 1 : -1) + tabs.length) % tabs.length
    setActiveTab(tabs[nextIndex].id)
    tabRefs.current[nextIndex]?.focus()
  }

  const filteredDownloads = platformDownloads
    .filter((item) => item.platform === activeTab)
    .sort((a, b) => Number(b.id === recommendedId) - Number(a.id === recommendedId))
  const hasRecommendedInTab = filteredDownloads.some((item) => item.id === recommendedId)
  const releaseVersion = normalizeReleaseVersion(sharedDownloads?.version)
  const updatedAtRaw = sharedDownloads?.generatedAt || sharedDownloads?.publishedAt
  const releaseUpdatedAt = formatReleaseDate(updatedAtRaw, locale)
  return (
    <div className="relative min-h-screen min-h-[100svh] bg-transparent pb-[calc(6.854rem+var(--sab))] sm:pb-[calc(11.09rem+var(--sab))]">
      <div className="sticky top-0 z-40 border-b border-[color:var(--apple-line)] bg-[color:var(--apple-nav-bg)] backdrop-blur-xl pt-safe">
        <div className="max-w-5xl mx-auto flex items-center justify-between py-1.5 pl-[max(1rem,var(--sal))] pr-[max(1rem,var(--sar))] sm:pl-[max(1.5rem,var(--sal))] sm:pr-[max(1.5rem,var(--sar))]">
          <button
            type="button"
            onClick={onBack}
            className="focus-ring touch-manipulation inline-flex min-h-[2.75rem] items-center gap-2 rounded-full -ml-2 px-2 text-sm font-medium text-[color:var(--apple-muted)] hover:text-[color:var(--apple-ink)] active:text-[color:var(--apple-ink)] transition-colors"
          >
← {t('download.backHome')}
          </button>
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <LocaleToggle compact className="w-[8.75rem]" />
          </div>
        </div>
      </div>

      <section className="max-w-4xl mx-auto pl-[max(1rem,var(--sal))] pr-[max(1rem,var(--sar))] sm:pl-[max(1.5rem,var(--sal))] sm:pr-[max(1.5rem,var(--sar))] pt-[3.236rem] sm:pt-[4.236rem] md:pt-[5.854rem] text-center">
        <h1 className="text-[2.2rem] sm:text-[3.2rem] font-semibold text-[color:var(--apple-ink)] tracking-[-0.02em] font-display">
          {t('download.title', 'DeepStudent {version}', { version: releaseVersion })}
        </h1>
        <p className="mt-3 text-sm text-[color:var(--apple-muted)] max-w-md mx-auto">
          {t('download.subtitle', '更新时间：{updatedAt}', { updatedAt: releaseUpdatedAt })}
        </p>
      </section>

      <section className="max-w-5xl mx-auto pl-[max(1rem,var(--sal))] pr-[max(1rem,var(--sar))] sm:pl-[max(1.5rem,var(--sal))] sm:pr-[max(1.5rem,var(--sar))] pt-[3.236rem] sm:pt-[4.236rem]">
        <h2 className="text-[1.3rem] sm:text-[1.9rem] font-semibold text-[color:var(--apple-ink)] tracking-[-0.02em] font-display">
          {t('download.selectPlatform')}
        </h2>

        <div
          role="tablist"
          aria-label={t('download.selectPlatform')}
          className="relative mt-5 grid w-full max-w-[22.5rem] grid-cols-3 rounded-full border border-[color:var(--apple-line)] bg-[color:var(--apple-btn-secondary-bg)] p-1"
        >
          <span
            aria-hidden="true"
            className="absolute top-1 bottom-1 left-1 w-[calc((100%-0.5rem)/3)] rounded-full bg-[color:var(--apple-surface-elevated)] dark:bg-[#48484a] shadow-[0_1px_3px_rgba(0,0,0,0.12),0_3px_8px_rgba(0,0,0,0.08)] ring-1 ring-black/[0.04] dark:ring-white/[0.08] transition-transform duration-300 ease-apple motion-reduce:transition-none"
            style={{ transform: `translateX(${activeIndex * 100}%)` }}
          />
          {tabs.map((tab, index) => {
            const active = tab.id === activeTab
            return (
              <button
                key={tab.id}
                ref={(node) => { tabRefs.current[index] = node }}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(tab.id)}
                onKeyDown={handleTabKeyDown}
                className={`focus-ring touch-manipulation relative z-[1] flex h-11 select-none items-center justify-center rounded-full px-2 text-[13px] transition-colors duration-200 ${
                  active
                    ? 'font-semibold text-[color:var(--apple-ink)]'
                    : 'font-medium text-[color:var(--apple-muted)] hover:text-[color:var(--apple-ink)]'
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        <div className="mt-6 grid gap-4 sm:gap-5 md:grid-cols-2">
          {filteredDownloads.map((platform) => {
            const isRecommended = platform.id === recommendedId
            const isPrimaryCta = isRecommended || !hasRecommendedInTab
            return (
              <article
                key={platform.id}
                className={`relative flex flex-col overflow-hidden rounded-[1.5rem] border p-[1.5rem] sm:p-[1.75rem] transition-all duration-300 ease-apple hover-lift ${
                  isRecommended
                    ? 'bg-[color:var(--apple-card-strong)] border-[color:var(--apple-blue)]/35 ring-1 ring-[color:var(--apple-blue)]/20 shadow-[var(--apple-shadow-md)]'
                    : 'bg-[color:var(--apple-card)] border-[color:var(--apple-line)] shadow-[var(--apple-shadow-sm)]'
                }`}
              >
                {isRecommended ? (
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[color:var(--apple-blue-soft)] to-transparent opacity-60"
                  />
                ) : null}

                <div className="relative">
                  <div className="flex items-center gap-2">
                    <p className="text-base sm:text-lg font-semibold text-[color:var(--apple-ink)]">{platform.platform}</p>
                    {isRecommended ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[color:var(--apple-blue-soft)] px-2.5 py-1 text-[11px] font-semibold leading-none text-[color:var(--apple-blue)]">
                        <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" aria-hidden="true">
                          <path d="M2.5 6.5 5 9l4.5-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {t('download.recommended', '推荐')}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-0.5 text-xs text-[color:var(--apple-muted)] break-words">{platform.channel}</p>
                </div>

                <p className="relative mt-3 text-sm text-[color:var(--apple-muted)] leading-relaxed break-words text-pretty">{platform.description}</p>

                <div className="relative mt-4 text-xs text-[color:var(--apple-muted)] tabular-nums flex flex-wrap gap-x-3 gap-y-1">
                  <span>{t('download.version')} {platform.version}</span>
                  <span>{t('download.size')} {platform.size}</span>
                </div>

                <div className="relative mt-auto pt-5">
                  <a
                    href={platform.ctaHref}
                    className={`focus-ring touch-manipulation inline-flex w-full sm:w-auto min-h-[2.75rem] items-center justify-center gap-2 rounded-full px-6 text-sm font-medium leading-snug text-center whitespace-normal transition-all active:scale-[0.97] ${
                      isPrimaryCta
                        ? 'bg-[color:var(--apple-btn-primary-bg)] text-[color:var(--apple-btn-primary-text)] hover:bg-[color:var(--apple-btn-primary-bg-hover)] shadow-[var(--apple-shadow-sm)]'
                        : 'bg-[color:var(--apple-btn-secondary-bg)] text-[color:var(--apple-btn-secondary-text)] hover:bg-[color:var(--apple-btn-secondary-bg-hover)]'
                    }`}
                  >
{platform.ctaLabel}
                  </a>
                </div>
              </article>
            )
          })}
        </div>

      </section>
    </div>
  )
}
