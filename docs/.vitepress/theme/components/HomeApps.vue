<script setup>
import { useI18n } from '../i18n/index.js'

/**
 * 首页「全部应用」：桌面端 Dock 和「全部应用」面板里的应用一屏摆全，每个一句话说清能做什么、点进去是用户指南那一章。
 * 图标是产品自己那套插画（主仓库 src/features/workbench/icons/app-icons/，拷在 docs/public/apps/），
 * 应用和文案都在 i18n 的 home.apps 里；底下一行是没有独立应用、但值得一提的能力。
 */
const { t, tm } = useI18n()
</script>

<template>
  <section id="apps" class="lp-block ha">
    <div class="lp-wrap lp-wrap--wide">
      <div class="lp-head lp-head--center">
        <h2 class="lp-title">{{ t('home.apps.title') }}</h2>
        <p class="lp-lede">{{ t('home.apps.lede') }}</p>
      </div>

      <ul class="ha__grid">
        <li v-for="app in tm('home.apps.items')" :key="app.icon">
          <a class="ha__app" :href="app.link">
            <img class="ha__icon" :src="`/apps/${app.icon}.svg`" alt="" width="48" height="48" loading="lazy" decoding="async" />
            <span class="ha__name">{{ app.name }}</span>
            <span class="ha__desc">{{ app.desc }}</span>
          </a>
        </li>
      </ul>

      <p class="ha__more">
        <span>{{ t('home.apps.more') }}</span>
        <template v-for="(item, index) in tm('home.apps.extras')" :key="item.link">
          <span v-if="index" class="ha__dot" aria-hidden="true">·</span>
          <a :href="item.link">{{ item.name }}</a>
        </template>
      </p>
    </div>
  </section>
</template>

<style scoped>
/* 标题一行放不下时两行对半分，别把「用。」单独甩到第二行 */
.ha .lp-title {
  text-wrap: balance;
  white-space: pre-line;
}

/*
 * 16 个应用：宽屏 4 列正好四行，手机和平板 2 列八行 —— 列数取 16 的约数，最后一行不留单个孤格。
 * 改应用数量时一并看列数（例如 15 个是 5 列三行）。
 */
.ha__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin: clamp(2rem, 4vw, 3rem) 0 0;
  padding: 0;
  list-style: none;
}

@media (min-width: 640px) {
  .ha__grid {
    gap: 12px;
  }
}

@media (min-width: 900px) {
  .ha__grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

.ha__app {
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr);
  grid-template-rows: auto 1fr;
  column-gap: 14px;
  row-gap: 4px;
  height: 100%;
  padding: 16px;
  border: 1px solid var(--lp-hair);
  border-radius: 16px;
  color: inherit;
  text-decoration: none;
  transition: background-color 0.18s ease, border-color 0.18s ease, transform 0.18s ease;
}

.ha__app:hover {
  border-color: transparent;
  background: rgba(0, 0, 0, 0.035);
  transform: translateY(-1px);
}

.dark .ha__app:hover {
  background: rgba(255, 255, 255, 0.06);
}

.ha__app:focus-visible {
  outline: 2px solid #0066cc;
  outline-offset: 2px;
}

.ha__icon {
  grid-row: 1 / span 2;
  width: 48px;
  height: 48px;
}

.ha__name {
  align-self: end;
  color: var(--vp-c-text-1);
  font-size: 15px;
  font-weight: 600;
  line-height: 1.4;
}

.ha__desc {
  color: var(--vp-c-text-2);
  font-size: 13px;
  line-height: 1.6;
}

/* 手机和 900–1099px 的 4 列格子都窄：图标在上、名字和一句话在下；其余宽度图标在左 */
@media (max-width: 639px), (min-width: 900px) and (max-width: 1099px) {
  .ha__app {
    grid-template-columns: minmax(0, 1fr);
    grid-template-rows: auto;
    align-content: start;
    row-gap: 6px;
  }

  .ha__icon {
    grid-row: auto;
    margin-bottom: 6px;
  }

  .ha__name {
    align-self: auto;
  }
}

@media (max-width: 639px) {
  .ha__app {
    padding: 14px;
    border-radius: 14px;
  }

  .ha__icon {
    width: 40px;
    height: 40px;
  }

  .ha__desc {
    font-size: 12.5px;
  }
}

.ha__more {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 4px 10px;
  margin: 1.75rem 0 0;
  color: var(--vp-c-text-2);
  font-size: 14px;
  line-height: 1.7;
}

.ha__more a {
  color: #0066cc;
  text-decoration: none;
}

.dark .ha__more a {
  color: #2997ff;
}

.ha__more a:hover {
  text-decoration: underline;
}

.ha__dot {
  color: var(--vp-c-text-3);
}

@media (prefers-reduced-motion: reduce) {
  .ha__app {
    transition: none;
  }

  .ha__app:hover {
    transform: none;
  }
}
</style>
