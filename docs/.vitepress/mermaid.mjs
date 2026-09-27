/** Render diagram fences without injecting Mermaid into every page's entry bundle. */
export function mermaidMarkdown(md) {
  const fallback = md.renderer.rules.fence
  md.renderer.rules.fence = (tokens, index, ...args) => {
    if (tokens[index].info.trim() === 'mermaid') {
      return `<MermaidDiagram code="${encodeURIComponent(tokens[index].content)}" />`
    }
    return fallback(tokens, index, ...args)
  }
}
