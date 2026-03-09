import assert from 'node:assert/strict'
import test from 'node:test'

import { getRecommendedBadgeClassName } from '../src/lib/download-badge.js'

test('getRecommendedBadgeClassName 将推荐徽标贴在卡片边框上', () => {
  const className = getRecommendedBadgeClassName()

  assert.ok(className.includes('rounded-full'))
  assert.ok(className.includes('absolute'))
  assert.ok(className.includes('top-0'))
  assert.ok(className.includes('-translate-y-1/2'))
  assert.ok(className.includes('border'))
  assert.ok(className.includes('bg-[color:var(--apple-surface-elevated)]'))
})
