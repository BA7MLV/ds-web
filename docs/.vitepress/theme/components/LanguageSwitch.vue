<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useData, useRoute, useRouter } from 'vitepress'
import { useI18n } from '../i18n/index.js'

const props = defineProps({
  /**
   * 裸样式：嵌在顶栏胶囊「内部」时使用。
   * 去掉自身的玻璃底、外沿与投影，否则会出现「玻璃叠玻璃」的双层描边；
   * 移动端展开面板里是独立控件，不传 bare。
   */
  bare: { type: Boolean, default: false },
})

const route = useRoute()
const router = useRouter()
const { site } = useData()
const { t } = useI18n()

/** 站点 locales（取自 `config.js` 的 `locales`），只保留有 link 的项 */
const locales = computed(() => {
  const raw = site.value?.locales
  if (!raw || typeof raw !== 'object') return []

  return Object.entries(raw)
    .map(([key, value]) => {
      const label = value?.label
      const link = value?.link ?? (key === 'root' ? '/' : undefined)
      return {
        key,
        label: typeof label === 'string' ? label : key,
        link: typeof link === 'string' ? link : undefined,
      }
    })
    .filter((l) => typeof l.link === 'string')
})

/** 当前语言：最长前缀优先，避免 '/' 把 /en/ 抢走 */
const currentKey = computed(() => {
  const path = route.path || '/'
  const sorted = [...locales.value].sort((a, b) => (b.link?.length || 0) - (a.link?.length || 0))
  const hit = sorted.find((l) => l.link && path.startsWith(l.link))
  return hit?.key ?? locales.value[0]?.key ?? ''
})

const currentIndex = computed(() => locales.value.findIndex((l) => l.key === currentKey.value))
const currentLabel = computed(() => locales.value[currentIndex.value]?.label ?? '')
const ariaLabel = computed(() => t('nav.switchLanguage'))

/* ── 展开 / 收起 ── */
const open = ref(false)
const rootEl = ref(null)
const menuEl = ref(null)
/** Teleport 到 body 的菜单用 fixed 定位，坐标得自己算 */
const menuStyle = ref({})
/** 键盘高亮的选项下标（-1 表示没有高亮项） */
const activeIndex = ref(-1)

/**
 * 选项节点直接查 DOM，不挂 v-for ref：
 * v-for 上的模板 ref 拿到的数组顺序/清理时机都不好把握（这里第一版就踩了 —— 数组一直是空的，
 * ↓/↑ 看着按了其实什么都没发生）。菜单本身是 v-if 重建的，查一次 DOM 反而最准。
 */
const itemNodes = () => [...(menuEl.value?.querySelectorAll('.LangSelect__item') ?? [])]

const focusItem = (index) => {
  const list = itemNodes()
  if (!list.length) return
  const next = (index + list.length) % list.length
  activeIndex.value = next
  list[next]?.focus()
}

/**
 * 菜单挂在 body 上（见模板里的 Teleport），所以位置要按锚点的视口坐标自己算：
 * 默认开在控件下方，下面放不下且上方放得下就翻上去；左右也夹在视口内。
 */
const positionMenu = () => {
  const anchor = rootEl.value
  if (!anchor) return
  const r = anchor.getBoundingClientRect()
  const gap = 10
  const h = menuEl.value?.offsetHeight || 80
  const w = menuEl.value?.offsetWidth || 140
  const flipUp = r.bottom + gap + h > window.innerHeight - 8 && r.top - gap - h > 8
  menuStyle.value = {
    top: `${flipUp ? r.top - gap - h : r.bottom + gap}px`,
    left: `${Math.max(8, Math.min(r.left, window.innerWidth - w - 8))}px`,
  }
}

const openMenu = async (focusSelected = false) => {
  positionMenu()
  open.value = true
  await nextTick()
  // 菜单渲染出来后再按真实高度校正一次（只在空间不够需要翻转时才会变）
  positionMenu()
  if (focusSelected) focusItem(Math.max(currentIndex.value, 0))
}

const closeMenu = (refocus = false) => {
  if (!open.value) return
  open.value = false
  activeIndex.value = -1
  if (refocus) rootEl.value?.querySelector('.LangSelect__button')?.focus()
}

