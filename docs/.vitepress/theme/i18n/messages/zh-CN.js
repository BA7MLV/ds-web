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
   * 下载与求助的去处。中文页都进站内页面；英文页换成有英文界面的地方（见 en-US.js）——
   * 下载页和支持页只有中文，英文访客点进去就是死胡同。
   */
  links: {
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
    previewDescription: '围绕学习资料展开对话，再把理解整理成思维导图、练习题和 Anki 卡片。',
    /** 壳内那张真实界面截图的替代文字；截图与实时演示是同一个界面 */
    posterAlt:
      'DeepStudent 应用界面：左侧是学习资源与对话列表，右侧是围绕资料的问答，回答带引用出处，并已整理成 5 张 Anki 卡片。',
    waiting: '实时演示将自动载入，点这里也可以马上开始。',
    loading: '正在载入可交互的实时演示…',
    delayed: '实时演示暂未就绪，你可以重试或先看下方功能。',
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
      quickStart: '快速上手'
    },

    /**
     * 学习桌面：桌面端打开就是它（主仓库 desktop.workbenchMode 缺省为 true）。
     * art 对应 docs/public/features/<art>-light|dark.webp，是 1440 × 900 的整屏截图
     */
    desktop: {
      title: '一张学习桌面，应用并排摆开。',
      lede: '桌面端打开就是学习桌面：从 Dock 打开对话、资源库和各个学习应用，窗口自由摆放、平铺、并排对比，日程和 AI 学习简报留在桌面上。',
      more: '了解学习桌面',
      link: '/user-guide/workbench',
      art: 'workbench',
      alt: '学习桌面截图：左边的对话窗口里是刚生成的 Anki 卡片，中间是闪卡的今日复习，右边是日程和 AI 学习简报小组件，底部是 Dock',
      /** 宽屏 + 鼠标时那张截图会换成能直接操作的实时桌面（DesktopDemo.vue） */
      live: {
        title: '学习桌面实时演示',
        hint: '这张桌面可以直接上手：从 Dock 打开应用，拖动、缩放窗口，在闪卡里开始复习。演示数据只留在这个页面，刷新就复原。',
        narrow: '把浏览器窗口拉宽到 1024 像素以上，这张学习桌面就能直接操作；也可以点图看大图。',
        touch: '点图看大图，左右滑动看整张桌面。在电脑上打开这一页能直接操作；想在手机上试试，翻到首屏的演示。',
        zoom: '看大图',
        pan: '左右滑动看整张桌面',
        close: '关闭大图',
        waiting: '滚到这里会自动载入，也可以马上开始。',
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
      lede: '只需一句话，它即可打开对应的应用，完成笔记、思维导图、题目、卡片与复习计划；更长的任务，也能独立推进。',
      items: [
        {
          title: '直接动手',
          desc: '笔记、思维导图、题目集、闪卡、待办、作文与翻译都有对应的 Agent 工具，结果直接写进应用。'
        },
        {
          title: '长任务可托付',
          desc: '调研、整理、出题可交给它连续推进：目标模式跨轮续跑，子代理并行处理，定时任务按时执行。'
        },
        {
          title: '每一步可控',
          desc: '操作按风险分级审批，Ask / Plan / Craft 三种权限模式可选；笔记与学习桌面上的改动可撤销。'
        },
        {
          title: '懂你，可扩展',
          desc: '记住你的薄弱点与学习习惯；内置 56 个技能，支持 MCP 与 13 家模型服务。'
        }
      ]
    },

    /**
     * 使用流程：区块里没有任何标题 —— 眉标、导语、`title` 都已删掉。
     * 分段控件上的三个 `label` 就是每一步的标题（见 StepFlow.vue），
     * 所以 `label` 只有这一个用途，别再往面板里渲染一遍。
     * 步骤编号同样去掉了，进度读数改用 1 起的普通序号，见 progressLabel。
     */
    flow: {
      segLabel: '使用流程步骤',
      hint: '继续滚动，进入下一步',
      progress: '{current} / {total}',
      close: '关闭',
      steps: [
        {
          label: '收进来',
          statement: '先把材料收进来。',
          items: [
            {
              title: '统一入库',
              desc: '教材、试卷、PDF、笔记都收进同一个库，不用再翻网盘和文件夹。'
            },
            {
              title: '扫描件也能用',
              desc: '扫描版 PDF 自动识别文字，之后照样能检索、引用、出题。'
            },
            {
              title: '索引在本地',
              desc: '检索索引建在你自己机器上，随时能重建或删掉。'
            }
          ]
        },
        {
          label: '想明白',
          statement: '围绕你的材料对话。',
          art: 'flow-think',
          alt: '回答界面截图：小标题「怎样接到自己的学习中」，正文引用学习档案里的两条记忆 [忆1] [忆2]，末尾是一条「AI 生成」标记',
          items: [
            {
              title: '答案带出处',
              desc: '每个回答都标出引用了哪一段，点一下就能回到原文核对。'
            },
            {
              title: '技能与记忆',
              desc: '常用流程存成技能，长期偏好写进记忆，越用越顺手。'
            },
            {
              title: '推理模式',
              desc: '复杂推导切到深度推理，能看到过程，不只有结论。'
            }
          ]
        },
        {
          label: '记得住',
          statement: '变成能复习的东西。',
          art: 'flow-review',
          alt: '闪卡今日复习页截图：今日进度环 90%，待复习 2、新卡 12、学习中 4，下面是开始复习按钮',
          items: [
            {
              title: '思维导图',
              desc: '一句话生成完整知识体系，边聊边改，还能遮住节点自测。'
            },
            {
              title: '题目练习',
              desc: '把教材变成可练习的题目集，自动判分，掌握度按知识点追踪。'
            },
            {
              title: 'Anki 制卡',
              desc: '说一句话就能制卡，批量生成，一键同步到 Anki。'
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
          desc: '支持图片、语音和文件；回答带出处，标到原文页码；复杂问题切深度推理。',
          link: '/user-guide/chat',
          art: 'chat',
          alt: '对话界面截图：按教材页码作答，段末标着第 45、47、52 页'
        },
        {
          tab: '思维导图',
          title: '思维导图',
          lead: '把知识整理成结构。',
          desc: '一句话生成完整知识体系，边聊边改；背诵模式一键遮住要点，自己默一遍。',
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
          desc: '说一句话就能制卡，批量生成；翻面检查、改好后加入卡片库，或一键同步到 Anki。',
          link: '/user-guide/anki',
          art: 'anki',
          alt: '制卡界面截图：一张问答卡和翻页圆点，下面是已生成 5 张卡片，以及路由、生成、完成三步的进度'
        },
        {
          tab: '闪卡复习',
          title: '闪卡复习',
          lead: '复习也在同一个应用里。',
          desc: '内置 FSRS 间隔重复：到期的卡自动排进今日复习，按记得的程度评分，下一次复习时间随之调整。',
          link: '/user-guide/flashcards',
          art: 'review',
          alt: '复习界面截图：卡片背面的答案，下面是重来、困难、良好、简单四个评分和对应间隔'
        },
        {
          tab: '文档阅读',
          title: '文档阅读与翻译',
          lead: '读原文，也读得懂原文。',
          desc: 'PDF、Word、EPUB 直接阅读，划词解释、翻译、存笔记或制卡；整段材料生成逐句双语对照。',
          link: '/user-guide/reading-translation',
          art: 'reading',
          alt: '双语阅读截图：英文原文与中文译文逐句对照的表格'
        }
      ]
    },

    /**
     * 全部应用（HomeApps.vue）：桌面端 Dock 和「全部应用」面板里的应用（教材阅读另列；AI 仪表盘在产品里和对话共用一枚图标，不单列），按「收、读、问、整理、练、记、计划、扩展」排；
     * icon 对应 docs/public/apps/<icon>.svg（产品插画图标），link 是用户指南那一章。extras 是没有独立应用的能力
     */
    apps: {
      title: '从收资料到复习，每一步都有对应的应用。',
      lede: '这些应用都在桌面端的 Dock 和「全部应用」里，可以单独打开，也能在学习桌面上并排摆。点一个，看它的使用说明。',
      items: [
        { icon: 'files', name: '资源库', desc: '教材、笔记、题目、文档与音视频统一入库，自动建好 AI 检索索引。', link: '/user-guide/learning-hub' },
        { icon: 'textbook', name: '教材阅读', desc: 'PDF、Word、EPUB 双页阅读、高亮批注，勾选页面直接问 AI。', link: '/user-guide/reading-translation' },
        { icon: 'translation', name: '翻译', desc: '全文翻译和逐段双语对照，7 种领域预设，选中文字随手就译。', link: '/user-guide/reading-translation' },
        { icon: 'chat', name: '对话', desc: '围绕你的资料多轮提问，回答标出处；课题分组、搜索、导出都有。', link: '/user-guide/chat' },
        { icon: 'notes', name: '笔记', desc: '双链、标签、公式的 Markdown 笔记，和 AI 一起改，还能生成卡片和导图。', link: '/user-guide/notes' },
        { icon: 'mindmap', name: '思维导图', desc: '一句话生成知识体系导图，大纲和画布两种视图，背诵模式自测。', link: '/user-guide/mindmap' },
        { icon: 'exam', name: '题目集', desc: '教材、试卷、错题变成题目集：AI 录题、九种练习、自动判分和解析。', link: '/user-guide/question-bank' },
        { icon: 'essay', name: '作文批改', desc: '高考、雅思、考研等作文多维评分，原文标注、逐句润色、参考范文。', link: '/user-guide/essay' },
        { icon: 'taskDashboard', name: 'Anki 制卡', desc: '一句话把 PDF、图片、笔记做成卡片，导出 APKG 或同步到 Anki。', link: '/user-guide/anki' },
        { icon: 'flashcards', name: '闪卡', desc: '复习、制卡、模板集中在一处，内置 FSRS 间隔重复，不装 Anki 也能天天复习。', link: '/user-guide/flashcards' },
        { icon: 'templates', name: '模板管理', desc: '可视化编辑 Anki 卡片模板，制卡时直接套用。', link: '/user-guide/anki' },
        { icon: 'todo', name: '待办', desc: '一句话添加任务，四象限、子任务、提醒，还能设定时自动化。', link: '/user-guide/productivity' },
        { icon: 'pomodoro', name: '番茄钟', desc: '严格模式、环境音、置顶小窗，专注时长和趋势一目了然。', link: '/user-guide/productivity' },
        { icon: 'skills', name: '技能管理', desc: '让 AI 按需加载技能、用 MCP 连上外部工具，可以自己装、自己写。', link: '/user-guide/skills-mcp' },
        { icon: 'settings', name: '设置', desc: '接入 13 家模型服务或本地模型，按功能分别指定用哪个模型。', link: '/user-guide/models' }
      ],
      more: '还有：',
      extras: [
        { name: '音视频学习', link: '/user-guide/learning-hub' },
        { name: '论文搜索', link: '/user-guide/paper-search' },
        { name: '深度调研与智能记忆', link: '/user-guide/research-memory' },
        { name: '今日与学习周报', link: '/user-guide/productivity' },
        { name: '学习桌面', link: '/user-guide/workbench' },
        { name: '数据备份与同步', link: '/user-guide/data-sync' },
        { name: '安卓端', link: '/user-guide/mobile' }
      ]
    },

    privacy: {
      title: '数据默认存在本机。',
      lede: '学习资料默认保存在本机；AI、搜索和同步等功能按配置访问相应服务。',
      items: [
        {
          title: '本机存储',
          desc: '资料、笔记和聊天记录默认保存在本机，可通过「设置 → 数据治理」备份和迁移。'
        },
        {
          title: '数据离开本机',
          desc: '调用模型、外部搜索或 MCP 时，相关请求会发给对应服务；启用云同步或 Sentry 错误报告后，相应数据也会发送到对应服务。'
        },
        {
          title: '开源可核对',
          desc: 'AGPL-3.0 许可，与隐私相关的实现都在源码里，可自行核对。'
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
          q: 'DeepStudent 收费吗？',
          a: '软件免费开源（AGPL-3.0）。AI 用你自己配置的密钥，费用直接付给模型服务商；也可以接本地模型，完全不花钱。'
        },
        {
          q: '数据会上传到云端吗？',
          a: '学习资料默认保存在本机，但本地优先不等于所有功能都离线。AI 会将所需内容发给你配置的模型服务；外部搜索、MCP、主动开启的云同步和错误报告也可能发送相关请求或数据。桌面端还会按设置检查更新。'
        },
        {
          q: '我的数据保存在哪里？',
          a: 'macOS 在 ~/Library/Application Support/com.deepstudent.app/，Windows 在 %APPDATA%\\com.deepstudent.app\\，Linux 在 ~/.local/share/com.deepstudent.app/。备份建议走「设置 → 数据治理」导出，不要手动拷贝目录。'
        },
        {
          q: '支持哪些平台？',
          a: 'macOS（Apple Silicon / Intel）、Windows、Linux 和 Android 都有安装包。iOS 需要自己用 Xcode 构建。'
        },
        {
          q: 'macOS 提示「已损坏，无法打开」怎么办？',
          a: '这是 macOS 对非 App Store 应用的隔离机制。在终端执行 sudo xattr -r -d com.apple.quarantine "/Applications/Deep Student.app" 即可。应用名带空格，引号不能省；安装路径不同就换成真实路径。'
        }
      ]
    }
  }
}
