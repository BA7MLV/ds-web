<script setup>
import { computed } from 'vue'
import { useI18n } from '../i18n/index.js'
import { featureShot, shotSize } from '../utils/feature-shot.js'

/**
 * 一张真实界面截图：在演示里截下的取景框，中英各一套、深浅色各一张，都是 2 倍图。
 *
 * 深浅两张都写进 SSR，只靠 <html> 上的 .dark 类显示其中一张 —— VitePress 在首帧前就按偏好挂好这个类，
 * 深色访客不会先闪一下浅色图；藏起来那张是 display: none 加 loading="lazy"，浏览器不会去下载。
 * width / height 写取景框的 CSS 尺寸，首帧就占好宽高比。
 */
const props = defineProps({
  /** 对应 features/<name>[-en]-light|dark.webp */
  name: { type: String, required: true },
  alt: { type: String, default: '' }
})

const { locale } = useI18n()
const size = computed(() => shotSize(props.name))
</script>

<template>
  <span class="fs">
    <img
      v-for="dark in [false, true]"
      :key="String(dark)"
      :class="['fs__img', dark ? 'fs__img--dark' : 'fs__img--light']"
      :src="featureShot(name, dark, locale)"
      :srcset="`${featureShot(name, dark, locale)} 2x`"
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
