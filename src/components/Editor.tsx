'use client'

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import MDEditor from '@uiw/react-md-editor'
import '@uiw/react-md-editor/markdown-editor.css'
import { toCanvas } from 'html-to-image'
import { ChevronLeft, ChevronRight, Copy, Download, LoaderCircle } from 'lucide-react'
import { Button } from './ui/button'
import { Label } from './ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { Switch } from './ui/switch'
import { CardPoster } from './CardPoster'
import { useCardPages } from './useCardPages'
import {
  BgMode,
  CardSettings,
  DEFAULT_SETTINGS,
  FONT_PRESETS,
  GRADIENT_PRESETS,
  ImageFormat,
  SIZE_PRESETS,
  SplitMode,
  THEME_PRESETS,
  formatExtension,
  resolveFrameBackground,
} from '@/lib/cardPresets'
import { zipStore } from '@/lib/zipStore'

const defaultMd = `# 把 Markdown 写成知识卡片

左侧书写，右侧就是可以发出去的卡片。主题、字体、背景和比例都会立刻反映在预览上。

## 这一页先看版式

自动分页会按卡片高度把长文切开。换成正方形或手机海报，更容易看到第二页。

1. 换主题，纸面和标题颜色会一起变
2. 换字体，正文立刻跟着变
3. 背景可以是纯色、渐变，或一张图片

> 页眉、页脚和 Logo 可以单独关掉。

---

## 第二张卡片

单独一行的 --- 会从这里另起一张。

- 小红书 3:4
- 手机海报 9:16
- 正方形 1:1
- 长图文按内容把高度撑开
`

