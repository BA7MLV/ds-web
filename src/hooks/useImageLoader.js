import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * 图片加载状态管理 Hook
 * @param {string} src - 图片地址
 * @param {Object} options - 配置选项
 * @param {number} options.maxRetries - 最大重试次数 (默认: 3)
 * @param {number} options.baseDelay - 基础重试延迟 (默认: 2000ms)
 * @param {number} options.timeout - 加载超时时间 (默认: 30000ms)
 * @param {boolean} options.enabled - 是否启用加载 (默认: true)
 * @param {boolean} options.lazy - 是否懒加载 (默认: true)
 * @param {string} options.rootMargin - IntersectionObserver rootMargin (默认: '100px')
 * @returns {Object} 加载状态和控制器
 */
export const useImageLoader = (src, options = {}) => {
  const {
    maxRetries = 3,
    baseDelay = 2000,
    timeout = 30000,
    enabled = true,
    lazy = true,
    rootMargin = '100px 0px',
  } = options

  const [status, setStatus] = useState('idle') // idle | loading | success | error | offline
  const [retryCount, setRetryCount] = useState(0)
  const [progress, setProgress] = useState(0)
  const [errorMessage, setErrorMessage] = useState('')
  
  const timeoutRef = useRef(null)
  const imgRef = useRef(null)
  const abortControllerRef = useRef(null)
  const elementRef = useRef(null)
  const [isInViewport, setIsInViewport] = useState(!lazy)

  // 检测网络状态
  const getNetworkStatus = useCallback(() => {
    if (typeof navigator === 'undefined') return 'online'
    if (!navigator.onLine) return 'offline'
    // 检测慢网
    if ('connection' in navigator) {
      const connection = navigator.connection
      if (connection) {
        const { effectiveType, saveData } = connection
        if (saveData) return 'save-data'
        if (['2g', 'slow-2g'].includes(effectiveType)) return 'slow'
      }
    }
    return 'online'
  }, [])

  // 计算重试延迟（指数退避）
  const getRetryDelay = useCallback(() => {
    return baseDelay * Math.pow(2, retryCount)
  }, [retryCount, baseDelay])

  // 清除超时定时器
  const clearTimeoutRef = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  // 加载图片
  const loadImage = useCallback(() => {
    if (!src || !enabled || (!isInViewport && lazy)) {
      setStatus('idle')
      return
    }

    const networkStatus = getNetworkStatus()
    if (networkStatus === 'offline') {
      setStatus('offline')
      setErrorMessage('当前处于离线状态')
      return
    }

    setStatus('loading')
    setProgress(0)
    setErrorMessage('')

    // 取消之前的请求
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    // 设置超时
    clearTimeoutRef()
    timeoutRef.current = setTimeout(() => {
      if (status === 'loading') {
        setStatus('error')
        setErrorMessage('加载超时，请检查网络连接')
        setProgress(100)
      }
    }, timeout)

    const img = new Image()
    imgRef.current = img

    // 模拟进度（真实场景可通过 XHR 获取真实进度）
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev
        return prev + Math.random() * 15
      })
    }, 500)

    img.onload = () => {
      clearTimeoutRef()
      clearInterval(progressInterval)
      setProgress(100)
      setStatus('success')
      setRetryCount(0)
    }

    img.onerror = () => {
      clearTimeoutRef()
      clearInterval(progressInterval)
      
      if (retryCount < maxRetries) {
        // 自动重试
        const delay = getRetryDelay()
        setErrorMessage(`加载失败，${delay / 1000}秒后自动重试 (${retryCount + 1}/${maxRetries})`)
        
        timeoutRef.current = setTimeout(() => {
          setRetryCount(prev => prev + 1)
        }, delay)
      } else {
        setStatus('error')
        setErrorMessage(`加载失败，已重试 ${maxRetries} 次`)
        setProgress(100)
      }
    }

    img.src = src

    return () => {
      clearTimeoutRef()
      clearInterval(progressInterval)
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [src, enabled, lazy, isInViewport, retryCount, maxRetries, timeout, getNetworkStatus, getRetryDelay, clearTimeoutRef, status])

  // 监听重试计数变化，触发重载
  useEffect(() => {
    if (retryCount > 0 && enabled) {
      loadImage()
    }
  }, [retryCount, enabled, loadImage])

  // 初始加载
  useEffect(() => {
    if (enabled && isInViewport) {
      loadImage()
    }
    return () => {
      clearTimeoutRef()
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [src, enabled, isInViewport, loadImage, clearTimeoutRef])

  // 懒加载：使用 IntersectionObserver
  useEffect(() => {
    if (!lazy || typeof window === 'undefined') {
      setIsInViewport(true)
      return
    }

    const element = elementRef.current
    if (!element) return

    if (typeof IntersectionObserver === 'undefined') {
      setIsInViewport(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInViewport(true)
          observer.unobserve(element)
        }
      },
      { rootMargin, threshold: 0.01 }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [lazy, rootMargin])

  // 监听网络状态变化
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleOnline = () => {
      if (status === 'offline' && enabled) {
        setRetryCount(0)
        loadImage()
      }
    }

    const handleOffline = () => {
      if (status === 'loading' || status === 'success') {
        setStatus('offline')
        setErrorMessage('网络连接已断开')
      }
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [status, enabled, loadImage])

  // 手动重试
  const retry = useCallback(() => {
    setRetryCount(0)
    setStatus('idle')
    loadImage()
  }, [loadImage])

  // 取消加载
  const cancel = useCallback(() => {
    clearTimeoutRef()
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    setStatus('idle')
  }, [clearTimeoutRef])

  return {
    status,
    progress: Math.min(Math.round(progress), 100),
    retryCount,
    errorMessage,
    isLoading: status === 'loading',
    isSuccess: status === 'success',
    isError: status === 'error',
    isOffline: status === 'offline',
    retry,
    cancel,
    elementRef,
  }
}

export default useImageLoader
