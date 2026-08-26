import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  clamp01,
  getScrollProgress,
  getTranslateX,
  getActiveIndex,
} from '../src/lib/horizontal-scroll-progress.js'

test('clamp01 clamps to 0..1', () => {
  assert.equal(clamp01(-1), 0)
  assert.equal(clamp01(0.5), 0.5)
  assert.equal(clamp01(2), 1)
})

test('getScrollProgress maps container travel to 0..1', () => {
  // containerTop=1000, containerHeight=3000, viewport=1000
  // scrollable = 3000-1000 = 2000
  assert.equal(getScrollProgress({ scrollY: 1000, containerTop: 1000, containerHeight: 3000, viewportHeight: 1000 }), 0)
  assert.equal(getScrollProgress({ scrollY: 2000, containerTop: 1000, containerHeight: 3000, viewportHeight: 1000 }), 0.5)
  assert.equal(getScrollProgress({ scrollY: 3000, containerTop: 1000, containerHeight: 3000, viewportHeight: 1000 }), 1)
})

test('getTranslateX maps progress to panel offsets', () => {
  assert.equal(getTranslateX({ progress: 0, panelCount: 3, viewportWidth: 1000 }), 0)
  assert.equal(getTranslateX({ progress: 1, panelCount: 3, viewportWidth: 1000 }), -2000)
})

test('getActiveIndex picks nearest panel', () => {
  assert.equal(getActiveIndex({ progress: 0, panelCount: 3 }), 0)
  assert.equal(getActiveIndex({ progress: 0.5, panelCount: 3 }), 1)
  assert.equal(getActiveIndex({ progress: 1, panelCount: 3 }), 2)
})
