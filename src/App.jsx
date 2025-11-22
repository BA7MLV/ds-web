import { useEffect, useRef, useState } from 'react'
import {
  Brain,
  Layers,
  Download,
  FileText,
  ChevronRight,
  Zap,
  Target,
  Sparkles,
  Search,
  X,
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

  const handlePolicyOpen = (type) => setActivePolicy(type)
  const handlePolicyClose = () => setActivePolicy(null)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-white text-zinc-950 font-sans overflow-x-hidden selection:bg-zinc-900 selection:text-white">
      <DynamicIsland scrollY={scrollY} />
      <HeroSection />

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

      <Footer onOpenPolicy={handlePolicyOpen} />
      <PolicyModal type={activePolicy} onClose={handlePolicyClose} />
    </div>
  )
}

const DynamicIsland = ({ scrollY }) => {
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
          <button className="text-xs font-medium bg-white text-black px-3 py-1.5 rounded-full hover:bg-zinc-200 transition-colors">
            下载
          </button>
        </div>
      </div>
    </div>
  )
}

const HeroSection = () => (
  <header className="relative pt-48 pb-24 px-6 flex flex-col items-center text-center">
    <div className="mb-6 animate-fade-in opacity-0" style={{ animationFillMode: 'forwards' }}>
      <div className="w-24 h-14 rounded-[1.25rem] border border-zinc-200 bg-white shadow-lg shadow-zinc-200/70 flex items-center justify-center mx-auto">
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
      <button className="flex-1 py-3.5 bg-zinc-900 text-white rounded-full font-medium text-sm hover:bg-black/80 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-zinc-900/20">
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
