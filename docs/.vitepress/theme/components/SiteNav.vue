<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useData, useRoute } from 'vitepress'
import { useI18n } from '../i18n/index.js'
import LanguageSwitch from './LanguageSwitch.vue'

const { isDark, frontmatter } = useData()
const route = useRoute()
const { t } = useI18n()

/**
 * 顶栏导航：**顶端透明、滚动后右侧浮出一颗胶囊**（左=品牌，右=导航与工具）。
 *
 * **落地页和文档页是两套 header**，按页面类型切换：
 *
 * · 落地页（`frontmatter.layout === 'home'`）：导航只留「文档 / 支持」两个出口；
 *   右侧只有「语言 + 下载」，搜索与主题工具不出现。
 * · 文档页：导航是路由（文档 / 路线图 / QA / 支持）；
 *   右侧是「搜索 + 主题 + 下载」，工具回到文档该有的样子。
 *
 * 版式有三处借鉴 notion.com：
 * 1. **导航在右**：左侧只留品牌，导航与工具、语言、下载并成右侧一丛
 *    （`justify-content: space-between` 两端撑开，左侧只有 logo）；
 * 2. **导航是朴素文字**：没有胶囊底、没有图标，靠字重而不是底色区分当前页；
 * 3. **右侧是「文字控件 + 圆角矩形实心按钮」**：按钮 8px 圆角，不是全圆胶囊。
 * 另外顶栏在页面顶端整条透明，滚动后右侧那一丛才浮成一颗胶囊
 * （品牌标始终不给底）—— 做法与取舍见 <style>。
 *
 * 语言开关只在落地页出现（两处引用都带 `v-if="isLanding"`）：文档只有中文，
 * 在文档页给一个会跳去 /en/ 落地页的开关，等于「切了语言但正在读的页没了」。
 * 将来文档有英文版时，去掉这两个 v-if 即可。
 *
 * 导航数据、工具栏是两个变体，改一边不会牵动另一边。
 * 文档搜索的 ⌘K / Ctrl+K 由 VitePress 全局注册，落地页没有搜索图标也不影响文档页。
 * < 860px：右侧一丛收敛为「三个横线」，点击展开面板（面板里保留主题切换）。
 *
 * 备注：落地页各 section 仍带 id（flow / features / privacy / faq，定义在 HomePage.vue），
 * 顶栏已经不用它们，但 `/#faq` 这类深链仍然有效（`.lp-block` 上留了 scroll-margin-top）。
 */
const isLanding = computed(() => frontmatter.value?.layout === 'home')

/**
 * 导航项结构（href / match 是路由信息，与语言无关），文案统一走 i18n 的 nav.*。
 * 新增语言不需要动这里，只要在 messages/<lang>.js 里补 nav.landing / nav.docPage。
 */
const NAV_DOCS = [
  { key: 'docs', href: '/what-is-deepstudent', match: ['/what-is-deepstudent', '/start', '/user-guide', '/guide', '/about'] },
  { key: 'roadmap', href: '/timeline', match: ['/timeline'] },
  { key: 'qa', href: '/A-Q', match: ['/A-Q'] },
  { key: 'support', href: '/support', match: ['/support'] },
]

/** 落地页导航：只留两个出口（不出现页内锚点、路线图、QA） */
const NAV_LANDING = [
  { key: 'docs', href: '/what-is-deepstudent' },
  { key: 'support', href: '/support' },
]

const links = computed(() => {
  const variant = isLanding.value ? 'landing' : 'docPage'
  const table = isLanding.value ? NAV_LANDING : NAV_DOCS
  return table.map((link) => ({ ...link, text: t(`nav.${variant}.${link.key}`) }))
})

const norm = (p) => (p || '/').replace(/\.html$/, '').replace(/(.)\/$/, '$1')

const isActive = (link) => {
  if (!link.match) return false
  const path = norm(route.path)
  return link.match.some((m) => path === m || path.startsWith(`${m}/`))
}

