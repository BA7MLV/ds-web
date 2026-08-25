import { useEffect, useRef } from 'react'
import { useLocale } from '../locale-toggle'

export const getPolicyContent = (t) => ({
  about: {
    title: t('policy.about.title', 'About DeepStudent'),
    description: t('policy.about.description', ''),
    sections: [
      {
        title: t('policy.about.section1.title', ''),
        body: t('policy.about.section1.body', ''),
        points: [
          t('policy.about.section1.point1', ''),
          t('policy.about.section1.point2', ''),
          t('policy.about.section1.point3', ''),
        ],
      },
      {
        title: t('policy.about.section2.title', ''),
        body: t('policy.about.section2.body', ''),
        points: [
          t('policy.about.section2.point1', ''),
          t('policy.about.section2.point2', ''),
        ],
      },
      {
        title: t('policy.about.section3.title', ''),
        body: t('policy.about.section3.body', ''),
      },
    ],
    footer: t('policy.about.footer', ''),
  },
  privacy: {
    title: t('policy.privacy.title', 'Privacy Policy'),
    description: t('policy.privacy.description', ''),
    sections: [
      {
        title: t('policy.privacy.section1.title', ''),
        body: t('policy.privacy.section1.body', ''),
        points: [
          t('policy.privacy.section1.point1', ''),
          t('policy.privacy.section1.point2', ''),
          t('policy.privacy.section1.point3', ''),
        ].filter(Boolean),
      },
      {
        title: t('policy.privacy.section2.title', ''),
        body: t('policy.privacy.section2.body', ''),
        points: [
          t('policy.privacy.section2.point1', ''),
          t('policy.privacy.section2.point2', ''),
          t('policy.privacy.section2.point3', ''),
          t('policy.privacy.section2.point4', ''),
          t('policy.privacy.section2.point5', ''),
        ].filter(Boolean),
      },
      {
        title: t('policy.privacy.section3.title', ''),
        body: t('policy.privacy.section3.body', ''),
        points: [
          t('policy.privacy.section3.point1', ''),
          t('policy.privacy.section3.point2', ''),
          t('policy.privacy.section3.point3', ''),
        ].filter(Boolean),
      },
      {
        title: t('policy.privacy.section4.title', ''),
        body: t('policy.privacy.section4.body', ''),
        points: [
          t('policy.privacy.section4.point1', ''),
          t('policy.privacy.section4.point2', ''),
          t('policy.privacy.section4.point3', ''),
          t('policy.privacy.section4.point4', ''),
        ].filter(Boolean),
      },
      {
        title: t('policy.privacy.section5.title', ''),
        body: t('policy.privacy.section5.body', ''),
        points: [
          t('policy.privacy.section5.point1', ''),
          t('policy.privacy.section5.point2', ''),
          t('policy.privacy.section5.point3', ''),
        ].filter(Boolean),
      },
      {
        title: t('policy.privacy.section6.title', ''),
        body: t('policy.privacy.section6.body', ''),
        points: [
          t('policy.privacy.section6.point1', ''),
        ].filter(Boolean),
      },
      {
        title: t('policy.privacy.section7.title', ''),
        body: t('policy.privacy.section7.body', ''),
        points: [
          t('policy.privacy.section7.point1', ''),
        ].filter(Boolean),
      },
      {
        title: t('policy.privacy.section8.title', ''),
        body: t('policy.privacy.section8.body', ''),
        points: [
          t('policy.privacy.section8.point1', ''),
          t('policy.privacy.section8.point2', ''),
        ].filter(Boolean),
      },
    ],
    footer: t('policy.privacy.footer', ''),
  },
  terms: {
    title: t('policy.terms.title', 'Terms of Use'),
    description: t('policy.terms.description', ''),
    sections: [
      {
        title: t('policy.terms.section1.title', ''),
        body: t('policy.terms.section1.body', ''),
        points: [t('policy.terms.section1.point1', '')].filter(Boolean),
      },
      {
        title: t('policy.terms.section2.title', ''),
        body: t('policy.terms.section2.body', ''),
        points: [t('policy.terms.section2.point1', '')].filter(Boolean),
      },
      {
        title: t('policy.terms.section3.title', ''),
        body: t('policy.terms.section3.body', ''),
        points: [t('policy.terms.section3.point1', '')].filter(Boolean),
      },
    ],
    footer: t('policy.terms.footer', ''),
  },
})

