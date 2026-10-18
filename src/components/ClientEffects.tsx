'use client'

import Lenis from 'lenis'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

/** Turns color transitions on once the first frame has painted (see `.preload` in globals.css). */
export function TransitionsReady() {
  useEffect(() => {
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => document.documentElement.classList.remove('preload')),
    )
    return () => cancelAnimationFrame(id)
  }, [])
  return null
}

/** Smooth wheel scrolling (Lenis). Off for visitors who prefer reduced motion. */
export function SmoothScroll() {
  const lenis = useRef<Lenis | null>(null)
  const pathname = usePathname()

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    lenis.current = new Lenis({ autoRaf: true, lerp: 0.12 })
    return () => {
      lenis.current?.destroy()
      lenis.current = null
    }
  }, [])

  // Start each new page at the top
  useEffect(() => {
    lenis.current?.scrollTo(0, { immediate: true })
  }, [pathname])

  return null
}
