import assert from 'node:assert/strict'
import test from 'node:test'

import { getImageRequestHints } from '../src/lib/image-loading.js'

test('hero image is eager + high priority', () => {
  assert.deepEqual(getImageRequestHints({ role: 'hero' }), {
    loading: 'eager',
    fetchPriority: 'high',
  })
})

test('non-hero images are lazy + auto priority', () => {
  assert.deepEqual(getImageRequestHints({ role: 'feature' }), {
    loading: 'lazy',
    fetchPriority: 'auto',
  })
})
