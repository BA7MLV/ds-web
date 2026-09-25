import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

test('docs downloads snapshot exists and is valid JSON', async () => {
  const raw = await readFile(new URL('../docs/.vitepress/data/downloads.json', import.meta.url), 'utf8')
  const data = JSON.parse(raw)

  assert.equal(typeof data.version, 'string')
  assert.equal(typeof data.releaseUrl, 'string')
  assert.equal(typeof data.platforms, 'object')
  assert.ok('macArm64' in data.platforms)
})
