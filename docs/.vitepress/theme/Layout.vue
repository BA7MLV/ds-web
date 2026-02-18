<script setup>
import DefaultTheme from 'vitepress/theme'
import Analytics51la from './Analytics51la.vue'
import LastAuthor from './components/LastAuthor.vue'
</script>

<template>
  <Analytics51la />
  <DefaultTheme.Layout>
    <template #doc-footer-before>
      <LastAuthor />
    </template>
  </DefaultTheme.Layout>
</template>

<style>
:root {
  --vp-nav-logo-height: 38px;
  --vp-c-brand-1: #1a1a1a;
  --vp-c-brand-2: #1a1a1a;
  --vp-c-brand-3: #1a1a1a;
}

.vp-doc a {
  font-weight: 500;
  color: #1a1a1a;
}

.vp-doc a:hover {
  color: #1a1a1a;
}

.dark .vp-doc a {
  color: #ffffff;
}

.dark {
  --vp-c-brand-1: #ffffff;
  --vp-c-brand-2: #ffffff;
  --vp-c-brand-3: #ffffff;
}

.dark .vp-doc a:hover {
  color: #ffffff;
}

/* 正文内容图：限制最大宽度、保持比例、统一居中间距 */
.vp-doc p > img,
.vp-doc li > img,
.vp-doc td > img {
  display: block;
  width: 100%;
  max-width: 960px;
  height: auto;
  margin: 1.25rem auto;
  border-radius: 12px;
}

@media (max-width: 768px) {
  .vp-doc p > img,
  .vp-doc li > img,
  .vp-doc td > img {
    margin: 0.9rem auto;
    border-radius: 10px;
  }
}

/* 确保放大层始终在侧边栏与导航之上 */
.medium-zoom-overlay {
  z-index: 9998 !important;
}

.medium-zoom-image--opened {
  z-index: 9999 !important;
}

/* 保持侧边栏分组常开，隐藏折叠交互 */
.VPSidebarItem .caret {
  display: none !important;
}

.VPSidebarItem .button[aria-expanded] {
  pointer-events: none;
}
</style>
