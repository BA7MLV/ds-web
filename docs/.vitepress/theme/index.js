import DefaultTheme from 'vitepress/theme'
import { onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute, useData } from 'vitepress'
import './custom.css'
import CustomHome from './CustomHome.vue'
import Layout from './Layout.vue'

export default {
  extends: DefaultTheme,
  Layout,
  enhanceApp({ app, router, siteData }) {
    // 注册自定义首页组件
    app.component('CustomHome', CustomHome)
  },
  setup() {
    const route = useRoute()
    const { isDark } = useData()

    // 初始化图片缩放功能
    const initZoom = () => {
      // 使用 medium-zoom 实现图片缩放
      if (typeof window !== 'undefined') {
        // 动态导入 medium-zoom
        import('medium-zoom').then((mediumZoom) => {
          mediumZoom.default('.vp-doc img', {
            background: isDark.value ? 'rgba(10, 10, 12, 0.95)' : 'rgba(255, 255, 255, 0.95)'
          })
        })
      }
    }

    // 更新 meta theme-color
    const updateThemeColor = () => {
      if (typeof document === 'undefined') return
      const meta = document.querySelector('meta[name="theme-color"]:not([media])')
      if (meta) {
        meta.setAttribute('content', isDark.value ? '#0a0a0c' : '#f5f5f7')
      }
    }

    onMounted(() => {
      nextTick(() => {
        initZoom()
        updateThemeColor()
        
        // 隐藏主页的搜索控件
        const hideSearchOnHome = () => {
          if (typeof document === 'undefined') return
          const root = document.documentElement
          root.classList.toggle('home-no-search', route.path === '/')
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

    onUnmounted(() => {
      if (typeof document !== 'undefined') {
        document.documentElement.classList.remove('home-no-search')
      }
    })

    // 监听主题变化更新 theme-color
    watch(isDark, () => {
      updateThemeColor()
      // 重新初始化 zoom 以更新背景色
      nextTick(() => initZoom())
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
