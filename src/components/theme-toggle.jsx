import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'
import { SunsetDetector } from '../lib/sunset-detection'

// Theme values: 'light' | 'dark' | 'system'
const THEME_KEY = 'ds-theme-preference'

// Create a theme store for external sync
const themeStore = (() => {
  let theme = 'system'
  let resolvedTheme = 'light'
  let sunsetDetector = null
  let sunsetCheckInterval = null
  // Cache the snapshot object to prevent infinite loops
  let cachedSnapshot = { theme, resolvedTheme }
  const listeners = new Set()

  const getSystemTheme = () => {
    if (typeof window === 'undefined') return 'light'
    
    // 优先级1：媒体查询（系统偏好）
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    if (mediaQuery.matches) return 'dark'
    
    // 优先级2：日出日落检测（如果启用）
    if (sunsetDetector) {
      try {
        const { isDaytime } = sunsetDetector.getSunriseAndSunset()
        return isDaytime ? 'light' : 'dark'
      } catch (e) {
        console.warn('[Theme] 日出日落检测失败', e)
      }
    }
    
    return 'light'
  }

  const updateSnapshot = () => {
    cachedSnapshot = { theme, resolvedTheme }
  }

  const applyTheme = (newTheme) => {
    if (typeof document === 'undefined') return

    const resolved = newTheme === 'system' ? getSystemTheme() : newTheme
    resolvedTheme = resolved

    // 应用主题：禁用过渡，应用类名，恢复过渡（避免中间状态可见）
    const root = document.documentElement
    const originalTransition = root.style.transition
    root.style.transition = 'none'
    
    // 强制浏览器同步处理（不使用微任务）
    root.classList.remove('light', 'dark')
    root.classList.add(resolved)
    
    // 强制重排，确保类名应用生效
    void root.offsetHeight
    
    // 恢复过渡
    root.style.transition = originalTransition

    // Update meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]:not([media])')
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', resolved === 'dark' ? '#0a0a0c' : '#f5f5f7')
    }

    updateSnapshot()
  }

  const setTheme = (newTheme) => {
    theme = newTheme
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(THEME_KEY, newTheme)
    }
    applyTheme(newTheme)
    listeners.forEach((l) => l())
  }

  const init = () => {
    if (typeof window === 'undefined') return

    // Read stored preference
    const stored = localStorage.getItem(THEME_KEY)
    if (stored && ['light', 'dark', 'system'].includes(stored)) {
      theme = stored
    }
    applyTheme(theme)

    // 初始化日出日落检测
    initSunsetDetection()

    // Listen for system changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system')
        listeners.forEach((l) => l())
      }
    }
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
    } else {
      mediaQuery.addListener(handleChange)
    }
  }

  const initSunsetDetection = () => {
    // 异步初始化日出日落检测，避免阻塞主线程
    try {
      sunsetDetector = new SunsetDetector()
      
      // 每小时检查一次是否跨越日出/日落边界
      if (sunsetCheckInterval) clearInterval(sunsetCheckInterval)
      sunsetCheckInterval = setInterval(() => {
        if (theme === 'system') {
          applyTheme('system')
          listeners.forEach((l) => l())
        }
      }, 3600000) // 1 hour
    } catch (e) {
      console.warn('[Theme] 日出日落检测初始化失败', e)
    }
  }

  const subscribe = (listener) => {
    listeners.add(listener)
    if (listeners.size === 1) init()
    return () => listeners.delete(listener)
  }

  // Return cached snapshot to avoid infinite loops
  const getSnapshot = () => cachedSnapshot
  const getServerSnapshot = () => ({ theme: 'system', resolvedTheme: 'light' })

  return { subscribe, getSnapshot, getServerSnapshot, setTheme }
})()

// Hook to use theme
export const useTheme = () => {
  const state = useSyncExternalStore(
    themeStore.subscribe,
    themeStore.getSnapshot,
    themeStore.getServerSnapshot
  )

  const setTheme = useCallback((newTheme) => {
    themeStore.setTheme(newTheme)
  }, [])

  return {
    theme: state.theme,
    resolvedTheme: state.resolvedTheme,
    setTheme,
    isDark: state.resolvedTheme === 'dark',
  }
}

// Inline SF Symbol 风格图标（sun.max / moon / circle.lefthalf.filled）
const SunIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
    <circle cx="12" cy="12" r="4.25" fill="currentColor" />
    <g stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M12 2.75v2" />
      <path d="M12 19.25v2" />
      <path d="M2.75 12h2" />
      <path d="M19.25 12h2" />
      <path d="m5.46 5.46 1.42 1.42" />
      <path d="m17.12 17.12 1.42 1.42" />
      <path d="m18.54 5.46-1.42 1.42" />
      <path d="m6.88 17.12-1.42 1.42" />
    </g>
  </svg>
)

const MoonIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
    <path
      d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinejoin="round"
    />
  </svg>
)

const AutoIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
    <circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="1.5" />
    <path d="M12 3.75a8.25 8.25 0 0 0 0 16.5Z" fill="currentColor" />
  </svg>
)

