export const FRAME_PAD = 16
export const CHROME_H = 44
export const SHEET_PAD_X = 22
export const SHEET_PAD_Y = 20

export type SplitMode = 'hr' | 'auto' | 'none'
export type BgMode = 'theme' | 'solid' | 'gradient' | 'image'
export type ImageFormat = 'png' | 'jpeg' | 'webp'

export type ThemePreset = {
  id: string
  name: string
  aliases: string[]
  frame: string
  sheet: string
  ink: string
  heading: string
  muted: string
  accent: string
  line: string
  code: string
  preCode: string
  chrome: string
}

export type FontPreset = {
  id: string
  label: string
  family: string
}

export type SizePreset = {
  id: string
  label: string
  width: number
  height: number | null
}

export type GradientPreset = {
  id: string
  label: string
  value: string
}

export type CardSettings = {
  themeId: string
  sizeId: string
  width: number
  height: number | null
  fontId: string
  bgMode: BgMode
  bgColor: string
  gradientId: string
  bgImage: string
  showHeader: boolean
  showFooter: boolean
  showLogo: boolean
  showPager: boolean
  header: string
  footer: string
  logo: string
  split: SplitMode
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'warm',
    name: '温暖柔和',
    aliases: [],
    frame: 'linear-gradient(165deg, #f6d2bf 0%, #fff4ec 46%, #e7b08f 100%)',
    sheet: '#fffaf6',
    ink: '#5c4038',
    heading: '#9a3412',
    muted: '#a16252',
    accent: '#c2410c',
    line: '#f3d5c4',
    code: '#fff1e6',
    preCode: '#5c4038',
    chrome: '#7c2d12',
  },
  {
    id: 'gray',
    name: '简约高级灰',
    aliases: ['gray'],
    frame: 'linear-gradient(165deg, #d5dae2 0%, #f5f6f8 50%, #c3c8d1 100%)',
    sheet: '#f7f7f8',
    ink: '#3f3f46',
    heading: '#18181b',
    muted: '#71717a',
    accent: '#3f3f46',
    line: '#e4e4e7',
    code: '#ececee',
    preCode: '#27272a',
    chrome: '#27272a',
  },
  {
    id: 'dream',
    name: '梦幻渐变',
    aliases: ['purple', 'SpringGradientWave'],
    frame: 'linear-gradient(135deg, #e4d0fb 0%, #fde7f3 48%, #c4b5fd 100%)',
    sheet: '#fdfaff',
    ink: '#4c1d95',
    heading: '#6d28d9',
    muted: '#7e6b9a',
    accent: '#a21caf',
    line: '#eadcff',
    code: '#f5f0ff',
    preCode: '#4c1d95',
    chrome: '#5b21b6',
  },
  {
    id: 'fresh',
    name: '清新自然',
    aliases: ['green'],
    frame: 'linear-gradient(165deg, #b7f0cb 0%, #f0fdf4 44%, #86efac 100%)',
    sheet: '#f6fef8',
    ink: '#14532d',
    heading: '#166534',
    muted: '#3f7d55',
    accent: '#15803d',
    line: '#d1fae5',
    code: '#ecfdf3',
    preCode: '#14532d',
    chrome: '#14532d',
  },
  {
    id: 'salt',
    name: '海盐蓝',
    aliases: ['blue'],
    frame: 'linear-gradient(165deg, #bfdbfe 0%, #f0f9ff 46%, #7dd3fc 100%)',
    sheet: '#f8fbff',
    ink: '#1e3a5f',
    heading: '#1d4ed8',
    muted: '#5b7c9d',
    accent: '#0369a1',
    line: '#dbeafe',
    code: '#eff6ff',
    preCode: '#1e3a5f',
    chrome: '#1e3a8a',
  },
  {
    id: 'sunset',
    name: '日落暖橙',
    aliases: ['yellow', 'red'],
    frame: 'linear-gradient(145deg, #fed7aa 0%, #fff7ed 42%, #fdba74 78%, #fecaca 100%)',
    sheet: '#fffaf5',
    ink: '#7c2d12',
    heading: '#c2410c',
    muted: '#b45309',
    accent: '#ea580c',
    line: '#ffedd5',
    code: '#fff4e8',
    preCode: '#7c2d12',
    chrome: '#9a3412',
  },
  {
    id: 'ink',
    name: '墨白极简',
    aliases: [],
    frame: '#ececea',
    sheet: '#ffffff',
    ink: '#1c1917',
    heading: '#0c0a09',
    muted: '#57534e',
    accent: '#b45309',
    line: '#e7e5e4',
    code: '#f5f5f4',
    preCode: '#1c1917',
    chrome: '#44403c',
  },
  {
    id: 'night',
    name: '深夜阅读',
    aliases: [],
    frame: 'linear-gradient(165deg, #1e1b4b 0%, #0f172a 58%, #312e81 100%)',
    sheet: '#1e293b',
    ink: '#e2e8f0',
    heading: '#f8fafc',
    muted: '#94a3b8',
    accent: '#a5b4fc',
    line: '#334155',
    code: '#0f172a',
    preCode: '#e2e8f0',
    chrome: '#e0e7ff',
  },
  {
    id: 'sakura',
    name: '樱花粉',
    aliases: ['pink'],
    frame: 'linear-gradient(160deg, #fecdd3 0%, #fff1f2 46%, #fda4af 100%)',
    sheet: '#fff7f8',
    ink: '#881337',
    heading: '#be123c',
    muted: '#be5a72',
    accent: '#e11d48',
    line: '#ffe4e6',
    code: '#fff1f2',
    preCode: '#881337',
    chrome: '#9f1239',
  },
  {
    id: 'paper',
    name: '复古纸张',
    aliases: [],
    frame: 'linear-gradient(180deg, rgba(255,255,255,.28), rgba(90,60,30,.08)), #d9c7a6',
    sheet: '#f4efe4',
    ink: '#3f342b',
    heading: '#5c3a21',
    muted: '#8a735b',
    accent: '#9a3412',
    line: '#e6dcc8',
    code: '#efe6d6',
    preCode: '#3f342b',
    chrome: '#3f342b',
  },
  {
    id: 'mint',
    name: '薄荷笔记',
    aliases: [],
    frame: 'linear-gradient(180deg, #c7f5ee 0%, #f0fdfa 100%)',
    sheet: '#f7fffd',
    ink: '#134e4a',
    heading: '#0f766e',
    muted: '#3f8f88',
    accent: '#0d9488',
    line: '#ccfbf1',
    code: '#ecfdf9',
    preCode: '#134e4a',
    chrome: '#115e59',
  },
  {
    id: 'indigo',
    name: '靛蓝科技',
    aliases: ['indigo'],
    frame: 'linear-gradient(145deg, #312e81 0%, #4f46e5 52%, #818cf8 100%)',
    sheet: '#eef2ff',
    ink: '#1e1b4b',
    heading: '#3730a3',
    muted: '#6366f1',
    accent: '#4f46e5',
    line: '#e0e7ff',
    code: '#e0e7ff',
    preCode: '#1e1b4b',
    chrome: '#eef2ff',
  },
]