/** 移动端面板里点导航要先关面板（顶栏里调一次也无害） */
const onNavClick = () => {
  closeMenu()
}

/* ── 滚动状态：只用来决定那条 1px 发丝线出不出现 ──
 * 顶栏本身在顶端时完全无分界，内容滚到条下面才浮出分隔线。
 * 滚动事件里不直接改 class，先落到 rAF 里合帧 ——
 * 滚动过程中 scroll 的触发密度远高于渲染帧，每次都写 DOM 是白烧。
 */
const scrolled = ref(false)
let scrollRaf = 0

const readScroll = () => {
  scrollRaf = 0
  scrolled.value = (window.scrollY || window.pageYOffset || 0) > 4
}

const onScroll = () => {
  if (!scrollRaf) scrollRaf = requestAnimationFrame(readScroll)
}

/** 搜索 / 主题入口只在文档页出现：落地页右侧保持「语言 + 下载」 */
const showTools = computed(() => !isLanding.value)

/** 唤起 VitePress 内置本地搜索（组件仍在挂载，仅视觉隐藏） */
const openSearch = () => {
  if (typeof document === 'undefined') return
  const btn = document.querySelector('#local-search button')
  if (btn) {
    btn.click()
    return
  }
  window.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true })
  )
}

const toggleTheme = () => {
  isDark.value = !isDark.value
}

/* ── 移动端面板 ── */
const menuOpen = ref(false)
const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}
const closeMenu = () => {
  menuOpen.value = false
}

watch(
  () => route.path,
  () => closeMenu()
)

const onKeydown = (event) => {
  if (event.key === 'Escape') closeMenu()
}

watch(menuOpen, (open) => {
  if (typeof document === 'undefined') return
  document.documentElement.classList.toggle('sn-menu-open', open)
})

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  readScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('scroll', onScroll)
  if (scrollRaf) cancelAnimationFrame(scrollRaf)
  if (typeof document !== 'undefined') {
    document.documentElement.classList.remove('sn-menu-open')
  }
})
</script>

