import { useState, useEffect, useCallback } from 'react'
import { useLocale } from './locale-toggle'

export const MobileNavMenu = ({ onDownload = () => {} }) => {
  const [isOpen, setIsOpen] = useState(false)
  const { t } = useLocale()

  // 防止背景滚动
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // 点击链接后关闭菜单
  const handleLinkClick = useCallback(() => {
    setIsOpen(false)
  }, [])

  // 处理下载点击
  const handleDownloadClick = useCallback((e) => {
    e.preventDefault()
    setIsOpen(false)
    onDownload()
  }, [onDownload])

  const navItems = [
    { text: t('nav.features'), href: '#features', onClick: handleLinkClick },
    { text: t('nav.qa'), href: '#qa', onClick: handleLinkClick },
    { text: t('nav.docs'), href: '/docs/', onClick: handleLinkClick },
    { text: t('nav.download'), href: '#download', onClick: handleDownloadClick, isPrimary: true },
  ]

  return (
    <div className="md:hidden">
      {/* 汉堡菜单按钮 */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative z-[70] flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-lg bg-slate-100 text-slate-900 transition-colors hover:bg-slate-200 dark:bg-[color:var(--apple-btn-secondary-bg)] dark:text-[color:var(--apple-ink)] dark:hover:bg-[color:var(--apple-btn-secondary-bg-hover)]"
        aria-label={isOpen ? '关闭菜单' : '打开菜单'}
        aria-expanded={isOpen}
      >
        <span
          className={`h-0.5 w-5 rounded-full bg-current transition-all duration-300 ${
            isOpen ? 'rotate-45 translate-y-2' : ''
          }`}
        />
        <span
          className={`h-0.5 w-5 rounded-full bg-current transition-all duration-300 ${
            isOpen ? 'opacity-0' : ''
          }`}
        />
        <span
          className={`h-0.5 w-5 rounded-full bg-current transition-all duration-300 ${
            isOpen ? '-rotate-45 -translate-y-2' : ''
          }`}
        />
      </button>

      {/* 移动端菜单面板 */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-[60] bg-white md:hidden dark:bg-[color:var(--apple-nav-bg)]"
            style={{
              animation: 'fadeInMenu 0.2s ease-out',
            }}
          >
            <div
              className="flex h-full flex-col"
              style={{
                paddingTop: 'calc(var(--sat) + 4.25rem)',
                paddingRight: 'max(1.5rem, var(--sar))',
                paddingBottom: 'max(1.5rem, var(--sab))',
                paddingLeft: 'max(1.5rem, var(--sal))',
              }}
            >
              <nav className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <a
                    key={item.text}
                    href={item.href}
                    onClick={item.onClick}
                    className={`px-4 py-3 rounded-xl text-[15px] font-medium transition-colors ${
                      item.isPrimary
                        ? 'text-[color:var(--apple-blue)] bg-[color:var(--apple-blue-soft)]'
                        : 'text-slate-900 hover:bg-slate-100 dark:text-[color:var(--apple-ink)] dark:hover:bg-white/10'
                    }`}
                  >
                    {item.text}
                  </a>
                ))}
              </nav>
              <div className="mt-auto pt-6">
                <a
                  href="https://github.com/000haoji/deep-student"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-[color:var(--apple-muted)] dark:hover:bg-white/10 dark:hover:text-[color:var(--apple-ink)]"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  <span className="text-[14px] font-medium">GitHub</span>
                </a>
              </div>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes fadeInMenu {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}
