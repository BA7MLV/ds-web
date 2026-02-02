import { useCallback, useSyncExternalStore } from 'react'
import { ChevronDown, Languages } from 'lucide-react'
import { cn } from '../lib/utils'

// Locale values: 'zh' | 'zh-Hant' | 'en'
const LOCALE_KEY = 'ds-locale-preference'

// Translations
const translations = {
  zh: {
    // Nav
    'nav.features': '功能',
    'nav.docs': '文档',
    'nav.download': '下载',
    
    // Hero
    'hero.title': 'DeepStudent',
    'hero.subtitle': 'AI 原生学习解决方案',
    'hero.tagline': '让学习更高效，让知识更牢固',
    'hero.cta.download': '立即下载',
    'hero.cta.explore': '看看介绍',

    // Hero Preview
    'hero.preview.chat': 'AI 对话',
    'hero.preview.skills': '技能',
    'hero.preview.knowledge': '知识管理',
    'hero.preview.providers': '多服务商',
    'hero.preview.selector': '界面预览切换',
    'hero.preview.imageAlt': 'DeepStudent {label} 界面预览（占位图）',
    
    // Features
    'feature.review.title': '错题复盘',
    'feature.review.desc': '把错因写清楚、归好类，复习时一眼就知道从哪里开始。',
    'feature.organize.title': '有序，不只是整理',
    'feature.organize.desc': '集中管理所有学科错题，按知识点、难度、时间分类，像系统文件管理器一样井井有条。',
    'feature.compare.title': '多题回顾',
    'feature.compare.desc': '把相关题目放在一起看，理解共性错误，形成自己的复习重点。',
    'feature.spaced.title': '间隔复习',
    'feature.spaced.desc': '对接间隔复习法，轻松生成卡片，循序巩固。',
    'feature.knowledge.title': '知识补充',
    'feature.knowledge.desc': '内置参考库。遇到卡住的题，可以直接翻到相关章节和思路。',
    
    // Cards
    'card.analyzing': '深度分析中',
    'card.justNow': '刚刚',
    'card.mastery': '知识点掌握',
    'card.suggestion': '建议：',
    'card.myNotebook': '我的错题本',
    'card.errorType': '错误类型',
    'card.calcError': '计算错误',
    'card.frequency': '频次',
    'card.high': '高',
    'card.question': '题目',
    'card.clickAnswer': '点击查看答案',
    'card.backToQuestion': '返回题目',
    'card.reference': '参考：第 4 章',
    'card.suggestionPrefix': '重新复习',
    'card.suggestionTopic': '导数定义',
    'card.suggestionSuffix': '相关章节，并加强基础计算训练。',
    'card.calcErrorTip': '建议在进行复杂运算时，增加验算步骤，特别是符号变换环节。',
    'card.chatQuestion': '这道题选 C 的原因是什么？',
    'card.chatAnswerSnippet': '根据洛必达法则，当 x 趋近于 0 时，分子分母同时求导...',
    
    // Notebook sample
    'notebook.item.calculusFinal': '2023 高数期末',
    'notebook.item.reading': '英语阅读理解专项',
    'notebook.item.mechanics': '物理力学错题集',
    'subject.math': '数学',
    'subject.english': '英语',
    'subject.physics': '物理',
    'time.today': '今天',
    'time.yesterday': '昨天',
    'time.twoDaysAgo': '2 天前',
    
    // Flashcard
    'flashcard.prompt': 'ln(x) 的导数是什么？',
    
    // Download
    'download.title': '下载 DeepStudent',
    'download.subtitle': '选择你的平台，安装后即可开始整理。',
    'download.selectPlatform': '选择平台',
    'download.backHome': '返回首页',
    'download.dmgInstall': 'DMG 安装',
    'download.preview': '预览版',
    'download.version': '版本',
    'download.size': '大小',
    'download.system': '系统',
    'download.downloadDmg': '下载 DMG',
    'download.downloadExe': '下载 EXE',
    'download.requirements.macos': 'macOS 13+，Apple Silicon 优化',
    'download.requirements.windows': 'Windows 11 / 10 22H2+',
    'download.description.macos': '菜单栏快捷录入，支持 Spotlight 搜索。',
    'download.description.windows': '预览版含 OneNote 导入与系统托盘控件。',
    'download.note.windowsPreview': 'Windows 仍为预览版，如需帮助请联系 support@deepstudent.ai。',
    
    // FAQ
    'faq.title': '常见问题',
    'faq.subtitle': '关于 DeepStudent 的常见疑问解答',
    'faq.openSource.q': 'DeepStudent 是开源的吗？',
    'faq.openSource.a': '是的，DeepStudent 完全开源。你可以在 GitHub 查看源码并参与共建。',
    'faq.openSource.link': '前往 GitHub',
    'faq.privacy.q': '我的数据会被如何使用？',
    'faq.privacy.a': '我们遵循最小化数据原则，数据仅用于生成个性化学习建议与统计分析。',
    'faq.privacy.action': '查看隐私政策',
    'faq.macosQuarantine.q': 'macOS 安装后提示“已损坏，无法打开”怎么办？',
    'faq.macosQuarantine.a': '可以在终端执行以下命令（把 <应用路径> 替换为你的应用路径；也可以把应用图标拖进终端自动填充路径）：',
    'faq.macosQuarantine.code': 'sudo xattr -r -d com.apple.quarantine <应用路径>',
    'faq.macosQuarantine.link': '查看完整步骤',
    'faq.windowsPreview.q': 'Windows 版本是正式版吗？',
    'faq.windowsPreview.a': '目前 Windows 仍为预览版，我们会持续迭代。遇到问题可联系 support@deepstudent.ai。',
    
    // Footer
    'footer.privacy': '隐私',
    'footer.about': '关于',
    'footer.terms': '条款',
    'footer.xiaohongshu': '小红书',
    
    // Policy Content
    'policy.about.title': '关于 DeepStudent',
    'policy.about.description': '一款面向学生与自学者的开源错题管理与复盘工具，帮助你建立长期可持续的学习系统。',
    'policy.about.section1.title': '我们在做什么',
    'policy.about.section1.body': '将错题整理、知识图谱、复盘计划整合在一个工作流里，让复习更有方向感。',
    'policy.about.section1.point1': '从错题出发形成可执行的复习路径。',
    'policy.about.section1.point2': '把学习记录沉淀成可复用的知识资产。',
    'policy.about.section2.title': '开源与共建',
    'policy.about.section2.body': 'DeepStudent 完全开源，欢迎提交 Issue 与 PR，共同改进学习体验。',
    'policy.about.section2.point1': '保持透明的开发节奏与版本发布记录。',
    'policy.about.section2.point2': '持续吸收社区的真实需求反馈。',
    'policy.about.section3.title': '联系我们',
    'policy.about.section3.body': '合作或建议请发送邮件至 team@deepstudent.ai，我们会尽快回复。',
    'policy.about.footer': '感谢你与我们一起打造更聪明、更高效的学习方式。',

    'policy.privacy.title': '隐私政策',
    'policy.privacy.description': '我们遵循最小化数据原则，确保每条学习记录都掌握在你手中。',
    'policy.privacy.section1.title': '收集范围',
    'policy.privacy.section1.body': '仅在你使用 DeepStudent 时记录必要的错题内容、标签与复习进度，不会采集与服务无关的敏感个人信息。',
    'policy.privacy.section1.point1': '账号信息仅用于云端同步与登录验证。',
    'policy.privacy.section1.point2': '你可随时导出或删除本地与云端数据。',
    'policy.privacy.section2.title': '使用方式',
    'policy.privacy.section2.body': '所有数据仅用于生成个性化学习建议与统计分析，不会出售或提供给第三方广告平台。',
    'policy.privacy.section2.point1': '统计分析仅使用匿名化、脱敏后的聚合数据。',
    'policy.privacy.section2.point2': '我们会定期发布透明度报告。',
    'policy.privacy.section3.title': '安全措施',
    'policy.privacy.section3.body': '所有传输均使用 TLS 加密，云端存储采用分区隔离，敏感字段在数据库内加盐散列。',
    'policy.privacy.section3.point1': '核心基础设施通过 ISO/IEC 27001 安全认证。',
    'policy.privacy.section3.point2': '如遇异常访问会立即告警并支持一键冻结账号。',
    'policy.privacy.footer': '更多隐私问题请发送邮件至 privacy@deepstudent.ai，我们会在 3 个工作日内回复。',

    'policy.terms.title': '使用条款',
    'policy.terms.description': '使用 DeepStudent 即表示你同意以下约定，本服务为学习辅助工具，不构成绝对学习结果承诺。',
    'policy.terms.section1.title': '服务内容',
    'policy.terms.section1.body': '我们提供错题整理、知识图谱、复习提醒等功能，能力会根据版本迭代持续更新。',
    'policy.terms.section1.point1': '测试功能可能存在不稳定，请按需体验。',
    'policy.terms.section1.point2': '我们保留随时调整或暂停服务的权利。',
    'policy.terms.section2.title': '用户责任',
    'policy.terms.section2.body': '你需确保上传内容拥有合法使用权，并对账号安全负责。若出现共享或泄露行为，请立即联系我们。',
    'policy.terms.section2.point1': '禁止利用 DeepStudent 传播违法或侵权内容。',
    'policy.terms.section2.point2': '若发现异常活动，我们可能采取限制措施。',
    'policy.terms.section3.title': '免责声明',
    'policy.terms.section3.body': '我们会尽力保证服务稳定，但因不可抗力或第三方原因导致的数据丢失、服务中断，我们不承担间接损失责任。',
    'policy.terms.section3.point1': '建议定期导出备份重要数据。',
    'policy.terms.section3.point2': '付费计划如需退款，请在 7 天内提交申请。',
    'policy.terms.footer': '使用本服务即视为同意上述条款。如有疑问请联系 support@deepstudent.ai。',
    
    // Policy
    'policy.understood': '我已了解',
    'policy.close': '关闭弹窗',
    
    // Theme
    'theme.system': '跟随系统',
    'theme.light': '浅色模式',
    'theme.dark': '深色模式',
    
    // Locale
    'locale.select': '语言',
    'locale.zh': '简体中文',
    'locale.zhHant': '繁體中文',
    'locale.en': 'English',
  },
  'zh-Hant': {
    // Nav
    'nav.features': '功能',
    'nav.docs': '文件',
    'nav.download': '下載',

    // Hero
    'hero.title': 'DeepStudent',
    'hero.subtitle': 'AI 原生學習解決方案',
    'hero.tagline': '讓學習更高效，讓知識更牢固',
    'hero.cta.download': '立即下載',
    'hero.cta.explore': '看看介紹',

    // Hero Preview
    'hero.preview.chat': 'AI 對話',
    'hero.preview.skills': '技能',
    'hero.preview.knowledge': '知識管理',
    'hero.preview.providers': '多服務商',
    'hero.preview.selector': '介面預覽切換',
    'hero.preview.imageAlt': 'DeepStudent {label} 介面預覽（占位圖）',

    // Features
    'feature.review.title': '錯題複盤',
    'feature.review.desc': '把錯因寫清楚、歸好類，複習時一眼就知道從哪裡開始。',
    'feature.organize.title': '有序，不只是整理',
    'feature.organize.desc': '集中管理所有學科錯題，按知識點、難度、時間分類，像系統檔案管理器一樣井井有條。',
    'feature.compare.title': '多題回顧',
    'feature.compare.desc': '把相關題目放在一起看，理解共性錯誤，形成自己的複習重點。',
    'feature.spaced.title': '間隔複習',
    'feature.spaced.desc': '對接間隔複習法，輕鬆生成卡片，循序鞏固。',
    'feature.knowledge.title': '知識補充',
    'feature.knowledge.desc': '內建參考庫。遇到卡住的題，可以直接翻到相關章節和思路。',

    // Cards
    'card.analyzing': '深度分析中',
    'card.justNow': '剛剛',
    'card.mastery': '知識點掌握',
    'card.suggestion': '建議：',
    'card.myNotebook': '我的錯題本',
    'card.errorType': '錯誤類型',
    'card.calcError': '計算錯誤',
    'card.frequency': '頻次',
    'card.high': '高',
    'card.question': '題目',
    'card.clickAnswer': '點擊查看答案',
    'card.backToQuestion': '返回題目',
    'card.reference': '參考：第 4 章',
    'card.suggestionPrefix': '重新複習',
    'card.suggestionTopic': '導數定義',
    'card.suggestionSuffix': '相關章節，並加強基礎計算訓練。',
    'card.calcErrorTip': '建議在進行複雜運算時，增加驗算步驟，特別是符號變換環節。',
    'card.chatQuestion': '這道題選 C 的原因是什麼？',
    'card.chatAnswerSnippet': '根據洛必達法則，當 x 趨近於 0 時，分子分母同時求導...',

    // Notebook sample
    'notebook.item.calculusFinal': '2023 高數期末',
    'notebook.item.reading': '英語閱讀理解專項',
    'notebook.item.mechanics': '物理力學錯題集',
    'subject.math': '數學',
    'subject.english': '英語',
    'subject.physics': '物理',
    'time.today': '今天',
    'time.yesterday': '昨天',
    'time.twoDaysAgo': '2 天前',

    // Flashcard
    'flashcard.prompt': 'ln(x) 的導數是什麼？',

    // Download
    'download.title': '下載 DeepStudent',
    'download.subtitle': '選擇你的平台，安裝後即可開始整理。',
    'download.selectPlatform': '選擇平台',
    'download.backHome': '返回首頁',
    'download.dmgInstall': 'DMG 安裝',
    'download.preview': '預覽版',
    'download.version': '版本',
    'download.size': '大小',
    'download.system': '系統',
    'download.downloadDmg': '下載 DMG',
    'download.downloadExe': '下載 EXE',
    'download.requirements.macos': 'macOS 13+，Apple Silicon 優化',
    'download.requirements.windows': 'Windows 11 / 10 22H2+',
    'download.description.macos': '選單列快捷輸入，支援 Spotlight 搜尋。',
    'download.description.windows': '預覽版含 OneNote 匯入與系統托盤控制項。',
    'download.note.windowsPreview': 'Windows 仍為預覽版，如需協助請聯絡 support@deepstudent.ai。',

    // FAQ
    'faq.title': '常見問題',
    'faq.subtitle': '關於 DeepStudent 的常見疑問解答',
    'faq.openSource.q': 'DeepStudent 是開源的嗎？',
    'faq.openSource.a': '是的，DeepStudent 完全開源。你可以在 GitHub 查看原始碼並參與共建。',
    'faq.openSource.link': '前往 GitHub',
    'faq.privacy.q': '我的資料會被如何使用？',
    'faq.privacy.a': '我們遵循最小化資料原則，資料僅用於生成個人化學習建議與統計分析。',
    'faq.privacy.action': '查看隱私政策',
    'faq.macosQuarantine.q': 'macOS 安裝後提示「已損壞，無法打開」怎麼辦？',
    'faq.macosQuarantine.a': '可以在終端執行以下命令（把 <應用路徑> 替換為你的應用路徑；也可以把應用圖示拖進終端自動填充路徑）：',
    'faq.macosQuarantine.code': 'sudo xattr -r -d com.apple.quarantine <應用路徑>',
    'faq.macosQuarantine.link': '查看完整步驟',
    'faq.windowsPreview.q': 'Windows 版本是正式版嗎？',
    'faq.windowsPreview.a': '目前 Windows 仍為預覽版，我們會持續迭代。遇到問題可聯絡 support@deepstudent.ai。',

    // Footer
    'footer.privacy': '隱私',
    'footer.about': '關於',
    'footer.terms': '條款',
    'footer.xiaohongshu': '小紅書',
    
    // Policy Content
    'policy.about.title': '關於 DeepStudent',
    'policy.about.description': '一款面向學生與自學者的開源錯題管理與複盤工具，幫助你建立長期可持續的學習系統。',
    'policy.about.section1.title': '我們在做什麼',
    'policy.about.section1.body': '將錯題整理、知識圖譜、複盤計畫整合在一個工作流裡，讓複習更有方向感。',
    'policy.about.section1.point1': '從錯題出發形成可執行的複習路徑。',
    'policy.about.section1.point2': '把學習記錄沉澱成可複用的知識資產。',
    'policy.about.section2.title': '開源與共建',
    'policy.about.section2.body': 'DeepStudent 完全開源，歡迎提交 Issue 與 PR，共同改進學習體驗。',
    'policy.about.section2.point1': '保持透明的開發節奏與版本發布記錄。',
    'policy.about.section2.point2': '持續吸收社群的真實需求回饋。',
    'policy.about.section3.title': '聯絡我們',
    'policy.about.section3.body': '合作或建議請發送郵件至 team@deepstudent.ai，我們會盡快回覆。',
    'policy.about.footer': '感謝你與我們一起打造更聰明、更高效的學習方式。',

    'policy.privacy.title': '隱私政策',
    'policy.privacy.description': '我們遵循最小化資料原則，確保每條學習記錄都掌握在你手中。',
    'policy.privacy.section1.title': '收集範圍',
    'policy.privacy.section1.body': '僅在你使用 DeepStudent 時記錄必要的錯題內容、標籤與複習進度，不會採集與服務無關的敏感個人資訊。',
    'policy.privacy.section1.point1': '帳號資訊僅用於雲端同步與登入驗證。',
    'policy.privacy.section1.point2': '你可隨時匯出或刪除本地與雲端資料。',
    'policy.privacy.section2.title': '使用方式',
    'policy.privacy.section2.body': '所有資料僅用於生成個人化學習建議與統計分析，不會出售或提供給第三方廣告平台。',
    'policy.privacy.section2.point1': '統計分析僅使用匿名化、去識別後的彙總資料。',
    'policy.privacy.section2.point2': '我們會定期發布透明度報告。',
    'policy.privacy.section3.title': '安全措施',
    'policy.privacy.section3.body': '所有傳輸均使用 TLS 加密，雲端儲存採用分區隔離，敏感欄位在資料庫內加鹽雜湊。',
    'policy.privacy.section3.point1': '核心基礎設施通過 ISO/IEC 27001 安全認證。',
    'policy.privacy.section3.point2': '如遇異常存取會立即告警並支援一鍵凍結帳號。',
    'policy.privacy.footer': '更多隱私問題請發送郵件至 privacy@deepstudent.ai，我們會在 3 個工作日內回覆。',

    'policy.terms.title': '使用條款',
    'policy.terms.description': '使用 DeepStudent 即表示你同意以下約定，本服務為學習輔助工具，不構成絕對學習結果承諾。',
    'policy.terms.section1.title': '服務內容',
    'policy.terms.section1.body': '我們提供錯題整理、知識圖譜、複習提醒等功能，能力會根據版本迭代持續更新。',
    'policy.terms.section1.point1': '測試功能可能存在不穩定，請按需體驗。',
    'policy.terms.section1.point2': '我們保留隨時調整或暫停服務的權利。',
    'policy.terms.section2.title': '使用者責任',
    'policy.terms.section2.body': '你需確保上傳內容擁有合法使用權，並對帳號安全負責。若出現共享或洩露行為，請立即聯絡我們。',
    'policy.terms.section2.point1': '禁止利用 DeepStudent 傳播違法或侵權內容。',
    'policy.terms.section2.point2': '若發現異常活動，我們可能採取限制措施。',
    'policy.terms.section3.title': '免責聲明',
    'policy.terms.section3.body': '我們會盡力確保服務穩定，但因不可抗力或第三方原因導致的資料遺失、服務中斷，我們不承擔間接損失責任。',
    'policy.terms.section3.point1': '建議定期匯出備份重要資料。',
    'policy.terms.section3.point2': '付費方案如需退款，請在 7 天內提交申請。',
    'policy.terms.footer': '使用本服務即視為同意上述條款。如有疑問請聯絡 support@deepstudent.ai。',

    // Policy
    'policy.understood': '我已瞭解',
    'policy.close': '關閉彈窗',

    // Theme
    'theme.system': '跟隨系統',
    'theme.light': '淺色模式',
    'theme.dark': '深色模式',

    // Locale
    'locale.select': '語言',
    'locale.zh': '簡體中文',
    'locale.zhHant': '繁體中文',
    'locale.en': 'English',
  },
  en: {
    // Nav
    'nav.features': 'Features',
    'nav.docs': 'Docs',
    'nav.download': 'Download',
    
    // Hero
    'hero.title': 'DeepStudent',
    'hero.subtitle': 'AI-Native Learning Solution',
    'hero.tagline': 'Learn smarter, remember longer',
    'hero.cta.download': 'Download',
    'hero.cta.explore': 'Learn More',

    // Hero Preview
    'hero.preview.chat': 'AI Chat',
    'hero.preview.skills': 'Skills',
    'hero.preview.knowledge': 'Knowledge',
    'hero.preview.providers': 'Providers',
    'hero.preview.selector': 'Preview selector',
    'hero.preview.imageAlt': 'DeepStudent {label} preview (placeholder)',
    
    // Features
    'feature.review.title': 'Mistake Review',
    'feature.review.desc': 'Document your mistakes clearly, categorize them well, and know exactly where to start when reviewing.',
    'feature.organize.title': 'Organized, Not Just Sorted',
    'feature.organize.desc': 'Centrally manage mistakes across all subjects, categorized by knowledge points, difficulty, and time.',
    'feature.compare.title': 'Multi-Question Review',
    'feature.compare.desc': 'Compare related questions together, understand common errors, and form your own review priorities.',
    'feature.spaced.title': 'Spaced Repetition',
    'feature.spaced.desc': 'Connect with spaced repetition methods, easily generate cards, and consolidate step by step.',
    'feature.knowledge.title': 'Knowledge Reference',
    'feature.knowledge.desc': 'Built-in reference library. When stuck, quickly find related chapters and approaches.',
    
    // Cards
    'card.analyzing': 'Deep Analyzing',
    'card.justNow': 'Just now',
    'card.mastery': 'Knowledge Mastery',
    'card.suggestion': 'Suggestion:',
    'card.myNotebook': 'My Mistake Notebook',
    'card.errorType': 'Error Type',
    'card.calcError': 'Calculation Error',
    'card.frequency': 'Frequency',
    'card.high': 'High',
    'card.question': 'Question',
    'card.clickAnswer': 'Click to reveal answer',
    'card.backToQuestion': 'Back to question',
    'card.reference': 'Reference: Chapter 4',
    'card.suggestionPrefix': 'Review the',
    'card.suggestionTopic': 'definition of derivatives',
    'card.suggestionSuffix': 'and strengthen basic calculation skills.',
    'card.calcErrorTip': 'Tip: Add quick verification steps for complex calculations, especially sign changes.',
    'card.chatQuestion': 'Why is the answer C?',
    'card.chatAnswerSnippet': "By L'Hopital's rule, as x approaches 0, differentiate the numerator and denominator...",

    // Notebook sample
    'notebook.item.calculusFinal': 'Calculus Final 2023',
    'notebook.item.reading': 'Reading Comprehension Practice',
    'notebook.item.mechanics': 'Mechanics Mistakes',
    'subject.math': 'Math',
    'subject.english': 'English',
    'subject.physics': 'Physics',
    'time.today': 'Today',
    'time.yesterday': 'Yesterday',
    'time.twoDaysAgo': '2 days ago',

    // Flashcard
    'flashcard.prompt': 'What is the derivative of ln(x)?',
    
    // Download
    'download.title': 'Download DeepStudent',
    'download.subtitle': 'Choose your platform and start organizing.',
    'download.selectPlatform': 'Select Platform',
    'download.backHome': 'Back to Home',
    'download.dmgInstall': 'DMG Install',
    'download.preview': 'Preview',
    'download.version': 'Version',
    'download.size': 'Size',
    'download.system': 'System',
    'download.downloadDmg': 'Download DMG',
    'download.downloadExe': 'Download EXE',
    'download.requirements.macos': 'macOS 13+, Apple Silicon optimized',
    'download.requirements.windows': 'Windows 11 / 10 22H2+',
    'download.description.macos': 'Menu bar quick entry, Spotlight search support.',
    'download.description.windows': 'Preview includes OneNote import and system tray controls.',
    'download.note.windowsPreview': 'Windows is still in preview. If you need help, contact support@deepstudent.ai.',
    
    // FAQ
    'faq.title': 'FAQ',
    'faq.subtitle': 'Common questions about DeepStudent',
    'faq.openSource.q': 'Is DeepStudent open source?',
    'faq.openSource.a': 'Yes. DeepStudent is fully open source. You can view the code on GitHub and contribute.',
    'faq.openSource.link': 'Open GitHub',
    'faq.privacy.q': 'How is my data used?',
    'faq.privacy.a': 'We follow data minimization. Data is only used for personalized study insights and analytics.',
    'faq.privacy.action': 'View Privacy Policy',
    'faq.macosQuarantine.q': 'macOS says the app is "damaged". What should I do?',
    'faq.macosQuarantine.a': 'Run the following command in Terminal (replace <App Path> with your app path; you can also drag the app into Terminal to auto-fill the path):',
    'faq.macosQuarantine.code': 'sudo xattr -r -d com.apple.quarantine <App Path>',
    'faq.macosQuarantine.link': 'See full steps',
    'faq.windowsPreview.q': 'Is the Windows version stable?',
    'faq.windowsPreview.a': "Windows is currently in preview and we're iterating quickly. If you run into issues, contact support@deepstudent.ai.",
    
    // Footer
    'footer.privacy': 'Privacy',
    'footer.about': 'About',
    'footer.terms': 'Terms',
    'footer.xiaohongshu': 'Xiaohongshu',
    
    // Policy Content
    'policy.about.title': 'About DeepStudent',
    'policy.about.description': 'An open-source mistake tracking and review tool for students and self-learners, built for long-term, sustainable learning.',
    'policy.about.section1.title': 'What we do',
    'policy.about.section1.body': 'We combine mistake tracking, knowledge mapping, and review planning into one workflow, so you always know what to review next.',
    'policy.about.section1.point1': 'Turn mistakes into an actionable review path.',
    'policy.about.section1.point2': 'Build reusable knowledge assets from your study history.',
    'policy.about.section2.title': 'Open source & community',
    'policy.about.section2.body': 'DeepStudent is fully open source. Issues and pull requests are welcome.',
    'policy.about.section2.point1': 'Transparent development and release history.',
    'policy.about.section2.point2': 'Continuously shaped by real community feedback.',
    'policy.about.section3.title': 'Contact',
    'policy.about.section3.body': "For collaboration or suggestions, email team@deepstudent.ai. We'll get back to you soon.",
    'policy.about.footer': 'Thanks for building a smarter, more efficient way to learn with us.',

    'policy.privacy.title': 'Privacy Policy',
    'policy.privacy.description': 'We follow data minimization. Your learning records stay under your control.',
    'policy.privacy.section1.title': 'What we collect',
    'policy.privacy.section1.body': "We only store the mistake content, tags, and review progress needed for the product. We don't collect unrelated sensitive personal data.",
    'policy.privacy.section1.point1': 'Account info is used only for sync and authentication.',
    'policy.privacy.section1.point2': 'You can export or delete local and cloud data anytime.',
    'policy.privacy.section2.title': 'How we use it',
    'policy.privacy.section2.body': 'Data is only used for personalized suggestions and analytics. We never sell data to advertisers.',
    'policy.privacy.section2.point1': 'Analytics use anonymized, aggregated data only.',
    'policy.privacy.section2.point2': 'We publish transparency updates regularly.',
    'policy.privacy.section3.title': 'Security',
    'policy.privacy.section3.body': 'All traffic is encrypted with TLS. Cloud storage is isolated by partitions, and sensitive fields are salted and hashed in the database.',
    'policy.privacy.section3.point1': 'Core infrastructure follows ISO/IEC 27001 security practices.',
    'policy.privacy.section3.point2': 'Suspicious access triggers alerts and supports one-click account freeze.',
    'policy.privacy.footer': "For privacy questions, email privacy@deepstudent.ai. We'll respond within 3 business days.",

    'policy.terms.title': 'Terms of Use',
    'policy.terms.description': 'By using DeepStudent, you agree to the terms below. DeepStudent is a learning aid and does not guarantee outcomes.',
    'policy.terms.section1.title': 'Service',
    'policy.terms.section1.body': 'We provide mistake tracking, knowledge mapping, review reminders, and more, continuously improving with each release.',
    'policy.terms.section1.point1': 'Preview features may be unstable.',
    'policy.terms.section1.point2': 'We may adjust or pause the service at any time.',
    'policy.terms.section2.title': 'Your responsibilities',
    'policy.terms.section2.body': 'You must have the rights to any content you upload and are responsible for your account security. Contact us immediately if you suspect leakage or sharing.',
    'policy.terms.section2.point1': 'Do not use DeepStudent for illegal or infringing content.',
    'policy.terms.section2.point2': 'We may limit accounts with suspicious activity.',
    'policy.terms.section3.title': 'Disclaimer',
    'policy.terms.section3.body': 'We do our best to keep the service reliable, but we are not liable for indirect losses due to force majeure or third-party causes (e.g., data loss or downtime).',
    'policy.terms.section3.point1': 'We recommend exporting backups regularly.',
    'policy.terms.section3.point2': 'For refunds, submit a request within 7 days.',
    'policy.terms.footer': 'Using this service means you agree to these terms. Questions? Contact support@deepstudent.ai.',
    
    // Policy
    'policy.understood': 'I Understand',
    'policy.close': 'Close dialog',
    
    // Theme
    'theme.system': 'System',
    'theme.light': 'Light Mode',
    'theme.dark': 'Dark Mode',
    
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
      {compact ? null : (
        <Languages
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[color:var(--apple-muted)]"
          aria-hidden="true"
        />
      )}
      <select
        id="ds-locale-select"
        value={locale}
        onChange={(event) => setLocale(event.target.value)}
        className={cn(
          'focus-ring appearance-none cursor-pointer',
          // Apple-like glass pill
          compact ? 'h-8 w-full rounded-full' : 'h-9 w-full rounded-full',
          'bg-[color:var(--apple-btn-secondary-bg)] border border-[color:var(--apple-line)]',
          'backdrop-blur-xl backdrop-saturate-[180%]',
          'shadow-[var(--apple-shadow-sm)]',
          compact
            ? 'text-[color:var(--apple-ink)] text-[12px] font-medium'
            : 'text-[color:var(--apple-ink)] text-[13px] font-medium',
          compact ? 'pl-3 pr-9 leading-none' : 'pl-9 pr-10 leading-none',
          'hover:bg-[color:var(--apple-btn-secondary-bg-hover)]',
        )}
        aria-label={t('locale.select', 'Language')}
      >
        <option value="zh">{t('locale.zh', '简体中文')}</option>
        <option value="zh-Hant">{t('locale.zhHant', '繁體中文')}</option>
        <option value="en">{t('locale.en', 'English')}</option>
      </select>
      <ChevronDown
        className={cn(
          'pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--apple-muted)]',
          compact ? 'w-4 h-4' : 'w-4 h-4',
        )}
        aria-hidden="true"
      />
    </div>
  )
}

export default LocaleToggle
