<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useI18n } from '../i18n/index.js'
import { track } from '../lib/analytics.js'
import { afterPageLoad, observeNearViewport } from '../lib/deferred-work.js'
import { warmFeatureShots } from '../utils/feature-shot.js'
import AppShell from './AppShell.vue'
import FeatureShot from './FeatureShot.vue'
import HeroStarfield from './HeroStarfield.vue'
import HomeDownload from './HomeDownload.vue'
import StepFlow from './StepFlow.vue'

const { t, tm, locale } = useI18n()

const GITHUB_REPO = 'helixnow/deep-student'
const GITHUB_URL = `https://github.com/${GITHUB_REPO}`
const STARS_CACHE_KEY = 'ds-gh-stars'
const STARS_CACHE_TTL = 30 * 60 * 1000

/** Hero section：星空底图的滚动进度基准 */
const heroEl = ref(null)
/** 演示窗壳：品牌水印的淡出基准（上沿这条线之前必须淡尽） */
const demoEl = ref(null)
const featuresEl = ref(null)
let cancelStars = () => {}
let cancelShotWarmup = () => {}
let stopFeatureObserver = () => {}
let starsController = null
let starsTimeout = 0

/* ── GitHub Star 数（带会话缓存，避免触发限流） ── */
const stars = ref(null)

const formatStars = (value) => {
  if (value < 1000) return String(value)
  const k = value / 1000
  return `${k >= 10 ? Math.round(k) : Math.round(k * 10) / 10}k`
}

const starsLabel = computed(() =>
  stars.value == null
    ? t('home.stars.idle')
    : t('home.stars.count', { count: formatStars(stars.value) })
)

