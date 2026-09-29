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
    previewDescription: '围绕学习资料展开对话，再把理解整理成知识导图、练习题和 Anki 卡片。',
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
      title: '开源的终身学习空间',
      lede: ['开源、本地优先的学习工作台，', '资料和数据都在你自己手里'],
      download: '立即下载',
      quickStart: '快速上手'
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
          art: 'think',
          alt: '单个问答气泡的字符画',
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
          art: 'review',
          alt: '单个循环复习符号的字符画',
          items: [
            {
              title: '知识导图',
              desc: '一句话生成完整知识体系，边聊边改，还能遮住节点自测。'
            },
            {
              title: '题目练习',
              desc: '把教材变成可练习的题库，自动判分，掌握度看得见。'
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
      title: '四件事，装进同一个窗口。',
      lede: '资料对话、知识导图、题目练习、Anki 制卡共用同一份数据，不用在几个软件之间来回搬。',
      tabsLabel: '功能场景',
      more: '了解更多',
      prev: '上一个场景',
      next: '下一个场景',
      dot: '第 {index} 个场景：{name}',
      scenes: [
        {
          tab: '资料对话',
          title: '资料学习与智能对话',
          lead: '围绕你自己的材料学习，而不是通用聊天。',
          desc: '支持图片、语音和文件；引用面板直接调取你的资料；复杂问题切深度推理。',
          link: '/user-guide/01-chat-v2',
          img: '/feature-chat-ascii.svg',
          alt: '材料与对话引线的字符画'
        },
        {
          tab: '知识导图',
          title: '知识导图',
          lead: '把知识整理成结构。',
          desc: '一句话生成完整知识体系，边聊边改，遮住节点就能自测。',
          link: '/user-guide/02-learning-hub-assets/05-mindmap',
          img: '/feature-mindmap-ascii.svg',
          alt: '知识导图节点层级的字符画'
        },
        {
          tab: '题目练习',
          title: '题目集与练习',
          lead: '把教材、试卷变成可练习的题库。',
          desc: '自动从教材里提取或生成题目，自动判分，掌握度按知识点追踪。',
          link: '/user-guide/02-learning-hub-assets/03-question-bank',
          img: '/feature-quiz-ascii.svg',
          alt: '试卷与判分徽章的字符画'
        },
        {
          tab: 'Anki 制卡',
          title: 'Anki 智能制卡',
          lead: '把理解变成长期记忆。',
          desc: '说一句话就能制卡，批量生成，一键同步到 Anki。',
          link: '/user-guide/03-chatanki',
          img: '/feature-anki-ascii.svg',
          alt: '卡片堆与遗忘曲线的字符画'
        }
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
          a: '这是 macOS 对非 App Store 应用的隔离机制。在终端执行 sudo xattr -r -d com.apple.quarantine /Applications/DeepStudent.app 即可，安装路径不同就换成真实路径。'
        }
      ]
    }
  }
}
