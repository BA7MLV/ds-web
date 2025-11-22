import { useEffect, useRef, useState } from 'react'
import {
  ArrowLeft,
  ArrowUpRight,
  Apple,
  Brain,
  Check,
  ChevronRight,
  Download,
  FileText,
  History,
  LaptopMinimal,
  Layers,
  MonitorDot,
  Search,
  Sparkles,
  Target,
  X,
  Zap,
} from 'lucide-react'
import logo from './assets/deepstudent-logo.svg'

const cardHeaderClass = 'flex items-center gap-3 mb-6'

const policyContent = {
  privacy: {
    title: '隐私政策',
    description: '我们遵循最小化数据原则，确保每条学习记录都掌握在你手中。',
    sections: [
      {
        title: '收集范围',
        body: '仅在你使用 DeepStudent 时记录必要的错题内容、标签与复习进度，不会采集与服务无关的敏感个人信息。',
        points: ['账号信息仅用于云端同步与登录验证。', '你可随时导出或删除本地与云端数据。'],
      },
      {
        title: '使用方式',
        body: '所有数据仅用于生成个性化学习建议与统计分析，不会出售或提供给第三方广告平台。',
        points: ['算法训练仅使用匿名化、脱敏后的聚合数据。', '我们会定期发布透明度报告。'],
      },
      {
        title: '安全措施',
        body: '所有传输均使用 TLS 加密，云端存储采用分区隔离，敏感字段在数据库内加盐散列。',
        points: ['核心基础设施通过 ISO/IEC 27001 安全认证。', '如遇异常访问会立即告警并支持一键冻结账号。'],
      },
    ],
    footer: '更多隐私问题请发送邮件至 privacy@deepstudent.ai，我们会在 3 个工作日内回复。',
  },
  terms: {
    title: '使用条款',
    description: '使用 DeepStudent 即表示你同意以下约定，本服务为学习辅助工具，不构成绝对学习结果承诺。',
    sections: [
      {
        title: '服务内容',
        body: '我们提供错题整理、知识图谱、复习提醒等功能，能力会根据版本迭代持续更新。',
        points: ['测试功能可能存在不稳定，请按需体验。', '我们保留随时调整或暂停服务的权利。'],
      },
      {
        title: '用户责任',
        body: '你需确保上传内容拥有合法使用权，并对账号安全负责。若出现共享或泄露行为，请立即联系我们。',
        points: ['禁止利用 DeepStudent 传播违法或侵权内容。', '若发现异常活动，我们可能采取限制措施。'],
      },
      {
        title: '免责声明',
        body: '我们会尽力保证服务稳定，但因不可抗力或第三方原因导致的数据丢失、服务中断，我们不承担间接损失责任。',
        points: ['建议定期导出备份重要数据。', '付费计划如需退款，请在 7 天内提交申请。'],
      },
    ],
    footer: '使用本服务即视为同意上述条款。如有疑问请联系 support@deepstudent.ai。',
  },
}

