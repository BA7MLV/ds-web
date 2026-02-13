<script setup>
import DefaultTheme from 'vitepress/theme'
import { onMounted } from 'vue'
import LastAuthor from './components/LastAuthor.vue'
import MobileMenu from './components/MobileMenu.vue'

onMounted(() => {
  // 将移动端菜单按钮插入到导航栏中
  const navBar = document.querySelector('.VPNavBar')
  const mobileMenuWrapper = document.querySelector('.mobile-menu-container')
  
  if (navBar && mobileMenuWrapper) {
    const target = navBar.querySelector('.VPNavBarMenu') || navBar.querySelector('.wrapper')
    if (target) {
      target.appendChild(mobileMenuWrapper)
    }
  }
})
</script>

<template>
  <DefaultTheme.Layout>
    <template #doc-footer-before>
      <LastAuthor />
    </template>
  </DefaultTheme.Layout>
  
  <!-- 移动端菜单组件 - 会被移动到导航栏中 -->
  <div class="mobile-menu-container">
    <MobileMenu />
  </div>
</template>

<style>
/* 隐藏 VitePress 默认的移动端菜单按钮 */
@media (max-width: 768px) {
  .VPNavBar .VPNavBarHamburger {
    display: none !important;
  }
  
  /* 显示我们的自定义菜单按钮 */
  .mobile-menu-container {
    display: flex;
    align-items: center;
  }
  
  /* 隐藏默认的搜索框在移动端，或者缩小它 */
  .VPNavBarSearch {
    margin-right: 8px;
  }
}

@media (min-width: 769px) {
  .mobile-menu-container {
    display: none;
  }
}
</style>
