import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { HorizontalFeatureScroll } from './components/horizontal-feature-scroll'
import { LearningLoop } from './components/learning-loop'
import { LocaleToggle, useLocale } from './components/locale-toggle'
import { LocalFirstSection } from './components/local-first-section'
import { MobileNavMenu } from './components/mobile-nav-menu'
import { Reveal } from './components/reveal'
import { ScatterSection } from './components/scatter-section'
import { ThemeToggle, useTheme } from './components/theme-toggle'
import sharedDownloads from './data/downloads.json'
import {
  detectSystemProfile,
  getPreferredPlatformTab,
  getRecommendedCardId
} from './lib/download-recommendation'
import { getImageRequestHints } from './lib/image-loading'
import { subscribeToMediaQueryChange } from './lib/media-query-subscribe'
import { clamp, easeOutCubic, useScrollY, useViewportHeight } from './lib/scrub-progress'
import { buildWebsiteDownloads } from './lib/website-downloads'

const logo = '/logo_mono_svg.svg'
const logoFooter = '/logo-r.svg'
const logoFooterDark = '/logo-r-dark.svg'
const SUBTEXT_FADE_DURATION_MS = 200
const AUTOPLAY_INTERVAL_MS = 4000
const RESPONSIVE_IMAGE_WIDTHS = [640, 960, 1280, 1600]

const buildHash = import.meta.env.VITE_BUILD_HASH || 'dev'

const getViewportBucket = () => {
  if (typeof window === 'undefined') return 'unknown'
  const width = window.innerWidth || 0
  if (width >= 1280) return 'xl'
  if (width >= 1024) return 'lg'
  if (width >= 640) return 'sm'
  return 'xs'
}

const trackUiEvent = (name, payload = {}) => {
  if (typeof window === 'undefined') return
  const detail = {
    name,
    ts: Date.now(),
    viewport: getViewportBucket(),
    ...payload,
  }
  window.dispatchEvent(new CustomEvent('ds:analytics', { detail }))
  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({ event: name, ...detail })
  }
}

const getIsDownloadFromLocation = () => {
  if (typeof window === 'undefined') return false
  const params = new URLSearchParams(window.location.search)
  return params.get('view') === 'download'
}

const buildResponsiveSrcSet = (basePath, extension) =>
  RESPONSIVE_IMAGE_WIDTHS.map((width) => `${basePath}-${width}.${extension} ${width}w`).join(', ')

const OptimizedImage = ({
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


const useResponsiveMotion = () => {
  const [settings, setSettings] = useState({ motionScale: 1, isCompact: false })

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const compactQuery = window.matchMedia('(max-width: 768px)')

    const update = () => {
      const isCompact = compactQuery.matches
      const reduceMotion = motionQuery.matches
      const motionScale = reduceMotion ? 0 : isCompact ? 0.45 : 1
      setSettings({ motionScale, isCompact })
    }

    update()

    const attach = (query) => {
      return subscribeToMediaQueryChange(query, update)
    }

    const detachMotion = attach(motionQuery)
    const detachCompact = attach(compactQuery)
    return () => {
      detachMotion()
      detachCompact()
    }
  }, [])

  return settings
}

const getPolicyContent = (t) => ({
  about: {
    title: t('policy.about.title', 'About DeepStudent'),
    description: t('policy.about.description', ''),
    sections: [
      {
        title: t('policy.about.section1.title', ''),
        body: t('policy.about.section1.body', ''),
        points: [
          t('policy.about.section1.point1', ''),
          t('policy.about.section1.point2', ''),
          t('policy.about.section1.point3', ''),
        ],
      },
      {
        title: t('policy.about.section2.title', ''),
        body: t('policy.about.section2.body', ''),
        points: [
          t('policy.about.section2.point1', ''),
          t('policy.about.section2.point2', ''),
        ],
      },
      {
        title: t('policy.about.section3.title', ''),
        body: t('policy.about.section3.body', ''),
      },
    ],
    footer: t('policy.about.footer', ''),
  },
  privacy: {
    title: t('policy.privacy.title', 'Privacy Policy'),
    description: t('policy.privacy.description', ''),
    sections: [
      {
        title: t('policy.privacy.section1.title', ''),
        body: t('policy.privacy.section1.body', ''),
        points: [
          t('policy.privacy.section1.point1', ''),
          t('policy.privacy.section1.point2', ''),
          t('policy.privacy.section1.point3', ''),
        ].filter(Boolean),
      },
      {
        title: t('policy.privacy.section2.title', ''),
        body: t('policy.privacy.section2.body', ''),
        points: [
          t('policy.privacy.section2.point1', ''),
          t('policy.privacy.section2.point2', ''),
          t('policy.privacy.section2.point3', ''),
          t('policy.privacy.section2.point4', ''),
          t('policy.privacy.section2.point5', ''),
        ].filter(Boolean),
      },
      {
        title: t('policy.privacy.section3.title', ''),
        body: t('policy.privacy.section3.body', ''),
        points: [
          t('policy.privacy.section3.point1', ''),
          t('policy.privacy.section3.point2', ''),
          t('policy.privacy.section3.point3', ''),
        ].filter(Boolean),
      },
      {
        title: t('policy.privacy.section4.title', ''),
        body: t('policy.privacy.section4.body', ''),
        points: [
          t('policy.privacy.section4.point1', ''),
          t('policy.privacy.section4.point2', ''),
          t('policy.privacy.section4.point3', ''),
          t('policy.privacy.section4.point4', ''),
        ].filter(Boolean),
      },
      {
        title: t('policy.privacy.section5.title', ''),
        body: t('policy.privacy.section5.body', ''),
        points: [
          t('policy.privacy.section5.point1', ''),
          t('policy.privacy.section5.point2', ''),
          t('policy.privacy.section5.point3', ''),
        ].filter(Boolean),
      },
      {
        title: t('policy.privacy.section6.title', ''),
        body: t('policy.privacy.section6.body', ''),
        points: [
          t('policy.privacy.section6.point1', ''),
        ].filter(Boolean),
      },
      {
        title: t('policy.privacy.section7.title', ''),
        body: t('policy.privacy.section7.body', ''),
        points: [
          t('policy.privacy.section7.point1', ''),
        ].filter(Boolean),
      },
      {
        title: t('policy.privacy.section8.title', ''),
        body: t('policy.privacy.section8.body', ''),
        points: [
          t('policy.privacy.section8.point1', ''),
          t('policy.privacy.section8.point2', ''),
        ].filter(Boolean),
      },
    ],
    footer: t('policy.privacy.footer', ''),
  },
  terms: {
    title: t('policy.terms.title', 'Terms of Use'),
    description: t('policy.terms.description', ''),
    sections: [
      {
        title: t('policy.terms.section1.title', ''),
        body: t('policy.terms.section1.body', ''),
        points: [t('policy.terms.section1.point1', '')].filter(Boolean),
      },
      {
        title: t('policy.terms.section2.title', ''),
        body: t('policy.terms.section2.body', ''),
        points: [t('policy.terms.section2.point1', '')].filter(Boolean),
      },
      {
        title: t('policy.terms.section3.title', ''),
        body: t('policy.terms.section3.body', ''),
        points: [t('policy.terms.section3.point1', '')].filter(Boolean),
      },
    ],
    footer: t('policy.terms.footer', ''),
  },
})

// 架构图内联 SVG 图标（复制自主项目 ResourceIcons.tsx 的 Notion 风格调色盘）
const archPalette = {
  green:  { bg: '#EDF3EC', fg: '#4F9779', border: '#C6E3C6' },
  orange: { bg: '#FBECDD', fg: '#CC782F', border: '#F5CCAA' },
  purple: { bg: '#F6F3F9', fg: '#9A6DD7', border: '#D9CBE4' },
  pink:   { bg: '#FBF2F5', fg: '#D65C9D', border: '#ECD0DE' },
  blue:   { bg: '#E7F3F8', fg: '#2B59C3', border: '#B8D6E8' },
  yellow: { bg: '#FBF3DB', fg: '#CF9232', border: '#F9E2AF' },
}

const ArchNoteIcon = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <path d="M10 4C8.895 4 8 4.895 8 6V42C8 43.105 8.895 44 10 44H38C39.105 44 40 43.105 40 42V14L30 4H10Z" fill={archPalette.green.bg} stroke={archPalette.green.border} strokeWidth="1"/>
    <path d="M30 4L40 14H31C30.448 14 30 13.552 30 13V4Z" fill="black" fillOpacity="0.05"/>
    <rect x="14" y="20" width="16" height="2" rx="1" fill={archPalette.green.fg}/>
    <rect x="14" y="26" width="20" height="2" rx="1" fill={archPalette.green.fg} opacity="0.6"/>
    <rect x="14" y="32" width="18" height="2" rx="1" fill={archPalette.green.fg} opacity="0.6"/>
    <rect x="14" y="38" width="12" height="2" rx="1" fill={archPalette.green.fg} opacity="0.4"/>
  </svg>
)

const ArchTextbookIcon = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <rect x="8" y="6" width="28" height="36" rx="2" fill={archPalette.orange.bg} stroke={archPalette.orange.fg} strokeWidth="1.5"/>
    <rect x="8" y="6" width="5" height="36" rx="2" fill={archPalette.orange.fg} fillOpacity="0.15"/>
    <line x1="11" y1="6" x2="11" y2="42" stroke={archPalette.orange.fg} strokeWidth="1" strokeOpacity="0.25"/>
    <path d="M17 20H30" stroke={archPalette.orange.fg} strokeWidth="2" strokeLinecap="round"/>
    <path d="M17 26H26" stroke={archPalette.orange.fg} strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
    <path d="M27 4V14L29.5 12L32 14V4" fill={archPalette.orange.fg}/>
  </svg>
)

