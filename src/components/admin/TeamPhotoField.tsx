'use client'

import { useId, useState } from 'react'
import { UploadSimple } from '@/components/icons'
import { MemberPhoto } from '@/components/MemberCard'
import { uploadPhoto } from '@/lib/image-upload'

/**
 * Photo picker for a team member. The photo is cropped to a centered square, resized to 800px
 * and uploaded to Vercel Blob. `onUploaded` reports each upload so unsaved ones can be cleaned up.
 */
export default function TeamPhotoField({
  name,
  photo,
  onChange,
  onUploaded,
  onBusyChange,
}: {
  name: string
  photo: string
  onChange: (url: string) => void
  onUploaded: (url: string) => void
  onBusyChange: (busy: boolean) => void
}) {
  const inputId = useId()
  const [progress, setProgress] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const pick = async (file: File | undefined) => {
    if (!file) return
    setError(null)
    setProgress(0)
    onBusyChange(true)
    try {
      const uploaded = await uploadPhoto(file, 'team', { maxSide: 800, square: true }, setProgress)
      onUploaded(uploaded.url)
      onChange(uploaded.url)
    } catch {
      setError(`${file.name} couldn't be uploaded. Try a JPG or PNG under 10 MB.`)
    } finally {
      setProgress(null)
      onBusyChange(false)
    }
  }

  return (
    <div>
      <span className="text-sm font-medium">Photo</span>
      <div className="mt-2 flex items-center gap-4">
        <div className="relative size-24 shrink-0 overflow-hidden rounded-xs bg-surface">
          <MemberPhoto member={{ name: name || '?', photo: photo || undefined }} className="text-2xl" />
          {progress !== null && (
            <span className="absolute inset-0 grid place-items-center bg-black/55 text-sm text-white tabular-nums">
              {Math.round(progress)}%
            </span>
          )}
        </div>
        <div className="flex flex-col items-start gap-2">
          <input
            id={inputId}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              void pick(e.target.files?.[0])
              e.target.value = ''
            }}
          />
          <label
            htmlFor={inputId}
            className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-xs border border-line-strong px-3 text-sm hover:border-fg"
          >
            <UploadSimple size={16} /> {photo ? 'Replace photo' : 'Upload photo'}
          </label>
          {photo && (
            <button type="button" onClick={() => onChange('')} className="text-sm text-muted hover:text-ink-red">
              Remove photo
            </button>
          )}
        </div>
      </div>
      <p className="mt-1.5 text-xs text-muted">
        Cropped to a square from the center. A clear photo of the face works best.
      </p>
      {error && (
        <p role="alert" className="mt-1.5 text-sm text-ink-red">
          {error}
        </p>
      )}
    </div>
  )
}
