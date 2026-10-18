'use client'

import { useSyncExternalStore } from 'react'

type Theme = 'light' | 'dark'

// The theme lives as a `dark` class on <html> (set before first paint by the
// script in the root layout). This hook just watches that class.

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  return () => observer.disconnect()
}

const getSnapshot = (): Theme => (document.documentElement.classList.contains('dark') ? 'dark' : 'light')
const getServerSnapshot = (): Theme => 'light'

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  /**
   * Switch theme. When the browser supports View Transitions, the new theme
   * grows out of `origin` (the toggle button) as an expanding circle.
   */
  const toggle = (origin?: { x: number; y: number }) => {
    const root = document.documentElement
    const next: Theme = root.classList.contains('dark') ? 'light' : 'dark'

    const apply = () => {
      root.classList.toggle('dark', next === 'dark')
      try {
        localStorage.setItem('theme', next)
      } catch {
        // storage blocked; the theme still applies for this visit
      }
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!document.startViewTransition || reducedMotion || !origin) {
      apply()
      return
    }

    // Colors switch instantly inside the circle, so pause the usual 100ms fades
    root.classList.add('preload')
    const transition = document.startViewTransition(apply)

    transition.ready.then(() => {
      const { x, y } = origin
      const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 550, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', pseudoElement: '::view-transition-new(root)' },
      )
    })
    transition.finished.finally(() => root.classList.remove('preload'))
  }

  return { theme, toggle }
}
