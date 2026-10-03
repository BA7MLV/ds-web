/**
 * 安装包走哪条通道。
 *
 * 每个安装包都有两份同名文件：GitHub Releases 直链（`asset.url`）和 Cloudflare R2 镜像
 * （`asset.mirrorUrl`，即 download.deepstudent.cn）。国内直连 GitHub 慢、常断，所以中文页
 * 默认走镜像、GitHub 退为备用；其它语言反过来。
 *
 * 镜像不会比页面晚到：主仓库发版流水线先传 R2、再把 Release 公开、最后才触发官网重建
 * （reusable-publish.yml），构建时同步到的每个安装包，镜像上都已经有了。
 *
 * 这里不读 downloads.json，只收安装包对象 —— 组件和 `node --test` 都能直接用。
 */
const MIRROR_FIRST_LOCALES = new Set(['zh-CN'])

/** 主按钮指向哪里；没有镜像地址时退回 GitHub */
export const primaryUrl = (asset, locale) =>
  (MIRROR_FIRST_LOCALES.has(locale) && asset?.mirrorUrl) || asset?.url || ''

/** 另一条通道；与主地址相同（比如没有镜像）时给空串，界面上就不再摆第二个按钮 */
export const backupUrl = (asset, locale) => {
  const primary = primaryUrl(asset, locale)
  const backup = primary === asset?.url ? asset?.mirrorUrl : asset?.url
  return backup && backup !== primary ? backup : ''
}
