import { computed } from 'vue'
import { useData } from 'vitepress'
import messages, { FALLBACK_LOCALE } from './messages/index.js'

export { FALLBACK_LOCALE, messages }

/** 按点路径取值：'home.hero.title' → messages['zh-CN'].home.hero.title */
const lookup = (source, path) =>
  path.split('.').reduce((acc, segment) => (acc == null ? undefined : acc[segment]), source)

/** 把 '{name}' 换成参数；缺参数时原样保留，方便一眼看出漏传 */
const interpolate = (text, params) =>
  text.replace(/\{(\w+)\}/g, (raw, name) => (params?.[name] == null ? raw : String(params[name])))

const resolve = (locale, path) =>
  lookup(messages[locale], path) ?? lookup(messages[FALLBACK_LOCALE], path)

/**
 * 主题内的取词入口。
 *
 * · locale：当前页面语言（useData().lang，即 <html lang>）
 * · t(path, params)：取一段文案，支持 {param} 插值；取不到或不是字符串时返回 path 本身，
 *   这样漏翻会在页面上直接显形，而不是静默变成空白。
 * · tm(path)：取结构化消息（数组 / 对象），用于 v-for 渲染列表类内容。
 *
 * 用法（script setup 里）：
 *   const { t, tm } = useI18n()
 *   const steps = computed(() => tm('home.flow.steps'))
 */
export const useI18n = () => {
  const { lang } = useData()

  const locale = computed(() => (messages[lang.value] ? lang.value : FALLBACK_LOCALE))

  const t = (path, params) => {
    const raw = resolve(locale.value, path)
    if (typeof raw !== 'string') return path
    return interpolate(raw, params)
  }

  const tm = (path) => resolve(locale.value, path) ?? []

  return { locale, t, tm }
}
