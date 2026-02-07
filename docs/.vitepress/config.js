import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

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
      { text: 'IREC介绍', link: '/guide/irec.md', icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 2V14M15 9H1" stroke="currentColor" stroke-width="1.5"/></svg>' }
    ]
  },
  {
    text: '最佳实践',
    collapsed: false,
    items: []
  },
  {
    text: 'API 参考',
    collapsed: false,
    items: []
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

export default withMermaid(defineConfig({
  appearance: true,
  markdown: {
    image: {
      lazyLoading: true
    }
  },
  title: 'DeepStudent',
  description: '免费开源的AI错题管理  \n解决方案',
  base: '/docs/',
  head: [
    ['link', { rel: 'icon', href: '/docs/favicon.ico', sizes: 'any' }],
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
  ],
  themeConfig: {
    logo: { light: '/logo-r.svg', dark: '/logo-r-dark.svg' },
    siteTitle: '', // 有 logo 时不显示标题文本
    nav: [
      { text: '指南', link: '/' },
      { text: '官网', link: '/../', target: '_self' }
    ],
    sidebar: {
      '/': guideSidebar,
      '/guide/': guideSidebar
    },
    socialLinks: [
      { icon: 'github', link: 'https://github.com/BA7MLV/ds-web' }
    ],
    footer: {
      message: 'Released under the AGPL-3.0 License.',
      copyright: 'Copyright © 2025 DeepStudent Team'
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
    // 添加移动端菜单
    mobileMenu: true,
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
  }
}))
