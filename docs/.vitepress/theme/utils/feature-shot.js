/**
 * 首页真实界面截图（scripts/gen-features-live.mjs 产出的 docs/public/features/<name>-light|dark.webp）。
 */
export const featureShot = (name, dark) => `/features/${name}-${dark ? 'dark' : 'light'}.webp`

/**
 * 每张截图取景框的 CSS 尺寸，截出来是它的 2 倍图。功能区六扇窗都是 592 × 416；
 * 「使用流程」两张卡按卡片另定：窄卡按手机宽度截，宽卡的高度按标题下面剩的地方定。
 * 生成器按它截，组件按它占宽高比，测试按它核对图片尺寸 —— 改尺寸只改这一处。
 */
const SIZES = {
  'flow-think': { width: 320, height: 336 },
  'flow-review': { width: 592, height: 304 }
}
export const shotSize = (name) => SIZES[name] || { width: 592, height: 416 }

/** 轮播切到别的场景前先把截图拉进缓存，切过去时不用等网络；只取当前主题那一套 */
export const warmFeatureShots = (names, dark) => {
  for (const name of names) {
    const image = new Image()
    image.decoding = 'async'
    image.src = featureShot(name, dark)
  }
}
