// Date helpers. Event dates are stored as YYYY-MM-DD in India time.

import type { ClubEvent } from './types'

/** Today's date in India as YYYY-MM-DD. */
export function todayInIndia(now: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(now)
}

/** Split a date into display parts: { day: '07', month: 'Nov', year: '2026', weekday: 'Sat' } */
export function dateParts(date: string) {
  const [y, m, d] = date.split('-').map(Number)
  const value = new Date(Date.UTC(y, m - 1, d))
  const format = (options: Intl.DateTimeFormatOptions) =>
    value.toLocaleDateString('en-IN', { ...options, timeZone: 'UTC' })
  return {
    day: String(d).padStart(2, '0'),
    month: format({ month: 'short' }),
    year: String(y),
    weekday: format({ weekday: 'short' }),
  }
}

/** The event's last day (its only day, for one-day events). */
export const eventEnd = (event: Pick<ClubEvent, 'date' | 'endDate'>) => event.endDate || event.date

const isMultiDay = (event: Pick<ClubEvent, 'date' | 'endDate'>) =>
  Boolean(event.endDate && event.endDate !== event.date)

/** "Sat, 14 Nov 2026", "14–16 Nov 2026", "30 Nov – 2 Dec 2026" or "30 Dec 2026 – 2 Jan 2027" */
export function eventDateText(event: Pick<ClubEvent, 'date' | 'endDate'>): string {
  const s = dateParts(event.date)
  if (!isMultiDay(event)) return `${s.weekday}, ${Number(s.day)} ${s.month} ${s.year}`
  const e = dateParts(eventEnd(event))
  if (s.year !== e.year) return `${Number(s.day)} ${s.month} ${s.year} – ${Number(e.day)} ${e.month} ${e.year}`
  if (s.month !== e.month) return `${Number(s.day)} ${s.month} – ${Number(e.day)} ${e.month} ${e.year}`
  return `${Number(s.day)}–${Number(e.day)} ${s.month} ${s.year}`
}

/** Big day number(s) plus a small line, for date blocks: { big: '14–16', small: 'Nov 2026, Sat–Mon' } */
export function eventDateBlock(event: Pick<ClubEvent, 'date' | 'endDate'>): {
  big: string
  small: string
  range: boolean
} {
  const s = dateParts(event.date)
  if (!isMultiDay(event)) return { big: s.day, small: `${s.month} ${s.year}, ${s.weekday}`, range: false }
  const e = dateParts(eventEnd(event))
  const small =
    s.year !== e.year
      ? `${s.month} ${s.year} – ${e.month} ${e.year}`
      : s.month !== e.month
        ? `${s.month}–${e.month} ${s.year}`
        : `${s.month} ${s.year}, ${s.weekday}–${e.weekday}`
  return { big: `${s.day}–${e.day}`, small, range: true }
}

/** Whether an event is happening today (multi-day events count every day in their range). */
export const isOngoing = (event: Pick<ClubEvent, 'date' | 'endDate'>, today: string) =>
  event.date <= today && eventEnd(event) >= today
