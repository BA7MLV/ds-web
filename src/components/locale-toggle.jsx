import { useCallback, useSyncExternalStore } from 'react'
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
    'hero.subtitle': 'AI 原生的本地优先学习系统',
    'hero.tagline': '智能对话、知识管理、Anki 制卡与全能阅读器无缝融合，为你打造隐私安全、高度可扩展的终身学习工作台',
    'hero.cta.download': '立即下载',
    'hero.cta.explore': '了解更多',

    // Hero Preview
    'hero.preview.chat': '智能对话',
    'hero.preview.skills': '技能系统',
    'hero.preview.knowledge': '学习资源',
    'hero.preview.providers': 'Anki 制卡',
    'hero.preview.selector': '界面预览切换',
    'hero.preview.imageAlt': 'DeepStudent {label} 界面预览',
    
    // Features
    'feature.review.title': '智能对话 · RAG 增强',
    'feature.review.desc': '基于 VFS 虚拟文件系统的 RAG 检索，自动搜索笔记、教材、题目集增强回答。支持引用模式上下文注入、多模态交互、深度思维链推理。',
    'feature.organize.title': '学习资源中心',
    'feature.organize.desc': '访达式管理所有学习资源——笔记、教材、题目集、翻译、作文、知识导图。导入即自动 OCR 识别与向量化索引，AI 可读可检索。',
    'feature.compare.title': '技能系统 · 按需扩展',
    'feature.compare.desc': '渐进披露架构，工具按需加载。内置导师模式、制卡助手、文献综述、调研模式等技能，支持自定义与 MCP 生态集成。',
    'feature.spaced.title': 'Anki 智能制卡',
    'feature.spaced.desc': '从学习文档智能提取知识点生成卡片。支持多模板、3D 预览、AnkiConnect 一键同步，让间隔重复触手可及。',
    'feature.knowledge.title': '本地优先 · 隐私安全',
    'feature.knowledge.desc': '所有数据存储在本地：SQLite 元数据 + LanceDB 向量库。支持完整备份与审计，你的学习记录完全由你掌控。',
    
    // Cards
    'card.analyzing': 'RAG 检索中',
    'card.justNow': '刚刚',
    'card.mastery': '知识库匹配度',
    'card.suggestion': '来源：',
    'card.myNotebook': '学习资源中心',
    'card.errorType': '技能模式',
    'card.calcError': '导师模式',
    'card.frequency': '激活状态',
    'card.high': '已启用',
    'card.question': '问题',
    'card.clickAnswer': '点击查看答案',
    'card.backToQuestion': '返回问题',
    'card.reference': '来源：线性代数笔记',
    'card.suggestionPrefix': '已检索到',
    'card.suggestionTopic': '3 条相关内容',
    'card.suggestionSuffix': '，可展开查看原文。',
    'card.calcErrorTip': '苏格拉底式教学：通过提问引导你逐步理解概念，而非直接给出答案。',
    'card.chatQuestion': '帮我理解矩阵的特征值分解',
    'card.chatAnswerSnippet': '我来引导你思考：首先，你知道什么是特征值吗？它和矩阵有什么关系？',
    
    // Notebook sample
    'notebook.item.calculusFinal': '高等数学笔记',
    'notebook.item.reading': '线性代数教材.pdf',
    'notebook.item.mechanics': '概率论题目集',
    'subject.math': '笔记',
    'subject.english': '教材',
    'subject.physics': '题目集',
    'time.today': '今天',
    'time.yesterday': '昨天',
    'time.twoDaysAgo': '2 天前',
    
    // Flashcard
    'flashcard.prompt': '什么是矩阵的特征值？',
    
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
    'download.description.macos': '支持智能对话、学习资源管理、Anki 制卡、技能系统。',
    'download.description.windows': '功能与 macOS 版一致，Windows 版仍在优化中。',
    'download.note.windowsPreview': 'Windows 版目前为预览版，如遇问题请在 GitHub 提交 Issue。',
    
    // FAQ
    'faq.title': '常见问题',
    'faq.subtitle': '关于 DeepStudent 的常见疑问解答',
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
    'hero.subtitle': 'AI 原生的本地優先學習系統',
    'hero.tagline': '智慧對話、知識管理、Anki 製卡與全能閱讀器無縫融合，為你打造隱私安全、高度可擴展的終身學習工作台',
    'hero.cta.download': '立即下載',
    'hero.cta.explore': '了解更多',

    // Hero Preview
    'hero.preview.chat': '智慧對話',
    'hero.preview.skills': '技能系統',
    'hero.preview.knowledge': '學習資源',
    'hero.preview.providers': 'Anki 製卡',
    'hero.preview.selector': '介面預覽切換',
    'hero.preview.imageAlt': 'DeepStudent {label} 介面預覽',

    // Features
    'feature.review.title': '智慧對話 · RAG 增強',
    'feature.review.desc': '基於 VFS 虛擬檔案系統的 RAG 檢索，自動搜尋筆記、教材、題目集增強回答。支援引用模式上下文注入、多模態互動、深度思維鏈推理。',
    'feature.organize.title': '學習資源中心',
    'feature.organize.desc': '訪達式管理所有學習資源——筆記、教材、題目集、翻譯、作文、知識導圖。導入即自動 OCR 識別與向量化索引，AI 可讀可檢索。',
    'feature.compare.title': '技能系統 · 按需擴展',
    'feature.compare.desc': '漸進披露架構，工具按需載入。內建導師模式、製卡助手、文獻綜述、調研模式等技能，支援自定義與 MCP 生態整合。',
    'feature.spaced.title': 'Anki 智慧製卡',
    'feature.spaced.desc': '從學習文檔智慧提取知識點生成卡片。支援多模板、3D 預覽、AnkiConnect 一鍵同步，讓間隔重複觸手可及。',
    'feature.knowledge.title': '本地優先 · 隱私安全',
    'feature.knowledge.desc': '所有資料儲存在本地：SQLite 元資料 + LanceDB 向量庫。支援完整備份與稽核，你的學習記錄完全由你掌控。',

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
    'hero.subtitle': 'AI-Native Local-First Learning System',
    'hero.tagline': 'Seamlessly integrates AI chat, knowledge management, Anki card generation, and universal reader into a privacy-first, extensible lifelong learning workbench',
    'hero.cta.download': 'Download',
    'hero.cta.explore': 'Learn More',

    // Hero Preview
    'hero.preview.chat': 'AI Chat',
    'hero.preview.skills': 'Skills',
    'hero.preview.knowledge': 'Learning Hub',
    'hero.preview.providers': 'CardForge',
    'hero.preview.selector': 'Preview selector',
    'hero.preview.imageAlt': 'DeepStudent {label} preview',
    
    // Features
    'feature.review.title': 'AI Chat · RAG Enhanced',
    'feature.review.desc': 'VFS-based RAG retrieval automatically searches notes, textbooks, and problem sets to enhance answers. Supports reference mode context injection, multimodal interaction, and deep chain-of-thought reasoning.',
    'feature.organize.title': 'Learning Hub',
    'feature.organize.desc': 'Finder-style management for all learning resources — notes, textbooks, problem sets, translations, essays, mind maps. Auto OCR and vectorization on import, making everything AI-readable and searchable.',
    'feature.compare.title': 'Skills · On-Demand Extension',
    'feature.compare.desc': 'Progressive disclosure architecture with on-demand tool loading. Built-in tutor mode, card forge, literature review, research mode, and more. Supports custom skills and MCP ecosystem integration.',
    'feature.spaced.title': 'Anki CardForge',
    'feature.spaced.desc': 'Intelligently extract knowledge points from documents to generate cards. Multi-template support, 3D preview, one-click AnkiConnect sync — spaced repetition at your fingertips.',
    'feature.knowledge.title': 'Local-First · Privacy Safe',
    'feature.knowledge.desc': 'All data stored locally: SQLite metadata + LanceDB vector store. Full backup and audit support — your learning records stay under your control.',
    
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
    </div>
  )
}

export default LocaleToggle
