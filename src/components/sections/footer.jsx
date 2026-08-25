import { useTheme } from '../theme-toggle'
import { LocaleToggle, useLocale } from '../locale-toggle'

const logoFooter = '/logo-r.svg'
const logoFooterDark = '/logo-r-dark.svg'
const buildHash = import.meta.env.VITE_BUILD_HASH || 'dev'

// Shared footer nav link treatment: vertical tap padding is offset with
// negative margin so the visual rhythm stays intact while the touch
// target grows, and the rounded corners keep the focus ring snug.
const footerNavLinkClass =
  'focus-ring rounded-md py-1 -my-1 transition-colors duration-200 hover:text-[color:var(--apple-ink)] motion-reduce:transition-none'

// Apple-style social pill: gentle lift + sharper edge + soft shadow on
// hover, settling back on press. Transforms are disabled entirely under
// reduced motion while color changes still apply instantly.
const socialLinkClass =
  'focus-ring group inline-flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--apple-line)] bg-[color:var(--apple-btn-secondary-bg)] text-[color:var(--apple-ink-secondary)] backdrop-blur-xl transition-[background-color,border-color,color,box-shadow,transform] duration-300 ease-apple hover:-translate-y-0.5 hover:border-[color:var(--apple-line-strong)] hover:bg-[color:var(--apple-btn-secondary-bg-hover)] hover:text-[color:var(--apple-ink)] hover:[box-shadow:var(--apple-shadow-sm)] active:translate-y-0 active:scale-95 motion-reduce:transition-none motion-reduce:transform-none'

const socialIconClass =
  'transition-transform duration-300 ease-apple group-hover:scale-110 motion-reduce:transition-none motion-reduce:transform-none'

