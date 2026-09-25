<script setup>
import { computed, ref } from 'vue'
import { useData } from 'vitepress'
import { useI18n } from '../i18n/index.js'
import { SOCIAL_ICONS } from '../utils/social-icons.js'

/**
 * 落地页页脚，按 Apple 收成三样东西：
 * 品牌字、一条发丝线、底下一行（左版权 / 右一排短链接，竖线隔开）。
 *
 * 整条铺浅灰，和上面的白底分开 —— 不再用线去切内容。
 * 产品、资源那两列不再放这里：下载、文档、支持已经在顶栏。
 * 右边只留四枚图标。群号和邮箱地址写出来比版权行还长，
 * 名称留在 aria-label 与 title 里，悬停才露。
 * 图标本身在 utils/social-icons.js，那里还记着出处与许可。
 *
 * QQ 与小红书两枚额外挂一张二维码（qr 字段）：
 * 群号 310134919 和小红书主页链接对普通用户没用 —— 手抄一串数字再去搜，
 * 不如扫一下。GitHub 和邮箱没有「码」可言，保持纯链接。
 *
 * 只在落地页渲染（docs/index.md 与 docs/en/index.md 都设了 footer: false 关掉默认页脚），
 * 文档页继续用 VitePress 自带页脚。
 */
const { lang } = useData()
const { t } = useI18n()

/** 联系方式：目标、图标与二维码是结构信息，与语言无关；名称走 i18n 的 footer.social.* */
const LINKS = [
  { key: 'github', href: 'https://github.com/helixnow/deep-student' },
  { key: 'qq', href: 'https://qm.qq.com/q/1lTUkKSaB6', qr: '/qr-qq-group.png' },
  {
    key: 'xiaohongshu',
    href: 'https://www.xiaohongshu.com/user/profile/648898bb0000000012037f8f',
    qr: '/qr-xiaohongshu.png'
  },
  { key: 'email', href: 'mailto:support@deepstudent.cn' }
]

const links = computed(() =>
  LINKS.map((item) => ({
    ...item,
    // 图标是 <svg> 的内部标记串（小红书那枚是外框 + 挖空两笔），交给模板 v-html 注入
    markup: SOCIAL_ICONS[item.key],
    // 画面上只有图标，这个字符串同时当无障碍名和悬停提示
    label: t(`footer.social.${item.key}`)
  }))
)

// mailto: 不算外链，新开标签页没有意义
const isExternal = (href) => /^https?:/.test(href)

/*
 * 触屏没有 hover，码必须点一下才看得到。
 * 但点一下原本是要跳走的 —— 直接放行的话，用户永远见不到码，
 * 所以触屏上的第一次点击先拦下来亮码，跳转交给浮层里的「打开链接」。
 *
 * 这里刻意不缓存 matchMedia 的结果：它只在点击时读一次，
 * 省下的那点开销换不来「窗口从触屏切到桌面后判断失效」这类怪 bug 的成本。
 */
const openKey = ref(null)

const isPointerHover = () =>
  typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches

const onLinkClick = (item, event) => {
  // 桌面端悬停已经能看到码，点击照常跳转；没有码的两枚更不该拦
  if (!item.qr || isPointerHover()) return

  event.preventDefault()
  // 再点一次同一枚 = 收起，省得用户找不到关闭的地方
  openKey.value = openKey.value === item.key ? null : item.key
}

/*
 * 鼠标跟随：卡片只做轻微偏移，不 1:1 跟手。
 * 页脚贴着视口右下角，跟满会直接把卡片甩出屏幕 ——
 * 所以水平限 ±26px、垂直只给 ±10px：卡片往上展开的空间本来就不多，
 * 垂直偏移大了会盖住图标本身。
 */
const FOLLOW_SENSITIVITY = 0.38
const FOLLOW_MAX_X = 26
const FOLLOW_MAX_Y = 10

// mousemove 每秒能来几十次，querySelector 别每次都跑
const followCache = new WeakMap()

const getFollow = (item) => {
  let follow = followCache.get(item)
  if (!follow) {
    follow = item.querySelector('.lp-qr__follow')
    if (follow) followCache.set(item, follow)
  }
  return follow
}

const clamp = (value, max) => Math.max(-max, Math.min(max, value))

const onItemMove = (event) => {
  const follow = getFollow(event.currentTarget)
  if (!follow) return

  const rect = event.currentTarget.getBoundingClientRect()
  const dx = clamp((event.clientX - rect.left - rect.width / 2) * FOLLOW_SENSITIVITY, FOLLOW_MAX_X)
  const dy = clamp((event.clientY - rect.top - rect.height / 2) * FOLLOW_SENSITIVITY, FOLLOW_MAX_Y)

  follow.style.setProperty('--dx', `${dx}px`)
  follow.style.setProperty('--dy', `${dy}px`)
}

const onItemLeave = (event) => {
  const follow = getFollow(event.currentTarget)
  if (!follow) return

  follow.style.setProperty('--dx', '0px')
  follow.style.setProperty('--dy', '0px')
}
</script>

<template>
  <footer class="lp-footer" :lang="lang">
    <div class="lp-wrap lp-footer__inner">
      <a class="lp-footer__brand" href="/">DeepStudent</a>

      <div class="lp-footer__bottom">
        <span>{{ t('footer.copyright') }}</span>
        <ul class="lp-footer__links">
          <li
            v-for="item in links"
            :key="item.key"
            class="lp-footer__item"
            :class="{ 'lp-footer__item--has-qr': !!item.qr, 'is-open': openKey === item.key }"
            @mousemove="onItemMove"
            @mouseleave="onItemLeave"
          >
            <!-- 触屏遮罩：点空白处收起。桌面端不显示（hover 移开就收了） -->
            <span v-if="item.qr" class="lp-qr__scrim" @click="openKey = null" />

            <a
              :href="item.href"
              :target="isExternal(item.href) ? '_blank' : undefined"
              :rel="isExternal(item.href) ? 'noopener noreferrer' : undefined"
              :aria-label="item.label"
              :title="item.label"
              @click="onLinkClick(item, $event)"
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                focusable="false"
                v-html="item.markup"
              />
            </a>

            <!--
              二维码浮层。三层是为把「平移」和「缩放」拆开：
              anchor 钉在图标中心当原点，follow 只吃鼠标偏移，
              card 自己负责显隐缩放 —— 两条 transition 曲线不一样，合成一个会互相拖。
              位置与动效全在 custom.css 的 .lp-qr* 里，这里只管结构。
            -->
            <span v-if="item.qr" class="lp-qr">
              <span class="lp-qr__follow" :data-follow="item.key">
                <span class="lp-qr__card">
                  <img class="lp-qr__img" :src="item.qr" :alt="t(`footer.qrAlt.${item.key}`)" />
                  <span class="lp-qr__hint">{{ t(`footer.qrHint.${item.key}`) }}</span>
                  <!--
                    触屏专用：拦下跳转后总得留个出口。
                    浮层挂在 <li> 上、和图标那枚 <a> 是兄弟节点，不是它的子孙 ——
                    正是为了这里能合法地再放一枚 <a>，嵌套链接是非法 HTML。
                  -->
                  <a
                    class="lp-qr__open"
                    :href="item.href"
                    target="_blank"
                    rel="noopener noreferrer"
                    >{{ t('footer.qrOpen') }}</a
                  >
                </span>
              </span>
            </span>
          </li>
        </ul>
      </div>
    </div>
  </footer>
</template>