export const FONT_PRESETS: FontPreset[] = [
  {
    id: 'system',
    label: '系统黑体',
    family: '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans SC", SimSun, ui-sans-serif, system-ui, sans-serif',
  },
  {
    id: 'song',
    label: '宋体',
    family: 'SimSun, "Songti SC", "Noto Serif SC", serif',
  },
  {
    id: 'serif',
    label: '衬线',
    family: 'Georgia, "Times New Roman", "Songti SC", SimSun, serif',
  },
  {
    id: 'mono',
    label: '等宽',
    family: 'ui-monospace, SFMono-Regular, Menlo, Consolas, "Sarasa Mono SC", monospace',
  },
  {
    id: 'inter',
    label: 'Inter',
    family: 'Inter, "PingFang SC", "Microsoft YaHei", SimSun, sans-serif',
  },
]

export const SIZE_PRESETS: SizePreset[] = [
  { id: 'xhs', label: '小红书 3:4', width: 540, height: 720 },
  { id: 'phone', label: '手机海报 9:16', width: 540, height: 960 },
  { id: 'square', label: '正方形 1:1', width: 540, height: 540 },
  { id: 'long', label: '长图文', width: 540, height: null },
  { id: 'custom', label: '自定义', width: 540, height: 720 },
]

export const GRADIENT_PRESETS: GradientPreset[] = [
  { id: 'warm-glow', label: '暖光', value: 'linear-gradient(160deg, #ffd6c9, #fff1e6 45%, #f7c1b0)' },
  { id: 'silver', label: '银灰', value: 'linear-gradient(160deg, #e5e7eb, #f9fafb 50%, #d1d5db)' },
  { id: 'dream', label: '梦幻', value: 'linear-gradient(135deg, #e9d5ff, #fce7f3 50%, #ddd6fe)' },
  { id: 'fresh', label: '清新', value: 'linear-gradient(160deg, #d1fae5, #ecfdf5 50%, #a7f3d0)' },
  { id: 'sea', label: '海盐', value: 'linear-gradient(160deg, #dbeafe, #eff6ff 50%, #bfdbfe)' },
  { id: 'dusk', label: '暮色', value: 'linear-gradient(145deg, #312e81, #6d28d9 55%, #f472b6)' },
]

