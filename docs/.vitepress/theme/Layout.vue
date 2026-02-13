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
