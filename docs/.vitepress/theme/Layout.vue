<script setup>
import DefaultTheme from 'vitepress/theme'
import LastAuthor from './components/LastAuthor.vue'
</script>

<template>
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

/* 保持侧边栏分组常开，隐藏折叠交互 */
.VPSidebarItem .caret {
  display: none !important;
}

.VPSidebarItem .button[aria-expanded] {
  pointer-events: none;
}
</style>
