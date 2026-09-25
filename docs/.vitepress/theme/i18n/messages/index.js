import zhCN from './zh-CN.js'
import enUS from './en-US.js'

/**
 * 默认语言，也是找不到翻译时的回退目标；与 config.js 里 locales.root.lang 一致。
 * 放在这里而不是 i18n/index.js：本文件不依赖 vue / vitepress，
 * tests/i18n-messages.test.mjs 能直接用 Node 跑结构校验。
 */
export const FALLBACK_LOCALE = 'zh-CN'

/**
 * 语言表：key 用 BCP-47 语言标签。
 *
 * 为什么用 lang 而不是 config.js 里 locales 的 key（root / en）：
 * VitePress 会把每个 locale 的 `lang` 写到 useData().lang（也就是 <html lang>），
 * 直接拿它查表即可，不需要再去解析路径前缀，也不会出现 '/energy/' 误匹配 '/en/' 这类问题。
 *
 * 新增语言：config.js 的 locales 里加一项（带 lang），再在下面补一份消息表。
 */
export default {
  'zh-CN': zhCN,
  'en-US': enUS
}
