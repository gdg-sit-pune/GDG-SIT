'use client'

import { useState, type ReactNode } from 'react'
import MemberCard from '@/components/MemberCard'
import { Reveal } from '@/components/motion'
import { ButtonLink, Container, SectionHeader } from '@/components/ui'
import { domains, type DomainId } from '@/data/domains'
import { accentAt, accents, type Accent } from '@/lib/accents'
import { cellGrid } from '@/lib/styles'
import type { Member, MemberRole } from '@/lib/types'

// A domain's color matches its position on the Home page
const domainAccent = (id: DomainId): Accent => accentAt(domains.findIndex((d) => d.id === id))

const rank: Record<MemberRole, number> = { organizer: 0, faculty: 1, lead: 2, colead: 3, coordinator: 4 }
const byRoleThenOrder = (a: Member, b: Member) => rank[a.role] - rank[b.role] || a.order - b.order

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex h-9 items-center gap-2 rounded-xs border px-3 text-sm active:scale-[0.97] ${
        active ? 'border-fg bg-fg text-bg' : 'border-line text-muted hover:border-fg hover:text-fg'
      }`}
    >
      {children}
    </button>
  )
}

export default function TeamView({ members }: { members: Member[] }) {
  const [filter, setFilter] = useState<DomainId | 'all'>('all')

  const leadership = members.filter((m) => m.role === 'organizer' || m.role === 'faculty').sort(byRoleThenOrder)
  const teams = domains
    .map((d) => ({ domain: d, people: members.filter((m) => m.domain === d.id).sort(byRoleThenOrder) }))
    .filter((t) => t.people.length > 0)
  const shown = filter === 'all' ? teams : teams.filter((t) => t.domain.id === filter)

  return (
    <>
      {leadership.length > 0 && (
        <section className="py-16 lg:py-24">
          <Container>
            <SectionHeader
              index={1}
              label="Leadership"
              title="Leadership"
              description="Two student organizers run the chapter, supported by our faculty coordinator."
            />
            <div className="mt-12 lg:grid lg:grid-cols-12 lg:gap-8">
              {/* Same card size as the domain teams below */}
              <Reveal className={`${cellGrid} grid-cols-1 sm:grid-cols-2 lg:col-span-9 lg:col-start-4 xl:grid-cols-4`}>
                {leadership.map((member, i) => (
                  <MemberCard key={member.id} member={member} accent={accentAt(i)} />
                ))}
              </Reveal>
            </div>
          </Container>
        </section>
      )}

      {teams.length > 0 && (
        <section className={leadership.length > 0 ? 'pb-16 lg:pb-24' : 'py-16 lg:py-24'}>
          <Container>
            <SectionHeader index={leadership.length > 0 ? 2 : 1} label="Domains" title="Domain teams" />

            <Reveal className="mt-10 flex flex-wrap gap-2 lg:ml-[25%]">
              <FilterChip active={filter === 'all'} onClick={() => setFilter('all')}>
                All domains
              </FilterChip>
              {teams.map(({ domain: d }) => (
                <FilterChip key={d.id} active={filter === d.id} onClick={() => setFilter(d.id)}>
                  <d.icon size={16} className={accents[domainAccent(d.id)].text} />
                  {d.name}
                </FilterChip>
              ))}
            </Reveal>

            {/* Keyed by filter so the list fades in again when it changes */}
            <div key={filter} className="mt-12 animate-page-in">
              {shown.map(({ domain: d, people }) => {
                const accent = domainAccent(d.id)
                return (
                  <Reveal key={d.id} className="grid gap-6 border-t border-line py-10 lg:grid-cols-12 lg:gap-8">
                    <div className="lg:col-span-3">
                      <d.icon size={28} weight="light" className={accents[accent].text} />
                      <h3 className="mt-4 text-2xl font-medium tracking-tight">{d.name}</h3>
                      <p className="mt-1 text-sm text-muted">
                        {people.length} {people.length === 1 ? 'member' : 'members'}
                      </p>
                    </div>
                    <div className={`${cellGrid} grid-cols-1 sm:grid-cols-2 lg:col-span-9 xl:grid-cols-4`}>
                      {people.map((member) => (
                        <MemberCard key={member.id} member={member} accent={accent} />
                      ))}
                    </div>
                  </Reveal>
                )
              })}
            </div>
          </Container>
        </section>
      )}

      <section className="border-t border-line bg-surface">
        <Container className="grid gap-8 py-16 lg:grid-cols-12 lg:items-end lg:py-20">
          <Reveal className="lg:col-span-8">
            <h2 className="text-4xl font-medium tracking-tight sm:text-5xl">Want to join the team?</h2>
            <p className="mt-4 max-w-xl text-lg text-muted">
              We open applications at the start of every academic year. Get in touch and we&apos;ll let you know when
              they open.
            </p>
          </Reveal>
          <div className="lg:col-span-4 lg:flex lg:justify-end">
            <ButtonLink to="/contact" icon="arrow">
              Contact us
            </ButtonLink>
          </div>
        </Container>
      </section>
    </>
  )
}
