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
    sizeBytes: 11
  })
  assert.deepEqual(result.platforms.windowsX64, {
    name: 'Deep.Student_0.9.2_x64-setup.exe',
    url: 'https://example.com/win.exe',
    sizeBytes: 33
  })
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
  assert.equal(result.platforms.androidArm64, null)
})