const ArchExamIcon = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <g style={{ transformOrigin: '8px 44px', transform: 'rotate(8deg)' }}>
      <path d="M8 6C6.895 6 6 6.895 6 8V40C6 41.105 6.895 42 7 42H31C32.105 42 33 41.105 33 40V12L25 6H8Z" fill={archPalette.purple.bg} stroke={archPalette.purple.fg} strokeWidth="1" opacity="0.5"/>
    </g>
    <g style={{ transformOrigin: '8px 44px', transform: 'rotate(-8deg)' }}>
      <path d="M8 6C6.895 6 6 6.895 6 8V40C6 41.105 6.895 42 7 42H31C32.105 42 33 41.105 33 40V12L25 6H8Z" fill="#FFFFFF" stroke={archPalette.purple.fg} strokeWidth="1.5"/>
      <path d="M25 6V12H33L25 6Z" fill={archPalette.purple.bg} stroke={archPalette.purple.fg} strokeWidth="1.5" strokeLinejoin="round"/>
      <circle cx="12" cy="20" r="1.5" stroke={archPalette.purple.fg} strokeWidth="1.2" fill="none"/>
      <rect x="16" y="19" width="10" height="2" rx="1" fill={archPalette.purple.fg} opacity="0.6"/>
      <circle cx="12" cy="27" r="1.5" fill={archPalette.purple.fg}/>
      <rect x="16" y="26" width="8" height="2" rx="1" fill={archPalette.purple.fg} opacity="0.8"/>
      <circle cx="12" cy="34" r="1.5" stroke={archPalette.purple.fg} strokeWidth="1.2" fill="none"/>
      <rect x="16" y="33" width="12" height="2" rx="1" fill={archPalette.purple.fg} opacity="0.6"/>
    </g>
  </svg>
)

const ArchEssayIcon = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <path d="M10 4C8.895 4 8 4.895 8 6V42C8 43.105 8.895 44 10 44H38C39.105 44 40 43.105 40 42V14L30 4H10Z" fill={archPalette.pink.bg} stroke={archPalette.pink.border} strokeWidth="1"/>
    <path d="M30 4L40 14H31C30.448 14 30 13.552 30 13V4Z" fill="black" fillOpacity="0.05"/>
    <text x="24" y="32" fontSize="22" fontWeight="bold" fontFamily="serif" fontStyle="italic" fill={archPalette.pink.fg} textAnchor="middle">Aa</text>
  </svg>
)

const ArchTranslationIcon = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <rect x="20" y="6" width="20" height="24" rx="3" fill={archPalette.blue.bg} stroke={archPalette.blue.fg} strokeWidth="1.5" strokeOpacity="0.6"/>
    <text x="30" y="22" fontSize="14" fontWeight="600" fill={archPalette.blue.fg} textAnchor="middle">A</text>
    <rect x="8" y="18" width="20" height="24" rx="3" fill="#FFFFFF" stroke={archPalette.blue.fg} strokeWidth="1.5"/>
    <text x="18" y="34" fontSize="14" fontWeight="bold" fill={archPalette.blue.fg} textAnchor="middle">文</text>
  </svg>
)

const ArchMindmapIcon = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <path d="M10 4C8.895 4 8 4.895 8 6V42C8 43.105 8.895 44 10 44H38C39.105 44 40 43.105 40 42V14L30 4H10Z" fill={archPalette.green.bg} stroke={archPalette.green.border} strokeWidth="1"/>
    <path d="M30 4L40 14H31C30.448 14 30 13.552 30 13V4Z" fill="black" fillOpacity="0.05"/>
    <circle cx="18" cy="26" r="3" fill={archPalette.green.fg}/>
    <path d="M21 26C26 26 26 18 31 18" stroke={archPalette.green.fg} strokeWidth="1.5" fill="none" opacity="0.6"/>
    <path d="M21 26C26 26 26 26 31 26" stroke={archPalette.green.fg} strokeWidth="1.5" fill="none" opacity="0.6"/>
    <path d="M21 26C26 26 26 34 31 34" stroke={archPalette.green.fg} strokeWidth="1.5" fill="none" opacity="0.6"/>
    <circle cx="31" cy="18" r="2.5" fill={archPalette.green.fg} opacity="0.8"/>
    <circle cx="31" cy="26" r="2.5" fill={archPalette.green.fg} opacity="0.8"/>
    <circle cx="31" cy="34" r="2.5" fill={archPalette.green.fg} opacity="0.8"/>
  </svg>
)

const ArchMemoryIcon = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" fill={archPalette.purple.bg} stroke={archPalette.purple.border} strokeWidth="1.2"/>
    <path d="M7 7L17 9" stroke={archPalette.purple.fg} strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.3"/>
    <path d="M7 7L17 17" stroke={archPalette.purple.fg} strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.3"/>
    <path d="M7 12L17 9" stroke={archPalette.purple.fg} strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.3"/>
    <path d="M7 12L17 17" stroke={archPalette.purple.fg} strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.3"/>
    <circle cx="7" cy="7" r="2.2" fill={archPalette.purple.fg} stroke={archPalette.purple.border} strokeWidth="0.6"/>
    <circle cx="7" cy="12" r="2.2" fill={archPalette.purple.fg} stroke={archPalette.purple.border} strokeWidth="0.6"/>
    <circle cx="7" cy="17" r="2.2" fill={archPalette.purple.fg} stroke={archPalette.purple.border} strokeWidth="0.6"/>
    <circle cx="17" cy="9" r="1.8" fill={archPalette.purple.fg} fillOpacity="0.65" stroke={archPalette.purple.border} strokeWidth="0.6"/>
    <circle cx="17" cy="17" r="1.8" fill={archPalette.purple.fg} fillOpacity="0.65" stroke={archPalette.purple.border} strokeWidth="0.6"/>
  </svg>
)


// 手绘椭圆圈：套住标题关键词，加载时自己画出来
const HandCircle = ({ className = '', delay = 0 }) => (
  <svg className={className} viewBox="0 0 240 100" fill="none" preserveAspectRatio="none" aria-hidden="true">
    <path
      d="M16 54 C 26 16, 196 4, 222 34 C 244 60, 176 92, 96 92 C 40 92, 4 78, 18 42"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      pathLength="1"
      className="hand-draw"
      style={{ animationDelay: `${delay}s` }}
    />
  </svg>
)

// 手绘弯箭头（向上指，用于注释指向 CTA）
const HandArrowUp = ({ className = '', delay = 0 }) => (
  <svg className={className} viewBox="0 0 48 56" fill="none" aria-hidden="true">
    <path
      d="M28 52 C 32 38, 30 22, 23 10"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      pathLength="1"
      className="hand-draw"
      style={{ animationDelay: `${delay}s` }}
    />
    <path
      d="M13 18 L 22 7 L 33 19"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      pathLength="1"
      className="hand-draw"
      style={{ animationDelay: `${delay + 0.35}s` }}
    />
  </svg>
)

// 连接线箭头 SVG（水平方向，带流动动画）
let _hArrowId = 0
const FlowArrow = ({ label, sublabel, direction = 'right', className = '' }) => {
  const uid = useMemo(() => `harrow-${++_hArrowId}`, [])
  const endId = `${uid}-end`
  const startId = `${uid}-start`
  return (
    <div className={`flex flex-col items-center gap-1.5 relative group ${className}`}>
      <svg width="100%" height="24" viewBox="0 0 120 24" fill="none" className="overflow-visible transition-opacity duration-300 group-hover:opacity-80">
        <defs>
          <marker id={endId} viewBox="0 0 6 6" refX="5" refY="3" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M0 0L6 3L0 6Z" fill="var(--apple-muted)"/>
          </marker>
          {direction === 'both' && (
            <marker id={startId} viewBox="0 0 6 6" refX="1" refY="3" markerWidth="5" markerHeight="5" orient="auto">
              <path d="M6 0L0 3L6 6Z" fill="var(--apple-muted)"/>
            </marker>
          )}
        </defs>
        {direction === 'both' ? (
          <line x1="6" y1="12" x2="114" y2="12" stroke="var(--apple-muted)" strokeWidth="1.5" strokeDasharray="4 3" markerEnd={`url(#${endId})`} markerStart={`url(#${startId})`}>
            <animate attributeName="stroke-dashoffset" from="0" to="-14" dur="2s" repeatCount="indefinite"/>
          </line>
        ) : (
          <line x1="4" y1="12" x2="116" y2="12" stroke="var(--apple-muted)" strokeWidth="1.5" strokeDasharray="4 3" markerEnd={`url(#${endId})`}>
            <animate attributeName="stroke-dashoffset" from="0" to="-14" dur="2s" repeatCount="indefinite"/>
          </line>
        )}
      </svg>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none">
        <span className="text-[11px] sm:text-[12px] font-medium text-[color:var(--apple-ink)] bg-[color:var(--apple-card)] px-2.5 py-0.5 rounded-md border border-[color:var(--apple-line)] shadow-sm whitespace-nowrap leading-tight">{label}</span>
        {sublabel && <span className="text-[9px] text-[color:var(--apple-muted)] bg-[color:var(--apple-card)] px-1.5 py-0.5 mt-0.5 rounded-md border border-[color:var(--apple-line)]/50 whitespace-nowrap leading-tight shadow-sm">{sublabel}</span>}
      </div>
    </div>
  )
}

