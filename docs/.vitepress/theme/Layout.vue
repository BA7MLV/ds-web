<script setup>
import DefaultTheme from 'vitepress/theme'
import LastAuthor from './components/LastAuthor.vue'
import MobileMenu from './components/MobileMenu.vue'
</script>

<template>
  <DefaultTheme.Layout>
    <template #doc-footer-before>
      <LastAuthor />
    </template>
    
    <!-- 使用 VitePress 提供的 slot 插入移动端菜单 -->
    <template #nav-bar-content-after>
      <MobileMenu class="vp-mobile-menu" />
    </template>
  </DefaultTheme.Layout>
</template>

<style>
/* 隐藏 VitePress 默认的移动端菜单按钮 */
@media (max-width: 768px) {
  .VPNavBar .VPNavBarHamburger {
    display: none !important;
  }
}

/* 桌面端隐藏我们的移动端菜单 */
@media (min-width: 769px) {
  .vp-mobile-menu {
    display: none !important;
  }
}
</style>
