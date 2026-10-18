'use client'

import Image from 'next/image'
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import type { EventPhoto } from '@/lib/types'
import { pauseScroll, resumeScroll } from './ClientEffects'
import { CaretLeft, CaretRight, Close } from './icons'
import { Reveal } from './motion'

const viewerButton =
  'grid size-11 place-items-center rounded-xs border border-white/20 text-white hover:border-white/60 active:scale-95'

/** Photo grid; clicking a photo opens a full-screen viewer (arrow keys, swipe, Escape to close). */
export default function Gallery({ photos, title }: { photos: EventPhoto[]; title: string }) {
  const [index, setIndex] = useState<number | null>(null)
  const open = index !== null
  const touchStart = useRef<number | null>(null)

  const close = useCallback(() => setIndex(null), [])
  const step = useCallback(
    (by: number) => setIndex((i) => (i === null ? i : (i + by + photos.length) % photos.length)),
    [photos.length],
  )

  useEffect(() => {
    if (!open) return
    pauseScroll()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      if (e.key === 'ArrowRight') step(1)
      if (e.key === 'ArrowLeft') step(-1)
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      resumeScroll()
    }
  }, [open, close, step])

  const current = index !== null ? photos[index] : null
  // The viewer is rendered into <body> so no page animation or stacking can sit on top of it
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )

  return (
    <>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
        {photos.map((photo, i) => (
          <li key={photo.url}>
            <Reveal delay={(i % 4) * 60}>
              <button
                type="button"
                onClick={() => setIndex(i)}
                className="group relative block aspect-[4/3] w-full overflow-hidden rounded-xs bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-g-blue"
                aria-label={`Open photo ${i + 1} of ${photos.length}`}
              >
                <Image
                  src={photo.url}
                  alt={`${title}, photo ${i + 1}`}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                  className="object-cover group-hover:scale-[1.03]"
                />
              </button>
            </Reveal>
          </li>
        ))}
      </ul>

      {mounted &&
        createPortal(
          <div
            className={`fixed inset-0 z-[60] flex flex-col bg-black ${open ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
            role="dialog"
            aria-modal="true"
            aria-label={`${title} photos`}
            aria-hidden={!open}
            inert={!open}
            onTouchStart={(e) => (touchStart.current = e.touches[0].clientX)}
            onTouchEnd={(e) => {
              if (touchStart.current === null) return
              const dx = e.changedTouches[0].clientX - touchStart.current
              if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1)
              touchStart.current = null
            }}
          >
            <div className="flex h-16 shrink-0 items-center justify-between px-4 sm:px-6">
              <span className="text-sm text-white/70 tabular-nums">
                {index !== null ? index + 1 : 0} / {photos.length}
              </span>
              <button type="button" onClick={close} aria-label="Close" className={viewerButton}>
                <Close size={20} />
              </button>
            </div>

            <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-6 sm:px-20">
              {current && (
                <Image
                  key={current.url}
                  src={current.url}
                  alt={`${title}, photo ${(index ?? 0) + 1}`}
                  width={current.width}
                  height={current.height}
                  sizes="100vw"
                  className="max-h-full w-auto animate-page-in rounded-xs object-contain"
                  loading="eager"
                />
              )}
              {photos.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => step(-1)}
                    aria-label="Previous photo"
                    className={`${viewerButton} absolute top-1/2 left-4 hidden -translate-y-1/2 sm:grid`}
                  >
                    <CaretLeft size={20} />
                  </button>
                  <button
                    type="button"
                    onClick={() => step(1)}
                    aria-label="Next photo"
                    className={`${viewerButton} absolute top-1/2 right-4 hidden -translate-y-1/2 sm:grid`}
                  >
                    <CaretRight size={20} />
                  </button>
                </>
              )}
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}
