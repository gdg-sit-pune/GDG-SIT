// Date helpers. Event dates are stored as YYYY-MM-DD in India time.

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
