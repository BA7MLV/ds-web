<script setup>
import { useData, useRoute, useRouter } from 'vitepress'
import { computed } from 'vue'

const route = useRoute()
const router = useRouter()
const { site } = useData()

const locales = computed(() => {
  const raw = site.value?.locales
  if (!raw || typeof raw !== 'object') return []

  return Object.entries(raw)
    .map(([key, value]) => {
      const label = value?.label
      const link = value?.link ?? (key === 'root' ? '/' : undefined)
      return {
        key,
        label: typeof label === 'string' ? label : key,
        link: typeof link === 'string' ? link : undefined,
      }
    })
    .filter((l) => typeof l.link === 'string')
})

const hasTwoLocales = computed(() => locales.value.length === 2)

const currentIndex = computed(() => {
  const path = route.path || '/'

  // Find best match by longest prefix (so '/' doesn't always win)
  const sorted = [...locales.value].sort((a, b) => (b.link?.length || 0) - (a.link?.length || 0))
  const idx = sorted.findIndex((l) => l.link && path.startsWith(l.link))
  if (idx === -1) return 0
  const current = sorted[idx]
  return locales.value.findIndex((l) => l.key === current.key)
})

const isSecond = computed(() => currentIndex.value === 1)

const currentLabel = computed(() => locales.value[0]?.label ?? '语言')
const altLabel = computed(() => locales.value[1]?.label ?? 'Language')

const goToLocale = async (idx) => {
  const target = locales.value[idx]
  if (!target?.link) return

  // Keep hash/search when possible (useful on long docs pages).
  const hash = typeof window !== 'undefined' ? window.location.hash : ''
  const search = typeof window !== 'undefined' ? window.location.search : ''

  await router.go(`${target.link}${search}${hash}`)
}

const toggle = async () => {
  await goToLocale(isSecond.value ? 0 : 1)
}
</script>

<template>
  <div v-if="hasTwoLocales" class="LangSwitch">
    <button
      class="LangSwitch__button"
      type="button"
      role="switch"
      :aria-checked="isSecond"
      aria-label="切换语言"
      @click="toggle"
    >
      <span class="LangSwitch__label LangSwitch__label--left">{{ currentLabel }}</span>
      <span class="LangSwitch__label LangSwitch__label--right">{{ altLabel }}</span>
      <span class="LangSwitch__thumb" :class="{ 'is-right': isSecond }" aria-hidden="true" />
    </button>
  </div>
</template>

<style scoped>
.LangSwitch {
  display: flex;
}

.LangSwitch__button {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: 0;
  height: 32px;
  min-width: 160px;
  padding: 2px;
  border-radius: 999px;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-2);
  font-size: 12px;
  line-height: 1;
  letter-spacing: 0.01em;
  cursor: pointer;
  user-select: none;
}

.LangSwitch__button:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 2px;
}

.LangSwitch__label {
  z-index: 1;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  padding: 0 10px;
  height: 28px;
  white-space: nowrap;
}

.LangSwitch__thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: calc(50% - 2px);
  height: 28px;
  border-radius: 999px;
  background: var(--vp-c-bg);
  box-shadow: var(--vp-shadow-1);
  transform: translateX(0);
  transition: transform 150ms ease-out;
}

.LangSwitch__thumb.is-right {
  transform: translateX(calc(100% + 2px));
}

@media (prefers-reduced-motion: reduce) {
  .LangSwitch__thumb {
    transition: none;
  }
}
</style>