const THEME_ORDER = ['system', 'light', 'dark']
const THEME_LABELS = { system: '跟随系统', light: '浅色模式', dark: '深色模式' }

// Apple 弹性缓动（轻微过冲），reduced motion 下由 motion-reduce 类禁用
const SPRING_EASE = 'ease-[cubic-bezier(0.34,1.56,0.64,1)]'

// Theme toggle button with three states
export const ThemeToggle = ({ className = '' }) => {
  const { theme, setTheme } = useTheme()

  const nextTheme = THEME_ORDER[(THEME_ORDER.indexOf(theme) + 1) % THEME_ORDER.length]

  // 三个图标叠放在同一位置，激活的旋转归位并放大淡入，其余反向旋出并缩小淡出
  const iconClass = (isActive, hiddenTransform) => `
    absolute inset-0 flex items-center justify-center
    transition-all duration-300 ${SPRING_EASE}
    motion-reduce:transition-none
    ${isActive ? 'opacity-100 scale-100 rotate-0' : `opacity-0 ${hiddenTransform}`}
  `.trim()

  return (
    <button
      type="button"
      onClick={() => setTheme(nextTheme)}
      className={`
        focus-ring group relative flex items-center justify-center
        w-7 h-7 rounded-full
        text-[color:var(--apple-muted)]
        hover:text-[color:var(--apple-ink)]
        hover:bg-[color:var(--apple-card)]
        active:scale-[0.88] active:duration-100 active:ease-out
        transition-[transform,background-color,color,box-shadow]
        duration-300 ${SPRING_EASE}
        motion-reduce:transition-none motion-reduce:active:scale-100
        ${className}
      `.trim()}
      aria-label={`主题：${THEME_LABELS[theme]}，点按切换为${THEME_LABELS[nextTheme]}`}
      title={THEME_LABELS[theme]}
    >
      <span className={iconClass(theme === 'light', '-rotate-90 scale-50')}>
        <SunIcon className="w-4 h-4 transition-transform duration-500 ease-out group-hover:rotate-45 motion-reduce:transition-none motion-reduce:group-hover:rotate-0" />
      </span>
      <span className={iconClass(theme === 'dark', 'rotate-90 scale-50')}>
        <MoonIcon className="w-4 h-4 transition-transform duration-500 ease-out group-hover:-rotate-12 motion-reduce:transition-none motion-reduce:group-hover:rotate-0" />
      </span>
      <span className={iconClass(theme === 'system', 'scale-50')}>
        <AutoIcon className="w-4 h-4 transition-transform duration-500 ease-out group-hover:rotate-180 motion-reduce:transition-none motion-reduce:group-hover:rotate-0" />
      </span>
      {/* 屏幕阅读器实时播报当前主题 */}
      <span className="sr-only" aria-live="polite">
        {THEME_LABELS[theme]}
      </span>
    </button>
  )
}

// Dropdown theme selector for more explicit selection
export const ThemeSelector = ({ className = '' }) => {
  const { theme, setTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  const themes = [
    { value: 'light', label: '浅色', symbol: '○' },
    { value: 'dark', label: '深色', symbol: '●' },
    { value: 'system', label: '系统', symbol: 'A' },
  ]

  const currentTheme = themes.find((t) => t.value === theme) || themes[2]

  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = () => setIsOpen(false)
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [isOpen])

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          setIsOpen(!isOpen)
        }}
        className="
          focus-ring flex items-center gap-2 
          px-3 py-1.5 rounded-full
          text-xs font-medium
          bg-[color:var(--apple-card)] 
          border border-[color:var(--apple-line)]
          text-[color:var(--apple-muted)]
          hover:text-[color:var(--apple-ink)]
          hover:bg-[color:var(--apple-card-hover)]
          transition-all duration-200
        "
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span>{currentTheme.label}</span>
      </button>

      {isOpen && (
        <div
          className="
            absolute right-0 mt-2 py-1.5
            min-w-[120px] rounded-xl
            bg-[color:var(--apple-card-strong)]
            border border-[color:var(--apple-line)]
            shadow-[var(--apple-shadow-md)]
            backdrop-blur-xl
            z-50
          "
          role="listbox"
        >
          {themes.map((t) => {
            const isSelected = theme === t.value
            return (
              <button
                key={t.value}
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setTheme(t.value)
                  setIsOpen(false)
                }}
                className={`
                  w-full flex items-center gap-2.5 px-3 py-2
                  text-xs font-medium text-left
                  transition-colors duration-150
                  ${isSelected 
                    ? 'text-[color:var(--apple-blue)] bg-[color:var(--apple-blue-soft)]' 
                    : 'text-[color:var(--apple-muted)] hover:text-[color:var(--apple-ink)] hover:bg-[color:var(--apple-card-hover)]'
                  }
                `}
                role="option"
                aria-selected={isSelected}
              >
                <span>{t.label}</span>
                {isSelected && <span className="ml-auto">✓</span>}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ThemeToggle
