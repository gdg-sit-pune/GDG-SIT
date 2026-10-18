'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import EventRow from '@/components/EventRow'
import { Reveal } from '@/components/motion'
import { Container } from '@/components/ui'
import type { ClubEvent, EventType } from '@/lib/types'

type Tab = 'upcoming' | 'past'

/** Upcoming/past tabs, type filters and the event list. */
export default function EventsView({
  upcoming,
  past,
  today,
}: {
  upcoming: ClubEvent[]
  past: ClubEvent[]
  today: string
}) {
  const [tab, setTab] = useState<Tab>('upcoming')
  const [type, setType] = useState<EventType | 'All'>('All')

  const list = tab === 'upcoming' ? upcoming : past
  const types: (EventType | 'All')[] = ['All', ...new Set(list.map((e) => e.type))]
  const shown = type === 'All' ? list : list.filter((e) => e.type === type)

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: 'upcoming', label: 'Upcoming', count: upcoming.length },
    { id: 'past', label: 'Past', count: past.length },
  ]

  // Sliding underline that moves to the active tab
  const tabRefs = useRef<Partial<Record<Tab, HTMLButtonElement | null>>>({})
  const indicatorRef = useRef<HTMLSpanElement>(null)
  useLayoutEffect(() => {
    const place = () => {
      const el = tabRefs.current[tab]
      const indicator = indicatorRef.current
      if (!el || !indicator) return
      indicator.style.width = `${el.offsetWidth}px`
      indicator.style.translate = `${el.offsetLeft}px 0`
    }
    place()
    document.fonts?.ready.then(place)
    window.addEventListener('resize', place)
    return () => window.removeEventListener('resize', place)
  }, [tab])

  const switchTab = (next: Tab) => {
    setTab(next)
    setType('All')
  }

  return (
    <>
      <section className="pt-8 pb-16 lg:pb-24">
        <Container>
          <Reveal className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4 border-b border-line">
            <div className="relative flex gap-8" role="tablist">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  ref={(el) => {
                    tabRefs.current[t.id] = el
                  }}
                  type="button"
                  role="tab"
                  aria-selected={tab === t.id}
                  onClick={() => switchTab(t.id)}
                  className={`pb-4 text-sm font-medium ${tab === t.id ? 'text-fg' : 'text-muted hover:text-fg'}`}
                >
                  {t.label} <span className="ml-1 text-muted tabular-nums">{t.count}</span>
                </button>
              ))}
              <span ref={indicatorRef} className="absolute -bottom-px left-0 h-0.5 bg-g-blue" aria-hidden="true" />
            </div>

            {list.length > 0 && (
              <div className="no-scrollbar -mx-4 flex w-[calc(100%+2rem)] gap-2 overflow-x-auto px-4 pb-3 sm:mx-0 sm:w-auto sm:flex-wrap sm:overflow-visible sm:px-0">
                {types.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    aria-pressed={type === t}
                    className={`h-8 shrink-0 rounded-xs border px-3 text-sm whitespace-nowrap active:scale-[0.97] ${
                      type === t ? 'border-fg bg-fg text-bg' : 'border-line text-muted hover:border-fg hover:text-fg'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </Reveal>

          {/* Keyed so the list fades in again when the tab or filter changes */}
          <div key={`${tab}-${type}`} className="animate-page-in">
            {shown.length > 0 ? (
              shown.map((e) => <EventRow key={e.id} event={e} past={tab === 'past'} today={today} />)
            ) : (
              <p className="border-b border-line py-16 text-muted">
                {tab === 'upcoming'
                  ? 'No upcoming events yet. Check back soon or follow us on social media.'
                  : 'No past events to show yet.'}
              </p>
            )}
          </div>
        </Container>
      </section>
    </>
  )
}