const App = () => {
  const [scrollY, setScrollY] = useState(0)
  const [activePolicy, setActivePolicy] = useState(null)
  const [isDownloadPage, setIsDownloadPage] = useState(false)

  const handlePolicyOpen = (type) => setActivePolicy(type)
  const handlePolicyClose = () => setActivePolicy(null)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleDownloadOpen = () => setIsDownloadPage(true)
  const handleDownloadClose = () => setIsDownloadPage(false)

  return (
    <div className="min-h-screen bg-white text-zinc-950 font-sans overflow-x-hidden selection:bg-zinc-900 selection:text-white">
      {isDownloadPage ? (
        <DownloadPage onBack={handleDownloadClose} />
      ) : (
        <>
          <DynamicIsland scrollY={scrollY} onDownload={handleDownloadOpen} />
          <HeroSection onDownload={handleDownloadOpen} />

          <main className="relative z-10 pb-32">
            <div className="space-y-32 pt-12">
              <FeatureSection
                icon={<Brain className="w-6 h-6" />}
                title="智能错题分析"
                desc="利用先进AI技术深度分析错题，找出知识薄弱点，提供个性化学习建议。"
                align="left"
              >
            <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-[0_8px_30px_rgba(0,0,0,0.04)] max-w-sm mx-auto transform transition-transform hover:scale-[1.02] duration-500">
              <div className={cardHeaderClass}>
                <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-900">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-zinc-900">深度分析中</div>
                  <div className="text-xs text-zinc-400">刚刚</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                  <div className="h-full bg-zinc-900 w-3/4 rounded-full animate-pulse" />
                </div>
                <div className="flex justify-between text-xs text-zinc-500 font-medium mt-1">
                  <span>知识点掌握</span>
                  <span className="text-zinc-900">72%</span>
                </div>
                <div className="mt-6 p-4 bg-zinc-50 rounded-xl border border-zinc-100 text-sm text-zinc-600 leading-relaxed">
                  <span className="font-semibold text-zinc-900 block mb-1">建议：</span>
                  重新复习{' '}
                  <span className="text-zinc-900 underline decoration-zinc-300 underline-offset-2">
                    导数定义
                  </span>{' '}
                  相关章节，并加强基础计算训练。
                </div>
              </div>
            </div>
          </FeatureSection>

          <FeatureSection
            icon={<Layers className="w-6 h-6" />}
            title="有序，不只是整理"
            desc="集中管理所有学科错题，按知识点、难度、时间自动分类，如 Finder 般井井有条。"
            align="right"
          >
            <div className="relative max-w-sm mx-auto">
              <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/0 to-white z-20 pointer-events-none" />
              <div className="bg-white rounded-2xl border border-zinc-200 shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden">
                <div className="px-4 py-3 border-b border-zinc-100 bg-zinc-50/50 backdrop-blur flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-300" />
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-300" />
                  </div>
                  <div className="text-xs font-medium text-zinc-500 ml-2">我的错题本</div>
                </div>
                <div className="p-2">
                  {[
                    { title: '2023 高数期末', tag: 'Math', date: 'Today' },
                    { title: '英语阅读理解专项', tag: 'English', date: 'Yesterday' },
                    { title: '物理力学错题集', tag: 'Physics', date: '2d ago' },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="flex items-center justify-between p-3 hover:bg-zinc-50 rounded-lg transition-colors group cursor-default"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-10 bg-zinc-100 rounded border border-zinc-200 flex items-center justify-center">
                          <FileText className="w-4 h-4 text-zinc-400" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-zinc-900 group-hover:text-black transition-colors">
                            {item.title}
                          </div>
                          <div className="text-[10px] text-zinc-400 uppercase tracking-wider mt-0.5">
                            {item.tag}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-zinc-400">{item.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FeatureSection>

          <FeatureSection
            icon={<Target className="w-6 h-6" />}
            title="多题统一回顾"
            desc="发现共性错误模式，生成综合学习报告。不再孤立地看问题。"
            align="left"
          >
            <div className="bg-zinc-900 text-white p-6 rounded-2xl shadow-2xl max-w-sm mx-auto relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-20">
                <Target className="w-24 h-24" />
              </div>
              <div className="relative z-10">
                <div className="text-sm text-zinc-400 mb-1">Error Pattern</div>
                <div className="text-2xl font-bold mb-6">Calculation Error</div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-400">Frequency</span>
                    <span className="font-mono">High (8/10)</span>
                  </div>
                  <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
                    <div className="bg-white h-full w-[80%]" />
                  </div>
                  <div className="p-3 bg-zinc-800/50 rounded-lg text-xs text-zinc-300 border border-zinc-700/50 mt-4">
                    建议在进行复杂运算时，增加验算步骤，特别是符号变换环节。
                  </div>
                </div>
              </div>
            </div>
          </FeatureSection>

          <FeatureSection
            icon={<Zap className="w-6 h-6" />}
            title="ANKI 记忆流"
            desc="无缝衔接间隔重复学习法 (Spaced Repetition)。一键制卡，永久记忆。"
            align="right"
          >
            <div className="flex justify-center">
              <div className="bg-white border border-zinc-200 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] rounded-2xl p-6 w-64 aspect-[3/4] flex flex-col items-center text-center justify-center relative rotate-3 transition-transform hover:rotate-0 duration-500">
                <div className="absolute top-4 left-4 w-1.5 h-1.5 bg-zinc-900 rounded-full" />
                <div className="mb-8">
                  <div className="text-xs font-bold text-zinc-400 tracking-[0.2em] uppercase mb-2">
                    Question
                  </div>
                  <div className="text-xl font-serif italic text-zinc-900">
                    What is the derivative of ln(x)?
                  </div>
                </div>
                <div className="w-full h-px bg-zinc-100 mb-8" />
                <div className="opacity-0 hover:opacity-100 transition-opacity duration-300 cursor-pointer absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center rounded-2xl z-10">
                  <div className="text-2xl font-bold text-zinc-900">1 / x</div>
                </div>
                <div className="text-xs text-zinc-400">Tap to flip</div>
              </div>
            </div>
          </FeatureSection>

          <FeatureSection
            icon={<Search className="w-6 h-6" />}
            title="RAG 知识增强"
            desc="内置 AI 知识库。对错题进行追问，像与导师对话一样获取详细解释。"
            align="left"
          >
            <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-200 shadow-sm max-w-sm mx-auto">
              <div className="space-y-4">
                <div className="flex gap-3 flex-row-reverse">
                  <div className="w-8 h-8 rounded-full bg-zinc-900 flex-shrink-0" />
                  <div className="bg-zinc-900 text-white px-4 py-2 rounded-2xl rounded-tr-sm text-sm">
                    这道题选 C 的原因是什么？
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-white border border-zinc-200 flex items-center justify-center flex-shrink-0">
                    <Brain className="w-4 h-4 text-zinc-900" />
                  </div>
                  <div className="bg-white border border-zinc-200 text-zinc-800 px-4 py-2 rounded-2xl rounded-tl-sm text-sm shadow-sm">
                    <p className="mb-2 font-semibold text-xs text-zinc-400 uppercase tracking-wider">
                      Reference: Chapter 4
                    </p>
                    根据洛必达法则，当 x 趋近于 0 时，分子分母同时求导...
                  </div>
                </div>
              </div>
            </div>
          </FeatureSection>
        </div>
      </main>
      </>
    )}

    <Footer onOpenPolicy={handlePolicyOpen} />
    <PolicyModal type={activePolicy} onClose={handlePolicyClose} />
  </div>
)
}

const DynamicIsland = ({ scrollY, onDownload = () => {} }) => {
  const expandThreshold = 100
  const vanishThreshold = 200

  let scale = 1
  let contentOpacity = 1

  if (scrollY > 0) {
    if (scrollY <= expandThreshold) {
      const progress = scrollY / expandThreshold
      contentOpacity = Math.max(0, 1 - progress * 4)
    } else if (scrollY <= vanishThreshold) {
      contentOpacity = 0
      const vanishProgress = (scrollY - expandThreshold) / (vanishThreshold - expandThreshold)
      scale = Math.max(0, 1 - vanishProgress)
    } else {
      scale = 0
      contentOpacity = 0
    }
  }

  const isDotMode = scrollY > expandThreshold

  return (
    <div className="fixed top-6 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <div
        className="bg-black text-white shadow-2xl flex items-center justify-between transition-all duration-300 overflow-hidden pointer-events-auto"
        style={{
          height: isDotMode ? '14px' : '52px',
          width: isDotMode ? '14px' : '240px',
          borderRadius: isDotMode ? '999px' : '32px',
          transform: `scale(${scale})`,
          padding: isDotMode ? 0 : '0 8px',
          transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
          opacity: scale,
        }}
      >
        <div
          className={`flex items-center justify-between w-full px-4 transition-opacity duration-200 ${
            isDotMode ? 'opacity-0' : 'opacity-100'
          }`}
          style={{ opacity: contentOpacity }}
        >
          <div className="font-semibold text-sm tracking-tight flex items-center gap-2">
            <img src={logo} alt="DeepStudent logo" className="w-4 h-4" />
            <span>DeepStudent</span>
          </div>
          <div className="h-4 w-px bg-zinc-800 mx-2" />
          <button
            type="button"
            onClick={onDownload}
            className="text-xs font-medium bg-white text-black px-3 py-1.5 rounded-full hover:bg-zinc-200 transition-colors"
          >
            下载
          </button>
        </div>
      </div>
    </div>
  )
}

const HeroSection = ({ onDownload = () => {} }) => {
  const heroTopPadding = 'clamp(3.5rem, 8vh, 5.5rem)'
  const heroBottomPadding = 'clamp(5.6rem, 13vh, 9rem)' // 约为黄金比例，制造更高的视觉重心

  return (
    <header
      className="relative min-h-screen px-6 flex flex-col items-center text-center justify-center"
      style={{ paddingTop: heroTopPadding, paddingBottom: heroBottomPadding }}
    >
      <div className="mb-6 animate-fade-in opacity-0" style={{ animationFillMode: 'forwards' }}>
        <div className="w-24 h-14 rounded-[1.25rem] bg-white flex items-center justify-center mx-auto">
          <img src={logo} alt="DeepStudent logo" className="w-10 h-10" />
        </div>
      </div>

      <div className="mb-8 animate-fade-in opacity-0" style={{ animationFillMode: 'forwards' }}>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-zinc-200 bg-zinc-50 text-zinc-600 text-xs font-medium">
          <span className="relative flex h-2 w-2 mr-1">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-black opacity-20" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-black" />
          </span>
          v1.0 Public Beta
          <ChevronRight className="w-3 h-3 text-zinc-400" />
        </div>
      </div>

      <h1
        className="text-5xl md:text-7xl font-semibold tracking-tighter text-zinc-900 mb-4 leading-[1.1] animate-fade-in opacity-0"
        style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}
      >
        DeepStudent
      </h1>

      <h2
        className="text-3xl md:text-4xl font-medium tracking-tight text-zinc-900 mb-6 animate-fade-in opacity-0"
        style={{ animationDelay: '150ms', animationFillMode: 'forwards' }}
      >
        免费开源的 AI 错题管理解决方案
      </h2>

      <p
        className="text-lg md:text-xl text-zinc-500 max-w-lg mb-10 leading-relaxed font-light animate-fade-in opacity-0"
        style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}
      >
        让学习更高效，让知识更牢固
      </p>

      <div
        className="flex flex-col sm:flex-row gap-4 w-full max-w-sm animate-fade-in opacity-0"
        style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}
      >
        <button
          type="button"
          onClick={onDownload}
          className="flex-1 py-3.5 bg-zinc-900 text-white rounded-full font-medium text-sm hover:bg-black/80 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-zinc-900/20"
        >
          <Download className="w-4 h-4" />
          立即下载
        </button>
        <button className="flex-1 py-3.5 bg-white text-zinc-900 border border-zinc-200 rounded-full font-medium text-sm hover:bg-zinc-50 hover:border-zinc-300 active:scale-95 transition-all flex items-center justify-center gap-2">
          <FileText className="w-4 h-4" />
          查看文档
        </button>
      </div>
    </header>
  )
}

