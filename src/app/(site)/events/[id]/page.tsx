import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { typeTone } from '@/components/EventRow'
import Gallery from '@/components/Gallery'
import { ArrowLeft } from '@/components/icons'
import { Reveal } from '@/components/motion'
import { ButtonLink, Container, Label, SectionHeader } from '@/components/ui'
import { getEvent, getEventGroups, getEvents } from '@/lib/content'
import { eventDateText, eventEnd, isOngoing } from '@/lib/dates'

// Known events are prerendered; events added later get their page on first visit.
export async function generateStaticParams() {
  const events = await getEvents()
  // At least one entry is needed for the build; 'none' simply renders "Event not found"
  return events.length ? events.map((e) => ({ id: e.id })) : [{ id: 'none' }]
}

export async function generateMetadata({ params }: PageProps<'/events/[id]'>): Promise<Metadata> {
  const { id } = await params
  const event = await getEvent(id)
  if (!event) return { title: 'Event not found' }
  const cover = event.photos?.[0]
  return {
    title: event.title,
    description: event.description,
    openGraph: {
      title: event.title,
      description: event.description,
      images: cover ? [{ url: cover.url, width: cover.width, height: cover.height }] : undefined,
    },
  }
}

async function EventDetails({ params }: Pick<PageProps<'/events/[id]'>, 'params'>) {
  const { id } = await params
  const [event, { today }] = await Promise.all([getEvent(id), getEventGroups()])
  if (!event) notFound()

  const past = eventEnd(event) < today
  const ongoing = isOngoing(event, today)
  const link = past ? event.recapUrl : event.registrationUrl
  const photos = event.photos ?? []
  const details = [
    { label: 'Date', value: eventDateText(event) },
    ...(event.time ? [{ label: 'Time', value: event.time }] : []),
    { label: 'Venue', value: event.venue },
    { label: 'Format', value: event.mode },
  ]

  return (
    <>
      <section className="border-b border-line">
        <Container className="pt-10 pb-12 lg:pt-14 lg:pb-16">
          <Reveal>
            <Link href="/events" className="group inline-flex items-center gap-2 text-sm text-muted hover:text-fg">
              <ArrowLeft size={16} className="group-hover:-translate-x-0.5" /> All events
            </Link>
            <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-1">
              <Label tone={typeTone[event.type]}>{event.type}</Label>
              {ongoing && <Label tone="green">Happening now</Label>}
              {past && <Label>Past event</Label>}
            </div>
          </Reveal>
          <h1 className="mt-4 max-w-5xl text-[2.6rem] leading-[1.05] font-medium tracking-[-0.03em] sm:text-6xl lg:text-7xl">
            <Reveal as="span" delay={80} className="block">
              {event.title}
            </Reveal>
          </h1>

          <Reveal delay={140} className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-8">
            <p className="max-w-2xl text-lg whitespace-pre-line text-muted lg:col-span-7">{event.description}</p>
            <div className="lg:col-span-4 lg:col-start-9">
              <dl className="border-t border-line">
                {details.map((d) => (
                  <div key={d.label} className="grid grid-cols-[5rem_1fr] gap-3 border-b border-line py-3 text-sm">
                    <dt className="text-muted">{d.label}</dt>
                    <dd>{d.value}</dd>
                  </div>
                ))}
              </dl>
              {link && (
                <ButtonLink href={link} variant={past ? 'secondary' : 'primary'} icon="external" className="mt-6">
                  {past ? 'View recap' : 'Register'}
                </ButtonLink>
              )}
            </div>
          </Reveal>
        </Container>
      </section>

      {photos.length > 0 && (
        <section className="py-16 lg:py-24">
          <Container>
            <SectionHeader
              index={1}
              label="Photos"
              title="Photos"
              description={`${photos.length} ${photos.length === 1 ? 'photo' : 'photos'} from ${event.title}.`}
            />
            <div className="mt-12">
              <Gallery photos={photos} title={event.title} />
            </div>
          </Container>
        </section>
      )}
    </>
  )
}

function EventSkeleton() {
  return (
    <Container className="pt-10 pb-12 lg:pt-14" aria-busy="true">
      <div className="h-4 w-24 rounded-xs bg-surface" />
      <div className="mt-10 h-16 max-w-3xl rounded-xs bg-surface" />
      <div className="mt-10 h-24 max-w-2xl rounded-xs bg-surface" />
    </Container>
  )
}

export default function EventPage({ params }: PageProps<'/events/[id]'>) {
  return (
    <Suspense fallback={<EventSkeleton />}>
      <EventDetails params={params} />
    </Suspense>
  )
}