const toggle = () => (open.value ? closeMenu() : openMenu())

const choose = async (locale) => {
  closeMenu()
  if (!locale?.link || locale.key === currentKey.value) return

  // 保留 hash / 查询串：长文档页里切换语言不丢位置
  const { hash, search } =
    typeof window !== 'undefined' ? window.location : { hash: '', search: '' }
  await router.go(`${locale.link}${search}${hash}`)
}

/**
 * 自写下拉的键盘行为（原生 select 免费给的东西，这里得自己补齐）：
 * ↓/↑ 在选项间移动，Enter/Space 选中，Esc 收起并回到按钮，Tab 直接收起。
 */
const onButtonKeydown = (event) => {
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    openMenu(true)
    return
  }
  if (event.key === 'Escape') closeMenu()
  if (event.key === 'Tab') closeMenu()
}

const onItemKeydown = (event, locale) => {
  const list = itemNodes()
  const index = list.indexOf(event.currentTarget)

  switch (event.key) {
    case 'ArrowDown':
      event.preventDefault()
      focusItem(index + 1)
      break
    case 'ArrowUp':
      event.preventDefault()
      focusItem(index - 1)
      break
    case 'Home':
      event.preventDefault()
      focusItem(0)
      break
    case 'End':
      event.preventDefault()
      focusItem(list.length - 1)
      break
    case 'Enter':
    case ' ':
      event.preventDefault()
      choose(locale)
      break
    case 'Escape':
      event.preventDefault()
      closeMenu(true)
      break
    case 'Tab':
      closeMenu()
      break
    default:
      break
  }
}

/** 点组件外部收起（菜单不在 rootEl 里，得单独判） */
const onDocumentPointerDown = (event) => {
  if (!open.value) return
  if (rootEl.value?.contains(event.target) || menuEl.value?.contains(event.target)) return
  closeMenu()
}

const onResize = () => {
  if (open.value) positionMenu()
}

onMounted(() => {
  document.addEventListener('pointerdown', onDocumentPointerDown)
  window.addEventListener('resize', onResize)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocumentPointerDown)
  window.removeEventListener('resize', onResize)
})

// 换页后一定收起（这个组件在 SPA 里是同一个实例）
watch(
  () => route.path,
  () => closeMenu()
)
</script>

<template>
  <!--
    语言切换是自写的下拉组件（不是原生 select）：
    原生面板样式由系统控制，跟顶栏的液态玻璃对不上；
    代价是键盘操作要自己补齐 —— 见上面的 onButtonKeydown / onItemKeydown。
  -->
  <span
    v-if="locales.length > 1"
    ref="rootEl"
    class="LangSelect"
    :class="{ 'is-bare': bare, 'is-open': open }"
  >
    <button
      class="LangSelect__button"
      type="button"
      :aria-label="ariaLabel"
      aria-haspopup="listbox"
      :aria-expanded="open"
      @click="toggle"
      @keydown="onButtonKeydown"
    >
      <span class="LangSelect__label">{{ currentLabel }}</span>
      <svg class="LangSelect__caret" viewBox="0 0 12 12" aria-hidden="true">
        <path d="M2.75 4.5 6 7.75l3.25-3.25" />
      </svg>
    </button>

    <!--
      菜单 Teleport 到 body：移动端展开面板带 overflow-y: auto，
      菜单留在面板里会被裁掉（实测菜单高 75px、面板可视区只剩 181px，底边直接切断）。
      代价是位置要自己按锚点的视口坐标算 —— 见 positionMenu()。
    -->
    <Teleport to="body">
      <Transition name="lang-pop">
        <ul
          v-if="open"
          ref="menuEl"
          class="LangSelect__menu"
          :style="menuStyle"
          role="listbox"
          :aria-label="ariaLabel"
        >
          <li
            v-for="(locale, index) in locales"
            :key="locale.key"
            class="LangSelect__item"
            :class="{ 'is-selected': locale.key === currentKey, 'is-active': index === activeIndex }"
            role="option"
            :aria-selected="locale.key === currentKey"
            tabindex="-1"
            @click="choose(locale)"
            @keydown="onItemKeydown($event, locale)"
          >
            <span class="LangSelect__item-label">{{ locale.label }}</span>
            <svg
              v-if="locale.key === currentKey"
              class="LangSelect__check"
              viewBox="0 0 14 14"
              aria-hidden="true"
            >
              <path d="M2.6 7.4 5.4 10.2 11.4 3.9" />
            </svg>
          </li>
        </ul>
      </Transition>
    </Teleport>
  </span>
