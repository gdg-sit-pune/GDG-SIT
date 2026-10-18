'use client'

import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import { saveStats } from '@/app/admin/actions'
import { Plus, Trash } from '@/components/icons'
import { buttonClass, fieldBase } from '@/lib/styles'
import type { Stat } from '@/lib/types'
import { AdminHeading, FormMessage, IconButton } from './kit'

const MAX = 8

export default function StatsManager({ stats }: { stats: Stat[] }) {
  const router = useRouter()
  const [items, setItems] = useState(stats)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [pending, startTransition] = useTransition()

  const update = (i: number, key: keyof Stat, value: string) => {
    setSaved(false)
    setItems((list) => list.map((s, j) => (j === i ? { ...s, [key]: value } : s)))
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const result = await saveStats(items)
      if (result.ok) {
        setSaved(true)
        router.refresh()
      } else setError(result.error)
    })
  }

  return (
    <>
      <AdminHeading
        title="Stats"
        subtitle="The numbers on the Home page. Domains and Team members are counted automatically and shown after these. A value ending in + gets a colored plus sign."
      />
      <form onSubmit={submit} className="mt-10 max-w-3xl">
        <div className="hidden grid-cols-[8rem_1fr_2.25rem] gap-4 pb-2 text-sm text-muted sm:grid">
          <span>Number</span>
          <span>Label</span>
        </div>
        <ul className="space-y-3">
          {items.map((stat, i) => (
            <li
              key={i}
              className="grid grid-cols-[4.5rem_1fr_2.25rem] items-center gap-2 sm:grid-cols-[8rem_1fr_2.25rem] sm:gap-4"
            >
              <input
                aria-label={`Stat ${i + 1} number`}
                value={stat.value}
                onChange={(e) => update(i, 'value', e.target.value)}
                maxLength={12}
                placeholder="500+"
                className={`${fieldBase} h-12 tabular-nums`}
              />
              <input
                aria-label={`Stat ${i + 1} label`}
                value={stat.label}
                onChange={(e) => update(i, 'label', e.target.value)}
                maxLength={40}
                placeholder="Community members"
                className={`${fieldBase} h-12`}
              />
              <IconButton
                label="Remove"
                onClick={() => {
                  setSaved(false)
                  setItems((list) => list.filter((_, j) => j !== i))
                }}
              >
                <Trash size={18} />
              </IconButton>
            </li>
          ))}
        </ul>
        {items.length < MAX && (
          <button
            type="button"
            onClick={() => {
              setSaved(false)
              setItems((list) => [...list, { value: '', label: '' }])
            }}
            className="group/btn mt-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg"
          >
            <Plus size={14} className="group-hover/btn:rotate-90" /> Add stat
          </button>
        )}

        <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-line pt-6">
          <button type="submit" disabled={pending} className={`${buttonClass()} disabled:opacity-60`}>
            {pending ? 'Saving…' : 'Save stats'}
          </button>
          {saved && <p className="text-sm text-ink-green">Saved. The Home page is updated.</p>}
          <FormMessage error={error} />
        </div>
      </form>
    </>
  )
}