export const DEFAULT_FOOTER = 'Powered by markdown-to-image-serve'
export const DEFAULT_LOGO = '/logo.png'

export const DEFAULT_SETTINGS: CardSettings = {
  themeId: 'warm',
  sizeId: 'xhs',
  width: 540,
  height: 720,
  fontId: 'system',
  bgMode: 'theme',
  bgColor: '#fff4ec',
  gradientId: 'warm-glow',
  bgImage: '',
  showHeader: true,
  showFooter: true,
  showLogo: true,
  showPager: true,
  header: '',
  footer: DEFAULT_FOOTER,
  logo: DEFAULT_LOGO,
  split: 'auto',
}

export function resolveTheme(id: string | null | undefined): ThemePreset {
  const key = (id || '').trim()
  const found = THEME_PRESETS.find((item) => item.id === key || item.aliases.includes(key))
  return found || THEME_PRESETS[0]
}

export function resolveFont(id: string | null | undefined): FontPreset {
  return FONT_PRESETS.find((item) => item.id === id) || FONT_PRESETS[0]
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n))
}

export function resolveSize(settings: Pick<CardSettings, 'sizeId' | 'width' | 'height'>): { width: number; height: number | null } {
  const preset = SIZE_PRESETS.find((item) => item.id === settings.sizeId) || SIZE_PRESETS[0]
  if (preset.id === 'custom') {
    return {
      width: clamp(settings.width || preset.width, 320, 1080),
      height: clamp(settings.height || preset.height || 720, 320, 2400),
    }
  }
  return { width: preset.width, height: preset.height }
}

export function resolveFrameBackground(settings: Pick<CardSettings, 'bgMode' | 'bgColor' | 'gradientId' | 'bgImage' | 'themeId'>): string {
  const theme = resolveTheme(settings.themeId)
  if (settings.bgMode === 'solid' && settings.bgColor) return settings.bgColor
  if (settings.bgMode === 'gradient') {
    return GRADIENT_PRESETS.find((item) => item.id === settings.gradientId)?.value || theme.frame
  }
  if (settings.bgMode === 'image' && settings.bgImage) {
    const safe = settings.bgImage.replace(/["\\\n\r]/g, '')
    return `center / cover no-repeat url("${safe}")`
  }
  return theme.frame
}

export function contentBox(
  width: number,
  height: number | null,
  flags: { showHeader: boolean; showFooter: boolean; showLogo: boolean }
) {
  const chrome = (flags.showHeader ? CHROME_H : 0) + (flags.showFooter || flags.showLogo ? CHROME_H : 0)
  const innerWidth = Math.max(120, width - FRAME_PAD * 2 - SHEET_PAD_X * 2)
  const maxHeight = height == null ? Number.POSITIVE_INFINITY : height - FRAME_PAD * 2 - chrome - SHEET_PAD_Y * 2
  return { innerWidth, maxHeight }
}

export function formatExtension(format: ImageFormat) {
  if (format === 'jpeg') return 'jpg'
  return format
}
