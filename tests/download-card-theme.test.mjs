import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

test('推荐卡片强调边框改用冷银灰 token', async () => {
  const source = await readFile(new URL('../src/index.css', import.meta.url), 'utf8')

  assert.match(source, /--apple-accent-line:\s*rgba\(124,\s*132,\s*145,\s*0\.36\);/)
  assert.match(source, /--apple-accent-line:\s*rgba\(194,\s*201,\s*212,\s*0\.38\);/)
})
