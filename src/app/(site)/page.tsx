import Link from 'next/link'
import EventRow from '@/components/EventRow'
import { ArrowRight, ArrowUpRight } from '@/components/icons'
import { Reveal } from '@/components/motion'
import { ArrowLink, ButtonLink, Container, Label, SectionHeader } from '@/components/ui'
import { domainCountWord, domains } from '@/data/domains'
import { site } from '@/data/site'
import { accentAt, accents } from '@/lib/accents'
import { autoStats, getEventGroups, getMembers, getStats } from '@/lib/content'
import { eventDateText } from '@/lib/dates'
import { cell, cellGrid } from '@/lib/styles'
import type { ClubEvent } from '@/lib/types'

const panelClass = 'group block h-full rounded-xs border border-line p-5 hover:border-fg'

function NextEventPanel({ next }: { next?: ClubEvent }) {
  if (!next) {
    return (
      <a href={site.communityUrl} target="_blank" rel="noreferrer" className={panelClass}>
        <div className="flex items-center justify-between">
          <Label tone="green">Next event</Label>
          <ArrowUpRight
            size={18}
            className="text-muted group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-fg"
          />
        </div>
        <p className="mt-4 text-xl font-medium tracking-tight">Announcing soon</p>
        <p className="mt-1 text-sm text-muted">Join the chapter to hear about it first.</p>
      </a>
    )
  }

  return (
    <Link href={`/events/${next.id}`} className={panelClass}>
      <div className="flex items-center justify-between">
        <Label tone="green">Next event</Label>
        <ArrowRight size={18} className="text-muted group-hover:translate-x-0.5 group-hover:text-fg" />
      </div>
      <p className="mt-4 text-xl font-medium tracking-tight">{next.title}</p>
      <p className="mt-1 text-sm text-muted">
        {eventDateText(next)} / {next.venue}
      </p>
    </Link>
  )
}

/** "500+" with the plus sign tinted. */
function StatValue({ value, index }: { value: string; index: number }) {
  if (!value.endsWith('+')) return <>{value}</>
  return (
    <>
      {value.slice(0, -1)}
      <span className={accents[accentAt(index)].text}>+</span>
    </>
  )
}

