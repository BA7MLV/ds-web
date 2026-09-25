<script setup>
import { computed } from 'vue'
import { useData } from 'vitepress'
import { useI18n } from '../i18n/index.js'

const { page } = useData()
const { t } = useI18n()

const editors = computed(() => (Array.isArray(page.value.editors) ? page.value.editors : []))
</script>

<template>
  <div v-if="editors.length" class="vp-git-editors">
    {{ t('lastAuthor.label') }}{{ editors.join(t('lastAuthor.separator')) }}
  </div>
</template>