<template>
  <header class="SNav" :class="{ 'is-scrolled': scrolled }">
    <div class="SNav__bar">
      <!-- 左：品牌（PC 端只留图形标，与 Notion 一致；窄屏没有导航可让，补上字标） -->
      <a class="SNav__brand" href="/" aria-label="DeepStudent">
        <!--
          黑白标：路径数据取自主仓库 helixnow/deep-student 的 public/logo-black.svg。
          用 currentColor 而不是 <img>，颜色只由 --sn-mark 决定，
          不再依赖两套图片文件，也就不可能出现彩色版本。
        -->
        <svg
          class="SNav__mark"
          viewBox="0 0 126 126"
          fill="none"
          aria-hidden="true"
          focusable="false"
        >
          <path
            d="M107.394 31.3911C107.394 34.1859 105.11 36.4515 102.292 36.4515C99.475 36.4515 97.191 34.1859 97.191 31.3911C97.191 28.5963 99.475 26.3307 102.292 26.3307C105.11 26.3307 107.394 28.5963 107.394 31.3911Z"
            fill="currentColor"
          />
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M10 29.6379C10 22.764 10 19.327 11.3378 16.7015C12.5145 14.3921 14.3921 12.5145 16.7015 11.3378C19.327 10 22.764 10 29.6379 10H96.3621C103.236 10 106.673 10 109.298 11.3378C111.608 12.5145 113.486 14.3921 114.662 16.7015C116 19.327 116 22.764 116 29.6379V35.6632C116 63.7837 116 77.844 110.527 88.5846C105.714 98.0323 98.0323 105.714 88.5846 110.527C77.844 116 63.7837 116 35.6632 116H29.6379C22.764 116 19.327 116 16.7015 114.662C14.3921 113.486 12.5145 111.608 11.3378 109.298C10 106.673 10 103.236 10 96.3621V29.6379ZM32.6636 38.85H53.598C72.1285 38.85 87.1504 53.8719 87.1504 72.4024C87.1504 90.9329 72.1285 105.955 53.598 105.955H32.6636C32.3707 105.955 32.2242 105.955 32.1004 105.952C25.4999 105.819 20.181 100.5 20.048 93.9C20.0456 93.7761 20.0456 93.6297 20.0456 93.3368V51.468C20.0456 51.1751 20.0456 51.0286 20.048 50.9048C20.181 44.3043 25.4999 38.9854 32.1004 38.8524C32.2242 38.85 32.3707 38.85 32.6636 38.85ZM95.8062 44.6188C103.183 44.6188 109.163 38.6866 109.163 31.3688C109.163 24.0511 103.183 18.1188 95.8062 18.1188C88.4294 18.1188 82.4493 24.0511 82.4493 31.3688C82.4493 38.6866 88.4294 44.6188 95.8062 44.6188ZM107.394 31.3911C107.394 34.1859 105.11 36.4515 102.292 36.4515C99.475 36.4515 97.191 34.1859 97.191 31.3911C97.191 28.5963 99.475 26.3307 102.292 26.3307C105.11 26.3307 107.394 28.5963 107.394 31.3911Z"
            fill="currentColor"
          />
        </svg>
        <span class="SNav__name">DeepStudent</span>
      </a>

      <!-- 中：导航。两侧 flex: 0 0 auto，这里 flex: 1 占满剩余空间，把导航推到右侧 -->
      <div class="SNav__actions">
        <nav class="SNav__links" :aria-label="t('nav.primary')">
          <a
            v-for="link in links"
            :key="link.href"
            class="SNav__link"
            :class="{ 'is-active': isActive(link) }"
            :href="link.href"
            @click="onNavClick"
          >{{ link.text }}</a>
        </nav>

        <!--
          文档页 =「搜索 + 主题 + 语言 + 下载」；
          落地页只有「语言 + 下载」，工具不出现（见 showTools）。
        -->
        <div class="SNav__desktop">
          <template v-if="showTools">
            <button
              class="SNav__icon"
              type="button"
              :aria-label="t('nav.search')"
              :title="t('nav.search')"
              @click="openSearch"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                <circle cx="11" cy="11" r="6.5" />
                <path d="M16 16l4.5 4.5" stroke-linecap="round" />
              </svg>
            </button>

            <button
              class="SNav__icon"
              type="button"
              :aria-label="t('nav.theme')"
              :title="t('nav.theme')"
              @click="toggleTheme"
            >
              <span class="t-icon-swap" :data-state="isDark ? 'a' : 'b'" aria-hidden="true">
                <svg class="t-icon" data-icon="a" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                  <circle cx="12" cy="12" r="4.2" />
                  <path
                    d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4"
                    stroke-linecap="round"
                  />
                </svg>
                <svg class="t-icon" data-icon="b" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                  <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.8 6.8 0 0 0 10.5 10.5Z" stroke-linejoin="round" />
                </svg>
              </span>
            </button>
          </template>

          <!--
            语言开关只属于落地页：文档目前只有中文，把开关放在文档页上，
            用户点「English」会被丢到 /en/ 落地页 —— 语言变了、正在读的那页也没了。
            与其给一个「切了但内容没变」的控件，不如不给；英文站仍可从直达链接 /
            hreflang / sitemap 进入。将来文档有了英文版，把这个 v-if 去掉即可。
          -->
          <LanguageSwitch v-if="isLanding" bare />
          <a class="SNav__cta" href="/download">{{ t('nav.download') }}</a>
        </div>

        <button
          class="SNav__burger"
          :class="{ 'is-open': menuOpen }"
          type="button"
          :aria-label="t('nav.menu')"
          :aria-expanded="menuOpen"
          @click="toggleMenu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </div>

    <Transition name="sn-fade">
      <div v-if="menuOpen" class="SNav__backdrop" @click="closeMenu" />
    </Transition>

    <Transition name="sn-drop">
      <div v-if="menuOpen" class="SNav__sheet">
        <nav class="SNav__sheet-links" :aria-label="t('nav.primary')">
          <a
            v-for="link in links"
            :key="link.href"
            class="SNav__sheet-link"
            :class="{ 'is-active': isActive(link) }"
            :href="link.href"
            @click="onNavClick"
          >{{ link.text }}</a>
        </nav>
        <div class="SNav__sheet-foot">
          <LanguageSwitch v-if="isLanding" />
          <button
            class="SNav__icon"
            type="button"
            :aria-label="t('nav.theme')"
            @click="toggleTheme"
          >
            <span class="t-icon-swap" :data-state="isDark ? 'a' : 'b'" aria-hidden="true">
              <svg class="t-icon" data-icon="a" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                <circle cx="12" cy="12" r="4.2" />
                <path
                  d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6L17 7M7 17l-1.4 1.4"
                  stroke-linecap="round"
                />
              </svg>
              <svg class="t-icon" data-icon="b" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
                <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.8 6.8 0 0 0 10.5 10.5Z" stroke-linejoin="round" />
              </svg>
            </span>
          </button>
          <a class="SNav__cta" href="/download" @click="closeMenu">{{ t('nav.download') }}</a>
        </div>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
