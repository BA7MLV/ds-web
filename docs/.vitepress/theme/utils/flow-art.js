/**
 * 「使用流程」两张卡的底图（字符画）。
 *
 * `?raw` 把生成器烘焙好的 SVG 读成**标记串**，`StepFlow.vue` 再用 `v-html` 内联进 DOM。
 *
 * 为什么不用 `docs/public` + `<img src>`：
 * `<img>` 里的 SVG 是一份独立文档，`currentColor` 在它自己那儿解析，
 * 页面切深色它不知道 —— 只能回头给元素挂 `filter: invert(1)`，
 * 把写死的近黑反成 #e2e2e0，跟站点深色正文的 #f5f5f7 差着三级。
 * 内联之后墨色归页面管：SVG 里只写 `stroke="currentColor"`，颜色由 CSS 给，
 * 深浅两套自动跟上，也不需要第二份资产。
 *
 * 代价是这几十 kB 的路径数据进了组件所在的那个 chunk（大约 6 kB gzip），
 * 换来的是少两次 `<img>` 请求、且 SSR 阶段就把图形写进 HTML、首屏不闪。
 */
import review from '../assets/flow-review-ascii.svg?raw'
import think from '../assets/flow-think-ascii.svg?raw'

/** 键是消息表里 `steps[].art` 的值 —— 用哪张图由文案自己声明，组件不按下标猜 */
export const FLOW_ART = { think, review }
