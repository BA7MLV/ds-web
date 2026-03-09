import assert from 'node:assert/strict'
import test from 'node:test'

import {
  getLocaleSliderLabelClassName,
  getLocaleSliderThumbClassName,
  getLocaleSliderThumbStyle,
  getLocaleSliderTrackClassName,
} from '../src/lib/locale-slider-ui.js'

test('getLocaleSliderTrackClassName 为紧凑模式提供更稳的轨道容器', () => {
  const className = getLocaleSliderTrackClassName({ compact: true })

  assert.ok(className.includes('overflow-hidden'))
  assert.ok(className.includes('h-9'))
  assert.ok(className.includes('p-0.5'))
  assert.ok(className.includes('before:border-[color:var(--apple-soft-line)]'))
})

test('getLocaleSliderThumbClassName 强化激活滑块边界', () => {
  const className = getLocaleSliderThumbClassName()

  assert.ok(className.includes('left-0.5'))
  assert.ok(className.includes('bg-[color:var(--apple-surface-elevated)]'))
  assert.ok(className.includes('border-[color:var(--apple-soft-line)]'))
})

test('getLocaleSliderThumbStyle 按选中项计算滑块尺寸与位移', () => {
  assert.deepEqual(getLocaleSliderThumbStyle(2), {
    width: 'calc((100% - 0.25rem) / 3)',
    transform: 'translateX(200%)',
  })
})

test('getLocaleSliderLabelClassName 为未选中项提供悬停和键盘焦点反馈', () => {
  const className = getLocaleSliderLabelClassName({ compact: true, checked: false })

  assert.ok(className.includes('peer-focus-visible:ring-2'))
  assert.ok(className.includes('hover:text-[color:var(--apple-ink-secondary)]'))
  assert.ok(className.includes('text-[color:var(--apple-muted)]'))
})

test('getLocaleSliderLabelClassName 为选中项使用主文本色', () => {
  const className = getLocaleSliderLabelClassName({ compact: false, checked: true })

  assert.ok(className.includes('text-[13px]'))
  assert.ok(className.includes('text-[color:var(--apple-ink)]'))
})
