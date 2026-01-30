import { useCallback, useSyncExternalStore } from 'react'
import { Languages } from 'lucide-react'

// Locale values: 'zh' | 'en'
const LOCALE_KEY = 'ds-locale-preference'

// Translations
const translations = {
  zh: {
    // Nav
    'nav.features': '功能',
    'nav.docs': '文档',
    'nav.download': '下载',
    
    // Hero
    'hero.title': 'DeepStudent',
    'hero.subtitle': 'Ai 原生学习解决方案',
    'hero.tagline': '让学习更高效，让知识更牢固',
    'hero.cta.download': '立即下载',
    'hero.cta.explore': '看看介绍',
    
    // Features
    'feature.review.title': '错题复盘',
    'feature.review.desc': '把错因写清楚、归好类，复习时一眼就知道从哪里开始。',
    'feature.organize.title': '有序，不只是整理',
    'feature.organize.desc': '集中管理所有学科错题，按知识点、难度、时间分类，像系统文件管理器一样井井有条。',
    'feature.compare.title': '多题回顾',
    'feature.compare.desc': '把相关题目放在一起看，理解共性错误，形成自己的复习重点。',
    'feature.spaced.title': '间隔复习',
    'feature.spaced.desc': '对接间隔复习法，轻松生成卡片，循序巩固。',
    'feature.knowledge.title': '知识补充',
    'feature.knowledge.desc': '内置参考库。遇到卡住的题，可以直接翻到相关章节和思路。',
    
    // Cards
    'card.analyzing': '深度分析中',
    'card.justNow': '刚刚',
    'card.mastery': '知识点掌握',
    'card.suggestion': '建议：',
    'card.myNotebook': '我的错题本',
    'card.errorType': '错误类型',
    'card.calcError': '计算错误',
    'card.frequency': '频次',
    'card.high': '高',
    'card.question': '题目',
    'card.clickAnswer': '点击查看答案',
    'card.backToQuestion': '返回题目',
    'card.reference': '参考：第 4 章',
    
    // Download
    'download.title': '下载 DeepStudent',
    'download.subtitle': '选择你的平台，安装后即可开始整理。',
    'download.selectPlatform': '选择平台',
    'download.backHome': '返回首页',
    'download.dmgInstall': 'DMG 安装',
    'download.preview': '预览版',
    'download.version': '版本',
    'download.size': '大小',
    'download.system': '系统',
    'download.downloadDmg': '下载 DMG',
    'download.downloadExe': '下载 EXE',
    
    // Footer
    'footer.privacy': '隐私',
    'footer.about': '关于',
    'footer.terms': '条款',
    
    // Policy
    'policy.understood': '我已了解',
    'policy.close': '关闭弹窗',
    
    // Theme
    'theme.system': '跟随系统',
    'theme.light': '浅色模式',
    'theme.dark': '深色模式',
    
    // Locale
    'locale.zh': '中文',
    'locale.en': 'English',
  },
  en: {
    // Nav
    'nav.features': 'Features',
    'nav.docs': 'Docs',
    'nav.download': 'Download',
    
    // Hero
    'hero.title': 'DeepStudent',
    'hero.subtitle': 'AI-Native Learning Solution',
    'hero.tagline': 'Learn smarter, remember longer',
    'hero.cta.download': 'Download',
    'hero.cta.explore': 'Learn More',
    
    // Features
    'feature.review.title': 'Mistake Review',
    'feature.review.desc': 'Document your mistakes clearly, categorize them well, and know exactly where to start when reviewing.',
    'feature.organize.title': 'Organized, Not Just Sorted',
    'feature.organize.desc': 'Centrally manage mistakes across all subjects, categorized by knowledge points, difficulty, and time.',
    'feature.compare.title': 'Multi-Question Review',
    'feature.compare.desc': 'Compare related questions together, understand common errors, and form your own review priorities.',
    'feature.spaced.title': 'Spaced Repetition',
    'feature.spaced.desc': 'Connect with spaced repetition methods, easily generate cards, and consolidate step by step.',
    'feature.knowledge.title': 'Knowledge Reference',
    'feature.knowledge.desc': 'Built-in reference library. When stuck, quickly find related chapters and approaches.',
    
    // Cards
    'card.analyzing': 'Deep Analyzing',
    'card.justNow': 'Just now',
    'card.mastery': 'Knowledge Mastery',
    'card.suggestion': 'Suggestion:',
    'card.myNotebook': 'My Mistake Notebook',
    'card.errorType': 'Error Type',
    'card.calcError': 'Calculation Error',
    'card.frequency': 'Frequency',
    'card.high': 'High',
    'card.question': 'Question',
    'card.clickAnswer': 'Click to reveal answer',
    'card.backToQuestion': 'Back to question',
    'card.reference': 'Reference: Chapter 4',
    
    // Download
    'download.title': 'Download DeepStudent',
    'download.subtitle': 'Choose your platform and start organizing.',
    'download.selectPlatform': 'Select Platform',
    'download.backHome': 'Back to Home',
    'download.dmgInstall': 'DMG Install',
    'download.preview': 'Preview',
    'download.version': 'Version',
    'download.size': 'Size',
    'download.system': 'System',
    'download.downloadDmg': 'Download DMG',
    'download.downloadExe': 'Download EXE',
    
    // Footer
    'footer.privacy': 'Privacy',
    'footer.about': 'About',
    'footer.terms': 'Terms',
    
    // Policy
    'policy.understood': 'I Understand',
    'policy.close': 'Close dialog',
    
    // Theme
    'theme.system': 'System',
    'theme.light': 'Light Mode',
    'theme.dark': 'Dark Mode',
    
    // Locale
    'locale.zh': '中文',
    'locale.en': 'English',
  },
}

