/**
 * 「使用流程」两张卡的底图：有序抖动图案生成器。
 *
 * 管线与图元都在 `scripts/lib/dither.mjs`（那里也写着「为什么不拿位图去抖动」
 * 与「为什么画布尺寸按显示宽度定」）。这里只剩构图：两张卡各画一个单主体符号。
 *
 * 用法：node scripts/gen-flow-dither.mjs
 * 产物：docs/public/flow-think-dither.svg、docs/public/flow-review-dither.svg
 */
import {
  arcRing,
  bake,
  canvas,
  circle,
  clamp01,
  emit,
  paint,
  polygon,
  rampEdges,
  rrect,
  seg,
  smoothstep,
  wrap,
} from './lib/dither.mjs'

/**
 * 边缘溶解。只在**左边和顶边**拉缓坡，右边和底边不做处理 —— 图案的右侧、底侧是要「裁进来」的。
 * .pair__shot 定位在 right:-6% / bottom:-8%，画布右边和底边本来就落在卡片外、
 * 被卡片的 overflow 切掉，所以那儿留下硬边才是对的（旧的截图就是被这么裁的）。
 * 左上两边的缓坡则是给文字让路：网点由密到疏自己化掉，图案才像从卡面里长出来，
 * 而不是贴了一张带直角的图 —— hero 的星空层收尾用的也是同一招（sf-fade）。
 */
const ramp = rampEdges({ left: 0.1, top: 0.11 })

/** 由弧、短竖和圆点组成的问号；用几何形状而不是字体，跨平台生成结果才一致。 */
const questionMark = (f, cv, cx, cy, scale = 1, gray = 0.86) => {
  paint(f, arcRing(cx, cy - 14 * scale, 18 * scale, 5 * scale, 190, 455), gray, cv)
  paint(f, seg(cx + 14 * scale, cy - 4 * scale, cx, cy + 9 * scale, 5 * scale), gray, cv)
  paint(f, seg(cx, cy + 8 * scale, cx, cy + 15 * scale, 5 * scale), gray, cv)
  paint(f, circle(cx, cy + 27 * scale, 3.5 * scale), gray, cv)
}

/* ══════════════════════════════════════════════════════════════════════
 * ① 想明白 · 围绕你的材料对话
 *
 * 只画一个完整的问答气泡，不再拼接材料页、连线、坐标点等多个对象。
 * 气泡内部由左下向右上逐渐加密，问号是唯一的视觉焦点：单主体，但仍保留
 * “围绕材料提问”的语义和有序抖动本身的质感。
 *
 * 画布 280×176（140×88 格）。这个尺寸不是随手取的：1440 视口下窄卡 356px 宽，
 * .pair__shot 取 78% ≈ 278px —— 画布按显示宽度定，网点就不会被二次缩放糊掉。
 * ══════════════════════════════════════════════════════════════════════ */
const think = () => {
  const cv = canvas(280, 176)
  const f = cv.field

  const bubbleTone = (x, y) => {
    const diagonal = clamp01((x - 28) / 224 * 0.7 + (138 - y) / 116 * 0.3)
    return 0.1 + 0.42 * smoothstep(0, 1, diagonal)
  }

  /* 气泡的圆角主体与尾巴共享同一密度场，视觉上只读成一个完整符号。 */
  paint(f, rrect(28, 20, 224, 122, 44), bubbleTone, cv)
  paint(f, polygon([[72, 128], [50, 164], [104, 138]]), bubbleTone, cv)
  questionMark(f, cv, 154, 76, 1.45, 0.92)

  return wrap(cv, bake(f, cv, ramp))
}

/* ══════════════════════════════════════════════════════════════════════
 * ② 记得住 · 变成能复习的东西
 *
 * 只保留一个循环复习符号：一条有方向的回环与中心对勾组成一个整体。
 * 不再画卡片堆、知识节点和进度点；“反复回来并最终掌握”由一个符号说完。
 *
 * 画布 544×340（272×170 格）：1440 视口下宽卡 712px，.pair__shot 取 78% ≈ 555px。
 * 格密度与 ① 一致 —— 两张图案的网点一样大，只是这一张画幅更宽，容得下更多细节。
 * ══════════════════════════════════════════════════════════════════════ */
const review = () => {
  const cv = canvas(544, 340)
  const f = cv.field

  const loopTone = (x, y) => {
    const dx = (x - 272) / 150
    const dy = (y - 170) / 150
    return 0.46 + 0.28 * clamp01((dx - dy + 2) / 4)
  }

  /* 粗回环与箭头连成单个轮廓；密度轻微变化，让大符号仍有 Dithering 层次。 */
  paint(f, arcRing(272, 170, 116, 22, 42, 338), loopTone, cv)
  paint(f, polygon([[366, 94], [418, 92], [390, 136]]), 0.82, cv)

  /* 对勾是回环内部唯一内容，代表复习完成和掌握。 */
  paint(f, seg(220, 174, 260, 216, 18), 0.82, cv)
  paint(f, seg(260, 216, 334, 126, 18), 0.82, cv)

  return wrap(cv, bake(f, cv, ramp))
}

emit([
  ['flow-think-dither.svg', think()],
  ['flow-review-dither.svg', review()],
])
