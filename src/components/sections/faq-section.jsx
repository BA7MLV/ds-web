import { useLocale } from '../locale-toggle'

export const FaqSection = ({ motionScale = 1, onOpenPolicy = () => {} }) => {
  const shouldAnimate = motionScale > 0
  const { t } = useLocale()
  const faqItems = [
    {
      id: 'open-source',
      question: t('faq.openSource.q'),
      answer: t('faq.openSource.a'),
      linkHref: 'https://github.com/helixnow/deep-student',
      linkLabel: t('faq.openSource.link'),
    },
    {
      id: 'privacy',
      question: t('faq.privacy.q'),
      answer: t('faq.privacy.a'),
      actionLabel: t('faq.privacy.action'),
      onAction: () => onOpenPolicy('privacy'),
    },
    {
      id: 'macos-quarantine',
      question: t('faq.macosQuarantine.q'),
      answer: t('faq.macosQuarantine.a'),
      code: t('faq.macosQuarantine.code', 'sudo xattr -r -d com.apple.quarantine <App Path>'),
      linkHref: '/docs/guide/A-Q',
      linkLabel: t('faq.macosQuarantine.link'),
    },
    {
      id: 'windows-preview',
      question: t('faq.windowsPreview.q'),
      answer: t('faq.windowsPreview.a'),
    },
  ]

  return (
    <section
      id="qa"
      className={`px-4 sm:px-6 max-w-4xl mx-auto pt-2 sm:pt-3 md:pt-4 pb-3 sm:pb-4 md:pb-6 ${
        shouldAnimate ? 'animate-fade-in' : ''
      }`}
      style={shouldAnimate ? { animationDelay: '0.12s' } : undefined}
    >
      <div className="text-center">
        <h2 className="mb-3 font-display text-[1.75rem] font-semibold leading-[1.1] tracking-[-0.02em] text-[color:var(--apple-ink)] sm:mb-4 sm:text-[2.5rem]">
          {t('faq.title')}
        </h2>
        <p className="mx-auto max-w-2xl text-[15px] leading-relaxed text-[color:var(--apple-muted)] sm:text-[17px]">
          {t('faq.subtitle')}
        </p>
      </div>

      <div className="mt-6 sm:mt-8 space-y-4">
        {faqItems.map((item) => (
          <details
            key={item.id}
            className="group rounded-[1.75rem] bg-[color:var(--apple-card)] border border-[color:var(--apple-line)] [box-shadow:var(--apple-shadow-sm)] overflow-hidden transition-[background-color,border-color,box-shadow] duration-500 ease-apple hover:[box-shadow:var(--apple-shadow-md)] open:bg-[color:var(--apple-card-strong)] open:border-[color:var(--apple-line-strong)] open:[box-shadow:var(--apple-shadow-lg)]"
          >
            <summary className="focus-ring flex min-h-[44px] items-center justify-between gap-4 p-[1.5rem] sm:p-[1.75rem] cursor-pointer select-none list-none [&::-webkit-details-marker]:hidden">
              <span className="min-w-0 text-[15px] sm:text-[17px] font-semibold text-[color:var(--apple-ink)] tracking-tight break-words">
                {item.question}
              </span>
              <span
                className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full bg-[color:var(--apple-btn-secondary-bg)] text-[color:var(--apple-muted)] transition-[transform,background-color,color] duration-300 ease-apple group-hover:bg-[color:var(--apple-btn-secondary-bg-hover)] group-open:rotate-180 group-open:text-[color:var(--apple-ink)]"
                aria-hidden="true"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </summary>

            <div
              className={`px-[1.5rem] sm:px-[1.75rem] pb-[1.5rem] sm:pb-[1.75rem] text-[15px] text-[color:var(--apple-muted)] leading-relaxed ${
                shouldAnimate ? 'animate-[fade-in_0.45s_var(--ease-apple)_both] motion-reduce:animate-none' : ''
              }`}
            >
              <p>{item.answer}</p>

              {item.code ? (
                <pre className="mt-4 rounded-[1rem] bg-[color:var(--apple-surface)] border border-[color:var(--apple-line)] p-4 overflow-x-auto text-[13px] shadow-inner">
                  <code className="font-mono text-[color:var(--apple-ink)]">{item.code}</code>
                </pre>
              ) : null}

              <div className="mt-4 flex flex-wrap items-center gap-3">
                {item.actionLabel ? (
                  <button
                    type="button"
                    onClick={item.onAction}
                    className="focus-ring inline-flex items-center justify-center rounded-full bg-[color:var(--apple-btn-secondary-bg)] px-5 py-2.5 text-[13px] font-semibold text-[color:var(--apple-ink)] hover:bg-[color:var(--apple-btn-secondary-bg-hover)] active:scale-95 transition-all motion-reduce:transition-none motion-reduce:active:scale-100"
                  >
                    {item.actionLabel}
                  </button>
                ) : null}
                {item.linkHref ? (
                  <a
                    href={item.linkHref}
                    className="focus-ring inline-flex items-center justify-center rounded-full bg-[color:var(--apple-btn-secondary-bg)] px-5 py-2.5 text-[13px] font-semibold text-[color:var(--apple-ink)] hover:bg-[color:var(--apple-btn-secondary-bg-hover)] active:scale-95 transition-all motion-reduce:transition-none motion-reduce:active:scale-100"
                    target={item.linkHref.startsWith('http') ? '_blank' : undefined}
                    rel={item.linkHref.startsWith('http') ? 'noopener noreferrer' : undefined}
                  >
                    {item.linkLabel}
                  </a>
                ) : null}
              </div>
            </div>
          </details>
        ))}
      </div>
    </section>
  )
}
