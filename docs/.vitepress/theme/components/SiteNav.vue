<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useData, useRoute } from 'vitepress'
import { useI18n } from '../i18n/index.js'
import LanguageSwitch from './LanguageSwitch.vue'

const { isDark, frontmatter } = useData()
const route = useRoute()
const { t } = useI18n()

/**
 * Apple 风格浮动胶囊导航。**落地页和文档页是两套 header**，按页面类型切换：
 *
 * · 落地页（`frontmatter.layout === 'home'`）：导航只留「文档 / 支持」两个出口；
 *   右侧只有「语言 + 下载」，搜索与主题工具不出现。
 * · 文档页：导航是路由（文档 / 路线图 / QA / 支持）；
 *   右侧是「搜索 + 主题 + 下载」，工具回到文档该有的样子。
 *
 * 语言开关只在落地页出现（两处引用都带 `v-if="isLanding"`）：文档只有中文，
 * 在文档页给一个会跳去 /en/ 落地页的开关，等于「切了语言但正在读的页没了」。
 * 将来文档有英文版时，去掉这两个 v-if 即可。
 *
 * 两者共用的只是外壳（玻璃胶囊、汉堡、移动端展开面板）与外观；
 * 导航数据、工具栏是两个变体，改一边不会牵动另一边。
 * 文档搜索的 ⌘K / Ctrl+K 由 VitePress 全局注册，落地页没有搜索图标也不影响文档页。
 * < 860px：右侧收敛为「三个横线」，点击展开面板（面板里保留主题切换）。
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

/* ── 液态玻璃：镜面光斑跟着指针在玻璃上滑（仅精确指针设备） ── */
const barEl = ref(null)
let specRaf = 0
let specX = 14
let specY = -46

const flushSpecular = () => {
  specRaf = 0
  if (!barEl.value) return
  barEl.value.style.setProperty('--sn-spec-x', `${specX.toFixed(2)}%`)
  barEl.value.style.setProperty('--sn-spec-y', `${specY.toFixed(2)}%`)
}

const onPointerMove = (event) => {
  const rect = barEl.value?.getBoundingClientRect()
  if (!rect?.width) return
  // 指针位置映射到光斑位置：横向 -10%~60%、纵向 -60%~0%，幅度克制一点
  specX = -10 + ((event.clientX - rect.left) / rect.width) * 70
  specY = -60 + ((event.clientY - rect.top) / rect.height) * 60
  if (!specRaf) specRaf = requestAnimationFrame(flushSpecular)
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
  // 触屏/无精确指针的设备不做光斑跟随（没有 hover 语义，白写）
  if (window.matchMedia?.('(hover: hover) and (pointer: fine)').matches) {
    barEl.value?.addEventListener('pointermove', onPointerMove)
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  if (specRaf) cancelAnimationFrame(specRaf)
  barEl.value?.removeEventListener('pointermove', onPointerMove)
  if (typeof document !== 'undefined') {
    document.documentElement.classList.remove('sn-menu-open')
  }
})
</script>

<template>
  <header class="SNav">
    <div ref="barEl" class="SNav__bar">
      <!-- 左：logo 胶囊（PC 端不出字标，只留图形标 + 主导航） -->
      <div class="SNav__pill">
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
      </div>

      <!--
        右：文档页 =「搜索 + 主题 + 语言 + 下载」；
        落地页只有「语言 + 下载」，工具不出现（见 showTools）。
      -->
      <div class="SNav__actions">
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
            「语言 + 下载」一律安静样式（见 .is-quiet）：落地页 Hero 已有主下载，
            文档页也不再拿实心胶囊抢正文，强调色只属于落地页主按钮。
          -->
          <div class="SNav__pill SNav__pill--right is-quiet">
            <!--
              语言开关只属于落地页：文档目前只有中文，把开关放在文档页上，
              用户点「English」会被丢到 /en/ 落地页 —— 语言变了、正在读的那页也没了。
              与其给一个「切了但内容没变」的控件，不如不给；英文站仍可从直达链接 /
              hreflang / sitemap 进入。将来文档有了英文版，把这个 v-if 去掉即可。
            -->
            <LanguageSwitch v-if="isLanding" bare />
            <a class="SNav__cta" href="/download">{{ t('nav.download') }}</a>
          </div>
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
.SNav {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  z-index: 30;
  height: var(--vp-nav-height);
  pointer-events: none;
}

