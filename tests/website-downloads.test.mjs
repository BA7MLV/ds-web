import test from 'node:test'
import assert from 'node:assert/strict'

import { buildWebsiteDownloads } from '../src/lib/website-downloads.js'

test('buildWebsiteDownloads maps each architecture asset into independent cards', () => {
  const cards = buildWebsiteDownloads(
    {
      version: 'v0.9.2',
      releaseUrl: 'https://github.com/000haoji/deep-student/releases/tag/v0.9.2',
      platforms: {
        macArm64: { name: 'mac-arm.dmg', url: 'https://example.com/mac-arm.dmg', sizeBytes: 2100 },
        macX64: { name: 'mac-x64.dmg', url: 'https://example.com/mac-x64.dmg', sizeBytes: 4200 },
        windowsX64: { name: 'win.exe', url: 'https://example.com/win.exe', sizeBytes: 6300 },
        androidArm64: { name: 'android.apk', url: 'https://example.com/android.apk', sizeBytes: 8400 }
      }
    },
    {
      macArmChannel: 'Apple Silicon',
      macX64Channel: 'Intel',
      windowsChannel: 'Windows x64',
      androidChannel: 'Android ARM64',
      fallbackLabel: '查看全部版本',
      unknownSize: '--',
      macArmRequirements: 'macOS 13+ (Apple Silicon)',
      macX64Requirements: 'macOS 13+ (Intel)',
      windowsRequirements: 'Windows 11',
      androidRequirements: 'Android 10+',
      macArmDescription: 'mac arm desc',
      macX64Description: 'mac x64 desc',
      windowsDescription: 'win desc',
      androidDescription: 'android desc',
      macArmCta: '下载 DMG (ARM)',
      macX64Cta: '下载 DMG (Intel)',
      windowsCta: '下载 EXE',
      androidCta: '下载 APK',
      fallbackCta: '查看 Releases'
    }
  )

  assert.equal(cards.length, 4)
  assert.equal(cards[0].id, 'macArm64')
  assert.equal(cards[0].ctaHref, 'https://example.com/mac-arm.dmg')
  assert.equal(cards[0].size, '2.1 KB')
  assert.equal(cards[1].id, 'macX64')
  assert.equal(cards[1].ctaHref, 'https://example.com/mac-x64.dmg')
  assert.equal(cards[2].id, 'windowsX64')
  assert.equal(cards[2].ctaHref, 'https://example.com/win.exe')
  assert.equal(cards[3].id, 'androidArm64')
  assert.equal(cards[3].ctaHref, 'https://example.com/android.apk')
  assert.equal(cards[0].version, 'v0.9.2')
})

test('buildWebsiteDownloads keeps available cards and does not collapse architectures', () => {
  const cards = buildWebsiteDownloads(
    {
      version: 'v0.9.2',
      releaseUrl: 'https://github.com/000haoji/deep-student/releases/tag/v0.9.2',
      platforms: {
        macArm64: { name: 'mac-arm.dmg', url: 'https://example.com/mac-arm.dmg', sizeBytes: 1024 },
        macX64: null,
        windowsX64: { name: 'win.exe', url: 'https://example.com/win.exe', sizeBytes: 2048 },
        androidArm64: null
      }
    },
    {
      macArmChannel: 'Apple Silicon',
      macX64Channel: 'Intel',
      windowsChannel: 'Windows x64',
      androidChannel: 'Android ARM64',
      fallbackLabel: '查看全部版本',
      unknownSize: '--',
      macArmRequirements: 'macOS 13+ (Apple Silicon)',
      macX64Requirements: 'macOS 13+ (Intel)',
      windowsRequirements: 'Windows 11',
      androidRequirements: 'Android 10+',
      macArmDescription: 'mac arm desc',
      macX64Description: 'mac x64 desc',
      windowsDescription: 'win desc',
      androidDescription: 'android desc',
      macArmCta: '下载 DMG (ARM)',
      macX64Cta: '下载 DMG (Intel)',
      windowsCta: '下载 EXE',
      androidCta: '下载 APK',
      fallbackCta: '查看 Releases'
    }
  )

  assert.equal(cards.length, 2)
  assert.equal(cards[0].id, 'macArm64')
  assert.equal(cards[1].id, 'windowsX64')
})

test('buildWebsiteDownloads returns a single fallback card when no assets exist', () => {
  const cards = buildWebsiteDownloads(
    {
      version: 'v0.9.2',
      releaseUrl: 'https://github.com/000haoji/deep-student/releases/tag/v0.9.2',
      platforms: {
        macArm64: null,
        macX64: null,
        windowsX64: null,
        androidArm64: null
      }
    },
    {
      macArmChannel: 'Apple Silicon',
      macX64Channel: 'Intel',
      windowsChannel: 'Windows x64',
      androidChannel: 'Android ARM64',
      fallbackLabel: '查看全部版本',
      unknownSize: '--',
      macArmRequirements: 'macOS 13+ (Apple Silicon)',
      macX64Requirements: 'macOS 13+ (Intel)',
      windowsRequirements: 'Windows 11',
      androidRequirements: 'Android 10+',
      macArmDescription: 'mac arm desc',
      macX64Description: 'mac x64 desc',
      windowsDescription: 'win desc',
      androidDescription: 'android desc',
      macArmCta: '下载 DMG (ARM)',
      macX64Cta: '下载 DMG (Intel)',
      windowsCta: '下载 EXE',
      androidCta: '下载 APK',
      fallbackCta: '查看 Releases'
    }
  )

  assert.equal(cards.length, 1)
  assert.equal(cards[0].id, 'allReleases')
  assert.equal(cards[0].ctaHref, 'https://github.com/000haoji/deep-student/releases/tag/v0.9.2')
})
