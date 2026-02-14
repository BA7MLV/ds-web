import { useCallback, useSyncExternalStore } from 'react'
import { cn } from '../lib/utils'
import zhMessages from '../locales/zh.json'

const LOCALE_KEY = 'ds-locale-preference'
const VALID_LOCALES = ['zh', 'zh-Hant', 'en']

const LOCALE_LOADERS = {
  zh: () => import('../locales/zh.json'),
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

export const LocaleToggle = ({ className = '', compact = false }) => {
  const { locale, setLocale, t } = useLocale()

  return (
    <div className={cn('relative inline-flex items-center w-full', className)}>
      <label className="sr-only" htmlFor="ds-locale-select">
        {t('locale.select', 'Language')}
      </label>
      <select
        id="ds-locale-select"
        value={locale}
        onChange={(event) => setLocale(event.target.value)}
        className={cn(
          'focus-ring appearance-none cursor-pointer',
          compact ? 'h-8 w-full rounded-full' : 'h-9 w-full rounded-full',
          'bg-[color:var(--apple-btn-secondary-bg)] border border-[color:var(--apple-line)]',
          'backdrop-blur-xl backdrop-saturate-[180%]',
          'shadow-[var(--apple-shadow-sm)]',
          compact
            ? 'text-[color:var(--apple-ink)] text-[12px] font-medium'
            : 'text-[color:var(--apple-ink)] text-[13px] font-medium',
          'px-4 leading-none text-center',
          'hover:bg-[color:var(--apple-btn-secondary-bg-hover)]'
        )}
        aria-label={t('locale.select', 'Language')}
      >
        <option value="zh">{t('locale.zh', '简体中文')}</option>
        <option value="zh-Hant">{t('locale.zhHant', '繁體中文')}</option>
        <option value="en">{t('locale.en', 'English')}</option>
      </select>
      <span
        className={cn(
          'pointer-events-none absolute inset-y-0 right-4 flex items-center text-[color:var(--apple-muted)] opacity-75'
        )}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </span>
    </div>
  )
}

export default LocaleToggle
