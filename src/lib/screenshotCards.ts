import type { ImageFormat } from './cardPresets'

export async function screenshotPosterCards(page: any, format: ImageFormat): Promise<Buffer[]> {
  await page.waitForSelector('[data-poster-ready="1"]', { timeout: 20000 })
  await page.evaluate(async () => {
    const pending = Array.from(document.images).filter((img) => !img.complete)
    await Promise.all(
      pending.map(
        (img) =>
          new Promise((resolve) => {
            img.onload = img.onerror = () => resolve(null)
          })
      )
    )
    if (document.fonts?.ready) await document.fonts.ready
  })

  const elements = await page.$$('.poster-card')
  if (!elements.length) throw new Error('Poster element not found')

  const buffers: Buffer[] = []
  for (const el of elements) {
    await el.evaluate((node: HTMLElement) => node.scrollIntoView({ block: 'start', inline: 'start' }))
    let box = await el.boundingBox()
    if (!box) throw new Error('Could not get element bounds')
    const viewport = {
      width: Math.ceil(Math.max(800, box.x + box.width + 8)),
      height: Math.ceil(Math.min(16384, Math.max(700, box.y + box.height + 8))),
      deviceScaleFactor: 1,
    }
    await page.setViewport(viewport)
    box = await el.boundingBox()
    if (!box) throw new Error('Could not get element bounds')
    const shot = await page.screenshot({
      type: format,
      clip: {
        x: Math.max(0, box.x),
        y: Math.max(0, box.y),
        width: box.width,
        height: box.height,
      },
      omitBackground: false,
      ...(format === 'png' ? {} : { quality: 90 }),
    })
    buffers.push(shot)
  }
  return buffers
}
