import { useEffect, useRef, useState } from 'react'

import { useLocale } from '../locale-toggle'

// Space-free filenames (renamed from the vendor's original "siliconflow_Chinese
// and English LOGO*.svg") so the URLs need no percent-encoding.
const siliconflowLogo = '/siliconflow-logo.svg'
const siliconflowLogoDark = '/siliconflow-logo-dark.svg'

export const freeModels = [
  { id: 'qwen3-8b', label: 'Qwen3-8B' },
  { id: 'glm-4.1v', label: 'GLM-4.1V' },
  { id: 'bge-m3', label: 'BGE-M3' },
]

export const FreeModelLogo = ({ id, className = 'h-4 w-4' }) => {
  switch (id) {
    case 'qwen3-8b':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M15.75 15.75L20 20" />
        </svg>
      )
    case 'glm-4.1v':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z" />
          <circle cx="12" cy="12" r="2.5" />
        </svg>
      )
    case 'bge-m3':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <circle cx="7" cy="12" r="2" />
          <circle cx="17" cy="7" r="2" />
          <circle cx="17" cy="17" r="2" />
          <path d="M8.7 11.2L15.3 8.2" />
          <path d="M8.7 12.8L15.3 15.8" />
        </svg>
      )
    default:
      return null
  }
}

// Reveals once when the card scrolls into view, so the pill entrance
// animation plays where the user can actually see it.
const useRevealOnce = () => {
  const ref = useRef(null)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    // With reduced motion there is no entrance animation to stage, so reveal
    // immediately instead of waiting on (and paying for) an observer.
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion || typeof IntersectionObserver === 'undefined') {
      setRevealed(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setRevealed(true)
          observer.disconnect()
        }
      },
      { threshold: 0.35 }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return { ref, revealed }
}

// Pills are informational (no action to trigger), so they stay out of the tab
// order — fake tab stops would only add noise for keyboard users. They render
// as a semantic list instead, and min-h-[44px] keeps each chip at the HIG
// 44px touch/read target on small screens.
const ModelPill = ({ model, revealed, delayMs }) => (
  <li
    className={`group inline-flex min-h-[44px] select-none items-center gap-2 rounded-full border border-[color:var(--apple-line)] bg-[color:var(--apple-card-strong)] px-3.5 py-1.5 text-[12px] font-medium text-[color:var(--apple-ink)] [box-shadow:var(--apple-shadow-sm)] transition-[background-color,border-color,box-shadow,transform] duration-300 ease-apple hover:border-[color:var(--apple-line-strong)] hover:bg-[color:var(--apple-card-hover)] hover:[box-shadow:var(--apple-shadow-md)] motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 motion-safe:active:scale-[0.98] motion-reduce:transition-none ${
      revealed ? 'motion-safe:animate-fade-in-up' : 'motion-safe:opacity-0'
    }`}
    style={revealed ? { animationDelay: `${delayMs}ms` } : undefined}
  >
    {/* Hover tints the glyph brand blue (same cue as the stat numbers), which
        reads clearer on dark cards than the border change alone. */}
    <FreeModelLogo
      id={model.id}
      className="h-4 w-4 transition-[color,transform] duration-300 ease-apple group-hover:text-[color:var(--apple-blue)] motion-safe:group-hover:-rotate-6 motion-safe:group-hover:scale-110 motion-reduce:transition-none"
    />
    <span>{model.label}</span>
  </li>
)