</template>

<style scoped>
.LangSelect {
  position: relative;
  display: inline-flex;
  align-items: center;
  height: 32px;
  padding: 0 8px 0 10px;
  border-radius: 999px;
  /* 与顶栏同一套液态玻璃（移动端面板里是独立控件，所以自带玻璃底） */
  background-color: var(--sn-surface);
  background-image:
    radial-gradient(
      120% 100% at var(--sn-spec-x, 14%) var(--sn-spec-y, -46%),
      var(--sn-glass-spec) 0%,
      transparent 62%
    ),
    var(--sn-glass-sheen);
  backdrop-filter: var(--sn-glass-blur);
  -webkit-backdrop-filter: var(--sn-glass-blur);
  box-shadow: var(--sn-shadow);
}

.LangSelect__button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  font: inherit;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.01em;
  line-height: 1;
  color: var(--sn-text-muted);
  cursor: pointer;
}

.LangSelect__button:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 3px;
  border-radius: 999px;
}

/* 固定下限：避免「简体中文 / English」宽度不同，切换语言时整块控件抖一下 */
.LangSelect__label {
  min-width: 52px;
  text-align: left;
}

.LangSelect__caret {
  width: 12px;
  height: 12px;
  flex: 0 0 auto;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.5;
  stroke-linecap: round;
  stroke-linejoin: round;
  transition: transform 0.24s cubic-bezier(0.22, 1, 0.36, 1);
}

.LangSelect.is-open .LangSelect__caret {
  transform: rotate(180deg);
}

/* ── 下拉面板：和顶栏同一套液态玻璃；Teleport 到 body，所以是 fixed + 自己算坐标 ── */
.LangSelect__menu {
  position: fixed;
  z-index: 60;
  box-sizing: border-box;
  min-width: 132px;
  margin: 0;
  padding: 6px;
  list-style: none;
  border-radius: 16px;
  background-color: var(--sn-sheet-bg);
  background-image:
    radial-gradient(
      120% 100% at var(--sn-spec-x, 14%) var(--sn-spec-y, -46%),
      var(--sn-glass-spec) 0%,
      transparent 62%
    ),
    var(--sn-glass-sheen);
  backdrop-filter: var(--sn-glass-blur);
  -webkit-backdrop-filter: var(--sn-glass-blur);
  box-shadow: var(--sn-shadow-lg);
}

.LangSelect__item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 450;
  line-height: 1.2;
  color: var(--sn-text);
  cursor: pointer;
  transition: background-color 0.16s ease;
  outline: none;
}

.LangSelect__item:hover,
.LangSelect__item.is-active {
  background: var(--sn-hover);
}

.LangSelect__item.is-selected {
  font-weight: 600;
}

.LangSelect__item-label {
  white-space: nowrap;
}

.LangSelect__check {
  width: 14px;
  height: 14px;
  margin-left: auto;
  flex: 0 0 auto;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.6;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* ── 裸样式：嵌在顶栏胶囊内部（去掉玻璃底与外沿，高度对齐胶囊内高 36px） ── */
.LangSelect.is-bare {
  height: 36px;
  padding: 0 6px 0 12px;
  background: transparent;
  background-image: none;
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
  box-shadow: none;
}

.LangSelect.is-bare .LangSelect__button {
  font-size: 13px;
  color: var(--sn-text);
}

/* ── 展开动画 ── */
.lang-pop-enter-active {
  transition: opacity 0.2s ease, transform 0.28s cubic-bezier(0.22, 1, 0.36, 1);
}

.lang-pop-leave-active {
  transition: opacity 0.14s ease, transform 0.16s ease;
}

.lang-pop-enter-from,
.lang-pop-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.97);
}

@media (prefers-reduced-motion: reduce) {
  .lang-pop-enter-active,
  .lang-pop-leave-active,
  .LangSelect__caret {
    transition: none;
  }
}
</style>
