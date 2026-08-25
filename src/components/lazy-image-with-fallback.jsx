import { forwardRef, useState, useEffect, useRef } from 'react'
import { useImageLoader } from '../hooks/useImageLoader'
import { useLocale } from './locale-toggle'

const usePrefersReducedMotion = () => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handler = (e) => setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [])

  return prefersReducedMotion
}

const LazyImageWithFallback = forwardRef(({
  src,
  alt,
  className = '',
  containerClassName = '',
  placeholder: CustomPlaceholder,
  fallback: CustomFallback,
  placeholderSrc,
  errorText,
  maxRetries = 3,
  timeout = 30000,
  lazy = true,
  rootMargin = '100px 0px',
  aspectRatio,
  objectFit = 'cover',
  showProgress = false,
  onLoad,
  onError,
  blurUp = true,
  blurDuration = 400,
  ...imgProps
}, forwardedRef) => {
  const { t } = useLocale()
  const prefersReducedMotion = usePrefersReducedMotion()
  const [isReady, setIsReady] = useState(false)
  const [placeholderDone, setPlaceholderDone] = useState(false)
  const imgElementRef = useRef(null)

  const {
    progress,
    errorMessage,
    isLoading,
    isSuccess,
    isError,
    isOffline,
    retry,
    elementRef,
  } = useImageLoader(src, {
    maxRetries,
    timeout,
    lazy,
    rootMargin,
  })

  const enableBlurUp = blurUp && placeholderSrc && !prefersReducedMotion
  const effectiveDuration = prefersReducedMotion ? 0 : blurDuration
  // 占位层比主图晚一点开始淡出，交叉过渡期间不会露出底色
  const placeholderDelay = effectiveDuration > 0 ? 100 : 0

  useEffect(() => {
    if (!isSuccess) {
      setIsReady(false)
    }
  }, [isSuccess])

  // 主图渐显结束后再卸载占位层，保证淡出动画完整播放
  useEffect(() => {
    if (!isReady) {
      setPlaceholderDone(false)
      return
    }
    const timer = setTimeout(
      () => setPlaceholderDone(true),
      effectiveDuration + placeholderDelay + 50
    )
    return () => clearTimeout(timer)
  }, [isReady, effectiveDuration, placeholderDelay])

  const handleRetry = () => {
    setIsReady(false)
    retry()
  }

  const containerStyle = aspectRatio
    ? { aspectRatio, position: 'relative' }
    : { position: 'relative' }

  const handleImageLoad = async () => {
    const img = imgElementRef.current
    if (img && typeof img.decode === 'function') {
      try {
        await img.decode()
      } catch {
        // decode() 失败不影响展示，直接沿用 onload 时机
      }
    }
    setIsReady(true)
    onLoad?.()
  }

  const showPlaceholder = !isError && !isOffline && (!isReady || !placeholderDone)

  const placeholderStyle = {
    opacity: isReady ? 0 : 1,
    transition: effectiveDuration > 0
      ? `opacity ${effectiveDuration}ms var(--ease-apple) ${placeholderDelay}ms`
      : 'none',
  }

  const renderPlaceholder = () => {
    if (CustomPlaceholder) {
      return (
        <div className="absolute inset-0" style={placeholderStyle} aria-hidden>
          <CustomPlaceholder />
        </div>
      )
    }

    if (enableBlurUp) {
      return (
        <div
          className={`absolute inset-0 w-full h-full rounded-[6px] overflow-hidden ${className}`}
          style={placeholderStyle}
          aria-hidden
        >
          <img
            src={placeholderSrc}
            alt=""
            draggable={false}
            className="w-full h-full object-cover"
            style={{
              filter: 'blur(20px) saturate(1.15)',
              transform: 'scale(1.1)',
            }}
          />
        </div>
      )
    }

    return (
      <div
        className={`absolute inset-0 skeleton w-full h-full rounded-[6px] ${className}`}
        style={placeholderStyle}
        aria-hidden
      />
    )
  }

  const renderError = () => {
    if (CustomFallback) {
      return <CustomFallback error={errorMessage} onRetry={handleRetry} />
    }

    const message = errorText || errorMessage
      || (isOffline ? t('placeholder.offlineMessage') : t('placeholder.errorMessage'))

    // 与 ImagePlaceholder / FeatureScreenshotFrame 同族：6px 圆角、apple-line 描边、
    // card-strong 玻璃底（backdrop blur）与 shadow-md
    return (
      <div
        className={`relative w-full h-full min-h-[120px] rounded-[6px] border border-[color:var(--apple-line)] bg-[color:var(--apple-card-strong)] backdrop-blur-2xl flex items-center justify-center overflow-hidden [box-shadow:var(--apple-shadow-md)] ${className}`}
        style={aspectRatio ? { aspectRatio } : undefined}
        role="img"
        aria-label={message}
      >
        <div
          className="absolute inset-0 opacity-80"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 30% 20%, var(--apple-blue-soft), transparent 55%), radial-gradient(ellipse 70% 50% at 80% 80%, rgba(191, 90, 242, 0.08), transparent 50%)',
          }}
          aria-hidden
        />
        <div className="z-10 flex flex-col items-center gap-3 px-6 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[color:var(--apple-surface-elevated)] border border-[color:var(--apple-line)] [box-shadow:var(--apple-shadow-sm)]">
            {isOffline ? (
              <svg className="w-5 h-5 text-[color:var(--apple-muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.138m2.167 9.138l-2.829-2.829" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-[color:var(--apple-muted)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                <rect x="3" y="3" width="18" height="18" rx="4" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            )}
          </div>
          <span className="text-[12px] sm:text-[13px] text-[color:var(--apple-muted)] font-medium leading-snug max-w-[16rem]">
            {message}
          </span>
          {!isOffline && maxRetries > 0 && (
            <button
              type="button"
              onClick={handleRetry}
              className="focus-ring rounded-full bg-[color:var(--apple-blue-soft)] px-3.5 py-1.5 text-xs font-medium text-[color:var(--apple-blue)] hover:bg-[color:var(--apple-blue)] hover:text-white active:scale-95 transition-all motion-reduce:transition-none motion-reduce:active:scale-100"
            >
              {t('placeholder.retry')}
            </button>
          )}
          <span className="text-[10px] uppercase tracking-widest text-[color:var(--apple-muted)] opacity-50">
            {isOffline ? t('placeholder.status.offline') : t('placeholder.status.error')}
          </span>
        </div>
      </div>
    )
  }

  const renderImage = () => {
    if (!isSuccess) return null

    const imageStyle = {
      objectFit,
      opacity: isReady ? 1 : 0,
      transition: effectiveDuration > 0
        ? `opacity ${effectiveDuration}ms var(--ease-apple), filter ${effectiveDuration}ms var(--ease-apple), transform ${effectiveDuration}ms var(--ease-apple)`
        : 'none',
      willChange: isReady ? 'auto' : 'opacity, filter, transform',
      ...(enableBlurUp && {
        filter: isReady ? 'blur(0px)' : 'blur(12px)',
        transform: isReady ? 'scale(1)' : 'scale(1.03)',
      }),
    }

    return (
      <img
        ref={(el) => {
          imgElementRef.current = el
          if (typeof forwardedRef === 'function') {
            forwardedRef(el)
          } else if (forwardedRef) {
            forwardedRef.current = el
          }
        }}
        src={src}
        alt={alt}
        className={`absolute inset-0 w-full h-full rounded-[6px] ${className}`}
        style={imageStyle}
        onLoad={handleImageLoad}
        onError={() => {
          setIsReady(false)
          onError?.()
        }}
        {...imgProps}
      />
    )
  }

  return (
    <div
      ref={elementRef}
      className={`relative overflow-hidden ${containerClassName}`}
      style={containerStyle}
    >
      {showPlaceholder && renderPlaceholder()}
      {renderImage()}
      {(isError || isOffline) && renderError()}

      {showProgress && isLoading && (
        <div className="absolute inset-x-0 bottom-0 z-10 h-0.5 overflow-hidden bg-[color:var(--apple-line-strong)]">
          <div
            className="h-full bg-[color:var(--apple-blue)] transition-[width] duration-300 ease-out motion-reduce:transition-none"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  )
})

LazyImageWithFallback.displayName = 'LazyImageWithFallback'

export default LazyImageWithFallback
