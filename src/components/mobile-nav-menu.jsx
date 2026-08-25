import { useState, useEffect, useCallback, useRef, useId } from 'react'
import { createPortal } from 'react-dom'
import { ThemeToggle } from './theme-toggle'
import { LocaleToggle, useLocale } from './locale-toggle'

// Keep in sync with the exit animation durations in the <style> block below.
const EXIT_DURATION_MS = 260

const usePrefersReducedMotion = () => {
  const [prefersReduced, setPrefersReduced] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return undefined
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = () => setPrefersReduced(query.matches)
    handleChange()
    query.addEventListener('change', handleChange)
    return () => query.removeEventListener('change', handleChange)
  }, [])

  return prefersReduced
}

// `brand` receives TopNav's brand lockup so the overlay keeps the exact same
// wordmark tracking/size rhythm instead of hiding the brand behind the backdrop.
export const MobileNavMenu = ({ onDownload = () => {}, brand = null }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { t } = useLocale()
  const prefersReducedMotion = usePrefersReducedMotion()
  const menuId = useId()

  const scrollYRef = useRef(0)
  const previousBodyStylesRef = useRef(null)
  const previousHtmlStylesRef = useRef(null)
  const closeTimerRef = useRef(null)
  const triggerRef = useRef(null)
  const closeButtonRef = useRef(null)
  const dialogRef = useRef(null)
  const scrollRegionRef = useRef(null)
  // Deferred action (hash scroll / download) executed once the scroll lock is released.
  const pendingNavigationRef = useRef(null)

  const menuVisuallyOpen = isOpen && !isClosing

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
  }, [])

  const openMenu = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
    setIsClosing(false)
    setIsOpen(true)
  }, [])

  const closeMenu = useCallback(() => {
    if (!isOpen || isClosing) return
    if (prefersReducedMotion) {
      setIsOpen(false)
      return
    }
    setIsClosing(true)
    closeTimerRef.current = setTimeout(() => {
      closeTimerRef.current = null
      setIsClosing(false)
      setIsOpen(false)
    }, EXIT_DURATION_MS + 40)
  }, [isOpen, isClosing, prefersReducedMotion])

  const handleToggle = useCallback(() => {
    if (isOpen && !isClosing) {
      closeMenu()
    } else {
      openMenu()
    }
  }, [isOpen, isClosing, closeMenu, openMenu])

  // Scroll lock while the menu is open (restores styles + position on close).
  useEffect(() => {
    if (!isOpen) return undefined

    const body = document.body
    const html = document.documentElement
    scrollYRef.current = window.scrollY || window.pageYOffset || 0
    previousBodyStylesRef.current = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
      touchAction: body.style.touchAction,
      overscrollBehavior: body.style.overscrollBehavior,
    }
    previousHtmlStylesRef.current = {
      overflow: html.style.overflow,
      touchAction: html.style.touchAction,
      overscrollBehavior: html.style.overscrollBehavior,
    }

    // Block background scrolling but let the menu's own list scroll if it overflows.
    // Touches inside the list still need edge guarding: iOS Safari rubber-bands
    // and chains overscroll to the page behind when the list is already at its
    // top/bottom (or doesn't overflow at all), and CSS overscroll-behavior isn't
    // honored for touch scrolling on older iOS versions.
    let touchStartY = 0

    const handleTouchStart = (event) => {
      if (event.touches.length === 1) touchStartY = event.touches[0].clientY
    }

    const preventScroll = (event) => {
      if (!event.cancelable) return
      const scrollRegion = scrollRegionRef.current
      if (!scrollRegion || !scrollRegion.contains(event.target)) {
        event.preventDefault()
        return
      }
      if (event.type !== 'touchmove') return
      if (event.touches.length > 1) {
        event.preventDefault()
        return
      }
      const { scrollTop, scrollHeight, clientHeight } = scrollRegion
      if (scrollHeight <= clientHeight) {
        event.preventDefault()
        return
      }
      const fingerMovingDown = event.touches[0].clientY > touchStartY
      // scrollTop can dip below 0 mid rubber-band on iOS; the -1 slack covers
      // fractional scroll positions on zoomed/high-DPI viewports.
      const atTop = scrollTop <= 0
      const atBottom = scrollTop + clientHeight >= scrollHeight - 1
      if ((fingerMovingDown && atTop) || (!fingerMovingDown && atBottom)) {
        event.preventDefault()
      }
    }

    body.style.position = 'fixed'
    body.style.top = `-${scrollYRef.current}px`
    body.style.left = '0'
    body.style.right = '0'
    body.style.width = '100%'
    body.style.overflow = 'hidden'
    body.style.touchAction = 'none'
    body.style.overscrollBehavior = 'none'

    html.style.overflow = 'hidden'
    html.style.touchAction = 'none'
    html.style.overscrollBehavior = 'none'

    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('wheel', preventScroll, { passive: false })
    window.addEventListener('touchmove', preventScroll, { passive: false })

    return () => {
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('wheel', preventScroll)
      window.removeEventListener('touchmove', preventScroll)

      if (previousBodyStylesRef.current) {
        body.style.position = previousBodyStylesRef.current.position
        body.style.top = previousBodyStylesRef.current.top
        body.style.left = previousBodyStylesRef.current.left
        body.style.right = previousBodyStylesRef.current.right
        body.style.width = previousBodyStylesRef.current.width
        body.style.overflow = previousBodyStylesRef.current.overflow
        body.style.touchAction = previousBodyStylesRef.current.touchAction
        body.style.overscrollBehavior = previousBodyStylesRef.current.overscrollBehavior
      }

      if (previousHtmlStylesRef.current) {
        html.style.overflow = previousHtmlStylesRef.current.overflow
        html.style.touchAction = previousHtmlStylesRef.current.touchAction
        html.style.overscrollBehavior = previousHtmlStylesRef.current.overscrollBehavior
      }

      window.scrollTo(0, scrollYRef.current)

      const pendingNavigation = pendingNavigationRef.current
      pendingNavigationRef.current = null
      if (pendingNavigation) pendingNavigation()
    }
  }, [isOpen])

  // Move focus into the dialog on open, restore it to the trigger on close.
  // Keyed on isClosing too so the animated exit returns focus to the hamburger
  // the moment the dismissal starts (matching the reduced-motion path) instead
  // of leaving keyboard focus inside the fading dialog for EXIT_DURATION_MS.
  // If the menu is reopened mid-exit, the rAF re-focuses the close button.
  useEffect(() => {
    if (!isOpen || isClosing) return undefined
    const trigger = triggerRef.current
    const frame = window.requestAnimationFrame(() => {
      if (closeButtonRef.current) closeButtonRef.current.focus({ preventScroll: true })
    })
    return () => {
      window.cancelAnimationFrame(frame)
      if (trigger) trigger.focus({ preventScroll: true })
    }
  }, [isOpen, isClosing])

  // Escape closes the menu; Tab is trapped inside the dialog. Suspended while
  // isClosing: focus has already returned to the trigger and the dismissing
  // overlay is inert, so the trap must not pull focus back into it.
  useEffect(() => {
    if (!isOpen || isClosing) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        closeMenu()
        return
      }
      if (event.key !== 'Tab') return
      const dialog = dialogRef.current
      if (!dialog) return
      // Exclude tabindex="-1" so LocaleToggle's roving-tabindex radios never
      // become the trap's first/last element — otherwise Tab could slip past
      // them onto the page behind the overlay before wrapping back.
      const focusable = dialog.querySelectorAll(
        'a[href]:not([tabindex="-1"]), button:not([disabled]):not([tabindex="-1"])'
      )
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement
      if (event.shiftKey) {
        if (active === first || !dialog.contains(active)) {
          event.preventDefault()
          last.focus()
        }
      } else if (active === last || !dialog.contains(active)) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown, true)
    return () => document.removeEventListener('keydown', handleKeyDown, true)
  }, [isOpen, isClosing, closeMenu])

  const handleLinkClick = useCallback((event) => {
    const href = event.currentTarget.getAttribute('href')
    if (href && href.startsWith('#')) {
      // Defer the scroll until the lock releases, then honor each section's scroll-mt.
      pendingNavigationRef.current = () => {
        const target = document.getElementById(href.slice(1))
        if (!target) return
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
      }
    }
    closeMenu()
  }, [closeMenu])

  const handleDownloadClick = useCallback((event) => {
    event.preventDefault()
    // Defer so onDownload reads the restored scroll position after the lock releases.
    pendingNavigationRef.current = () => onDownload()
    closeMenu()
  }, [closeMenu, onDownload])

  const openLabel = t('nav.menu.open', '打开菜单')
  const closeLabel = t('nav.menu.close', '关闭菜单')
  const menuLabel = t('nav.menu.title', '导航菜单')
  const appearanceLabel = t('nav.menu.appearance', '外观')
  const languageLabel = t('nav.menu.language', '语言')
  // Ties each settings row's visible label to its control group so screen
  // readers announce "外观/Appearance" when focus lands on the toggle inside.
  const appearanceLabelId = `${menuId}-appearance`
  const languageLabelId = `${menuId}-language`

  const navItems = [
    { text: t('nav.features'), href: '#features', onClick: handleLinkClick },
    { text: t('nav.qa'), href: '#qa', onClick: handleLinkClick },
    { text: t('nav.docs'), href: '/docs/', onClick: handleLinkClick },
    { text: t('nav.download'), href: '#download', onClick: handleDownloadClick, isPrimary: true },
  ]

  const menuOverlay = isOpen && mounted ? (
    // `inert` during the exit animation: pointer-events-none already blocks
    // clicks, but without inert the fading dialog's links/buttons would remain
    // keyboard-focusable (and Enter-activatable) until the unmount timer fires.
    <div
      inert={isClosing}
      className={`fixed inset-0 z-[99999] lg:hidden ${isClosing ? 'pointer-events-none' : ''}`}
    >
      <div
        aria-hidden="true"
        onClick={closeMenu}
        className={`absolute inset-0 bg-[color:var(--apple-menu-bg)] backdrop-blur-2xl backdrop-saturate-150 ${
          isClosing ? 'ds-menu-backdrop-exit' : 'ds-menu-backdrop-enter'
        }`}
      />
      {brand ? (
        // Mirrors the top-nav row (h-14 below --sat, same responsive padding) so
        // the brand appears to stay in place while the menu opens. Sits outside
        // the dialog so the panel's scale animation never distorts the wordmark.
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-x-0 top-safe flex h-14 items-center pl-[max(1rem,var(--sal))] pr-[max(1rem,var(--sar))] sm:pl-[max(1.5rem,var(--sal))] sm:pr-[max(1.5rem,var(--sar))] ${
            isClosing ? 'ds-menu-brand-exit' : 'ds-menu-brand-enter'
          }`}
        >
          {brand}
        </div>
      ) : null}
      <div
        ref={dialogRef}
        id={menuId}
        role="dialog"
        aria-modal="true"
        aria-label={menuLabel}
        className={`relative flex h-full flex-col pt-[calc(var(--sat)+4.5rem)] pr-[max(1.5rem,var(--sar))] pb-[max(1.5rem,var(--sab))] pl-[max(1.5rem,var(--sal))] md:pt-[calc(var(--sat)+5.25rem)] ${
          isClosing ? 'ds-menu-panel-exit' : 'ds-menu-panel-enter'
        }`}
      >
        <button
          ref={closeButtonRef}
          type="button"
          onClick={closeMenu}
          className="focus-ring touch-manipulation group absolute z-10 flex h-11 w-11 items-center justify-center rounded-full border border-[color:var(--apple-line-strong)] bg-[color:var(--apple-card-strong)] text-[color:var(--apple-ink)] [box-shadow:var(--apple-shadow-sm)] backdrop-blur-xl transition duration-300 ease-apple hover:bg-[color:var(--apple-card-hover)] active:scale-95 motion-reduce:transition-none motion-reduce:active:scale-100"
          // right = nav padding max(1.5rem, --sar) minus half the 0.25rem size
          // difference (11 vs 10) so the ✕ stays centered over the hamburger
          // even when a landscape notch pushes --sar past 1.5rem.
          style={{
            top: 'calc(var(--sat) + 0.875rem)',
            right: 'calc(max(1.5rem, var(--sar)) - 0.125rem)',
          }}
          aria-label={closeLabel}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="h-5 w-5 transition-transform duration-300 ease-apple group-hover:rotate-90 motion-reduce:transition-none motion-reduce:group-hover:rotate-0"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
        {/* md:max-w keeps rows (and their trailing chevrons/controls) from
            stretching across a 768–1024 viewport; left-aligned so the list
            stays flush with the brand lockup above. */}
        <div
          ref={scrollRegionRef}
          className="flex w-full flex-1 flex-col overflow-y-auto overscroll-contain md:max-w-xl"
        >
          <nav className="mt-2">
            <ul className="flex flex-col">
              {navItems.map((item, index) => (
                <li
                  key={item.text}
                  className={`ds-menu-item-enter ${
                    index === 0 ? '' : 'border-t border-[color:var(--apple-line)]'
                  }`}
                  style={{ animationDelay: `${80 + index * 45}ms` }}
                >
                  <a
                    href={item.href}
                    onClick={item.onClick}
                    className={`focus-ring touch-manipulation group flex min-h-14 items-center gap-4 rounded-2xl px-3 py-3.5 transition-colors duration-300 ease-apple motion-reduce:transition-none md:min-h-16 md:gap-5 ${
                      item.isPrimary
                        ? 'text-[color:var(--apple-blue)] hover:bg-[color:var(--apple-blue-soft)]'
                        : 'text-[color:var(--apple-ink)] hover:bg-[color:var(--apple-btn-secondary-bg)] active:bg-[color:var(--apple-btn-secondary-bg-hover)]'
                    }`}
                  >
                    <span
                      aria-hidden="true"
                      className="w-7 text-[12px] font-medium tabular-nums tracking-[0.12em] text-[color:var(--apple-muted)]"
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="text-[21px] font-semibold tracking-tight md:text-[24px]">{item.text}</span>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      className={`ml-auto h-4 w-4 transition-transform duration-300 ease-apple group-hover:translate-x-0.5 motion-reduce:transition-none ${
                        item.isPrimary ? 'text-[color:var(--apple-blue)]' : 'text-[color:var(--apple-muted)]'
                      }`}
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-auto flex flex-col">
            {/* Theme + locale controls so the 768–1024 breakpoint (desktop
                toggles hidden until lg) can still switch appearance/language.
                Settings-style rows: label left, control right, ≥48px tall. */}
            <div
              className="ds-menu-item-enter flex flex-col border-t border-[color:var(--apple-line)] py-2"
              style={{ animationDelay: `${80 + navItems.length * 45}ms` }}
            >
              <div
                role="group"
                aria-labelledby={appearanceLabelId}
                className="flex min-h-12 items-center justify-between gap-4 px-3 md:min-h-14"
              >
                <span
                  id={appearanceLabelId}
                  className="text-[15px] font-medium text-[color:var(--apple-muted)] md:text-[16px]"
                >
                  {appearanceLabel}
                </span>
                <ThemeToggle />
              </div>
              <div
                role="group"
                aria-labelledby={languageLabelId}
                className="flex min-h-12 items-center justify-between gap-4 px-3 md:min-h-14"
              >
                <span
                  id={languageLabelId}
                  className="text-[15px] font-medium text-[color:var(--apple-muted)] md:text-[16px]"
                >
                  {languageLabel}
                </span>
                <LocaleToggle compact className="w-[10.5rem] md:w-[12rem]" />
              </div>
            </div>
            <div
              className="ds-menu-item-enter border-t border-[color:var(--apple-line)] pt-2 pb-1"
              style={{ animationDelay: `${80 + (navItems.length + 1) * 45}ms` }}
            >
              <a
                href="https://github.com/helixnow/deep-student"
                target="_blank"
                rel="noopener noreferrer"
                className="focus-ring touch-manipulation group flex min-h-12 items-center gap-3 rounded-xl px-3 py-3 text-[color:var(--apple-muted)] transition-colors duration-300 ease-apple hover:bg-[color:var(--apple-btn-secondary-bg)] hover:text-[color:var(--apple-ink)] motion-reduce:transition-none md:min-h-14"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-5 w-5">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                <span className="text-[15px] font-medium">{t('nav.github', 'GitHub')}</span>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="ml-auto h-4 w-4 opacity-60 transition-transform duration-300 ease-apple group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:transform-none"
                >
                  <path d="M7 17 17 7" />
                  <path d="M7 7h10v10" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : null

  return (
    <div className="lg:hidden">
      <button
        ref={triggerRef}
        type="button"
        onClick={handleToggle}
        className="focus-ring touch-manipulation relative z-[99999] flex h-10 w-10 items-center justify-center rounded-full text-[color:var(--apple-ink)] transition duration-300 ease-apple hover:bg-[color:var(--apple-btn-secondary-bg)] active:scale-95 motion-reduce:transition-none motion-reduce:active:scale-100"
        aria-label={menuVisuallyOpen ? closeLabel : openLabel}
        aria-expanded={menuVisuallyOpen}
        aria-haspopup="dialog"
        aria-controls={isOpen ? menuId : undefined}
      >
        <span aria-hidden="true" className="relative block h-[14px] w-5">
          <span
            className={`absolute left-0 top-0 h-0.5 w-5 rounded-full bg-current transition-transform duration-300 ease-apple motion-reduce:transition-none ${
              menuVisuallyOpen ? 'translate-y-1.5 rotate-45' : ''
            }`}
          />
          <span
            className={`absolute left-0 top-1.5 h-0.5 w-5 rounded-full bg-current transition-[transform,opacity] duration-300 ease-apple motion-reduce:transition-none ${
              menuVisuallyOpen ? 'scale-x-50 opacity-0' : ''
            }`}
          />
          <span
            className={`absolute left-0 top-3 h-0.5 w-5 rounded-full bg-current transition-transform duration-300 ease-apple motion-reduce:transition-none ${
              menuVisuallyOpen ? '-translate-y-1.5 -rotate-45' : ''
            }`}
          />
        </span>
      </button>

      {mounted && menuOverlay ? createPortal(menuOverlay, document.body) : null}

      <style>{`
        @keyframes dsMenuFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes dsMenuFadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        @keyframes dsMenuPanelIn {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes dsMenuPanelOut {
          from { opacity: 1; transform: scale(1); }
          to { opacity: 0; transform: scale(0.97); }
        }
        @keyframes dsMenuItemIn {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .ds-menu-backdrop-enter { animation: dsMenuFadeIn 0.45s var(--ease-apple) both; }
        .ds-menu-backdrop-exit { animation: dsMenuFadeOut 0.26s var(--ease-apple) both; }
        .ds-menu-brand-enter { animation: dsMenuFadeIn 0.45s var(--ease-apple) both; }
        .ds-menu-brand-exit { animation: dsMenuFadeOut 0.26s var(--ease-apple) both; }
        .ds-menu-panel-enter {
          animation: dsMenuPanelIn 0.5s var(--ease-apple) both;
          transform-origin: 85% 6%;
        }
        .ds-menu-panel-exit {
          animation: dsMenuPanelOut 0.26s var(--ease-apple) both;
          transform-origin: 85% 6%;
        }
        .ds-menu-item-enter { animation: dsMenuItemIn 0.55s var(--ease-apple) both; }
        @media (prefers-reduced-motion: reduce) {
          .ds-menu-backdrop-enter,
          .ds-menu-backdrop-exit,
          .ds-menu-brand-enter,
          .ds-menu-brand-exit,
          .ds-menu-panel-enter,
          .ds-menu-panel-exit,
          .ds-menu-item-enter {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  )
}
