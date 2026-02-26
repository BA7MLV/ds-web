import DefaultTheme from 'vitepress/theme'
import { onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute, useData } from 'vitepress'
import CustomHome from './CustomHome.vue'
import Layout from './Layout.vue'

let mediumZoomLoader

const loadMediumZoom = async () => {
  if (!mediumZoomLoader) {
    mediumZoomLoader = import('medium-zoom').then((module) => module.default)
  }

  return mediumZoomLoader
}

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
    let zoomInstance = null

    const hideSearchOnHome = () => {
      if (typeof document === 'undefined') return
      const root = document.documentElement
      root.classList.toggle('home-no-search', route.path === '/')
    }

    // 初始化图片缩放功能
    const initZoom = async () => {
      if (typeof document === 'undefined') return

      const zoomTargets = [
        '.vp-doc p > img:not(.no-zoom):not([data-no-zoom])',
        '.vp-doc li > img:not(.no-zoom):not([data-no-zoom])',
        '.vp-doc td > img:not(.no-zoom):not([data-no-zoom])'
      ].join(', ')
      const hasTargets = document.querySelector(zoomTargets)

      if (!hasTargets) {
        zoomInstance?.detach()
        zoomInstance = null
        return
      }

      const mediumZoom = await loadMediumZoom()

      zoomInstance?.detach()
      zoomInstance = mediumZoom(zoomTargets, {
        background: isDark.value ? 'rgba(10, 10, 12, 0.95)' : 'rgba(255, 255, 255, 0.95)'
      })
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

        // 立即执行一次
        hideSearchOnHome()

        // 监听路由变化
        watch(() => route.path, () => {
          nextTick(() => {
            hideSearchOnHome()
            initZoom()
          })
        })
      })
    })

    onUnmounted(() => {
      zoomInstance?.detach()
      zoomInstance = null

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
  }
}
