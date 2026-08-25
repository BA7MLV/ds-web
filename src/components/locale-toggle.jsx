import { useCallback, useRef, useSyncExternalStore } from 'react'
import { cn } from '../lib/utils'
import zhMessages from '../locales/zh.json'

const LOCALE_KEY = 'ds-locale-preference'
const VALID_LOCALES = ['zh', 'zh-Hant', 'en']

const LOCALE_LOADERS = {
  // zh is the default/fallback locale and ships in the main bundle via the
  // static import above; resolving it from that module (instead of a dynamic
  // import of the same file) avoids Vite's mixed static/dynamic import warning
  // while keeping zh-Hant and en as lazily loaded, code-split chunks.
  zh: () => Promise.resolve({ default: zhMessages }),
  'zh-Hant': () => import('../locales/zh-Hant.json'),
  en: () => import('../locales/en.json'),
}

const localeMessages = new Map()
const localeLoadingTasks = new Map()

localeMessages.set('zh', zhMessages)

const detectInitialLocale = () => {
  if (typeof window === 'undefined') return 'zh'

  try {
    const stored = localStorage.getItem(LOCALE_KEY)
    if (stored && VALID_LOCALES.includes(stored)) return stored
  } catch {
    return 'zh'
  }

  const browserLang = navigator.language || navigator.userLanguage
  const lower = String(browserLang || '').toLowerCase()
  if (lower.startsWith('zh')) {
    return lower.includes('hant') || lower.includes('tw') || lower.includes('hk') || lower.includes('mo')
      ? 'zh-Hant'
      : 'zh'
  }
  return 'en'
}

const loadLocaleMessages = async (locale) => {
  if (localeMessages.has(locale)) return localeMessages.get(locale)
  if (localeLoadingTasks.has(locale)) return localeLoadingTasks.get(locale)

  const loadTask = (LOCALE_LOADERS[locale] || LOCALE_LOADERS.zh)()
    .then((module) => {
      const messages = module.default || module
      localeMessages.set(locale, messages)
      localeLoadingTasks.delete(locale)
      return messages
    })
    .catch((error) => {
      localeLoadingTasks.delete(locale)
      throw error
    })

  localeLoadingTasks.set(locale, loadTask)
  return loadTask
}

const getLocaleMessages = (locale) => localeMessages.get(locale) || {}

const localeStore = (() => {
  let locale = detectInitialLocale()
  let ready = localeMessages.has(locale)
  let version = 0
  let initialized = false
  let cachedSnapshot = { locale, ready, version }
  const listeners = new Set()

  const updateSnapshot = () => {
    cachedSnapshot = { locale, ready, version }
  }

  const notify = () => {
    version += 1
    updateSnapshot()
    listeners.forEach((listener) => listener())
  }

  const applyLocale = (nextLocale) => {
    if (typeof document === 'undefined') return
    document.documentElement.lang =
      nextLocale === 'zh' ? 'zh-CN' : nextLocale === 'zh-Hant' ? 'zh-Hant' : 'en'
  }

  const setLocale = (nextLocale) => {
    if (!VALID_LOCALES.includes(nextLocale) || locale === nextLocale) return
    locale = nextLocale
    ready = localeMessages.has(nextLocale)
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(LOCALE_KEY, nextLocale)
    }
    applyLocale(nextLocale)
    notify()

    loadLocaleMessages(nextLocale)
      .then(() => {
        ready = true
        notify()
      })
      .catch(() => {
        ready = true
        notify()
      })
  }

  const init = () => {
    if (initialized || typeof window === 'undefined') return
    initialized = true

    applyLocale(locale)
    updateSnapshot()

    loadLocaleMessages(locale)
      .then(() => {
        ready = true
        notify()
      })
      .catch(() => {
        ready = true
        notify()
      })
  }

  const subscribe = (listener) => {
    listeners.add(listener)
    if (listeners.size === 1) init()
    return () => listeners.delete(listener)
  }

  const getSnapshot = () => cachedSnapshot
  const getServerSnapshot = () => ({ locale: 'zh', ready: true, version: 0 })

  return { subscribe, getSnapshot, getServerSnapshot, setLocale }
})()

export const useLocale = () => {
  const state = useSyncExternalStore(
    localeStore.subscribe,
    localeStore.getSnapshot,
    localeStore.getServerSnapshot
  )

  const setLocale = useCallback((newLocale) => {
    localeStore.setLocale(newLocale)
  }, [])

  const t = useCallback(
    (key, fallback, vars) => {
      const currentMessages = getLocaleMessages(state.locale)
      const zhMessages = getLocaleMessages('zh')
      const template = currentMessages[key] || zhMessages[key] || fallback || key

      if (!vars) return template
      return String(template).replace(/\{(\w+)\}/g, (match, name) => {
        if (!(name in vars)) return match
        const value = vars[name]
        return value === undefined || value === null ? '' : String(value)
      })
    },
    [state.locale, state.version]
  )

  return {
    locale: state.locale,
    ready: state.ready,
    setLocale,
    t,
    isZh: state.locale === 'zh',
    isZhHant: state.locale === 'zh-Hant',
    isChinese: state.locale === 'zh' || state.locale === 'zh-Hant',
    isEn: state.locale === 'en',
  }
}

