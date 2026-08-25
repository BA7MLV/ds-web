import { ThemeToggle } from '../theme-toggle'
import { LocaleToggle, useLocale } from '../locale-toggle'
import { MobileNavMenu } from '../mobile-nav-menu'
import { useScrollY } from '../../hooks/useScroll'

const logo = '/logo_mono_svg.svg'

// Nav chrome (hairline border + soft shadow) appears once the page is
// scrolled past this offset, so the bar blends into the hero at rest.
const SCROLL_CHROME_THRESHOLD = 8

// Single source of truth for the brand lockup: rendered in the nav bar and
// passed to MobileNavMenu so the overlay reuses identical tracking/size rhythm.
// The wordmark steps 15px -> 17px in lockstep with the logo's h-5 -> h-6.
const brandLockup = (
  <span className="inline-flex items-center gap-2.5 font-semibold text-[color:var(--apple-ink)]">
    <img src={logo} alt="" className="h-5 w-auto sm:h-6 dark:invert" loading="lazy" decoding="async" />
    <span className="text-[15px] tracking-tight sm:text-[17px]">DeepStudent</span>
  </span>
)

export const TopNav = ({ onDownload = () => {} }) => {
  const { t } = useLocale()
  const scrollY = useScrollY()
  const isScrolled = scrollY > SCROLL_CHROME_THRESHOLD
  return (
    <header
      className={`top-nav-safe-area sticky top-0 z-[10010] border-b bg-[color:var(--apple-nav-bg)] backdrop-blur-[20px] backdrop-saturate-[180%] transition-[border-color,box-shadow] duration-300 ease-apple motion-reduce:transition-none ${
        isScrolled
          ? 'border-[color:var(--apple-nav-border)] shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_20px_-14px_rgba(0,0,0,0.12)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.35),0_8px_20px_-14px_rgba(0,0,0,0.6)]'
          : 'border-transparent shadow-none'
      }`}
    >
      <nav
        aria-label={t('nav.ariaLabel', '主导航')}
        className="top-nav-content max-w-6xl mx-auto flex h-14 items-center justify-between pl-[max(1rem,var(--sal))] pr-[max(1rem,var(--sar))] sm:pl-[max(1.5rem,var(--sal))] sm:pr-[max(1.5rem,var(--sar))] lg:pl-[max(2rem,var(--sal))] lg:pr-[max(2rem,var(--sar))]"
      >
        <a href="/" className="focus-ring inline-flex items-center transition-opacity hover:opacity-80">
          {brandLockup}
        </a>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-4 text-[12px] font-normal text-[color:var(--apple-muted)] lg:flex">
            <a href="#features" className="focus-ring transition-colors hover:text-[color:var(--apple-ink)]">
              {t('nav.features')}
            </a>
            <a href="#qa" className="focus-ring transition-colors hover:text-[color:var(--apple-ink)]">
              {t('nav.qa')}
            </a>
            <a href="/docs/" className="focus-ring transition-colors hover:text-[color:var(--apple-ink)]">
              {t('nav.docs')}
            </a>
            <a
              href="https://github.com/helixnow/deep-student"
              className="focus-ring transition-colors hover:text-[color:var(--apple-ink)]"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('nav.github', 'GitHub')}
            </a>
            <a
              href="#download"
              onClick={(e) => {
                e.preventDefault()
                onDownload()
              }}
              className="focus-ring text-[color:var(--apple-blue)] hover:text-[color:var(--apple-blue-hover)] transition-colors"
            >
              {t('nav.download')}
            </a>
          </div>
          <div className="hidden lg:flex items-center gap-1.5 pl-2 border-l border-[color:var(--apple-line)]">
            <ThemeToggle />
            <LocaleToggle compact className="w-[8.75rem]" />
          </div>
          <MobileNavMenu onDownload={onDownload} brand={brandLockup} />
        </div>
      </nav>
    </header>
  )
}
