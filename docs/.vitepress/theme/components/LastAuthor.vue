<script setup>
import { computed } from 'vue'
import { useData } from 'vitepress'

const { page } = useData()

const editors = computed(() => (Array.isArray(page.value.editors) ? page.value.editors : []))
</script>

<template>
  <div v-if="editors.length" class="vp-git-editors">
    编辑者：{{ editors.join('、') }}
  </div>
</template>
