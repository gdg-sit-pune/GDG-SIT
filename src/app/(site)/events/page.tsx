import type { Metadata } from 'next'
import { PageHeader } from '@/components/ui'
import EventsView from '@/components/views/EventsView'
import { getEventGroups } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Events',
  description: 'Hackathons, domain sessions, hands-on workshops and college tech events. See what is coming up.',
}

export default async function EventsPage() {
  const { upcoming, past } = await getEventGroups()
  return (
    <>
      <PageHeader
        title="Workshops, hackathons and more."
        subtitle="See what's coming up and catch up on what you missed. Most events are free and open to every student."
      />
      <EventsView upcoming={upcoming} past={past} />
    </>
  )
}