export default async function HomePage() {
  const [{ upcoming, today }, savedStats, members] = await Promise.all([getEventGroups(), getStats(), getMembers()])
  const stats = [...savedStats, ...autoStats(members)]

  return (
    <>
      {/* Hero */}
      <section className="border-b border-line">
        <Container className="pt-10 pb-10 lg:pt-14">
          <h1 className="text-[clamp(2.75rem,8.2vw,9rem)] leading-[0.95] font-medium tracking-[-0.04em]">
            <Reveal as="span" delay={60} className="block">
              Learn, <span className="text-ink-blue">build</span> and <span className="text-ink-green">grow</span>
              <br className="hidden sm:inline" /> with developers at SIT<span className="text-g-red">.</span>
            </Reveal>
          </h1>

          <div className="mt-10 grid gap-8 border-t border-line pt-8 sm:mt-14 lg:mt-20 lg:grid-cols-12">
            <Reveal delay={220} className="lg:col-span-5">
              <p className="max-w-xl text-lg text-muted">
                We&apos;re the GDG on Campus chapter at {site.college}. {domainCountWord} domains, from web development
                to design, and one community that learns by building. Every student is welcome, whatever your branch or
                experience.
              </p>
            </Reveal>
            <Reveal delay={280} className="flex flex-wrap items-start gap-3 lg:col-span-3">
              <ButtonLink href={site.communityUrl} icon="external">
                Join the chapter
              </ButtonLink>
              <ButtonLink to="/about" variant="secondary">
                About us
              </ButtonLink>
            </Reveal>
            <Reveal delay={340} className="lg:col-span-4">
              <NextEventPanel next={upcoming[0]} />
            </Reveal>
          </div>
        </Container>
      </section>

      {/* Stats */}
      <section className="py-16 lg:py-20">
        <Container>
          <Reveal className={`${cellGrid} grid-cols-2 lg:grid-cols-4`}>
            {stats.map((stat, i) => (
              <div key={stat.label} className={`${cell} p-5 sm:p-8`}>
                <p className="text-5xl font-medium tracking-tight tabular-nums lg:text-6xl">
                  <StatValue value={stat.value} index={i} />
                </p>
                <p className="mt-3 text-sm text-muted">{stat.label}</p>
              </div>
            ))}
          </Reveal>
        </Container>
      </section>

      {/* Domains */}
      <section className="pb-16 lg:pb-24">
        <Container>
          <SectionHeader
            index={1}
            label="Domains"
            title={`${domainCountWord} domains, one community`}
            description="Pick the domain that fits you, learn from peers, and build things you can show."
          />
          <div className={`${cellGrid} mt-12 sm:grid-cols-2 lg:grid-cols-4`}>
            {domains.map((d, i) => {
              const a = accents[accentAt(i)]
              return (
                <Reveal key={d.id} delay={(i % 4) * 70} className={`${cell} group relative p-6 sm:p-8`}>
                  {/* Color line draws across the top on hover */}
                  <span
                    className={`absolute -inset-x-px -top-px h-0.5 origin-left scale-x-0 group-hover:scale-x-100 ${a.bg}`}
                  />
                  <div className="flex items-start justify-between">
                    <d.icon size={32} weight="light" className={`${a.text} group-hover:-translate-y-1`} />
                    <span className="text-sm text-muted tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                  </div>
                  <h3 className="mt-8 text-2xl font-medium tracking-tight sm:mt-14">{d.name}</h3>
                  <p className="mt-2 text-muted">{d.description}</p>
                </Reveal>
              )
            })}
            <Reveal delay={3 * 70} className={cell}>
              <Link href="/contact" className="group block h-full bg-surface p-6 hover:bg-bg sm:p-8">
                <ArrowRight
                  size={32}
                  weight="light"
                  className="text-muted group-hover:translate-x-1 group-hover:text-fg"
                />
                <h3 className="mt-8 text-2xl font-medium tracking-tight sm:mt-14">Not sure where you fit?</h3>
                <p className="mt-2 text-muted">Talk to us and we&apos;ll help you pick a domain.</p>
              </Link>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* Upcoming events */}
      <section className="pb-16 lg:pb-24">
        <Container>
          <SectionHeader
            index={2}
            label="Events"
            title="Coming up next"
            action={<ArrowLink href="/events">All events</ArrowLink>}
          />
          <div className="mt-10 border-t border-line">
            {upcoming.length > 0 ? (
              upcoming.slice(0, 3).map((e) => <EventRow key={e.id} event={e} today={today} />)
            ) : (
              <Reveal className="grid gap-4 border-b border-line py-12 lg:grid-cols-12 lg:gap-8">
                <p className="text-2xl font-medium tracking-tight lg:col-span-5 lg:col-start-4">
                  New events are on the way.
                </p>
                <p className="text-muted lg:col-span-4">
                  Join the chapter or follow us on social media to hear about workshops, contests and hackathons as soon
                  as they&apos;re announced.
                </p>
              </Reveal>
            )}
          </div>
        </Container>
      </section>

      {/* Call to action */}
      <section className="border-t border-line bg-surface">
        <Container className="grid gap-8 py-16 lg:grid-cols-12 lg:items-end lg:py-24">
          <Reveal className="lg:col-span-8">
            <h2 className="text-4xl font-medium tracking-tight sm:text-5xl lg:text-6xl">
              Ready to start building? Join the chapter. It&apos;s free, and no experience is needed.
            </h2>
          </Reveal>
          <div className="lg:col-span-4 lg:flex lg:justify-end">
            <ButtonLink href={site.communityUrl} icon="external">
              Become a member
            </ButtonLink>
          </div>
        </Container>
      </section>
    </>
  )
}
