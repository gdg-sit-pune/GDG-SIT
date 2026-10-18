'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useState, useTransition } from 'react'
import { deleteEvent, saveEvent, type EventInput } from '@/app/admin/actions'
import { Pencil, Plus } from '@/components/icons'
import { Label } from '@/components/ui'
import { dateParts } from '@/lib/dates'
import { buttonClass } from '@/lib/styles'
import { eventModes, eventTypes, type ClubEvent } from '@/lib/types'
import { AdminHeading, DeleteButton, Drawer, Field, FormMessage, IconButton, Select, TextArea, TextInput } from './kit'

const blank: EventInput = {
  title: '',
  date: '',
  time: '',
  venue: '',
  mode: 'In-person',
  type: 'Workshop',
  description: '',
  registrationUrl: '',
  recapUrl: '',
}

/** Form values for an existing event (optional fields become empty strings). */
const toInput = (e: ClubEvent): EventInput => ({
  title: e.title,
  date: e.date,
  time: e.time ?? '',
  venue: e.venue,
  mode: e.mode,
  type: e.type,
  description: e.description,
  registrationUrl: e.registrationUrl ?? '',
  recapUrl: e.recapUrl ?? '',
})

function EventForm({ initial, id, onDone }: { initial: EventInput; id?: string; onDone: () => void }) {
  const [values, setValues] = useState(initial)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const set = (key: keyof EventInput) => (e: { target: { value: string } }) =>
    setValues((v) => ({ ...v, [key]: e.target.value }))

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const result = await saveEvent(values, id)
      if (result.ok) onDone()
      else setError(result.error)
    })
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <Field label="Title">
        <TextInput value={values.title} onChange={set('title')} required maxLength={120} autoFocus />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Date">
          <TextInput type="date" value={values.date} onChange={set('date')} required />
        </Field>
        <Field label="Time" hint="Optional, e.g. 10:00 AM to 1:00 PM">
          <TextInput value={values.time ?? ''} onChange={set('time')} maxLength={60} />
        </Field>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Type">
          <Select
            value={values.type}
            onChange={set('type')}
            options={eventTypes.map((t) => ({ value: t, label: t }))}
          />
        </Field>
        <Field label="Format">
          <Select
            value={values.mode}
            onChange={set('mode')}
            options={eventModes.map((m) => ({ value: m, label: m }))}
          />
        </Field>
      </div>
      <Field label="Venue">
        <TextInput value={values.venue} onChange={set('venue')} required maxLength={120} placeholder="SIT Auditorium" />
      </Field>
      <Field label="Description">
        <TextArea value={values.description} onChange={set('description')} required maxLength={1000} />
      </Field>
      <Field label="Registration link" hint="Optional. Shown as a Register button while the event is upcoming.">
        <TextInput
          type="url"
          value={values.registrationUrl ?? ''}
          onChange={set('registrationUrl')}
          placeholder="https://"
        />
      </Field>
      <Field label="Recap link" hint="Optional. Photos, slides or a post, shown after the event.">
        <TextInput type="url" value={values.recapUrl ?? ''} onChange={set('recapUrl')} placeholder="https://" />
      </Field>

      <FormMessage error={error} />
      <div className="flex gap-3 border-t border-line pt-5">
        <button type="submit" disabled={pending} className={`${buttonClass()} disabled:opacity-60`}>
          {pending ? 'Saving…' : id ? 'Save changes' : 'Add event'}
        </button>
        <button type="button" onClick={onDone} className={buttonClass('secondary')}>
          Cancel
        </button>
      </div>
    </form>
  )
}

function EventList({
  title,
  events,
  onEdit,
  onDelete,
  busyId,
}: {
  title: string
  events: ClubEvent[]
  onEdit: (event: ClubEvent) => void
  onDelete: (id: string) => void
  busyId: string | null
}) {
  return (
    <section className="mt-12">
      <Label>
        {title} <span className="tabular-nums">({events.length})</span>
      </Label>
      {events.length === 0 ? (
        <p className="mt-4 border-y border-line py-8 text-muted">Nothing here yet.</p>
      ) : (
        <ul className="mt-4 border-t border-line">
          {events.map((event) => {
            const d = dateParts(event.date)
            return (
              <li
                key={event.id}
                className={`grid grid-cols-[4rem_1fr_auto] items-center gap-4 border-b border-line py-4 sm:grid-cols-[6rem_1fr_auto] ${
                  busyId === event.id ? 'opacity-50' : ''
                }`}
              >
                <div>
                  <p className="text-2xl font-medium tabular-nums">{d.day}</p>
                  <p className="text-xs text-muted">
                    {d.month} {d.year}
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium">{event.title}</p>
                  <p className="truncate text-sm text-muted">
                    {event.type} · {event.venue}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <IconButton label="Edit" onClick={() => onEdit(event)}>
                    <Pencil size={18} />
                  </IconButton>
                  <DeleteButton onConfirm={() => onDelete(event.id)} disabled={busyId === event.id} />
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

export default function EventsManager({ events, today }: { events: ClubEvent[]; today: string }) {
  const router = useRouter()
  const [editing, setEditing] = useState<ClubEvent | 'new' | null>(null)
  // Bumped on every open so the form starts fresh
  const [formKey, setFormKey] = useState(0)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const upcoming = events.filter((e) => e.date >= today).sort((a, b) => a.date.localeCompare(b.date))
  const past = events.filter((e) => e.date < today)

  const open = (target: ClubEvent | 'new') => {
    setFormKey((k) => k + 1)
    setEditing(target)
  }
  const close = useCallback(() => setEditing(null), [])
  const done = () => {
    close()
    router.refresh()
  }

  const remove = async (id: string) => {
    setBusyId(id)
    setError(null)
    const result = await deleteEvent(id)
    setBusyId(null)
    if (result.ok) router.refresh()
    else setError(result.error)
  }

  const current = editing && editing !== 'new' ? editing : null

  return (
    <>
      <AdminHeading
        title="Events"
        subtitle="Upcoming events show on the Home and Events pages. Past events move to the Past tab automatically."
        action={
          <button type="button" onClick={() => open('new')} className={buttonClass()}>
            <Plus size={16} /> Add event
          </button>
        }
      />
      <div className="mt-4">
        <FormMessage error={error} />
      </div>
      <EventList title="Upcoming" events={upcoming} onEdit={open} onDelete={remove} busyId={busyId} />
      <EventList title="Past" events={past} onEdit={open} onDelete={remove} busyId={busyId} />

      <Drawer open={editing !== null} title={current ? 'Edit event' : 'New event'} onClose={close}>
        {editing !== null && (
          <EventForm key={formKey} initial={current ? toInput(current) : blank} id={current?.id} onDone={done} />
        )}
      </Drawer>
    </>
  )
}