function cardTitle(markdown: string, index: number) {
  const line = markdown
    .split('\n')
    .map((item) => item.replace(/^#{1,6}\s*/, '').replace(/^[-*]\s*/, '').trim())
    .find(Boolean)
  return line ? line.slice(0, 18) : `卡片 ${index + 1}`
}

async function rasterize(node: HTMLElement, format: ImageFormat) {
  const canvas = await toCanvas(node, { pixelRatio: 2 })
  const mime = format === 'jpeg' ? 'image/jpeg' : format === 'webp' ? 'image/webp' : 'image/png'
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((result) => resolve(result), mime, 0.92)
  })
  if (!blob) throw new Error('导出失败')
  return blob
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export default function Editor() {
  const [markdown, setMarkdown] = useState(defaultMd)
  const [settings, setSettings] = useState<CardSettings>(DEFAULT_SETTINGS)
  const [index, setIndex] = useState(0)
  const [tab, setTab] = useState<'edit' | 'preview'>('edit')
  const [busy, setBusy] = useState('')
  const [status, setStatus] = useState('预览和导出使用同一张卡片。多张时可打包 ZIP。')
  const [editorHeight, setEditorHeight] = useState(560)
  const [scale, setScale] = useState(0.72)
  const [naturalHeight, setNaturalHeight] = useState(720)
  const editPaneRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef<HTMLDivElement>(null)
  const exportRefs = useRef<Array<HTMLDivElement | null>>([])
  const { pages, measure, width, height } = useCardPages(markdown, settings)
  const background = resolveFrameBackground(settings)
  const active = Math.min(index, Math.max(pages.length - 1, 0))

  useEffect(() => {
    setIndex((current) => Math.min(current, Math.max(pages.length - 1, 0)))
  }, [pages.length])

  useLayoutEffect(() => {
    const node = editPaneRef.current
    if (!node) return
    const observer = new ResizeObserver(() => setEditorHeight(Math.max(280, node.clientHeight)))
    observer.observe(node)
    return () => observer.disconnect()
  }, [tab])

  useLayoutEffect(() => {
    const stage = stageRef.current
    if (!stage) return
    const fit = () => {
      const cardHeight = height ?? activeRef.current?.offsetHeight ?? naturalHeight
      if (activeRef.current && !height) setNaturalHeight(activeRef.current.offsetHeight || cardHeight)
      const availW = Math.max(160, stage.clientWidth - 56)
      const availH = Math.max(160, stage.clientHeight - 56)
      const next = height
        ? Math.min(1, availW / width, availH / cardHeight)
        : Math.min(1, availW / width)
      setScale(Math.max(0.2, next))
    }
    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(stage)
    return () => observer.disconnect()
  }, [width, height, active, pages, naturalHeight, settings])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const tag = target?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || target?.isContentEditable) return
      if (event.key === 'ArrowRight') setIndex((current) => Math.min(pages.length - 1, current + 1))
      if (event.key === 'ArrowLeft') setIndex((current) => Math.max(0, current - 1))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [pages.length])

  const patch = (partial: Partial<CardSettings>) => setSettings((current) => ({ ...current, ...partial }))

  const exportNodes = () => exportRefs.current.slice(0, pages.length).filter((node): node is HTMLDivElement => Boolean(node))

  const run = async (label: string, task: () => Promise<string>) => {
    setBusy(label)
    setStatus('')
    try {
      setStatus(await task())
    } catch (error) {
      console.error(error)
      setStatus('导出失败。如果卡片里有外链图片，请确认图片允许跨域，或改用本地图片。')
    } finally {
      setBusy('')
    }
  }

  const copyPng = () =>
    run('copy', async () => {
      const node = exportNodes()[active]
      if (!node) throw new Error('missing card')
      const blobPromise = rasterize(node, 'png')
      if (typeof ClipboardItem !== 'undefined' && navigator.clipboard?.write) {
        try {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blobPromise })])
          return '已复制 PNG 到剪贴板'
        } catch (error) {
          console.error(error)
        }
      }
      downloadBlob(await blobPromise, `card-${active + 1}.png`)
      return '浏览器未允许写入剪贴板，已改为下载 PNG'
    })

  const downloadCurrent = (format: ImageFormat) =>
    run(format, async () => {
      const node = exportNodes()[active]
      if (!node) throw new Error('missing card')
      const blob = await rasterize(node, format)
      const ext = formatExtension(format)
      downloadBlob(blob, `card-${active + 1}.${ext}`)
      return `已下载 card-${active + 1}.${ext}`
    })

  const downloadZip = () =>
    run('zip', async () => {
      const nodes = exportNodes()
      if (!nodes.length) throw new Error('missing card')
      const files: { name: string; data: Uint8Array }[] = []
      for (let i = 0; i < nodes.length; i += 1) {
        const blob = await rasterize(nodes[i], 'png')
        files.push({ name: `card-${i + 1}.png`, data: new Uint8Array(await blob.arrayBuffer()) })
      }
      downloadBlob(new Blob([zipStore(files)], { type: 'application/zip' }), 'cards.zip')
      return `已打包 ${files.length} 张 PNG`
    })

  const onUpload = (file: File | undefined) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setStatus('请选择图片文件')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setStatus('背景图片需小于 2MB')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      patch({ bgMode: 'image', bgImage: String(reader.result || '') })
      setStatus('已用本地图片做背景。接口调用请改传图片 URL，数据地址不会放进请求。')
    }
    reader.readAsDataURL(file)
  }

  const shownHeight = height ?? naturalHeight

  return (
    <div className="workbench" data-color-mode="light">
      {measure}
      <div className="export-host" aria-hidden>
        {pages.map((page, pageIndex) => (
          <CardPoster
            key={`export-${pageIndex}-${page.length}`}
            ref={(node) => {
              exportRefs.current[pageIndex] = node
            }}
            markdown={page}
            settings={settings}
            width={width}
            height={height}
            background={background}
            pageIndex={pageIndex}
            pageCount={pages.length}
          />
        ))}
      </div>
      <div className="workbench-bar">
        <Field label="主题">
          <Select value={settings.themeId} onValueChange={(themeId) => patch({ themeId })}>
            <SelectTrigger className="h-9 w-[168px]" aria-label="主题">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {THEME_PRESETS.map((theme) => (
                <SelectItem key={theme.id} value={theme.id}>
                  {theme.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="尺寸">
          <Select value={settings.sizeId} onValueChange={(sizeId) => patch({ sizeId })}>
            <SelectTrigger className="h-9 w-[168px]" aria-label="尺寸">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SIZE_PRESETS.map((size) => (
                <SelectItem key={size.id} value={size.id}>
                  {size.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        {settings.sizeId === 'custom' ? (
          <Field label="宽高">
            <div className="flex gap-2">
              <NumberBox label="宽" value={settings.width} onChange={(value) => patch({ width: value })} />
              <NumberBox label="高" value={settings.height || 720} onChange={(value) => patch({ height: value })} />
            </div>
          </Field>
        ) : null}
        <Field label="字体">
          <Select value={settings.fontId} onValueChange={(fontId) => patch({ fontId })}>
            <SelectTrigger className="h-9 w-[132px]" aria-label="字体">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FONT_PRESETS.map((font) => (
                <SelectItem key={font.id} value={font.id}>
                  {font.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="拆分">
          <Select value={settings.split} onValueChange={(split) => patch({ split: split as SplitMode })}>
            <SelectTrigger className="h-9 w-[132px]" aria-label="拆分">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">自动分页</SelectItem>
              <SelectItem value="hr">横线拆分</SelectItem>
              <SelectItem value="none">不拆分</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="背景">
          <Select value={settings.bgMode} onValueChange={(bgMode) => patch({ bgMode: bgMode as BgMode })}>
            <SelectTrigger className="h-9 w-[132px]" aria-label="背景">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="theme">跟随主题</SelectItem>
              <SelectItem value="solid">纯色</SelectItem>
              <SelectItem value="gradient">渐变</SelectItem>
              <SelectItem value="image">图片</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        {settings.bgMode === 'solid' ? (
          <Field label="颜色">
            <input
              aria-label="背景颜色"
              className="h-9 w-14 cursor-pointer rounded-md border border-input bg-background p-1"
              type="color"
              value={toColorInput(settings.bgColor)}
              onChange={(event) => patch({ bgColor: event.target.value })}
            />
          </Field>
        ) : null}
        {settings.bgMode === 'gradient' ? (
          <Field label="渐变">
            <Select value={settings.gradientId} onValueChange={(gradientId) => patch({ gradientId })}>
              <SelectTrigger className="h-9 w-[120px]" aria-label="渐变">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GRADIENT_PRESETS.map((gradient) => (
                  <SelectItem key={gradient.id} value={gradient.id}>
                    {gradient.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        ) : null}
        {settings.bgMode === 'image' ? (
          <Field label="图片">
            <div className="flex gap-2">
              <input
                aria-label="背景图片地址"
                className="h-9 w-44 rounded-md border border-input bg-background px-2 text-sm"
                placeholder="https://..."
                value={settings.bgImage.startsWith('data:') ? '' : settings.bgImage}
                onChange={(event) => patch({ bgImage: event.target.value })}
              />
              <label className="inline-flex h-9 cursor-pointer items-center rounded-md border border-input bg-background px-3 text-sm">
                上传
                <input
                  aria-label="上传背景图片"
                  className="sr-only"
                  type="file"
                  accept="image/*"
                  onChange={(event) => onUpload(event.target.files?.[0])}
                />
              </label>
            </div>
          </Field>
        ) : null}
        <div className="workbench-toggles">
          <Toggle label="页眉" checked={settings.showHeader} onChange={(showHeader) => patch({ showHeader })} />
          <Toggle label="页脚" checked={settings.showFooter} onChange={(showFooter) => patch({ showFooter })} />
          <Toggle label="Logo" checked={settings.showLogo} onChange={(showLogo) => patch({ showLogo })} />
          <Toggle label="页码" checked={settings.showPager} onChange={(showPager) => patch({ showPager })} />
        </div>
        {settings.showHeader ? (
          <Field label="页眉文字">
            <input
              aria-label="页眉文字"
              className="h-9 w-36 rounded-md border border-input bg-background px-2 text-sm"
              placeholder="默认当天日期"
              value={settings.header}
              onChange={(event) => patch({ header: event.target.value })}
            />
          </Field>
        ) : null}
        {settings.showFooter ? (
          <Field label="页脚文字">
            <input
              aria-label="页脚文字"
              className="h-9 w-56 rounded-md border border-input bg-background px-2 text-sm"
              value={settings.footer}
              onChange={(event) => patch({ footer: event.target.value })}
            />
          </Field>
        ) : null}
        <div className="workbench-actions">
          <Button type="button" className="h-9 bg-[#e85d04] text-white hover:bg-[#c2410c]" disabled={Boolean(busy)} onClick={copyPng}>
            {busy === 'copy' ? <LoaderCircle className="mr-1 h-4 w-4 animate-spin" /> : <Copy className="mr-1 h-4 w-4" />}
            复制 PNG
          </Button>
          <Button type="button" variant="outline" className="h-9" disabled={Boolean(busy)} onClick={() => downloadCurrent('png')}>
            <Download className="mr-1 h-4 w-4" />
            PNG
          </Button>
          <Button type="button" variant="outline" className="h-9" disabled={Boolean(busy)} onClick={() => downloadCurrent('jpeg')}>
            JPEG
          </Button>
          <Button type="button" variant="outline" className="h-9" disabled={Boolean(busy)} onClick={() => downloadCurrent('webp')}>
            WebP
          </Button>
          <Button type="button" variant="outline" className="h-9" disabled={Boolean(busy)} onClick={downloadZip}>
            ZIP
          </Button>
        </div>
        <p className="workbench-status" role="status">
          {status}
        </p>
      </div>
      <div className="workbench-tabs">
        <button type="button" data-active={tab === 'edit'} onClick={() => setTab('edit')}>
          编辑
        </button>
        <button type="button" data-active={tab === 'preview'} onClick={() => setTab('preview')}>
          预览
        </button>
      </div>
      <div className="workbench-body" data-tab={tab}>
        <div className="pane-edit">
          <div ref={editPaneRef} className="min-h-0 flex-1">
            <MDEditor
              height={editorHeight}
              preview="edit"
              value={markdown}
              visibleDragbar={false}
              textareaProps={{ placeholder: '请输入 Markdown 内容...' }}
              onChange={(value) => setMarkdown(value || '')}
            />
          </div>
          <p className="editor-hint">单独一行的 --- 会拆成新卡片。预览区域可以用左右键翻页。</p>
        </div>
        <div className="pane-preview">
          <div className="preview-nav">
            <Button type="button" variant="outline" className="h-8 px-2" disabled={active <= 0} onClick={() => setIndex((current) => Math.max(0, current - 1))}>
              <ChevronLeft className="h-4 w-4" />
              上一张
            </Button>
            <div className="preview-nav-count">
              {active + 1} / {pages.length}
            </div>
            <Button
              type="button"
              variant="outline"
              className="h-8 px-2"
              disabled={active >= pages.length - 1}
              onClick={() => setIndex((current) => Math.min(pages.length - 1, current + 1))}
            >
              下一张
              <ChevronRight className="h-4 w-4" />
            </Button>
            <div className="preview-film">
              {pages.map((page, pageIndex) => (
                <button key={`${pageIndex}-${cardTitle(page, pageIndex)}`} type="button" data-active={pageIndex === active} onClick={() => setIndex(pageIndex)}>
                  {pageIndex + 1}. {cardTitle(page, pageIndex)}
                </button>
              ))}
            </div>
          </div>
          <div ref={stageRef} className="preview-stage">
            <div className="preview-frame" style={{ width: width * scale, height: shownHeight * scale }}>
              <span className="crop crop-tl" />
              <span className="crop crop-tr" />
              <span className="crop crop-bl" />
              <span className="crop crop-br" />
              <div style={{ width, height: shownHeight, transform: `scale(${scale})`, transformOrigin: 'top left' }}>
                <CardPoster
                  ref={activeRef}
                  markdown={pages[active] || ''}
                  settings={settings}
                  width={width}
                  height={height}
                  background={background}
                  pageIndex={active}
                  pageCount={pages.length}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="workbench-field">
      <span className="workbench-label">{label}</span>
      {children}
    </label>
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  const id = `toggle-${label}`
  return (
    <div className="workbench-toggle">
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
      <Label htmlFor={id}>{label}</Label>
    </div>
  )
}

function NumberBox({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <input
      aria-label={label}
      className="h-9 w-20 rounded-md border border-input bg-background px-2 text-sm"
      type="number"
      min={320}
      max={label === '宽' ? 1080 : 2400}
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
    />
  )
}

function toColorInput(value: string) {
  return /^#[0-9a-fA-F]{6}$/.test(value) ? value : '#fff4ec'
}
