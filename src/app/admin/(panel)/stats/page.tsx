import type { Metadata } from 'next'
import { Suspense } from 'react'
import { AdminLoading } from '@/components/admin/AdminLoading'
import StatsManager from '@/components/admin/StatsManager'
import { seedStats } from '@/data/seed'
import { readStats } from '@/lib/admin-data'
import { requireAdmin } from '@/lib/auth'

export const metadata: Metadata = { title: 'Stats' }

async function StatsAdmin() {
  await requireAdmin()
  const stats = await readStats()
  return <StatsManager stats={stats ?? seedStats} />
}

export default function AdminStatsPage() {
  return (
    <Suspense fallback={<AdminLoading />}>
      <StatsAdmin />
    </Suspense>
  )
}
