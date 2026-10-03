<script setup>
/**
 * Hero 的下载按钮：一颗实心胶囊 —— 左边平台标 + 一句「下载 macOS 版」，
 * 尾部箭头拉开一份版本清单。
 *
 * 清单是手写的，不用原生 `<select>`：系统选择器在桌面端跟站点长得毫无关系（深色下尤其突兀），
 * 而且只能「选中」、要再点一次主按钮才下载。这里每一项本身就是带 `download` 的链接 ——
 * 点下去就开始下载，一步到位；顺带还能右键存为、看一眼包体积。
 *
 * 主按钮只认系统，不报芯片。macOS 的两个包（Apple Silicon / Intel）区别留在清单里就够了：
 * 能自己判的（Client Hints 给了架构）直接判，判不出来的按 aarch64 默认，
 * 想换的人拉开清单自己挑 —— 挑过之后按钮就报挑中的那一个（这时必须带上架构，否则两项重名）。
 *
 * 首屏（含 SSR）不猜设备，一律退回「立即下载 → /download」：服务端没有 navigator，
 * 若在 setup 顶层就按设备算，服务端会渲染成兜底、客户端再变成 Mac 包，水合时两边对不上。
 * 所以整颗按钮等挂载后再收窄；认不出的设备（iPad 的桌面 UA、ARM 版 Linux）就一直留着兜底。
 * 清单同理默认收起 —— 展开态也属于「客户端才知道的事」。
 */
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'
import DlIcon from './DlIcon.vue'
import { useI18n } from '../i18n/index.js'
import { buildRows, formatSize } from '../utils/downloads.js'
import { primaryUrl } from '../utils/download-channel.js'
import { detectPlatform, recommendedDownloadKey } from '../utils/download-device.js'

const { t, locale } = useI18n()

const options = [...buildRows('desktop'), ...buildRows('mobile')]

/** 平台 → 主按钮文案与图标；图标与清单里每一行用的是同一套 */
const PLATFORMS = {
  mac: { label: 'home.hero.downloadMac', icon: 'apple' },
  win: { label: 'home.hero.downloadWin', icon: 'windows' },
  linux: { label: 'home.hero.downloadLinux', icon: 'linux' },
  android: { label: 'home.hero.downloadAndroid', icon: 'android' }
}

/** 安装包的 key 都是 `系统-架构`；认不出平台就退回通用箭头 */
const iconFor = (key) => PLATFORMS[`${key}`.split('-')[0]]?.icon ?? 'download'

const platform = ref('other')   // 认出的系统；认不出就一直是 other
const key = ref('')             // 当前指向的安装包；空串 = 兜底去下载页
const manual = ref(false)       // 清单里手动挑过没有
const open = ref(false)         // 清单展开态
const menuStyle = ref({})       // 展开时按上下剩余空间算出来的落点
let disposed = false

/** 面板与胶囊之间的缝、以及离视口边缘至少留出的距离 */
const GAP = 10
const EDGE = 12

const rootEl = ref(null)
const menuEl = ref(null)
const items = ref([])           // 清单里那几条链接，方向键要按它走

// 安装包的 key 是 `系统-架构`，手动挑过之后系统从 key 上读，图标才会跟着换
const shownPlatform = computed(() => (manual.value ? key.value.split('-')[0] : platform.value))
const icon = computed(() => PLATFORMS[shownPlatform.value]?.icon ?? 'download')
const label = computed(() =>
  manual.value
    ? t(`home.hero.downloadOptions.${key.value}`)
    : t(PLATFORMS[platform.value]?.label ?? 'home.hero.download')
)

const selected = computed(() => options.find((item) => item.key === key.value) ?? null)
// 中文页走国内镜像、英文页走 GitHub，见 download-channel.js
const href = computed(() => (selected.value ? primaryUrl(selected.value.asset, locale.value) : '/download'))
const fileName = computed(() => selected.value?.asset?.name ?? '')

/* ── 清单的开合与键盘操作 ───────────────────────────────────── */

/**
 * 展开时算一次落点。
 *
 * 面板默认朝下开，但 Hero 的按钮离页面底部并不远：窗口矮于 ~660px 时下面塞不下整份清单，
 * 末一行就被视口切掉（560px 高时切掉 45px，Android 那行整个看不见）。
 * 所以下面不够、上面更宽裕就翻到上边开；两边都紧张时按可用高度收窄并允许滚动，
 * 总之不让它出屏幕。
 */
const placeMenu = () => {
  const box = rootEl.value?.getBoundingClientRect?.()
  const panel = menuEl.value
  if (!box || !panel) return

  const below = window.innerHeight - box.bottom - GAP - EDGE
  const above = box.top - GAP - EDGE
  // 用 scrollHeight：这一步可能已经给它压过 max-height，offsetHeight 会变成压过之后的值
  const flip = panel.scrollHeight > below && above > below

  menuStyle.value = flip
    ? { top: 'auto', bottom: `${box.height + GAP}px`, maxHeight: `${Math.max(above, 0)}px` }
    : { top: `${box.height + GAP}px`, bottom: 'auto', maxHeight: `${Math.max(below, 0)}px` }
}

