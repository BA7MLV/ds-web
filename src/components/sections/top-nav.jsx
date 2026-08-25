import { ThemeToggle } from '../theme-toggle'
import { LocaleToggle, useLocale } from '../locale-toggle'
import { MobileNavMenu } from '../mobile-nav-menu'

const logo = '/logo_mono_svg.svg'

export const TopNav = ({ onDownload = () => {} }) => {
  const { t } = useLocale()
  return (
    <nav
      className="top-nav-safe-area sticky top-0 z-[10010] border-b border-[color:var(--apple-nav-border)] bg-[color:var(--apple-nav-bg)] backdrop-blur-[20px] backdrop-saturate-[180%]"
      aria-label="主导航"
    >
      <div className="top-nav-content max-w-6xl mx-auto flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
        <a
          href="/"
          className="focus-ring flex items-center gap-2.5 font-semibold text-[color:var(--apple-ink)] transition-opacity hover:opacity-80"
        >
          <img src={logo} alt="" className="h-5 w-auto sm:h-6 dark:invert" loading="lazy" decoding="async" />
          <span className="text-[15px] tracking-tight">DeepStudent</span>
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
              GitHub
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
          <MobileNavMenu onDownload={onDownload} />
        </div>
      </div>
    </nav>
  )
}
