import 'server-only'
import { adminDb } from './firebase-admin'
import { isAutoStat, type ClubEvent, type Member, type Stat } from './types'

// Fresh (uncached) reads for the admin panel, so editors always see the latest data.
// Call these only after requireAdmin().

export async function listEvents(): Promise<ClubEvent[]> {
  const snap = await adminDb().collection('events').get()
  return snap.docs
    .map((doc) => ({ ...(doc.data() as Omit<ClubEvent, 'id'>), id: doc.id }))
    .sort((a, b) => b.date.localeCompare(a.date))
}

export async function listMembers(): Promise<Member[]> {
  const snap = await adminDb().collection('members').get()
  return snap.docs
    .map((doc) => ({ ...(doc.data() as Omit<Member, 'id'>), id: doc.id }))
    .sort((a, b) => a.order - b.order)
}

/** The stats list, or null if it has never been saved. */
export async function readStats(): Promise<Stat[] | null> {
  const doc = await adminDb().collection('site').doc('stats').get()
  return doc.exists ? ((doc.data()?.items as Stat[]) ?? []).filter((s) => !isAutoStat(s)) : null
}
