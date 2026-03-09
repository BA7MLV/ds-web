<script setup>
import DefaultTheme from 'vitepress/theme'
import LanguageSwitch from './components/LanguageSwitch.vue'
import LastAuthor from './components/LastAuthor.vue'
</script>

<template>
  <DefaultTheme.Layout>
    <template #nav-screen-content-after>
      <div class="NavScreenLang">
        <LanguageSwitch />
      </div>
    </template>
    <template #doc-footer-before>
      <LastAuthor />
    </template>
  </DefaultTheme.Layout>
</template>

<style scoped>
.NavScreenLang {
  padding: 12px 16px 0;
}
</style>
