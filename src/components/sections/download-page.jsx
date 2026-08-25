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
  const [detectionDone, setDetectionDone] = useState(false)
  const tabRefs = useRef([])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const profile = detectSystemProfile(window.navigator)
    const preferredTab = getPreferredPlatformTab(profile)
    const preferredCardId = getRecommendedCardId(profile)

    if (preferredTab) setActiveTab(preferredTab)
    setRecommendedId(preferredCardId)
    setDetectionDone(true)
  }, [])

  const activeIndex = Math.max(0, tabs.findIndex((tab) => tab.id === activeTab))

  // ARIA Tabs 键盘规范：方向键循环移动（选中跟随焦点），Home/End 跳到首尾
  const handleTabKeyDown = (event) => {
    let nextIndex = null
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      nextIndex = (activeIndex + 1) % tabs.length
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      nextIndex = (activeIndex - 1 + tabs.length) % tabs.length
    } else if (event.key === 'Home') {
      nextIndex = 0
    } else if (event.key === 'End') {
      nextIndex = tabs.length - 1
    }
    if (nextIndex === null) return
    event.preventDefault()
    setActiveTab(tabs[nextIndex].id)
    tabRefs.current[nextIndex]?.focus()
  }

  // 数据缺失时构建层会退化为一张“GitHub Releases”卡片；它不属于任何平台
  // Tab，因此需要跳过 Tab 过滤直接展示，否则所有 Tab 都会渲染成空列表
  const isFallbackOnly = platformDownloads.every((item) => item.id === 'allReleases')
  const filteredDownloads = isFallbackOnly
    ? platformDownloads
    : platformDownloads
        .filter((item) => item.platform === activeTab)
        .sort((a, b) => Number(b.id === recommendedId) - Number(a.id === recommendedId))
  const hasRecommendedInTab = filteredDownloads.some((item) => item.id === recommendedId)
  const showDetectFallbackHint = detectionDone && !recommendedId && !isFallbackOnly
  const releaseUrl = sharedDownloads?.releaseUrl || 'https://github.com/helixnow/deep-student/releases/latest'
  const releaseVersion = normalizeReleaseVersion(sharedDownloads?.version)
  const updatedAtRaw = sharedDownloads?.generatedAt || sharedDownloads?.publishedAt
  const releaseUpdatedAt = formatReleaseDate(updatedAtRaw, locale)
  return (
    <div className="relative min-h-screen min-h-[100svh] bg-transparent pb-[calc(6.854rem+var(--sab))] sm:pb-[calc(11.09rem+var(--sab))]">
      <div className="sticky top-0 z-40 border-b border-[color:var(--apple-nav-border)] bg-[color:var(--apple-nav-bg)] backdrop-blur-[20px] backdrop-saturate-[180%] pt-safe">
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
          {isFallbackOnly ? t('download.allReleases', '全部版本') : t('download.selectPlatform')}
        </h2>

        {isFallbackOnly ? null : (
          <>
            {/* 深色轨道取 iOS tertiaryFill（rgba(118,118,128,0.24)，实色≈surface-elevated），
                thumb 复用 --apple-seg-thumb（与 LocaleToggle 一致，对轨道保持 ~3:1 对比，
                WCAG 1.4.11）；浅色阴影在深色下几乎不可见，故单独加深 */}
            <div
              role="tablist"
              aria-label={t('download.selectPlatform')}
              className="relative mt-5 grid w-full max-w-[22.5rem] grid-cols-3 rounded-full border border-[color:var(--apple-line)] bg-[color:var(--apple-btn-secondary-bg)] dark:bg-[rgba(118,118,128,0.24)] p-1"
            >
              <span
                aria-hidden="true"
                className="absolute top-1 bottom-1 left-1 w-[calc((100%-0.5rem)/3)] rounded-full bg-[color:var(--apple-surface-elevated)] dark:bg-[color:var(--apple-seg-thumb)] shadow-[0_1px_3px_rgba(0,0,0,0.12),0_3px_8px_rgba(0,0,0,0.08)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.5),0_3px_8px_rgba(0,0,0,0.35)] ring-1 ring-black/[0.04] dark:ring-white/[0.12] transition-transform duration-300 ease-apple motion-reduce:transition-none"
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
                    id={`platform-tab-${tab.id}`}
                    aria-selected={active}
                    aria-controls="platform-tabpanel"
                    /* roving tabindex：Tab 键只停留在选中项，组内移动交给方向键 */
                    tabIndex={active ? 0 : -1}
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

            {showDetectFallbackHint ? (
              <p className="mt-3 text-[13px] leading-relaxed text-[color:var(--apple-muted)]">
                {t('download.detectFallback', '未能识别当前设备，请手动选择适合的安装包。')}
              </p>
            ) : null}
          </>
        )}

        {filteredDownloads.length === 0 ? (
          /* 深色下 --apple-shadow-sm（纯黑投影）在黑底上不可见，空态卡片只剩 8% 白
             的 --apple-line 描边，边界过弱；升级为 --apple-line-strong（12%）。图标
             底盘同理：8% 白的 secondary-bg 几乎隐形，深色改用 iOS tertiaryFill
             （rgba(118,118,128,0.24)，与上方分段控件轨道一致）并加 --apple-line 内描边 */
          <div
            role="tabpanel"
            id="platform-tabpanel"
            aria-labelledby={`platform-tab-${activeTab}`}
            className="mt-6 flex flex-col items-center rounded-[1.5rem] border border-[color:var(--apple-line)] dark:border-[color:var(--apple-line-strong)] bg-[color:var(--apple-card)] px-6 py-12 sm:py-16 text-center [box-shadow:var(--apple-shadow-sm)]"
          >
            <div
              aria-hidden="true"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-[color:var(--apple-btn-secondary-bg)] dark:bg-[rgba(118,118,128,0.24)] ring-1 ring-inset ring-[color:var(--apple-line)] text-[color:var(--apple-muted)]"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none">
                <path
                  d="M12 4.5V14m0 0 3.75-3.75M12 14l-3.75-3.75M5.5 19h13"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <p className="mt-4 text-base sm:text-lg font-semibold text-[color:var(--apple-ink)]">
              {t('download.emptyTab.title', '暂无 {platform} 安装包', { platform: activeTab })}
            </p>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-[color:var(--apple-muted)] text-pretty">
              {t('download.emptyTab.description', '当前版本尚未提供该平台的安装包，可前往 GitHub Releases 查看全部版本。')}
            </p>
            {/* 共享 CTA 规格不变（胶囊、14px/500、44px 触控、active 0.97、200ms ease-apple）；
                深色下 8% 白填充对卡片仅 ~1.9:1，按 .btn-apple-secondary 的描边惯例补
                --apple-line-strong 内描边，使按钮边界达到非文本对比要求（WCAG 1.4.11） */}
            <a
              href={releaseUrl}
              className="focus-ring touch-manipulation mt-6 inline-flex min-h-[2.75rem] select-none items-center justify-center gap-2 rounded-full bg-[color:var(--apple-btn-secondary-bg)] px-6 text-sm font-medium leading-snug text-center text-[color:var(--apple-btn-secondary-text)] transition-[background-color,transform] duration-200 ease-apple hover:bg-[color:var(--apple-btn-secondary-bg-hover)] active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100 dark:ring-1 dark:ring-inset dark:ring-[color:var(--apple-line-strong)]"
            >
              {t('download.openReleases', '打开 GitHub Releases')}
            </a>
          </div>
        ) : (
          <div
            /* fallback 模式下没有 tablist，不能挂 tabpanel 语义 */
            role={isFallbackOnly ? undefined : 'tabpanel'}
            id={isFallbackOnly ? undefined : 'platform-tabpanel'}
            aria-labelledby={isFallbackOnly ? undefined : `platform-tab-${activeTab}`}
            className={`mt-6 grid gap-4 sm:gap-5 ${isFallbackOnly ? 'max-w-xl' : 'md:grid-cols-2'}`}
          >
            {filteredDownloads.map((platform) => {
              const isRecommended = platform.id === recommendedId
              const isPrimaryCta = isRecommended || !hasRecommendedInTab
              return (
                <article
                  key={platform.id}
                  className={`relative flex flex-col overflow-hidden rounded-[1.5rem] border p-[1.5rem] sm:p-[1.75rem] transition-all duration-300 ease-apple hover-lift ${
                    isRecommended
                      ? 'bg-[color:var(--apple-card-strong)] border-[color:var(--apple-blue)]/35 ring-1 ring-[color:var(--apple-blue)]/20 [box-shadow:var(--tw-ring-offset-shadow,0_0_#0000),var(--tw-ring-shadow,0_0_#0000),var(--apple-shadow-md)]'
                      : 'bg-[color:var(--apple-card)] border-[color:var(--apple-line)] [box-shadow:var(--apple-shadow-sm)]'
                  } ${
                    /* fallback（allReleases）卡片是页面唯一内容：深色下 shadow-sm 在
                       黑底不可见，仅剩 8% 白描边，同空态卡片一样升级为 line-strong */
                    isFallbackOnly ? 'dark:border-[color:var(--apple-line-strong)]' : ''
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
                    {/* 共享 CTA 规格（同 .btn-apple-* / ui/button.jsx）：胶囊、14px/500、44px 触控、
                        active 0.97、200ms ease-apple；仅 whitespace-normal 例外以容纳换行的 i18n 文案 */}
                    <a
                      href={platform.ctaHref}
                      className={`focus-ring touch-manipulation inline-flex w-full sm:w-auto min-h-[2.75rem] select-none items-center justify-center gap-2 rounded-full px-6 text-sm font-medium leading-snug text-center whitespace-normal transition-[background-color,transform] duration-200 ease-apple active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100 ${
                        isPrimaryCta
                          ? 'bg-[color:var(--apple-btn-primary-bg)] text-[color:var(--apple-btn-primary-text)] hover:bg-[color:var(--apple-btn-primary-bg-hover)] [box-shadow:var(--apple-shadow-sm)]'
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
        )}

      </section>
    </div>
  )
}
