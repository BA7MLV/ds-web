const RESPONSIVE_IMAGE_WIDTHS = [640, 960, 1280, 1600]

const buildResponsiveSrcSet = (basePath, extension) =>
  RESPONSIVE_IMAGE_WIDTHS.map((width) => `${basePath}-${width}.${extension} ${width}w`).join(', ')

export const OptimizedImage = ({
  src,
  alt,
  className,
  loading = 'lazy',
  decoding = 'async',
  fetchPriority = 'auto',
  sizes = '(min-width: 1280px) 60vw, (min-width: 768px) 70vw, 92vw',
  draggable = 'false',
}) => {
  const isExamplePng = typeof src === 'string' && src.startsWith('/img/example/') && src.endsWith('.png')

  if (!isExamplePng) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        loading={loading}
        decoding={decoding}
        fetchPriority={fetchPriority}
        draggable={draggable}
      />
    )
  }

  const basePath = src.slice(0, -4)
  return (
    <picture>
      <source type="image/webp" srcSet={buildResponsiveSrcSet(basePath, 'webp')} sizes={sizes} />
      <source type="image/png" srcSet={buildResponsiveSrcSet(basePath, 'png')} sizes={sizes} />
      <img
        src={`${basePath}-960.png`}
        alt={alt}
        className={className}
        loading={loading}
        decoding={decoding}
        fetchPriority={fetchPriority}
        sizes={sizes}
        draggable={draggable}
      />
    </picture>
  )
}
