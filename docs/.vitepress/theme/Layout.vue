<script setup>
import DefaultTheme from 'vitepress/theme'
import Analytics51la from './Analytics51la.vue'
import LastAuthor from './components/LastAuthor.vue'
</script>

<template>
  <Analytics51la />
  <DefaultTheme.Layout>
    <template #doc-footer-before>
      <LastAuthor />
    </template>
  </DefaultTheme.Layout>
</template>

<style>
/* ============================================================
   官网（src/index.css）--apple-* 设计 token 的文档站唯一定义：
   Layout 与 CustomHome 共同消费，避免多处复制产生漂移。
   值与官网逐项一致，请勿在此单独调整。
   ============================================================ */
:root {
  --apple-ink: #1d1d1f;
  --apple-ink-secondary: #48484a;
  --apple-muted: #86868b;
  --apple-line: rgba(0, 0, 0, 0.08);
  --apple-line-strong: rgba(0, 0, 0, 0.12);
  --apple-surface: #fbfbfd;
  --apple-surface-elevated: #ffffff;
  --apple-card: rgba(255, 255, 255, 0.65);
  --apple-card-strong: rgba(255, 255, 255, 0.85);
  --apple-shadow-sm:
    0 1px 2px rgba(0, 0, 0, 0.04),
    0 4px 8px rgba(0, 0, 0, 0.02);
  --apple-shadow-md:
    0 4px 12px rgba(0, 0, 0, 0.03),
    0 12px 32px rgba(0, 0, 0, 0.04),
    0 0 0 1px rgba(0, 0, 0, 0.02);
  --apple-shadow-lg:
    0 8px 24px rgba(0, 0, 0, 0.04),
    0 24px 64px rgba(0, 0, 0, 0.06),
    0 0 0 1px rgba(0, 0, 0, 0.02);
  --apple-title-gradient: linear-gradient(135deg, #1d1d1f 0%, #434344 100%);
  --apple-btn-primary-bg: #1d1d1f;
  --apple-btn-primary-bg-hover: #3a3a3c;
  --apple-btn-primary-text: #ffffff;
  --apple-btn-secondary-bg-hover: rgba(0, 0, 0, 0.08);
  --apple-selection-bg: rgba(0, 113, 227, 0.15);
  --apple-selection-text: inherit;
  --ease-apple: cubic-bezier(0.32, 0.72, 0, 1);
}

.dark {
  --apple-ink: #f5f5f7;
  --apple-ink-secondary: #86868b;
  --apple-muted: #86868b;
  --apple-line: rgba(255, 255, 255, 0.08);
  --apple-line-strong: rgba(255, 255, 255, 0.12);
  --apple-surface: #000000;
  --apple-surface-elevated: #1c1c1e;
  --apple-card: rgba(28, 28, 30, 0.65);
  --apple-card-strong: rgba(44, 44, 46, 0.75);
  --apple-shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.5);
  --apple-shadow-md: 0 8px 24px rgba(0, 0, 0, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.05);
  --apple-shadow-lg: 0 16px 48px rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.05);
  --apple-title-gradient: linear-gradient(135deg, #ffffff 0%, #e5e5e5 50%, #a1a1a6 100%);
  --apple-btn-primary-bg: #ffffff;
  --apple-btn-primary-bg-hover: #f2f2f7;
  --apple-btn-primary-text: #000000;
  --apple-btn-secondary-bg-hover: rgba(255, 255, 255, 0.12);
  --apple-selection-bg: rgba(10, 132, 255, 0.25);
  --apple-selection-text: #ffffff;
}

/* ============================================================
   VitePress 主题变量 → --apple-* token 映射：
   品牌色收敛为 ink 单色，文本/线条/表面/按钮跟随官网明暗两套值。
   ============================================================ */
:root {
  --vp-nav-logo-height: 38px;
  --vp-font-family-base: 'Noto Sans SC', 'PingFang SC', 'Microsoft YaHei', ui-sans-serif, sans-serif;

  --vp-c-brand-1: var(--apple-ink);
  --vp-c-brand-2: var(--apple-ink);
  --vp-c-brand-3: var(--apple-ink);
  --vp-c-brand-soft: var(--apple-line);

  --vp-c-text-1: var(--apple-ink);
  --vp-c-text-2: var(--apple-ink-secondary);
  --vp-c-text-3: var(--apple-muted);

  --vp-c-divider: var(--apple-line);
  --vp-c-border: var(--apple-line-strong);

  --vp-c-bg: var(--apple-surface);
  --vp-c-bg-elv: var(--apple-surface-elevated);
  /* 官网 :root 基底色（同 meta theme-color 亮色值） */
  --vp-c-bg-alt: #f5f5f7;
  --vp-c-bg-soft: #f5f5f7;

  --vp-button-brand-bg: var(--apple-btn-primary-bg);
  --vp-button-brand-text: var(--apple-btn-primary-text);
  --vp-button-brand-border: transparent;
  --vp-button-brand-hover-bg: var(--apple-btn-primary-bg-hover);
  --vp-button-brand-hover-text: var(--apple-btn-primary-text);
  --vp-button-brand-hover-border: transparent;
  --vp-button-brand-active-bg: var(--apple-btn-primary-bg-hover);
  --vp-button-brand-active-text: var(--apple-btn-primary-text);
  --vp-button-brand-active-border: transparent;
}

.dark {
  --vp-c-bg-alt: var(--apple-surface-elevated);
  --vp-c-bg-soft: var(--apple-surface-elevated);
}

/* 全站选区颜色与官网一致 */
::selection {
  background: var(--apple-selection-bg);
  color: var(--apple-selection-text);
}

.vp-doc a {
  font-weight: 500;
  color: var(--apple-ink);
}

.vp-doc a:hover {
  color: var(--apple-ink);
}

/* 正文内容图：限制最大宽度、保持比例、统一居中间距 */
.vp-doc p > img,
.vp-doc li > img,
.vp-doc td > img {
  display: block;
  width: 100%;
  max-width: 960px;
  height: auto;
  margin: 1.25rem auto;
  border-radius: 12px;
}

@media (max-width: 768px) {
  .vp-doc p > img,
  .vp-doc li > img,
  .vp-doc td > img {
    margin: 0.9rem auto;
    border-radius: 10px;
  }
}

/* 确保放大层始终在侧边栏与导航之上 */
.medium-zoom-overlay {
  z-index: 9998 !important;
}

.medium-zoom-image--opened {
  z-index: 9999 !important;
}

/* 保持侧边栏分组常开，隐藏折叠交互 */
.VPSidebarItem .caret {
  display: none !important;
}

.VPSidebarItem .button[aria-expanded] {
  pointer-events: none;
}
</style>