// 垂直连接线箭头（移动端）
let _vArrowId = 0
const FlowArrowVertical = ({ label, sublabel, direction = 'down' }) => {
  const uid = useMemo(() => `varrow-${++_vArrowId}`, [])
  const endId = `${uid}-end`
  const startId = `${uid}-start`
  return (
    <div className="flex items-center justify-center py-2 relative group w-[60px] h-[48px]">
      <svg width="24" height="100%" viewBox="0 0 24 48" fill="none" className="absolute inset-0 mx-auto transition-opacity duration-300 group-hover:opacity-80">
        <defs>
          <marker id={endId} viewBox="0 0 6 6" refX="3" refY="6" markerWidth="5" markerHeight="5">
            <path d="M0 0L3 6L6 0Z" fill="var(--apple-muted)"/>
          </marker>
          {direction === 'both' && (
            <marker id={startId} viewBox="0 0 6 6" refX="3" refY="0" markerWidth="5" markerHeight="5">
              <path d="M0 6L3 0L6 6Z" fill="var(--apple-muted)"/>
            </marker>
          )}
        </defs>
        {direction === 'both' ? (
          <line x1="12" y1="6" x2="12" y2="42" stroke="var(--apple-muted)" strokeWidth="1.5" strokeDasharray="4 3" markerEnd={`url(#${endId})`} markerStart={`url(#${startId})`}>
            <animate attributeName="stroke-dashoffset" from="0" to="-14" dur="2s" repeatCount="indefinite"/>
          </line>
        ) : (
          <line x1="12" y1="4" x2="12" y2="44" stroke="var(--apple-muted)" strokeWidth="1.5" strokeDasharray="4 3" markerEnd={`url(#${endId})`}>
            <animate attributeName="stroke-dashoffset" from="0" to="-14" dur="2s" repeatCount="indefinite"/>
          </line>
        )}
      </svg>
      <div className="relative z-10 flex flex-col items-center bg-[color:var(--apple-card)] px-2 py-1 rounded-md border border-[color:var(--apple-line)] shadow-sm pointer-events-none">
        <span className="text-[11px] font-medium text-[color:var(--apple-ink)] whitespace-nowrap leading-tight">{label}</span>
        {sublabel && <span className="text-[9px] text-[color:var(--apple-muted)] bg-[color:var(--apple-card)] px-1 py-0.5 mt-0.5 rounded border border-[color:var(--apple-line)]/50 whitespace-nowrap leading-tight shadow-sm">{sublabel}</span>}
      </div>
    </div>
  )
}

// 架构卡片容器
const ArchCard = ({ title, desc, children, className = '' }) => (
  <div
    className={`rounded-2xl border border-[color:var(--apple-line)] bg-[color:var(--apple-card-strong)] p-5 sm:p-6 transition-[border-color,box-shadow] duration-200 hover:border-[color:var(--apple-line-strong)] hover:shadow-[var(--apple-shadow-md)] ${className}`}
  >
    <div className="flex items-baseline justify-between gap-3">
      <h3 className="text-[15px] font-semibold text-[color:var(--apple-ink)] tracking-tight">{title}</h3>
      <span className="text-[11px] text-[color:var(--apple-muted)] text-right">{desc}</span>
    </div>
    {children}
  </div>
)

// 架构图：Chat V2 ↔ Learning Hub / Skills → VFS 的闭环拓扑
const ArchitectureDiagram = ({ motionScale = 1 }) => {
  const { t } = useLocale()

  const chatFeatures = [
    t('arch.chat.feat.parallel', '并行对比'),
    t('arch.chat.feat.cot', '思维链'),
    t('arch.chat.feat.multimodal', '多模态'),
    t('arch.chat.feat.attach', '附件自动 OCR'),
    t('arch.chat.feat.mcp', 'MCP 工具协议'),
    t('arch.chat.feat.rag', 'RAG 检索增强'),
    t('arch.chat.feat.session', '会话分组'),
    t('arch.chat.feat.latex', 'LaTeX 渲染'),
    t('arch.chat.feat.provider', '多供应商适配'),
  ]

  const resourceTypes = [
    { Icon: ArchNoteIcon, label: t('arch.note', '笔记') },
    { Icon: ArchTextbookIcon, label: t('arch.textbook', '教材') },
    { Icon: ArchExamIcon, label: t('arch.exam', '题库') },
    { Icon: ArchEssayIcon, label: t('arch.essay', '作文') },
    { Icon: ArchTranslationIcon, label: t('arch.translation', '翻译') },
    { Icon: ArchMindmapIcon, label: t('arch.mindmap', '导图') },
    { Icon: ArchMemoryIcon, label: t('arch.memory', '记忆') },
  ]

  const skillTools = [
    t('arch.skill.search', '资源/网络/论文搜索'),
    t('arch.skill.resource', '资源管理'),
    t('arch.skill.qbank', '题库操作'),
    t('arch.skill.mindmap', '导图生成'),
    t('arch.skill.memory', '记忆管理'),
    t('arch.skill.office', 'Office 套件'),
    t('arch.skill.anki', 'Anki 对话制卡'),
    t('arch.skill.interact', '多种交互技能'),
  ]

  const chatCard = (
    <ArchCard title="Chat V2" desc={t('arch.chat.desc', '智能对话')} className="h-full">
      <div className="mt-4 flex flex-wrap gap-1.5">
        {chatFeatures.map((feat) => (
          <span
            key={feat}
            className="text-[11px] leading-tight text-[color:var(--apple-muted)] px-2.5 py-1 rounded-full border border-[color:var(--apple-line)] bg-[color:var(--apple-card)] whitespace-nowrap transition-colors duration-300 hover:text-[color:var(--apple-ink)] hover:border-[color:var(--apple-line-strong)]"
          >
            {feat}
          </span>
        ))}
      </div>
    </ArchCard>
  )

  const hubCard = (
    <ArchCard title="Learning Hub" desc={t('arch.hub.desc', '学习资源管理器')} className="h-full">
      <div className="mt-4 grid grid-cols-4 gap-x-2 gap-y-4 justify-items-center">
        {resourceTypes.map((item) => (
          <div key={item.label} className="flex flex-col items-center gap-1 group/item">
            <div className="rounded-lg transition-transform duration-300 group-hover/item:-translate-y-0.5">
              <item.Icon size={26} />
            </div>
            <span className="text-[10px] text-[color:var(--apple-muted)] leading-tight whitespace-nowrap transition-colors duration-300 group-hover/item:text-[color:var(--apple-ink)]">{item.label}</span>
          </div>
        ))}
      </div>
    </ArchCard>
  )

  const skillsCard = (
    <ArchCard title="Skills" desc={t('arch.skills.subtitle', '技能编排 · 按需加载')} className="h-full">
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-2">
        {skillTools.map((tool) => (
          <div key={tool} className="flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-[color:var(--apple-muted)] opacity-60 shrink-0" />
            <span className="text-[12px] text-[color:var(--apple-muted)] leading-tight">{tool}</span>
          </div>
        ))}
      </div>
    </ArchCard>
  )

  const vfsCard = (
    <ArchCard title="VFS" desc={t('arch.vfs.desc', '虚拟文件系统 · 学习数据')} className="h-full">
      <div className="mt-4 flex items-center gap-2">
        <span className="text-[11px] font-medium text-[color:var(--apple-ink)] opacity-80">SQLite</span>
        <span className="text-[10px] text-[color:var(--apple-muted)] opacity-40">+</span>
        <span className="text-[11px] font-medium text-[color:var(--apple-ink)] opacity-80">LanceDB</span>
        <span className="text-[10px] text-[color:var(--apple-muted)] opacity-40">+</span>
        <span className="text-[11px] font-medium text-[color:var(--apple-ink)] opacity-80">Blob</span>
        <span className="ml-auto text-[10px] text-[color:var(--apple-muted)] opacity-60">{t('arch.storage', '全部数据本地存储')}</span>
      </div>
      <div className="mt-3 pt-3 border-t border-[color:var(--apple-line)]/60 flex flex-col gap-1.5">
        <span className="text-[12px] font-medium text-[color:var(--apple-ink)] opacity-80">{t('arch.vfs.ocr', '多引擎级联 OCR')}</span>
        <div className="flex items-baseline gap-2">
          <span className="text-[12px] font-medium text-[color:var(--apple-ink)] opacity-80">{t('arch.vfs.vector', '多维度向量引擎')}</span>
          <span className="text-[10px] text-[color:var(--apple-muted)] opacity-60">
            {t('arch.vfs.vector.text', '文本嵌入')} · {t('arch.vfs.vector.cross', '跨维度检索')}
          </span>
        </div>
      </div>
    </ArchCard>
  )

  return (
    <section className="px-4 sm:px-6 py-20 sm:py-28 bg-[color:var(--apple-band)]">
      <div className="max-w-6xl mx-auto">
        <Reveal motionScale={motionScale} className="text-center max-w-2xl mx-auto">
          <h2 className="text-[1.75rem] sm:text-[2.5rem] font-semibold text-[color:var(--apple-ink)] tracking-[-0.02em] leading-[1.1]">
            {t('stats.title', 'AI 原生的学习闭环')}
          </h2>
          <p className="mt-3 text-[15px] sm:text-[17px] text-[color:var(--apple-muted)] leading-relaxed">
            {t('stats.subtitle', '从对话入口到数据底座，前后端围绕学习闭环协同设计')}
          </p>
        </Reveal>

        {/* 桌面端：2×2 拓扑 + 连接线 */}
        <Reveal motionScale={motionScale} y={36} className="hidden md:block mt-12 sm:mt-16">
          <div className="max-w-[62rem] mx-auto grid grid-cols-[1fr_auto_1fr] items-center gap-y-2">
            {chatCard}
            <div className="flex items-center justify-center px-4">
              <FlowArrow label={t('arch.arrow.ref', '引用资源')} direction="both" />
            </div>
            {hubCard}

            <div className="flex justify-center">
              <FlowArrowVertical label={t('arch.arrow.invoke', '调用')} direction="down" />
            </div>
            <div />
            <div className="flex justify-center">
              <FlowArrowVertical label={t('arch.arrow.rw', '读写')} sublabel="DSTU" direction="both" />
            </div>

            {skillsCard}
            <div className="flex items-center justify-center px-4">
              <FlowArrow label={t('arch.arrow.tools', '工具调用')} sublabel="RAG" direction="right" />
            </div>
            {vfsCard}
          </div>
        </Reveal>

        {/* 移动端：垂直堆叠 */}
        <Reveal motionScale={motionScale} y={36} className="flex md:hidden flex-col items-stretch mt-10 max-w-[26rem] mx-auto">
          {chatCard}
          <FlowArrowVertical label={t('arch.arrow.invoke', '调用')} direction="down" />
          {skillsCard}
          <FlowArrowVertical label={t('arch.arrow.tools', '工具调用')} sublabel="RAG" direction="down" />
          {vfsCard}
          <FlowArrowVertical label={t('arch.arrow.rw', '读写')} sublabel="DSTU" direction="both" />
          {hubCard}
        </Reveal>
      </div>
    </section>
  )
}

