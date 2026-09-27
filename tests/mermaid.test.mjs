import test from 'node:test'
import assert from 'node:assert/strict'
import { mermaidMarkdown } from '../docs/.vitepress/mermaid.mjs'

test('Mermaid fences render a lazy diagram component with safely encoded source', () => {
  const md = { renderer: { rules: { fence: () => 'default-fence' } } }
  mermaidMarkdown(md)
  const source = 'graph TD\n  A["</script><b>学习 & 复习</b>"] --> B\n'
  const html = md.renderer.rules.fence([{ info: 'mermaid', content: source }], 0)
  assert.match(html, /^<MermaidDiagram code="[^"]+" \/>$/)
  assert.equal(decodeURIComponent(html.match(/code="([^"]+)"/)[1]), source)
  assert.ok(!html.includes('</script>'))
})

test('Other code fences preserve the existing renderer and its arguments', () => {
  const options = {}
  const tokens = [{ info: 'js', content: 'const x = 1' }]
  const md = { renderer: { rules: { fence: (...args) => args } } }
  mermaidMarkdown(md)
  assert.deepEqual(md.renderer.rules.fence(tokens, 0, options), [tokens, 0, options])
})