/*
 * 顶端透明 → 滚动后右侧浮出一颗胶囊。
 *
 * 状态只有两档，由 header 上的 .is-scrolled 决定（SiteNav 的 scroll 监听切换）：
 * · 页面在顶端：右侧那一丛完全透明 —— 没有底色、没有投影，
 *   只剩左侧的品牌标与右侧那一丛内容浮在页面上，整条从视口左沿铺到右沿；
 * · 滚动之后：右侧那一丛「显形」—— 实心底 + 全圆角 + 投影。
 *   左侧的品牌标**始终不是胶囊**，只有图形标本身，滚动前后都不给底。
 *
 * 关键取舍：**胶囊的几何在两档之间完全不变**，动的只有底色与投影。
 * 一开始写的是「滚动时把通栏收窄成胶囊」，但宽度一变，里面的按钮
 * 会跟着平移十几像素，滚到临界点时会看到内容横向一跳。
 * 现在尺寸只有一套（48px 高、圆角常驻），顶端透明时看不出圆角，
 * 滚动时只是把它「显影」出来 —— 零位移，过渡也不用管布局属性。
 *
 * 通栏（不再限宽）：品牌标贴视口左沿、右侧胶囊贴右沿，
 * 所以图形标落在 28px 上，不再被「居中限宽」推到一百多像素处。
 */
.SNav {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  z-index: 30;
  height: var(--vp-nav-height);
  /* 整条不吃指针事件：真正接收点击的是品牌标与右侧那颗胶囊，中间的空档留给页面内容 */
  pointer-events: none;
}

.SNav__bar {
  display: flex;
  align-items: center;
  /* 两端撑开：品牌贴左、胶囊贴右 */
  justify-content: space-between;
  gap: 12px;
  box-sizing: border-box;
  height: 100%;
  padding: 0 16px;
  pointer-events: none;
}

/* ── 右侧一丛（导航 + 工具 + 语言 + 下载）：顶端透明，滚动后显形成一颗胶囊 ── */
.SNav__actions {
  display: flex;
  align-items: center;
  height: 48px;
  /* 圆角常驻：透明时看不出来，滚动后不用现改几何 */
  border-radius: 999px;
  background: transparent;
  box-shadow: 0 0 0 0 transparent;
  pointer-events: auto;
  transition:
    background-color var(--sn-capsule-dur) var(--sn-capsule-ease),
    box-shadow var(--sn-capsule-dur) var(--sn-capsule-ease);
}

.SNav.is-scrolled .SNav__actions {
  background: var(--sn-bar-bg);
  box-shadow: var(--sn-capsule-shadow);
}