const App = () => {
  const [activePolicy, setActivePolicy] = useState(null)
  const [isDownloadPage, setIsDownloadPage] = useState(() => getIsDownloadFromLocation())
  const { t, ready, locale } = useLocale()
  const { motionScale } = useResponsiveMotion()
  const homeScrollRef = useRef(0)
  const downloadScrollRef = useRef(0)

  // 随语言切换同步文档标题与 SEO 描述
  useEffect(() => {
    if (typeof document === 'undefined' || !ready) return
    const title = t('head.title', 'DeepStudent')
    const description = t('head.description', '')
    document.title = title
    const setMeta = (selector, attr, value) => {
      const el = document.querySelector(selector)
      if (el) el.setAttribute(attr, value)
    }
    setMeta('meta[name="description"]', 'content', description)
    setMeta('meta[property="og:title"]', 'content', title)
    setMeta('meta[property="og:description"]', 'content', description)
    setMeta('meta[name="twitter:title"]', 'content', title)
    setMeta('meta[name="twitter:description"]', 'content', description)
  }, [t, ready, locale])

  const featureScrollPanels = useMemo(
    () => [
      {
        id: 'feature-agent',
        title: t('feature.agent.title'),
        description: t('feature.agent.desc'),
        imageSrc: '/img/example/软件主页图.png',
        imageAlt: t('feature.agent.title'),
      },
      {
        id: 'feature-anki',
        title: t('feature.anki_full.title'),
        description: t('feature.anki_full.desc'),
        imageSrc: '/img/example/anki-制卡2.png',
        imageAlt: t('feature.anki_full.title'),
      },
      {
        id: 'feature-notes-memory',
        title: t('feature.notes_memory.title'),
        description: t('feature.notes_memory.desc'),
        imageSrc: '/img/example/学习资源管理器.png',
        imageAlt: t('feature.notes_memory.title'),
      },
    ],
    [t]
  )
  const syncHistoryWithView = useCallback(
    (nextIsDownload, { replace = false } = {}) => {
      if (typeof window === 'undefined') return
      const url = new URL(window.location.href)
      const current = url.searchParams.get('view') === 'download'
      if (nextIsDownload) {
        url.searchParams.set('view', 'download')
      } else {
        url.searchParams.delete('view')
      }
      const method = replace || current === nextIsDownload ? 'replaceState' : 'pushState'
      window.history[method]({}, '', url)
    },
    []
  )

  const handlePolicyOpen = (type) => setActivePolicy(type)
  const handlePolicyClose = () => setActivePolicy(null)

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const handlePopState = () => {
      setIsDownloadPage(getIsDownloadFromLocation())
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    syncHistoryWithView(isDownloadPage, { replace: true })
  }, [isDownloadPage, syncHistoryWithView])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const targetScroll = isDownloadPage ? downloadScrollRef.current : homeScrollRef.current
    window.requestAnimationFrame(() => {
      window.scrollTo({ top: targetScroll, left: 0, behavior: 'auto' })
    })
  }, [isDownloadPage])

  const handleDownloadOpen = () => {
    homeScrollRef.current = window.scrollY || 0
    setIsDownloadPage(true)
    syncHistoryWithView(true)
  }
  const handleDownloadClose = () => {
    downloadScrollRef.current = window.scrollY || 0
    setIsDownloadPage(false)
    syncHistoryWithView(false)
  }

  if (!ready) {
    return (
      <div className="min-h-screen min-h-[100svh] bg-transparent text-[color:var(--apple-ink)] font-sans">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24">
          <div className="h-8 w-40 rounded-full bg-[color:var(--apple-card)] border border-[color:var(--apple-line)]" />
          <div className="mt-8 h-12 w-2/3 rounded-2xl bg-[color:var(--apple-card)] border border-[color:var(--apple-line)]" />
          <div className="mt-4 h-6 w-1/2 rounded-xl bg-[color:var(--apple-card)] border border-[color:var(--apple-line)]" />
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen min-h-[100svh] bg-transparent text-[color:var(--apple-ink)] font-sans">
        {isDownloadPage ? (
        <DownloadPage onBack={handleDownloadClose} />
      ) : (
        <>
          <TopNav onDownload={handleDownloadOpen} />
          <HeroSection onDownload={handleDownloadOpen} motionScale={motionScale} />

          <ScatterSection />

          <LearningLoop />

          <section id="features" className="scroll-mt-24">
            <HorizontalFeatureScroll panels={featureScrollPanels} />
          </section>

          {/* 架构图（技术视角，后置） */}
          <ArchitectureDiagram motionScale={motionScale} />

          <FreeModelsBand motionScale={motionScale} />

          <LocalFirstSection motionScale={motionScale} />

          <FaqSection motionScale={motionScale} onOpenPolicy={handlePolicyOpen} />
          <CtaBanner onDownload={handleDownloadOpen} motionScale={motionScale} />
        </>
      )}

    <Footer onOpenPolicy={handlePolicyOpen} />
    <PolicyModal type={activePolicy} onClose={handlePolicyClose} />
  </div>
  </>
)
}

