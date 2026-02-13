import { useCallback, useSyncExternalStore } from 'react'
import { cn } from '../lib/utils'

// Locale values: 'zh' | 'zh-Hant' | 'en'
const LOCALE_KEY = 'ds-locale-preference'

// Translations
const translations = {
  zh: {
    // Nav
    'nav.features': '功能',
    'nav.qa': 'QA',
    'nav.docs': '文档',
    'nav.download': '下载',
    
    // Hero
    'hero.headline.top': '成为您的',
    'hero.headline.bottom': '终身学习空间',
    'hero.cta.download': '立即下载',
    'hero.cta.explore': '了解更多',
    'hero.scrollDown': '向下滚动',

    // Hero Preview
    'hero.preview.chat': '智能对话',
    'hero.preview.skills': '技能系统',
    'hero.preview.knowledge': '学习资源',
    'hero.preview.providers': 'Anki 制卡',
    'hero.preview.subtext.chat': '智能对话，更聪明地理解你的每一步',
    'hero.preview.subtext.skills': '按需装配，只装你此刻需要的',
    'hero.preview.subtext.knowledge': '你的资料只在你手里',
    'hero.preview.subtext.providers': '聊天就能制卡',

    // Free Models
    'freeModels.title': '免费模型，开箱即用',
    'freeModels.desc': '合作伙伴免费提供的 AI 模型，无需 API Key，下载即用。',
    'freeModels.poweredBy': 'Powered by SiliconFlow',
    
    // Feature Tabs
    
    // ========== AI Agent ==========
    'feature.agent.title': 'AI 智能体 · 全能助手',
    'feature.agent.desc': '65 个内置工具按需加载，13+ 家 LLM 供应商。渐进披露架构，连接一切学习工具。',
    'agent.multiModel': '多模型协作',
    'agent.multiModelDesc': '同时调用多个大模型',
    'agent.skills': '技能管理',
    'agent.skillsDesc': '自定义 Agent 行为',
    'agent.session': '会话管理',
    'agent.sessionDesc': '高效管理多任务会话',

    // ========== Deep Research ==========
    'feature.research.title': '深度调研',
    'feature.research.desc': '联网搜索最新信息，多步任务自动规划执行。从信息获取到报告生成，一步到位。',



    // ========== Module 1 extras ==========
    'agent.group': '分组配置',
    'agent.groupDesc': '个性化分组与技能预设',

    // ========== MCP 工具生态 ==========
    'feature.mcp.title': 'MCP 工具生态',
    'feature.mcp.desc': '支持 MCP 协议，无缝集成 Context7、Arxiv 等外部工具。一键调用，无限扩展 AI 能力边界。',
    'mcp.context7': 'Context7 文档',
    'mcp.context7Desc': '实时查询技术文档',
    'mcp.arxiv': 'Arxiv 论文',
    'mcp.arxivDesc': '搜索最新学术论文',
    'mcp.output': '结构化输出',
    'mcp.outputDesc': '自动整理调研结果',

    // ========== 深度调研 subs ==========
    'research.execute': '任务执行',
    'research.executeDesc': '多步搜索，自动规划',
    'research.progress': '进度追踪',
    'research.progressDesc': '实时任务状态反馈',
    'research.report': '报告输出',
    'research.reportDesc': '结构化调研报告',
    'research.save': '自动归档',
    'research.saveDesc': '报告自动保存至笔记',

    // ========== 深度阅读 ==========
    'feature.reading.title': '深度阅读',
    'feature.reading.desc': 'PDF/Word 分屏阅读，AI 逐页精读解析。选择页码追问，双引擎 OCR 精准识别。',
    'reading.pdfSelect': '选页追问',
    'reading.pdfSelectDesc': '选择页面范围精准提问',
    'reading.pdfDeep': 'AI 精读',
    'reading.pdfDeepDesc': '逐页内容深度解析',
    'reading.docx': 'Word 解析',
    'reading.docxDesc': '试卷/文档结构化分析',

    // ========== 知识导图 subs ==========
    'mindmap.iterate': '多轮完善',
    'mindmap.iterateDesc': 'AI 分步展开细化节点',
    'mindmap.complete': '完整导图',
    'mindmap.completeDesc': '30→110 节点全景图',
    'mindmap.editView': '导图编辑',
    'mindmap.editViewDesc': '可视化节点拖拽编辑',
    'mindmap.outline': '大纲视图',
    'mindmap.outlineDesc': '层级文本快速浏览',
    'mindmap.recite': '背诵模式',
    'mindmap.reciteDesc': '遮盖节点自测复习',

    // ========== 笔记 & 记忆管理 ==========
    'feature.notes_memory.title': '笔记 & 记忆管理',
    'feature.notes_memory.desc': '富文本笔记编辑，向量化记忆系统。AI 自动生成记忆条目，本地 RAG 永不遗忘。',
    'memory.generate': 'AI 生成记忆',
    'memory.generateDesc': '对话中自动提取关键知识',
    'memory.list': '记忆管理',
    'memory.listDesc': '按主题分类浏览记忆',
    'memory.detail': '记忆详情',
    'memory.detailDesc': '富文本内容与关联笔记',
    'memory.files': '文件浏览',
    'memory.filesDesc': '记忆文档可视化管理',
    'memory.vector': '向量化索引',
    'memory.vectorDesc': '全量资源自动向量化',

    // ========== 智能题库 ==========
    'feature.qbank_full.title': '智能题库',
    'feature.qbank_full.desc': 'AI 根据教材自动生成题目集，支持做题、解析、知识点统计。错题自动归档，科学练习。',
    'qbank.browse': '题库浏览',
    'qbank.browseDesc': '难度分布与知识点覆盖',
    'qbank.practice': '做题解析',
    'qbank.practiceDesc': 'AI 实时解题思路分析',
    'qbank.analysis': '解题过程',
    'qbank.analysisDesc': '多步推理详细解析',
    'qbank.knowledge': '知识点视图',
    'qbank.knowledgeDesc': '知识点分类与掌握率',

    // ========== 作文批改 expanded ==========
    'feature.essay_full.title': '作文批改',
    'feature.essay_full.desc': '支持 7+ 考试类型，流式多维评分。精准标注优秀段落，给出针对性修改建议。支持手写作文 OCR 识别。',
    'essay.types': '多类型支持',
    'essay.typesDesc': '高考/雅思/考研/四六级等',
    'essay.detail': '修改建议',
    'essay.detailDesc': '逐句批注与替换推荐',

    // ========== 翻译工作台 ==========
    'feature.translation.title': '翻译工作台',
    'feature.translation.desc': '支持 11 种语言互译，文本/图片/文档多模式输入。流式翻译、正式度调节、TTS 朗读，历史记录自动归档至 VFS。',
    'translation.multiInput': '多模式输入',
    'translation.multiInputDesc': '文本、图片 OCR、文档上传',
    'translation.streaming': '流式翻译',
    'translation.streamingDesc': '实时翻译输出，支持打断',
    'translation.tone': '正式度调节',
    'translation.toneDesc': '正式 / 休闲 / 自动风格切换',
    'translation.tts': 'TTS 朗读',
    'translation.ttsDesc': '高质量语音朗读辅助听力',

    // ========== Anki 智能制卡 ==========
    'feature.anki_full.title': 'Anki 智能制卡',
    'feature.anki_full.desc': '上传文档自动分析生成卡片，支持多模板、卡片预览、AnkiConnect 一键同步到 Anki 桌面端。',
    'anki.upload': '文档上传',
    'anki.uploadDesc': '选择文件添加到对话',
    'anki.preview': '卡片预览',
    'anki.previewDesc': '60 张卡片轮播预览',
    'anki.import': 'Anki 导入',
    'anki.importDesc': 'AnkiConnect 一键推送',
    'anki.tasks': '任务管理',
    'anki.tasksDesc': '制卡进度与统计看板',
    'anki.templates': '模板管理',
    'anki.templatesDesc': '10+ 内置卡片模板',

    
    
    
    
    
    // ========== 知识导图 ==========
    'feature.mindmap.title': '知识导图',
    'feature.mindmap.desc': '思维导图、逻辑树、组织架构图等多种布局。节点编辑、搜索定位，导出 OPML/Markdown/JSON/图片。',

    // Stats Highlight
    'stats.title': '为深度学习而生',
    'stats.subtitle': '渐进披露架构，工具按需加载，覆盖学习全场景',
    'stats.tools': '内置工具',
    'stats.toolsDesc': '知识检索、笔记、Anki、题库、导图等',
    'stats.providers': 'API 供应商',
    'stats.providersDesc': 'OpenAI、Claude、硅基流动等',
    'stats.modes': '练习模式',
    'stats.modesDesc': '顺序、随机、错题优先等',
    'stats.formats': '文档格式',
    'stats.formatsDesc': 'PDF、Word、EPUB 等',

    // Sub-features - 智能对话
    
    // Sub-features - 学习资源
    
    // Sub-features - 技能系统
    
    // Sub-features - Anki 制卡
    
    // Sub-features - 本地优先

    // Features
    
    // Cards
    
    // Notebook sample
    
    // Flashcard
    
    // Download
    'download.title': '下载 DeepStudent',
    'download.subtitle': '基于 Tauri 2.0 构建，本地优先的 AI 原生学习系统',
    'download.selectPlatform': '选择平台',
    'download.backHome': '返回首页',
    'download.dmgInstall': '正式版',
    'download.preview': '预览版',
    'download.version': '版本',
    'download.size': '大小',
    'download.system': '系统',
    'download.downloadDmg': '下载 DMG',
    'download.downloadExe': '下载 EXE',
    'download.requirements.macos': 'macOS 13+，Apple Silicon / Intel',
    'download.requirements.windows': 'Windows 11 / 10 22H2+',
    'download.description.macos': '全功能版本：智能对话、学习资源管理、Anki 制卡、题库练习、作文批改、知识导图、翻译工作台等。Apple Silicon 与 Intel 双架构优化。',
    'download.description.windows': '功能与 macOS 版一致。基于 NSIS 安装程序，部分功能仍在持续优化中。',
    'download.note.windowsPreview': 'Windows 版目前为预览版，如遇问题请在 GitHub 提交 Issue。',
    
    // FAQ
    'faq.title': '常见问题',
    'faq.subtitle': '关于 DeepStudent 的疑问解答',
    'faq.openSource.q': 'DeepStudent 是开源的吗？',
    'faq.openSource.a': '是的，DeepStudent 遵循 AGPL-3.0 开源许可证，完全开源。你可以在 GitHub 查看源码、提交 Issue 或参与共建。',
    'faq.openSource.link': '前往 GitHub',
    'faq.privacy.q': '我的数据存储在哪里？',
    'faq.privacy.a': 'DeepStudent 是本地优先应用。所有数据（SQLite 元数据 + LanceDB 向量库 + Blob 文件）存储在你的设备上，支持完整备份与审计。',
    'faq.privacy.action': '查看隐私政策',
    'faq.macosQuarantine.q': 'macOS 安装后提示“已损坏，无法打开”怎么办？',
    'faq.macosQuarantine.a': '可以在终端执行以下命令（把 <应用路径> 替换为你的应用路径；也可以把应用图标拖进终端自动填充路径）：',
    'faq.macosQuarantine.code': 'sudo xattr -r -d com.apple.quarantine <应用路径>',
    'faq.macosQuarantine.link': '查看完整步骤',
    'faq.windowsPreview.q': '如何配置 AI 模型？',
    'faq.windowsPreview.a': '进入设置 → API 配置，添加你的 AI 服务供应商（如 OpenAI、Anthropic、硅基流动等）的 API 密钥。推荐使用硅基流动的"一键分配"功能快速完成配置。',
    
    // Footer
    'footer.privacy': '隐私',
    'footer.about': '关于',
    'footer.terms': '条款',
    'footer.xiaohongshu': '小红书',
    
    // Policy Content
    'policy.about.title': '关于 DeepStudent',
    'policy.about.description': 'AI 原生的本地优先开源学习系统，将智能对话、知识管理、Anki 制卡与全能阅读器无缝融合。',
    'policy.about.section1.title': '核心理念',
    'policy.about.section1.body': '构建完全 AI 原生的学习闭环，解决碎片化学习痛点。',
    'policy.about.section1.point1': '虚拟文件系统 VFS 作为所有学习资源的单一数据源，AI 可读可检索。',
    'policy.about.section1.point2': '本地优先，数据安全可控，支持完整审计与备份。',
    'policy.about.section1.point3': 'Chat AI 通过 Skills 工具组原生检索、阅读、编辑所有子应用数据。',
    'policy.about.section2.title': '开源与共建',
    'policy.about.section2.body': 'DeepStudent 完全开源，欢迎提交 Issue 与 PR，共同改进学习体验。',
    'policy.about.section2.point1': '保持透明的开发节奏与版本发布记录。',
    'policy.about.section2.point2': '持续吸收社区的真实需求反馈。',
    'policy.about.section3.title': '联系我们',
    'policy.about.section3.body': '合作或建议请发送邮件至 support@deepstudent.cn，我们会尽快回复。',
    'policy.about.footer': '感谢你与我们一起打造更聪明、更高效的学习方式。更新日期：2026 年 2 月 4 日。',

    'policy.privacy.title': '隐私政策',
    'policy.privacy.description':
      'DeepStudent（以下简称“本软件”或“我们”）由 DeepStudent Team 开发，是一款本地人工智能辅助学习工具。本政策说明我们如何收集、使用、存储并保护信息；你安装、访问或使用本软件，即表示你已阅读、理解并同意本政策。',
    'policy.privacy.section1.title': '信息收集范围',
    'policy.privacy.section1.body': '我们可能会收集以下匿名技术信息（仅限官方网站访问行为）。',
    'policy.privacy.section1.point1': '网站访问数据：页面浏览量、访问来源、停留时长、点击热区；用于网站性能优化与内容改进。',
    'policy.privacy.section1.point2': '重要承诺：上述信息采用完全匿名化技术处理，不包含 IP 地址、设备标识符或其他可识别个人身份的信息。',
    'policy.privacy.section1.point3': '本地软件说明：DeepStudent 桌面端除你主动配置的第三方 API 调用外，不存在其他联网行为；本地调试数据仅存于你的设备。',
    'policy.privacy.section2.title': '明确不收集的信息',
    'policy.privacy.section2.body': '我们郑重承诺，以下信息不会被本软件收集、传输或处理：',
    'policy.privacy.section2.point1': 'API 密钥：你配置的任何第三方模型服务 API Key。',
    'policy.privacy.section2.point2': '对话内容：你与大模型的所有聊天记录、提问及回复。',
    'policy.privacy.section2.point3': '用户数据：学习资源、Anki 卡牌、知识库内容、向量数据库、自定义配置及本地文件。',
    'policy.privacy.section2.point4': '个人身份信息：姓名、联系方式、设备标识符、地理位置、网络行为轨迹等。',
    'policy.privacy.section2.point5': '衍生数据：基于你使用行为分析得出的任何画像或统计结果。',
    'policy.privacy.section3.title': '数据存储与本地化原则',
    'policy.privacy.section3.body': '本软件采用本地优先架构设计，默认仅在你的设备上处理与存储数据。',
    'policy.privacy.section3.point1': '所有用户数据（包括聊天记录、卡牌数据、知识库等）仅存储于你的设备本地存储空间。',
    'policy.privacy.section3.point2': '不建立用户账户体系，无需注册登录。',
    'policy.privacy.section3.point3': '你对自己的数据拥有完全控制权：可在本地查看、导出或删除。',
    'policy.privacy.section4.title': '第三方服务与数据流转',
    'policy.privacy.section4.body':
      '本软件作为本地客户端工具，可通过你自行配置的 API Key 调用第三方模型服务（如硅基流动 SiliconFlow、OpenAI、Claude、月之暗面、通义千问等）。',
    'policy.privacy.section4.point1': '责任边界：模型推理由第三方提供商处理并返回结果，其数据处理受该提供商隐私政策约束。',
    'policy.privacy.section4.point2': '数据传输：你与第三方之间通过 TLS 加密通道直接通信。',
    'policy.privacy.section4.point3': '特别提示：对话数据一经发送至第三方模型服务，即脱离本软件控制范围。',
    'policy.privacy.section4.point4':
      '免责声明：如因第三方的数据留存、模型训练使用或跨境传输等行为导致风险或损失，我们不承担责任。',
    'policy.privacy.section5.title': '信息安全措施',
    'policy.privacy.section5.body': '尽管本软件的本地优先架构天然降低数据泄露风险，我们仍采取以下安全措施：',
    'policy.privacy.section5.point1': '代码开源/审计：核心代码开源，接受社区安全审计。',
    'policy.privacy.section5.point2': '无遥测架构：无数据上报功能，调试数据仅存储于本地。',
    'policy.privacy.section5.point3': '最小权限原则：仅请求必要的系统权限（如文件存储）。',
    'policy.privacy.section6.title': '未成年人保护',
    'policy.privacy.section6.body': '我们的服务主要面向企业或相关组织。',
    'policy.privacy.section6.point1': '未成年人使用本软件应已获得监护人同意，并在监护人指导下使用。',
    'policy.privacy.section7.title': '政策更新与通知',
    'policy.privacy.section7.body': '本协议可能随软件版本更新进行适当调整，请你定期关注。',
    'policy.privacy.section7.point1': '协议发生实质性变更时，我们将以适当方式提醒你。',
    'policy.privacy.section8.title': '联系我们',
    'policy.privacy.section8.body': '若你对本政策内容或隐私保护措施存在任何疑问，欢迎随时联系我们：',
    'policy.privacy.section8.point1': '隐私相关：support@deepstudent.cn',
    'policy.privacy.section8.point2': '我们将在收到反馈后的 15 个工作日内予以响应。',
    'policy.privacy.footer': '感谢你选择并信任 DeepStudent。更新日期：2026 年 2 月 4 日。',

    'policy.terms.title': '使用条款',
    'policy.terms.description': '',
    'policy.terms.section1.title': '服务内容',
    'policy.terms.section1.body': '我们提供 AI 智能对话、学习资源管理、知识检索、Anki 制卡、题库练习、作文批改、翻译工作台、知识导图等功能，能力会根据版本迭代持续更新。',
    'policy.terms.section1.point1': '测试功能可能存在不稳定，或者更新版本带来的不确定性。',
    'policy.terms.section2.title': '用户责任',
    'policy.terms.section2.body': '你需确保上传内容拥有合法使用权，并对信息安全负责。',
    'policy.terms.section2.point1': '禁止利用 DeepStudent 传播违法或侵权内容，内容由AI生成，请仔细甄别',
    'policy.terms.section3.title': '免责声明',
    'policy.terms.section3.body': '我们会尽力保证稳定，但因不可抗力或第三方原因导致的数据丢失、服务中断，我们不承担间接损失责任。',
    'policy.terms.section3.point1': '建议定期导出备份重要数据。',
    'policy.terms.footer': '使用本服务即视为同意上述条款。如有疑问请联系 support@deepstudent.cn。更新日期：2026 年 2 月 4 日。',
    
    // Policy
    'policy.understood': '我已了解',
    'policy.close': '关闭弹窗',
    
    // Theme
    
    // Locale
    'locale.select': '语言',
    'locale.zh': '简体中文',
    'locale.zhHant': '繁體中文',
    'locale.en': 'English',
  },
  'zh-Hant': {
    // Nav
    'nav.features': '功能',
    'nav.qa': 'QA',
    'nav.docs': '文件',
    'nav.download': '下載',

    // Hero
    'hero.headline.top': '成為您的',
    'hero.headline.bottom': '終身學習空間',
    'hero.cta.download': '立即下載',
    'hero.cta.explore': '了解更多',
    'hero.scrollDown': '向下滾動',

    // Hero Preview
    'hero.preview.chat': '智慧對話',
    'hero.preview.skills': '技能系統',
    'hero.preview.knowledge': '學習資源',
    'hero.preview.providers': 'Anki 製卡',
    'hero.preview.subtext.chat': '智慧對話，更聰明地理解你的每一步',
    'hero.preview.subtext.skills': '按需裝配，只裝你此刻需要的',
    'hero.preview.subtext.knowledge': '你的資料只在你手裡',
    'hero.preview.subtext.providers': '聊天就能製卡',

    // Free Models
    'freeModels.title': '免費模型，開箱即用',
    'freeModels.desc': '合作夥伴免費提供的 AI 模型，無需 API Key，下載即用。',
    'freeModels.poweredBy': 'Powered by SiliconFlow',

    // Feature Tabs
    
    // ========== AI Agent ==========
    'feature.agent.title': 'AI 智慧體 · 全能助手',
    'feature.agent.desc': '65 個內建工具按需載入，13+ 家 LLM 供應商。漸進披露架構，連接一切學習工具。',
    'agent.multiModel': '多模型協作',
    'agent.multiModelDesc': '同時調用多個大模型',
    'agent.skills': '技能管理',
    'agent.skillsDesc': '自定義 Agent 行為',
    'agent.session': '會話管理',
    'agent.sessionDesc': '高效管理多任務會話',

    // ========== Deep Research ==========
    'feature.research.title': '深度調研',
    'feature.research.desc': '聯網搜尋最新資訊，多步任務自動規劃執行。從資訊獲取到報告生成，一步到位。',



    // ========== Module 1 extras ==========
    'agent.group': '分組配置',
    'agent.groupDesc': '個性化分組與技能預設',

    // ========== MCP 工具生態 ==========
    'feature.mcp.title': 'MCP 工具生態',
    'feature.mcp.desc': '支援 MCP 協定，無縫整合 Context7、Arxiv 等外部工具。一鍵呼叫，無限擴展 AI 能力邊界。',
    'mcp.context7': 'Context7 文件',
    'mcp.context7Desc': '即時查詢技術文件',
    'mcp.arxiv': 'Arxiv 論文',
    'mcp.arxivDesc': '搜尋最新學術論文',
    'mcp.output': '結構化輸出',
    'mcp.outputDesc': '自動整理調研結果',

    // ========== 深度調研 subs ==========
    'research.execute': '任務執行',
    'research.executeDesc': '多步搜尋，自動規劃',
    'research.progress': '進度追蹤',
    'research.progressDesc': '即時任務狀態回饋',
    'research.report': '報告輸出',
    'research.reportDesc': '結構化調研報告',
    'research.save': '自動歸檔',
    'research.saveDesc': '報告自動儲存至筆記',

    // ========== 深度閱讀 ==========
    'feature.reading.title': '深度閱讀',
    'feature.reading.desc': 'PDF/Word 分屏閱讀，AI 逐頁精讀解析。選擇頁碼追問，雙引擎 OCR 精準識別。',
    'reading.pdfSelect': '選頁追問',
    'reading.pdfSelectDesc': '選擇頁面範圍精準提問',
    'reading.pdfDeep': 'AI 精讀',
    'reading.pdfDeepDesc': '逐頁內容深度解析',
    'reading.docx': 'Word 解析',
    'reading.docxDesc': '試卷/文檔結構化分析',

    // ========== 知識導圖 subs ==========
    'mindmap.iterate': '多輪完善',
    'mindmap.iterateDesc': 'AI 分步展開細化節點',
    'mindmap.complete': '完整導圖',
    'mindmap.completeDesc': '30→110 節點全景圖',
    'mindmap.editView': '導圖編輯',
    'mindmap.editViewDesc': '視覺化節點拖拽編輯',
    'mindmap.outline': '大綱視圖',
    'mindmap.outlineDesc': '層級文字快速瀏覽',
    'mindmap.recite': '背誦模式',
    'mindmap.reciteDesc': '遮蓋節點自測複習',

    // ========== 筆記 & 記憶管理 ==========
    'feature.notes_memory.title': '筆記 & 記憶管理',
    'feature.notes_memory.desc': '富文字筆記編輯，向量化記憶系統。AI 自動生成記憶條目，本地 RAG 永不遺忘。',
    'memory.generate': 'AI 生成記憶',
    'memory.generateDesc': '對話中自動提取關鍵知識',
    'memory.list': '記憶管理',
    'memory.listDesc': '按主題分類瀏覽記憶',
    'memory.detail': '記憶詳情',
    'memory.detailDesc': '富文字內容與關聯筆記',
    'memory.files': '檔案瀏覽',
    'memory.filesDesc': '記憶文檔視覺化管理',
    'memory.vector': '向量化索引',
    'memory.vectorDesc': '全量資源自動向量化',

    // ========== 智慧題庫 ==========
    'feature.qbank_full.title': '智慧題庫',
    'feature.qbank_full.desc': 'AI 根據教材自動生成題目集，支援做題、解析、知識點統計。錯題自動歸檔，科學練習。',
    'qbank.browse': '題庫瀏覽',
    'qbank.browseDesc': '難度分佈與知識點覆蓋',
    'qbank.practice': '做題解析',
    'qbank.practiceDesc': 'AI 即時解題思路分析',
    'qbank.analysis': '解題過程',
    'qbank.analysisDesc': '多步推理詳細解析',
    'qbank.knowledge': '知識點視圖',
    'qbank.knowledgeDesc': '知識點分類與掌握率',

    // ========== 作文批改 expanded ==========
    'feature.essay_full.title': '作文批改',
    'feature.essay_full.desc': '支援 7+ 考試類型，串流多維評分。精準標注優秀段落，給出針對性修改建議。支援手寫作文 OCR 識別。',
    'essay.types': '多類型支援',
    'essay.typesDesc': '高考/雅思/考研/四六級等',
    'essay.detail': '修改建議',
    'essay.detailDesc': '逐句批註與替換推薦',

    // ========== 翻譯工作台 ==========
    'feature.translation.title': '翻譯工作台',
    'feature.translation.desc': '支援 11 種語言互譯，文字/圖片/文件多模式輸入。串流翻譯、正式度調節、TTS 朗讀，歷史記錄自動歸檔至 VFS。',
    'translation.multiInput': '多模式輸入',
    'translation.multiInputDesc': '文字、圖片 OCR、文件上傳',
    'translation.streaming': '串流翻譯',
    'translation.streamingDesc': '即時翻譯輸出，支援打斷',
    'translation.tone': '正式度調節',
    'translation.toneDesc': '正式 / 休閒 / 自動風格切換',
    'translation.tts': 'TTS 朗讀',
    'translation.ttsDesc': '高品質語音朗讀輔助聽力',

    // ========== Anki 智慧製卡 ==========
    'feature.anki_full.title': 'Anki 智慧製卡',
    'feature.anki_full.desc': '上傳文檔自動分析生成卡片，支援多模板、卡片預覽、AnkiConnect 一鍵同步到 Anki 桌面端。',
    'anki.upload': '文檔上傳',
    'anki.uploadDesc': '選擇檔案新增到對話',
    'anki.preview': '卡片預覽',
    'anki.previewDesc': '60 張卡片輪播預覽',
    'anki.import': 'Anki 匯入',
    'anki.importDesc': 'AnkiConnect 一鍵推送',
    'anki.tasks': '任務管理',
    'anki.tasksDesc': '製卡進度與統計看板',
    'anki.templates': '模板管理',
    'anki.templatesDesc': '10+ 內建卡片模板',

    
    
    
    
    
    // ========== 知識導圖 ==========
    'feature.mindmap.title': '知識導圖',
    'feature.mindmap.desc': '思維導圖、邏輯樹、組織架構圖等多種佈局。節點編輯、搜尋定位，匯出 OPML/Markdown/JSON/圖片。',

    // Stats Highlight
    'stats.title': '為深度學習而生',
    'stats.subtitle': '漸進披露架構，工具按需載入，覆蓋學習全場景',
    'stats.tools': '內建工具',
    'stats.toolsDesc': '知識檢索、筆記、Anki、題庫、導圖等',
    'stats.providers': 'API 供應商',
    'stats.providersDesc': 'OpenAI、Claude、硅基流動等',
    'stats.modes': '練習模式',
    'stats.modesDesc': '順序、隨機、錯題優先等',
    'stats.formats': '文檔格式',
    'stats.formatsDesc': 'PDF、Word、EPUB 等',

    // Sub-features - 智慧對話
    
    // Sub-features - 學習資源
    
    // Sub-features - 技能系統
    
    // Sub-features - Anki 製卡
    
    // Sub-features - 本地優先

    // Features

    // Cards

    // Notebook sample

    // Flashcard

    // Download
    'download.title': '下載 DeepStudent',
    'download.subtitle': '基於 Tauri 2.0 建構，本地優先的 AI 原生學習系統',
    'download.selectPlatform': '選擇平台',
    'download.backHome': '返回首頁',
    'download.dmgInstall': '正式版',
    'download.preview': '預覽版',
    'download.version': '版本',
    'download.size': '大小',
    'download.system': '系統',
    'download.downloadDmg': '下載 DMG',
    'download.downloadExe': '下載 EXE',
    'download.requirements.macos': 'macOS 13+，Apple Silicon / Intel',
    'download.requirements.windows': 'Windows 11 / 10 22H2+',
    'download.description.macos': '全功能版本：智慧對話、學習資源管理、Anki 製卡、題庫練習、作文批改、知識導圖、翻譯工作台等。Apple Silicon 與 Intel 雙架構優化。',
    'download.description.windows': '功能與 macOS 版一致。基於 NSIS 安裝程式，部分功能仍在持續優化中。',
    'download.note.windowsPreview': 'Windows 版目前為預覽版，如遇問題請在 GitHub 提交 Issue。',

    // FAQ
    'faq.title': '常見問題',
    'faq.subtitle': '關於 DeepStudent 的疑問解答',
    'faq.openSource.q': 'DeepStudent 是開源的嗎？',
    'faq.openSource.a': '是的，DeepStudent 遵循 AGPL-3.0 開源授權，完全開源。你可以在 GitHub 查看原始碼、提交 Issue 或參與共建。',
    'faq.openSource.link': '前往 GitHub',
    'faq.privacy.q': '我的資料儲存在哪裡？',
    'faq.privacy.a': 'DeepStudent 是本地優先應用。所有資料（SQLite 元資料 + LanceDB 向量庫 + Blob 檔案）儲存在你的裝置上，支援完整備份與稽核。',
    'faq.privacy.action': '查看隱私政策',
    'faq.macosQuarantine.q': 'macOS 安裝後提示「已損壞，無法打開」怎麼辦？',
    'faq.macosQuarantine.a': '可以在終端執行以下命令（把 <應用路徑> 替換為你的應用路徑；也可以把應用圖示拖進終端自動填充路徑）：',
    'faq.macosQuarantine.code': 'sudo xattr -r -d com.apple.quarantine <應用路徑>',
    'faq.macosQuarantine.link': '查看完整步驟',
    'faq.windowsPreview.q': '如何配置 AI 模型？',
    'faq.windowsPreview.a': '進入設定 → API 配置，新增你的 AI 服務供應商（如 OpenAI、Anthropic、硅基流動等）的 API 金鑰。推薦使用硅基流動的「一鍵分配」功能快速完成配置。',

    // Footer
    'footer.privacy': '隱私',
    'footer.about': '關於',
    'footer.terms': '條款',
    'footer.xiaohongshu': '小紅書',
    
    // Policy Content
    'policy.about.title': '關於 DeepStudent',
    'policy.about.description': 'AI 原生的本地優先開源學習系統，將智慧對話、知識管理、Anki 製卡與全能閱讀器無縫融合。',
    'policy.about.section1.title': '核心理念',
    'policy.about.section1.body': '構建完全 AI 原生的學習閉環，解決碎片化學習痛點。',
    'policy.about.section1.point1': '虛擬檔案系統 VFS 作為所有學習資源的單一資料源，AI 可讀可檢索。',
    'policy.about.section1.point2': '本地優先，資料安全可控，支援完整稽核與備份。',
    'policy.about.section1.point3': 'Chat AI 透過 Skills 工具組原生檢索、閱讀、編輯所有子應用資料。',
    'policy.about.section2.title': '開源與共建',
    'policy.about.section2.body': 'DeepStudent 完全開源，歡迎提交 Issue 與 PR，共同改進學習體驗。',
    'policy.about.section2.point1': '保持透明的開發節奏與版本發布記錄。',
    'policy.about.section2.point2': '持續吸收社群的真實需求回饋。',
    'policy.about.section3.title': '聯絡我們',
    'policy.about.section3.body': '合作或建議請發送郵件至 support@deepstudent.cn，我們會盡快回覆。',
    'policy.about.footer': '感謝你與我們一起打造更聰明、更高效的學習方式。更新日期：2026 年 2 月 4 日。',

    'policy.privacy.title': '隱私政策',
    'policy.privacy.description':
      'DeepStudent（以下簡稱「本軟體」或「我們」）由 DeepStudent Team 開發，是一款本地人工智慧輔助學習工具。本政策說明我們如何收集、使用、儲存並保護資訊；你安裝、存取或使用本軟體，即表示你已閱讀、理解並同意本政策。',
    'policy.privacy.section1.title': '資訊收集範圍',
    'policy.privacy.section1.body': '我們可能會收集以下匿名技術資訊（僅限官方網站存取行為）。',
    'policy.privacy.section1.point1': '網站存取資料：頁面瀏覽量、訪問來源、停留時長、點擊熱區；用於網站效能優化與內容改進。',
    'policy.privacy.section1.point2': '重要承諾：上述資訊採用完全匿名化技術處理，不包含 IP 位址、裝置識別碼或其他可識別個人身分的資訊。',
    'policy.privacy.section1.point3': '本地軟體說明：DeepStudent 桌面端除你主動設定的第三方 API 呼叫外，不存在其他連網行為；本地除錯資料僅存於你的裝置。',
    'policy.privacy.section2.title': '明確不收集的資訊',
    'policy.privacy.section2.body': '我們鄭重承諾，以下資訊不會被本軟體收集、傳輸或處理：',
    'policy.privacy.section2.point1': 'API 金鑰：你設定的任何第三方模型服務 API Key。',
    'policy.privacy.section2.point2': '對話內容：你與大模型的所有聊天記錄、提問及回覆。',
    'policy.privacy.section2.point3': '使用者資料：學習資源、Anki 卡牌、知識庫內容、向量資料庫、自訂設定及本地檔案。',
    'policy.privacy.section2.point4': '個人身分資訊：姓名、聯絡方式、裝置識別碼、地理位置、網路行為軌跡等。',
    'policy.privacy.section2.point5': '衍生資料：基於你使用行為分析得出的任何畫像或統計結果。',
    'policy.privacy.section3.title': '資料儲存與本地化原則',
    'policy.privacy.section3.body': '本軟體採用本地優先架構設計，預設僅在你的裝置上處理與儲存資料。',
    'policy.privacy.section3.point1': '所有使用者資料（包含對話記錄、卡牌資料、知識庫等）僅儲存於你的裝置本地儲存空間。',
    'policy.privacy.section3.point2': '不建立使用者帳戶系統，無需註冊登入。',
    'policy.privacy.section3.point3': '你對自己的資料擁有完全控制權：可在本地檢視、匯出或刪除。',
    'policy.privacy.section4.title': '第三方服務與資料流轉',
    'policy.privacy.section4.body':
      '本軟體作為本地客戶端工具，可透過你自行設定的 API Key 呼叫第三方模型服務（如硅基流動 SiliconFlow、OpenAI、Claude、月之暗面、通義千問等）。',
    'policy.privacy.section4.point1': '責任邊界：模型推理由第三方提供商處理並回傳結果，其資料處理受該提供商隱私政策約束。',
    'policy.privacy.section4.point2': '資料傳輸：你與第三方之間透過 TLS 加密通道直接通信。',
    'policy.privacy.section4.point3': '特別提示：對話資料一經傳送至第三方模型服務，即脫離本軟體控制範圍。',
    'policy.privacy.section4.point4':
      '免責聲明：如因第三方的資料留存、模型訓練使用或跨境傳輸等行為導致風險或損失，我們不承擔責任。',
    'policy.privacy.section5.title': '資訊安全措施',
    'policy.privacy.section5.body': '儘管本軟體的本地優先架構天然降低資料外洩風險，我們仍採取以下安全措施：',
    'policy.privacy.section5.point1': '程式碼開源/審計：核心程式碼開源，接受社群安全審計。',
    'policy.privacy.section5.point2': '無遙測架構：無資料回傳功能，除錯資料僅儲存於本地。',
    'policy.privacy.section5.point3': '最小權限原則：僅請求必要的系統權限（如檔案儲存）。',
    'policy.privacy.section6.title': '未成年人保護',
    'policy.privacy.section6.body': '我們的服務主要面向企業或相關組織。',
    'policy.privacy.section6.point1': '未成年人使用本軟體應已取得監護人同意，並在監護人指導下使用。',
    'policy.privacy.section7.title': '政策更新與通知',
    'policy.privacy.section7.body': '本協議可能隨軟體版本更新進行適當調整，請你定期關注。',
    'policy.privacy.section7.point1': '協議發生實質性變更時，我們將以適當方式提醒你。',
    'policy.privacy.section8.title': '聯絡我們',
    'policy.privacy.section8.body': '若你對本政策內容或隱私保護措施存在任何疑問，歡迎隨時聯絡我們：',
    'policy.privacy.section8.point1': '隱私相關：support@deepstudent.cn',
    'policy.privacy.section8.point2': '我們將在收到回饋後的 15 個工作日內予以回覆。',
    'policy.privacy.footer': '感謝你選擇並信任 DeepStudent。更新日期：2026 年 2 月 4 日。',

    'policy.terms.title': '使用條款',
    'policy.terms.description': '',
    'policy.terms.section1.title': '服務內容',
    'policy.terms.section1.body': '我們提供 AI 智慧對話、學習資源管理、知識檢索、Anki 製卡、題庫練習、作文批改、翻譯工作台、知識導圖等功能，能力會根據版本迭代持續更新。',
    'policy.terms.section1.point1': '測試功能可能存在不穩定，或因版本更新帶來不確定性。',
    'policy.terms.section2.title': '使用者責任',
    'policy.terms.section2.body': '你需確保上傳內容擁有合法使用權，並對資訊安全負責。',
    'policy.terms.section2.point1': '禁止利用 DeepStudent 傳播違法或侵權內容，內容由AI生成，請仔細甄別',
    'policy.terms.section3.title': '免責聲明',
    'policy.terms.section3.body': '我們會盡力確保穩定，但因不可抗力或第三方原因導致的資料遺失、服務中斷，我們不承擔間接損失責任。',
    'policy.terms.section3.point1': '建議定期匯出備份重要資料。',
    'policy.terms.footer': '使用本服務即視為同意上述條款。如有疑問請聯絡 support@deepstudent.cn。更新日期：2026 年 2 月 4 日。',

    // Policy
    'policy.understood': '我已瞭解',
    'policy.close': '關閉彈窗',

    // Theme

    // Locale
    'locale.select': '語言',
    'locale.zh': '簡體中文',
    'locale.zhHant': '繁體中文',
    'locale.en': 'English',
  },
  en: {
    // Nav
    'nav.features': 'Features',
    'nav.qa': 'Q&A',
    'nav.docs': 'Docs',
    'nav.download': 'Download',
    
    // Hero
    'hero.headline.top': 'Become Your',
    'hero.headline.bottom': 'Lifelong Learning Space',
    'hero.cta.download': 'Download',
    'hero.cta.explore': 'Learn More',
    'hero.scrollDown': 'Scroll down',

    // Hero Preview
    'hero.preview.chat': 'AI Chat',
    'hero.preview.skills': 'Skills',
    'hero.preview.knowledge': 'Learning Hub',
    'hero.preview.providers': 'CardForge',
    'hero.preview.subtext.chat': 'Smarter chat that understands every step you take',
    'hero.preview.subtext.skills': 'Assemble on demand—only what you need right now',
    'hero.preview.subtext.knowledge': 'Your materials stay in your hands only',
    'hero.preview.subtext.providers': 'Create cards directly from chat',

    // Free Models
    'freeModels.title': 'Free models, ready out of the box',
    'freeModels.desc': 'Partner-provided AI models. No API key required. Download and use instantly.',
    'freeModels.poweredBy': 'Powered by SiliconFlow',
    
    // Feature Tabs
    
    // ========== AI Agent ==========
    'feature.agent.title': 'AI Agent · All-in-One Assistant',
    'feature.agent.desc': '65 built-in tools loaded on demand, 13+ LLM providers. Progressive disclosure architecture connecting all your learning tools.',
    'agent.multiModel': 'Multi-Model',
    'agent.multiModelDesc': 'Call multiple LLMs at once',
    'agent.skills': 'Skill Mgmt',
    'agent.skillsDesc': 'Customize agent behavior',
    'agent.session': 'Session Mgmt',
    'agent.sessionDesc': 'Manage multi-task chats',

    // ========== Deep Research ==========
    'feature.research.title': 'Deep Research',
    'feature.research.desc': 'Web search for latest info, multi-step tasks with auto planning and execution. From information to report generation, all in one step.',



    // ========== Module 1 extras ==========
    'agent.group': 'Group Config',
    'agent.groupDesc': 'Personalized groups & skill presets',

    // ========== MCP Ecosystem ==========
    'feature.mcp.title': 'MCP Tool Ecosystem',
    'feature.mcp.desc': 'MCP protocol support for seamless integration with Context7, Arxiv, and more external tools. One-click invocation, infinitely extensible AI capabilities.',
    'mcp.context7': 'Context7 Docs',
    'mcp.context7Desc': 'Real-time tech doc queries',
    'mcp.arxiv': 'Arxiv Papers',
    'mcp.arxivDesc': 'Search latest academic papers',
    'mcp.output': 'Structured Output',
    'mcp.outputDesc': 'Auto-organize research results',

    // ========== Deep Research subs ==========
    'research.execute': 'Task Execution',
    'research.executeDesc': 'Multi-step search, auto planning',
    'research.progress': 'Progress Tracking',
    'research.progressDesc': 'Real-time task status feedback',
    'research.report': 'Report Output',
    'research.reportDesc': 'Structured research reports',
    'research.save': 'Auto Archive',
    'research.saveDesc': 'Reports auto-saved to notes',

    // ========== Deep Reading ==========
    'feature.reading.title': 'Deep Reading',
    'feature.reading.desc': 'PDF/Word split-screen reading with AI page-by-page analysis. Select pages to ask follow-up questions. Dual OCR engine for precision.',
    'reading.pdfSelect': 'Page Selection',
    'reading.pdfSelectDesc': 'Select page ranges to ask precisely',
    'reading.pdfDeep': 'AI Deep Read',
    'reading.pdfDeepDesc': 'Page-by-page content analysis',
    'reading.docx': 'Word Parsing',
    'reading.docxDesc': 'Exam/document structure analysis',

    // ========== Knowledge Mindmap subs ==========
    'mindmap.iterate': 'Multi-round Refinement',
    'mindmap.iterateDesc': 'AI expands and refines nodes step by step',
    'mindmap.complete': 'Complete Mindmap',
    'mindmap.completeDesc': '30→110 nodes panoramic view',
    'mindmap.editView': 'Map Editor',
    'mindmap.editViewDesc': 'Visual node drag-and-drop editing',
    'mindmap.outline': 'Outline View',
    'mindmap.outlineDesc': 'Hierarchical text quick browse',
    'mindmap.recite': 'Recall Mode',
    'mindmap.reciteDesc': 'Cover nodes for self-testing',

    // ========== Notes & Memory ==========
    'feature.notes_memory.title': 'Notes & Memory Management',
    'feature.notes_memory.desc': 'Rich-text note editing and vectorized memory system. AI auto-generates memory entries. Local RAG ensures nothing is forgotten.',
    'memory.generate': 'AI Memory Gen',
    'memory.generateDesc': 'Auto-extract key knowledge from chats',
    'memory.list': 'Memory Manager',
    'memory.listDesc': 'Browse memories by topic',
    'memory.detail': 'Memory Details',
    'memory.detailDesc': 'Rich content & linked notes',
    'memory.files': 'File Browser',
    'memory.filesDesc': 'Visual memory document management',
    'memory.vector': 'Vector Index',
    'memory.vectorDesc': 'Auto-vectorize all resources',

    // ========== Smart Q-Bank ==========
    'feature.qbank_full.title': 'Smart Q-Bank',
    'feature.qbank_full.desc': 'AI generates problem sets from textbooks. Supports practice, analysis, and knowledge point statistics. Auto-archive wrong answers for scientific practice.',
    'qbank.browse': 'Q-Bank Browse',
    'qbank.browseDesc': 'Difficulty & knowledge coverage',
    'qbank.practice': 'Practice & Analysis',
    'qbank.practiceDesc': 'AI real-time problem solving',
    'qbank.analysis': 'Solution Process',
    'qbank.analysisDesc': 'Multi-step reasoning in detail',
    'qbank.knowledge': 'Knowledge View',
    'qbank.knowledgeDesc': 'Knowledge point classification & mastery',

    // ========== Essay Grading expanded ==========
    'feature.essay_full.title': 'Essay Grading',
    'feature.essay_full.desc': 'Supports 7+ exam types with streaming multi-dimensional scoring. Precisely annotate excellent passages with targeted improvement suggestions. Handwriting OCR supported.',
    'essay.types': 'Multi-type Support',
    'essay.typesDesc': 'Gaokao/IELTS/GRE/CET-4/6 & more',
    'essay.detail': 'Suggestions',
    'essay.detailDesc': 'Line-by-line annotation & replacement',

    // ========== Translation Workbench ==========
    'feature.translation.title': 'Translation Workbench',
    'feature.translation.desc': '11 languages supported, with text/image/document multi-mode input. Streaming translation, formality adjustment, TTS, and auto-archiving to VFS.',
    'translation.multiInput': 'Multi-mode Input',
    'translation.multiInputDesc': 'Text, image OCR, document upload',
    'translation.streaming': 'Streaming Translation',
    'translation.streamingDesc': 'Real-time output, interruptible',
    'translation.tone': 'Formality Control',
    'translation.toneDesc': 'Formal / Casual / Auto style toggle',
    'translation.tts': 'TTS Playback',
    'translation.ttsDesc': 'High-quality voice for listening practice',

    // ========== Anki CardForge ==========
    'feature.anki_full.title': 'Anki Smart CardForge',
    'feature.anki_full.desc': 'Upload documents for auto-analysis and card generation. Multi-template support, card preview, one-click AnkiConnect sync to Anki desktop.',
    'anki.upload': 'Doc Upload',
    'anki.uploadDesc': 'Select files to add to chat',
    'anki.preview': 'Card Preview',
    'anki.previewDesc': '60-card carousel preview',
    'anki.import': 'Anki Import',
    'anki.importDesc': 'AnkiConnect one-click push',
    'anki.tasks': 'Task Manager',
    'anki.tasksDesc': 'Card forge progress & stats dashboard',
    'anki.templates': 'Template Manager',
    'anki.templatesDesc': '10+ built-in card templates',

    
    
    
    
    
    // ========== Knowledge Mindmap ==========
    'feature.mindmap.title': 'Knowledge Mindmap',
    'feature.mindmap.desc': 'Mind map, logic tree, org chart & more layouts. Node editing, search & locate, export to OPML/Markdown/JSON/PNG.',

    // Stats Highlight
    'stats.title': 'Built for Deep Learning',
    'stats.subtitle': 'Progressive disclosure architecture with on-demand tool loading',
    'stats.tools': 'Built-in Tools',
    'stats.toolsDesc': 'RAG, notes, Anki, Q-bank, mindmap & more',
    'stats.providers': 'API Providers',
    'stats.providersDesc': 'OpenAI, Claude, SiliconFlow & more',
    'stats.modes': 'Practice Modes',
    'stats.modesDesc': 'Sequential, random, mistakes-first & more',
    'stats.formats': 'Doc Formats',
    'stats.formatsDesc': 'PDF, Word, EPUB & more',

    // Sub-features - AI Chat
    
    // Sub-features - Learning Hub
    
    // Sub-features - Skills
    
    // Sub-features - CardForge
    
    // Sub-features - Local-First

    // Features
    
    // Cards

    // Notebook sample

    // Flashcard
    
    // Download
    'download.title': 'Download DeepStudent',
    'download.subtitle': 'Built on Tauri 2.0, a local-first AI-native learning system',
    'download.selectPlatform': 'Select Platform',
    'download.backHome': 'Back to Home',
    'download.dmgInstall': 'Release',
    'download.preview': 'Preview',
    'download.version': 'Version',
    'download.size': 'Size',
    'download.system': 'System',
    'download.downloadDmg': 'Download DMG',
    'download.downloadExe': 'Download EXE',
    'download.requirements.macos': 'macOS 13+, Apple Silicon / Intel',
    'download.requirements.windows': 'Windows 11 / 10 22H2+',
    'download.description.macos': 'Full-featured: AI Chat, Learning Hub, Anki CardForge, Q-Bank, Essay Grading, Knowledge Mindmap, Translation Workbench & more. Optimized for Apple Silicon & Intel.',
    'download.description.windows': 'Same features as macOS. NSIS installer, some features still being optimized.',
    'download.note.windowsPreview': 'Windows is still in preview. If you encounter issues, please submit an Issue on GitHub.',
    
    // FAQ
    'faq.title': 'FAQ',
    'faq.subtitle': 'Common questions about DeepStudent',
    'faq.openSource.q': 'Is DeepStudent open source?',
    'faq.openSource.a': 'Yes. DeepStudent is licensed under AGPL-3.0 and fully open source. You can view the code, submit issues, or contribute on GitHub.',
    'faq.openSource.link': 'Open GitHub',
    'faq.privacy.q': 'Where is my data stored?',
    'faq.privacy.a': 'DeepStudent is a local-first app. All data (SQLite metadata + LanceDB vector store + blob files) is stored on your device, with full backup and audit support.',
    'faq.privacy.action': 'View Privacy Policy',
    'faq.macosQuarantine.q': 'macOS says the app is "damaged". What should I do?',
    'faq.macosQuarantine.a': 'Run the following command in Terminal (replace <App Path> with your app path; you can also drag the app into Terminal to auto-fill the path):',
    'faq.macosQuarantine.code': 'sudo xattr -r -d com.apple.quarantine <App Path>',
    'faq.macosQuarantine.link': 'See full steps',
    'faq.windowsPreview.q': 'How do I configure AI models?',
    'faq.windowsPreview.a': 'Go to Settings → API Configuration and add your AI provider API key (OpenAI, Anthropic, SiliconFlow, etc.). We recommend using SiliconFlow\'s "Quick Setup" for the fastest configuration.',
    
    // Footer
    'footer.privacy': 'Privacy',
    'footer.about': 'About',
    'footer.terms': 'Terms',
    'footer.xiaohongshu': 'Xiaohongshu',
    
    // Policy Content
    'policy.about.title': 'About DeepStudent',
    'policy.about.description': 'An AI-native, local-first open-source learning system that seamlessly integrates intelligent chat, knowledge management, Anki card generation, and a versatile document reader.',
    'policy.about.section1.title': 'Core Philosophy',
    'policy.about.section1.body': 'Build a fully AI-native learning loop, solving fragmented learning pain points.',
    'policy.about.section1.point1': 'VFS as single source of truth for all learning resources, AI-readable and searchable.',
    'policy.about.section1.point2': 'Local-first, secure data control with full audit and backup support.',
    'policy.about.section1.point3': 'Chat AI natively retrieves, reads, and edits all sub-app data via Skills toolset.',
    'policy.about.section2.title': 'Open source & community',
    'policy.about.section2.body': 'DeepStudent is fully open source. Issues and pull requests are welcome.',
    'policy.about.section2.point1': 'Transparent development and release history.',
    'policy.about.section2.point2': 'Continuously shaped by real community feedback.',
    'policy.about.section3.title': 'Contact',
    'policy.about.section3.body': "For collaboration or suggestions, email support@deepstudent.cn. We'll get back to you soon.",
    'policy.about.footer': 'Thanks for building a smarter, more efficient way to learn with us. Last updated: Feb 4, 2026.',

    'policy.privacy.title': 'Privacy Policy',
    'policy.privacy.description':
      'DeepStudent ("the Software" or "we") is a local AI-assisted learning tool developed by the DeepStudent Team. This Privacy Policy explains how we collect, use, store, and protect information. By installing, accessing, or using the Software, you confirm you have read, understood, and agreed to this Policy.',
    'policy.privacy.section1.title': 'Information we collect',
    'policy.privacy.section1.body': 'We may collect the following anonymous technical information (only for visits to our official website).',
    'policy.privacy.section1.point1': 'Website visit data: page views, referrers, time on page, and click heatmaps; used to optimize website performance and improve content.',
    'policy.privacy.section1.point2': 'Important commitment: the above data is processed in a fully anonymized way and does not include IP addresses, device identifiers, or other personally identifiable information.',
    'policy.privacy.section1.point3': 'Local software note: except for third-party API calls you choose to configure, the DeepStudent desktop app has no other network behavior; local debugging data stays on your device.',
    'policy.privacy.section2.title': 'Information we do not collect',
    'policy.privacy.section2.body': 'We do not collect, transmit, or process the following:',
    'policy.privacy.section2.point1': 'API keys: any API key you configure for third-party model providers.',
    'policy.privacy.section2.point2': 'Conversation content: all prompts, chats, and responses between you and model providers.',
    'policy.privacy.section2.point3': 'User data: learning resources, Anki cards, knowledge base content, vector databases, custom settings, and local files.',
    'policy.privacy.section2.point4': 'Personal identifiers: names, contact information, device identifiers, location, browsing behavior, etc.',
    'policy.privacy.section2.point5': 'Derived data: any profiles or statistics built from analyzing your usage behavior.',
    'policy.privacy.section3.title': 'Data storage & local-first',
    'policy.privacy.section3.body': 'The Software follows a local-first architecture and processes/stores data on your device by default.',
    'policy.privacy.section3.point1': 'All user data (including chat history, cards, knowledge bases, etc.) is stored locally on your device.',
    'policy.privacy.section3.point2': 'No account system is built; no sign-up or login is required.',
    'policy.privacy.section3.point3': 'You remain in full control of your data: you can view, export, or delete it locally at any time.',
    'policy.privacy.section4.title': 'Third-party services & data flow',
    'policy.privacy.section4.body': 'As a local client, the Software can call third-party model services via API keys you configure (e.g., SiliconFlow, OpenAI, Claude, Moonshot, Qwen, etc.).',
    'policy.privacy.section4.point1': 'Responsibility boundary: inference is performed by the third-party provider and is governed by that provider’s privacy policy.',
    'policy.privacy.section4.point2': 'Data transmission: communication between you and the provider is secured via TLS.',
    'policy.privacy.section4.point3': 'Note: once conversation data is sent to a third-party model service, it is outside the Software’s control.',
    'policy.privacy.section4.point4': 'Disclaimer: we are not responsible for risks or losses caused by third-party data practices (including retention, training use, or cross-border transfer).',
    'policy.privacy.section5.title': 'Security measures',
    'policy.privacy.section5.body': 'While a local-first design reduces leakage risk, we still take the following measures:',
    'policy.privacy.section5.point1': 'Open source / audit: core code is open source and can be reviewed by the community.',
    'policy.privacy.section5.point2': 'No telemetry: we do not upload data; debugging data stays local.',
    'policy.privacy.section5.point3': 'Least privilege: the Software requests only necessary system permissions (e.g., file access).',
    'policy.privacy.section6.title': 'Minors',
    'policy.privacy.section6.body': 'Our services are primarily intended for enterprises or organizations.',
    'policy.privacy.section6.point1': 'Minors should use the Software with guardian consent and supervision.',
    'policy.privacy.section7.title': 'Policy updates',
    'policy.privacy.section7.body': 'We may update this Policy as the Software evolves. Please review it periodically.',
    'policy.privacy.section7.point1': 'For material changes, we will provide appropriate notices.',
    'policy.privacy.section8.title': 'Contact us',
    'policy.privacy.section8.body': 'If you have questions about this Policy or our privacy practices, contact us:',
    'policy.privacy.section8.point1': 'Privacy: support@deepstudent.cn',
    'policy.privacy.section8.point2': 'We will respond within 15 business days of receiving your request.',
    'policy.privacy.footer': 'Thanks for choosing and trusting DeepStudent. Last updated: Feb 4, 2026.',

    'policy.terms.title': 'Terms of Use',
    'policy.terms.description': '',
    'policy.terms.section1.title': 'Service',
    'policy.terms.section1.body': 'We provide AI chat, learning resource management, knowledge retrieval, Anki card generation, Q-bank practice, essay grading, translation workbench, knowledge mindmap, and more, continuously improving with each release.',
    'policy.terms.section1.point1': 'Preview features may be unstable, and updates may introduce uncertainty.',
    'policy.terms.section2.title': 'Your responsibilities',
    'policy.terms.section2.body': 'You must have the legal rights to any content you upload and are responsible for keeping your information secure.',
    'policy.terms.section2.point1': 'Do not use DeepStudent for illegal or infringing content. Content is generated by AI; please review carefully.',
    'policy.terms.section3.title': 'Disclaimer',
    'policy.terms.section3.body': 'We do our best to keep things stable, but we are not liable for indirect losses due to force majeure or third-party causes (e.g., data loss or downtime).',
    'policy.terms.section3.point1': 'We recommend exporting backups regularly.',
    'policy.terms.footer': 'Using this service means you agree to these terms. Questions? Contact support@deepstudent.cn. Last updated: Feb 4, 2026.',
    
    // Policy
    'policy.understood': 'I Understand',
    'policy.close': 'Close dialog',
    
    // Theme
    
    // Locale
    'locale.select': 'Language',
    'locale.zh': '简体中文',
    'locale.zhHant': '繁體中文',
    'locale.en': 'English',
  },
}

