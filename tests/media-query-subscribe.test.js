import assert from 'node:assert/strict'
import test from 'node:test'

import { subscribeToMediaQueryChange } from '../src/lib/media-query-subscribe.js'

test('subscribeToMediaQueryChange uses addEventListener/removeEventListener when available', () => {
  const calls = []
  const mql = {
    addEventListener: (type, handler) => {
      calls.push(['addEventListener', type, handler])
    },
    removeEventListener: (type, handler) => {
      calls.push(['removeEventListener', type, handler])
    },
  }

  const handler = () => {}
  const unsubscribe = subscribeToMediaQueryChange(mql, handler)

  assert.equal(typeof unsubscribe, 'function')
  assert.deepEqual(calls[0], ['addEventListener', 'change', handler])

  unsubscribe()
  assert.deepEqual(calls[1], ['removeEventListener', 'change', handler])
})

test('subscribeToMediaQueryChange is a noop when addEventListener is missing', () => {
  let legacyCalled = false
  const mql = {
    addListener: () => {
      legacyCalled = true
    },
  }

  const handler = () => {}
  const unsubscribe = subscribeToMediaQueryChange(mql, handler)

  assert.equal(typeof unsubscribe, 'function')
  assert.equal(legacyCalled, false)
  assert.doesNotThrow(() => unsubscribe())
})
