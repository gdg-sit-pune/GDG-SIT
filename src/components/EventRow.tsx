import Image from 'next/image'
import Link from 'next/link'
import type { Accent } from '@/lib/accents'
import { eventDateBlock, isOngoing } from '@/lib/dates'
import type { ClubEvent, EventType } from '@/lib/types'
import { ArrowRight } from './icons'
import { Reveal } from './motion'
import { ButtonLink, Label } from './ui'

export const typeTone: Record<EventType, Accent> = {
  Workshop: 'blue',
  Hackathon: 'red',
  Talk: 'yellow',
  Session: 'green',
  Techfest: 'yellow',
  Meetup: 'blue',
  Contest: 'red',
}

const PREVIEW_PHOTOS = 4

/** One event as a row in a list. Wrap rows in an element with `border-t border-line`. */
export default function EventRow({
  event,
  past = false,
  today,
}: {
  event: ClubEvent
  past?: boolean
  /** YYYY-MM-DD, used to show "Happening now" */
  today: string
}) {
  const d = eventDateBlock(event)
  const link = past ? event.recapUrl : event.registrationUrl
  const href = `/events/${event.id}`
  const photos = event.photos ?? []
  const ongoing = isOngoing(event, today)

  return (
    <Reveal>
      <article className="grid gap-5 border-b border-line py-8 md:grid-cols-12 md:gap-8">
        <div className="flex items-baseline gap-4 md:col-span-2 md:block">
          <p
            className={`leading-none font-medium tracking-tight whitespace-nowrap tabular-nums ${
              d.range ? 'text-4xl md:text-3xl lg:text-4xl' : 'text-5xl'
            }`}
          >
            {d.big}
          </p>
          <p className="text-sm text-muted md:mt-3">{d.small}</p>
        </div>

        <div className="md:col-span-5">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <Label tone={typeTone[event.type]}>{event.type}</Label>
            {ongoing && <Label tone="green">Happening now</Label>}
          </div>
          <h3 className="mt-2 text-2xl font-medium tracking-tight">
            <Link href={href} className="hover:text-ink-blue">
              {event.title}
            </Link>
          </h3>
          <p className="mt-2 max-w-2xl text-muted">{event.description}</p>

          {photos.length > 0 && (
            <Link href={href} className="group mt-4 flex gap-2" aria-label={`See ${photos.length} photos`}>
              {photos.slice(0, PREVIEW_PHOTOS).map((photo, i) => (
                <span key={photo.url} className="relative size-16 overflow-hidden rounded-xs bg-surface sm:size-20">
                  <Image src={photo.url} alt="" fill sizes="80px" className="object-cover group-hover:scale-105" />
                  {i === PREVIEW_PHOTOS - 1 && photos.length > PREVIEW_PHOTOS && (
                    <span className="absolute inset-0 grid place-items-center bg-black/55 text-sm font-medium text-white">
                      +{photos.length - PREVIEW_PHOTOS + 1}
                    </span>
                  )}
                </span>
              ))}
            </Link>
          )}
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

        <div className="flex flex-wrap items-center gap-x-5 gap-y-3 self-start md:col-span-2 md:flex-col md:items-end">
          {link && (
            <ButtonLink href={link} variant={past ? 'secondary' : 'primary'} icon="external">
              {past ? 'View recap' : 'Register'}
            </ButtonLink>
          )}
          <Link
            href={href}
            className="group/btn inline-flex items-center gap-2 text-sm font-medium hover:text-ink-blue"
          >
            Details <ArrowRight size={16} className="group-hover/btn:translate-x-0.5" />
          </Link>
        </div>
      </article>
    </Reveal>
  )
}