const readStarsCache = () => {
  try {
    const raw = sessionStorage.getItem(STARS_CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (typeof parsed?.count !== 'number') return null
    if (Date.now() - parsed.at > STARS_CACHE_TTL) return null
    return parsed.count
  } catch {
    return null
  }
}

const fetchStars = async () => {
  const cached = readStarsCache()
  if (cached != null) {
    stars.value = cached
    return
  }

  try {
    starsController = new AbortController()
    starsTimeout = window.setTimeout(() => starsController?.abort(), 8000)
    const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}`, {
      headers: { Accept: 'application/vnd.github+json' },
      signal: starsController.signal,
    })
    if (!response.ok) return
    const data = await response.json()
    if (starsController.signal.aborted) return
    if (typeof data?.stargazers_count !== 'number') return
    stars.value = data.stargazers_count
    try {
      sessionStorage.setItem(
        STARS_CACHE_KEY,
        JSON.stringify({ count: data.stargazers_count, at: Date.now() })
      )
    } catch {
      /* 隐私模式下 sessionStorage 不可用，忽略 */
    }
  } catch {
    /* 离线或限流：保持「Star on GitHub」 */
  } finally {
    clearTimeout(starsTimeout)
  }
}

/* ── 功能场景 tabs（文案在 i18n/messages/<lang>.js） ── */
const scenes = computed(() => tm('home.features.scenes'))

/*
 * 每个场景是一张真实截图（scripts/gen-features-live.mjs 产出，20–60 KB），切过去才取的话会先空一下。
 * 功能区接近视口后，再等主页面加载完成、空闲时预取其余场景当前主题那一套；省流量和慢速网络下仅按需加载。
 */
const warmSceneShots = () => {
  const connection = navigator.connection
  if (connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType || '')) return
  cancelShotWarmup = afterPageLoad(() => {
    const others = scenes.value.map((scene) => scene.art).filter((art) => art !== currentScene.value.art)
    warmFeatureShots(others, document.documentElement.classList.contains('dark'))
  })
}

const activeScene = ref(0)
const displayedScene = ref(0)
const currentScene = computed(() => scenes.value[displayedScene.value])

/**
 * 飞出飞入的方向：1 = 新卡从右边来，-1 = 反向。
 * 只写进 --fc-dir，由 CSS 用 calc() 决定位移的正负 —— 同一套 <Transition> 类
 * 就能服务两个方向，不必写「下一个 / 上一个」四组类名。
 */
const direction = ref(1)

/*
 * 切场景 = 整张卡飞出飞入，动画交给模板里的 <Transition>：
 * activeScene 立刻变（圆点马上给反馈），displayedScene 换掉卡的 key，
 * out 完再 in，中间的时序由 CSS 的 --fc-in-dur / --fc-out-dur 控制。
 */
const selectScene = (index) => {
  if (index === activeScene.value) return
  direction.value = index > activeScene.value ? 1 : -1
  activeScene.value = index
  displayedScene.value = index
}

// 左右箭头：首尾相接（最后一个再往后回到第一个）
const stepScene = (delta) => {
  const total = scenes.value.length
  if (!total) return
  // 方向直接取 delta：从最后一张点「下一个」会绕回第一张，方向照样是向右
  direction.value = delta
  const next = (activeScene.value + delta + total) % total
  activeScene.value = next
  displayedScene.value = next
}

/* ── 隐私与数据：发丝线堆叠 ── */
const privacy = computed(() => tm('home.privacy.items'))

/*
 * 用户评价：真实素材还没补齐，先整块隐藏 —— 把 SHOW_VOICES 改回 true 即可恢复。
 * i18n 里的占位条目故意留着：各语言的 key 必须严格对齐（tests/i18n-messages.test.mjs），
 * 删掉就得连改两份消息表，素材到位时还要照原样写回来，不如只关渲染。
 */
const SHOW_VOICES = false
const quotes = computed(() => tm('home.voices.items'))

/* ── 常见问题（原文摘自 docs/A-Q.md） ── */
const faqs = computed(() => tm('home.faq.items'))

const openFaq = ref(0)
const toggleFaq = (index) => {
  openFaq.value = openFaq.value === index ? -1 : index
}

onMounted(() => {
  const cached = readStarsCache()
  if (cached != null) stars.value = cached
  else cancelStars = afterPageLoad(fetchStars, { delay: 2200 })

  stopFeatureObserver = observeNearViewport(featuresEl.value, (near) => {
    if (!near) return
    stopFeatureObserver()
    warmSceneShots()
  }, 360)
})

onUnmounted(() => {
  cancelStars()
  cancelShotWarmup()
  stopFeatureObserver()
  starsController?.abort()
  clearTimeout(starsTimeout)
})
</script>

<template>
  <!-- 星空底图：fixed 层，挂在 .home-apple 之外，才能落在页面内容之下、顶栏之下 -->
  <HeroStarfield :anchor="heroEl" :blocker="demoEl" />

  <!-- 负 margin 抵消 VPHome 自带的 margin-bottom，让最后一个区块与页脚衔接 -->
  <div class="home-apple -mb-24 md:-mb-32">
    <!-- ① 首屏：整宽居中 -->
    <section ref="heroEl" class="lp-hero overflow-hidden">
      <!-- 标题后的柔光：压住身后的星点，让大字有落脚点（深浅色各一套） -->
      <div class="lp-hero__glow" aria-hidden="true"></div>
      <div
        class="t-stagger is-shown lp-wrap pb-16 pt-14 text-center md:pb-20 md:pt-20"
      >
        <div class="t-stagger-line t-stagger-line--1">
          <a
            class="lp-hero__gh"
            :href="GITHUB_URL"
            target="_blank"
            rel="noopener noreferrer"
            :aria-label="starsLabel"
          >
            <svg class="lp-hero__gh-icon" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path
                d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z"
              />
            </svg>
            <span>{{ starsLabel }}</span>
            <span class="lp-hero__gh-arrow" aria-hidden="true">→</span>
          </a>
        </div>

        <h1 class="t-stagger-line t-stagger-line--2 lp-hero__title">
          {{ t('home.hero.title') }}
        </h1>

        <p class="t-stagger-line t-stagger-line--3 lp-hero__lede">
          <template v-for="(line, index) in tm('home.hero.lede')" :key="index">
            <br v-if="index" class="sm:hidden" /><span>{{ line }}</span>
          </template>
        </p>

        <div class="t-stagger-line t-stagger-line--4 lp-hero__actions-line">
          <div class="lp-hero__actions">
            <HomeDownload />
            <a
              href="/start"
              class="home-link lp-hero__more"
              @click="track('quickstart', { from: 'hero', locale })"
            >
              {{ t('home.hero.quickStart') }}<span aria-hidden="true"> →</span>
            </a>
          </div>
        </div>

        <div class="t-stagger-line t-stagger-line--5">
          <div ref="demoEl" class="lp-hero__demo">
            <!-- 壳内自带真实界面截图；实时演示在页面就绪后自动载入。 -->
            <AppShell />
          </div>
        </div>
      </div>
    </section>

    <!-- ② 想明白 / 记得住：不对称双卡，点 + 打开整页浮层（见 StepFlow.vue） -->
    <StepFlow />

    <!-- ③ 功能展示：一张轮播卡（左文案 / 右真实界面截图），卡下圆点 + 左右箭头 -->
    <section id="features" ref="featuresEl" class="lp-block">
      <div class="lp-wrap">
        <div class="lp-head lp-head--center">
          <h2 class="lp-title">{{ t('home.features.title') }}</h2>
          <p class="lp-lede">{{ t('home.features.lede') }}</p>
        </div>

        <div
          id="scene-panel"
          class="lp-fstage"
          :style="{ '--fc-dir': direction }"
          role="tabpanel"
          :aria-labelledby="`scene-tab-${activeScene}`"
        >
          <!-- 切场景 = 整张卡飞出飞入（out-in）；卡片内部不再各自动 -->
          <Transition name="fcard">
            <div :key="displayedScene" class="lp-fcard">
              <!-- 左半：文案 -->
              <div class="lp-fcard__body">
                <h3 class="lp-fcard__title">{{ currentScene.title }}</h3>
                <p class="lp-fcard__lead">{{ currentScene.lead }}</p>
                <p class="lp-fcard__desc">{{ currentScene.desc }}</p>
                <a :href="currentScene.link" class="home-link lp-fcard__link t-learn">
                  {{ t('home.features.more') }}
                  <span class="t-learn-chevron" aria-hidden="true">
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor"
                      stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                      <path class="t-learn-arm t-learn-arm-top" d="M6 4L10 8" />
                      <path class="t-learn-arm t-learn-arm-bot" d="M10 8L6 12" />
                    </svg>
                  </span>
                </a>
              </div>

              <!-- 右半：真实界面截图 -->
              <div class="lp-fcard__stage">
                <FeatureShot class="lp-fcard__shot" :name="currentScene.art" :alt="currentScene.alt" />
              </div>
            </div>
          </Transition>
        </div>

        <!-- 圆点即 tab：语义仍是 tablist / tabpanel，只是控件从文字胶囊换成了点 -->
        <div class="lp-fnav">
          <div class="lp-fdots" role="tablist" :aria-label="t('home.features.tabsLabel')">
            <button
              v-for="(scene, index) in scenes"
              :id="`scene-tab-${index}`"
              :key="scene.tab"
              type="button"
              role="tab"
              aria-controls="scene-panel"
              :aria-selected="activeScene === index"
              :aria-label="t('home.features.dot', { index: index + 1, name: scene.tab })"
              class="lp-fdot"
              @click="selectScene(index)"
            />
          </div>

          <div class="lp-farrows">
            <button
              type="button"
              class="lp-farrow"
              :aria-label="t('home.features.prev')"
              @click="stepScene(-1)"
            >
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
                <path d="M10 3.5 5.5 8l4.5 4.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              class="lp-farrow"
              :aria-label="t('home.features.next')"
              @click="stepScene(1)"
            >
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
                <path d="M6 3.5 10.5 8 6 12.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- ④ 隐私与数据：5fr / 7fr -->
    <section id="privacy" class="lp-block">
      <div class="lp-wrap">
        <div class="lp-split">
          <div>
            <h2 class="lp-title">{{ t('home.privacy.title') }}</h2>
            <p class="lp-lede">{{ t('home.privacy.lede') }}</p>
          </div>
          <ul class="lp-stack">
            <li v-for="item in privacy" :key="item.title" class="lp-stack__item">
              <h3 class="lp-col__title">{{ item.title }}</h3>
              <p class="lp-col__desc">{{ item.desc }}</p>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- ⑤ 用户评价：素材补齐前整块隐藏，开关见脚本里的 SHOW_VOICES -->
    <section v-if="SHOW_VOICES" id="voices" class="lp-block">
      <div class="lp-wrap">
        <div class="lp-head lp-head--center">
          <h2 class="lp-title">{{ t('home.voices.title') }}</h2>
        </div>
        <div class="lp-quotes">
          <figure v-for="(quote, index) in quotes" :key="index" class="lp-quote">
            <div class="lp-quote__head">
              <span class="lp-quote__avatar" aria-hidden="true">{{ quote.handle.slice(1, 2) }}</span>
              <span class="lp-quote__handle">{{ quote.handle }}</span>
            </div>
            <blockquote class="lp-quote__text">{{ quote.text }}</blockquote>
          </figure>
        </div>
      </div>
    </section>

    <!-- ⑥ 常见问题：胶囊折叠条 -->
    <section id="faq" class="lp-block">
      <div class="lp-wrap">
        <div class="lp-head lp-head--center">
          <h2 class="lp-title">{{ t('home.faq.title') }}</h2>
        </div>
        <div class="lp-cap">
          <div
            v-for="(faq, index) in faqs"
            :key="faq.q"
            class="lp-cap__item"
            :data-open="openFaq === index"
          >
            <h3>
              <button
                class="lp-cap__btn"
                type="button"
                :aria-expanded="openFaq === index"
                @click="toggleFaq(index)"
              >
                <span>{{ faq.q }}</span>
                <svg
                  class="lp-cap__chev"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                  aria-hidden="true"
                >
                  <path d="M3.5 6l4.5 4.5L12.5 6" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>
            </h3>
            <div class="lp-cap__panel">
              <div class="lp-cap__inner">
                <p class="lp-cap__answer">{{ faq.a }}</p>
              </div>
            </div>
          </div>
        </div>
        <p class="lp-faq__more">
          {{ t('home.faq.more') }}<a :href="t('links.support')" class="home-link">{{ t('home.faq.moreLink') }}</a>
        </p>
      </div>
    </section>
  </div>
</template>

<style scoped>
/*
 * 首页内容整体抬到星空层（.sf，fixed + z-index: 1）之上，否则定位元素会盖住
 * 后续 section 的静态文本；顶栏（z-index: 30）仍在两者之上。
 */
.home-apple {
  position: relative;
  z-index: 2;
}

.lp-hero {
  position: relative;
}

/*
 * 标题后的柔光。
 * z-index: -1 让它落在 .home-apple（z-index: 2）内部内容之下、星空层（z-index: 1）之上 ——
 * 正好夹在星点和文字中间，等于给大字垫了一层薄雾。
 *
 * 颜色取页面底色而不是写死白色：亮色下白盖白本来就看不见，深色下若照抄一套
 * 「黑色光晕」，大字背后会多出一块明显的黑斑。用底色后，两种主题都只做同一件事
 * ——把大字身后的星点抹掉，不改页面本身的明暗。
 */
.lp-hero__glow {
  position: absolute;
  z-index: -1;
  top: -14%;
  left: 50%;
  width: min(1180px, 132%);
  aspect-ratio: 1.55 / 1;
  transform: translateX(-50%);
  pointer-events: none;
  background: radial-gradient(
    ellipse at 50% 44%,
    color-mix(in srgb, var(--vp-c-bg, #ffffff) 96%, transparent) 0%,
    color-mix(in srgb, var(--vp-c-bg, #ffffff) 72%, transparent) 30%,
    color-mix(in srgb, var(--vp-c-bg, #ffffff) 0%, transparent) 70%
  );
}

.lp-hero__gh {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 500;
  line-height: 1;
  letter-spacing: 0.01em;
  color: var(--lp-text-2);
  text-decoration: none;
  transition: color 0.2s ease;
}

.lp-hero__gh:hover {
  color: var(--lp-text);
}

.lp-hero__gh-icon {
  width: 15px;
  height: 15px;
}

.lp-hero__gh-arrow {
  transition: transform 0.28s var(--lp-ease);
}

.lp-hero__gh:hover .lp-hero__gh-arrow {
  transform: translateX(3px);
}

.lp-hero__title {
  margin: 28px 0 0;
  /*
   * 标题从「两行短句」变成「一行十言」，改用一个随视口缩放的单一字号：
   * min(4.5rem, 8.5vw) 让 10 个字在 320px 以上都刚好落在
   * min(100% - 3rem, 1080px) 的容器里，不需要再手写断点。
   */
  font-size: min(4.5rem, 8.5vw);
  font-weight: 600;
  line-height: 1.12;
  letter-spacing: -0.03em;
  text-wrap: balance;
  color: var(--lp-text);
}

.lp-hero__lede {
  margin: 26px auto 0;
  max-width: 32em;
  font-size: 1.0625rem;
  line-height: 1.7;
  color: var(--lp-text-2);
}

/* 主行动：整页只有 Hero 与底部收尾各一颗实心按钮，顶栏那颗已降到中性文字 */
.lp-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem 2rem;
  align-items: center;
  justify-content: center;
  margin-top: 2.25rem;
}

/*
 * 下载按钮的版本清单要盖住下面那扇演示窗壳。
 * 每个 `.t-stagger-line` 都带 transform / filter，各自成层叠上下文 —— 面板在自己的层里
 * 把 z-index 抬到多高都出不了这一行，只能在这里把整行抬到演示行（--5）之上：
 * 两行都是 z-index: auto 时按 DOM 顺序画，演示行在后，所以面板必被压在底下。
 */
.lp-hero__actions-line {
  position: relative;
  z-index: 2;
}

/* 次级行动：纯文字，不抢主按钮的注意力 */
.lp-hero__more {
  font-size: 0.9375rem;
  font-weight: 500;
  text-decoration: none;
}

.lp-hero__more:hover {
  text-decoration: underline;
}

.lp-hero__demo {
  width: min(100%, 1020px);
  margin-top: 3.5rem;
  margin-inline: auto;
}

/*
 * 手机上故意露出更宽的两侧页面区域：演示仍然可交互，但用户也很容易
 * 在壳外起手滚动落地页，不会被一台几乎占满横向空间的手机「锁」在 Hero。
 */
@media (max-width: 639px) {
  .lp-hero__demo {
    width: min(100%, 320px);
  }
}

@media (min-width: 640px) {
  .lp-hero__lede {
    font-size: 1.25rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .lp-hero__gh-arrow {
    transition: none;
  }
}
</style>