/*
 * 顶栏本身完全透明：不做任何整条遮罩/模糊，页面内容直接从胶囊周围穿过。
 * 毛玻璃只属于胶囊（.SNav__pill / .SNav__icon / .SNav__burger / 移动端面板）。
 */
.SNav__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  box-sizing: border-box;
  margin: 0 auto;
  padding: 8px 16px;
  max-width: 1180px;
  pointer-events: auto;
}

/* ── 液态玻璃浮起件（左胶囊 / 图标按钮 / 汉堡）── */
.SNav__pill,
.SNav__icon,
.SNav__burger {
  background-color: var(--sn-surface);
  /*
   * 两层高光压在玻璃底上：镜面光斑（中心点由 JS 跟着指针写 --sn-spec-x/y）+ 顶缘渐变。
   * 渐变必须写在这里而不是 custom.css 的 :root —— var() 是在「声明该变量的元素」上替换的，
   * 在 :root 拼好渐变的话，JS 往 .SNav__bar 上写的 --sn-spec-x 永远传不进来。
   * 外沿交给 --sn-shadow 的「双色内描边 + 内壁暗角 + 大外投影」，不用 border：
   * border 会让元素实际尺寸多 2px，拐角处也会出现一圈发灰的硬边。
   */
  background-image:
    radial-gradient(
      120% 100% at var(--sn-spec-x, 14%) var(--sn-spec-y, -46%),
      var(--sn-glass-spec) 0%,
      transparent 62%
    ),
    var(--sn-glass-sheen);
  border: 0;
  backdrop-filter: var(--sn-glass-blur);
  -webkit-backdrop-filter: var(--sn-glass-blur);
  box-shadow: var(--sn-shadow);
  /* 光斑位置是 @property 注册过的可插值自定义属性，所以能带上一点「液态」拖尾 */
  transition: --sn-spec-x 320ms cubic-bezier(0.22, 1, 0.36, 1),
    --sn-spec-y 320ms cubic-bezier(0.22, 1, 0.36, 1);
}

.SNav__pill {
  display: flex;
  align-items: center;
  gap: 4px;
  height: 48px;
  padding: 0 8px 0 14px;
  border-radius: 999px;
}

/*
 * 右侧胶囊：与左侧 logo 胶囊同款玻璃外观，内部只放「语言切换 + 下载」。
 * 内高 36px（48 - 6 * 2），所以内边距收到 6px、间距 6px，两个控件一样高。
 */
.SNav__pill--right {
  gap: 6px;
  padding: 0 6px;
}

.SNav__pill--right .SNav__cta {
  display: inline-flex;
  height: 36px;
  padding: 0 16px;
}

/*
 * 安静态：「语言 + 下载」降到中性文字（与左侧 文档 / 支持 同一档灰），
 * 只留 hover 的一层淡底。落地页强调色只属于 Hero；文档页正文才是主角。
 */
.SNav__pill--right.is-quiet :deep(.LangSelect__button) {
  color: var(--sn-text-muted);
}

.SNav__pill--right.is-quiet :deep(.LangSelect__button:hover) {
  color: var(--sn-text);
}

.SNav__pill--right.is-quiet .SNav__cta {
  padding: 0 12px;
  color: var(--sn-text-muted);
  background: transparent;
  box-shadow: none;
  transition: color 0.2s ease, background-color 0.2s ease;
}

.SNav__pill--right.is-quiet .SNav__cta:hover {
  color: var(--sn-text);
  background: var(--sn-hover);
  transform: none;
  opacity: 1;
}

.SNav__brand {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  opacity: 0.94;
  transition: opacity 0.2s ease;
}

