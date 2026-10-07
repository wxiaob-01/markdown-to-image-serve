import { DEFAULT_SETTINGS, SIZE_PRESETS, resolveTheme } from './cardPresets'
import type { BgMode, CardSettings, ImageFormat, SplitMode } from './cardPresets'

export const API_DEFAULTS: CardSettings = {
  ...DEFAULT_SETTINGS,
  themeId: 'dream',
  sizeId: 'long',
  height: null,
  split: 'none',
}

export type PosterJob = {
  markdown: string
  settings: CardSettings
  format: ImageFormat
  cardIndex: number
  all: boolean
  zip: boolean
}

function text(value: unknown, fallback = '') {
  if (typeof value === 'string') return value
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  return fallback
}

function flag(value: unknown, fallback: boolean) {
  if (value === undefined || value === null || value === '') return fallback
  if (typeof value === 'boolean') return value
  const normalized = String(value).trim().toLowerCase()
  if (['0', 'false', 'off', 'no'].includes(normalized)) return false
  if (['1', 'true', 'on', 'yes'].includes(normalized)) return true
  return fallback
}

function oneOf<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  const normalized = text(value).trim()
  return (allowed as readonly string[]).includes(normalized) ? (normalized as T) : fallback
}

function finiteNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) return parsed
  }
  return null
}

export function parsePosterRecord(input: Record<string, unknown> | null | undefined, defaults: CardSettings = API_DEFAULTS): PosterJob {
  const source = input || {}
  const markdown = text(source.markdown, text(source.content, ''))
  const theme = resolveTheme(text(source.theme, defaults.themeId))
  const sizeId = oneOf(source.size, SIZE_PRESETS.map((item) => item.id), defaults.sizeId)
  const width = finiteNumber(source.width) ?? defaults.width
  const heightValue = finiteNumber(source.height)
  const split = oneOf<SplitMode>(source.split, ['hr', 'auto', 'none'], defaults.split)
  const bgMode = oneOf<BgMode>(source.bg, ['theme', 'solid', 'gradient', 'image'], defaults.bgMode)
  const format = oneOf<ImageFormat>(source.format, ['png', 'jpeg', 'webp'], 'png')
  const cards = text(source.cards).trim().toLowerCase()
  const cardNumber = finiteNumber(source.card)
  const settings: CardSettings = {
    themeId: theme.id,
    sizeId,
    width,
    height: heightValue ?? defaults.height,
    fontId: text(source.font, defaults.fontId),
    bgMode,
    bgColor: text(source.bgColor, defaults.bgColor),
    gradientId: text(source.gradient, defaults.gradientId),
    bgImage: text(source.bgImage, defaults.bgImage),
    showHeader: flag(source.showHeader, defaults.showHeader),
    showFooter: flag(source.showFooter, defaults.showFooter),
    showLogo: flag(source.showLogo, defaults.showLogo),
    showPager: flag(source.showPager ?? source.pager, defaults.showPager),
    header: text(source.header, defaults.header),
    footer: text(source.footer, defaults.footer),
    logo: text(source.logo, defaults.logo),
    split,
  }

  return {
    markdown,
    settings,
    format,
    cardIndex: cardNumber == null ? 0 : Math.max(0, Math.floor(cardNumber)),
    all: cards === 'all',
    zip: flag(source.zip, false),
  }
}

export function buildPosterSearch(markdown: string, settings: CardSettings) {
  const params = new URLSearchParams()
  params.set('content', markdown)
  params.set('theme', settings.themeId)
  params.set('size', settings.sizeId)
  params.set('width', String(settings.width))
  if (settings.height != null) params.set('height', String(settings.height))
  params.set('font', settings.fontId)
  params.set('bg', settings.bgMode)
  params.set('bgColor', settings.bgColor)
  params.set('gradient', settings.gradientId)
  if (settings.bgImage && !settings.bgImage.startsWith('data:')) params.set('bgImage', settings.bgImage)
  params.set('showHeader', settings.showHeader ? '1' : '0')
  params.set('showFooter', settings.showFooter ? '1' : '0')
  params.set('showLogo', settings.showLogo ? '1' : '0')
  params.set('showPager', settings.showPager ? '1' : '0')
  params.set('header', settings.header)
  params.set('footer', settings.footer)
  params.set('logo', settings.logo)
  params.set('split', settings.split)
  return params
}

export function posterPath(markdown: string, settings: CardSettings) {
  return `/poster?${buildPosterSearch(markdown, settings).toString()}`
}
