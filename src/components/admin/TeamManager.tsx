'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useState, useTransition } from 'react'
import { deleteMember, importStartingContent, moveMember, saveMember, type MemberInput } from '@/app/admin/actions'
import { CaretDown, CaretUp, Pencil, Plus } from '@/components/icons'
import { MemberPhoto } from '@/components/MemberCard'
import { Label } from '@/components/ui'
import { domains, type DomainId } from '@/data/domains'
import { accentAt, accents } from '@/lib/accents'
import { buttonClass } from '@/lib/styles'
import { domainRoles, memberRoles, roleLabels, type Member, type MemberRole } from '@/lib/types'
import { AdminHeading, DeleteButton, Drawer, Field, FormMessage, IconButton, Select, TextInput } from './kit'

const rank: Record<MemberRole, number> = { organizer: 0, faculty: 1, lead: 2, colead: 3, coordinator: 4 }
const sortGroup = (a: Member, b: Member) => rank[a.role] - rank[b.role] || a.order - b.order

const toInput = (m: Member): MemberInput => ({
  name: m.name,
  role: m.role,
  domain: m.domain,
  photo: m.photo ?? '',
  linkedin: m.linkedin ?? '',
  github: m.github ?? '',
  instagram: m.instagram ?? '',
})

function MemberForm({ initial, id, onDone }: { initial: MemberInput; id?: string; onDone: () => void }) {
  const [values, setValues] = useState(initial)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const set = (key: keyof MemberInput) => (e: { target: { value: string } }) =>
    setValues((v) => ({ ...v, [key]: e.target.value }))
  const needsDomain = domainRoles.includes(values.role)
  const firstName =
    values.name
      .trim()
      .split(/\s+/)
      .find((p) => !/^(dr|prof|mr|mrs|ms)\.?$/i.test(p)) || 'Firstname'

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const result = await saveMember(values, id)
      if (result.ok) onDone()
      else setError(result.error)
    })
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <Field label="Name">
        <TextInput value={values.name} onChange={set('name')} required maxLength={80} autoFocus />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Role">
          <Select
            value={values.role}
            onChange={set('role')}
            options={memberRoles.map((r) => ({ value: r, label: roleLabels[r] }))}
          />
        </Field>
        {needsDomain && (
          <Field label="Domain">
            <Select
              value={values.domain ?? ''}
              onChange={set('domain')}
              options={[{ value: '', label: 'Pick a domain' }, ...domains.map((d) => ({ value: d.id, label: d.name }))]}
            />
          </Field>
        )}
      </div>
      <Field
        label="Photo"
        hint={`Leave empty to use /team/${firstName}.png from the public folder. Or enter another path, e.g. /team/photo.jpg`}
      >
        <TextInput value={values.photo ?? ''} onChange={set('photo')} placeholder={`/team/${firstName}.png`} />
      </Field>
      <Field label="LinkedIn" hint="Optional">
        <TextInput
          type="url"
          value={values.linkedin ?? ''}
          onChange={set('linkedin')}
          placeholder="https://linkedin.com/in/…"
        />
      </Field>
      <Field label="GitHub" hint="Optional">
        <TextInput type="url" value={values.github ?? ''} onChange={set('github')} placeholder="https://github.com/…" />
      </Field>
      <Field label="Instagram" hint="Optional">
        <TextInput
          type="url"
          value={values.instagram ?? ''}
          onChange={set('instagram')}
          placeholder="https://instagram.com/…"
        />
      </Field>

      <FormMessage error={error} />
      <div className="flex gap-3 border-t border-line pt-5">
        <button type="submit" disabled={pending} className={`${buttonClass()} disabled:opacity-60`}>
          {pending ? 'Saving…' : id ? 'Save changes' : 'Add person'}
        </button>
        <button type="button" onClick={onDone} className={buttonClass('secondary')}>
          Cancel
        </button>
      </div>
    </form>
  )
}

function ImportPanel({ onDone }: { onDone: () => void }) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  return (
    <div className="mt-10 rounded-xs border border-line p-6">
      <Label tone="blue">First time here?</Label>
      <p className="mt-2 max-w-2xl">
        The team list is empty. Import the current team (organizers, faculty coordinator and every domain team) and the
        home page stats, then edit from there.
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-4">
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const result = await importStartingContent()
              if (result.ok) onDone()
              else setError(result.error)
            })
          }
          className={`${buttonClass()} disabled:opacity-60`}
        >
          {pending ? 'Importing…' : 'Import starting content'}
        </button>
        <FormMessage error={error} />
      </div>
    </div>
  )
}