.SNav__brand:hover {
  opacity: 1;
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

.SNav__links {
  display: none;
  align-items: center;
  gap: 2px;
  margin-left: 10px;
}

.SNav__link {
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 450;
  letter-spacing: 0.005em;
  line-height: 1;
  color: var(--sn-text-muted);
  text-decoration: none;
  white-space: nowrap;
  transition: color 0.2s ease, background-color 0.2s ease;
}

.SNav__link:hover {
  color: var(--sn-text);
  background: var(--sn-hover);
}

.SNav__link.is-active {
  color: var(--sn-text);
  font-weight: 600;
}

/* ── 右侧控件 ── */
.SNav__actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.SNav__desktop {
  display: none;
  align-items: center;
  gap: 8px;
}

.SNav__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border-radius: 999px;
  color: var(--sn-text-muted);
  cursor: pointer;
  transition: color 0.2s ease;
}

.SNav__icon:hover {
  color: var(--sn-text);
}

.SNav__icon svg {
  width: 17px;
  height: 17px;
}

.SNav__cta {
  display: none;
  align-items: center;
  height: 32px;
  padding: 0 15px;
  border: 0;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 500;
  line-height: 1;
  letter-spacing: 0.005em;
  text-decoration: none;
  color: var(--sn-cta-text);
  background: var(--sn-cta-bg);
  /* 实心按钮不需要内高光，用一层克制的投影压住即可 */
  box-shadow: var(--sn-cta-shadow);
  transition: transform 0.2s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.2s ease;
}

.SNav__cta:hover {
  transform: translateY(-1px);
  opacity: 0.94;
}

/* ── 移动端「三个横线」 ── */
.SNav__burger {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 44px;
  height: 44px;
  padding: 0;
  border-radius: 999px;
  cursor: pointer;
}

.SNav__burger span {
  display: block;
  width: 16px;
  height: 1.5px;
  border-radius: 2px;
  background: var(--sn-text);
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
  top: 60px;
  right: 12px;
  left: 12px;
  z-index: 29;
  box-sizing: border-box;
  max-height: calc(100vh - 84px);
  padding: 8px;
  border-radius: 24px;
  background-color: var(--sn-sheet-bg);
  /* 同一套液态玻璃：光斑 + 顶缘高光 + 双色内描边 + 大外投影（面板在 bar 外面，光斑用默认位置） */
  background-image:
    radial-gradient(
      120% 100% at var(--sn-spec-x, 14%) var(--sn-spec-y, -46%),
      var(--sn-glass-spec) 0%,
      transparent 62%
    ),
    var(--sn-glass-sheen);
  border: 0;
  backdrop-filter: var(--sn-glass-blur);
  -webkit-backdrop-filter: var(--sn-glass-blur);
  box-shadow: var(--sn-shadow-lg);
  overflow-y: auto;
  overscroll-behavior: contain;
  pointer-events: auto;
}

.SNav__sheet-links {
  display: flex;
  flex-direction: column;
}

.SNav__sheet-link {
  padding: 14px 16px;
  border-radius: 16px;
  font-size: 17px;
  font-weight: 500;
  letter-spacing: -0.01em;
  color: var(--sn-text);
  text-decoration: none;
  transition: background-color 0.2s ease;
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
  height: 36px;
  padding: 0 18px;
  font-size: 14px;
  color: var(--sn-text-muted);
  background: transparent;
  box-shadow: none;
  transition: color 0.2s ease, background-color 0.2s ease;
}

.SNav__sheet-foot .SNav__cta:hover {
  color: var(--sn-text);
  background: var(--sn-hover);
  transform: none;
  opacity: 1;
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
  .SNav__bar {
    transition: none;
  }

  .sn-fade-enter-active,
  .sn-fade-leave-active,
  .sn-drop-enter-active,
  .sn-drop-leave-active,
  .SNav__burger span {
    transition: none;
  }
}

/* 移动端没有导航项时，胶囊右内边距要和左内边距对称，否则文字贴着右沿 */
@media (max-width: 859px) {
  .SNav__pill {
    padding-right: 16px;
  }
}

/* PC：展开主导航与下载按钮，收起汉堡 */
@media (min-width: 860px) {
  /* 图形标足以认品牌，PC 端不再出字标，把宽度让给导航 */
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
