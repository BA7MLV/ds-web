<script setup>
import { computed } from 'vue'
import { useData } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import LastAuthor from './components/LastAuthor.vue'
import SiteFooter from './components/SiteFooter.vue'
import SiteNav from './components/SiteNav.vue'

const { frontmatter } = useData()
// 落地页用自定义三列页脚，文档页继续用 VitePress 默认页脚
const showSiteFooter = computed(() => frontmatter.value.layout === 'home')
</script>

<template>
  <DefaultTheme.Layout>
    <template #layout-top>
      <SiteNav />
    </template>
    <template #doc-footer-before>
      <LastAuthor />
    </template>
    <template #layout-bottom>
      <SiteFooter v-if="showSiteFooter" />
    </template>
  </DefaultTheme.Layout>
</template>
