import { defineConfig } from 'vitepress'
import llmstxt from 'vitepress-plugin-llms'
import { loadEnv } from 'vite'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { mermaidMarkdown } from './mermaid.mjs'
import { finalizeMachineDocs } from './machine-docs.mjs'
import {
  SITE_ORIGIN, SITE_URL, TITLE_TEMPLATE, applyPageSeo, getNotFoundHead, isNotFoundPage
} from './seo.mjs'

/**
 * 用户指南的章节、分组和网址都来自主仓库同步（scripts/sync-user-guide.mjs 写的 data/user-guide.json），
 * 这里只补官网自己的页面：「开始」里的介绍和下载，以及「帮助」。
 */
const userGuide = JSON.parse(readFileSync(new URL('./data/user-guide.json', import.meta.url), 'utf-8'))

const guideSidebar = [
  {
    text: '开始',
    collapsed: false,
    items: [
      { text: '什么是 DeepStudent', link: '/what-is-deepstudent.md' },
      { text: '下载与安装', link: '/download.md' },
      { text: '快速上手', link: '/start.md' },
      { text: '学习桌面', link: '/user-guide/workbench' },
      { text: '用户指南总览', link: '/user-guide/' },
    ]
  },
  ...userGuide.groups.map((group) => ({ ...group, collapsed: false })),
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

export default defineConfig({
  appearance: true,
  markdown: {
    config: mermaidMarkdown,
    image: {
      lazyLoading: true
    }
  },
  title: 'DeepStudent',
  titleTemplate: TITLE_TEMPLATE,
  description: 'AI 原生、本地优先的开源学习系统',
  base: '/',
  cleanUrls: true,
  // 内部工程计划与仓库规范不进入站点与搜索
  srcExclude: ['plans/**', 'AGENTS.md'],
  // 生成 /sitemap.xml，供搜索引擎与 AI 爬虫发现全部页面
  sitemap: {
    hostname: SITE_URL
  },
  vite: {
    // 把根级 .env 里的演示地址注入到客户端代码（组件里读 import.meta.env.VITE_DEMO_URL）
    define: {
      'import.meta.env.VITE_DEMO_URL': JSON.stringify(DEMO_URL),
      'import.meta.env.VITE_LA_CONFIG': JSON.stringify(LA_ID ? { id: LA_ID, ck: LA_CK } : null)
    },
    plugins: [
      // 生成 /llms-full.txt 及每页的 .md 版本（llmstxt.org 标准）
      // 根级 /llms.txt 使用 docs/public/llms.txt 手写产品版，故关闭插件生成
      llmstxt({
        domain: SITE_ORIGIN,
        ignoreFiles: ['plans/**', 'AGENTS.md', 'en/**'],
        generateLLMsTxt: false,
        injectLLMHint: false,
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
  ],
  themeConfig: {
    // 正文尚无英文译本；默认主题即便被隐藏，也不能输出不存在的对应页面链接。
    i18nRouting: false,
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
  transformHead({ pageData }) {
    return isNotFoundPage(pageData) ? getNotFoundHead() : []
  },
  async buildEnd(siteConfig) {
    await finalizeMachineDocs(siteConfig)
  },
  transformPageData(pageData) {
    if (!pageData?.relativePath?.endsWith('.md')) return

    const absPath = resolve(docsRootDir, pageData.relativePath)
    const editors = getGitEditors(absPath)
    pageData.editors = editors
    pageData.lastAuthor = editors[0] || ''

    applyPageSeo(pageData)
  },
})