const DownloadPage = ({ onBack = () => {} }) => {
  const [preferredPlatform, setPreferredPlatform] = useState('mac')

  useEffect(() => {
    const detectPlatform = () => {
      if (typeof navigator === 'undefined') return 'mac'
      const ua = navigator.userAgent || ''
      if (/windows/i.test(ua)) return 'windows'
      if (/macintosh|mac os x/i.test(ua) && !/ipad|iphone|ipod/i.test(ua)) return 'mac'
      return 'mac'
    }
    setPreferredPlatform(detectPlatform())
  }, [])

  const platformDownloads = [
    {
      id: 'mac',
      platform: 'macOS',
      channel: '通用 DMG 安装',
      version: 'v1.0.2 (Build 88)',
      size: '312 MB',
      requirements: 'macOS 13+，Apple Silicon 优化',
      description: '桌面端支持菜单栏快速录入、Spotlight 搜索以及系统共享扩展。',
      features: ['菜单栏快捷入口', 'Spotlight 搜索', 'iCloud 同步'],
      ctaLabel: '下载 DMG',
      ctaHref: 'https://downloads.deepstudent.ai/macos/deepstudent-v1.0.2.dmg',
      guideLabel: '校验签名',
      guideHref: 'https://docs.deepstudent.ai/download/macos-signature',
      status: '稳定',
      icon: MonitorDot,
      brandIcon: Apple,
      iconBg: 'bg-zinc-900 text-white',
      accentClass: 'bg-zinc-900 text-white',
    },
    {
      id: 'windows',
      platform: 'Windows',
      channel: 'Beta 安装器',
      version: 'v0.9.8 Preview',
      size: '298 MB',
      requirements: 'Windows 11 / 10 22H2+',
      description: '预览版支持 OneNote 导入与系统托盘控件，可与云端错题库实时同步。',
      features: ['OneNote 导入', '系统托盘控件', '自动更新'],
      ctaLabel: '下载 EXE',
      ctaHref: 'https://downloads.deepstudent.ai/windows/deepstudent-setup.exe',
      guideLabel: '阅读兼容性说明',
      guideHref: 'https://docs.deepstudent.ai/download/windows-beta',
      status: '预览',
      icon: LaptopMinimal,
      iconBg: 'bg-sky-50 text-sky-800 border border-sky-100',
      accentClass: 'bg-sky-100 text-sky-800',
    },
  ]

  const releaseNotes = [
    {
      version: 'v1.0.3',
      date: '2025-11-15',
      tag: '稳定',
      changes: [
        '新增「学习节奏」仪表盘，可按周查看完成度与巩固建议。',
        'iPadOS 版支持分屏拖拽题目到任意错题集，提升整理效率。',
        '修复部分 TestFlight 用户启动后立即闪退的问题。',
      ],
    },
    {
      version: 'v1.0.2',
      date: '2025-11-03',
      tag: '桌面',
      changes: [
        'macOS 菜单栏入口支持快捷截图粘贴，自动生成题干与答案。',
        '引入本地备份策略，断网后可自动恢复至最新云端版本。',
        '修复 Sonoma 上通知重复推送的已知问题。',
      ],
    },
    {
      version: 'v0.9.8',
      date: '2025-10-18',
      tag: 'Preview',
      changes: [
        '首次提供 Windows 预览版，包含核心错题整理与复习提醒功能。',
        '支持 OneNote / PDF 导入，自动识别题干、选项与解析字段。',
      ],
    },
  ]

  const latestVersion = releaseNotes[0]?.version ?? ''
  const preferredLabel = preferredPlatform === 'windows' ? 'Windows' : 'macOS'

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-zinc-50 via-white to-white pb-32">
      <div className="sticky top-0 z-40 border-b border-zinc-100 bg-white/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-6 py-4">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回首页
          </button>
          <span className="text-[11px] uppercase tracking-[0.4em] text-zinc-400 font-semibold">Download</span>
        </div>
      </div>

      <section className="max-w-4xl mx-auto px-6 pt-16 text-center">
        <p className="text-xs uppercase tracking-[0.5em] text-zinc-400">Release center</p>
        <h1 className="mt-4 text-4xl md:text-5xl font-semibold text-zinc-900 tracking-tight">
          {`立即下载 DeepStudent${latestVersion ? `+${latestVersion}` : ''}`}
        </h1>
        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/90 px-4 py-2 text-sm text-zinc-600">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>已根据请求头识别，你当前更适合 {preferredLabel} 安装包</span>
        </div>

        <div className="mt-8 rounded-2xl border border-dashed border-zinc-200 bg-white/70 px-4 py-3 text-sm text-zinc-500">
          <span className="font-semibold text-zinc-900">温馨提示：</span>
          Windows 版本仍处于 Beta 阶段，若遇到安装或同步问题，请通过 support@deepstudent.ai 联系我们。
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 pt-12">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-zinc-400">Platforms</p>
            <h2 className="mt-2 text-3xl font-semibold text-zinc-900">支持平台</h2>
          </div>
          <span className="text-sm text-zinc-500">每 1-2 周同步增量更新</span>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {platformDownloads.map((platform) => {
            const Icon = platform.icon
            const BrandIcon = platform.brandIcon
            const isRecommended = platform.id === preferredPlatform
            return (
              <article
                key={platform.platform}
                className="h-full rounded-3xl border border-zinc-100 bg-white/90 p-6 shadow-[0_25px_80px_rgba(0,0,0,0.08)]"
              >
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${platform.iconBg}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-zinc-900">{platform.platform}</p>
                      <p className="text-xs text-zinc-500 flex items-center gap-1">
                        {BrandIcon ? <BrandIcon className="w-4 h-4" /> : null}
                        {platform.channel}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {platform.status ? (
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${platform.accentClass}`}>
                        {platform.status}
                      </span>
                    ) : null}
                    {isRecommended ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                        <Sparkles className="w-3 h-3" />
                        推荐
                      </span>
                    ) : null}
                  </div>
                </div>

                <p className="text-sm text-zinc-600 leading-relaxed">{platform.description}</p>

                <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-zinc-500">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.3em] text-zinc-400">版本</p>
                    <p className="mt-1 font-semibold text-zinc-900">{platform.version}</p>
                  </div>
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.3em] text-zinc-400">大小</p>
                    <p className="mt-1 font-semibold text-zinc-900">{platform.size}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[11px] uppercase tracking-[0.3em] text-zinc-400">环境要求</p>
                    <p className="mt-1 font-semibold text-zinc-900">{platform.requirements}</p>
                  </div>
                </div>

                <div className="mt-6">
                  <p className="text-xs uppercase tracking-[0.3em] text-zinc-400 mb-3">特性</p>
                  <div className="flex flex-wrap gap-2">
                    {platform.features.map((feature) => (
                      <span
                        key={feature}
                        className="px-3 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-600"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3">
                  <a
                    href={platform.ctaHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-zinc-900 py-3 text-sm font-semibold text-white hover:bg-black transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    {platform.ctaLabel}
                  </a>
                  <a
                    href={platform.guideHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-zinc-200 py-2.5 text-sm text-zinc-600 hover:border-zinc-300 hover:text-zinc-900 transition-colors"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    {platform.guideLabel}
                  </a>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 pt-16">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-zinc-900 text-white flex items-center justify-center">
            <History className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-zinc-400">Changelog</p>
            <h3 className="text-3xl font-semibold text-zinc-900">更新记录</h3>
            <p className="text-sm text-zinc-500 mt-1">记录每一次版本的迭代亮点与修复说明。</p>
          </div>
        </div>

        <div className="space-y-8">
          {releaseNotes.map((note, index) => (
            <div key={note.version} className="relative pl-10">
              <span className="absolute left-2 top-2 w-3 h-3 rounded-full bg-zinc-900" />
              {index !== releaseNotes.length - 1 ? (
                <span className="absolute left-[14px] top-5 bottom-[-28px] w-px bg-zinc-200" aria-hidden />
              ) : null}
              <div className="rounded-3xl border border-zinc-100 bg-white/90 p-5 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.3em] text-zinc-400">{note.tag}</p>
                    <h4 className="mt-1 text-2xl font-semibold text-zinc-900">{note.version}</h4>
                  </div>
                  <span className="text-sm text-zinc-500">{note.date}</span>
                </div>
                <ul className="mt-4 space-y-2 text-sm text-zinc-600">
                  {note.changes.map((change) => (
                    <li key={change} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-zinc-400 mt-0.5" />
                      <span>{change}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

const FeatureSection = ({ icon, title, desc, align, children }) => {
  const ref = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.15 },
    )

    observer.observe(node)

    return () => observer.disconnect()
  }, [])

  const contentDirection = align === 'right' ? 'md:flex-row-reverse' : 'md:flex-row'

  return (
    <section ref={ref} className="px-6 max-w-4xl mx-auto">
      <div
        className={`flex flex-col ${contentDirection} items-center gap-12 md:gap-24 transition-all duration-1000 ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-16'
        }`}
      >
        <div className="flex-1 text-center md:text-left">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-900 mb-6">
            {icon}
          </div>
          <h2 className="text-3xl font-semibold text-zinc-900 mb-4 tracking-tight">{title}</h2>
          <p className="text-zinc-500 leading-relaxed text-lg font-light">{desc}</p>
        </div>

        <div className="flex-1 w-full">{children}</div>
      </div>
    </section>
  )
}

const PolicyModal = ({ type, onClose }) => {
  const data = type ? policyContent[type] : null

  useEffect(() => {
    if (!type) return
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [type, onClose])

  if (!type || !data) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="relative w-full max-w-2xl max-h-[80vh] overflow-y-auto bg-white border border-zinc-100 rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.2)] p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-6 mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-zinc-400 mb-3">{type === 'privacy' ? 'PRIVACY' : 'TERMS'}</p>
            <h3 className="text-2xl font-semibold text-zinc-900 mb-3">{data.title}</h3>
            <p className="text-sm text-zinc-500 leading-relaxed">{data.description}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex-shrink-0 w-10 h-10 rounded-full border border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:border-zinc-300 flex items-center justify-center transition-colors"
            aria-label="关闭弹窗"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-6">
          {data.sections.map((section) => (
            <div key={section.title} className="border border-zinc-100 rounded-2xl p-5 bg-zinc-50/60">
              <h4 className="text-sm font-semibold text-zinc-900 mb-2">{section.title}</h4>
              <p className="text-sm text-zinc-500 leading-relaxed">{section.body}</p>
              {section.points?.length ? (
                <ul className="mt-3 space-y-1.5 text-sm text-zinc-500 list-disc list-inside">
                  {section.points.map((point) => (
                    <li key={point}>{point}</li>
                  ))}
                </ul>
              ) : null}
            </div>
          ))}
        </div>

        {data.footer ? <p className="mt-8 text-xs text-zinc-400 leading-relaxed">{data.footer}</p> : null}
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full py-3.5 rounded-2xl bg-zinc-900 text-white text-sm font-semibold hover:bg-black transition-colors"
        >
          我已了解
        </button>
      </div>
    </div>
  )
}

const Footer = ({ onOpenPolicy = () => {} }) => (
  <footer className="border-t border-zinc-100 py-12 px-6 mt-24 bg-zinc-50/50">
    <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
      <div className="flex items-center gap-2 font-semibold text-zinc-900">
        <img src={logo} alt="DeepStudent logo" className="w-5 h-5" />
        DeepStudent
      </div>

      <div className="flex gap-8 text-sm text-zinc-500 font-medium">
        <button
          type="button"
          onClick={() => onOpenPolicy('privacy')}
          className="hover:text-zinc-900 transition-colors focus:outline-none"
        >
          Privacy
        </button>
        <button
          type="button"
          onClick={() => onOpenPolicy('terms')}
          className="hover:text-zinc-900 transition-colors focus:outline-none"
        >
          Terms
        </button>
        <a
          href="https://github.com/deepstudents/ai-mistake-manager"
          className="hover:text-zinc-900 transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
      </div>

      <div className="text-xs text-zinc-400">© 2025 DeepStudent Team.</div>
    </div>
  </footer>
)

export default App
