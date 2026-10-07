'use client'

import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { CardSettings, contentBox, resolveFont, resolveSize } from '@/lib/cardPresets'
import { packByHeight, splitBlocks, splitByThematicBreak } from '@/lib/splitMarkdown'
import { CardMarkdown } from './CardPoster'

export function useCardPages(markdown: string, settings: CardSettings) {
  const size = resolveSize(settings)
  const box = contentBox(size.width, size.height, settings)
  const auto = settings.split === 'auto' && Number.isFinite(box.maxHeight)
  const hrPages = useMemo(
    () => (settings.split === 'none' ? [markdown.trim()] : splitByThematicBreak(markdown)),
    [markdown, settings.split]
  )
  const blockGroups = useMemo(() => hrPages.map((page) => splitBlocks(page)), [hrPages])
  const flatBlocks = useMemo(() => blockGroups.flat(), [blockGroups])
  const sig = [
    markdown,
    settings.split,
    box.innerWidth,
    Number.isFinite(box.maxHeight) ? box.maxHeight : 'inf',
    settings.fontId,
    settings.showHeader,
    settings.showFooter,
    settings.showLogo,
  ].join('|')
  const measureRef = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<{ sig: string; pages: string[] }>({ sig: '', pages: hrPages })

  useLayoutEffect(() => {
    if (!auto) {
      setState({ sig, pages: hrPages.length ? hrPages : [''] })
      return
    }
    const root = measureRef.current
    if (!root) {
      setState({ sig, pages: hrPages.length ? hrPages : [''] })
      return
    }
    const measure = () => {
      const nodes = Array.from(root.querySelectorAll<HTMLElement>('[data-measure-block]'))
      const heights = nodes.map((node) => node.offsetHeight)
      let cursor = 0
      const next: string[] = []
      blockGroups.forEach((group) => {
        const slice = heights.slice(cursor, cursor + group.length)
        cursor += group.length
        next.push(...packByHeight(group, slice, box.maxHeight))
      })
      setState({ sig, pages: next.length ? next : [''] })
    }
    measure()
    const pending = Array.from(root.querySelectorAll('img')).filter((img) => !img.complete)
    pending.forEach((img) => {
      img.addEventListener('load', measure, { once: true })
      img.addEventListener('error', measure, { once: true })
    })
    return () => {
      pending.forEach((img) => {
        img.removeEventListener('load', measure)
        img.removeEventListener('error', measure)
      })
    }
  }, [auto, sig, hrPages, blockGroups, box.maxHeight])

  const ready = state.sig === sig
  const pages = ready ? state.pages : hrPages
  const font = resolveFont(settings.fontId)
  const measure = auto ? (
    <div
      ref={measureRef}
      className="poster-measure"
      aria-hidden
      style={{ width: box.innerWidth, fontFamily: font.family }}
    >
      {flatBlocks.map((block, index) => (
        <div data-measure-block key={`${index}-${block.length}`}>
          <CardMarkdown markdown={block} />
        </div>
      ))}
    </div>
  ) : null

  return { pages, ready, measure, width: size.width, height: size.height }
}
