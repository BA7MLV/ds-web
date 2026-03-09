import assert from 'node:assert/strict'
import test from 'node:test'

import { getNextTopNavHiddenState } from '../src/lib/top-nav-visibility.js'

test('顶部区域始终显示导航栏', () => {
  const nextHidden = getNextTopNavHiddenState({
    previousY: 40,
    currentY: 12,
    hidden: true,
    threshold: 8,
    topOffset: 24,
  })

  assert.equal(nextHidden, false)
})

test('向下滚动超过阈值时隐藏导航栏', () => {
  const nextHidden = getNextTopNavHiddenState({
    previousY: 120,
    currentY: 160,
    hidden: false,
    threshold: 8,
    topOffset: 24,
  })

  assert.equal(nextHidden, true)
})

test('向上滚动超过阈值时显示导航栏', () => {
  const nextHidden = getNextTopNavHiddenState({
    previousY: 160,
    currentY: 110,
    hidden: true,
    threshold: 8,
    topOffset: 24,
  })

  assert.equal(nextHidden, false)
})

test('滚动位移未达到阈值时保持当前状态', () => {
  const keepHidden = getNextTopNavHiddenState({
    previousY: 200,
    currentY: 205,
    hidden: true,
    threshold: 8,
    topOffset: 24,
  })

  const keepShown = getNextTopNavHiddenState({
    previousY: 200,
    currentY: 195,
    hidden: false,
    threshold: 8,
    topOffset: 24,
  })

  assert.equal(keepHidden, true)
  assert.equal(keepShown, false)
})

test('下载页贴顶导航可在阈值与顶部偏移下复用同一显隐判定', () => {
  const hiddenOnScrollDown = getNextTopNavHiddenState({
    previousY: 90,
    currentY: 128,
    hidden: false,
    threshold: 8,
    topOffset: 24,
  })

  const shownOnScrollUp = getNextTopNavHiddenState({
    previousY: 128,
    currentY: 82,
    hidden: true,
    threshold: 8,
    topOffset: 24,
  })

  assert.equal(hiddenOnScrollDown, true)
  assert.equal(shownOnScrollUp, false)
})