const LOCALE_OPTIONS = [
  { value: 'zh', short: '简', lang: 'zh-CN', labelKey: 'locale.zh', fallback: '简体中文' },
  { value: 'zh-Hant', short: '繁', lang: 'zh-Hant', labelKey: 'locale.zhHant', fallback: '繁體中文' },
  { value: 'en', short: 'EN', lang: 'en', labelKey: 'locale.en', fallback: 'English' },
]

// Segmented pill in the spirit of Apple's region/language picker:
// sliding thumb highlights the active locale, arrow keys roam the group.
export const LocaleToggle = ({ className = '', compact = false }) => {
  const { locale, setLocale, t } = useLocale()
  const buttonRefs = useRef([])

  const selectedIndex = Math.max(
    0,
    LOCALE_OPTIONS.findIndex((option) => option.value === locale)
  )

  const selectByIndex = (index) => {
    const next = (index + LOCALE_OPTIONS.length) % LOCALE_OPTIONS.length
    setLocale(LOCALE_OPTIONS[next].value)
    buttonRefs.current[next]?.focus()
  }

  const handleKeyDown = (event) => {
    // Leave modified keys to the browser (e.g. Alt+Left = history back,
    // Ctrl/Cmd+Home = scroll to top) instead of hijacking them for roving focus
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault()
        selectByIndex(selectedIndex + 1)
        break
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault()
        selectByIndex(selectedIndex - 1)
        break
      case 'Home':
        event.preventDefault()
        selectByIndex(0)
        break
      case 'End':
        event.preventDefault()
        selectByIndex(LOCALE_OPTIONS.length - 1)
        break
      default:
        break
    }
  }

  return (
    <div
      role="radiogroup"
      aria-label={t('locale.select', 'Language')}
      onKeyDown={handleKeyDown}
      className={cn(
        'relative w-full select-none rounded-full p-0.5',
        compact ? 'h-8' : 'h-9',
        'bg-[color:var(--apple-btn-secondary-bg)] border border-[color:var(--apple-line)]',
        'backdrop-blur-xl backdrop-saturate-[180%]',
        '[box-shadow:var(--apple-shadow-sm)]',
        className
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'absolute inset-y-0.5 left-0.5 w-[calc((100%-0.25rem)/3)] rounded-full',
          'bg-[color:var(--apple-seg-thumb)] border border-[color:var(--apple-line)]',
          '[box-shadow:var(--apple-shadow-sm)]',
          'transition-transform duration-200 ease-out motion-reduce:transition-none',
          selectedIndex === 1 && 'translate-x-full',
          selectedIndex === 2 && 'translate-x-[200%]'
        )}
      />
      <div className="relative grid h-full grid-cols-3">
        {LOCALE_OPTIONS.map((option, index) => {
          const isSelected = index === selectedIndex
          const fullLabel = t(option.labelKey, option.fallback)
          return (
            <button
              key={option.value}
              ref={(node) => {
                buttonRefs.current[index] = node
              }}
              type="button"
              role="radio"
              aria-checked={isSelected}
              tabIndex={isSelected ? 0 : -1}
              lang={option.lang}
              title={fullLabel}
              aria-label={fullLabel}
              onClick={() => setLocale(option.value)}
              className={cn(
                'focus-ring touch-manipulation relative flex items-center justify-center rounded-full leading-none',
                // 聚焦时提升层级，避免 ring-offset 外扩的焦点环被相邻分段的
                // 命中区域伪元素/文字盖住（浅色与深色主题下同样生效）
                'focus-visible:z-10',
                // 触控目标：视觉高度不变，伪元素向上下各扩展 8px，
                // 使命中区域达到 ≥44px（Apple HIG 最小触控目标），与 ThemeToggle 一致；
                // 仅纵向扩展，避免相邻分段的命中区域互相重叠
                "after:content-[''] after:absolute after:inset-x-0 after:-inset-y-2",
                compact ? 'text-[12px]' : 'text-[13px]',
                'font-medium tracking-[0.01em]',
                'transition-[color,transform] duration-200 active:scale-[0.96]',
                'motion-reduce:transition-none motion-reduce:active:scale-100',
                isSelected
                  ? 'text-[color:var(--apple-ink)]'
                  : 'text-[color:var(--apple-muted)] hover:text-[color:var(--apple-ink)]'
              )}
            >
              {option.short}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default LocaleToggle
