import { useId } from 'react'
import { useLocale } from '../locale-toggle'

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

// 开放式箭头头部：比实心三角更轻盈，贴近 Apple 图示语言
const ArrowHeadMarker = ({ id }) => (
  <marker id={id} viewBox="0 0 8 8" refX="6.2" refY="4" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
    <path d="M1.5 1L6.5 4L1.5 7" stroke="var(--apple-muted)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </marker>
)

const flowLineProps = {
  stroke: 'var(--apple-muted)',
  strokeOpacity: '0.55',
  strokeWidth: '1',
  strokeLinecap: 'round',
  strokeDasharray: '1 6',
}

const FlowDashAnimation = () => (
  <animate attributeName="stroke-dashoffset" from="0" to="-14" dur="2.8s" repeatCount="indefinite"/>
)

// 水平连接线（细点线 + 流动动画）
const FlowArrow = ({ label, sublabel, direction = 'right', animate = true, className = '' }) => {
  const headId = `${useId()}-head`
  return (
    <div className={`flex flex-col items-center gap-1.5 ${className}`}>
      <svg width="100%" height="20" viewBox="0 0 120 20" fill="none" className="overflow-visible" aria-hidden="true">
        <defs>
          <ArrowHeadMarker id={headId} />
        </defs>
        <line
          x1={direction === 'both' ? 9 : 4}
          y1="10"
          x2="111"
          y2="10"
          {...flowLineProps}
          markerEnd={`url(#${headId})`}
          markerStart={direction === 'both' ? `url(#${headId})` : undefined}
        >
          {animate && <FlowDashAnimation />}
        </line>
      </svg>
      <span className="text-[11px] sm:text-[12px] font-medium tracking-[0.01em] text-[color:var(--apple-muted)] whitespace-nowrap leading-tight">{label}</span>
      {sublabel && <span className="text-[9px] sm:text-[10px] tracking-[0.08em] text-[color:var(--apple-muted)] opacity-60 whitespace-nowrap leading-tight">{sublabel}</span>}
    </div>
  )
}

// 垂直连接线
const FlowArrowVertical = ({ label, sublabel, direction = 'down', animate = true }) => {
  const headId = `${useId()}-head`
  return (
    <div className="flex items-center gap-2.5 py-2.5">
      <svg width="24" height="56" viewBox="0 0 24 56" fill="none" aria-hidden="true">
        <defs>
          <ArrowHeadMarker id={headId} />
        </defs>
        <line
          x1="12"
          y1={direction === 'both' ? 9 : 5}
          x2="12"
          y2="51"
          {...flowLineProps}
          markerEnd={`url(#${headId})`}
          markerStart={direction === 'both' ? `url(#${headId})` : undefined}
        >
          {animate && <FlowDashAnimation />}
        </line>
      </svg>
      <div className="flex flex-col gap-0.5">
        <span className="text-[11px] sm:text-[12px] font-medium tracking-[0.01em] text-[color:var(--apple-muted)] whitespace-nowrap leading-tight">{label}</span>
        {sublabel && <span className="text-[9px] sm:text-[10px] tracking-[0.08em] text-[color:var(--apple-muted)] opacity-60 whitespace-nowrap leading-tight">{sublabel}</span>}
      </div>
    </div>
  )
}

// 玻璃态特性标签
const FeatureChip = ({ children }) => (
  <span className="whitespace-nowrap rounded-full border border-[color:var(--apple-line)] bg-[color:var(--apple-card)] px-2.5 py-[3px] text-[10px] leading-tight text-[color:var(--apple-muted)] backdrop-blur-[6px]">
    {children}
  </span>
)

// 节点名称 + 说明
const NodeCaption = ({ title, desc }) => (
  <div className="mt-3 text-center">
    <div className="text-[15px] font-semibold tracking-[-0.01em] text-[color:var(--apple-ink)]">{title}</div>
    <div className="mt-1 text-[12px] text-[color:var(--apple-muted)]">{desc}</div>
  </div>
)

// Chat V2 节点：对话气泡背景 + 特性标签
const ChatNode = ({ chatFeatures, chatFeaturesRow4, desc, bubbleClassName }) => (
  <div className="flex flex-col items-center">
    <div className={`relative ${bubbleClassName}`}>
      <svg className="absolute inset-0 h-full w-full opacity-[0.08]" viewBox="0 0 56 56" fill="none" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <rect x="2" y="4" width="52" height="40" rx="8" fill="var(--apple-muted)"/>
        <path d="M16 44L22 51L28 44" fill="var(--apple-muted)"/>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 px-5 pb-7 pt-2">
        <div className="flex flex-wrap justify-center gap-1.5">
          {chatFeatures.map((feat) => (
            <FeatureChip key={feat}>{feat}</FeatureChip>
          ))}
        </div>
        <div className="flex justify-center gap-1.5">
          {chatFeaturesRow4.map((feat) => (
            <FeatureChip key={feat}>{feat}</FeatureChip>
          ))}
        </div>
      </div>
    </div>
    <NodeCaption title="Chat V2" desc={desc} />
  </div>
)