const TopNav = ({ onDownload = () => {} }) => {
  const { t } = useLocale()
  const scrollY = useScrollY()
  const scrolled = scrollY > 8
  return (
    <nav
      className={`sticky top-0 z-nav pt-safe bg-white/75 backdrop-blur-[20px] backdrop-saturate-[180%] dark:bg-[color:var(--apple-nav-bg)] border-b transition-[border-color] duration-300 ${
        scrolled ? 'border-[color:var(--apple-line)]' : 'border-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8">
        <a href="/" className="flex items-center gap-2.5 font-semibold text-slate-900 transition-opacity hover:opacity-80 dark:text-[color:var(--apple-ink)]">
          <img src={logo} alt="" className="h-5 w-auto sm:h-6 dark:invert" loading="lazy" decoding="async" />
          <span className="text-[15px] tracking-tight">DeepStudent</span>
        </a>
        <div className="flex items-center gap-4">
          {/* Desktop navigation links */}
          <div className="hidden items-center gap-3 text-[11px] font-normal text-[color:var(--apple-muted)] lg:flex lg:gap-4 lg:text-[12px]">
            <a href="#features" className="focus-ring transition-colors hover:text-slate-900 dark:hover:text-[color:var(--apple-ink)]">
              {t('nav.features')}
            </a>
            <a href="#qa" className="focus-ring transition-colors hover:text-slate-900 dark:hover:text-[color:var(--apple-ink)]">
              {t('nav.qa')}
            </a>
            <a
              href="/docs/"
              className="focus-ring transition-colors hover:text-slate-900 dark:hover:text-[color:var(--apple-ink)]"
            >
              {t('nav.docs')}
            </a>
            <a
              href="https://github.com/helixnow/deep-student"
              className="focus-ring inline-flex items-center gap-1 transition-colors hover:text-slate-900 dark:hover:text-[color:var(--apple-ink)]"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              GitHub
            </a>
            <a
              href="#download"
              onClick={(e) => { e.preventDefault(); onDownload(); }}
              className="focus-ring text-[color:var(--apple-blue)] hover:text-[color:var(--apple-blue-hover)] transition-colors font-normal"
            >
              {t('nav.download')}
            </a>
          </div>
          {/* Mobile hamburger menu */}
          <MobileNavMenu onDownload={onDownload} />
        </div>
      </div>
    </nav>
  )
}

const heroPreviewItems = [
  { id: 'chat', labelKey: 'hero.preview.chat', subtextKey: 'hero.preview.subtext.chat' },
  { id: 'skills', labelKey: 'hero.preview.skills', subtextKey: 'hero.preview.subtext.skills' },
  { id: 'knowledge', labelKey: 'hero.preview.knowledge', subtextKey: 'hero.preview.subtext.knowledge' },
  { id: 'providers', labelKey: 'hero.preview.providers', subtextKey: 'hero.preview.subtext.providers' },
]

const HeroSection = ({ onDownload = () => {}, motionScale = 1 }) => {
  const { t, isChinese } = useLocale()
  const shouldAnimate = motionScale > 0
  const [heroShown, setHeroShown] = useState(false)
  const [activePreviewId, setActivePreviewId] = useState(heroPreviewItems[0].id)
  const activePreviewItem = heroPreviewItems.find(item => item.id === activePreviewId) || heroPreviewItems[0]
  const activePreviewIndex = Math.max(0, heroPreviewItems.findIndex(item => item.id === activePreviewId))
  const [isSubtextVisible, setIsSubtextVisible] = useState(true)
  const [isSubtextAnimating, setIsSubtextAnimating] = useState(false)
  const subtextSwapTimerRef = useRef(null)
  const subtextResetTimerRef = useRef(null)
  const scrollY = useScrollY(shouldAnimate)
  const viewportHeight = useViewportHeight(shouldAnimate)

  // texts reveal: render lines in their resting state first, then flip
  // .is-shown on the next frame so the staggered entrance actually plays.
  useEffect(() => {
    if (!shouldAnimate) return
    const raf = window.requestAnimationFrame(() => setHeroShown(true))
    return () => window.cancelAnimationFrame(raf)
  }, [shouldAnimate])

  useEffect(() => {
    return () => {
      if (subtextSwapTimerRef.current) window.clearTimeout(subtextSwapTimerRef.current)
      if (subtextResetTimerRef.current) window.clearTimeout(subtextResetTimerRef.current)
    }
  }, [])

  // 截图随滚动从 0.94 放大到 1.0 —— 滚动回退时按同一曲线缩小
  const zoomProgress = shouldAnimate
    ? easeOutCubic(clamp(scrollY / Math.max(viewportHeight * 0.55, 1), 0, 1))
    : 1
  const frameScale = 0.94 + 0.06 * zoomProgress
  const frameY = (1 - zoomProgress) * 28

  const handleDownloadClick = () => {
    trackUiEvent('hero_cta_primary_click', { location: 'hero' })
    onDownload()
  }

  const swapSubtextTo = useCallback(
    (nextId) => {
      if (nextId === activePreviewId) return
      if (!shouldAnimate) {
        setActivePreviewId(nextId)
        return
      }

      if (subtextSwapTimerRef.current) window.clearTimeout(subtextSwapTimerRef.current)
      if (subtextResetTimerRef.current) window.clearTimeout(subtextResetTimerRef.current)

      setIsSubtextAnimating(true)
      setIsSubtextVisible(false)

      subtextSwapTimerRef.current = window.setTimeout(() => {
        setActivePreviewId(nextId)
        setIsSubtextVisible(true)
        subtextSwapTimerRef.current = null
      }, SUBTEXT_FADE_DURATION_MS)

      subtextResetTimerRef.current = window.setTimeout(() => {
        setIsSubtextAnimating(false)
        subtextResetTimerRef.current = null
      }, SUBTEXT_FADE_DURATION_MS * 2)
    },
    [activePreviewId, shouldAnimate],
  )

  const handleSubtextClick = () => {
    if (isSubtextAnimating) return

    const currentIndex = heroPreviewItems.findIndex(item => item.id === activePreviewId)
    const nextIndex = (currentIndex + 1) % heroPreviewItems.length
    swapSubtextTo(heroPreviewItems[nextIndex].id)
  }

  useEffect(() => {
    if (!shouldAnimate) return
    const timer = window.setTimeout(() => {
      const currentIndex = heroPreviewItems.findIndex(item => item.id === activePreviewId)
      const nextIndex = (currentIndex + 1) % heroPreviewItems.length
      swapSubtextTo(heroPreviewItems[nextIndex].id)
    }, AUTOPLAY_INTERVAL_MS)
    return () => window.clearTimeout(timer)
  }, [activePreviewId, shouldAnimate, swapSubtextTo])

  const subtextA11yStatus = isChinese
    ? `当前选中：${t(activePreviewItem.labelKey)}`
    : `Currently selected: ${t(activePreviewItem.labelKey)}`

  return (
    <header className="relative pt-16 sm:pt-24">
      <div className="max-w-6xl mx-auto px-5 sm:px-6 lg:px-8">
        <div className={`grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:items-center lg:gap-14 t-stagger ${shouldAnimate && heroShown ? 'is-shown' : ''}`}>
          <div className="w-full max-w-xl text-left lg:max-w-2xl">
        <h1
          className={`text-[2.6rem] leading-[1.06] sm:text-[3.5rem] lg:text-[4rem] xl:text-[4.5rem] 2xl:text-[5rem] font-semibold tracking-[-0.025em] text-[color:var(--apple-ink)] ${
            shouldAnimate ? 't-stagger-line t-stagger-line--1' : ''
          }`}
        >
          {t('hero.headline.top')}
          <br />
          <span className="relative inline-block">
            <span className={isChinese ? 'inline-block whitespace-nowrap' : 'whitespace-normal break-words text-balance'}>
              {t('hero.headline.bottom')}
            </span>
            {shouldAnimate && (
              <HandCircle
                className="absolute -inset-x-[0.32em] -inset-y-[0.12em] w-[calc(100%+0.64em)] h-[calc(100%+0.24em)] text-[color:var(--apple-ink)] opacity-55 pointer-events-none"
                delay={0.85}
              />
            )}
          </span>
        </h1>

        <div
          className={`mt-6 flex flex-col items-start ${
            shouldAnimate ? 't-stagger-line t-stagger-line--2' : ''
          }`}
        >
          <button
            type="button"
            onClick={handleSubtextClick}
            disabled={isSubtextAnimating}
            aria-label={`${t(activePreviewItem.subtextKey)}。${subtextA11yStatus}`}
            className="focus-ring cursor-pointer rounded-lg px-2 py-1 text-left transition-opacity duration-150 hover:opacity-85 disabled:cursor-default disabled:opacity-100"
          >
            <span className="block text-[13px] font-semibold text-[color:var(--apple-ink)]">
              {t(activePreviewItem.labelKey)}
            </span>
            <span
              className={`mt-1 block min-h-[3.2em] sm:min-h-[2.6em] text-[15px] sm:text-[17px] leading-relaxed text-[color:var(--apple-muted)] whitespace-pre-line break-words text-pretty transition-opacity duration-200 ease-out motion-reduce:transition-none ${
                isSubtextVisible ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {t(activePreviewItem.subtextKey)}
            </span>
            <span className="sr-only">{subtextA11yStatus}</span>
          </button>

          <div className="mt-2 flex items-center gap-1">
            {heroPreviewItems.map((item, index) => {
              const active = index === activePreviewIndex
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => swapSubtextTo(item.id)}
                  aria-label={t(item.labelKey)}
                  aria-current={active}
                  className={`h-0.5 rounded-full transition-all duration-300 ease-apple ${
                    active
                      ? 'w-6 bg-[color:var(--apple-ink)]'
                      : 'w-2 bg-[color:var(--apple-line-strong)] hover:bg-[color:var(--apple-muted)]'
                  }`}
                />
              )
            })}
          </div>
        </div>

        <div
          className={`mt-8 flex flex-col items-start gap-y-4 sm:flex-row sm:items-center gap-x-8 ${
            shouldAnimate ? 't-stagger-line t-stagger-line--3' : ''
          }`}
        >
          <button
            type="button"
            onClick={handleDownloadClick}
            className="t-learn inline-flex items-center justify-center gap-1.5 px-7 py-3 bg-[color:var(--apple-ink)] text-[color:var(--apple-surface)] rounded-full font-medium text-[15px] whitespace-nowrap transition-opacity duration-150 hover:opacity-90"
          >
            <span className="whitespace-nowrap">{t('hero.cta.download')}</span>
            <span className="t-learn-chevron">
              <svg
                className="w-4 h-4 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path className="t-learn-arm t-learn-arm-top" d="M6 4L10 8" />
                <path className="t-learn-arm t-learn-arm-bot" d="M10 8L6 12" />
              </svg>
            </span>
          </button>
          <a
            href="/docs/start"
            className="group inline-flex items-center gap-1 text-[15px] font-medium text-[color:var(--apple-blue)] hover:text-[color:var(--apple-blue-hover)] transition-colors"
          >
            <span className="whitespace-nowrap">{t('hero.cta.quickstart')}</span>
            <svg
              className="w-3.5 h-3.5 shrink-0 transition-transform duration-150 ease-out motion-reduce:transform-none group-hover:translate-x-0.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </a>
        </div>

        <div
          className={`mt-4 flex items-center justify-start gap-1.5 ${
            shouldAnimate ? 't-stagger-line t-stagger-line--6' : ''
          }`}
        >
          <HandArrowUp className="w-5 h-6 text-[color:var(--apple-muted)] opacity-70 shrink-0" delay={1.15} />
          <span className="font-handwritten text-[1.4rem] leading-none text-[color:var(--apple-muted)] -rotate-2 select-none">
            {t('hero.note', '无需注册，下载即用')}
          </span>
        </div>

        <a
          href="https://github.com/helixnow/deep-student"
          target="_blank"
          rel="noopener noreferrer"
          className={`mt-5 inline-flex items-center gap-2 text-[13px] text-[color:var(--apple-muted)] hover:text-[color:var(--apple-ink)] transition-colors ${
            shouldAnimate ? 't-stagger-line t-stagger-line--4' : ''
          }`}
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          <span className="whitespace-nowrap">{t('hero.github', '免费开源，欢迎 Star / Fork / PR')}</span>
        </a>
          </div>

          <div className={shouldAnimate ? 't-stagger-line t-stagger-line--5' : ''}>
          <div
            style={{
              transform: `translate3d(0, ${frameY.toFixed(2)}px, 0) scale(${frameScale.toFixed(4)})`,
              transformOrigin: 'center top',
              willChange: shouldAnimate ? 'transform' : 'auto',
            }}
          >
            <div>
              <OptimizedImage
                src="/img/example/软件主页图.png"
                alt="DeepStudent 主页面预览"
                className="block w-full h-auto object-cover"
                loading={getImageRequestHints({ role: 'hero' }).loading}
                decoding="async"
                fetchPriority={getImageRequestHints({ role: 'hero' }).fetchPriority}
                sizes="(min-width: 1280px) 45vw, 96vw"
                draggable="false"
              />
            </div>
          </div>
          </div>
        </div>
      </div>
    </header>
  )
}


