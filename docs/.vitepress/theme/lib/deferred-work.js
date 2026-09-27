/**
 * 非关键任务等主文档 load、两次绘制机会及空闲片段后再启动。
 * 返回取消函数，供页面切换清理；后台标签页保持等待。
 */
export const afterPageLoad = (callback, { delay = 0, timeout = 1500 } = {}) => {
  let cancelled = false
  let firstFrame = 0
  let secondFrame = 0
  let timer = 0
  let idle = 0

  const run = () => {
    if (cancelled) return
    if (document.hidden) {
      document.addEventListener('visibilitychange', onVisible)
      return
    }
    callback()
  }

  const queueIdle = () => {
    if (cancelled) return
    if (typeof window.requestIdleCallback === 'function') {
      idle = window.requestIdleCallback(run, { timeout })
    } else {
      timer = window.setTimeout(run, 50)
    }
  }

  const afterPaint = () => {
    if (cancelled) return
    firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => {
        timer = window.setTimeout(queueIdle, delay)
      })
    })
  }

  const onVisible = () => {
    if (document.hidden) return
    document.removeEventListener('visibilitychange', onVisible)
    afterPaint()
  }

  if (document.readyState === 'complete') afterPaint()
  else window.addEventListener('load', afterPaint, { once: true })

  return () => {
    cancelled = true
    window.removeEventListener('load', afterPaint)
    document.removeEventListener('visibilitychange', onVisible)
    cancelAnimationFrame(firstFrame)
    cancelAnimationFrame(secondFrame)
    clearTimeout(timer)
    if (idle && typeof window.cancelIdleCallback === 'function') {
      window.cancelIdleCallback(idle)
    }
  }
}

/** 接近视口才允许预热；旧浏览器用轻量滚动检测，避免直接加载所有资源。 */
export const observeNearViewport = (element, callback, margin = 300) => {
  if (!element) return () => {}

  if (typeof IntersectionObserver !== 'undefined') {
    let active = true
    const observer = new IntersectionObserver(([entry]) => {
      if (active && entry) callback(entry.isIntersecting)
    }, { rootMargin: `${margin}px 0px` })
    observer.observe(element)
    return () => {
      active = false
      observer.disconnect()
    }
  }

  let frame = 0
  const check = () => {
    frame = 0
    const bounds = element.getBoundingClientRect()
    callback(bounds.top < window.innerHeight + margin && bounds.bottom > -margin)
  }
  const onScroll = () => {
    if (!frame) frame = requestAnimationFrame(check)
  }
  frame = requestAnimationFrame(check)
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onScroll)
  return () => {
    cancelAnimationFrame(frame)
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('resize', onScroll)
  }
}
