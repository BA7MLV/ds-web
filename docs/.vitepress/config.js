import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'
import llmstxt from 'vitepress-plugin-llms'
import { loadEnv } from 'vite'
import { execFileSync } from 'node:child_process'
import { resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const guideSidebar = [
  {
    text: '开始',
    collapsed: false,
    items: [
      { text: '什么是 DeepStudent', link: '/what-is-deepstudent.md' },
      { text: '下载与安装', link: '/download.md' },
      { text: '快速上手', link: '/start.md' },
    ]
  },
  {
    text: '日常使用',
    collapsed: false,
    items: [
      { text: '智能对话', link: '/user-guide/01-chat-v2.md' },
      {
        text: '学习资源',
        link: '/user-guide/02-learning-hub.md',
        collapsed: true,
        items: [
          { text: '笔记', link: '/user-guide/02-learning-hub-assets/01-notes.md' },
          { text: '教材与阅读', link: '/user-guide/02-learning-hub-assets/02-textbooks.md' },
          { text: '题目集与练习', link: '/user-guide/02-learning-hub-assets/03-question-bank.md' },
          { text: '翻译与作文', link: '/user-guide/02-learning-hub-assets/04-translation-essay.md' },
          { text: '知识导图', link: '/user-guide/02-learning-hub-assets/05-mindmap.md' },
        ]
      },
      { text: 'Anki智能制卡', link: '/user-guide/03-chatanki.md' },
      { text: '待办与番茄钟', link: '/user-guide/08-todo-pomodoro.md' },
      { text: '命令面板与快捷键', link: '/user-guide/06-command-palette.md' },
    ]
  },
  {
    text: '进阶能力',
    collapsed: false,
    items: [
      { text: '技能系统', link: '/user-guide/07-skills.md' },
      { text: '智能记忆', link: '/user-guide/09-memory.md' },
    ]
  },
  {
    text: '设置与数据',
    collapsed: false,
    items: [
      { text: '系统设置', link: '/user-guide/04-settings.md' },
      { text: '备份与同步', link: '/user-guide/05-data-management.md' },
    ]
  },
  {
    text: '帮助',
    collapsed: false,
    items: [
      { text: '常见问题', link: '/A-Q.md' },
      { text: '项目历程', link: '/timeline.md' },
      { text: '支持', link: '/support.md' },
      { text: '关于我们', link: '/about.md' },
    ]
  }
]

const docsRootDir = fileURLToPath(new URL('../', import.meta.url))

const repoRootDir = resolve(docsRootDir, '..')
const mode = process.env.NODE_ENV ?? 'development'
const env = loadEnv(mode, repoRootDir, '')
const LA_ID = process.env.VITE_LA_51_ID || process.env.LA_ID || env.VITE_LA_51_ID || env.LA_ID
const LA_CK =
  process.env.VITE_LA_51_CK ||
  process.env.LA_CK ||
  env.VITE_LA_51_CK ||
  env.LA_CK ||
  LA_ID

// 首页实时演示地址（装在应用窗壳里的 iframe）覆盖项。
// 留空时用同源镜像 /demo/（由 scripts/sync-demo.mjs 从 demo 站同步产物），
// 只有对着远程改版调试时才需要填一个绝对地址。
const DEMO_URL = process.env.VITE_DEMO_URL || env.VITE_DEMO_URL || ''

// —— GEO / SEO 常量 ——
const SITE_ORIGIN = 'https://deepstudent.cn'
const SITE_URL = `${SITE_ORIGIN}/`
/**
 * 页面没有自己的 description 时的兜底，按语言分开：
 * 英文落地页（docs/en/index.md）不能落中文描述。
 * key 用 lang 标签，与 theme/i18n/messages 保持一致。
 */
const DEFAULT_DESCRIPTION = {
  'zh-CN':
    'DeepStudent 官方文档：AI 原生、本地优先的开源学习系统。资料问答（RAG）、笔记、知识导图、刷题、翻译、作文批改与 Anki 制卡。',
  'en-US':
    'DeepStudent documentation: an AI-native, local-first, open-source learning system — material chat with citations (RAG), notes, mind maps, practice questions, translation, essay grading and Anki card generation.'
}
const OG_IMAGE = `${SITE_ORIGIN}/img/index.png`

/**
 * 落地页的中英互译关系，用于输出 hreflang。
 * 目前只有落地页有英文版（docs/en/index.md），文档正文只有中文，
 * 所以只给落地页输出 hreflang —— 给没有译文的页面输出，会指向并不存在的地址，反而误导爬虫。
 * 以后新增语言的落地页，在这里补一行。
 */
const LANDING_ALTERNATES = [
  { hreflang: 'zh-CN', href: SITE_URL },
  { hreflang: 'en-US', href: `${SITE_URL}en/` },
  { hreflang: 'x-default', href: SITE_URL }
]

// 由页面相对路径推导线上 canonical URL（未启用 cleanUrls，产物为 .html）
const getPageUrl = (relativePath) => {
  const path = relativePath
    .replace(/(^|\/)index\.md$/, '$1')
    .replace(/\.md$/, '.html')
  return `${SITE_URL}${path}`
}

const gitEditorsCache = new Map()

const getGitEditors = (absPath) => {
  if (gitEditorsCache.has(absPath)) return gitEditorsCache.get(absPath)

  try {
    const output = execFileSync('git', ['log', '--follow', '--format=%an', '--', absPath], {
      encoding: 'utf-8'
    })

    const seen = new Set()
    const editors = []
    for (const line of output.split('\n')) {
      const name = line.trim()
      if (!name || seen.has(name)) continue
      seen.add(name)
      editors.push(name)
    }

    gitEditorsCache.set(absPath, editors)
    return editors
  } catch {
    gitEditorsCache.set(absPath, [])
    return []
  }
}

export default withMermaid(defineConfig({
  appearance: true,
  markdown: {
    image: {
      lazyLoading: true
    }
  },
  title: 'DeepStudent',
  titleTemplate: ':title｜DeepStudent',
  description: 'AI 原生、本地优先的开源学习系统',
  base: '/',
  // 内部工程计划与仓库规范不进入站点与搜索
  srcExclude: ['plans/**', 'AGENTS.md'],
  // 生成 /sitemap.xml，供搜索引擎与 AI 爬虫发现全部页面
  sitemap: {
    hostname: SITE_URL
  },
  vite: {
    // 把根级 .env 里的演示地址注入到客户端代码（组件里读 import.meta.env.VITE_DEMO_URL）
    define: {
      'import.meta.env.VITE_DEMO_URL': JSON.stringify(DEMO_URL)
    },
    plugins: [
      // 生成 /llms-full.txt 及每页的 .md 版本（llmstxt.org 标准）
      // 根级 /llms.txt 使用 docs/public/llms.txt 手写产品版，故关闭插件生成
      llmstxt({
        domain: SITE_ORIGIN,
        ignoreFiles: ['plans/**', 'AGENTS.md', 'en/**'],
        generateLLMsTxt: false,
        title: 'DeepStudent Documentation',
        description:
          'DeepStudent is an AI-native, local-first, open-source learning system (AGPL-3.0). Official documentation in Simplified Chinese.',
        details:
          'Chat with your study materials (RAG with citations), notes, mind maps, question banks, translation & essay grading, and one-click Anki card generation — all data stored locally by default.'
      })
    ]
  },
  head: [
    ['meta', { name: 'viewport', content: 'width=device-width, initial-scale=1.0, viewport-fit=cover' }],
    ['link', { rel: 'icon', href: '/favicon.ico', sizes: 'any' }],
    ['link', { rel: 'apple-touch-icon', href: '/apple-touch-icon.png?v=20260212-2' }],
    ['meta', { name: 'theme-color', content: '#f5f5f7', media: '(prefers-color-scheme: light)' }],
    ['meta', { name: 'theme-color', content: '#0a0a0c', media: '(prefers-color-scheme: dark)' }],
    ['meta', { name: 'color-scheme', content: 'light dark' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous' }],
    [
      'link',
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600;700&display=swap',
      },
    ],
    ...(LA_ID
      ? [
          [
            'script',
            {
              charset: 'UTF-8',
              id: 'LA_COLLECT',
              src: 'https://sdk.51.la/js-sdk-pro.min.js',
            },
          ],
          ['script', {}, `LA.init({id:"${LA_ID}",ck:"${LA_CK}",hashMode:true});`],
        ]
      : []),
  ],
  themeConfig: {
    logo: { light: '/logo-black.svg', dark: '/logo-white.svg' },
    siteTitle: '', // 有 logo 时不显示标题文本
    // 顶栏由 theme/components/SiteNav.vue 渲染（Apple 风格浮动胶囊），此处保持一致以备用
    nav: [
      { text: '文档', link: '/what-is-deepstudent.md' },
      { text: '路线图', link: '/timeline.md' },
      { text: 'QA', link: '/A-Q.md' },
      { text: '支持', link: '/support.md' },
      { text: '下载', link: '/download.md' }
    ],
    sidebar: {
      '/': guideSidebar
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/helixnow/deep-student' }
    ],
    footer: {
      message: 'Released under the AGPL-3.0 License.',
      copyright: 'Copyright © 2025-2026 DeepStudent Team'
    },
    // 添加搜索功能
    search: {
      provider: 'local',
      options: {
        /*
         * key 必须用 locale 的索引名（root / en），不能用语言标签。
         * VPLocalSearchBox 取的是 options.locales[localeIndex]，
         * 而 localeIndex 就是 locales 配置里的 key；写成 zh 永远匹配不上，
         * 中文弹窗会静默回退成内置英文（'Search'）。
         * 英文站不配，用 VitePress 内置的英文文案即可。
         */
        locales: {
          root: {
            translations: {
              button: {
                buttonText: '搜索文档',
                buttonAriaLabel: '搜索文档'
              },
              modal: {
                noResultsText: '无法找到相关结果',
                resetButtonTitle: '清除查询条件',
                footer: {
                  selectText: '选择',
                  navigateText: '切换',
                  closeText: '关闭'
                }
              }
            }
          }
        }
      }
    },
    // 添加大纲配置
    outline: {
      level: [2, 3],
      label: '目录'
    },
    // 添加返回顶部按钮
    returnToTop: true,
    // 添加侧边栏切换
    sidebarMenuLabel: '菜单',
    // 添加编辑链接
    editLink: {
      pattern: 'https://github.com/BA7MLV/ds-web/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页面'
    }
  },
  // 添加多语言支持
  locales: {
    root: {
      label: '简体中文',
      lang: 'zh-CN',
      themeConfig: {
        lastUpdatedText: '最后更新时间'
      }
    },
    en: {
      label: 'English',
      lang: 'en-US',
      link: '/en/',
      /*
       * 英文站目前只有落地页（docs/en/index.md），文档正文仍只有中文。
       * 顶栏由 theme/components/SiteNav.vue 按 frontmatter.layout 选变体、文案走
       * theme/i18n/messages/<lang>.js；这里的 nav 只喂给 VitePress 自带、被
       * custom.css 视觉隐藏的 VPNavBar —— 不写的话它会回退到根语言的「文档 / 路线图 /
       * 支持 / 下载」，英文页的 DOM 里就混进中文菜单。sidebar 同理，暂无英文文档页故省略。
       */
      themeConfig: {
        nav: [
          { text: 'Docs', link: '/what-is-deepstudent' },
          { text: 'Roadmap', link: '/timeline' },
          { text: 'QA', link: '/A-Q' },
          { text: 'Support', link: '/support' },
          { text: 'Download', link: '/download' },
        ],
        outline: {
          level: [2, 3],
          label: 'On this page',
        },
        sidebarMenuLabel: 'Menu',
        lastUpdatedText: 'Last updated',
        editLink: {
          pattern: 'https://github.com/BA7MLV/ds-web/edit/main/docs/:path',
          text: 'Edit this page on GitHub',
        },
      }
    }
  },
  // 添加默认语言
  lang: 'zh-CN',
  // 添加最后更新时间
  lastUpdated: {
    text: '最后更新时间'
  },
  transformPageData(pageData) {
    if (!pageData?.relativePath?.endsWith('.md')) return

    const absPath = resolve(docsRootDir, pageData.relativePath)
    const editors = getGitEditors(absPath)
    pageData.editors = editors
    pageData.lastAuthor = editors[0] || ''

    // —— GEO：为每个页面注入 canonical / Open Graph / JSON-LD ——
    const pageUrl = getPageUrl(pageData.relativePath)
    /*
     * 用 layout 判定落地页，而不是 relativePath === 'index.md'：
     * 英文落地页 en/index.md 同样是 layout: home，只看路径会让它掉进「文章」分支 ——
     * og:title 会拼两次品牌名、og:type 变成 article、JSON-LD 也变成 TechArticle。
     */
    const isHome = pageData.frontmatter?.layout === 'home'
    const isEnglish = pageData.relativePath.startsWith('en/')
    const locale = isEnglish ? 'en-US' : 'zh-CN'
    // 首页 frontmatter title 已是完整标题（DeepStudent - …），不再拼接品牌名
    const pageTitle = isHome
      ? pageData.title || 'DeepStudent'
      : pageData.title
        ? `${pageData.title}｜DeepStudent`
        : 'DeepStudent'
    const pageDescription =
      pageData.frontmatter?.description || pageData.description || DEFAULT_DESCRIPTION[locale]
    // VitePress 会用 pageData.description 渲染 <meta name="description">
    pageData.description = pageDescription

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': isHome ? 'WebSite' : 'TechArticle',
      name: isHome ? 'DeepStudent' : pageData.title || 'DeepStudent',
      headline: pageData.title || 'DeepStudent',
      description: pageDescription,
      url: pageUrl,
      inLanguage: isEnglish ? 'en-US' : 'zh-CN',
      isPartOf: {
        '@type': 'WebSite',
        name: 'DeepStudent',
        url: SITE_URL
      },
      about: {
        '@type': 'SoftwareApplication',
        name: 'DeepStudent',
        applicationCategory: 'EducationalApplication',
        operatingSystem: 'macOS, Windows, Linux, Android',
        url: SITE_ORIGIN,
        sameAs: ['https://github.com/helixnow/deep-student']
      },
      publisher: {
        '@type': 'Organization',
        name: 'DeepStudent Team',
        url: SITE_ORIGIN
      }
    }
    if (pageData.lastUpdated) {
      jsonLd.dateModified = new Date(pageData.lastUpdated).toISOString()
    }

    // 落地页才输出 hreflang 与「另一种语言」的 og:locale:alternate（见 LANDING_ALTERNATES）
    const alternates = isHome
      ? [
          ...LANDING_ALTERNATES.map(({ hreflang, href }) => [
            'link',
            { rel: 'alternate', hreflang, href }
          ]),
          ['meta', { property: 'og:locale:alternate', content: isEnglish ? 'zh_CN' : 'en_US' }]
        ]
      : []

    pageData.frontmatter.head ??= []
    pageData.frontmatter.head.push(
      ['link', { rel: 'canonical', href: pageUrl }],
      ...alternates,
      ['meta', { property: 'og:site_name', content: 'DeepStudent' }],
      ['meta', { property: 'og:type', content: isHome ? 'website' : 'article' }],
      ['meta', { property: 'og:locale', content: isEnglish ? 'en_US' : 'zh_CN' }],
      ['meta', { property: 'og:title', content: pageTitle }],
      ['meta', { property: 'og:description', content: pageDescription }],
      ['meta', { property: 'og:url', content: pageUrl }],
      ['meta', { property: 'og:image', content: OG_IMAGE }],
      ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
      ['meta', { name: 'twitter:title', content: pageTitle }],
      ['meta', { name: 'twitter:description', content: pageDescription }],
      ['meta', { name: 'twitter:image', content: OG_IMAGE }],
      ['script', { type: 'application/ld+json' }, JSON.stringify(jsonLd)]
    )
  },
}))
