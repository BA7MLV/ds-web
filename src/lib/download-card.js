import { cn } from './utils.js'

const baseCardClassName =
  'rounded-[1.5rem] bg-[color:var(--apple-card)] border border-[color:var(--apple-line)] p-[1.5rem] sm:p-[1.75rem] shadow-[var(--apple-shadow-sm)] transition-[border-color,box-shadow] duration-300 ease-[var(--ease-apple)]'

const recommendedCardClassName =
  'relative border-[1.5px] border-[color:var(--apple-accent-line)] shadow-[var(--apple-shadow-md)]'

export const getDownloadCardClassName = (isRecommended = false) =>
  cn(baseCardClassName, isRecommended && recommendedCardClassName)
