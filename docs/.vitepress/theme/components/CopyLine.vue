<script setup>
/**
 * 一行命令 + 一个复制按钮。
 *
 * 参考 openchamber 的安装片段：命令摆在正文里，右侧一个 Copy —— 比让人手工选中
 * 一长串 `sudo xattr ...` 再复制靠谱得多，移动端更是基本没法选。
 *
 * `navigator.clipboard` 在非安全上下文（http 本地预览）下不可用，所以留了一条
 * textarea + execCommand 的老路兜底。
 */
import { nextTick, onUnmounted, ref } from 'vue'
import { useI18n } from '../i18n/index.js'

const props = defineProps({
  command: { type: String, required: true }
})

const { t } = useI18n()
const copied = ref(false)
const displayedCopied = ref(false)
const failed = ref(false)
const labelEl = ref(null)
let timer = 0
let swapTimer = 0
let swapId = 0
let copying = false
let disposed = false

// 文字按配方先退出再进入；操作结果与读屏反馈无需等待动画。
const swapLabel = (next) => {
  const id = ++swapId
  window.clearTimeout(swapTimer)
  const el = labelEl.value
  if (!el) return
  el.classList.remove('is-exit', 'is-enter-start')
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    displayedCopied.value = next
    return
  }
  if (displayedCopied.value === next) return
  const duration = getComputedStyle(el).getPropertyValue('--text-swap-dur').trim()
  const ms = parseFloat(duration) * (duration.endsWith('ms') ? 1 : 1000)
  el.classList.add('is-exit')
  swapTimer = window.setTimeout(async () => {
    displayedCopied.value = next
    await nextTick()
    if (disposed || id !== swapId) return
    el.classList.remove('is-exit')
    el.classList.add('is-enter-start')
    void el.offsetHeight
    el.classList.remove('is-enter-start')
  }, Number.isFinite(ms) ? ms : 150)
}

const fallbackCopy = (text) => {
  const area = document.createElement('textarea')
  area.value = text
  area.setAttribute('readonly', '')
  area.style.position = 'fixed'
  area.style.top = '-1000px'
  area.style.opacity = '0'

  document.body.appendChild(area)
  area.select()

  try {
    return document.execCommand('copy')
  } finally {
    document.body.removeChild(area)
  }
}

const copy = async () => {
  if (copying) return
  copying = true
  failed.value = false
  let success = false
  try {
    try {
      await navigator.clipboard.writeText(props.command)
      success = true
    } catch {
      success = fallbackCopy(props.command)
    }
  } catch {
    success = false
  } finally {
    copying = false
  }

  if (disposed) return
  window.clearTimeout(timer)
  copied.value = success
  failed.value = !success
  swapLabel(success)
  if (!success) return
  timer = window.setTimeout(() => {
    copied.value = false
    swapLabel(false)
  }, 1600)
}

onUnmounted(() => {
  disposed = true
  swapId++
  window.clearTimeout(timer)
  window.clearTimeout(swapTimer)
})
</script>

<template>
  <div class="dl-copy">
    <code class="dl-copy__code">{{ command }}</code>
    <button
      class="dl-copy__btn"
      type="button"
      :aria-label="t(copied ? 'copyLine.copied' : 'copyLine.label')"
      @click="copy"
    >
      <span class="dl-copy__label" aria-hidden="true">
        <span class="dl-copy__reserve">{{ t('copyLine.copy') }}</span>
        <span class="dl-copy__reserve">{{ t('copyLine.copied') }}</span>
        <span ref="labelEl" class="t-text-swap">
          {{ t(displayedCopied ? 'copyLine.copied' : 'copyLine.copy') }}
        </span>
      </span>
    </button>
    <span class="sr-only" role="status" aria-live="polite" aria-atomic="true">
      {{ failed ? t('copyLine.failed') : copied ? t('copyLine.copied') : '' }}
    </span>
  </div>
</template>

<style scoped>
.dl-copy__label {
  display: inline-grid;
}

.dl-copy__label > span {
  grid-area: 1 / 1;
}

.dl-copy__reserve {
  visibility: hidden;
}
</style>
