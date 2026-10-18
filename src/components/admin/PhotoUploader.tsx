'use client'

import { upload } from '@vercel/blob/client'
import Image from 'next/image'
import { useRef, useState } from 'react'
import { CaretLeft, CaretRight, Close, Star, UploadSimple } from '@/components/icons'
import type { EventPhoto } from '@/lib/types'

const MAX_SIDE = 1920 // longest side after resizing, in pixels
const QUALITY = 0.82

/** Shrinks a photo in the browser and converts it to WebP before uploading. */
async function resize(file: File): Promise<{ blob: Blob; width: number; height: number }> {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('encode failed'))), 'image/webp', QUALITY),
  )
  return { blob, width, height }
}

interface Uploading {
  id: number
  name: string
  progress: number
}

/**
 * Photo picker for an event. The first photo is the cover.
 * `onAdd` receives each finished upload (the parent appends it and remembers it, so unsaved uploads
 * can be cleaned up if the edit is cancelled). `onChange` is used for reordering and removing.
 */
export default function PhotoUploader({
  photos,
  onChange,
  onAdd,
  onBusyChange,
}: {
  photos: EventPhoto[]
  onChange: (photos: EventPhoto[]) => void
  onAdd: (photo: EventPhoto) => void
  onBusyChange: (busy: boolean) => void
}) {
  const input = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState<Uploading[]>([])
  const [errors, setErrors] = useState<string[]>([])

  const addFiles = async (files: FileList | null) => {
    if (!files?.length) return
    setErrors([])
    const queue = Array.from(files).map((file, i) => ({ file, id: Date.now() + i }))
    setUploading((u) => [...u, ...queue.map(({ file, id }) => ({ id, name: file.name, progress: 0 }))])
    onBusyChange(true)

    await Promise.all(
      queue.map(async ({ file, id }) => {
        try {
          const { blob, width, height } = await resize(file)
          const result = await upload(`events/${Date.now()}.webp`, blob, {
            access: 'public',
            contentType: 'image/webp',
            handleUploadUrl: '/api/event-photos/upload',
            onUploadProgress: ({ percentage }) =>
              setUploading((u) => u.map((x) => (x.id === id ? { ...x, progress: percentage } : x))),
          })
          onAdd({ url: result.url, width, height })
        } catch {
          setErrors((e) => [...e, `${file.name} couldn't be uploaded. Try a JPG or PNG under 10 MB.`])
        } finally {
          setUploading((u) => u.filter((x) => x.id !== id))
        }
      }),
    )
    onBusyChange(false)
    if (input.current) input.current.value = ''
  }

  const move = (index: number, to: number) => {
    const next = [...photos]
    const [item] = next.splice(index, 1)
    next.splice(to, 0, item)
    onChange(next)
  }

  const tool =
    'grid size-7 place-items-center rounded-xs bg-black/60 text-white hover:bg-black/80 active:scale-95 disabled:opacity-30'

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Photos</span>
        <span className="text-xs text-muted">
          {photos.length} {photos.length === 1 ? 'photo' : 'photos'}
        </span>
      </div>

      {(photos.length > 0 || uploading.length > 0) && (
        <ul className="mt-2 grid grid-cols-3 gap-2">
          {photos.map((photo, i) => (
            <li key={photo.url} className="group relative aspect-square overflow-hidden rounded-xs bg-surface">
              <Image src={photo.url} alt="" fill sizes="160px" className="object-cover" unoptimized />
              {i === 0 && (
                <span className="absolute top-1.5 left-1.5 rounded-xs bg-black/60 px-1.5 py-0.5 text-[11px] text-white">
                  Cover
                </span>
              )}
              <div className="absolute inset-x-1.5 bottom-1.5 flex justify-between opacity-100 sm:opacity-0 sm:group-focus-within:opacity-100 sm:group-hover:opacity-100">
                <div className="flex gap-1">
                  <button
                    type="button"
                    className={tool}
                    aria-label="Move left"
                    disabled={i === 0}
                    onClick={() => move(i, i - 1)}
                  >
                    <CaretLeft size={14} />
                  </button>
                  <button
                    type="button"
                    className={tool}
                    aria-label="Move right"
                    disabled={i === photos.length - 1}
                    onClick={() => move(i, i + 1)}
                  >
                    <CaretRight size={14} />
                  </button>
                </div>
                <div className="flex gap-1">
                  {i !== 0 && (
                    <button
                      type="button"
                      className={tool}
                      aria-label="Make cover"
                      title="Make cover"
                      onClick={() => move(i, 0)}
                    >
                      <Star size={14} />
                    </button>
                  )}
                  <button
                    type="button"
                    className={tool}
                    aria-label="Remove photo"
                    onClick={() => onChange(photos.filter((p) => p.url !== photo.url))}
                  >
                    <Close size={14} />
                  </button>
                </div>
              </div>
            </li>
          ))}
          {uploading.map((u) => (
            <li
              key={u.id}
              className="relative grid aspect-square place-items-center overflow-hidden rounded-xs border border-line bg-surface"
              aria-label={`Uploading ${u.name}`}
            >
              <span className="text-xs text-muted tabular-nums">{Math.round(u.progress)}%</span>
              <span
                className="absolute inset-x-0 bottom-0 h-1 origin-left bg-g-blue"
                style={{ transform: `scaleX(${u.progress / 100})` }}
              />
            </li>
          ))}
        </ul>
      )}

      <input
        ref={input}
        type="file"
        accept="image/*"
        multiple
        className="sr-only"
        onChange={(e) => addFiles(e.target.files)}
        id="event-photos-input"
      />
      <label
        htmlFor="event-photos-input"
        className="mt-2 flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xs border border-dashed border-line-strong text-sm text-muted hover:border-fg hover:text-fg"
      >
        <UploadSimple size={16} /> {photos.length ? 'Add more photos' : 'Add photos'}
      </label>
      <p className="mt-1.5 text-xs text-muted">
        The first photo is the cover. Photos are resized before uploading, so large files are fine.
      </p>
      {errors.map((e) => (
        <p key={e} role="alert" className="mt-1.5 text-sm text-ink-red">
          {e}
        </p>
      ))}
    </div>
  )
}
