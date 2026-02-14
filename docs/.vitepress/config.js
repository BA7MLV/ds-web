import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'
import { execFileSync } from 'node:child_process'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const guideSidebar = [
  {
    text: '关于 DeepStudent',
    collapsed: false,
    items: [
      { text: '简介', link: '/', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 15C11.3137 15 14 12.3137 14 9C14 5.68629 11.3137 3 8 3C4.68629 3 2 5.68629 2 9C2 12.3137 4.68629 15 8 15Z" stroke="currentColor" stroke-width="1.5"/><path d="M8 11C9.10457 11 10 10.1046 10 9C10 7.89543 9.10457 7 8 7C6.89543 7 6 7.89543 6 9C6 10.1046 6.89543 11 8 11Z" stroke="currentColor" stroke-width="1.5"/></svg>' }
    ]
  },
  {
    text: '使用文档',
    collapsed: false,
    items: [
      { text: '准备工作', link: '/guide/start.md', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 3H4C3.44772 3 3 3.44772 3 4V12C3 12.5523 3.44772 13 4 13H12C12.5523 13 13 12.5523 13 12V4C13 3.44772 12.5523 3 12 3Z" stroke="currentColor" stroke-width="1.5"/><path d="M8 6V10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M10 8H6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>' },
      { text: '客户端下载', link: '/guide/download.md', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 8H2M14 8L11 5M14 8L11 11" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>' },
      { text: '功能介绍', link: '/guide/function.md', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 3H4C3.44772 3 3 3.44772 3 4V12C3 12.5523 3.44772 13 4 13H12C12.5523 13 13 12.5523 13 12V4C13 3.44772 12.5523 3 12 3Z" stroke="currentColor" stroke-width="1.5"/><path d="M8 6V10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M10 8H6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>' },
      { text: '项目历程', link: '/guide/timeline.md', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 2V14M15 9H1" stroke="currentColor" stroke-width="1.5"/></svg>' },
      { text: '功能架构', link: '/guide/feature-architecture.md', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 3H4C3.44772 3 3 3.44772 3 4V12C3 12.5523 3.44772 13 4 13H12C12.5523 13 13 12.5523 13 12V4C13 3.44772 12.5523 3 12 3Z" stroke="currentColor" stroke-width="1.5"/><path d="M8 6V10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M10 8H6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>' }
    ]
  },
  {
    text: '帮助中心',
    collapsed: false,
    items: [
      { text: '常见问题', link: '/guide/A-Q.md', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 3H4C3.44772 3 3 3.44772 3 4V12C3 12.5523 3.44772 13 4 13H12C12.5523 13 13 12.5523 13 12V4C13 3.44772 12.5523 3 12 3Z" stroke="currentColor" stroke-width="1.5"/><path d="M8 6V10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M10 8H6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>' },
      { text: '关于我们', link: '/guide/about.md', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 3H4C3.44772 3 3 3.44772 3 4V12C3 12.5523 3.44772 13 4 13H12C12.5523 13 13 12.5523 13 12V4C13 3.44772 12.5523 3 12 3Z" stroke="currentColor" stroke-width="1.5"/><path d="M8 6V10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M10 8H6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>' }
    ]
  }
]

const docsRootDir = fileURLToPath(new URL('../', import.meta.url))

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
    ['script', { charset: 'UTF-8', id: 'LA_COLLECT', src: '//sdk.51.la/js-sdk-pro.min.js' }],
    [
      'script',
      {},
      `LA.init({id:'L6EKwkfq9fvFA4LW',ck:'L6EKwkfq9fvFA4LW',autoTrack:true,hashMode:true})`
    ],
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
      '/': guideSidebar,
      '/guide/': guideSidebar
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/000haoji/deep-student' }
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
    mobileMenu: false,
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
  },
}))
