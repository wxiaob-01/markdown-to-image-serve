import test from 'node:test'
import assert from 'node:assert/strict'
import { packByHeight, splitBlocks, splitByThematicBreak } from './splitMarkdown'
import { zipStore } from './zipStore'
import { parsePosterRecord } from './posterRequest'
import { THEME_PRESETS, resolveTheme } from './cardPresets'

test('splits cards on a thematic break and keeps fences intact', () => {
  const pages = splitByThematicBreak('# One\n\nhello\n\n---\n\n## Two\n\n```\n---\n```\n\nend')
  assert.equal(pages.length, 2)
  assert.match(pages[0], /One/)
  assert.match(pages[1], /```\n---\n```/)
})

test('splits prose into blocks without breaking code fences', () => {
  const blocks = splitBlocks('para one\n\n```\nline\n\nstill\n```\n\npara two')
  assert.equal(blocks.length, 3)
  assert.match(blocks[1], /still/)
})

test('packs blocks onto a new card when the next block would overflow', () => {
  const pages = packByHeight(['a', 'b', 'c'], [100, 80, 50], 150)
  assert.deepEqual(pages, ['a', 'b\n\nc'])
})

test('keeps a single oversized block on its own card', () => {
  const pages = packByHeight(['huge'], [400], 120)
  assert.deepEqual(pages, ['huge'])
})

test('writes a stored zip that contains the file bytes', () => {
  const zipped = zipStore([{ name: 'a.txt', data: new TextEncoder().encode('hello-card') }])
  assert.equal(zipped[0], 0x50)
  assert.equal(zipped[1], 0x4b)
  assert.ok(Buffer.from(zipped).includes(Buffer.from('hello-card')))
})

test('maps legacy theme names and editor params', () => {
  assert.equal(THEME_PRESETS.length >= 8, true)
  assert.equal(resolveTheme('SpringGradientWave').id, 'dream')
  assert.equal(resolveTheme('pink').name, '樱花粉')
  const job = parsePosterRecord({
    markdown: '# Hi',
    theme: 'blue',
    size: 'phone',
    format: 'webp',
    cards: 'all',
    zip: '1',
    showHeader: '0',
    split: 'hr',
    font: 'song',
    bg: 'solid',
    bgColor: '#111111',
  })
  assert.equal(job.markdown, '# Hi')
  assert.equal(job.settings.themeId, 'salt')
  assert.equal(job.settings.sizeId, 'phone')
  assert.equal(job.format, 'webp')
  assert.equal(job.all, true)
  assert.equal(job.zip, true)
  assert.equal(job.settings.showHeader, false)
  assert.equal(job.settings.fontId, 'song')
  assert.equal(job.settings.bgMode, 'solid')
  assert.equal(job.settings.bgColor, '#111111')
  assert.equal(job.settings.split, 'hr')
})