// Create a locale store for external sync
const localeStore = (() => {
  let locale = 'zh'
  let cachedSnapshot = { locale }
  const listeners = new Set()
  const validLocales = ['zh', 'zh-Hant', 'en']

  const updateSnapshot = () => {
    cachedSnapshot = { locale }
  }

  const applyLocale = (newLocale) => {
    if (typeof document === 'undefined') return
    document.documentElement.lang =
      newLocale === 'zh'
        ? 'zh-CN'
        : newLocale === 'zh-Hant'
          ? 'zh-Hant'
          : 'en'
    updateSnapshot()
  }

  const setLocale = (newLocale) => {
    if (!validLocales.includes(newLocale)) return
    locale = newLocale
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(LOCALE_KEY, newLocale)
    }
    applyLocale(newLocale)
    listeners.forEach((l) => l())
  }

  const init = () => {
    if (typeof window === 'undefined') return

    // Read stored preference or detect from browser
    const stored = localStorage.getItem(LOCALE_KEY)
    if (stored && validLocales.includes(stored)) {
      locale = stored
    } else {
      // Auto-detect from browser language
      const browserLang = navigator.language || navigator.userLanguage
      const lower = String(browserLang || '').toLowerCase()
      if (lower.startsWith('zh')) {
        locale =
          lower.includes('hant') || lower.includes('tw') || lower.includes('hk') || lower.includes('mo')
            ? 'zh-Hant'
            : 'zh'
      } else {
        locale = 'en'
      }
    }
    applyLocale(locale)
    updateSnapshot()
  }

  const subscribe = (listener) => {
    listeners.add(listener)
    if (listeners.size === 1) init()
    return () => listeners.delete(listener)
  }

  const getSnapshot = () => cachedSnapshot
  const getServerSnapshot = () => ({ locale: 'zh' })

  return { subscribe, getSnapshot, getServerSnapshot, setLocale }
})()

