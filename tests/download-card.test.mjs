import assert from 'node:assert/strict'
import test from 'node:test'

import { getDownloadCardClassName } from '../src/lib/download-card.js'

test('getDownloadCardClassName 为推荐卡片保留轻量边框强调', () => {
  const className = getDownloadCardClassName(true)

  assert.ok(className.includes('relative'))
  assert.ok(className.includes('border-[1.5px]'))
  assert.ok(className.includes('border-[color:var(--apple-accent-line)]'))
  assert.ok(className.includes('shadow-[var(--apple-shadow-md)]'))
})

test('getDownloadCardClassName 不为普通卡片添加额外强调', () => {
  const className = getDownloadCardClassName(false)

  assert.equal(className.includes('relative'), false)
  assert.equal(className.includes('border-[1.5px]'), false)
  assert.equal(className.includes('border-[color:var(--apple-accent-line)]'), false)
  assert.equal(className.includes('shadow-[var(--apple-shadow-md)]'), false)
})
