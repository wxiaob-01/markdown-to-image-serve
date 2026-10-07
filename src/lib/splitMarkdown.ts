const THEMATIC_BREAK = /^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/
const FENCE = /^\s*(```|~~~)/

export function splitByThematicBreak(markdown: string): string[] {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n')
  const groups: string[][] = [[]]
  let inFence = false
  for (const line of lines) {
    if (FENCE.test(line)) inFence = !inFence
    if (!inFence && THEMATIC_BREAK.test(line)) {
      groups.push([])
      continue
    }
    groups[groups.length - 1].push(line)
  }
  const pages = groups.map((group) => group.join('\n').trim()).filter(Boolean)
  return pages.length ? pages : ['']
}

export function splitBlocks(markdown: string): string[] {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n')
  const blocks: string[][] = []
  let buf: string[] = []
  let inFence = false
  const flush = () => {
    if (buf.some((line) => line.trim())) blocks.push(buf)
    buf = []
  }
  for (const line of lines) {
    if (FENCE.test(line)) {
      if (!inFence && buf.length) flush()
      inFence = !inFence
      buf.push(line)
      if (!inFence) flush()
      continue
    }
    if (!inFence && line.trim() === '') {
      flush()
      continue
    }
    buf.push(line)
  }
  flush()
  const parts = blocks.map((block) => block.join('\n').trim()).filter(Boolean)
  return parts.length ? parts : ['']
}

export function packByHeight(blocks: string[], heights: number[], maxHeight: number): string[] {
  if (!blocks.length) return ['']
  if (!Number.isFinite(maxHeight) || maxHeight <= 0) return [blocks.join('\n\n')]
  const pages: string[][] = []
  let current: string[] = []
  let used = 0
  const gap = 12
  blocks.forEach((block, index) => {
    const height = Math.max(1, heights[index] || 1)
    const extra = current.length ? gap : 0
    if (current.length && used + extra + height > maxHeight) {
      pages.push(current)
      current = [block]
      used = height
      return
    }
    current.push(block)
    used += extra + height
  })
  if (current.length) pages.push(current)
  return pages.map((page) => page.join('\n\n'))
}

export function paginateMarkdown(markdown: string, split: 'hr' | 'auto' | 'none', maxHeight: number, heightsForAuto?: number[]): string[] {
  if (split === 'none') {
    const text = markdown.trim()
    return [text]
  }
  const sections = splitByThematicBreak(markdown)
  if (split !== 'auto' || !Number.isFinite(maxHeight)) return sections
  if (!heightsForAuto) return sections
  let cursor = 0
  const pages: string[] = []
  for (const section of sections) {
    const blocks = splitBlocks(section)
    const heights = heightsForAuto.slice(cursor, cursor + blocks.length)
    cursor += blocks.length
    pages.push(...packByHeight(blocks, heights, maxHeight))
  }
  return pages.length ? pages : ['']
}
