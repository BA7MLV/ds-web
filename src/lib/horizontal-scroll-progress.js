export const clamp01 = (value) => Math.min(1, Math.max(0, value))

export const getScrollProgress = ({
  scrollY,
  containerTop,
  containerHeight,
  viewportHeight,
}) => {
  const scrollable = Math.max(1, containerHeight - viewportHeight)
  return clamp01((scrollY - containerTop) / scrollable)
}

export const getTranslateX = ({ progress, panelCount, viewportWidth }) => {
  const maxIndex = Math.max(0, panelCount - 1)
  // Use `0 - x` so progress=0 yields +0, not -0 (Object.is(-0, 0) === false).
  return 0 - clamp01(progress) * maxIndex * viewportWidth
}

export const getActiveIndex = ({ progress, panelCount }) => {
  const maxIndex = Math.max(0, panelCount - 1)
  return Math.round(clamp01(progress) * maxIndex)
}
