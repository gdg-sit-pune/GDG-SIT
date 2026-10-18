import type { Metadata } from 'next'
import { Suspense } from 'react'
import EventsManager from '@/components/admin/EventsManager'
import { AdminLoading } from '@/components/admin/AdminLoading'
import { listEvents } from '@/lib/admin-data'
import { requireAdmin } from '@/lib/auth'
import { todayInIndia } from '@/lib/dates'

export const metadata: Metadata = { title: 'Events' }

async function EventsAdmin() {
  await requireAdmin()
  const events = await listEvents()
  return <EventsManager events={events} today={todayInIndia(new Date())} />
}

export default function AdminEventsPage() {
  return (
    <Suspense fallback={<AdminLoading />}>
      <EventsAdmin />
    </Suspense>
  )
}