// Hook to use locale
export const useLocale = () => {
  const state = useSyncExternalStore(
    localeStore.subscribe,
    localeStore.getSnapshot,
    localeStore.getServerSnapshot
  )

  const setLocale = useCallback((newLocale) => {
    localeStore.setLocale(newLocale)
  }, [])

  // Translation function
  const t = useCallback(
    (key, fallback, vars) => {
      const template = translations[state.locale]?.[key] || fallback || key
      if (!vars) return template
      return String(template).replace(/\{(\w+)\}/g, (match, name) => {
        if (!(name in vars)) return match
        const value = vars[name]
        return value === undefined || value === null ? '' : String(value)
      })
    },
    [state.locale]
  )

  return {
    locale: state.locale,
    setLocale,
    t,
    isZh: state.locale === 'zh',
    isZhHant: state.locale === 'zh-Hant',
    isChinese: state.locale === 'zh' || state.locale === 'zh-Hant',
    isEn: state.locale === 'en',
  }
}

// Locale selector - dropdown
export const LocaleToggle = ({ className = '', compact = false }) => {
  const { locale, setLocale, t } = useLocale()

  return (
    <div className={cn('relative inline-flex items-center w-full', className)}>
      <label className="sr-only" htmlFor="ds-locale-select">
        {t('locale.select', 'Language')}
      </label>
      <select
        id="ds-locale-select"
        value={locale}
        onChange={(event) => setLocale(event.target.value)}
        className={cn(
          'focus-ring appearance-none cursor-pointer',
          compact ? 'h-8 w-full rounded-full' : 'h-9 w-full rounded-full',
          'bg-[color:var(--apple-btn-secondary-bg)] border border-[color:var(--apple-line)]',
          'backdrop-blur-xl backdrop-saturate-[180%]',
          'shadow-[var(--apple-shadow-sm)]',
          compact
            ? 'text-[color:var(--apple-ink)] text-[12px] font-medium'
            : 'text-[color:var(--apple-ink)] text-[13px] font-medium',
          'px-4 leading-none text-center',
          'hover:bg-[color:var(--apple-btn-secondary-bg-hover)]',
        )}
        aria-label={t('locale.select', 'Language')}
      >
        <option value="zh">{t('locale.zh', '简体中文')}</option>
        <option value="zh-Hant">{t('locale.zhHant', '繁體中文')}</option>
        <option value="en">{t('locale.en', 'English')}</option>
      </select>
      <span
        className={cn(
          'pointer-events-none absolute inset-y-0 right-4 flex items-center text-[color:var(--apple-muted)] opacity-75'
        )}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={compact ? 'h-3.5 w-3.5' : 'h-4 w-4'}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </span>
    </div>
  )
}

export default LocaleToggle
