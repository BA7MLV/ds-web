<script setup>
import { computed } from 'vue'
import { featureShot, shotSize } from '../utils/feature-shot.js'

/**
 * 一张真实界面截图：scripts/gen-features-live.mjs 在演示里截下的取景框，深浅色各一张，都是 2 倍图。
 *
 * 两张都写进 SSR，只靠 <html> 上的 .dark 类显示其中一张 —— VitePress 在首帧前就按偏好挂好这个类，
 * 深色访客不会先闪一下浅色图；藏起来那张是 display: none 加 loading="lazy"，浏览器不会去下载。
 * width / height 写取景框的 CSS 尺寸，首帧就占好宽高比。
 */
const props = defineProps({
  /** 对应 features/<name>-light|dark.webp */
  name: { type: String, required: true },
  alt: { type: String, default: '' }
})

const size = computed(() => shotSize(props.name))
</script>

<template>
  <span class="fs">
    <img
      v-for="dark in [false, true]"
      :key="String(dark)"
      :class="['fs__img', dark ? 'fs__img--dark' : 'fs__img--light']"
      :src="featureShot(name, dark)"
      :srcset="`${featureShot(name, dark)} 2x`"
      :alt="alt"
      :width="size.width"
      :height="size.height"
      loading="lazy"
      decoding="async"
    />
  </span>
</template>

<style scoped>
.fs {
  display: block;
}

.fs__img {
  display: block;
  width: 100%;
  height: auto;
}

.fs__img--dark,
.dark .fs__img--light {
  display: none;
}

.dark .fs__img--dark {
  display: block;
}
</style>
