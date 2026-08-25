import { useEffect, useRef, useState } from 'react'

import { useLocale } from '../locale-toggle'

const siliconflowLogo = '/siliconflow_Chinese%20and%20English%20LOGO.svg'
const siliconflowLogoDark = '/siliconflow_Chinese%20and%20English%20LOGO_dark.svg'

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
    if (typeof IntersectionObserver === 'undefined') {
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

const ModelPill = ({ model, revealed, delayMs }) => (
  <span
    className={`group inline-flex select-none items-center gap-2 rounded-full border border-[color:var(--apple-line)] bg-[color:var(--apple-card-strong)] px-3.5 py-1.5 text-[12px] font-medium text-[color:var(--apple-ink)] shadow-[var(--apple-shadow-sm)] transition-all duration-300 ease-apple hover:border-[color:var(--apple-line-strong)] hover:bg-[color:var(--apple-card-hover)] hover:shadow-[var(--apple-shadow-md)] motion-safe:hover:-translate-y-0.5 ${
      revealed ? 'motion-safe:animate-fade-in-up' : 'motion-safe:opacity-0'
    }`}
    style={revealed ? { animationDelay: `${delayMs}ms` } : undefined}
  >
    <FreeModelLogo
      id={model.id}
      className="h-4 w-4 transition-transform duration-300 ease-apple motion-safe:group-hover:-rotate-6 motion-safe:group-hover:scale-110"
    />
    <span>{model.label}</span>
  </span>
)

export const FreeModelsCallout = () => {
  const { t } = useLocale()
  const { ref, revealed } = useRevealOnce()

  return (
    <div
      ref={ref}
      className="relative overflow-hidden rounded-[2rem] border border-[color:var(--apple-line)] bg-[color:var(--apple-card)] p-6 shadow-[var(--apple-shadow-xl)] ring-1 ring-black/[0.04] backdrop-blur-2xl dark:ring-white/[0.06] sm:p-8"
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

      <div className="relative flex flex-wrap justify-center gap-2">
        {freeModels.map((model, index) => (
          <ModelPill key={model.id} model={model} revealed={revealed} delayMs={index * 90} />
        ))}
      </div>

      <div className="relative mt-6 border-t border-[color:var(--apple-line)] pt-5">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[color:var(--apple-muted)]">
            {t('freeModels.poweredBy', 'Powered by SiliconFlow')}
          </span>
          <span className="group relative inline-flex items-center overflow-hidden rounded-2xl border border-[color:var(--apple-line)] bg-[color:var(--apple-card-strong)] px-5 py-2.5 shadow-[var(--apple-shadow-sm)] transition-all duration-300 ease-apple hover:border-[color:var(--apple-line-strong)] hover:shadow-[var(--apple-shadow-md)] motion-safe:hover:-translate-y-0.5">
            {/* Shimmer sweep across the badge on hover */}
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent transition-transform duration-700 ease-out dark:via-white/10 motion-safe:group-hover:translate-x-full"
            />
            <img
              src={siliconflowLogo}
              alt="SiliconFlow"
              className="h-8 w-auto dark:hidden sm:h-9"
              loading="lazy"
              draggable="false"
            />
            <img
              src={siliconflowLogoDark}
              alt="SiliconFlow"
              className="hidden h-8 w-auto dark:block sm:h-9"
              loading="lazy"
              draggable="false"
            />
          </span>
        </div>
      </div>
    </div>
  )
}
