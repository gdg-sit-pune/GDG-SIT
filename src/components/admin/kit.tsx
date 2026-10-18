'use client'

// Small building blocks shared by the admin screens.

import { useEffect, useId, useState, type ReactNode } from 'react'
import { Close, Trash } from '@/components/icons'
import SelectBox from '@/components/Select'
import { fieldClass } from '@/lib/styles'

/** Page heading with an optional action on the right. */
export function AdminHeading({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-6 border-b border-line pb-8">
      <div>
        <h1 className="text-4xl font-medium tracking-tight sm:text-5xl">{title}</h1>
        {subtitle && <p className="mt-3 text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  )
}

/** Panel that slides in from the right, used for add/edit forms. */
export function Drawer({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean
  title: string
  onClose: () => void
  children: ReactNode
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  return (
    <div className={`fixed inset-0 z-50 ${open ? '' : 'pointer-events-none'}`} inert={!open} aria-hidden={!open}>
      <div className={`absolute inset-0 bg-black/40 ${open ? 'opacity-100' : 'opacity-0'}`} onClick={onClose} />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`absolute inset-y-0 right-0 flex w-full max-w-xl flex-col border-l border-line bg-bg ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-6">
          <h2 className="text-lg font-medium">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid size-9 place-items-center rounded-xs border border-line hover:border-fg active:scale-95"
          >
            <Close size={18} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>
      </aside>
    </div>
  )
}

/** Label + control. Pass the control as children, or use the helpers below. */
export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block text-sm font-medium">
      {label}
      {children}
      {hint && <span className="mt-1.5 block text-xs font-normal text-muted">{hint}</span>}
    </label>
  )
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${fieldClass} h-12`} />
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={4} {...props} className={`${fieldClass} resize-y py-3`} />
}

export function Select({
  options,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { options: { value: string; label: string }[] }) {
  return (
    <SelectBox {...props}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </SelectBox>
  )
}

/** Inline error or success message under a form. */
export function FormMessage({ error }: { error?: string | null }) {
  const id = useId()
  if (!error) return null
  return (
    <p id={id} role="alert" className="text-sm text-ink-red">
      {error}
    </p>
  )
}

const iconButton =
  'grid size-9 place-items-center rounded-xs border border-transparent text-muted hover:border-line hover:text-fg active:scale-95 disabled:opacity-40 disabled:hover:border-transparent'

/** Small square icon button for row actions. */
export function IconButton({
  label,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button type="button" aria-label={label} title={label} className={iconButton} {...props}>
      {children}
    </button>
  )
}

/** Delete needs two clicks: the first arms it, the second confirms. Resets after 4 seconds. */
export function DeleteButton({ onConfirm, disabled }: { onConfirm: () => void; disabled?: boolean }) {
  const [armed, setArmed] = useState(false)

  useEffect(() => {
    if (!armed) return
    const t = setTimeout(() => setArmed(false), 4000)
    return () => clearTimeout(t)
  }, [armed])

  if (armed) {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          setArmed(false)
          onConfirm()
        }}
        className="h-9 rounded-xs border border-ink-red px-3 text-sm text-ink-red hover:bg-g-red hover:text-white active:scale-95"
      >
        Delete?
      </button>
    )
  }
  return (
    <IconButton label="Delete" disabled={disabled} onClick={() => setArmed(true)}>
      <Trash size={18} />
    </IconButton>
  )
}
