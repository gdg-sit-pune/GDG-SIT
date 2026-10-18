import type { Metadata } from 'next'
import { PageHeader } from '@/components/ui'
import TeamView from '@/components/views/TeamView'
import { getMembers } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Team',
  description: 'The organizers, faculty coordinator and domain teams behind GDG on Campus SIT Pune.',
}

export default async function TeamPage() {
  const members = await getMembers()
  return (
    <>
      <PageHeader
        title="The people behind the chapter."
        subtitle="Our organizers, faculty coordinator and domain teams: the people who plan the sessions, run the events and build with members."
      />
      <TeamView members={members} />
    </>
  )
}
