/**
 * Presentational feature panel: copy left, large image right.
 * Designed for sticky horizontal scroll sections.
 * Uses site Apple tokens so it matches the existing homepage.
 */
export const FeaturePanel = ({
  title,
  description,
  imageSrc,
  imageAlt,
  progressLocal,
  className = '',
}) => {
  const progress =
    typeof progressLocal === 'number'
      ? Math.min(1, Math.max(0, progressLocal))
      : 1

  const fadeStyle =
    typeof progressLocal === 'number'
      ? {
          opacity: 0.55 + progress * 0.45,
          transform: `translateY(${(1 - progress) * 12}px)`,
        }
      : undefined

  return (
    <section
      className={`flex h-full w-full flex-col items-center justify-center gap-8 px-6 py-10 font-sans md:flex-row md:gap-12 md:px-12 lg:gap-16 lg:px-16 ${className}`.trim()}
      style={fadeStyle}
    >
      <div className="flex w-full max-w-md shrink-0 flex-col justify-center md:w-[38%] md:max-w-[22rem]">
        <h2 className="text-[28px] font-semibold leading-tight tracking-tight text-[color:var(--apple-ink)] md:text-[36px] lg:text-[40px]">
          {title}
        </h2>
        {description ? (
          <p className="mt-4 text-[17px] leading-relaxed text-[color:var(--apple-muted)] md:text-[19px]">
            {description}
          </p>
        ) : null}
      </div>

      <div className="flex min-w-0 flex-1 items-center justify-center overflow-hidden">
        <img
          src={imageSrc}
          alt={imageAlt ?? ''}
          className="h-auto max-h-[70vh] w-full max-w-full object-contain"
          draggable={false}
        />
      </div>
    </section>
  )
}
