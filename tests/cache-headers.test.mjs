import test from 'node:test'
import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'

const vercel = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'))
const IMMUTABLE = 'public, max-age=31536000, immutable'

const cacheControlOf = (source) =>
  vercel.headers
    ?.find((rule) => rule.source === source)
    ?.headers.find((header) => header.key.toLowerCase() === 'cache-control')?.value

test('hashed site assets and demo mirror assets are cached as immutable for a year', () => {
  assert.equal(cacheControlOf('/assets/(.*)'), IMMUTABLE)
  assert.equal(cacheControlOf('/demo/assets/(.*)'), IMMUTABLE)
})

// immutable 下浏览器和 Cloudflare 一年内都不再回源确认：同名换内容的文件放进这两个目录，访客会一直拿到旧的
test('every demo mirror asset carries a content hash in its name', () => {
  const names = readdirSync(new URL('../docs/public/demo/assets/', import.meta.url))
  assert.ok(names.length > 0)
  assert.deepEqual(names.filter((name) => !/-[\w-]{8}\.[a-z0-9]+$/i.test(name)), [])
})

test('docs/public has no assets directory, so /assets only holds hashed VitePress output', () => {
  assert.throws(() => readdirSync(new URL('../docs/public/assets/', import.meta.url)), { code: 'ENOENT' })
})