const setOpen = async (next) => {
  open.value = next
  if (!next) return
  await nextTick()
  placeMenu()
}

const toggle = () => setOpen(!open.value)

/** 用键盘拉开：向下的方向键进第一条，向上进最后一条（`edge` 传 -1） */
const openMenu = async (edge = 0) => {
  await setOpen(true)
  const list = items.value
  list[edge === -1 ? list.length - 1 : edge]?.focus()
}

const moveFocus = (step) => {
  const list = items.value
  if (!list.length) return
  const at = list.indexOf(document.activeElement)
  list[(at + step + list.length) % list.length].focus()
}

/** 焦点离开整颗控件就收起：Tab 走人时清单不该继续挂在页面上 */
const onFocusOut = (event) => {
  if (!rootEl.value?.contains(event.relatedTarget)) open.value = false
}

const onPointerDown = (event) => {
  if (open.value && !rootEl.value?.contains(event.target)) open.value = false
}

/** 窗口被拉矮/拉高时重算落点，否则展开着的清单会跑出屏幕 */
const onResize = () => {
  if (open.value) placeMenu()
}

const onKeydown = (event) => {
  if (!open.value) return

  if (event.key === 'Escape') {
    event.preventDefault()
    open.value = false
  } else if (event.key === 'ArrowDown') {
    event.preventDefault()
    moveFocus(1)
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    moveFocus(-1)
  }
}

/** 点某一条：立刻开始下载（由链接自己完成），同时把选择留在按钮上 */
const pick = (item) => {
  manual.value = true
  key.value = item.key
  open.value = false
}

const applyDevice = (hints) => {
  if (disposed || manual.value) return

  const detected = detectPlatform(navigator)
  if (detected === 'other') return

  // 该平台的包没上传成功时同样留兜底 —— 宁可少给一次直下，也不要一个点了必然 404 的按钮
  const row = options.find((item) => item.key === recommendedDownloadKey(navigator, hints))
  if (!row?.asset?.url) {
    // 迟到的架构信息也可能否掉上一步的结果：ARM 版 Linux 上 Chrome 的 UA 照样写 x86_64
    if (hints) {
      platform.value = 'other'
      key.value = ''
    }
    return
  }

  platform.value = detected
  key.value = row.key
}

onMounted(async () => {
  document.addEventListener('pointerdown', onPointerDown)
  document.addEventListener('keydown', onKeydown)
  window.addEventListener('resize', onResize)

  applyDevice()

  try {
    const hints = await navigator.userAgentData?.getHighEntropyValues?.(['architecture'])
    if (hints) applyDevice(hints)
  } catch {
    // 浏览器不给架构信息时保留上一步的结果。
  }
})

onUnmounted(() => {
  disposed = true
  document.removeEventListener('pointerdown', onPointerDown)
  document.removeEventListener('keydown', onKeydown)
  window.removeEventListener('resize', onResize)
})
</script>

<template>
  <div ref="rootEl" class="home-download home-btn-primary" @focusout="onFocusOut">
    <a class="home-download__link" :href="href" :download="fileName || undefined">
      <DlIcon class="home-download__icon" :name="icon" />
      <span>{{ label }}</span>
    </a>

    <button
      v-if="options.length"
      type="button"
      class="home-download__switch"
      :aria-expanded="open"
      aria-haspopup="true"
      :aria-label="t('home.hero.switchDownload')"
      @click="toggle"
      @keydown.down.prevent="openMenu(0)"
      @keydown.up.prevent="openMenu(-1)"
    >
      <svg viewBox="0 0 16 16" aria-hidden="true">
        <path d="m4 6 4 4 4-4" />
      </svg>
    </button>

    <Transition name="hd-menu">
      <ul
        v-if="open"
        ref="menuEl"
        class="home-download__menu"
        role="menu"
        :aria-label="t('home.hero.chooseDownload')"
        :style="menuStyle"
      >
        <li v-for="item in options" :key="item.key" role="none">
          <a
            ref="items"
            class="home-download__item"
            :class="{ 'is-current': item.key === key }"
            role="menuitem"
            :aria-current="item.key === key ? 'true' : undefined"
            :href="primaryUrl(item.asset, locale)"
            :download="item.asset.name || undefined"
            @click="pick(item)"
          >
            <!-- 每行最左：这一份包属于哪个系统。占位固定宽，图标宽窄不一也不会把文字顶歪 -->
            <span class="home-download__item-mark" aria-hidden="true">
              <DlIcon :name="iconFor(item.key)" />
            </span>
            <span class="home-download__item-label">
              {{ t(`home.hero.downloadOptions.${item.key}`) }}
            </span>
            <span class="home-download__item-size">{{ formatSize(item.asset.sizeBytes) }}</span>
          </a>
        </li>
      </ul>
    </Transition>
  </div>
</template>

<style scoped>
.home-download {
  position: relative;
  display: inline-flex;
  align-items: stretch;
  border-radius: 999px;
  transition: background-color 0.2s ease;
}

