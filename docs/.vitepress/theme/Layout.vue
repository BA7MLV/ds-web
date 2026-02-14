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
  --vp-nav-logo-height: 52px;
}

.vp-doc a {
  font-weight: 500;
  color: #1a1a1a;
}

.dark .vp-doc a {
  color: #ffffff;
}
</style>
