export const subscribeToMediaQueryChange = (mediaQueryList, handler) => {
  if (!mediaQueryList || typeof handler !== 'function') return () => {}
  if (typeof mediaQueryList.addEventListener !== 'function') return () => {}

  mediaQueryList.addEventListener('change', handler)
  return () => mediaQueryList.removeEventListener('change', handler)
}
