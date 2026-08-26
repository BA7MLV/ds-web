import { useLocale } from './locale-toggle'
import { Reveal } from './reveal'

const ITEM_KEYS = ['item1', 'item2', 'item3', 'item4']

// 全页唯一反色重音章节：浅色模式黑底白字，深色模式白底黑字
export const LocalFirstSection = ({ motionScale = 1 }) => {
  const { t } = useLocale()

  return (
    <section
      className="px-5 py-24 text-[color:var(--apple-invert-ink)] sm:py-32"
      style={{ backgroundColor: 'var(--apple-invert-bg)' }}
      aria-label={t('localFirst.title')}
    >
      <div className="mx-auto w-full max-w-5xl">
        <Reveal motionScale={motionScale} className="max-w-2xl">
          <h2 className="text-[1.75rem] font-semibold leading-[1.15] tracking-[-0.02em] sm:text-[2.5rem]">
            {t('localFirst.title')}
          </h2>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-[color:var(--apple-invert-ink-secondary)] sm:text-[17px]">
            {t('localFirst.desc')}
          </p>
        </Reveal>

        <Reveal motionScale={motionScale} y={32} className="mt-12 max-w-3xl border-t border-[color:var(--apple-invert-line)]">
          {ITEM_KEYS.map((key) => (
            <div
              key={key}
              className="grid grid-cols-1 gap-x-8 gap-y-2 border-b border-[color:var(--apple-invert-line)] py-6 sm:grid-cols-[200px_1fr]"
            >
              <h3 className="text-[15px] font-semibold tracking-tight sm:text-[17px]">
                {t(`localFirst.${key}.name`)}
              </h3>
              <p className="text-[14px] leading-relaxed text-[color:var(--apple-invert-ink-secondary)] sm:text-[16px]">
                {t(`localFirst.${key}.desc`)}
              </p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  )
}
