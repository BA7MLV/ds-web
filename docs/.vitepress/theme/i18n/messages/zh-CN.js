/**
 * 简体中文文案（默认语言）。
 *
 * 约定：
 * · key 与 en-US.js 一一对应；某个 key 在其它语言里缺失时会回退到本文件。
 * · 带 href / match / link / img 的条目是路由与资源信息，翻译时通常只改 text / title / desc。
 * · 字符串里的 {name} 由 t() 做插值，例如 t('home.stars.count', { count: '1.2k' })。
 * · 列表类内容（数组 / 对象）用 tm() 取，不参与插值。
 * · 落地页文案口径：一句话说一件事，主句在前，括号和术语往后放；
 *   尽量控制在两行以内，让每块内容扫一眼就能读完。
 */
export default {
  nav: {
    /** 落地页顶栏：只留两个出口 */
    landing: {
      docs: '文档',
      support: '支持'
    },
    /** 文档页顶栏：完整路由 */
    docPage: {
      docs: '文档',
      roadmap: '路线图',
      qa: 'QA',
      support: '支持'
    },
    download: '下载',
    search: '搜索文档',
    theme: '切换外观',
    menu: '菜单',
    switchLanguage: '切换语言',
    primary: '主导航'
  },

  /**
   * 站内与求助入口。中文页都进站内页面；英文页首页与快速上手进 `/en/`、`/en/start`，
   * 下载与支持去 GitHub（见 en-US.js）——下载页和支持页只有中文，英文访客点进去就是死胡同。
   */
  links: {
    home: '/',
    quickStart: '/start',
    download: '/download',
    support: '/support'
  },

  copyLine: {
    copy: '复制',
    copied: '已复制',
    label: '复制命令',
    failed: '复制失败，请手动选择命令复制。'
  },

  footer: {
    /**
     * 右下角图标的无障碍名，也是悬停提示。画面上只有图标，
     * 所以这里要说全「是什么」——光一个群号，读屏用户看不出是干什么的。
     */
    social: {
      github: 'GitHub 仓库',
      qq: 'QQ 群 310134919',
      xiaohongshu: '小红书主页',
      email: '邮箱 support@deepstudent.cn'
    },
    /**
     * 二维码浮层的图片替代文字。只说「二维码」不够 ——
     * 读屏用户连着听到两枚「二维码」，分不出哪个是群、哪个是主页。
     */
    qrAlt: {
      qq: 'QQ 群 310134919 的二维码',
      xiaohongshu: '小红书主页的二维码'
    },
    /** 浮层里二维码下方那一行。写成动作（扫码干嘛），不是「二维码」这种名词 */
    qrHint: {
      qq: '扫码加入 QQ 群',
      xiaohongshu: '扫码关注小红书'
    },
    /** 触屏浮层里的跳转出口：首次点击被拦下亮码，跳转改从这里走 */
    qrOpen: '打开链接',
    /** 版权声明：法律声明各语言统一用英文原文，不翻译 */
    copyright: 'Copyright © 2026 DeepStudent Team. All rights reserved.'
  },

  lastAuthor: {
    label: '编辑者：',
    separator: '、'
  },

  appShell: {
    title: 'DeepStudent 实时演示',
    previewTitle: 'DeepStudent 界面预览',
    previewDescription: '学习 Agent 在对话中读取资料，直接生成思维导图、练习题与 Anki 卡片。',
    /** 壳内那张真实界面截图的替代文字；截图与实时演示是同一个界面 */
    posterAlt:
      'DeepStudent 应用界面：左侧是导航与对话列表，右侧是对话「高数错题 → Anki 卡片」，Agent 已生成 5 张卡片。',
    /**
     * 以下三条只在「画面不会再动」时出现：还没开始、超时、嵌不进来。
     * 载入过程中刻意不说话 —— 壳里铺着的就是这张截图，见 AppShell.vue 的说明。
     */
    waiting: '实时演示将自动载入，也可点击此处立即开始。',
    delayed: '实时演示暂未就绪，可重试或先浏览下方功能。',
    unavailable: '当前无法嵌入实时演示，下方是界面截图。',
    start: '立即体验',
    retry: '重新载入'
  },

  home: {
    stars: {
      idle: 'Star on GitHub',
      count: '{count} stars on GitHub'
    },

    hero: {
      /** 口号，见主仓库 docs/brand/messaging.md §1；\n 是固定断行（标题 white-space: pre-line） */
      title: '只专注学习本身就够了，\n剩下的都交给我。',
      lede: ['开源、本地优先的 AI 学习工作台。', '它的学习 Agent，可直接操作学习桌面上的每一个应用。'],
      download: '立即下载',
      downloadMac: '下载 macOS 版',
      downloadWin: '下载 Windows 版',
      downloadLinux: '下载 Linux 版',
      downloadAndroid: '下载 Android 版',
      /* iPhone / iPad 访客：没有 iOS 安装包，按钮带他们去下载页拿链接 */
      downloadOnComputer: '在电脑上下载',
      chooseDownload: '选择下载版本',
      switchDownload: '切换下载版本',
      /* 下拉里要能分清 macOS 的两个包，所以这一处必须带架构；主按钮上不带 */
      downloadOptions: {
        'mac-arm': 'macOS · Apple Silicon',
        'mac-x64': 'macOS · Intel',
        'win-x64': 'Windows · x64',
        'linux-appimage': 'Linux · AppImage',
        'linux-deb': 'Linux · deb',
        'linux-rpm': 'Linux · rpm',
        'android-arm64': 'Android · ARM64'
      },
      quickStart: '快速上手',
      note: '免费开源（AGPL-3.0）· 无需注册 · 欢迎弹窗 1 分钟一键配好模型，也可免密钥用本机模型 · 数据存本机'
    },

    /**
     * 学习桌面：桌面端打开就是它（主仓库 desktop.workbenchMode 缺省为 true）。
     * art 对应 docs/public/features/<art>-light|dark.webp，是 1440 × 900 的整屏截图
     */
    desktop: {
      title: '一张学习桌面，应用并排摆开。',
      lede: '桌面端启动后即进入学习桌面：从 Dock 打开各学习应用，窗口可自由摆放或用学习流预设一键分屏；状态栏汇总今日节律与 AI 桌面操控（含紧急断电），切换学习空间自动恢复窗口布局。',
      more: '了解学习桌面',
      link: '/user-guide/workbench',
      art: 'workbench',
      alt: '学习桌面截图：左边的对话窗口里是刚生成的 Anki 卡片，中间是闪卡的今日复习，右边是日程和 AI 学习简报小组件，底部是 Dock',
      /** 宽屏 + 鼠标时那张截图会换成能直接操作的实时桌面（DesktopDemo.vue） */
      live: {
        title: '学习桌面实时演示',
        narrow: '浏览器窗口宽度达到 1024 像素以上时，可直接操作这张学习桌面；也可点击图片查看大图。',
        touch: '点击图片查看大图，左右滑动可浏览整张桌面。在电脑上打开本页即可直接操作；如需在手机上体验，请使用首屏的演示。',
        zoom: '看大图',
        pan: '左右滑动看整张桌面',
        close: '关闭大图',
        waiting: '滚动到此处时自动载入，也可立即开始。',
        loading: '正在打开学习桌面…',
        delayed: '学习桌面暂未就绪，可以重试。',
        start: '立即载入'
      }
    },

    /**
     * 学习 Agent：首屏之后第一个讲的能力（口径见主仓库 docs/brand/messaging.md §2 三条支撑）。
     * 版式同「数据默认存在本机」一节：左标题 + 导语，右侧条目栈
     */
    agent: {
      title: '一个学习 Agent，直接操作每一个应用。',
      lede: '只需一句话，它即可打开对应的应用，完成笔记、思维导图、题目、卡片与复习计划；更长的任务可交由它独立推进。',
      items: [
        {
          title: '直接动手',
          desc: '笔记、思维导图、题目集、闪卡、待办、作文与翻译都有对应的 Agent 工具，结果直接写进应用；也可在对话里直接呈现交互式讲解与沙箱演示。'
        },
        {
          title: '长任务可托付',
          desc: '调研、整理、出题可交给它连续推进：目标模式跨轮续跑，子代理与 Super 会话（实验性）并行处理，定时自动化按时执行。'
        },
        {
          title: '每一步可控',
          desc: '操作按执行档位与风险分级审批，关键步骤先确认再执行；支持学习桌面紧急断电、笔记改动 Diff 审阅与对话回合回退。'
        },
        {
          title: '懂你，可扩展',
          desc: '记住你的薄弱点与学习习惯；内置 58 个技能与 15 家模型服务，支持 MCP，并可在 AI 插件工坊热加载专属扩展。'
        }
      ]
    },

    /**
     * 核心闭环双卡（想明白 / 记得住）：StepFlow.vue 直接渲染全部 2 张卡，
     * 点开浮层展示对应真实截图与 3 条说明。
     */
    flow: {
      close: '关闭',
      steps: [
        {
          label: '想明白',
          statement: '让它带着你的资料把问题讲透。',
          art: 'flow-think',
          alt: '回答界面截图：小标题「怎样接到自己的学习中」，正文引用学习档案里的两条记忆 [忆1] [忆2]，末尾是一条「AI 生成」标记',
          items: [
            {
              title: '出处直达原文',
              desc: 'PDF 页码反链与音视频时间戳一键跳回原处核对，关键结论有据可查。'
            },
            {
              title: '交互式讲解',
              desc: '对话内直接呈现流式交互卡片、图表与隔离沙箱演示，边操作边理解难点。'
            },
            {
              title: '学习空间与记忆',
              desc: '按学科空间隔离资料范围与长期记忆，复杂推导可切换五档思考强度。'
            }
          ]
        },
        {
          label: '记得住',
          statement: '把理解变成按时排好的复习。',
          art: 'flow-review',
          alt: '闪卡今日复习页截图：今日进度环 90%，待复习 2、新卡 12、学习中 4，下面是开始复习按钮',
          items: [
            {
              title: 'FSRS-6 闪卡复习',
              desc: '到期卡片自动排入今日进度环，按记忆程度动态调整间隔，无需安装 Anki。'
            },
            {
              title: '错题与今日冲刺',
              desc: '跨题目集错题本接入 FSRS 复习计划，考前可与闪卡、导图难点合并冲刺。'
            },
            {
              title: '导图背诵挖空',
              desc: '一句话生成的思维导图可一键遮住要点自测，背不出的节点直接转成闪卡。'
            }
          ]
        }
      ]
    },

    features: {
      title: '从读到记，装进同一个窗口。',
      lede: '对话、思维导图、题目练习、制卡复习与文档阅读都在同一个应用里完成，Agent 生成的导图、题目和卡片直接存入对应的应用。',
      tabsLabel: '功能场景',
      more: '了解更多',
      prev: '上一个场景',
      next: '下一个场景',
      dot: '第 {index} 个场景：{name}',
      /* art 对应 docs/public/features/<art>-light|dark.webp，由 scripts/gen-features-live.mjs 从演示界面截取 */
      scenes: [
        {
          tab: '资料对话',
          title: '资料学习与智能对话',
          lead: '回答以你自己的资料为依据。',
          desc: '支持图片、语音与文件输入，答案标注原文页码并可文档优先阅读；支持交互式可视化与生成式卡片，复杂问题可切换深度推理。',
          link: '/user-guide/chat',
          art: 'chat',
          alt: '对话界面截图：按教材页码作答，段末标着第 45、47、52 页'
        },
        {
          tab: '思维导图',
          title: '思维导图',
          lead: '把知识整理成结构。',
          desc: '一句话生成完整知识体系，可在对话中继续修改；背诵模式一键遮住要点，用于自测。',
          link: '/user-guide/mindmap',
          art: 'mindmap',
          alt: '思维导图截图：中心主题「数据并行训练」分出优化方向、基本范式和同步的代价'
        },
        {
          tab: '题目练习',
          title: '题目集与练习',
          lead: '把教材、试卷变成可练习的题目集。',
          desc: '按知识点出题，带答案和解析，勾选后收进题目集；练习自动判分，掌握度按知识点追踪。',
          link: '/user-guide/question-bank',
          art: 'quiz',
          alt: 'AI 出题结果截图：两道带知识点标签、选项和答案的单选题草稿'
        },
        {
          tab: 'Anki 制卡',
          title: 'Anki 智能制卡',
          lead: '把理解变成卡片。',
          desc: '一句话即可批量制卡；翻面检查并修改后加入卡片库，或一键同步到 Anki。',
          link: '/user-guide/anki',
          art: 'anki',
          alt: '制卡界面截图：一张问答卡和翻页圆点，下面是已生成 5 张卡片，以及路由、生成、完成三步的进度'
        },
        {
          tab: '闪卡复习',
          title: '闪卡复习',
          lead: '复习在同一个应用内完成。',
          desc: '内置 FSRS-6 间隔重复：到期卡片自动进入今日复习，按记忆程度评分，下一次复习时间随之调整。',
          link: '/user-guide/flashcards',
          art: 'review',
          alt: '复习界面截图：卡片背面的答案，下面是重来、困难、良好、简单四个评分和对应间隔'
        },
        {
          tab: '文档阅读',
          title: '文档阅读与翻译',
          lead: '原文阅读，随读随译。',
          desc: 'PDF、Word、EPUB 直接阅读，划词即可解释、翻译、存为笔记或制卡；整段材料可生成逐句双语对照。',
          link: '/user-guide/reading-translation',
          art: 'reading',
          alt: '双语阅读截图：英文原文与中文译文逐句对照的表格'
        }
      ]
    },

    /** 手机端：Android 版实时演示与多端同步 */
    mobile: {
      title: '电脑上整理，\n手机上接着学。',
      lede: 'Android 版是同一套应用，界面改为适合单手操作的抽屉导航。课间、通勤时照样能提问、翻资料、刷闪卡。',
      more: '了解移动端',
      link: '/user-guide/mobile',
      frameTitle: 'DeepStudent Android 界面实时演示',
      items: [
        {
          title: '抽屉导航',
          desc: '从屏幕左缘滑出抽屉：上半部分是当前页面的内容，下半部分是应用启动器；系统返回键逐级退回。'
        },
        {
          title: '功能齐全，随手分享',
          desc: '对话、资源库、音视频、待办、技能与闪卡均可使用，并支持从其他应用「分享到 DeepStudent」及导出学习文件。'
        },
        {
          title: '多端同步与 iOS 访问',
          desc: '可通过 WebDAV 云同步（实验性）、扫码配对或加密备份与电脑端互通；iPhone / iPad 可经自托管 WebUI 与 PWA 访问。'
        }
      ]
    },

    /** 音视频（独立应用，用户指南第 19 章），配有真实深浅双主题界面海报 */
    media: {
      title: '网课和讲座，\n它陪你一起学。',
      lede: '导入本地音视频，或粘贴 B 站链接，即可得到带时间戳的字幕；提问、讲义与练习均以字幕为依据，并可跳回对应时刻。',
      more: '了解音视频',
      link: '/user-guide/media',
      posterAlt: '音视频界面截图：按课程分组的 B 站分 P 网课与本地录音列表，标注字幕导入状态、观看进度与联动制卡出题数量',
      items: [
        {
          title: '转写为字幕',
          desc: '本地音视频经语音识别模型转写为带时间戳的字幕，可搜索，点击任意一句即跳到对应位置；已有字幕文件可直接导入。'
        },
        {
          title: '粘贴 B 站链接',
          desc: '粘贴 B 站链接即导入字幕，不下载视频，直接在应用内播放；扫码登录 B 站为可选项，登录后可获取的 AI 字幕更全。'
        },
        {
          title: '回答引用到时刻',
          desc: '就这节课提问，回答中的时间戳引用可点开，播放器随即跳到那一刻；字幕随播放逐句高亮。'
        },
        {
          title: '讲义与整门课',
          desc: '支持课中检查点自测，字幕与关键画面可沉淀为单课台账与图文讲义；多 P 合集一次导入，按分组整理整门课。'
        }
      ]
    },

    /** 扩展与自托管：AI 插件工坊与 WebUI / PWA */
    extend: {
      title: '缺趁手的小工具？\n一句话现场做一个。',
      lede: '内建 AI 插件工坊与自托管 WebUI，既能按自己的学科习惯热加载扩展，也能在任意浏览器与手机主屏幕继续学习。',
      more: '了解 AI 插件工坊',
      link: '/user-guide/plugin-workshop',
      secondaryMore: '了解 WebUI 与 PWA',
      secondaryLink: '/user-guide/webui-pwa',
      items: [
        {
          title: 'AI 插件工坊',
          desc: '用自然语言描述想要的小应用、选区按钮或 AI 工具，系统自动编译、隔离试装并一键热加载，随时可回滚或导出分享。'
        },
        {
          title: '透明权限与安全模式',
          desc: '所有扩展按权限逐项确认后启用；界面连续报错自动熔断隔离，异常时可通过安全模式一键恢复。'
        },
        {
          title: '自托管 WebUI 与 PWA',
          desc: '在装有 Node.js 24+ 的电脑或服务器上即可启动服务，用任意浏览器或手机主屏幕 PWA 远程访问完整资料库。'
        }
      ]
    },

    /**
     * 全部应用（HomeApps.vue）：按「收、读、问、整理、练、记、计划、扩展」排；
     * icon 对应 docs/public/apps/<icon>.svg（产品插画图标），link 是用户指南那一章。extras 是没有独立入口卡片的能力
     */
    apps: {
      /** \n 是固定断行（HomeApps 标题 white-space: pre-line），否则 balance 会断在「每 / 一步」之间 */
      title: '从收资料到复习，\n每一步都有对应的应用。',
      lede: '以下常用应用可单独打开，也可在学习桌面上并排使用。点击任一应用可查看使用说明。',
      items: [
        { icon: 'files', name: '资源库', desc: '教材、笔记、题目、文档与音视频统一入库，自动建立 AI 检索索引。', link: '/user-guide/learning-hub' },
        { icon: 'media', name: '音视频', desc: '网课与录音转写为带时间戳的字幕，或粘贴 B 站链接导入字幕；可边看边问，并生成图文讲义。', link: '/user-guide/media' },
        { icon: 'textbook', name: '教材阅读', desc: 'PDF、Word、EPUB 双页阅读与高亮批注，可勾选页面直接向 AI 提问。', link: '/user-guide/reading-translation' },
        { icon: 'translation', name: '翻译', desc: '全文翻译与逐段双语对照，7 种领域预设，选中文字即可翻译。', link: '/user-guide/reading-translation' },
        { icon: 'chat', name: '对话', desc: '围绕你的资料多轮提问，回答标注出处；支持学习空间、搜索与导出。', link: '/user-guide/chat' },
        { icon: 'notes', name: '笔记', desc: '支持双链、标签与公式的 Markdown 笔记，可与 AI 协同修改，并可生成卡片与导图。', link: '/user-guide/notes' },
        { icon: 'mindmap', name: '思维导图', desc: '一句话生成知识体系导图，提供大纲与画布两种视图，背诵模式可用于自测。', link: '/user-guide/mindmap' },
        { icon: 'exam', name: '题目集', desc: '教材、试卷与错题可转为题目集：AI 录题、九种练习模式、自动判分与解析。', link: '/user-guide/question-bank' },
        { icon: 'essay', name: '作文批改', desc: '高考、雅思、考研等作文多维评分，原文标注、逐句润色、参考范文。', link: '/user-guide/essay' },
        { icon: 'taskDashboard', name: 'Anki 制卡', desc: '一句话将 PDF、图片与笔记制成卡片，可导出 APKG 或同步到 Anki。', link: '/user-guide/anki' },
        { icon: 'flashcards', name: '闪卡', desc: '复习、制卡与模板集中在一处，内置 FSRS-6 间隔重复，无需安装 Anki 即可每日复习。', link: '/user-guide/flashcards' },
        { icon: 'pluginWorkshop', name: '插件工坊', desc: '用自然语言生成小应用、选区按钮或 AI 新工具，自动试装热加载，随时回滚或导出。', link: '/user-guide/plugin-workshop' },
        { icon: 'todo', name: '待办', desc: '一句话添加任务，支持四象限、子任务、提醒与定时自动化。', link: '/user-guide/productivity' },
        { icon: 'pomodoro', name: '番茄钟', desc: '提供严格模式、环境音与置顶小窗，专注时长与趋势以图表呈现。', link: '/user-guide/productivity' },
        { icon: 'skills', name: '技能管理', desc: '管理内置与自定义技能，经 MCP 接入外部工具，并可衔接 AI 插件工坊扩展更多能力。', link: '/user-guide/skills-mcp' },
        { icon: 'settings', name: '设置', desc: '接入 15 家模型服务或本地模型，支持一键 API Key 自动配置，并可按功能分别指定模型。', link: '/user-guide/models' }
      ],
      more: '还有：',
      extras: [
        { name: '论文搜索', link: '/user-guide/paper-search' },
        { name: '深度调研与智能记忆', link: '/user-guide/research-memory' },
        { name: '今日与学习周报', link: '/user-guide/productivity' },
        { name: '学习桌面', link: '/user-guide/workbench' },
        { name: '数据备份与同步', link: '/user-guide/data-sync' },
        { name: '安卓端', link: '/user-guide/mobile' },
        { name: '模板管理', link: '/user-guide/anki' },
        { name: 'WebUI 与 PWA', link: '/user-guide/webui-pwa' }
      ]
    },

    privacy: {
      title: '数据默认存在本机。',
      lede: '学习资料默认保存在本机；AI、搜索和同步等功能按配置访问相应服务。',
      items: [
        {
          title: '本机存储',
          desc: '无需注册账号，资料、笔记和聊天记录默认保存在本机，可通过「设置 → 数据与系统 → 数据治理」备份和迁移。'
        },
        {
          title: '数据离开本机',
          desc: '调用模型、外部搜索或 MCP 时，相关请求会发给对应服务；主动开启云同步（支持 AES-256-GCM 端到端加密）或 Sentry 错误报告（默认关闭）后，相应数据才会发送到对应服务。'
        },
        {
          title: '开源可核对',
          desc: 'AGPL-3.0-or-later 许可，与隐私相关的实现都在源码里，可自行核对。'
        }
      ]
    },

    /** TODO: 换成真实用户评价原文（来源建议：GitHub Discussions、QQ 群、小红书留言） */
    voices: {
      title: '来自用它的人。',
      items: [
        { handle: '@待补充', text: '（等待填入真实用户评价原文）' },
        { handle: '@待补充', text: '（等待填入真实用户评价原文）' },
        { handle: '@待补充', text: '（等待填入真实用户评价原文）' },
        { handle: '@待补充', text: '（等待填入真实用户评价原文）' }
      ]
    },

    faq: {
      title: '常见问题',
      more: '还有问题？',
      moreLink: '前往支持中心',
      items: [
        {
          q: 'DeepStudent 收费吗？怎么配 AI 模型？',
          a: '软件免费开源（AGPL-3.0-or-later），无需注册账号。首次启动在欢迎弹窗填入 API Key 即可 1 分钟一键自动配置，内置 15 家模型服务商，费用直接支付给服务商；也可免密钥接入 Ollama 等本机模型。'
        },
        {
          q: '数据会上传到云端吗？',
          a: '本地优先不等于所有功能都离线：资料默认留在设备本地，只有调用你配置的模型、外部搜索、MCP，或主动开启加密云同步、错误报告（默认关闭）与更新检查时，才会产生对应网络请求。'
        },
        {
          q: '我的数据保存在哪里？',
          a: 'macOS 在 ~/Library/Application Support/com.deepstudent.app/，Windows 在 %APPDATA%\\com.deepstudent.app\\，Linux 在 ~/.local/share/com.deepstudent.app/。备份建议走「设置 → 数据与系统 → 数据治理」导出，不要手动拷贝目录。'
        },
        {
          q: '支持哪些平台？',
          a: 'macOS（Apple Silicon / Intel）、Windows、Linux 与 Android 均提供安装包；也支持自托管 WebUI & PWA，直接在任意浏览器或手机主屏幕访问；iOS 需自行使用 Xcode 从源码构建。'
        },
        {
          q: '从 0.11.x 升级到 0.20.x 数据会丢吗？',
          a: '不会。新版本会原地挂载原有的 SQLite 与 LanceDB 数据、自动迁移配置并保留已装插件；不过跨大版本升级前仍建议先在「设置 → 数据与系统 → 数据治理」导出一份备份。'
        },
        {
          q: 'macOS 提示「已损坏，无法打开」怎么办？',
          a: '正式发布包已通过 Apple 签名与公证，通常不会触发拦截。仅安装未公证预览版或自构建包遇到此提示时，在终端执行 sudo xattr -r -d com.apple.quarantine "/Applications/Deep Student.app" 即可；应用名包含空格，引号不可省略，路径不同请替换为实际路径。'
        }
      ]
    },

    cta: {
      title: '把精力还给学习本身。',
      lede: '免费开源、无需注册，资料默认保存在你自己的设备上。'
    }
  }
}