// Create a locale store for external sync
const localeStore = (() => {
  let locale = 'zh'
  let cachedSnapshot = { locale }
  const listeners = new Set()

  const updateSnapshot = () => {
    cachedSnapshot = { locale }
  }

  const applyLocale = (newLocale) => {
    if (typeof document === 'undefined') return
    document.documentElement.lang = newLocale === 'zh' ? 'zh-CN' : 'en'
    updateSnapshot()
  }

  const setLocale = (newLocale) => {
    locale = newLocale
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(LOCALE_KEY, newLocale)
    }
    applyLocale(newLocale)
    listeners.forEach((l) => l())
  }

  const init = () => {
    if (typeof window === 'undefined') return

    // Read stored preference or detect from browser
    const stored = localStorage.getItem(LOCALE_KEY)
    if (stored && ['zh', 'en'].includes(stored)) {
      locale = stored
    } else {
      // Auto-detect from browser language
      const browserLang = navigator.language || navigator.userLanguage
      locale = browserLang.startsWith('zh') ? 'zh' : 'en'
    }
    applyLocale(locale)
    updateSnapshot()
  }

  const subscribe = (listener) => {
    listeners.add(listener)
    if (listeners.size === 1) init()
    return () => listeners.delete(listener)
  }

  const getSnapshot = () => cachedSnapshot
  const getServerSnapshot = () => ({ locale: 'zh' })

  return { subscribe, getSnapshot, getServerSnapshot, setLocale }
})()

// Hook to use locale
export const useLocale = () => {
  const state = useSyncExternalStore(
    localeStore.subscribe,
    localeStore.getSnapshot,
    localeStore.getServerSnapshot
  )

  const setLocale = useCallback((newLocale) => {
    localeStore.setLocale(newLocale)
  }, [])

  // Translation function
  const t = useCallback(
    (key, fallback) => {
      return translations[state.locale]?.[key] || fallback || key
    },
    [state.locale]
  )

  return {
    locale: state.locale,
    setLocale,
    t,
    isZh: state.locale === 'zh',
    isEn: state.locale === 'en',
  }
}

// Locale toggle button - Apple minimal style
export const LocaleToggle = ({ className = '' }) => {
  const { locale, setLocale, t } = useLocale()

  const toggleLocale = () => {
    setLocale(locale === 'zh' ? 'en' : 'zh')
  }

  return (
    <button
      type="button"
      onClick={toggleLocale}
      className={`
        focus-ring relative flex items-center justify-center
        w-7 h-7 rounded-full
        text-[color:var(--apple-ink-secondary)]
        hover:text-[color:var(--apple-ink)]
        hover:bg-[color:var(--apple-card-hover)]
        active:scale-95
        transition-all duration-200
        text-xs font-medium
        ${className}
      `.trim()}
      aria-label={locale === 'zh' ? 'Switch to English' : '切换到中文'}
      title={locale === 'zh' ? 'Switch to English' : '切换到中文'}
    >
      <span className="font-semibold">{locale === 'zh' ? 'EN' : '中'}</span>
    </button>
  )
}

export default LocaleToggle
