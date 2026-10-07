import fs from 'fs'
import path from 'path'

export function posterSaveDir() {
  return process.env.NODE_ENV === 'production'
    ? path.join('/tmp', 'uploads', 'posters')
    : path.join(process.cwd(), 'public', 'uploads', 'posters')
}

export function savePosterFile(fileName: string, data: Buffer | Uint8Array) {
  const saveDir = posterSaveDir()
  if (!fs.existsSync(saveDir)) fs.mkdirSync(saveDir, { recursive: true })
  const safeName = path.basename(fileName)
  fs.writeFileSync(path.join(saveDir, safeName), data)
  return safeName
}

export function posterPublicUrl(baseUrl: string, fileName: string) {
  const safeName = path.basename(fileName)
  const pathname = process.env.NODE_ENV === 'production' ? `/api/images/${safeName}` : `/uploads/posters/${safeName}`
  return `${baseUrl}${pathname}`
}
