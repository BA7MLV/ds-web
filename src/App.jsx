import { useCallback, useEffect, useRef, useState } from 'react'
import { Analytics51la } from './components/Analytics51la'
import { useLocale } from './components/locale-toggle'
import { ArchitectureDiagram } from './components/sections/architecture-diagram'
import { DownloadPage } from './components/sections/download-page'
import { FaqSection } from './components/sections/faq-section'
import { FeatureSection } from './components/sections/feature-section'
import { Footer } from './components/sections/footer'
import { FreeModelsCallout } from './components/sections/free-models-callout'
import { HeroSection } from './components/sections/hero-section'
import { PolicyModal } from './components/sections/policy-modal'
import { StatsSection } from './components/sections/stats-section'
import { TopNav } from './components/sections/top-nav'
import { FeatureScreenshotFrame } from './components/ui/feature-screenshot-frame'

const getIsDownloadFromLocation = () => {
  if (typeof window === 'undefined') return false
  const params = new URLSearchParams(window.location.search)
  return params.get('view') === 'download'
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
      if (query.addEventListener) {
        query.addEventListener('change', update)
        return () => query.removeEventListener('change', update)
      }
      query.addListener(update)
      return () => query.removeListener(update)
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

const App = () => {
  const [activePolicy, setActivePolicy] = useState(null)
  const [isDownloadPage, setIsDownloadPage] = useState(() => getIsDownloadFromLocation())
  const { t, ready } = useLocale()
  const { motionScale } = useResponsiveMotion()
  const homeScrollRef = useRef(0)
  const downloadScrollRef = useRef(0)
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
      <Analytics51la />
      <div className="min-h-screen min-h-[100svh] bg-transparent text-[color:var(--apple-ink)] font-sans selection:bg-black selection:text-white">
        <a href="#main-content" className="skip-link">
          {t('a11y.skipToContent', '跳到主要内容')}
        </a>
        {isDownloadPage ? (
          <main id="main-content" tabIndex={-1} className="outline-none">
            <DownloadPage onBack={handleDownloadClose} />
          </main>
        ) : (
          <>
            <TopNav onDownload={handleDownloadOpen} />
            {/* scroll-mt clears the sticky nav (h-14 + safe area) when the skip link lands here. */}
            <main
              id="main-content"
              tabIndex={-1}
              className="outline-none scroll-mt-[calc(3.5rem+var(--sat,0px))]"
            >
              <HeroSection onDownload={handleDownloadOpen} motionScale={motionScale} />

              <StatsSection motionScale={motionScale} />
              <ArchitectureDiagram motionScale={motionScale} />

              <div
                id="features"
                className={`relative z-10 scroll-mt-24 pb-8 sm:pb-10 lg:pb-12 ${
                  motionScale > 0 ? 'animate-fade-in' : ''
                }`}
                style={motionScale > 0 ? { animationDelay: '0.18s' } : undefined}
              >
                <div className="space-y-[6.854rem] sm:space-y-[11.09rem] lg:space-y-[17.944rem] pt-[4.236rem] sm:pt-[6.854rem]">
                  <FeatureSection
                    id="feature-free-models"
                    title={t('freeModels.title', '免费模型，开箱即用')}
                    desc={t('freeModels.desc', '硅基流动免费提供的 AI 模型，无需 API Key，下载即用。')}
                    align="right"
                    motionScale={motionScale}
                  >
                    <div className="max-w-lg mx-auto">
                      <FreeModelsCallout />
                    </div>
                  </FeatureSection>

                  <FeatureSection
                    id="feature-agent"
                    layout="sticky"
                    title={t('feature.agent.title')}
                    desc={t('feature.agent.desc')}
                    align="left"
                    motionScale={motionScale}
                    subFeatures={[
                      { labelKey: 'agent.multiModel', descKey: 'agent.multiModelDesc', imgSrc: '/img/example/模型分配.png' },
                      { labelKey: 'agent.parallel', descKey: 'agent.parallelDesc', imgSrc: '/img/example/并行-1.png' },
                      { labelKey: 'agent.parallelResult', descKey: 'agent.parallelResultDesc', imgSrc: '/img/example/并行-2.png' },
                      { labelKey: 'agent.skills', descKey: 'agent.skillsDesc', imgSrc: '/img/example/技能管理.png' },
                      { labelKey: 'agent.group', descKey: 'agent.groupDesc', imgSrc: '/img/example/分组.png' },
                      { labelKey: 'agent.session', descKey: 'agent.sessionDesc', imgSrc: '/example/会话管理.png' },
                    ]}
                  >
                    <FeatureScreenshotFrame src="/img/example/软件主页图.png" alt="AI Agent Interface" />
                  </FeatureSection>

                  <FeatureSection
                    id="feature-anki"
                    layout="sticky"
                    title={t('feature.anki_full.title')}
                    desc={t('feature.anki_full.desc')}
                    align="right"
                    motionScale={motionScale}
                    subFeatures={[
                      { labelKey: 'anki.upload', descKey: 'anki.uploadDesc', imgSrc: '/img/example/anki-发送.png' },
                      { labelKey: 'feature.anki_full.title', descKey: 'feature.anki_full.desc', imgSrc: '/img/example/anki-制卡1.png' },
                      { labelKey: 'anki.import', descKey: 'anki.importDesc', imgSrc: '/img/example/anki-制卡3.png' },
                      { labelKey: 'anki.tasks', descKey: 'anki.tasksDesc', imgSrc: '/img/example/制卡任务.png' },
                      { labelKey: 'anki.templates', descKey: 'anki.templatesDesc', imgSrc: '/img/example/模板库-1.png' },
                      { labelKey: 'anki.templateEditor', descKey: 'anki.templateEditorDesc', imgSrc: '/img/example/模板库-2.png' },
                    ]}
                  >
                    <FeatureScreenshotFrame src="/img/example/anki-制卡2.png" alt={t('anki.preview')} />
                  </FeatureSection>

                  <FeatureSection
                    id="feature-mcp"
                    title={t('feature.mcp.title')}
                    desc={t('feature.mcp.desc')}
                    align="right"
                    motionScale={motionScale}
                    subFeatures={[
                      { labelKey: 'mcp.context7', descKey: 'mcp.context7Desc', imgSrc: '/img/example/mcp-1.png' },
                      { labelKey: 'mcp.arxiv', descKey: 'mcp.arxivDesc', imgSrc: '/img/example/mcp-3.png' },
                      { labelKey: 'mcp.output', descKey: 'mcp.outputDesc', imgSrc: '/img/example/mcp-4.png' },
                    ]}
                  >
                    <FeatureScreenshotFrame src="/img/example/mcp-2.png" alt="MCP Tool Ecosystem" />
                  </FeatureSection>

                  <FeatureSection
                    id="feature-research"
                    layout="sticky"
                    title={t('feature.research.title')}
                    desc={t('feature.research.desc')}
                    align="left"
                    motionScale={motionScale}
                    subFeatures={[
                      { labelKey: 'research.execute', descKey: 'research.executeDesc', imgSrc: '/img/example/调研-2.png' },
                      { labelKey: 'research.progress', descKey: 'research.progressDesc', imgSrc: '/img/example/调研-3.png' },
                      { labelKey: 'research.report', descKey: 'research.reportDesc', imgSrc: '/img/example/调研-4.png' },
                      { labelKey: 'research.save', descKey: 'research.saveDesc', imgSrc: '/img/example/调研-5.png' },
                    ]}
                  >
                    <FeatureScreenshotFrame src="/img/example/调研-1.png" alt="Deep Research" />
                  </FeatureSection>

                  <FeatureSection
                    id="feature-reading"
                    title={t('feature.reading.title')}
                    desc={t('feature.reading.desc')}
                    align="right"
                    motionScale={motionScale}
                    subFeatures={[
                      { labelKey: 'reading.pdfSelect', descKey: 'reading.pdfSelectDesc', imgSrc: '/img/example/pdf阅读-2.png' },
                      { labelKey: 'reading.pdfDeep', descKey: 'reading.pdfDeepDesc', imgSrc: '/img/example/pdf阅读-3.png' },
                      { labelKey: 'reading.docx', descKey: 'reading.docxDesc', imgSrc: '/img/example/docx阅读-1.png' },
                    ]}
                  >
                    <FeatureScreenshotFrame src="/img/example/pdf阅读-1.png" alt="Deep Reading" />
                  </FeatureSection>

                  <FeatureSection
                    id="feature-mindmap"
                    layout="sticky"
                    title={t('feature.mindmap.title')}
                    desc={t('feature.mindmap.desc')}
                    align="left"
                    motionScale={motionScale}
                    subFeatures={[
                      { labelKey: 'mindmap.iterate', descKey: 'mindmap.iterateDesc', imgSrc: '/img/example/知识导图-2.png' },
                      { labelKey: 'mindmap.complete', descKey: 'mindmap.completeDesc', imgSrc: '/img/example/知识导图-3.png' },
                      { labelKey: 'mindmap.editView', descKey: 'mindmap.editViewDesc', imgSrc: '/img/example/知识导图-4.png' },
                      { labelKey: 'mindmap.outline', descKey: 'mindmap.outlineDesc', imgSrc: '/img/example/知识导图-5.png' },
                      { labelKey: 'mindmap.recite', descKey: 'mindmap.reciteDesc', imgSrc: '/img/example/知识导图-6.png' },
                    ]}
                  >
                    <FeatureScreenshotFrame src="/img/example/知识导图-1.png" alt="Knowledge Mindmap" />
                  </FeatureSection>

                  <FeatureSection
                    id="feature-notes-memory"
                    title={t('feature.notes_memory.title')}
                    desc={t('feature.notes_memory.desc')}
                    align="right"
                    motionScale={motionScale}
                    subFeatures={[
                      { labelKey: 'memory.resources', descKey: 'memory.resourcesDesc', imgSrc: '/img/example/学习资源管理器.png' },
                      { labelKey: 'memory.generate', descKey: 'memory.generateDesc', imgSrc: '/img/example/记忆-1.png' },
                      { labelKey: 'memory.list', descKey: 'memory.listDesc', imgSrc: '/img/example/记忆-2.png' },
                      { labelKey: 'memory.detail', descKey: 'memory.detailDesc', imgSrc: '/img/example/记忆-3.png' },
                      { labelKey: 'memory.files', descKey: 'memory.filesDesc', imgSrc: '/img/example/记忆-4.png' },
                      { labelKey: 'memory.vector', descKey: 'memory.vectorDesc', imgSrc: '/img/example/向量化状态.png' },
                    ]}
                  >
                    <FeatureScreenshotFrame src="/img/example/笔记-1.png" alt="Notes & Memory Management" />
                  </FeatureSection>

                  <FeatureSection
                    id="feature-qbank"
                    layout="sticky"
                    title={t('feature.qbank_full.title')}
                    desc={t('feature.qbank_full.desc')}
                    align="left"
                    motionScale={motionScale}
                    subFeatures={[
                      { labelKey: 'qbank.browse', descKey: 'qbank.browseDesc', imgSrc: '/img/example/题目集-2.png' },
                      { labelKey: 'qbank.practice', descKey: 'qbank.practiceDesc', imgSrc: '/img/example/题目集-3.png' },
                      { labelKey: 'qbank.analysis', descKey: 'qbank.analysisDesc', imgSrc: '/img/example/题目集-4.png' },
                      { labelKey: 'qbank.knowledge', descKey: 'qbank.knowledgeDesc', imgSrc: '/img/example/题目集-5.png' },
                    ]}
                  >
                    <FeatureScreenshotFrame src="/img/example/题目集-1.png" alt="Smart Q-Bank" />
                  </FeatureSection>

                  <FeatureSection
                    id="feature-essay"
                    title={t('feature.essay_full.title')}
                    desc={t('feature.essay_full.desc')}
                    align="right"
                    motionScale={motionScale}
                    subFeatures={[
                      { labelKey: 'essay.types', descKey: 'essay.typesDesc', imgSrc: '/img/example/作文批改-1.png' },
                      { labelKey: 'essay.detail', descKey: 'essay.detailDesc', imgSrc: '/img/example/作文-2.png' },
                    ]}
                  >
                    <FeatureScreenshotFrame src="/img/example/作文-1.png" alt="Essay Grading" />
                  </FeatureSection>

                  <FeatureSection
                    id="feature-paper-search"
                    layout="sticky"
                    title={t('feature.paperSearch.title')}
                    desc={t('feature.paperSearch.desc')}
                    align="left"
                    motionScale={motionScale}
                    subFeatures={[
                      { labelKey: 'paperSearch.download', descKey: 'paperSearch.downloadDesc', imgSrc: '/img/example/论文搜索-2.png' },
                      { labelKey: 'paperSearch.read', descKey: 'paperSearch.readDesc', imgSrc: '/img/example/论文搜索-3.png' },
                    ]}
                  >
                    <FeatureScreenshotFrame src="/img/example/论文搜索-1.png" alt="Paper Search" />
                  </FeatureSection>

                  <FeatureSection
                    id="feature-translation"
                    layout="sticky"
                    title={t('feature.translation.title')}
                    desc={t('feature.translation.desc')}
                    align="right"
                    motionScale={motionScale}
                    subFeatures={[
                      { labelKey: 'translation.bilingual', descKey: 'translation.bilingualDesc', imgSrc: '/img/example/翻译-2.png' },
                      { labelKey: 'translation.domain', descKey: 'translation.domainDesc', imgSrc: '/img/example/翻译-3.png' },
                    ]}
                  >
                    <FeatureScreenshotFrame src="/img/example/翻译-1.png" alt="Translation Workbench" />
                  </FeatureSection>
                </div>

                <FaqSection motionScale={motionScale} onOpenPolicy={handlePolicyOpen} />
              </div>
            </main>
          </>
        )}

        <Footer onOpenPolicy={handlePolicyOpen} />
        <PolicyModal type={activePolicy} onClose={handlePolicyClose} />
      </div>
    </>
  )
}

export default App
