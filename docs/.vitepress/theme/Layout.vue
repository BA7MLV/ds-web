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
  --apple-nav-bg: rgba(251, 251, 253, 0.75);
  --apple-nav-border: rgba(0, 0, 0, 0.05);
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
  --apple-nav-bg: rgba(0, 0, 0, 0.75);
  --apple-nav-border: rgba(255, 255, 255, 0.08);
  --apple-selection-bg: rgba(10, 132, 255, 0.25);
  --apple-selection-text: #ffffff;
}

/* ============================================================
   VitePress 主题变量 → --apple-* token 映射：
   品牌色收敛为 ink 单色，文本/线条/表面/按钮与导航/侧栏 chrome
   跟随官网明暗两套值。
   ============================================================ */
:root {
  /* 官网 TopNav 为 h-14（56px）；logo 高按原 38/64 比例同步收至 32px */
  --vp-nav-height: 56px;
  --vp-nav-logo-height: 32px;
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
  /* gutter 默认深色为纯黑（#000），统一收敛为官网发丝线 */
  --vp-c-gutter: var(--apple-line);

  --vp-c-bg: var(--apple-surface);
  --vp-c-bg-elv: var(--apple-surface-elevated);
  /* 官网 :root 基底色（同 meta theme-color 亮色值） */
  --vp-c-bg-alt: #f5f5f7;
  --vp-c-bg-soft: #f5f5f7;

  /* 导航与侧栏 chrome 全部走 --apple-* token：
     顶栏/移动局部导航用官网半透明 nav 底（配合下方玻璃态），
     侧栏移动抽屉用 elevated 表面（弹层语义），桌面轨道见 ≥960px 覆盖 */
  --vp-nav-bg-color: var(--apple-nav-bg);
  --vp-local-nav-bg-color: var(--apple-nav-bg);
  --vp-sidebar-bg-color: var(--apple-surface-elevated);

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

/* ============================================================
   桌面导航链接对齐官网 TopNav（top-nav.jsx）：
   12px / 常规字重 / muted 底色，悬停与激活回到 ink。
   ============================================================ */
.VPNavBarMenu .VPNavBarMenuLink {
  font-size: 12px;
  font-weight: 400;
  color: var(--vp-c-text-3);
}

.VPNavBarMenu .VPNavBarMenuLink:hover,
.VPNavBarMenu .VPNavBarMenuLink.active {
  color: var(--vp-c-text-1);
}

/* ============================================================
   导航栏对齐官网 TopNav 玻璃态（top-nav.jsx）：
   半透明 --apple-nav-bg + blur(20px) saturate(180%)；
   顶栏与移动局部导航的发丝线在此换乘 --apple-nav-border。
   ============================================================ */
.VPNavBar,
.VPLocalNav {
  --vp-c-gutter: var(--apple-nav-border);
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
}

/* ============================================================
   侧边栏对齐官网 token：
   - 分组标题复用 doc-hero eyebrow 尺度（12px / 600 / muted）
   - 条目对齐官网 TopNav 链接节奏（13px / 常规字重，
     悬停/激活颜色经 --vp-c-brand-1 → --apple-ink 流转）
   - 桌面轨道贴合 --apple-surface 基底 + --apple-line 发丝右缘
   - 移动端抽屉保持 elevated 表面并带 --apple-shadow-lg
   ============================================================ */
.VPSidebar .VPSidebarItem .link .text {
  font-size: 13px;
  font-weight: 400;
  color: var(--vp-c-text-2);
}

.VPSidebar .VPSidebarItem.is-active > .item .link .text {
  font-weight: 500;
}

.VPSidebar .VPSidebarItem.level-0 > .item .text {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: var(--vp-c-text-3);
}

@media (max-width: 959px) {
  /* 类型选择器仅为压过默认主题的 .dark .VPSidebar 阴影，勿删 */
  aside.VPSidebar,
  html.dark aside.VPSidebar {
    box-shadow: var(--apple-shadow-lg);
  }
}

@media (min-width: 960px) {
  :root {
    --vp-sidebar-bg-color: var(--apple-surface);
  }

  .VPSidebar {
    border-right: 1px solid var(--vp-c-divider);
  }
}

/* ============================================================
   本地搜索对齐 --apple-* token（顶栏搜索按钮 / 搜索弹窗 / 移动大纲下拉）：
   - 弹窗遮罩复用 --apple-card 半透明底，叠加官网玻璃态 blur 成磨砂效果
   - 弹窗壳体走 elevated 表面（弹层语义）+ --apple-line 发丝线
     + --apple-shadow-lg；命中高亮换乘全站选区 token（--apple-selection-*）
   - 顶栏搜索按钮描边从品牌色收敛为发丝线（悬停加深一档）
   ============================================================ */
:root {
  --vp-backdrop-bg-color: var(--apple-card);
  --vp-local-search-bg: var(--apple-surface-elevated);
  --vp-local-search-result-bg: var(--apple-surface-elevated);
  --vp-local-search-result-selected-bg: var(--apple-surface-elevated);
  --vp-local-search-highlight-bg: var(--apple-selection-bg);
  --vp-local-search-highlight-text: var(--apple-ink);
}

.VPLocalSearchBox .backdrop {
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
}

/* 移动端壳体为全屏（border-radius: 0），边框与投影仅桌面生效 */
@media (min-width: 768px) {
  .VPLocalSearchBox .shell {
    border: 1px solid var(--apple-line);
    box-shadow: var(--apple-shadow-lg);
  }

  .VPNavBarSearch .DocSearch-Button {
    border: 1px solid var(--apple-line);
  }

  .VPNavBarSearch .DocSearch-Button:hover {
    border-color: var(--apple-line-strong);
  }
}

/* 弹窗底部快捷键 kbd 默认为固定灰值，换乘发丝线与 --apple-shadow-sm */
.VPLocalSearchBox .shell .search-keyboard-shortcuts kbd {
  background: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-divider);
  box-shadow: var(--apple-shadow-sm);
}

/* ============================================================
   移动局部导航的大纲下拉弹层：
   默认 gutter 底色经 Round 7 的 .VPLocalNav 覆盖后近乎全透明，
   会漏出页面内容；改回不透明 elevated 表面，边框收敛为发丝线，
   阴影换乘 --apple-shadow-lg（弹层语义，与搜索弹窗一致）。
   ============================================================ */
.VPLocalNav .VPLocalNavOutlineDropdown .items {
  border: 1px solid var(--vp-c-divider);
  background-color: var(--vp-c-bg-elv);
  box-shadow: var(--apple-shadow-lg);
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