// Learning Hub 节点：文件夹背景 + 资源类型
const HubNode = ({ resourceTypes, desc, folderClassName, iconSize = 20 }) => (
  <div className="flex flex-col items-center">
    <div className={`relative ${folderClassName}`}>
      <svg className="absolute inset-0 h-full w-full opacity-[0.10]" viewBox="0 0 48 48" fill="none" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
        <path d="M6 10C6 8.895 6.895 8 8 8H18L21 11H40C41.105 11 42 11.895 42 13V39C42 40.105 41.105 41 40 41H8C6.895 41 6 40.105 6 39V10Z" fill="#E8B849"/>
        <path d="M6 10C6 8.895 6.895 8 8 8H17C17.552 8 18 8.448 18 9V11H6V10Z" fill="#D4A53A"/>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center px-8 pt-7">
        <div className="grid grid-cols-4 justify-items-center gap-x-5 gap-y-3">
          {resourceTypes.map((item) => (
            <div key={item.label} className="flex flex-col items-center gap-1">
              <item.Icon size={iconSize} />
              <span className="whitespace-nowrap text-[9px] leading-tight text-[color:var(--apple-muted)]">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
    <NodeCaption title="Learning Hub" desc={desc} />
  </div>
)

// Skills 玻璃态卡片
const SkillsCard = ({ skillTools, subtitle, className = '' }) => (
  <div className={`glass-card rounded-[1.25rem] px-5 py-5 ${className}`}>
    <div className="text-center">
      <div className="text-[16px] font-semibold tracking-[-0.01em] text-[color:var(--apple-ink)]">Skills</div>
      <div className="mt-1 text-[11px] text-[color:var(--apple-muted)]">{subtitle}</div>
    </div>
    <div className="mt-3.5 border-t border-[color:var(--apple-line)] pt-3.5">
      <div className="grid grid-cols-2 gap-1.5">
        {skillTools.map((tool) => (
          <div key={tool} className="flex items-center gap-1.5 rounded-lg border border-[color:var(--apple-line)] bg-[color:var(--apple-card)] px-2 py-1.5">
            <svg width="8" height="8" viewBox="0 0 10 10" fill="none" className="shrink-0" aria-hidden="true">
              <circle cx="5" cy="5" r="2" fill="var(--apple-muted)" opacity="0.5"/>
            </svg>
            <span className="text-[10px] leading-tight text-[color:var(--apple-muted)]">{tool}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
)

// VFS 玻璃态卡片
const VFSCard = ({ t, className = '' }) => (
  <div className={`glass-card rounded-[1.25rem] px-5 py-5 ${className}`}>
    <div className="text-center">
      <div className="text-[16px] font-semibold tracking-[-0.01em] text-[color:var(--apple-ink)]">VFS</div>
      <div className="mt-1 text-[11px] text-[color:var(--apple-muted)]">{t('arch.vfs.desc', '虚拟文件系统 · 学习数据')}</div>
    </div>
    <div className="mt-3.5 border-t border-[color:var(--apple-line)] pt-3.5">
      <div className="flex items-center justify-center gap-2">
        <span className="text-[10px] text-[color:var(--apple-muted)] opacity-70">SQLite</span>
        <span className="text-[10px] text-[color:var(--apple-muted)] opacity-40">+</span>
        <span className="text-[10px] text-[color:var(--apple-muted)] opacity-70">LanceDB</span>
        <span className="text-[10px] text-[color:var(--apple-muted)] opacity-40">+</span>
        <span className="text-[10px] text-[color:var(--apple-muted)] opacity-70">Blob</span>
      </div>
      <div className="mt-1.5 text-center">
        <span className="text-[10px] text-[color:var(--apple-muted)] opacity-50">{t('arch.storage', '全部数据本地存储')}</span>
      </div>
    </div>
    <div className="mt-3.5 border-t border-[color:var(--apple-line)] pt-3.5">
      <div className="flex flex-col gap-1.5 text-center">
        <span className="text-[10px] font-medium text-[color:var(--apple-muted)]">{t('arch.vfs.ocr', '多引擎级联 OCR')}</span>
        <span className="text-[10px] font-medium text-[color:var(--apple-muted)]">{t('arch.vfs.vector', '多维度向量引擎')}</span>
        <div className="mt-0.5 flex items-center justify-center gap-2">
          <span className="text-[9px] text-[color:var(--apple-muted)] opacity-50">{t('arch.vfs.vector.text', '文本嵌入')}</span>
          <span className="text-[9px] text-[color:var(--apple-muted)] opacity-30">|</span>
          <span className="text-[9px] text-[color:var(--apple-muted)] opacity-50">{t('arch.vfs.vector.cross', '跨维度检索')}</span>
        </div>
      </div>
    </div>
  </div>
)

// 架构图区块
export const ArchitectureDiagram = ({ motionScale = 1 }) => {
  const { t } = useLocale()
  const shouldAnimate = motionScale > 0

  const chatFeatures = [
    t('arch.chat.feat.latex', 'LaTeX 渲染'),
    t('arch.chat.feat.cot', '思维链'),
    t('arch.chat.feat.multimodal', '多模态'),
    t('arch.chat.feat.attach', '附件自动 OCR'),
    t('arch.chat.feat.mcp', 'MCP 工具协议'),
    t('arch.chat.feat.rag', 'RAG 检索增强'),
    t('arch.chat.feat.session', '会话分组'),
  ]
  const chatFeaturesRow4 = [
    t('arch.chat.feat.parallel', '并行对比'),
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

  const skillsSubtitle = t('arch.skills.subtitle', '技能编排 · 按需加载')
  const chatDesc = t('arch.chat.desc', '智能对话')
  const hubDesc = t('arch.hub.desc', '学习资源管理器')

  return (
    <section
      className={`px-4 py-20 sm:px-6 sm:py-28 ${shouldAnimate ? 'animate-fade-in' : ''}`}
      style={shouldAnimate ? { animationDelay: '0.24s' } : undefined}
    >
      <div className="mx-auto max-w-[80rem]">
        {/* 标题 */}
        <div className="mb-14 text-center sm:mb-20">
          <h2 className="mb-3 font-display text-[1.75rem] font-semibold leading-[1.1] tracking-[-0.02em] text-[color:var(--apple-ink)] sm:mb-4 sm:text-[2.5rem]">
            {t('stats.title', '为深度学习而生')}
          </h2>
          <p className="mx-auto max-w-2xl text-[15px] leading-relaxed text-[color:var(--apple-muted)] sm:text-[17px]">
            {t('stats.subtitle', '从对话入口到数据底座，前后端围绕学习闭环协同设计')}
          </p>
        </div>

        {/* 桌面端：三列 Grid 布局（md+） */}
        <div className="hidden md:block max-w-[720px] mx-auto">
          <div className="grid grid-cols-[1fr_auto_1fr]">
            {/* 第一行：Chat V2 | 引用资源连接 | Learning Hub */}
            <div className="flex flex-col items-center justify-center py-4">
              <ChatNode
                chatFeatures={chatFeatures}
                chatFeaturesRow4={chatFeaturesRow4}
                desc={chatDesc}
                bubbleClassName="w-[260px] h-[200px]"
              />
            </div>

            <div className="flex items-center justify-center px-4">
              <FlowArrow label={t('arch.arrow.ref', '引用资源')} direction="both" animate={shouldAnimate} />
            </div>

            <div className="flex flex-col items-center justify-center py-4">
              <HubNode
                resourceTypes={resourceTypes}
                desc={hubDesc}
                folderClassName="w-[240px] h-[180px]"
                iconSize={20}
              />
            </div>

            {/* 箭头行：Chat → Skills */}
            <div className="flex justify-center">
              <FlowArrowVertical label={t('arch.arrow.invoke', '调用')} direction="down" animate={shouldAnimate} />
            </div>

            {/* 中列留空 */}
            <div />

            {/* 箭头行：Hub ↔ VFS */}
            <div className="flex justify-center">
              <FlowArrowVertical label={t('arch.arrow.rw', '读写')} sublabel="DSTU" direction="both" animate={shouldAnimate} />
            </div>

            {/* 第二行：Skills | 工具调用连接 | VFS */}
            <div className="flex flex-col items-stretch py-2">
              <SkillsCard skillTools={skillTools} subtitle={skillsSubtitle} className="w-full" />
            </div>

            <div className="flex items-center justify-center px-4">
              <FlowArrow label={t('arch.arrow.tools', '工具调用')} sublabel="RAG" direction="right" animate={shouldAnimate} />
            </div>

            <div className="flex flex-col items-stretch py-2">
              <VFSCard t={t} className="w-full" />
            </div>
          </div>
        </div>

        {/* 移动端：垂直堆叠布局 */}
        <div className="flex flex-col items-center md:hidden">
          <ChatNode
            chatFeatures={chatFeatures}
            chatFeaturesRow4={chatFeaturesRow4}
            desc={chatDesc}
            bubbleClassName="w-[280px] h-[190px]"
          />

          <FlowArrowVertical label={t('arch.arrow.invoke', '调用')} direction="down" animate={shouldAnimate} />

          <SkillsCard skillTools={skillTools} subtitle={skillsSubtitle} className="w-full max-w-[300px]" />

          <FlowArrowVertical label={t('arch.arrow.tools', '工具调用')} sublabel="RAG" direction="down" animate={shouldAnimate} />

          <VFSCard t={t} className="w-full max-w-[300px]" />

          <FlowArrowVertical label={t('arch.arrow.rw', '读写')} sublabel="DSTU" direction="both" animate={shouldAnimate} />

          <HubNode
            resourceTypes={resourceTypes}
            desc={hubDesc}
            folderClassName="w-[290px] h-[210px]"
            iconSize={22}
          />
        </div>
      </div>
    </section>
  )
}
