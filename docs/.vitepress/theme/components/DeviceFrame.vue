<script setup>
/**
 * MacBook Pro 框。
 * 结构照 upma.cn/tools/mockup 的实现：
 * 外框锁 16:10。屏幕尽量铺满：左右只留一条窄铝边，上方留刘海，
 * 下方留一条下颌。铝壳和屏幕的下沿都是直角，圆角只在顶部。
 * 原版写死 800px，这里改成随容器变宽。屏幕内容走默认插槽。
 */
defineProps({
  ratio: { type: String, default: '16 / 10' }
})
</script>

<template>
  <figure class="mb" :style="{ '--mb-ratio': ratio }">
    <div class="mb__screen">
      <slot />
    </div>
    <div class="mb__shell" aria-hidden="true">
      <span class="mb__chin" />
      <span class="mb__notch" />
    </div>
    <div class="mb__base" aria-hidden="true">
      <span class="mb__indent" />
    </div>
  </figure>
</template>

<style scoped>
.mb {
  position: relative;
  width: min(100%, 920px);
  margin: 0 auto;
  aspect-ratio: var(--mb-ratio);
}

/* 屏幕落在铝边留出的窗口里 */
.mb__screen {
  position: absolute;
  top: 3.2%;
  right: 1.6%;
  bottom: 5.6%;
  left: 1.6%;
  z-index: 1;
  overflow: hidden;
  background: #000;
}

.mb__shell {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

/* 铝边：只画框，中间镂空，屏幕从下面露出来 */
.mb__shell::before {
  content: '';
  position: absolute;
  inset: 0;
  border: 10px solid #3e3e42;
  border-bottom-width: 0;
  border-radius: 18px 18px 0 0;
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.16);
}

/* 下颌：框底部那条更深的边 */
.mb__chin {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  height: 5.6%;
  background: #1c1c1f;
}

/* 刘海：从顶边铝壳垂进屏幕 */
.mb__notch {
  position: absolute;
  top: 12px;
  left: 50%;
  z-index: 2;
  width: 120px;
  height: 20px;
  transform: translateX(-50%);
  border-radius: 0 0 12px 12px;
  background: #000;
}

/* 底座比屏幕再探出一截，中间一道开盖凹槽 */
.mb__base {
  position: absolute;
  right: 0;
  bottom: -20px;
  left: 0;
  display: flex;
  justify-content: center;
  height: 20px;
  border-radius: 0 0 12px 12px;
  background: #d3d4d8;
  box-shadow: 0 14px 24px -16px rgba(24, 24, 28, 0.55);
}

.mb__indent {
  width: 120px;
  height: 8px;
  border-radius: 0 0 8px 8px;
  background: #a0a1a6;
}

.dark .mb__base {
  background: #4a4a50;
}

.dark .mb__indent {
  background: #2c2c30;
}

@media (max-width: 640px) {
  .mb__shell::before {
    border-width: 7px;
    border-bottom-width: 0;
    border-radius: 14px 14px 0 0;
  }

  .mb__notch {
    top: 8px;
    width: 72px;
    height: 13px;
  }

  .mb__base {
    bottom: -14px;
    height: 14px;
  }
}
</style>