export const FreeModelsCallout = () => {
  const { t } = useLocale()
  const { ref, revealed } = useRevealOnce()

  return (
    <div
      ref={ref}
      // 深色下卡片外沿只剩 8% 白描边（黑底上投影不可见），与卡内分隔线
      // 同规格升级为 line-strong（12%）
      className="relative overflow-hidden rounded-[2rem] border border-[color:var(--apple-line)] dark:border-[color:var(--apple-line-strong)] bg-[color:var(--apple-card)] p-6 [box-shadow:var(--tw-ring-offset-shadow,0_0_#0000),var(--tw-ring-shadow,0_0_#0000),var(--apple-shadow-xl)] ring-1 ring-black/[0.04] backdrop-blur-2xl dark:ring-white/[0.06] sm:p-8"
    >
      {/* Glass reflections: hairline highlight along the top edge plus a soft sheen */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[color:var(--apple-soft-line)] to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 h-44 w-[130%] -translate-x-1/2 rounded-[100%] bg-gradient-to-b from-white/45 to-transparent blur-2xl dark:from-white/[0.05]"
      />

      {/* role="list" restores list semantics that list-style-none strips in Safari/VoiceOver */}
      <ul
        role="list"
        aria-label={t('freeModels.listLabel', 'Built-in free models')}
        className="relative flex list-none flex-wrap justify-center gap-2 p-0"
      >
        {freeModels.map((model, index) => (
          <ModelPill key={model.id} model={model} revealed={revealed} delayMs={index * 90} />
        ))}
      </ul>

      {/* Dark cards sit on near-black, so the hairline divider needs the
          stronger line token to stay visible there. Divider spacing tracks the
          card padding step (p-6 -> sm:p-8) so both halves keep the same rhythm. */}
      <div className="relative mt-6 border-t border-[color:var(--apple-line)] pt-5 dark:border-[color:var(--apple-line-strong)] sm:mt-8 sm:pt-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--apple-muted)]">
            {t('freeModels.poweredBy', 'Powered by SiliconFlow')}
          </span>
          {/* The card was a hover-only <span>: it looked interactive but touch and
              keyboard users could not reach it. It is now a real link to the
              SiliconFlow site — min-h keeps the target at the 44px HIG minimum,
              and focus-visible mirrors the hover border/shadow treatment. The
              box-shadow composes the --tw-ring-* vars (same trick as the outer
              card) so the focus-ring is not clobbered by the Apple shadow token. */}
          {/* The accessible name lives on the link itself: the two theme-variant
              logos are swapped via display, so naming either img alone would
              leave the link unnamed in the other theme. Both imgs stay alt=""
              so "SiliconFlow" is announced exactly once. */}
          <a
            href="https://siliconflow.cn"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="SiliconFlow"
            className="focus-ring touch-manipulation group relative inline-flex min-h-[44px] items-center overflow-hidden rounded-2xl border border-[color:var(--apple-line)] bg-[color:var(--apple-card-strong)] px-5 py-2.5 [box-shadow:var(--tw-ring-offset-shadow,0_0_#0000),var(--tw-ring-shadow,0_0_#0000),var(--apple-shadow-sm)] transition-[border-color,box-shadow,transform] duration-300 ease-apple hover:border-[color:var(--apple-line-strong)] hover:[box-shadow:var(--tw-ring-offset-shadow,0_0_#0000),var(--tw-ring-shadow,0_0_#0000),var(--apple-shadow-md)] focus-visible:border-[color:var(--apple-line-strong)] motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0 motion-safe:active:scale-[0.99] motion-reduce:transition-none"
          >
            {/* Shimmer sweeps in on hover/keyboard focus only; on the way out it
                snaps back off-screen instead of visibly sliding backwards over
                the logo. */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent dark:via-white/10 motion-safe:group-hover:translate-x-full motion-safe:group-hover:transition-transform motion-safe:group-hover:duration-700 motion-safe:group-hover:ease-out motion-safe:group-focus-visible:translate-x-full motion-safe:group-focus-visible:transition-transform motion-safe:group-focus-visible:duration-700 motion-safe:group-focus-visible:ease-out"
            />
            <img
              src={siliconflowLogo}
              alt=""
              className="h-8 w-auto dark:hidden sm:h-9"
              loading="lazy"
              draggable="false"
            />
            <img
              src={siliconflowLogoDark}
              alt=""
              className="hidden h-8 w-auto dark:block sm:h-9"
              loading="lazy"
              draggable="false"
            />
          </a>
        </div>
      </div>
    </div>
  )
}
