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
  // 保持 onClose 最新引用，避免父组件每次渲染重建回调时
  // 重跑 effect（会重置初始焦点与滚动锁）
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose
  const titleId = type ? `policy-${type}-title` : undefined
  const descriptionId = type ? `policy-${type}-description` : undefined

  useEffect(() => {
    if (!type) return
    const previousActiveElement = document.activeElement
    const previousOverflow = document.body.style.overflow
    const previousPaddingRight = document.body.style.paddingRight
    // 锁滚动时补偿滚动条宽度，避免桌面端内容横向跳动
    const scrollbarGap = window.innerWidth - document.documentElement.clientWidth
    document.body.style.overflow = 'hidden'
    if (scrollbarGap > 0) document.body.style.paddingRight = `${scrollbarGap}px`

    const getFocusableElements = () => {
      if (!dialogRef.current) return []
      return Array.from(
        dialogRef.current.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter(
        (el) =>
          el.getAttribute('aria-hidden') !== 'true' &&
          (el.offsetParent !== null || el === document.activeElement)
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
        onCloseRef.current()
        return
      }
      if (event.key !== 'Tab') return
      const focusables = getFocusableElements()
      if (!focusables.length) {
        event.preventDefault()
        dialogRef.current?.focus()
        return
      }
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      const active = document.activeElement
      // 焦点已逃出对话框（如落在 body）时，Tab 强制拉回陷阱内
      if (!dialogRef.current?.contains(active)) {
        event.preventDefault()
        ;(event.shiftKey ? last : first).focus()
        return
      }
      if (event.shiftKey && active === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    }

    focusInitial()
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      document.body.style.paddingRight = previousPaddingRight
      // 打开者可能已卸载（如路由变化），仅在仍挂载时归还焦点
      if (
        previousActiveElement instanceof HTMLElement &&
        document.contains(previousActiveElement)
      ) {
        previousActiveElement.focus()
      }
    }
  }, [type])

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
        className="policy-modal-panel relative flex w-full max-w-2xl max-h-[80vh] max-h-[80svh] flex-col overflow-hidden bg-[color:var(--apple-card)] backdrop-blur-xl border border-[color:var(--apple-line)] rounded-[2rem] [box-shadow:var(--apple-shadow-xl)]"
        onClick={(event) => event.stopPropagation()}
        tabIndex={-1}
      >
        <div className="flex-shrink-0 flex items-start justify-between gap-4 border-b border-[color:var(--apple-nav-border)] bg-[color:var(--apple-nav-bg)] px-6 sm:px-8 py-5 sm:py-6">
          <div>
            <h3
              id={titleId}
              // 与 text-section-title 同节奏（600/-0.02em/1.1），字号取该梯度下限：
              // 固定宽度弹窗里 clamp 到 3rem 会失衡，故用 1.5rem → 1.75rem 等价档
              className="mb-3 font-display text-[1.5rem] font-semibold leading-[1.1] tracking-[-0.02em] text-[color:var(--apple-ink)] sm:text-[1.75rem]"
            >
              {data.title}
            </h3>
            <p id={descriptionId} className="text-sm text-[color:var(--apple-ink-secondary)] leading-relaxed">
              {data.description}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="focus-ring touch-manipulation flex-shrink-0 w-11 h-11 rounded-full border border-[color:var(--apple-line)] text-[color:var(--apple-muted)] hover:text-[color:var(--apple-ink)] hover:border-[color:var(--apple-line-strong)] flex items-center justify-center transition-colors bg-[color:var(--apple-card-strong)]"
            aria-label={t('policy.close', 'Close dialog')}
            ref={closeButtonRef}
          >
            <span className="text-lg leading-none" aria-hidden="true">×</span>
          </button>
        </div>

        <div
          className="policy-modal-scroll flex-1 min-h-0 overflow-y-auto px-6 sm:px-8 py-6"
          // 可聚焦滚动区：焦点陷阱只覆盖按钮，长文本需要键盘（方向键）滚动入口
          tabIndex={0}
          role="region"
          aria-labelledby={titleId}
        >
          <div className="space-y-6">
            {data.sections.map((section) => (
              <div
                key={section.title}
                className="border border-[color:var(--apple-line)] rounded-[1.5rem] p-[1.5rem] sm:p-[1.75rem] bg-[color:var(--apple-card-strong)]"
              >
                {/* 与 FAQ 问题标题同尺度（15px → 17px / tracking-tight）：两处卡片
                    同样式（内边距、表面色一致），原 text-sm 使标题弱于正文节奏；
                    对齐后 h3/h4 比值在两档断点均 ≈ φ（24/15、28/17） */}
                <h4 className="text-[15px] sm:text-[17px] font-semibold tracking-tight text-[color:var(--apple-ink)] mb-2 font-display">
                  {section.title}
                </h4>
                <p className="text-sm text-[color:var(--apple-ink-secondary)] leading-relaxed">{section.body}</p>
                {section.points?.length ? (
                  <ul className="mt-3 space-y-1.5 text-sm text-[color:var(--apple-ink-secondary)] list-disc list-inside">
                    {section.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            ))}
          </div>

          {data.footer ? (
            <p className="mt-8 text-xs text-[color:var(--apple-ink-secondary)] leading-relaxed">{data.footer}</p>
          ) : null}
        </div>

        <div className="flex-shrink-0 border-t border-[color:var(--apple-nav-border)] bg-[color:var(--apple-nav-bg)] px-6 sm:px-8 pt-4 pb-5 sm:pb-6">
          <button
            type="button"
            onClick={onClose}
            className="focus-ring touch-manipulation inline-flex w-full min-h-[2.75rem] items-center justify-center gap-2 rounded-full px-6 text-sm font-medium leading-snug bg-[color:var(--apple-btn-primary-bg)] text-[color:var(--apple-btn-primary-text)] hover:bg-[color:var(--apple-btn-primary-bg-hover)] active:scale-[0.97] transition-all motion-reduce:transition-none motion-reduce:active:scale-100 [box-shadow:var(--apple-shadow-sm)]"
          >
            {t('policy.understood', 'I Understand')}
          </button>
        </div>
      </div>
    </div>
  )
}
