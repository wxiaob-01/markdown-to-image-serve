'use client'

import React, { forwardRef } from 'react'
import { Md2PosterContent } from 'markdown-to-poster'
import {
  CHROME_H,
  FRAME_PAD,
  CardSettings,
  resolveFont,
  resolveTheme,
} from '@/lib/cardPresets'

type CardPosterProps = {
  markdown: string
  settings: CardSettings
  width: number
  height: number | null
  background: string
  pageIndex?: number
  pageCount?: number
}

export function CardMarkdown({ markdown, className }: { markdown: string; className?: string }) {
  const source = markdown && markdown.trim() ? markdown : ' '
  return (
    <Md2PosterContent className={className ? `poster-md ${className}` : 'poster-md'} articleClassName="prose prose-gray max-w-none">
      {source}
    </Md2PosterContent>
  )
}

function headerText(settings: CardSettings) {
  return settings.header.trim() || new Date().toISOString().slice(0, 10)
}

export const CardPoster = forwardRef<HTMLDivElement, CardPosterProps>(function CardPoster(
  { markdown, settings, width, height, background, pageIndex = 0, pageCount = 1 },
  ref
) {
  const theme = resolveTheme(settings.themeId)
  const font = resolveFont(settings.fontId)
  const showFooterRow = settings.showFooter || settings.showLogo
  const showPager = settings.showPager && pageCount > 1
  const style = {
    width,
    height: height ?? 'auto',
    minHeight: height ? undefined : 480,
    background,
    padding: FRAME_PAD,
    display: 'flex',
    flexDirection: 'column',
    fontFamily: font.family,
    '--sheet': theme.sheet,
    '--ink': theme.ink,
    '--heading': theme.heading,
    '--muted': theme.muted,
    '--accent': theme.accent,
    '--line': theme.line,
    '--code': theme.code,
    '--pre-code': theme.preCode,
    '--chrome': theme.chrome,
  } as React.CSSProperties

  return (
    <div ref={ref} className="poster-card" style={style} data-card-index={pageIndex}>
      {settings.showHeader ? (
        <div className="poster-chrome" style={{ height: CHROME_H, color: theme.chrome }}>
          <span>{headerText(settings)}</span>
        </div>
      ) : null}
      <div className="poster-sheet" style={{ flex: height ? '1 1 auto' : undefined }}>
        <CardMarkdown markdown={markdown} className={height ? 'is-fixed' : undefined} />
      </div>
      {showFooterRow ? (
        <div className="poster-chrome" style={{ height: CHROME_H, color: theme.chrome }}>
          <div className="poster-footer-main">
            {settings.showLogo && settings.logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="poster-logo" src={settings.logo} alt="" />
            ) : null}
            {settings.showFooter ? <span>{settings.footer}</span> : null}
          </div>
          {showPager ? (
            <span className="poster-pager-float" style={{ position: 'static', color: theme.chrome }}>
              {pageIndex + 1}/{pageCount}
            </span>
          ) : null}
        </div>
      ) : null}
      {showPager && !showFooterRow ? (
        <span className="poster-pager-float" style={{ color: theme.chrome }}>
          {pageIndex + 1}/{pageCount}
        </span>
      ) : null}
    </div>
  )
})