export const PolicyModal = ({ type, onClose }) => {
  const { t } = useLocale()
  const data = type ? getPolicyContent(t)[type] : null
  const dialogRef = useRef(null)
  const closeButtonRef = useRef(null)
  const titleId = type ? `policy-${type}-title` : undefined
  const descriptionId = type ? `policy-${type}-description` : undefined

  useEffect(() => {
    if (!type) return
    const previousActiveElement = document.activeElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const getFocusableElements = () => {
      if (!dialogRef.current) return []
      return Array.from(
        dialogRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      )
    }

    const focusInitial = () => {
      if (closeButtonRef.current) {
        closeButtonRef.current.focus()
        return
      }
      const focusables = getFocusableElements()
      if (focusables.length) focusables[0].focus()
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab') return
      const focusables = getFocusableElements()
      if (!focusables.length) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    focusInitial()
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      if (previousActiveElement?.focus) previousActiveElement.focus()
    }
  }, [type, onClose])

  if (!type || !data) return null

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center pt-safe pb-safe pl-[max(1rem,var(--sal))] pr-[max(1rem,var(--sar))]"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      <div
        className="policy-modal-backdrop absolute inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />
      <div
        ref={dialogRef}
        className="policy-modal-panel relative flex w-full max-w-2xl max-h-[80vh] max-h-[80svh] flex-col overflow-hidden bg-[color:var(--apple-card)] backdrop-blur-xl border border-[color:var(--apple-line)] rounded-[2.618rem] shadow-[var(--apple-shadow-xl)]"
        onClick={(event) => event.stopPropagation()}
        tabIndex={-1}
      >
        <div className="flex-shrink-0 flex items-start justify-between gap-[1.618rem] border-b border-[color:var(--apple-line)] px-[1.618rem] sm:px-[2.618rem] pt-[1.618rem] sm:pt-[2.618rem] pb-[1.618rem]">
          <div>
            <h3
              id={titleId}
              className="text-2xl font-semibold text-[color:var(--apple-ink)] mb-3 font-display"
            >
              {data.title}
            </h3>
            <p id={descriptionId} className="text-sm text-[color:var(--apple-muted)] leading-relaxed">
              {data.description}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="focus-ring flex-shrink-0 w-[2.618rem] h-[2.618rem] rounded-full border border-[color:var(--apple-line)] text-[color:var(--apple-muted)] hover:text-[color:var(--apple-ink)] hover:border-[color:var(--apple-line-strong)] flex items-center justify-center transition-colors bg-[color:var(--apple-card-strong)]"
            aria-label={t('policy.close', 'Close dialog')}
            ref={closeButtonRef}
          >
            <span className="text-lg leading-none" aria-hidden="true">×</span>
          </button>
        </div>

        <div className="policy-modal-scroll flex-1 min-h-0 overflow-y-auto px-[1.618rem] sm:px-[2.618rem] py-[1.618rem]">
          <div className="space-y-6">
            {data.sections.map((section) => (
              <div
                key={section.title}
                className="border border-[color:var(--apple-line)] rounded-[1.618rem] p-[1.618rem] bg-[color:var(--apple-card-strong)]"
              >
                <h4 className="text-sm font-semibold text-[color:var(--apple-ink)] mb-2 font-display">
                  {section.title}
                </h4>
                <p className="text-sm text-[color:var(--apple-muted)] leading-relaxed">{section.body}</p>
                {section.points?.length ? (
                  <ul className="mt-3 space-y-1.5 text-sm text-[color:var(--apple-muted)] list-disc list-inside">
                    {section.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
          </div>

          {data.footer ? (
            <p className="mt-8 text-xs text-[color:var(--apple-muted)] leading-relaxed">{data.footer}</p>
          ) : null}
        </div>

        <div className="flex-shrink-0 border-t border-[color:var(--apple-line)] px-[1.618rem] sm:px-[2.618rem] pt-[1rem] pb-[1.618rem] sm:pb-[1.618rem]">
          <button
            type="button"
            onClick={onClose}
            className="focus-ring w-full py-[0.95rem] sm:py-[1.15rem] md:py-[1.35rem] rounded-[1.618rem] bg-[color:var(--apple-btn-primary-bg)] text-[color:var(--apple-btn-primary-text)] text-sm md:text-base font-semibold hover:bg-[color:var(--apple-btn-primary-bg-hover)] active:scale-[0.98] transition-all shadow-[var(--apple-shadow-md)]"
          >
            {t('policy.understood', 'I Understand')}
          </button>
        </div>
      </div>
    </div>
  )
}
