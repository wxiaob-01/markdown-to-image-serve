import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const CONTENT_TYPES: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  zip: 'application/zip',
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const raw = req.query.filename
  const filename = path.basename(Array.isArray(raw) ? raw[0] : raw || '')
  const filePath = path.join('/tmp', 'uploads', 'posters', filename)

  try {
    const imageBuffer = fs.readFileSync(filePath)
    const ext = filename.split('.').pop()?.toLowerCase() || 'png'
    res.setHeader('Content-Type', CONTENT_TYPES[ext] || 'application/octet-stream')
    if (ext === 'zip') res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.send(imageBuffer)
  } catch (error) {
    res.status(404).json({ error: '图片未找到' })
  }
}