export default function TeamManager({ members }: { members: Member[] }) {
  const router = useRouter()
  const [editing, setEditing] = useState<{ member?: Member; preset?: Partial<MemberInput> } | null>(null)
  const [formKey, setFormKey] = useState(0)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const groups: {
    key: string
    title: string
    accent?: string
    icon?: (typeof domains)[number]['icon']
    people: Member[]
    preset: Partial<MemberInput>
  }[] = [
    {
      key: 'leadership',
      title: 'Leadership',
      people: members.filter((m) => !m.domain).sort(sortGroup),
      preset: { role: 'organizer' },
    },
    ...domains.map((d, i) => ({
      key: d.id,
      title: d.name,
      accent: accents[accentAt(i)].text,
      icon: d.icon,
      people: members.filter((m) => m.domain === d.id).sort(sortGroup),
      preset: { role: 'coordinator' as MemberRole, domain: d.id as DomainId },
    })),
  ]

  const open = (target: { member?: Member; preset?: Partial<MemberInput> }) => {
    setFormKey((k) => k + 1)
    setEditing(target)
  }
  const close = useCallback(() => setEditing(null), [])
  const done = () => {
    close()
    router.refresh()
  }

  const run = async (id: string, action: () => Promise<{ ok: boolean; error?: string }>) => {
    setBusyId(id)
    setError(null)
    const result = await action()
    setBusyId(null)
    if (result.ok) router.refresh()
    else setError(result.error ?? 'Something went wrong.')
  }

  const blank: MemberInput = { name: '', role: 'coordinator', photo: '', linkedin: '', github: '', instagram: '' }
  const initial = editing?.member ? toInput(editing.member) : { ...blank, ...editing?.preset }

  return (
    <>
      <AdminHeading
        title="Team"
        subtitle={`${members.length} people. Order within a group is the order shown on the Team page.`}
        action={
          <button type="button" onClick={() => open({})} className={buttonClass()}>
            <Plus size={16} /> Add person
          </button>
        }
      />
      <div className="mt-4">
        <FormMessage error={error} />
      </div>

      {members.length === 0 && <ImportPanel onDone={() => router.refresh()} />}

      {groups.map((group) => (
        <section key={group.key} className="mt-12">
          <div className="flex items-center justify-between gap-4">
            <p className="flex items-center gap-2 text-sm text-muted">
              {group.icon && <group.icon size={18} className={group.accent} />}
              <span className="text-fg">{group.title}</span>
              <span className="tabular-nums">({group.people.length})</span>
            </p>
            <button
              type="button"
              onClick={() => open({ preset: group.preset })}
              className="group/btn inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg"
            >
              <Plus size={14} className="group-hover/btn:rotate-90" /> Add
            </button>
          </div>

          {group.people.length === 0 ? (
            <p className="mt-3 border-y border-line py-6 text-sm text-muted">No one yet. Hidden on the Team page.</p>
          ) : (
            <ul className="mt-3 border-t border-line">
              {group.people.map((m) => {
                const sameRole = group.people.filter((p) => p.role === m.role)
                const index = sameRole.findIndex((p) => p.id === m.id)
                return (
                  <li
                    key={m.id}
                    className={`grid grid-cols-[3rem_1fr_auto] items-center gap-4 border-b border-line py-3 ${
                      busyId === m.id ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="size-12 overflow-hidden rounded-xs bg-surface">
                      <MemberPhoto member={m} className="text-sm" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{m.name}</p>
                      <p className="truncate text-sm text-muted">{roleLabels[m.role]}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <IconButton
                        label="Move up"
                        disabled={index <= 0 || busyId !== null}
                        onClick={() => run(m.id, () => moveMember(m.id, 'up'))}
                      >
                        <CaretUp size={16} />
                      </IconButton>
                      <IconButton
                        label="Move down"
                        disabled={index >= sameRole.length - 1 || busyId !== null}
                        onClick={() => run(m.id, () => moveMember(m.id, 'down'))}
                      >
                        <CaretDown size={16} />
                      </IconButton>
                      <IconButton label="Edit" onClick={() => open({ member: m })}>
                        <Pencil size={18} />
                      </IconButton>
                      <DeleteButton onConfirm={() => run(m.id, () => deleteMember(m.id))} disabled={busyId === m.id} />
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      ))}

      <Drawer open={editing !== null} title={editing?.member ? 'Edit person' : 'New person'} onClose={close}>
        {editing !== null && <MemberForm key={formKey} initial={initial} id={editing.member?.id} onDone={done} />}
      </Drawer>
    </>
  )
}
