import 'server-only'
import { cacheLife, cacheTag } from 'next/cache'
import { seedEvents, seedMembers, seedStats } from '@/data/seed'
import { todayInIndia } from './dates'
import { adminDb, firebaseConfigured } from './firebase-admin'
import { domains } from '@/data/domains'
import { isAutoStat, type ClubEvent, type Member, type Stat } from './types'

// Public reads. Results are cached and refreshed instantly when the admin panel
// saves a change (it calls updateTag with the same tag names).

export const tags = { events: 'events', members: 'members', stats: 'stats' } as const

async function readCollection<T>(name: string): Promise<(T & { id: string })[]> {
  const snap = await adminDb().collection(name).get()
  return snap.docs.map((doc) => ({ ...(doc.data() as T), id: doc.id }))
}

export async function getEvents(): Promise<ClubEvent[]> {
  'use cache'
  cacheLife('hours')
  cacheTag(tags.events)
  if (!firebaseConfigured) return seedEvents
  try {
    return await readCollection<ClubEvent>('events')
  } catch (error) {
    console.error('Could not load events from Firebase', error)
    return seedEvents
  }
}

/** Events split into upcoming (soonest first) and past (latest first). */
export async function getEventGroups(): Promise<{ upcoming: ClubEvent[]; past: ClubEvent[] }> {
  'use cache'
  cacheLife('hours')
  cacheTag(tags.events)
  const events = await getEvents()
  const today = todayInIndia(new Date())
  return {
    upcoming: events.filter((e) => e.date >= today).sort((a, b) => a.date.localeCompare(b.date)),
    past: events.filter((e) => e.date < today).sort((a, b) => b.date.localeCompare(a.date)),
  }
}

export async function getMembers(): Promise<Member[]> {
  'use cache'
  cacheLife('hours')
  cacheTag(tags.members)
  if (!firebaseConfigured) return seedMembers
  try {
    const members = await readCollection<Member>('members')
    return members.sort((a, b) => a.order - b.order)
  } catch (error) {
    console.error('Could not load team from Firebase', error)
    return seedMembers
  }
}

export async function getStats(): Promise<Stat[]> {
  'use cache'
  cacheLife('hours')
  cacheTag(tags.stats)
  if (!firebaseConfigured) return seedStats
  try {
    const doc = await adminDb().collection('site').doc('stats').get()
    return ((doc.data()?.items as Stat[] | undefined) ?? []).filter((s) => !isAutoStat(s))
  } catch (error) {
    console.error('Could not load stats from Firebase', error)
    return seedStats
  }
}

/** Stats counted from the site's own data, so they never go stale. */
export function autoStats(members: Member[]): Stat[] {
  const students = members.filter((m) => m.role !== 'faculty')
  return [
    { value: String(domains.length), label: 'Domains' },
    { value: String(students.length), label: 'Team members' },
  ]
}
