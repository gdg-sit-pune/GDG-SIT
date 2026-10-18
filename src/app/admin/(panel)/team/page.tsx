import type { Metadata } from 'next'
import { Suspense } from 'react'
import { AdminLoading } from '@/components/admin/AdminLoading'
import TeamManager from '@/components/admin/TeamManager'
import { listMembers } from '@/lib/admin-data'
import { requireAdmin } from '@/lib/auth'

export const metadata: Metadata = { title: 'Team' }

async function TeamAdmin() {
  await requireAdmin()
  const members = await listMembers()
  return <TeamManager members={members} />
}

export default function AdminTeamPage() {
  return (
    <Suspense fallback={<AdminLoading />}>
      <TeamAdmin />
    </Suspense>
  )
}
