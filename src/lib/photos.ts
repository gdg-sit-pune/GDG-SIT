import 'server-only'
import { del, list } from '@vercel/blob'
import { adminDb } from './firebase-admin'
import type { EventPhoto } from './types'

// Server-side helpers for event and team photos stored in Vercel Blob.

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

/** Files newer than this are never cleaned up, so uploads still being edited are safe. */
const ORPHAN_MIN_AGE_MS = 60 * 60 * 1000

/**
 * Deletes photos in storage that no event or team member uses any more (for example from an
 * edit that was never saved). Runs in the background after admin saves, so storage stays clean
 * even if a cleanup was missed.
 */
export async function deleteOrphanPhotos() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return
  // The photo store is shared with the live site. Against the local test database (emulators)
  // every real photo would look unused, so never sweep there.
  if (process.env.FIRESTORE_EMULATOR_HOST) return
  try {
    const db = adminDb()
    const [events, members] = await Promise.all([db.collection('events').get(), db.collection('members').get()])
    const used = new Set<string>()
    for (const doc of events.docs)
      for (const p of (doc.data().photos as EventPhoto[] | undefined) ?? []) used.add(p.url)
    for (const doc of members.docs) if (doc.data().photo) used.add(doc.data().photo as string)

    const cutoff = Date.now() - ORPHAN_MIN_AGE_MS
    const orphans: string[] = []
    let cursor: string | undefined
    do {
      const page = await list({ cursor, limit: 1000 })
      for (const blob of page.blobs) {
        const ours = blob.pathname.startsWith('events/') || blob.pathname.startsWith('team/')
        if (ours && !used.has(blob.url) && blob.uploadedAt.getTime() < cutoff) orphans.push(blob.url)
      }
      cursor = page.hasMore ? page.cursor : undefined
    } while (cursor)

    if (orphans.length) await del(orphans)
  } catch (error) {
    console.error('Could not clean up unused photos', error)
  }
}
