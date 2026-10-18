import type { Accent } from '@/lib/accents'
import { dateParts } from '@/lib/dates'
import type { ClubEvent, EventType } from '@/lib/types'
import { Reveal } from './motion'
import { ButtonLink, Label } from './ui'

const typeTone: Record<EventType, Accent> = {
  Workshop: 'blue',
  Hackathon: 'red',
  Talk: 'yellow',
  Session: 'green',
  Techfest: 'yellow',
  Meetup: 'blue',
  Contest: 'red',
}

/** One event as a row in a list. Wrap rows in an element with `border-t border-line`. */
export default function EventRow({ event, past = false }: { event: ClubEvent; past?: boolean }) {
  const d = dateParts(event.date)
  const link = past ? event.recapUrl : event.registrationUrl

  return (
    <Reveal>
      <article className="grid gap-5 border-b border-line py-8 md:grid-cols-12 md:gap-8">
        <div className="flex items-baseline gap-4 md:col-span-2 md:block">
          <p className="text-5xl leading-none font-medium tracking-tight tabular-nums">{d.day}</p>
          <p className="text-sm text-muted md:mt-3">
            {d.month} {d.year}, {d.weekday}
          </p>
        </div>

        <div className="md:col-span-5">
          <Label tone={typeTone[event.type]}>{event.type}</Label>
          <h3 className="mt-2 text-2xl font-medium tracking-tight">{event.title}</h3>
          <p className="mt-2 max-w-2xl text-muted">{event.description}</p>
        </div>

        <dl className="grid grid-cols-[4.5rem_1fr] gap-x-3 gap-y-1.5 self-start text-sm md:col-span-3">
          {event.time && (
            <>
              <dt className="text-muted">Time</dt>
              <dd>{event.time}</dd>
            </>
          )}
          <dt className="text-muted">Venue</dt>
          <dd>{event.venue}</dd>
          <dt className="text-muted">Format</dt>
          <dd>{event.mode}</dd>
        </dl>

        <div className="self-start md:col-span-2 md:flex md:justify-end">
          {link && (
            <ButtonLink href={link} variant={past ? 'secondary' : 'primary'} icon="external">
              {past ? 'View recap' : 'Register'}
            </ButtonLink>
          )}
        </div>
      </article>
    </Reveal>
  )
}
