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
import { ref } from 'vue'

const props = defineProps({
  command: { type: String, required: true }
})

const copied = ref(false)
let timer = 0

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
    document.execCommand('copy')
  } finally {
    document.body.removeChild(area)
  }
}

const copy = async () => {
  try {
    await navigator.clipboard.writeText(props.command)
  } catch {
    fallbackCopy(props.command)
  }

  copied.value = true
  window.clearTimeout(timer)
  timer = window.setTimeout(() => {
    copied.value = false
  }, 1600)
}
</script>

<template>
  <div class="dl-copy">
    <code class="dl-copy__code">{{ command }}</code>
    <button
      class="dl-copy__btn"
      type="button"
      :aria-label="copied ? '已复制' : '复制命令'"
      @click="copy"
    >{{ copied ? '已复制' : '复制' }}</button>
  </div>
</template>
