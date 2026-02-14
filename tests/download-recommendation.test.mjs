import test from 'node:test'
import assert from 'node:assert/strict'

import {
  detectSystemProfile,
  getRecommendedCardId,
  getPreferredPlatformTab
} from '../src/lib/download-recommendation.js'

test('detectSystemProfile detects macOS arm64 from userAgentData', () => {
  const profile = detectSystemProfile({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_2) AppleWebKit/537.36',
    platform: 'MacIntel',
    userAgentData: { platform: 'macOS', architecture: 'arm' }
  })

  assert.equal(profile.os, 'macOS')
  assert.equal(profile.arch, 'arm64')
})

test('detectSystemProfile detects macOS x64 from x86_64 userAgent text', () => {
  const profile = detectSystemProfile({
    userAgent: 'Mozilla/5.0 (Macintosh; x86_64 Mac OS X 13_6_1)',
    platform: 'MacIntel'
  })

  assert.equal(profile.os, 'macOS')
  assert.equal(profile.arch, 'x64')
})

test('detectSystemProfile defaults to arm64 for ambiguous macOS UA', () => {
  const profile = detectSystemProfile({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/605.1.15',
    platform: 'MacIntel'
  })

  assert.equal(profile.os, 'macOS')
  assert.equal(profile.arch, 'arm64')
})

test('getRecommendedCardId maps profile to correct card id', () => {
  assert.equal(getRecommendedCardId({ os: 'macOS', arch: 'arm64' }), 'macArm64')
  assert.equal(getRecommendedCardId({ os: 'macOS', arch: 'x64' }), 'macX64')
  assert.equal(getRecommendedCardId({ os: 'Windows', arch: null }), 'windowsX64')
  assert.equal(getRecommendedCardId({ os: 'Android', arch: null }), 'androidArm64')
  assert.equal(getRecommendedCardId({ os: 'Linux', arch: null }), null)
})

test('getPreferredPlatformTab maps profile to tabs', () => {
  assert.equal(getPreferredPlatformTab({ os: 'macOS', arch: 'arm64' }), 'macOS')
  assert.equal(getPreferredPlatformTab({ os: 'Windows', arch: null }), 'Windows')
  assert.equal(getPreferredPlatformTab({ os: 'Android', arch: null }), 'Android')
  assert.equal(getPreferredPlatformTab({ os: null, arch: null }), null)
})
