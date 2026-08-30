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
      { text: '什么是 DeepStudent', link: '/' },
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

// —— GEO / SEO 常量 ——
const SITE_ORIGIN = 'https://deepstudent.cn'
const DOCS_URL = `${SITE_ORIGIN}/docs/`
const DEFAULT_DESCRIPTION =
  'DeepStudent 官方文档：AI 原生、本地优先的开源学习系统。资料问答（RAG）、笔记、知识导图、刷题、翻译、作文批改与 Anki 制卡。'
const OG_IMAGE = `${SITE_ORIGIN}/img/index.png`

// 由页面相对路径推导线上 canonical URL（未启用 cleanUrls，产物为 .html）
const getPageUrl = (relativePath) => {
  const path = relativePath
    .replace(/(^|\/)index\.md$/, '$1')
    .replace(/\.md$/, '.html')
  return `${DOCS_URL}${path}`
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
  title: 'DeepStudent｜Documentation',
  titleTemplate: ':title｜DeepStudent｜Documentation',
  description: 'AI 原生、本地优先的开源学习系统',
  base: '/docs/',
  // 内部工程计划与仓库规范不进入站点与搜索
  srcExclude: ['plans/**', 'AGENTS.md'],
  // 生成 /docs/sitemap.xml，供搜索引擎与 AI 爬虫发现全部页面
  sitemap: {
    hostname: DOCS_URL
  },
  vite: {
    plugins: [
      // 生成 /docs/llms.txt、/docs/llms-full.txt 及每页的 .md 版本（llmstxt.org 标准）
      llmstxt({
        domain: `${SITE_ORIGIN}/docs`,
        ignoreFiles: ['plans/**', 'AGENTS.md', 'en/**'],
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
    // 与主站共用同一个 favicon（根目录 /public/favicon.ico）
    ['link', { rel: 'icon', href: '/favicon.ico', sizes: 'any' }],
    ['link', { rel: 'apple-touch-icon', href: '/docs/apple-touch-icon.png?v=20260212-2' }],
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
    logo: { light: '/logo-r.svg', dark: '/logo-r-dark.svg' },
    siteTitle: '', // 有 logo 时不显示标题文本
    nav: [
      { text: '指南', link: '/' },
      // base 为 /docs/，用 /../ 跳转到根站点（React 官网）
      { text: '官网', link: '/../', target: '_self' }
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
        locales: {
          zh: {
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
      themeConfig: {
        nav: [
          { text: 'Docs', link: '/en/' },
          { text: 'Website', link: '/../', target: '_self' },
        ],
        sidebar: {
          '/en/': [
            {
              text: 'DeepStudent',
              collapsed: false,
              items: [{ text: 'Home', link: '/en/' }],
            },
          ],
        },
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
    const isHome = pageData.relativePath === 'index.md'
    const isEnglish = pageData.relativePath.startsWith('en/')
    const pageTitle = pageData.title
      ? `${pageData.title}｜DeepStudent Documentation`
      : 'DeepStudent｜Documentation'
    const pageDescription = pageData.frontmatter?.description || pageData.description || DEFAULT_DESCRIPTION
    // VitePress 会用 pageData.description 渲染 <meta name="description">
    pageData.description = pageDescription

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': isHome ? 'WebSite' : 'TechArticle',
      name: pageData.title || 'DeepStudent Documentation',
      headline: pageData.title || 'DeepStudent Documentation',
      description: pageDescription,
      url: pageUrl,
      inLanguage: isEnglish ? 'en-US' : 'zh-CN',
      isPartOf: {
        '@type': 'WebSite',
        name: 'DeepStudent Documentation',
        url: DOCS_URL
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

    pageData.frontmatter.head ??= []
    pageData.frontmatter.head.push(
      ['link', { rel: 'canonical', href: pageUrl }],
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
