const clampToNonNegative = (value) => (value > 0 ? value : 0)

export const getNextTopNavHiddenState = ({
  previousY,
  currentY,
  hidden,
  threshold = 8,
  topOffset = 24,
}) => {
  const safePreviousY = clampToNonNegative(Number(previousY) || 0)
  const safeCurrentY = clampToNonNegative(Number(currentY) || 0)
  const delta = safeCurrentY - safePreviousY

  if (safeCurrentY <= topOffset) return false
  if (Math.abs(delta) < threshold) return hidden
  return delta > 0
}
