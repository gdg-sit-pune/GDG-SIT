import 'server-only'
import { del } from '@vercel/blob'
import type { EventPhoto } from './types'

// Server-side helpers for event photos stored in Vercel Blob.

const MAX_PHOTOS = 60

/** True for URLs in a Vercel Blob public store (where our uploads go). */
export function isBlobUrl(value: unknown): value is string {
  if (typeof value !== 'string') return false
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && url.hostname.endsWith('.public.blob.vercel-storage.com')
  } catch {
    return false
  }
}

/** Validates the photo list sent from the admin form. Returns an error message or the clean list. */
export function cleanPhotos(input: unknown): EventPhoto[] | string {
  if (input === undefined || input === null) return []
  if (!Array.isArray(input)) return 'Photos could not be read.'
  if (input.length > MAX_PHOTOS) return `Use up to ${MAX_PHOTOS} photos per event.`
  const photos: EventPhoto[] = []
  for (const p of input) {
    const width = Number(p?.width)
    const height = Number(p?.height)
    if (!isBlobUrl(p?.url) || !(width > 0) || !(height > 0)) return 'One of the photos is not a valid upload.'
    photos.push({ url: p.url, width: Math.round(width), height: Math.round(height) })
  }
  return photos
}

/** Deletes photos from Blob storage. Failures are logged, not thrown, so saving never breaks. */
export async function deletePhotos(urls: string[]) {
  const valid = urls.filter(isBlobUrl)
  if (!valid.length || !process.env.BLOB_READ_WRITE_TOKEN) return
  try {
    await del(valid)
  } catch (error) {
    console.error('Could not delete photos from Blob storage', error)
  }
}
