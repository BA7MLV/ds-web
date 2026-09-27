<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useData } from 'vitepress'

const props = defineProps({ code: { type: String, required: true } })
const { isDark } = useData()
const source = computed(() => decodeURIComponent(props.code))
const svg = ref('')
let mermaid
let revision = 0
let disposed = false

const render = async () => {
  const current = ++revision
  if (!mermaid || disposed) return
  try {
    mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', theme: isDark.value ? 'dark' : 'default' })
    const id = `ds-diagram-${Math.random().toString(36).slice(2)}`
    const result = await mermaid.render(id, source.value)
    if (!disposed && current === revision) svg.value = result.svg
  } catch {
    // Preserve readable source on a network or syntax error instead of an empty diagram.
    if (!disposed && current === revision) svg.value = ''
  }
}

onMounted(async () => {
  try {
    // Second async boundary: VitePress preloads direct entry imports, but not this engine.
    mermaid = (await import('mermaid')).default
    await render()
  } catch {
    // The SSR source remains visible if the optional renderer cannot be loaded.
  }
})
watch([source, isDark], render)
onUnmounted(() => { disposed = true; revision += 1 })
</script>

<template>
  <div class="ds-diagram">
    <div v-if="svg" v-html="svg" />
    <pre v-else><code>{{ source }}</code></pre>
  </div>
</template>

<style scoped>
.ds-diagram { overflow-x: auto; margin: 24px 0; }
.ds-diagram :deep(svg) { display: block; margin: 0 auto; }
.ds-diagram pre { white-space: pre-wrap; font-size: 13px; padding: 16px; }
</style>
