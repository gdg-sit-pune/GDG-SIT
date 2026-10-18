'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useRef, useState, useTransition } from 'react'
import { deleteEvent, discardUploads, saveEvent, type EventInput } from '@/app/admin/actions'
import { Images, Pencil, Plus } from '@/components/icons'
import { Label } from '@/components/ui'
import { eventDateBlock, eventEnd } from '@/lib/dates'
import { buttonClass } from '@/lib/styles'
import { eventModes, eventTypes, type ClubEvent, type EventPhoto } from '@/lib/types'
import { AdminHeading, DeleteButton, Drawer, Field, FormMessage, IconButton, Select, TextArea, TextInput } from './kit'
import PhotoUploader from './PhotoUploader'

const blank: EventInput = {
  title: '',
  date: '',
  endDate: '',
  time: '',
  venue: '',
  mode: 'In-person',
  type: 'Workshop',
  description: '',
  registrationUrl: '',
  recapUrl: '',
  photos: [],
}

/** Form values for an existing event (optional fields become empty strings). */
const toInput = (e: ClubEvent): EventInput => ({
  title: e.title,
  date: e.date,
  endDate: e.endDate ?? '',
  time: e.time ?? '',
  venue: e.venue,
  mode: e.mode,
  type: e.type,
  description: e.description,
  registrationUrl: e.registrationUrl ?? '',
  recapUrl: e.recapUrl ?? '',
  photos: e.photos ?? [],
})

function EventForm({
  initial,
  id,
  uploads,
  onSaved,
  onCancel,
}: {
  initial: EventInput
  id?: string
  /** Photos uploaded during this edit; anything not saved gets deleted */
  uploads: React.RefObject<Set<string>>
  onSaved: () => void
  onCancel: () => void
}) {
  const [values, setValues] = useState(initial)
  const [error, setError] = useState<string | null>(null)
  const [uploadingPhotos, setUploadingPhotos] = useState(false)
  const [pending, startTransition] = useTransition()
  const set = (key: keyof EventInput) => (e: { target: { value: string } }) =>
    setValues((v) => ({ ...v, [key]: e.target.value }))
  const setPhotos = (photos: EventPhoto[]) => setValues((v) => ({ ...v, photos }))
  const addPhoto = (photo: EventPhoto) => {
    uploads.current.add(photo.url)
    setValues((v) => ({ ...v, photos: [...(v.photos ?? []), photo] }))
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const result = await saveEvent(values, id)
      if (!result.ok) {
        setError(result.error)
        return
      }
      // Uploads that were removed again before saving are no longer needed
      const saved = new Set((values.photos ?? []).map((p) => p.url))
      const unused = [...uploads.current].filter((url) => !saved.has(url))
      uploads.current.clear()
      if (unused.length) void discardUploads(unused)
      onSaved()
    })
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <Field label="Title">
        <TextInput value={values.title} onChange={set('title')} required maxLength={120} autoFocus />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Starts on">
          <TextInput type="date" value={values.date} onChange={set('date')} required />
        </Field>
        <Field label="Ends on" hint="Only for events longer than a day">
          <TextInput
            type="date"
            value={values.endDate ?? ''}
            onChange={set('endDate')}
            min={values.date || undefined}
          />
        </Field>
      </div>
      <Field label="Time" hint="Optional, e.g. 10:00 AM to 1:00 PM, or 9 AM to 6 PM daily">
        <TextInput value={values.time ?? ''} onChange={set('time')} maxLength={60} />
      </Field>
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
      <PhotoUploader
        photos={values.photos ?? []}
        onChange={setPhotos}
        onAdd={addPhoto}
        onBusyChange={setUploadingPhotos}
      />
      <Field label="Registration link" hint="Optional. Shown as a Register button while the event is upcoming.">
        <TextInput
          type="url"
          value={values.registrationUrl ?? ''}
          onChange={set('registrationUrl')}
          placeholder="https://"
        />
      </Field>
      <Field label="Recap link" hint="Optional. Slides or a post, shown after the event.">
        <TextInput type="url" value={values.recapUrl ?? ''} onChange={set('recapUrl')} placeholder="https://" />
      </Field>

      <FormMessage error={error} />
      <div className="flex flex-wrap items-center gap-3 border-t border-line pt-5">
        <button type="submit" disabled={pending || uploadingPhotos} className={`${buttonClass()} disabled:opacity-60`}>
          {pending ? 'Saving…' : id ? 'Save changes' : 'Add event'}
        </button>
        <button type="button" onClick={onCancel} className={buttonClass('secondary')}>
          Cancel
        </button>
        {uploadingPhotos && <span className="text-sm text-muted">Waiting for photos to finish uploading…</span>}
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
            const d = eventDateBlock(event)
            const photoCount = event.photos?.length ?? 0
            return (
              <li
                key={event.id}
                className={`grid grid-cols-[4.5rem_1fr_auto] items-center gap-4 border-b border-line py-4 sm:grid-cols-[7rem_1fr_auto] ${
                  busyId === event.id ? 'opacity-50' : ''
                }`}
              >
                <div>
                  <p
                    className={`font-medium whitespace-nowrap tabular-nums ${d.range ? 'text-lg sm:text-xl' : 'text-2xl'}`}
                  >
                    {d.big}
                  </p>
                  <p className="text-xs text-muted">{d.small.split(',')[0]}</p>
                </div>
                <div className="min-w-0">
                  <p className="font-medium sm:truncate">{event.title}</p>
                  <p className="flex items-center gap-1.5 truncate text-sm text-muted">
                    {event.type} · {event.venue}
                    {photoCount > 0 && (
                      <>
                        {' '}
                        · <Images size={14} /> {photoCount}
                      </>
                    )}
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
  const uploads = useRef(new Set<string>())

  // Multi-day events stay upcoming until their last day is over
  const upcoming = events.filter((e) => eventEnd(e) >= today).sort((a, b) => a.date.localeCompare(b.date))
  const past = events.filter((e) => eventEnd(e) < today)

  const open = (target: ClubEvent | 'new') => {
    uploads.current.clear()
    setFormKey((k) => k + 1)
    setEditing(target)
  }
  // Closing without saving (Cancel, Escape or clicking outside) throws away photos uploaded meanwhile
  const close = useCallback(() => {
    const unsaved = [...uploads.current]
    uploads.current.clear()
    if (unsaved.length) void discardUploads(unsaved)
    setEditing(null)
  }, [])
  const saved = () => {
    setEditing(null)
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
        subtitle="Upcoming events show on the Home and Events pages. They move to Past after their last day."
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
          <EventForm
            key={formKey}
            initial={current ? toInput(current) : blank}
            id={current?.id}
            uploads={uploads}
            onSaved={saved}
            onCancel={close}
          />
        )}
      </Drawer>
    </>
  )
}
