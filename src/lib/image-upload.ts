'use client'

import { upload } from '@vercel/blob/client'
import type { EventPhoto } from './types'

// Browser-side photo processing and upload to Vercel Blob, shared by event and team photos.

interface ResizeOptions {
  /** Longest side after resizing, in pixels */
  maxSide: number
  /** Crop to a centered square first (used for team photos) */
  square?: boolean
}

/** Shrinks a photo (optionally cropping it to a square) and converts it to WebP. */
async function resize(file: File, { maxSide, square }: ResizeOptions) {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  let sx = 0
  let sy = 0
  let sw = bitmap.width
  let sh = bitmap.height
  if (square) {
    const side = Math.min(sw, sh)
    sx = (sw - side) / 2
    sy = (sh - side) / 2
    sw = sh = side
  }
  const scale = Math.min(1, maxSide / Math.max(sw, sh))
  const width = Math.round(sw * scale)
  const height = Math.round(sh * scale)
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  canvas.getContext('2d')!.drawImage(bitmap, sx, sy, sw, sh, 0, 0, width, height)
  bitmap.close()
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('encode failed'))), 'image/webp', 0.82),
  )
  return { blob, width, height }
}

/** Resizes and uploads one photo. Throws if the file can't be read or the upload fails. */
export async function uploadPhoto(
  file: File,
  folder: 'events' | 'team',
  options: ResizeOptions,
  onProgress?: (percentage: number) => void,
): Promise<EventPhoto> {
  const { blob, width, height } = await resize(file, options)
  const result = await upload(`${folder}/${Date.now()}.webp`, blob, {
    access: 'public',
    contentType: 'image/webp',
    handleUploadUrl: '/api/photos/upload',
    onUploadProgress: onProgress ? ({ percentage }) => onProgress(percentage) : undefined,
  })
  return { url: result.url, width, height }
}