const freeModels = [
  { id: 'qwen3-8b', label: 'Qwen3-8B' },
  { id: 'glm-4.1v', label: 'GLM-4.1V' },
  { id: 'bge-m3', label: 'BGE-M3' },
]

const FreeModelLogo = ({ id, className = 'h-4 w-4' }) => {
  switch (id) {
    case 'qwen3-8b':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="M15.75 15.75L20 20" />
        </svg>
      )
    case 'glm-4.1v':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z" />
          <circle cx="12" cy="12" r="2.5" />
        </svg>
      )
    case 'bge-m3':
      return (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
          aria-hidden="true"
        >
          <circle cx="7" cy="12" r="2" />
          <circle cx="17" cy="7" r="2" />
          <circle cx="17" cy="17" r="2" />
          <path d="M8.7 11.2L15.3 8.2" />
          <path d="M8.7 12.8L15.3 15.8" />
        </svg>
      )
    default:
      return null
  }
}

// 免费模型横幅：紧凑的单卡片，承接支柱条与功能模块
const FreeModelsBand = ({ motionScale = 1 }) => {
  const { t } = useLocale()

  const siliconflowLogo = '/siliconflow_Chinese%20and%20English%20LOGO.svg'
  const siliconflowLogoDark = '/siliconflow_Chinese%20and%20English%20LOGO_dark.svg'

  return (
    <section className="px-4 sm:px-6 pb-20 sm:pb-28">
      <Reveal
        motionScale={motionScale}
        className="max-w-5xl mx-auto rounded-2xl border border-[color:var(--apple-line)] bg-[color:var(--apple-card)] px-6 py-10 sm:px-12 text-center shadow-[var(--apple-shadow-sm)]"
      >
        <h2 className="text-[1.375rem] sm:text-[1.75rem] font-semibold text-[color:var(--apple-ink)] tracking-tight">
          {t('freeModels.title', '免费模型，开箱即用')}
        </h2>
        <p className="mt-2 text-[14px] sm:text-[15px] text-[color:var(--apple-muted)]">
          {t('freeModels.desc', '硅基流动免费提供的 AI 模型，无需 API Key，下载即用。')}
        </p>

        <div className="mt-6 flex flex-wrap gap-2 justify-center">
          {freeModels.map((model) => (
            <span
              key={model.id}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[color:var(--apple-card-strong)] border border-[color:var(--apple-line)] text-[12px] font-medium text-[color:var(--apple-ink)]"
            >
              <FreeModelLogo id={model.id} />
              <span>{model.label}</span>
            </span>
          ))}
        </div>

        <div className="mt-6 flex flex-col items-center gap-2 text-[11px] text-[color:var(--apple-muted)]">
          <div>{t('freeModels.poweredBy', 'Powered by SiliconFlow')}</div>
          <div className="flex items-center justify-center">
            <img
              src={siliconflowLogo}
              alt="SiliconFlow"
              className="h-7 sm:h-8 w-auto dark:hidden"
              loading="lazy"
              draggable="false"
            />
            <img
              src={siliconflowLogoDark}
              alt="SiliconFlow"
              className="h-7 sm:h-8 w-auto hidden dark:block"
              loading="lazy"
              draggable="false"
            />
          </div>
        </div>
      </Reveal>
    </section>
  )
}

// 结尾 CTA：Apple 式的大字收尾
const CtaBanner = ({ onDownload = () => {}, motionScale = 1 }) => {
  const { t } = useLocale()

  const handleClick = () => {
    trackUiEvent('hero_cta_primary_click', { location: 'cta_banner' })
    onDownload()
  }

  return (
    <section className="px-4 sm:px-6 py-24 sm:py-32 text-center">
      <Reveal motionScale={motionScale} className="max-w-3xl mx-auto">
        <span className="font-handwritten text-[1.5rem] leading-none text-[color:var(--apple-muted)] -rotate-2 inline-block select-none">
          {t('cta.note', '现在就开始')}
        </span>
        <h2 className="mt-3 text-[2.25rem] sm:text-[3.5rem] font-semibold text-[color:var(--apple-ink)] tracking-[-0.02em] leading-[1.08]">
          {t('cta.title', '开始你的学习闭环')}
        </h2>
        <p className="mt-4 text-[15px] sm:text-[17px] text-[color:var(--apple-muted)]">
          {t('cta.desc', '免费下载，数据留在本地。')}
        </p>
        <button
          type="button"
          onClick={handleClick}
          className="mt-9 inline-flex items-center justify-center gap-1.5 px-8 py-3.5 bg-[color:var(--apple-ink)] text-[color:var(--apple-surface)] rounded-full font-medium text-[15px] whitespace-nowrap transition-opacity duration-150 hover:opacity-90"
        >
          {t('hero.cta.download')}
        </button>
      </Reveal>
    </section>
  )
}

const normalizeReleaseVersion = (rawVersion) => {
  const value = typeof rawVersion === 'string' ? rawVersion.trim() : ''
  if (!value) return 'v--'
  return value.toLowerCase().startsWith('v') ? `v${value.slice(1)}` : `v${value}`
}

const formatReleaseDate = (rawDate, locale) => {
  if (!rawDate) return '--'

  const parsed = new Date(rawDate)
  if (Number.isNaN(parsed.getTime())) return '--'

  const year = parsed.getUTCFullYear()
  const month = parsed.getUTCMonth() + 1
  const day = parsed.getUTCDate()

  if (locale === 'en') {
    return `${month}/${day}/${year}`
  }
  return `${year}/${month}/${day}`
}

