/**
 * 下载页的数据整形。
 *
 * 页面（`docs/download.md`）与三个下载组件共用这一份：平台行的排法、大小与日期的读法、
 * 当前设备属于哪一类，都只在这里定义一次，免得几处各写一套然后慢慢漂移。
 *
 * 数据本身来自 `.vitepress/data/downloads.json`，由 `scripts/sync-release-downloads.mjs`
 * 在构建时从 GitHub Releases 覆盖。**页面里不要写死版本号与文件名**，一律读这里。
 */

import data from '../../data/downloads.json'
import { detectPlatform, recommendedDownloadKey } from './download-device.js'

export { detectPlatform } from './download-device.js'

export const release = data

const platforms = data?.platforms ?? {}

/** 安装包体积，一位小数；拿不到就返回空串（由调用方决定要不要占位） */
export const formatSize = (sizeBytes) => {
  if (!sizeBytes || Number.isNaN(sizeBytes)) return ''

  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * 发布日期。
 *
 * 时区写死 `Asia/Shanghai`：默认行为会跟着运行环境的本地时区走，
 * 服务端构建（Node）与浏览器可能不在同一时区，同一个时间戳会渲染出两种字符串，
 * 客户端水合时就会报不一致。发布日期是站点给出的口径，固定住反而更稳。
 */
export const formatDate = (isoDate) => {
  if (!isoDate) return ''

  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return ''

  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Shanghai'
  }).format(date)
}

/**
 * 一行 = 一个可以直接下载的安装包。
 *
 * `asset` 在数据里缺失（该产物没上传成功）时整行由 `buildRows()` 过滤掉 ——
 * 宁可少一行，也不要留一个点下去必然 404 的按钮。
 */
const row = (key, os, arch, note, asset) => ({ key, os, arch, note, asset })

const DESKTOP_ROWS = [
  row('mac-arm', 'macOS', 'Apple Silicon', 'M 系列芯片的 Mac', platforms.macArm64),
  row('mac-x64', 'macOS', 'Intel', 'Intel 芯片的 Mac', platforms.macX64),
  row('win-x64', 'Windows', 'x64', 'Windows 11，或 Windows 10 22H2 及以上', platforms.windowsX64),
  row('linux-appimage', 'Linux', 'AppImage', '各发行版通用，加上执行权限即可运行', platforms.linuxAppImage),
  row('linux-deb', 'Linux', 'deb', 'Debian、Ubuntu 及其衍生版', platforms.linuxDeb),
  row('linux-rpm', 'Linux', 'rpm', 'Fedora、openSUSE 等', platforms.linuxRpm)
]

const MOBILE_ROWS = [
  row('android-arm64', 'Android', 'ARM64', '下载 APK 直接安装，不需要应用商店', platforms.androidArm64)
]

const GROUPS = { desktop: DESKTOP_ROWS, mobile: MOBILE_ROWS }

/** 取某一组里真正有安装包的行 */
export const buildRows = (group) => (GROUPS[group] ?? []).filter((item) => Boolean(item?.asset?.url))

/**
 * 推荐位要展示什么。
 *
 * 返回一个主按钮 + 可选的次按钮：macOS 因为分不出架构，两个都给；
 * 认不出设备时退化成「去发布页自己挑」。
 *
 * 只给按钮，不给「检测到 macOS」这类说明文案 —— 认出的类别写在 `key` 里就好，
 * 界面上再念一遍设备名对用户没有任何新增信息。
 */
const action = (key, text, asset) => ({
  key,
  text,
  url: asset?.url ?? data?.releaseUrl ?? '',
  mirrorUrl: asset?.mirrorUrl ?? '',
  name: asset?.name ?? '',
  sizeText: asset ? formatSize(asset.sizeBytes) : ''
})

export const buildRecommendation = () => {
  const platform = detectPlatform()

  const macArm = platforms.macArm64
  const macX64 = platforms.macX64
  const win = platforms.windowsX64
  const appImage = platforms.linuxAppImage
  const deb = platforms.linuxDeb
  const android = platforms.androidArm64

  if (platform === 'mac' && (macArm || macX64)) {
    return {
      key: 'mac',
      primary: macArm ? action('mac-arm', '下载 Apple Silicon DMG', macArm) : null,
      secondary: macX64 ? action('mac-x64', 'Intel 版', macX64) : null
    }
  }

  if (platform === 'win' && win) {
    return {
      key: 'win',
      primary: action('win-x64', '下载 EXE 安装程序', win),
      secondary: null
    }
  }

  // ARM / 32 位 Linux 没有对应的包，recommendedDownloadKey 会给空值，落到下面的兜底
  if (platform === 'linux' && recommendedDownloadKey(globalThis.navigator) && (appImage || deb)) {
    return {
      key: 'linux',
      primary: appImage ? action('linux-appimage', '下载 AppImage', appImage) : null,
      secondary: deb ? action('linux-deb', 'deb 安装包', deb) : null
    }
  }

  // 没有 iOS 安装包：推荐位改成「在电脑上下载」，由 DownloadPick 给分享 / 复制链接
  if (platform === 'ios') {
    return { key: 'ios', primary: null, secondary: null }
  }

  if (platform === 'android' && android) {
    return {
      key: 'android',
      primary: action('android-arm64', '下载 APK 安装包', android),
      secondary: null
    }
  }

  return {
    key: 'other',
    primary: action('release-all', '前往 GitHub Releases', null),
    secondary: null
  }
}