/* ── 左：品牌。不是胶囊 —— 只给图形标本身，没有任何底与投影 ── */
.SNav__brand {
  display: flex;
  align-items: center;
  flex: 0 0 auto;
  gap: 8px;
  height: 48px;
  /* 内边距只为定位服务：图形标落在视口 28px 上（16 + 12），滚动前后都不动 */
  padding: 0 12px;
  pointer-events: auto;
  text-decoration: none;
}

.SNav__mark {
  display: block;
  flex: 0 0 auto;
  width: 26px;
  height: 26px;
  /* 黑白两态只由这里决定：浅色 #1a1a1a，深色 #ffffff */
  color: var(--sn-mark);
}

.SNav__name {
  font-size: 15px;
  font-weight: 600;
  letter-spacing: -0.012em;
  line-height: 1;
  color: var(--sn-text);
}

/* ── 右胶囊里的导航：最靠左的一项，不再是顶栏中轴 ── */
.SNav__links {
  display: none;
  align-items: center;
  gap: 2px;
}

.SNav__link {
  display: inline-flex;
  align-items: center;
  /* 与同一颗胶囊里的图标按钮、语言开关一样高，一行才对得齐 */
  height: 32px;
  padding: 0 12px;
  border-radius: var(--sn-radius-ctl);
  font-size: 15px;
  font-weight: 450;
  line-height: 1;
  /*
   * 与 Notion 一致：导航项同色同字重，靠 hover 底与「当前页加粗」区分，
   * 不做灰/黑两档 —— 旧版把未选中项压到 --sn-text-muted，
   * 在顶栏里会显得那一排字「没长齐」。
   */
  color: var(--sn-text);
  text-decoration: none;
  white-space: nowrap;
  transition: background-color 0.16s ease;
}

.SNav__link:hover {
  background: var(--sn-hover);
}

.SNav__link.is-active {
  font-weight: 600;
}

/* ── 右侧一丛：导航 + 工具 + 语言 + 下载，自己就是右胶囊 ── */
.SNav__actions {
  flex: 0 0 auto;
  gap: 6px;
  /* 与左胶囊同宽内边距：两端对称（16 + 12 = 28px） */
  padding: 0 12px;
}

.SNav__desktop {
  display: none;
  align-items: center;
  gap: 4px;
}

.SNav__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 0;
  border-radius: var(--sn-radius-ctl);
  background: transparent;
  color: var(--sn-text-muted);
  cursor: pointer;
  transition: color 0.16s ease, background-color 0.16s ease;
}

.SNav__icon:hover {
  color: var(--sn-text);
  background: var(--sn-hover);
}

.SNav__icon svg {
  width: 17px;
  height: 17px;
}

/*
 * 主按钮：圆角矩形（8px），不是全圆胶囊 —— Notion 的按钮语言就是这样，
 * 也把「顶栏的动作」和「落地页 Hero 的胶囊主按钮」在形状上分开。
 * 实心、无描边、无投影：扁平条上再叠一层投影只会显脏。
 */
.SNav__cta {
  display: none;
  align-items: center;
  height: 36px;
  padding: 0 14px;
  border: 0;
  border-radius: var(--sn-radius-btn);
  font-size: 15px;
  font-weight: 500;
  line-height: 1;
  letter-spacing: 0;
  text-decoration: none;
  color: var(--sn-cta-text);
  background: var(--sn-cta-bg);
  transition: opacity 0.16s ease;
}

.SNav__cta:hover {
  opacity: 0.86;
}

/* ── 移动端「三个横线」 ── */
.SNav__burger {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 40px;
  height: 40px;
  padding: 0;
  border: 0;
  border-radius: var(--sn-radius-btn);
  background: transparent;
  color: var(--sn-text);
  cursor: pointer;
  transition: background-color 0.16s ease;
}

.SNav__burger:hover {
  background: var(--sn-hover);
}

