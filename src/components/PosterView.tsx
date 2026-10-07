'use client'

import { useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { resolveFrameBackground } from '@/lib/cardPresets'
import { API_DEFAULTS, parsePosterRecord } from '@/lib/posterRequest'
import { CardPoster } from './CardPoster'
import { useCardPages } from './useCardPages'

export default function PosterView() {
  const searchParams = useSearchParams()
  const job = useMemo(() => {
    const record = Object.fromEntries(searchParams?.entries() ?? [])
    return parsePosterRecord(record, API_DEFAULTS)
  }, [searchParams])
  const { pages, ready, measure, width, height } = useCardPages(job.markdown, job.settings)
  const background = resolveFrameBackground(job.settings)

  return (
    <>
      {measure}
      <div className="poster-root" data-poster-ready={ready ? '1' : '0'} style={{ display: 'inline-flex', flexDirection: 'column', gap: 28, padding: 8 }}>
        {pages.map((markdown, index) => (
          <CardPoster
            key={`${index}-${markdown.slice(0, 24)}`}
            markdown={markdown}
            settings={job.settings}
            width={width}
            height={height}
            background={background}
            pageIndex={index}
            pageCount={pages.length}
          />
        ))}
      </div>
    </>
  )
}