.home-download__link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px 12px 26px;
  border-radius: 999px 0 0 999px;
  color: inherit;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.5;
  text-decoration: none;
}

/* 图标自带尺寸（见 DlIcon），这里只管它别被压扁 */
.home-download__icon {
  flex: 0 0 auto;
}

.home-download__switch {
  position: relative;
  display: grid;
  place-items: center;
  width: 44px;
  padding: 0;
  border: 0;
  border-radius: 0 999px 999px 0;
  background: none;
  color: inherit;
  cursor: pointer;
}

/* 分隔线用 currentColor 压到 25%，深浅两套按钮上都不用另配颜色 */
.home-download__switch::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  height: 24px;
  transform: translateY(-50%);
  border-left: 1px solid currentColor;
  opacity: 0.25;
}

.home-download__switch svg {
  width: 16px;
  height: 16px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.5;
  stroke-linecap: round;
  stroke-linejoin: round;
  transition: transform 0.16s ease;
}

.home-download__switch[aria-expanded='true'] svg {
  transform: rotate(180deg);
}

/*
 * 面板：绝对定位挂在胶囊左下角（朝上还是朝下由 `placeMenu` 现算，见上面的注释）。
 * 贴左缘而不是右缘：清单是「从这条按钮往右铺开」的读法，且胶囊基本居中，
 * 往右铺在任何宽度下都不会出屏幕（往左贴时窄屏会从左边溢出）。
 *
 * 宽度交给内容（`max-content`）而不是写死一个数：行内文字现在是整行靠左、不留右缘空档，
 * 固定宽度只有两种下场 —— 窄了最长那行撑出横向滚动条（`overflow-y: auto` 会顺带把
 * overflow-x 也变成 auto），宽了每行右边空一片。换了版本名长度或换个系统字体，它自己会跟。
 *
 * 这里的 z-index 只在自己这一行内部生效（.t-stagger-line 是层叠上下文，见 HomePage.vue），
 * 盖住下面那扇演示窗壳靠的是 `.lp-hero__actions-line` 那一层，别在这儿试。
 *
 * 背景用 `--vp-c-bg-elv`（比页面底高一档）而不是 `--vp-c-bg`：面板多半压在 Hero 那扇
 * 深色演示窗上，深色主题下 #1b1b1f 贴在近黑的屏幕上几乎看不出边界，高一档才立得住。
 * 描边同理 —— 原来那圈 1px 黑色阴影在深色下等于没画，换成主题自己的分隔色，两套都看得见。
 */
.home-download__menu {
  position: absolute;
  top: calc(100% + 10px);
  left: 0;
  z-index: 20;
  display: grid;
  gap: 2px;
  width: max-content;
  min-width: 240px;
  max-width: calc(100vw - 32px);
  margin: 0;
  padding: 6px;
  overflow-y: auto;
  overscroll-behavior: contain;
  list-style: none;
  border-radius: 16px;
  background-color: var(--vp-c-bg-elv);
  box-shadow: 0 12px 32px rgb(0 0 0 / 16%), 0 0 0 1px var(--vp-c-divider);
  color: var(--vp-c-text-1);
}

.home-download__item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 12px;
  border-radius: 10px;
  color: inherit;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  text-decoration: none;
  white-space: nowrap;
}

.home-download__item:hover,
.home-download__item:focus-visible {
  background-color: color-mix(in srgb, currentColor 14%, transparent);
  outline: none;
}

/*
 * 「正指着的那一条」用常驻底色标，不用勾也不用品牌色：勾已经被最左边那格平台标占掉了，
 * 而品牌色在这套主题里浅色 #1f2937、深色 #f3f4f6，跟正文色几乎重合，涂上去只等于加粗。
 * 底色用 currentColor 调透明度，浅色下是压深、深色下是提亮，两套都不用另配颜色。
 */
.home-download__item.is-current {
  background-color: color-mix(in srgb, currentColor 8%, transparent);
}

.home-download__item-mark {
  flex: 0 0 18px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.home-download__item-label {
  flex: 0 0 auto;
}

.home-download__item.is-current .home-download__item-label {
  font-weight: 500;
}

/*
 * 体积紧跟版本名，整行一起靠左 —— 不再给它 `margin-left: auto` 推到右缘。
 * 代价是四行的体积各自长短、右边缘不齐；换来的是「一行读下来」的顺，读清单的人
 * 本来就是要挑一个包，不需要把体积当成一列去比对。
 */
.home-download__item-size {
  font-size: 12px;
  color: var(--vp-c-text-3);
}

.hd-menu-enter-active,
.hd-menu-leave-active {
  transition: opacity 0.16s ease, transform 0.16s ease;
}

.hd-menu-enter-from,
.hd-menu-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

@media (prefers-reduced-motion: reduce) {
  .hd-menu-enter-active,
  .hd-menu-leave-active,
  .home-download__switch svg {
    transition: none;
  }
}

.home-download__link:focus-visible,
.home-download__switch:focus-visible {
  outline: 2px solid var(--vp-c-brand-1);
  outline-offset: 4px;
}
</style>