.SNav__burger span {
  display: block;
  width: 16px;
  height: 1.5px;
  border-radius: 2px;
  background: currentColor;
  transition: transform 0.32s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.2s ease;
}

.SNav__burger.is-open span:nth-child(1) {
  transform: translateY(5.5px) rotate(45deg);
}

.SNav__burger.is-open span:nth-child(2) {
  opacity: 0;
}

.SNav__burger.is-open span:nth-child(3) {
  transform: translateY(-5.5px) rotate(-45deg);
}

/* ── 移动端展开面板 ── */
.SNav__backdrop {
  position: fixed;
  inset: 0;
  z-index: 28;
  background: rgba(0, 0, 0, 0.28);
  pointer-events: auto;
}

.SNav__sheet {
  position: fixed;
  /*
   * 吸附在通栏下沿：栏高就是 --vp-nav-height，这里跟着变量走，
   * 不写死数字（旧版写死 60px，跟栏高 64px 差 4px，顶端看着像没贴住）。
   */
  top: calc(var(--vp-nav-height) + 6px);
  right: 12px;
  left: 12px;
  z-index: 29;
  box-sizing: border-box;
  max-height: calc(100vh - var(--vp-nav-height) - 24px);
  padding: 8px;
  border-radius: var(--sn-radius-panel);
  /* 与顶栏同一张实心面 + 描边 + 投影；不用 backdrop 模糊（已经不是玻璃的语言了） */
  background: var(--sn-menu-bg);
  border: 1px solid var(--sn-border);
  box-shadow: var(--sn-menu-shadow);
  overflow-y: auto;
  overscroll-behavior: contain;
  pointer-events: auto;
}

.SNav__sheet-links {
  display: flex;
  flex-direction: column;
}

.SNav__sheet-link {
  padding: 12px 14px;
  border-radius: var(--sn-radius-ctl);
  font-size: 15px;
  font-weight: 450;
  color: var(--sn-text);
  text-decoration: none;
  transition: background-color 0.16s ease;
}

.SNav__sheet-link:hover {
  background: var(--sn-hover);
}

.SNav__sheet-link.is-active {
  font-weight: 600;
  background: var(--sn-hover);
}

.SNav__sheet-foot {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 6px;
  padding: 12px 8px 6px;
  border-top: 1px solid var(--sn-border);
}

.SNav__sheet-foot .SNav__cta {
  display: inline-flex;
  margin-left: auto;
}

/* ── 过渡 ── */
.sn-fade-enter-active,
.sn-fade-leave-active {
  transition: opacity 0.28s ease;
}

.sn-fade-enter-from,
.sn-fade-leave-to {
  opacity: 0;
}

.sn-drop-enter-active {
  transition: opacity 0.3s ease, transform 0.42s cubic-bezier(0.22, 1, 0.36, 1);
}

.sn-drop-leave-active {
  transition: opacity 0.2s ease, transform 0.22s ease;
}

.sn-drop-enter-from,
.sn-drop-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.985);
}

@media (prefers-reduced-motion: reduce) {
  .SNav__bar,
  .sn-fade-enter-active,
  .sn-fade-leave-active,
  .sn-drop-enter-active,
  .sn-drop-leave-active,
  .SNav__burger span {
    transition: none;
  }
}

/* 移动端：整条内边距收窄，两颗胶囊离视口边更近一点（左 12 + 12 = 24px） */
@media (max-width: 859px) {
  .SNav__bar {
    padding: 0 12px;
  }
}

/* PC：展开主导航与下载按钮，收起汉堡 */
@media (min-width: 860px) {
  /* 胶囊里空间有限，图形标足够认品牌，PC 端不再出字标 */
  .SNav__name {
    display: none;
  }

  .SNav__links {
    display: flex;
  }

  .SNav__desktop {
    display: flex;
  }

  .SNav__cta {
    display: inline-flex;
  }

  .SNav__burger {
    display: none;
  }
}
</style>
