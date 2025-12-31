import DefaultTheme from 'vitepress/theme'
import { onMounted, nextTick, watch } from 'vue'
import { useRoute } from 'vitepress'
import './custom.css'
import CustomHome from './CustomHome.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app, router, siteData }) {
    // 注册自定义首页组件
    app.component('CustomHome', CustomHome)
  },
  setup() {
    const route = useRoute()

    // 初始化图片缩放功能
    const initZoom = () => {
      // 使用 medium-zoom 实现图片缩放
      if (typeof window !== 'undefined') {
        // 动态导入 medium-zoom
        import('medium-zoom').then((mediumZoom) => {
          mediumZoom.default('.vp-doc img')
        })
      }
    }

    // 添加主题初始化
    const initTheme = () => {
      const savedTheme = localStorage.getItem('vitepress-theme')
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      
      if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        document.documentElement.classList.add('dark')
      }
    }

    onMounted(() => {
      nextTick(() => {
        initZoom()
        initTheme()
        
        // 隐藏主页的搜索控件
        const hideSearchOnHome = () => {
          if (route.path === '/') {
            // 隐藏所有搜索相关的元素
            const searchElements = document.querySelectorAll('[class*="search"], [class*="Search"], [class*="VPNavBarSearch"]')
            searchElements.forEach(el => {
              el.style.display = 'none'
            })
          } else {
            // 在其他页面恢复搜索控件的显示
            const searchElements = document.querySelectorAll('[class*="search"], [class*="Search"], [class*="VPNavBarSearch"]')
            searchElements.forEach(el => {
              el.style.display = ''
            })
          }
        }
        
        // 立即执行一次
        hideSearchOnHome()
        
        // 监听路由变化
        watch(() => route.path, () => {
          nextTick(() => {
            hideSearchOnHome()
          })
        })
      })
    })

    watch(
      () => route.path,
      () => {
        nextTick(() => {
          initZoom()
        })
      }
    )
  }
}