export const Footer = ({ onOpenPolicy = () => {} }) => {
  const { isDark } = useTheme()
  const { t } = useLocale()
  return (
    <footer className="border-t border-[color:var(--apple-line)] mt-4 sm:mt-6 bg-[color:var(--apple-card)] backdrop-blur-2xl px-safe">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-12 pb-[calc(2.5rem+env(safe-area-inset-bottom))] sm:pb-[calc(3rem+env(safe-area-inset-bottom))]">
        <div className="flex flex-col gap-8 sm:gap-10">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_auto] md:gap-12 items-start">
            <div className="flex justify-center md:justify-start">
              <div className="flex items-center gap-3 font-bold text-[color:var(--apple-ink)] text-lg tracking-tight">
                <img src={isDark ? logoFooterDark : logoFooter} alt="" className="h-9 w-auto" loading="lazy" decoding="async" />
                <span className="sr-only">DeepStudent</span>
              </div>
            </div>
            <nav
              className="flex flex-wrap justify-center md:justify-end gap-x-8 gap-y-4 text-[13px] text-[color:var(--apple-muted)] font-medium"
              aria-label={t('footer.navLabel', 'Footer links')}
            >
              <button type="button" onClick={() => onOpenPolicy('privacy')} className={footerNavLinkClass}>
                {t('footer.privacy')}
              </button>
              <button type="button" onClick={() => onOpenPolicy('about')} className={footerNavLinkClass}>
                {t('footer.about')}
              </button>
              <button type="button" onClick={() => onOpenPolicy('terms')} className={footerNavLinkClass}>
                {t('footer.terms')}
              </button>
              <a
                href="https://github.com/helixnow/deep-student"
                className={footerNavLinkClass}
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
            </nav>
          </div>

          <div className="h-px bg-[color:var(--apple-line)]" aria-hidden="true" />

          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="flex items-center gap-3">
              <a
                href="https://www.xiaohongshu.com/user/profile/648898bb0000000012037f8f"
                target="_blank"
                rel="noopener noreferrer"
                className={socialLinkClass}
                aria-label={t('footer.xiaohongshu', 'Xiaohongshu')}
                title={t('footer.xiaohongshu', 'Xiaohongshu')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 16 16" aria-hidden="true" className={socialIconClass}>
                  <path
                    fill="currentColor"
                    d="M6.34 14.458c.106-.231.195-.431.29-.628q.329-.607.59-1.247a.74.74 0 0 1 .88-.55c.557.039 1.116.01 1.698.01V4.794c-.391 0-.777-.014-1.16 0-.267.014-.36-.073-.353-.36.019-.685 0-1.374 0-2.091h5.428v1.664c0 .783 0 .783-.76.783h-.762v7.245h1.647c.664 0 .664 0 .664.697v1.46c0 .202-.05.305-.268.305q-3.866-.007-7.73-.006a1 1 0 0 1-.164-.034"
                  />
                  <path
                    fill="currentColor"
                    d="M7.365 9.21c-.339.7-.637 1.324-.95 1.938a.3.3 0 0 1-.228.114c-.755 0-1.514.03-2.266-.026-.753-.056-1.054-.54-.754-1.28.342-.853.753-1.678 1.134-2.514.024-.053.042-.106.088-.223-.305 0-.572.007-.84 0a3 3 0 0 1-.646-.06.76.76 0 0 1-.652-.85.8.8 0 0 1 .074-.256c.457-1.098.97-2.175 1.464-3.256q.24-.532.51-1.05c.047-.09.155-.203.238-.207.706-.017 1.414-.009 2.184-.009-.067.172-.104.29-.156.399q-.648 1.356-1.301 2.709c-.088.183-.194.373.134.512.088-.47.44-.384.75-.384h1.784c-.075.178-.123.302-.178.42-.55 1.152-1.11 2.294-1.653 3.444-.223.469-.148.583.37.588.268-.008.538-.01.894-.01m-.97 2.834c-.419.839-.792 1.593-1.175 2.343a.26.26 0 0 1-.194.11 228 228 0 0 1-3.084-.058 2 2 0 0 1-.413-.11l.575-1.162c.188-.384.37-.767.572-1.133a.35.35 0 0 1 .247-.162c.942.047 1.884.112 2.828.17.19.01.369.002.644.002"
                  />
                </svg>
              </a>
              <a
                href="https://qm.qq.com/q/UkEacMzuIW"
                target="_blank"
                rel="noopener noreferrer"
                className={socialLinkClass}
                aria-label={t('footer.qq', 'QQ group')}
                title={t('footer.qq', 'QQ group')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" className={socialIconClass}>
                  <path
                    fill="currentColor"
                    d="M21.395 15.035a40 40 0 0 0-.803-2.264l-1.079-2.695c.001-.032.014-.562.014-.836C19.526 4.632 17.351 0 12 0S4.474 4.632 4.474 9.241c0 .274.013.804.014.836l-1.08 2.695a39 39 0 0 0-.802 2.264c-1.021 3.283-.69 4.643-.438 4.673.54.065 2.103-2.472 2.103-2.472 0 1.469.756 3.387 2.394 4.771-.612.188-1.363.479-1.845.835-.434.32-.379.646-.301.778.343.578 5.883.369 7.482.189 1.6.18 7.14.389 7.483-.189.078-.132.132-.458-.301-.778-.483-.356-1.233-.646-1.846-.836 1.637-1.384 2.393-3.302 2.393-4.771 0 0 1.563 2.537 2.103 2.472.251-.03.581-1.39-.438-4.673"
                  />
                </svg>
              </a>
            </div>
            <div className="flex flex-col items-center gap-3 sm:items-end">
              <LocaleToggle compact className="w-[9.5rem] sm:w-[10.5rem]" />
              <div className="flex flex-col items-center gap-1.5 text-center text-[color:var(--apple-muted)] sm:items-end sm:text-right">
                <span className="font-mono text-[10px] leading-none tracking-[0.08em] opacity-60">
                  Build {buildHash}
                </span>
                <span className="text-[11px] leading-tight opacity-80">
                  {t('footer.copyright', '© {year} DeepStudent Team.', { year: new Date().getFullYear() })}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
