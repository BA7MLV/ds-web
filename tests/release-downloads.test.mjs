import test from 'node:test'
import assert from 'node:assert/strict'

import { buildDownloadsData } from '../scripts/lib/release-downloads.mjs'

test('buildDownloadsData maps release assets and metadata', () => {
  const release = {
    tag_name: 'v0.9.2',
    published_at: '2026-02-13T16:30:41Z',
    html_url: 'https://github.com/helixnow/deep-student/releases/tag/v0.9.2',
    assets: [
      { name: 'Deep.Student_0.9.2_aarch64.dmg', browser_download_url: 'https://example.com/mac-arm.dmg', size: 11 },
      { name: 'Deep.Student_0.9.2_x64.dmg', browser_download_url: 'https://example.com/mac-x64.dmg', size: 22 },
      { name: 'Deep.Student_0.9.2_x64-setup.exe', browser_download_url: 'https://example.com/win.exe', size: 33 },
      { name: 'Deep.Student_0.9.2_amd64_x86_64.AppImage.sig', browser_download_url: 'https://example.com/a.sig', size: 1 },
      { name: 'Deep.Student_0.9.2_amd64_x86_64.AppImage', browser_download_url: 'https://example.com/linux.AppImage', size: 55 },
      { name: 'Deep.Student_0.9.2_amd64.deb', browser_download_url: 'https://example.com/linux.deb', size: 66 },
      { name: 'Deep.Student-0.9.2-1.x86_64.rpm', browser_download_url: 'https://example.com/linux.rpm', size: 77 },
      { name: 'Deep.Student_0.9.2_arm64.apk', browser_download_url: 'https://example.com/android.apk', size: 44 }
    ]
  }

  const result = buildDownloadsData(release)

  assert.equal(result.version, 'v0.9.2')
  assert.equal(result.publishedAt, '2026-02-13T16:30:41Z')
  assert.equal(result.releaseUrl, 'https://github.com/helixnow/deep-student/releases/tag/v0.9.2')
  assert.deepEqual(result.platforms.macArm64, {
    name: 'Deep.Student_0.9.2_aarch64.dmg',
    url: 'https://example.com/mac-arm.dmg',
    mirrorUrl: 'https://download.deepstudent.cn/releases/v0.9.2/Deep.Student_0.9.2_aarch64.dmg',
    sizeBytes: 11
  })
  assert.deepEqual(result.platforms.windowsX64, {
    name: 'Deep.Student_0.9.2_x64-setup.exe',
    url: 'https://example.com/win.exe',
    mirrorUrl: 'https://download.deepstudent.cn/releases/v0.9.2/Deep.Student_0.9.2_x64-setup.exe',
    sizeBytes: 33
  })
  // 签名文件 .AppImage.sig 排在前面也不能被当成安装包
  assert.deepEqual(result.platforms.linuxAppImage, {
    name: 'Deep.Student_0.9.2_amd64_x86_64.AppImage',
    url: 'https://example.com/linux.AppImage',
    mirrorUrl: 'https://download.deepstudent.cn/releases/v0.9.2/Deep.Student_0.9.2_amd64_x86_64.AppImage',
    sizeBytes: 55
  })
  assert.equal(result.platforms.linuxDeb.name, 'Deep.Student_0.9.2_amd64.deb')
  assert.equal(result.platforms.linuxRpm.name, 'Deep.Student-0.9.2-1.x86_64.rpm')
  assert.equal(
    result.platforms.linuxRpm.mirrorUrl,
    'https://download.deepstudent.cn/releases/v0.9.2/Deep.Student-0.9.2-1.x86_64.rpm'
  )
})

test('buildDownloadsData returns null platform entries when assets are missing', () => {
  const release = {
    tag_name: 'v1.2.3',
    published_at: '2026-02-14T00:00:00Z',
    html_url: 'https://github.com/helixnow/deep-student/releases/tag/v1.2.3',
    assets: []
  }

  const result = buildDownloadsData(release)

  assert.equal(result.version, 'v1.2.3')
  assert.equal(result.platforms.macArm64, null)
  assert.equal(result.platforms.macX64, null)
  assert.equal(result.platforms.windowsX64, null)
  assert.equal(result.platforms.linuxAppImage, null)
  assert.equal(result.platforms.linuxDeb, null)
  assert.equal(result.platforms.linuxRpm, null)
  assert.equal(result.platforms.androidArm64, null)
})