const DownloadPage = ({ onBack = () => {} }) => {
  const { t, locale } = useLocale()
  const platformDownloads = buildWebsiteDownloads(sharedDownloads, {
    macArmChannel: t('download.channel.macArm', 'Apple 芯片 · aarch64'),
    macX64Channel: t('download.channel.macX64', 'Intel 芯片 · x64'),
    windowsChannel: t('download.channel.windowsX64', 'Windows · x64'),
    androidChannel: t('download.channel.androidArm64', 'Android · arm64'),
    fallbackLabel: t('download.allReleases', '全部版本'),
    unknownSize: '--',
    macArmRequirements: t('download.requirements.macos', 'macOS 13+（Apple Silicon）'),
    macX64Requirements: t('download.requirements.macos', 'macOS 13+（Intel）'),
    windowsRequirements: t('download.requirements.windows', 'Windows 11 / 10 22H2+'),
    androidRequirements: t('download.requirements.android', 'Android 10+（ARM64）'),
    macArmDescription: t('download.description.macos', '适用于 Apple Silicon 设备的 DMG 安装包'),
    macX64Description: t('download.description.macos', '适用于 Intel 设备的 DMG 安装包'),
    windowsDescription: t('download.description.windows'),
    androidDescription: t('download.description.android', '适用于 Android 设备的 APK 安装包'),
    macArmCta: t('download.downloadDmg', '下载 DMG'),
    macX64Cta: t('download.downloadDmg', '下载 DMG'),
    windowsCta: t('download.downloadExe', '下载 EXE'),
    androidCta: t('download.downloadApk', '下载 APK'),
    fallbackRequirements: t('download.requirements.all', '请根据设备选择对应安装包'),
    fallbackDescription: t('download.description.all', '当前未获取到分平台安装包，请前往 Releases 查看全部资产'),
    fallbackCta: t('download.openReleases', '打开 GitHub Releases')
  })

  const tabs = [
    { id: 'macOS', label: 'macOS' },
    { id: 'Windows', label: 'Windows' },
    { id: 'Android', label: 'Android' }
  ]

  const [activeTab, setActiveTab] = useState('macOS')
  const [recommendedId, setRecommendedId] = useState(null)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const profile = detectSystemProfile(window.navigator)
    const preferredTab = getPreferredPlatformTab(profile)
    const preferredCardId = getRecommendedCardId(profile)

    if (preferredTab) setActiveTab(preferredTab)
    setRecommendedId(preferredCardId)
  }, [])

  const filteredDownloads = platformDownloads.filter((item) => item.platform === activeTab)
  const releaseVersion = normalizeReleaseVersion(sharedDownloads?.version)
  const updatedAtRaw = sharedDownloads?.generatedAt || sharedDownloads?.publishedAt
  const releaseUpdatedAt = formatReleaseDate(updatedAtRaw, locale)
  return (
    <div className="relative min-h-screen min-h-[100svh] bg-transparent pb-[var(--space-page-bottom)]">
      <div className="sticky top-0 z-40 border-b border-[color:var(--apple-line)] bg-[color:var(--apple-nav-bg)] backdrop-blur-xl pt-safe">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3">
          <button
            type="button"
            onClick={onBack}
            className="focus-ring inline-flex items-center gap-2 text-sm font-medium text-[color:var(--apple-muted)] hover:text-[color:var(--apple-ink)] active:text-[color:var(--apple-ink)] transition-colors"
          >
← {t('download.backHome')}
          </button>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <span className="text-xs text-[color:var(--apple-muted)]">{t('nav.download')}</span>
          </div>
        </div>
      </div>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-[var(--space-section-top)] text-center">
        <h1 className="text-[2.2rem] sm:text-[3.2rem] font-semibold text-[color:var(--apple-ink)] tracking-[-0.02em] font-display">
          {t('download.title', 'DeepStudent {version}', { version: releaseVersion })}
        </h1>
        <p className="mt-3 text-sm text-[color:var(--apple-muted)] max-w-md mx-auto">
          {t('download.subtitle', '更新时间：{updatedAt}', { updatedAt: releaseUpdatedAt })}
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-[var(--space-section-top)]">
        <h2 className="text-[1.3rem] sm:text-[1.9rem] font-semibold text-[color:var(--apple-ink)] tracking-[-0.02em] font-display">
          {t('download.selectPlatform')}
        </h2>

        <div className="mt-4 inline-flex items-center rounded-full border border-[color:var(--apple-line)] bg-[color:var(--apple-card)] p-1">
          {tabs.map((tab) => {
            const active = tab.id === activeTab
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`focus-ring rounded-full px-4 py-2 text-xs font-medium transition-colors ${
                  active
                    ? 'bg-[color:var(--apple-btn-primary-bg)] text-[color:var(--apple-btn-primary-text)]'
                    : 'text-[color:var(--apple-muted)] hover:text-[color:var(--apple-ink)]'
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {filteredDownloads.map((platform) => (
              <article
                key={platform.id}
                className="rounded-[1.5rem] bg-[color:var(--apple-card)] border border-[color:var(--apple-line)] p-[1.5rem] sm:p-[1.75rem] shadow-[var(--apple-shadow-sm)]"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-base font-semibold text-[color:var(--apple-ink)]">{platform.platform}</p>
                    {platform.id === recommendedId ? (
                      <span className="rounded-full bg-[color:var(--apple-btn-secondary-bg)] px-2 py-0.5 text-[10px] font-semibold text-[color:var(--apple-ink)]">
                        {t('download.recommended', '推荐')}
                      </span>
                    ) : null}
                  </div>
                  <p className="text-xs text-[color:var(--apple-muted)] break-words">{platform.channel}</p>
                </div>

                <p className="mt-3 text-sm text-[color:var(--apple-muted)] leading-relaxed break-words text-pretty">{platform.description}</p>

                <div className="mt-4 text-xs text-[color:var(--apple-muted)] flex flex-wrap gap-x-3 gap-y-1">
                  <span>{t('download.version')} {platform.version}</span>
                  <span>{t('download.size')} {platform.size}</span>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <a
                    href={platform.ctaHref}
                    className="focus-ring inline-flex items-center justify-center gap-2 rounded-full bg-[color:var(--apple-btn-primary-bg)] px-4 py-2 text-xs font-medium text-[color:var(--apple-btn-primary-text)] leading-snug text-center whitespace-normal shadow-[var(--apple-shadow-sm)] transition-colors duration-150 hover:bg-[color:var(--apple-btn-primary-bg-hover)]"
                  >
{platform.ctaLabel}
                  </a>
                  {platform.mirrorHref ? (
                    <a
                      href={platform.mirrorHref}
                      className="focus-ring inline-flex items-center justify-center gap-1.5 rounded-full border border-[color:var(--apple-line)] bg-[color:var(--apple-btn-secondary-bg)] px-4 py-2 text-xs font-medium text-[color:var(--apple-ink)] leading-snug text-center whitespace-normal transition-colors duration-150 hover:bg-[color:var(--apple-btn-secondary-bg-hover,var(--apple-card))]"
                    >
                      {t('download.mirrorDownload', '镜像下载')}
                    </a>
                  ) : null}
                </div>
              </article>
          ))}
        </div>

      </section>
    </div>
  )
}

const FaqSection = ({ motionScale = 1, onOpenPolicy = () => {} }) => {
  const { t } = useLocale()

  const faqItems = [
    {
      id: 'open-source',
      question: t('faq.openSource.q'),
      answer: t('faq.openSource.a'),
      linkHref: 'https://github.com/helixnow/deep-student',
      linkLabel: t('faq.openSource.link'),
    },
    {
      id: 'privacy',
      question: t('faq.privacy.q'),
      answer: t('faq.privacy.a'),
      actionLabel: t('faq.privacy.action'),
      onAction: () => onOpenPolicy('privacy'),
    },
    {
      id: 'macos-quarantine',
      question: t('faq.macosQuarantine.q'),
      answer: t('faq.macosQuarantine.a'),
      code: t('faq.macosQuarantine.code', 'sudo xattr -r -d com.apple.quarantine <App Path>'),
      linkHref: '/docs/guide/A-Q',
      linkLabel: t('faq.macosQuarantine.link'),
    },
    {
      id: 'windows-preview',
      question: t('faq.windowsPreview.q'),
      answer: t('faq.windowsPreview.a'),
    },
  ]

  return (
    <section
      id="qa"
      className="px-4 sm:px-6 max-w-4xl mx-auto py-20 sm:py-28 scroll-mt-24"
    >
      <Reveal motionScale={motionScale} className="text-center">
        <h2 className="text-[1.75rem] sm:text-[2.5rem] font-semibold text-[color:var(--apple-ink)] tracking-[-0.02em] leading-[1.1]">
          {t('faq.title')}
        </h2>
        <p className="mt-3 text-[15px] sm:text-[17px] text-[color:var(--apple-muted)] leading-relaxed">
          {t('faq.subtitle')}
        </p>
      </Reveal>

      <Reveal motionScale={motionScale} y={32} className="mt-10 sm:mt-14 space-y-4">
        {faqItems.map((item) => (
          <details
            key={item.id}
            className="group rounded-[1.25rem] bg-[color:var(--apple-card)] border border-[color:var(--apple-line)] shadow-[var(--apple-shadow-sm)] overflow-hidden transition-all duration-300 hover:shadow-[var(--apple-shadow-md)] open:bg-[color:var(--apple-card-strong)] open:shadow-[var(--apple-shadow-lg)]"
          >
            <summary className="focus-ring flex items-center justify-between gap-4 p-[1.25rem] sm:p-[1.5rem] cursor-pointer select-none [&::-webkit-details-marker]:hidden">
              <span className="min-w-0">
                <span className="min-w-0 text-[15px] sm:text-[17px] font-semibold text-[color:var(--apple-ink)] tracking-tight break-words">
                  {item.question}
                </span>
              </span>
              <span
                className="text-[color:var(--apple-muted)] transition-transform duration-300 ease-apple group-open:rotate-180 inline-flex items-center justify-center w-8 h-8 rounded-full bg-[color:var(--apple-btn-secondary-bg)] group-hover:bg-[color:var(--apple-btn-secondary-bg-hover)]"
                aria-hidden="true"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </summary>

            <div className="px-[1.25rem] sm:px-[1.5rem] pb-[1.25rem] sm:pb-[1.5rem] text-[15px] text-[color:var(--apple-muted)] leading-relaxed animate-fade-in">
              <p>{item.answer}</p>

              {item.code ? (
                <pre className="mt-4 rounded-[1rem] bg-[color:var(--apple-surface)] border border-[color:var(--apple-line)] p-4 overflow-x-auto text-[13px] shadow-inner">
                  <code className="font-mono text-[color:var(--apple-ink)]">{item.code}</code>
                </pre>
              ) : null}

              <div className="mt-4 flex flex-wrap items-center gap-3">
                {item.actionLabel ? (
                  <button
                    type="button"
                    onClick={item.onAction}
                    className="focus-ring inline-flex items-center justify-center rounded-full bg-[color:var(--apple-btn-secondary-bg)] px-5 py-2.5 text-[13px] font-semibold text-[color:var(--apple-ink)] transition-colors duration-150 hover:bg-[color:var(--apple-btn-secondary-bg-hover)]"
                  >
                    {item.actionLabel}
                  </button>
                ) : null}
                {item.linkHref ? (
                  <a
                    href={item.linkHref}
                    className="focus-ring inline-flex items-center justify-center rounded-full bg-[color:var(--apple-btn-secondary-bg)] px-5 py-2.5 text-[13px] font-semibold text-[color:var(--apple-ink)] transition-colors duration-150 hover:bg-[color:var(--apple-btn-secondary-bg-hover)]"
                    target={item.linkHref.startsWith('http') ? '_blank' : undefined}
                    rel={item.linkHref.startsWith('http') ? 'noopener noreferrer' : undefined}
                  >
                    {item.linkLabel}
                  </a>
                ) : null}
              </div>
            </div>
          </details>
        ))}
      </Reveal>
    </section>
  )
}

const PolicyModal = ({ type, onClose }) => {
  const { t } = useLocale()
  const data = type ? getPolicyContent(t)[type] : null
  const dialogRef = useRef(null)
  const closeButtonRef = useRef(null)
  const titleId = type ? `policy-${type}-title` : undefined
  const descriptionId = type ? `policy-${type}-description` : undefined

  useEffect(() => {
    if (!type) return
    const previousActiveElement = document.activeElement
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const getFocusableElements = () => {
      if (!dialogRef.current) return []
      return Array.from(
        dialogRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      )
    }

    const focusInitial = () => {
      if (closeButtonRef.current) {
        closeButtonRef.current.focus()
        return
      }
      const focusables = getFocusableElements()
      if (focusables.length) focusables[0].focus()
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab') return
      const focusables = getFocusableElements()
      if (!focusables.length) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    focusInitial()
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      if (previousActiveElement?.focus) previousActiveElement.focus()
    }
  }, [type, onClose])

  if (!type || !data) return null

  return (
    <div
      className="fixed inset-0 z-modal flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
    >
      <div className="absolute inset-0 bg-black/50 dark:bg-black/70" onClick={onClose} />
      <div
        ref={dialogRef}
        className="relative w-full max-w-2xl max-h-[80vh] max-h-[80svh] overflow-y-auto bg-[color:var(--apple-card)] border border-[color:var(--apple-line)] rounded-2xl shadow-[var(--apple-shadow-xl)] p-6 sm:p-8"
        onClick={(event) => event.stopPropagation()}
        tabIndex={-1}
      >
        <div className="mb-8 flex items-start justify-between gap-6">
          <div>
            <h3
              id={titleId}
              className="mb-3 text-2xl font-semibold text-[color:var(--apple-ink)] font-display"
            >
              {data.title}
            </h3>
            <p id={descriptionId} className="text-sm text-[color:var(--apple-muted)] leading-relaxed">
              {data.description}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="focus-ring flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-[color:var(--apple-line)] bg-[color:var(--apple-card-strong)] text-[color:var(--apple-muted)] transition-colors duration-150 hover:border-[color:var(--apple-line-strong)] hover:text-[color:var(--apple-ink)]"
            aria-label={t('policy.close', 'Close dialog')}
            ref={closeButtonRef}
          >
            <span className="text-lg leading-none" aria-hidden="true">×</span>
          </button>
        </div>

        <div className="space-y-4">
          {data.sections.map((section) => (
            <div key={section.title} className="rounded-xl border border-[color:var(--apple-line)] bg-[color:var(--apple-card-strong)] p-5">
              <h4 className="mb-2 text-sm font-semibold text-[color:var(--apple-ink)] font-display">
                {section.title}
              </h4>
              <p className="text-sm text-[color:var(--apple-muted)] leading-relaxed">{section.body}</p>
              {section.points?.length ? (
                <ul className="mt-3 list-inside list-disc space-y-1.5 text-sm text-[color:var(--apple-muted)]">
                  {section.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
        </div>

        {data.footer ? <p className="mt-8 text-xs text-[color:var(--apple-muted)] leading-relaxed">{data.footer}</p> : null}
        <button
          type="button"
          onClick={onClose}
          className="focus-ring mt-6 w-full rounded-xl bg-[color:var(--apple-btn-primary-bg)] py-3.5 text-sm font-semibold text-[color:var(--apple-btn-primary-text)] shadow-[var(--apple-shadow-md)] transition-colors duration-150 hover:bg-[color:var(--apple-btn-primary-bg-hover)] md:text-base"
        >
          {t('policy.understood', 'I Understand')}
        </button>
      </div>
    </div>
  )
}

const Footer = ({ onOpenPolicy = () => {} }) => {
  const { isDark } = useTheme()
  const { t } = useLocale()
  return (
    <footer className="mt-4 border-t border-[color:var(--apple-line)] bg-[color:var(--apple-card)] sm:mt-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="flex flex-col gap-8 sm:gap-10">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-[1fr_auto] md:gap-12 items-start">
            <div className="flex flex-col items-center md:items-start gap-4">
              <div className="flex items-center gap-3 font-bold text-[color:var(--apple-ink)] text-lg tracking-tight">
                <img src={isDark ? logoFooterDark : logoFooter} alt="" className="h-9 w-auto" loading="lazy" decoding="async" />
                <span className="sr-only">DeepStudent</span>
              </div>
            </div>
            <nav
              className="flex flex-wrap justify-center md:justify-end gap-x-8 gap-y-4 text-[13px] text-[color:var(--apple-muted)] font-medium"
              aria-label="Footer links"
            >
              <button
                type="button"
                onClick={() => onOpenPolicy('privacy')}
                className="focus-ring hover:text-[color:var(--apple-ink)] transition-colors"
              >
                {t('footer.privacy')}
              </button>
              <button
                type="button"
                onClick={() => onOpenPolicy('about')}
                className="focus-ring hover:text-[color:var(--apple-ink)] transition-colors"
              >
                {t('footer.about')}
              </button>
              <button
                type="button"
                onClick={() => onOpenPolicy('terms')}
                className="focus-ring hover:text-[color:var(--apple-ink)] transition-colors"
              >
                {t('footer.terms')}
              </button>
              <a
                href="https://github.com/helixnow/deep-student"
                className="focus-ring hover:text-[color:var(--apple-ink)] transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
            </nav>
          </div>

          <div className="h-px bg-[color:var(--apple-line)]" aria-hidden="true" />

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 self-center sm:self-auto">
              <a
                href="https://www.xiaohongshu.com/user/profile/648898bb0000000012037f8f"
                target="_blank"
                rel="noopener noreferrer"
                className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--apple-line)] bg-[color:var(--apple-btn-secondary-bg)] text-[color:var(--apple-ink-secondary)] transition-colors duration-150 hover:bg-[color:var(--apple-btn-secondary-bg-hover)] hover:text-[color:var(--apple-ink)]"
                aria-label={t('footer.xiaohongshu', 'Xiaohongshu')}
                title={t('footer.xiaohongshu', 'Xiaohongshu')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 16 16" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M6.34 14.458c.106-.231.195-.431.29-.628q.329-.607.59-1.247a.74.74 0 0 1 .88-.55c.557.039 1.116.01 1.698.01V4.794c-.391 0-.777-.014-1.16 0-.267.014-.36-.073-.353-.36.019-.685 0-1.374 0-2.091h5.428v1.664c0 .783 0 .783-.76.783h-.762v7.245h1.647c.664 0 .664 0 .664.697v1.46c0 .202-.05.305-.268.305q-3.866-.007-7.73-.006a1 1 0 0 1-.164-.034"
                  />
                  <path
                    fill="currentColor"
                    d="M7.365 9.21c-.339.7-.637 1.324-.95 1.938a.3.3 0 0 1-.228.114c-.755 0-1.514.03-2.266-.026-.753-.056-1.054-.54-.754-1.28.342-.853.753-1.678 1.134-2.514.024-.053.042-.106.088-.223-.305 0-.572.007-.84 0a3 3 0 0 1-.646-.06.76.76 0 0 1-.652-.85.8.8 0 0 1 .074-.256c.457-1.098.97-2.175 1.464-3.256q.24-.532.51-1.05c.047-.09.155-.203.238-.207.706-.017 1.414-.009 2.184-.009-.067.172-.104.29-.156.399q-.648 1.356-1.301 2.709c-.088.183-.194.373.134.512.088-.47.44-.384.75-.384h1.784c-.075.178-.123.302-.178.42-.55 1.152-1.11 2.294-1.653 3.444-.223.469-.148.583.37.588.268-.008.538-.01.894-.01m-.97 2.834c-.419.839-.792 1.593-1.175 2.343a.26.26 0 0 1-.194.11 228 228 0 0 1-3.084-.058 2 2 0 0 1-.413-.11l.575-1.162c.188-.384.37-.767.572-1.133a.35.35 0 0 1 .247-.162c.942.047 1.884.112 2.828.17.19.01.369.002.644.002"
                  />
                </svg>
              </a>
              <a
                href="https://qm.qq.com/q/UkEacMzuIW"
                target="_blank"
                rel="noopener noreferrer"
                className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--apple-line)] bg-[color:var(--apple-btn-secondary-bg)] text-[color:var(--apple-ink-secondary)] transition-colors duration-150 hover:bg-[color:var(--apple-btn-secondary-bg-hover)] hover:text-[color:var(--apple-ink)]"
                aria-label={t('footer.qq', 'QQ')}
                title={t('footer.qq', 'QQ')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M21.395 15.035a40 40 0 0 0-.803-2.264l-1.079-2.695c.001-.032.014-.562.014-.836C19.526 4.632 17.351 0 12 0S4.474 4.632 4.474 9.241c0 .274.013.804.014.836l-1.08 2.695a39 39 0 0 0-.802 2.264c-1.021 3.283-.69 4.643-.438 4.673.54.065 2.103-2.472 2.103-2.472 0 1.469.756 3.387 2.394 4.771-.612.188-1.363.479-1.845.835-.434.32-.379.646-.301.778.343.578 5.883.369 7.482.189 1.6.18 7.14.389 7.483-.189.078-.132.132-.458-.301-.778-.483-.356-1.233-.646-1.846-.836 1.637-1.384 2.393-3.302 2.393-4.771 0 0 1.563 2.537 2.103 2.472.251-.03.581-1.39-.438-4.673"
                  />
                </svg>
              </a>
            </div>
            <div className="flex flex-col items-center sm:items-end gap-2 text-[color:var(--apple-muted)]">
              <LocaleToggle compact className="w-[9.5rem] sm:w-[10.5rem]" />
              <span className="font-mono text-[10px] tracking-[0.08em] text-center sm:text-right opacity-60">
                Build {buildHash}
              </span>
              <span className="text-[11px] text-center sm:text-right opacity-80">© 2026 DeepStudent Team.</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default App
