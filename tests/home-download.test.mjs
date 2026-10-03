import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import { computed, nextTick, ref } from 'vue'
import { parse } from '@vue/compiler-sfc'
import { detectPlatform, recommendedDownloadKey } from '../docs/.vitepress/theme/utils/download-device.js'
import { backupUrl, primaryUrl } from '../docs/.vitepress/theme/utils/download-channel.js'

const mac = { userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', platform: 'MacIntel' }

const linux = { userAgent: 'Mozilla/5.0 (X11; Linux x86_64)', platform: 'Linux x86_64' }

test('download defaults match supported devices without treating iOS as Mac or ARM Linux as x86', () => {
  const cases = [
    [mac, 'mac-arm'],
    [{ userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }, 'win-x64'],
    [{ userAgent: 'Mozilla/5.0 (Linux; Android 15; Pixel 9)' }, 'android-arm64'],
    [linux, 'linux-appimage'],
    [{ userAgent: 'Mozilla/5.0 (X11; Linux aarch64)' }, ''],
    [{ userAgent: 'Mozilla/5.0 (X11; Linux i686; rv:128.0)' }, ''],
    [{ userAgent: 'Mozilla/5.0 (X11; CrOS x86_64 14541.0.0)' }, ''],
    [{ userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)' }, ''],
    [{ userAgent: 'Mozilla/5.0 (iPad; CPU OS 18_0 like Mac OS X)' }, ''],
    [{ ...mac, maxTouchPoints: 5 }, ''],
    [{}, ''],
  ]
  for (const [device, expected] of cases) {
    assert.equal(recommendedDownloadKey(device), expected, JSON.stringify(device))
  }
  assert.equal(recommendedDownloadKey(mac, { architecture: 'x86' }), 'mac-x64')
  assert.equal(recommendedDownloadKey(mac, { architecture: 'arm' }), 'mac-arm')
  // Chrome 的 UA 在 ARM Linux 上也写 x86_64，只有 Client Hints 说得准
  assert.equal(recommendedDownloadKey(linux, { architecture: 'arm' }), '')
  assert.equal(detectPlatform(linux), 'linux')
  assert.equal(detectPlatform({}), 'other')
})

// Execute the component's actual setup to cover delayed browser hints and missing release assets.
const source = parse(readFileSync(
  new URL('../docs/.vitepress/theme/components/HomeDownload.vue', import.meta.url), 'utf8'
)).descriptor.scriptSetup.content.replace(/^import .*\n/gm, '')

const setup = (
  navigator,
  keys = ['mac-arm', 'mac-x64', 'win-x64', 'android-arm64'],
  viewport = 900,
  { locale = 'zh-CN', mirror = false } = {}
) => {
  let mount
  let unmount
  // 组件在挂载时往 document / window 上挂监听（点外面、按 Esc、窗口改尺寸），
  // 这里收下来既能防崩也方便测
  const on = new Map()
  const document = {
    addEventListener: (type, handler) => on.set(type, handler),
    removeEventListener: (type) => on.delete(type),
  }
  const onWindow = new Map()
  const window = {
    innerHeight: viewport,
    addEventListener: (type, handler) => onWindow.set(type, handler),
    removeEventListener: (type) => onWindow.delete(type),
  }
  const context = vm.createContext({
    navigator, document, window, computed, nextTick, ref, detectPlatform, recommendedDownloadKey, primaryUrl,
    useI18n: () => ({ t: (key) => (key === 'links.download' ? '/download' : key), locale: { value: locale } }),
    buildRows: (group) => group === 'desktop'
      ? keys.map((key) => ({ key,
        asset: {
          name: `${key}.bin`,
          url: `https://files.test/${key}`,
          mirrorUrl: mirror ? `https://mirror.test/${key}` : null
        } })) : [],
    onMounted: (callback) => { mount = callback },
    onUnmounted: (callback) => { unmount = callback },
  })
  const api = vm.runInContext(
    `(function () { ${source}; return { key, label, icon, iconFor, href, fileName, open, toggle, pick, placeMenu, menuStyle, rootEl, menuEl } })()`,
    context
  )
  return { api, mount, unmount, on, onWindow }
}

test('the version list is hand-written, not a native select', () => {
  const { descriptor } = parse(readFileSync(
    new URL('../docs/.vitepress/theme/components/HomeDownload.vue', import.meta.url), 'utf8'
  ))
  // 原生 select 一出现就说明退回了浏览器默认 UI（系统选择器跟站点长得毫无关系）
  assert.doesNotMatch(descriptor.template.content, /<select/)
  assert.match(descriptor.template.content, /<ul[\s\S]*?role="menu"/)
  // 每一条自己就是链接：点下去即开始下载，不用「先选中、再点主按钮」两步走
  assert.match(descriptor.template.content, /<a[\s\S]*?role="menuitem"[\s\S]*?:download=/)
})

test('each row carries the icon of the system its package belongs to', async () => {
  const env = setup(mac)
  // 每行最左边那格按安装包的 key 认系统；认不出的 key 才退回通用箭头
  assert.deepEqual(
    ['mac-arm', 'mac-x64', 'win-x64', 'linux-deb', 'android-arm64', '', 'ios-arm64'].map(env.api.iconFor),
    ['apple', 'apple', 'windows', 'linux', 'android', 'download', 'download']
  )
})

test('SSR stays on the download page and mount points the button at the device package', async () => {
  const env = setup(mac)
  assert.deepEqual(
    [env.api.key.value, env.api.label.value, env.api.icon.value, env.api.href.value],
    ['', 'home.hero.download', 'download', '/download']
  )
  await env.mount()
  // 主按钮只说系统，不说芯片：Mac 两种包的差别留给下拉
  assert.deepEqual(
    [env.api.key.value, env.api.label.value, env.api.icon.value, env.api.href.value, env.api.fileName.value],
    ['mac-arm', 'home.hero.downloadMac', 'apple', 'https://files.test/mac-arm', 'mac-arm.bin']
  )
})

test('Windows and Android get their own wording without any architecture on the button', async () => {
  const win = setup({ userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' })
  await win.mount()
  assert.deepEqual(
    [win.api.label.value, win.api.icon.value, win.api.href.value],
    ['home.hero.downloadWin', 'windows', 'https://files.test/win-x64']
  )

  const android = setup({ userAgent: 'Mozilla/5.0 (Linux; Android 15; Pixel 9)' })
  await android.mount()
  assert.deepEqual(
    [android.api.label.value, android.api.icon.value, android.api.href.value],
    ['home.hero.downloadAndroid', 'android', 'https://files.test/android-arm64']
  )
})

test('Chinese pages download from the mirror first, other languages from GitHub', async () => {
  const zh = setup(mac, undefined, 900, { mirror: true })
  await zh.mount()
  assert.equal(zh.api.href.value, 'https://mirror.test/mac-arm')

  const en = setup(mac, undefined, 900, { locale: 'en-US', mirror: true })
  await en.mount()
  assert.equal(en.api.href.value, 'https://files.test/mac-arm')

  // 这一版没传镜像：中文页也只能走 GitHub，不能给出空链接
  const noMirror = setup(mac)
  await noMirror.mount()
  assert.equal(noMirror.api.href.value, 'https://files.test/mac-arm')
})

test('the backup channel is the other copy of the same file, never a duplicate', () => {
  const asset = { url: 'https://github.test/a.dmg', mirrorUrl: 'https://mirror.test/a.dmg' }
  assert.deepEqual(
    [primaryUrl(asset, 'zh-CN'), backupUrl(asset, 'zh-CN')],
    ['https://mirror.test/a.dmg', 'https://github.test/a.dmg']
  )
  assert.deepEqual(
    [primaryUrl(asset, 'en-US'), backupUrl(asset, 'en-US')],
    ['https://github.test/a.dmg', 'https://mirror.test/a.dmg']
  )
  const githubOnly = { url: 'https://github.test/a.dmg', mirrorUrl: '' }
  assert.deepEqual([primaryUrl(githubOnly, 'zh-CN'), backupUrl(githubOnly, 'zh-CN')], [githubOnly.url, ''])
  assert.equal(primaryUrl(null, 'zh-CN'), '')
})

test('Linux gets the AppImage by default and keeps deb / rpm in the list', async () => {
  const keys = ['mac-arm', 'win-x64', 'linux-appimage', 'linux-deb', 'linux-rpm']
  const env = setup(linux, keys)
  await env.mount()
  assert.deepEqual(
    [env.api.label.value, env.api.icon.value, env.api.href.value, env.api.fileName.value],
    ['home.hero.downloadLinux', 'linux', 'https://files.test/linux-appimage', 'linux-appimage.bin']
  )

  env.api.pick({ key: 'linux-rpm' })
  assert.deepEqual(
    [env.api.label.value, env.api.icon.value, env.api.href.value],
    ['home.hero.downloadOptions.linux-rpm', 'linux', 'https://files.test/linux-rpm']
  )

  // UA 写着 x86_64、架构信息却报 arm：撤回 AppImage，退回下载页
  const arm = setup({ ...linux, userAgentData: { getHighEntropyValues: async () => ({ architecture: 'arm' }) } }, keys)
  await arm.mount()
  assert.deepEqual(
    [arm.api.href.value, arm.api.label.value, arm.api.icon.value],
    ['/download', 'home.hero.download', 'download']
  )
})

test('the list opens on demand and picking an item downloads that exact package', async () => {
  const env = setup(mac)
  await env.mount()
  assert.equal(env.api.open.value, false)

  env.api.toggle()
  assert.equal(env.api.open.value, true)

  // 点一条即开始下载，同时把「正指着的那一份」留在按钮上：手动挑过必须报出是哪一个
  env.api.pick({ key: 'win-x64' })
  assert.deepEqual(
    [env.api.open.value, env.api.label.value, env.api.icon.value, env.api.href.value],
    [false, 'home.hero.downloadOptions.win-x64', 'windows', 'https://files.test/win-x64']
  )

  env.api.toggle()
  env.api.toggle()
  assert.equal(env.api.open.value, false)
})

test('the list opens below, or above when the window cannot hold it under the button', async () => {
  // 胶囊在 431–479 这一段，清单自然高 174
  const box = { top: 431, bottom: 479, height: 48 }
  const stub = (env) => {
    env.api.rootEl.value = { getBoundingClientRect: () => box }
    env.api.menuEl.value = { scrollHeight: 174 }
    env.api.placeMenu()
    return { ...env.api.menuStyle.value }
  }

  // 窗口够高：照常朝下，下面剩多少就允许长多高
  assert.deepEqual(stub(setup(mac, undefined, 900)), {
    top: '58px', bottom: 'auto', maxHeight: '399px'
  })

  // 窗口 560 高：下面只剩 59px，装不下整份清单，翻到上面开（上面有 409px）
  assert.deepEqual(stub(setup(mac, undefined, 560)), {
    top: 'auto', bottom: '58px', maxHeight: '409px'
  })

  // 胶囊已经贴到视口下沿：下面算出负数也不能变成负高度
  const edge = setup(mac, undefined, 700)
  edge.api.rootEl.value = { getBoundingClientRect: () => ({ top: 690, bottom: 738, height: 48 }) }
  edge.api.menuEl.value = { scrollHeight: 174 }
  edge.api.placeMenu()
  assert.equal(edge.api.menuStyle.value.maxHeight, '668px')
})

test('Escape, a click outside and unmount all close or release the list', async () => {
  const env = setup(mac)
  await env.mount()
  assert.deepEqual([...env.on.keys()].sort(), ['keydown', 'pointerdown'])
  assert.deepEqual([...env.onWindow.keys()], ['resize'])

  const escape = { key: 'Escape', preventDefault: () => {} }
  env.api.toggle()
  await Promise.resolve()
  env.on.get('keydown')(escape)
  assert.equal(env.api.open.value, false)

  await env.api.toggle()
  env.on.get('pointerdown')({ target: {} })
  assert.equal(env.api.open.value, false)

  // 方向键在清单内部走：清单没渲染出来时也不能炸
  await env.api.toggle()
  env.on.get('keydown')({ key: 'ArrowDown', preventDefault: () => {} })
  assert.equal(env.api.open.value, true)

  env.unmount()
  assert.equal(env.on.size, 0)
  assert.equal(env.onWindow.size, 0)
})

test('picking from the list wins over architecture hints that arrive later', async () => {
  let resolve
  const hints = new Promise((done) => { resolve = done })
  const env = setup({ ...mac, userAgentData: { getHighEntropyValues: () => hints } })
  const mounted = env.mount()
  env.api.pick({ key: 'mac-x64' })
  resolve({ architecture: 'arm' })
  await mounted
  // 用户挑的是 Intel 包，迟到的架构信息不许把它改回 aarch64
  assert.deepEqual(
    [env.api.key.value, env.api.label.value, env.api.icon.value, env.api.href.value],
    ['mac-x64', 'home.hero.downloadOptions.mac-x64', 'apple', 'https://files.test/mac-x64']
  )
})

test('late architecture hints refine the default but never land after unmount', async () => {
  for (const action of ['resolve', 'unmount']) {
    let resolve
    const hints = new Promise((done) => { resolve = done })
    const env = setup({ ...mac, userAgentData: { getHighEntropyValues: () => hints } })
    const mounted = env.mount()
    assert.equal(env.api.href.value, 'https://files.test/mac-arm')
    if (action === 'unmount') env.unmount()
    resolve({ architecture: 'x86' })
    await mounted
    const expected = { resolve: 'https://files.test/mac-x64', unmount: 'https://files.test/mac-arm' }
    assert.equal(env.api.href.value, expected[action])
  }
})

test('denied hints, a missing package or an unknown system all keep the download-page fallback', async () => {
  const denied = setup({
    ...mac,
    userAgentData: { getHighEntropyValues: async () => { throw new Error('Denied') } },
  })
  await denied.mount()
  assert.equal(denied.api.href.value, 'https://files.test/mac-arm')

  const missing = setup(mac, ['win-x64'])
  await missing.mount()
  assert.deepEqual(
    [missing.api.href.value, missing.api.label.value, missing.api.key.value],
    ['/download', 'home.hero.download', '']
  )

  const unknown = setup({ userAgent: 'Mozilla/5.0 (X11; CrOS x86_64 14541.0.0)' })
  await unknown.mount()
  assert.deepEqual(
    [unknown.api.href.value, unknown.api.label.value],
    ['/download', 'home.hero.download']
  )

  // 认得出是 Linux，但这一版没传 Linux 包：同样留在下载页，不能派发别的系统的包
  const linuxWithoutPackage = setup(linux)
  await linuxWithoutPackage.mount()
  assert.deepEqual(
    [linuxWithoutPackage.api.href.value, linuxWithoutPackage.api.label.value],
    ['/download', 'home.hero.download']
  )
})
