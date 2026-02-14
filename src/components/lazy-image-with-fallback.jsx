import { forwardRef, useState, useEffect, useRef } from 'react'
import { useImageLoader } from '../hooks/useImageLoader'

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
  const prefersReducedMotion = usePrefersReducedMotion()
  const [isReady, setIsReady] = useState(false)
  const imgElementRef = useRef(null)
  
  const {
    status,
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

  useEffect(() => {
    if (!isSuccess) {
      setIsReady(false)
    }
  }, [isSuccess])

  const handleRetry = () => {
    setIsReady(false)
    retry()
  }

  const containerStyle = aspectRatio 
    ? { aspectRatio, position: 'relative' } 
    : { position: 'relative' }

  const handleImageLoad = async () => {
    if (imgElementRef.current) {
      if ('decode' in imgElementRef.current) {
        try {
          await imgElementRef.current.decode()
        } catch {}
      }
    }
    
    setIsReady(true)
    onLoad?.()
  }

  const renderPlaceholder = () => {
    if (CustomPlaceholder) {
      return (
        <div 
          className="absolute inset-0 z-10"
          style={{
            opacity: isReady ? 0 : 1,
            transition: 'opacity 300ms ease-out',
          }}
        >
          <CustomPlaceholder />
        </div>
      )
    }

    return (
      <div 
        className={`absolute inset-0 z-10 skeleton w-full h-full rounded-[6px] ${className}`}
        style={{
          opacity: isReady ? 0 : 1,
          transition: 'opacity 300ms ease-out',
          ...containerStyle,
        }}
      >
        {showProgress && isLoading && (
          <div className="absolute inset-x-0 bottom-0 h-1 bg-[color:var(--apple-line-strong)]">
            <div 
              className="h-full bg-[color:var(--apple-blue)] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    )
  }

  const renderBlurPlaceholder = () => {
    if (!enableBlurUp) return renderPlaceholder()
    
    return (
      <div 
        className={`absolute inset-0 z-10 w-full h-full rounded-[6px] overflow-hidden ${className}`}
        style={{
          opacity: isReady ? 0 : 1,
          transition: `opacity ${blurDuration}ms ease-out`,
          ...containerStyle,
        }}
      >
        <img
          src={placeholderSrc}
          alt=""
          className="w-full h-full object-cover"
          style={{
            filter: 'blur(20px)',
            transform: 'scale(1.1)',
          }}
        />
        {showProgress && isLoading && (
          <div className="absolute inset-x-0 bottom-0 h-1 bg-[color:var(--apple-line-strong)] z-20">
            <div 
              className="h-full bg-[color:var(--apple-blue)] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    )
  }

  const renderError = () => {
    if (CustomFallback) {
      return <CustomFallback error={errorMessage} onRetry={handleRetry} />
    }

    return (
      <div 
        className={`w-full h-full min-h-[120px] rounded-[6px] bg-[color:var(--apple-card-strong)] border border-[color:var(--apple-line)] flex flex-col items-center justify-center gap-2 p-4 ${className}`}
        style={aspectRatio ? { aspectRatio } : {}}
      >
        {isOffline ? (
          <>
            <svg className="w-10 h-10 text-[color:var(--apple-muted)] opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.138m2.167 9.138l-2.829-2.829" />
            </svg>
            <span className="text-sm text-[color:var(--apple-muted)] text-center">
              {errorText || '网络已断开'}
            </span>
          </>
        ) : (
          <>
            <svg className="w-10 h-10 text-[color:var(--apple-muted)] opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <rect x="3" y="3" width="18" height="18" rx="3" strokeWidth={1.5} />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 15l-5-5L5 21" />
            </svg>
            <span className="text-sm text-[color:var(--apple-muted)] text-center">
              {errorText || '加载失败'}
            </span>
            {maxRetries > 0 && (
              <button
                onClick={handleRetry}
                className="mt-2 px-3 py-1.5 text-xs font-medium text-[color:var(--apple-blue)] hover:text-[color:var(--apple-blue-hover)] bg-[color:var(--apple-blue-bg)] hover:bg-[color:var(--apple-blue-bg-hover)] rounded-full transition-colors"
              >
                重新加载
              </button>
            )}
          </>
        )}
      </div>
    )
  }

  const renderImage = () => {
    if (!isSuccess) return null

    const transitionStyle = enableBlurUp 
      ? { 
          transition: `filter ${blurDuration}ms ease-out`,
          filter: isReady ? 'blur(0px)' : 'blur(10px)',
        }
      : {}

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
        className={`absolute inset-0 w-full h-full object-${objectFit} rounded-[6px] ${className}`}
        style={transitionStyle}
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
      {renderImage()}
      
      {(isLoading || status === 'idle') && (enableBlurUp ? renderBlurPlaceholder() : renderPlaceholder())}
      {(isError || isOffline) && renderError()}
      
      {isLoading && showProgress && !enableBlurUp && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[color:var(--apple-line-strong)] z-20">
          <div 
            className="h-full bg-[color:var(--apple-blue)] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  )
})

LazyImageWithFallback.displayName = 'LazyImageWithFallback'

export default LazyImageWithFallback
