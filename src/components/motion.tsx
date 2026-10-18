'use client'

import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { accents, type Accent } from '@/lib/accents'
import { Plus } from './icons'

/** Fades its content up into place the first time it scrolls into view. */
export function Reveal({
  children,
  className = '',
  delay = 0,
  as = 'div',
}: {
  children: ReactNode
  className?: string
  /** Milliseconds to wait before animating, for staggering items */
  delay?: number
  /** Use 'span' inside headings and other text */
  as?: 'div' | 'span'
}) {
  const ref = useRef<HTMLDivElement>(null)
  const Tag = as as 'div'
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '0px 0px -6% 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const style: CSSProperties | undefined = delay ? { animationDelay: `${delay}ms` } : undefined
  return (
    <Tag ref={ref} className={`${visible ? 'animate-fade-up' : 'opacity-0'} ${className}`} style={style}>
      {children}
    </Tag>
  )
}

/** Cross-fades and rotates between two icons. */
export function IconSwap({ showSecond, first, second }: { showSecond: boolean; first: ReactNode; second: ReactNode }) {
  const layer = 'col-start-1 row-start-1 grid place-items-center'
  return (
    <span className="grid place-items-center" aria-hidden="true">
      <span className={`${layer} ${showSecond ? 'scale-50 -rotate-90 opacity-0' : 'opacity-100'}`}>{first}</span>
      <span className={`${layer} ${showSecond ? 'opacity-100' : 'scale-50 rotate-90 opacity-0'}`}>{second}</span>
    </span>
  )
}

/** Animated height: content slides open and closed. */
export function Collapse({ open, children, id }: { open: boolean; children: ReactNode; id?: string }) {
  return (
    <div id={id} className={`grid ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`} inert={!open}>
      <div className="min-h-0 overflow-hidden">{children}</div>
    </div>
  )
}

/** One question in an FAQ list. */
export function AccordionItem({
  question,
  children,
  accent,
}: {
  question: string
  children: ReactNode
  accent: Accent
}) {
  const [open, setOpen] = useState(false)
  const id = useId()

  return (
    <div className="border-b border-line">
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((o) => !o)}
          className="group flex w-full items-center justify-between gap-6 py-5 text-left text-xl font-medium"
        >
          {question}
          <Plus
            size={20}
            className={`shrink-0 ${open ? `rotate-45 ${accents[accent].text}` : 'text-muted group-hover:text-fg'}`}
          />
        </button>
      </h3>
      <Collapse open={open} id={id}>
        <div className="max-w-3xl pb-6 text-muted">{children}</div>
      </Collapse>
    </div>
  )
}
