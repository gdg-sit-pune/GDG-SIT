'use server'

import { updateTag } from 'next/cache'
import { cookies } from 'next/headers'
import { after } from 'next/server'
import { redirect } from 'next/navigation'
import { domains, type DomainId } from '@/data/domains'
import { seedMembers, seedStats } from '@/data/seed'
import { getAdmin, isAdminEmail } from '@/lib/auth'
import { ADMIN_HINT_COOKIE, SESSION_COOKIE, SESSION_DAYS } from '@/lib/session-cookies'
import { tags } from '@/lib/content'
import { adminAuth, adminDb, firebaseConfigured } from '@/lib/firebase-admin'
import { cleanPhotos, deleteOrphanPhotos, deletePhotos, isBlobUrl } from '@/lib/photos'
import {
  domainRoles,
  eventModes,
  eventTypes,
  isAutoStat,
  memberRoles,
  type ClubEvent,
  type EventPhoto,
  type Member,
  type Stat,
} from '@/lib/types'

export type ActionResult = { ok: true } | { ok: false; error: string }

const fail = (error: string): ActionResult => ({ ok: false, error })
const notSignedIn = fail('Your session has ended. Sign in again.')

/* ---------- Sign in / out ---------- */

/** Exchanges a fresh Google sign-in for a session cookie, if the account is an admin. */
export async function startSession(idToken: string): Promise<ActionResult> {
  if (!firebaseConfigured) return fail('Firebase is not set up yet.')
  try {
    const decoded = await adminAuth().verifyIdToken(idToken)
    if (!decoded.email_verified || !isAdminEmail(decoded.email)) {
      return fail(`${decoded.email ?? 'This account'} is not on the admin list.`)
    }
    // Only accept a sign-in from the last 5 minutes
    if (Date.now() / 1000 - decoded.auth_time > 5 * 60) return fail('Please sign in again.')

    const expiresIn = SESSION_DAYS * 24 * 60 * 60 * 1000
    const session = await adminAuth().createSessionCookie(idToken, { expiresIn })
    const jar = await cookies()
    const options = {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      path: '/',
      maxAge: expiresIn / 1000,
    }
    jar.set(SESSION_COOKIE, session, { ...options, httpOnly: true })
    // Readable by the page so the navbar can show an "Admin" button; grants no access
    jar.set(ADMIN_HINT_COOKIE, '1', options)
    return { ok: true }
  } catch {
    return fail('Sign-in could not be verified. Please try again.')
  }
}

export async function signOutAction() {
  const jar = await cookies()
  jar.delete(SESSION_COOKIE)
  jar.delete(ADMIN_HINT_COOKIE)
  redirect('/admin/login')
}

/* ---------- Validation helpers ---------- */

const text = (value: unknown, max: number) => (typeof value === 'string' ? value.trim().slice(0, max) : '')

function optionalUrl(value: unknown, label: string): string | undefined | Error {
  const v = text(value, 500)
  if (!v) return undefined
  try {
    const url = new URL(v)
    if (url.protocol !== 'https:' && url.protocol !== 'http:') throw new Error()
    return url.toString()
  } catch {
    return new Error(`${label} must be a full link starting with https://`)
  }
}

/** Drops keys whose value is undefined (Firestore rejects them). */
function clean<T extends object>(obj: T): T {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as T
}

/* ---------- Events ---------- */

export type EventInput = Omit<ClubEvent, 'id'>

const isoDate = /^\d{4}-\d{2}-\d{2}$/

export async function saveEvent(input: EventInput, id?: string): Promise<ActionResult> {
  if (!(await getAdmin())) return notSignedIn

  const title = text(input.title, 120)
  const date = text(input.date, 10)
  const endDate = text(input.endDate, 10)
  const venue = text(input.venue, 120)
  const description = text(input.description, 1000)
  if (!title) return fail('Add a title.')
  if (!isoDate.test(date)) return fail('Pick a start date.')
  if (endDate && !isoDate.test(endDate)) return fail('The end date is not valid.')
  if (endDate && endDate < date) return fail("The end date can't be before the start date.")
  if (!venue) return fail('Add a venue.')
  if (!description) return fail('Add a short description.')
  if (!eventTypes.includes(input.type)) return fail('Pick an event type.')
  if (!eventModes.includes(input.mode)) return fail('Pick a format.')

  const registrationUrl = optionalUrl(input.registrationUrl, 'Registration link')
  const recapUrl = optionalUrl(input.recapUrl, 'Recap link')
  if (registrationUrl instanceof Error) return fail(registrationUrl.message)
  if (recapUrl instanceof Error) return fail(recapUrl.message)

  const photos = cleanPhotos(input.photos)
  if (typeof photos === 'string') return fail(photos)

  const event = clean({
    title,
    date,
    // One-day events don't store an end date
    endDate: endDate && endDate !== date ? endDate : undefined,
    time: text(input.time, 60) || undefined,
    venue,
    mode: input.mode,
    type: input.type,
    description,
    registrationUrl,
    recapUrl,
    photos: photos.length ? photos : undefined,
  })

  const events = adminDb().collection('events')
  if (id) {
    const before = ((await events.doc(id).get()).data()?.photos as EventPhoto[] | undefined) ?? []
    await events.doc(id).set(event)
    // Photos taken out of the event are deleted from storage
    const kept = new Set(photos.map((p) => p.url))
    await deletePhotos(before.map((p) => p.url).filter((url) => !kept.has(url)))
  } else {
    await events.add(event)
  }
  updateTag(tags.events)
  // Sweep up any photos left behind by unsaved edits
  after(deleteOrphanPhotos)
  return { ok: true }
}

export async function deleteEvent(id: string): Promise<ActionResult> {
  if (!(await getAdmin())) return notSignedIn
  const doc = adminDb().collection('events').doc(id)
  const photos = ((await doc.get()).data()?.photos as EventPhoto[] | undefined) ?? []
  await doc.delete()
  await deletePhotos(photos.map((p) => p.url))
  updateTag(tags.events)
  return { ok: true }
}

/** Deletes photos that were uploaded in the editor but never saved (e.g. the edit was cancelled). */
export async function discardUploads(urls: string[]): Promise<ActionResult> {
  if (!(await getAdmin())) return notSignedIn
  if (Array.isArray(urls)) await deletePhotos(urls.slice(0, 100))
  return { ok: true }
}

/* ---------- Team ---------- */

export type MemberInput = Omit<Member, 'id' | 'order'>

const isDomain = (value: unknown): value is DomainId => domains.some((d) => d.id === value)

export async function saveMember(input: MemberInput, id?: string): Promise<ActionResult> {
  if (!(await getAdmin())) return notSignedIn

  const name = text(input.name, 80)
  if (!name) return fail('Add a name.')
  if (!memberRoles.includes(input.role)) return fail('Pick a role.')
  const needsDomain = domainRoles.includes(input.role)
  if (needsDomain && !isDomain(input.domain)) return fail('Pick a domain for this role.')

  // Only uploaded photos are kept; anything else (like an old /team/ path) counts as no photo
  const rawPhoto = text(input.photo, 500)
  const photo = isBlobUrl(rawPhoto) ? rawPhoto : ''

  const links = {
    linkedin: optionalUrl(input.linkedin, 'LinkedIn link'),
    github: optionalUrl(input.github, 'GitHub link'),
    instagram: optionalUrl(input.instagram, 'Instagram link'),
  }
  for (const value of Object.values(links)) if (value instanceof Error) return fail(value.message)

  const members = adminDb().collection('members')
  const data = clean({
    name,
    role: input.role,
    domain: needsDomain ? input.domain : undefined,
    photo: photo || undefined,
    ...(links as Record<string, string | undefined>),
  })

  if (id) {
    const existing = (await members.doc(id).get()).data()
    await members.doc(id).set({ ...data, order: existing?.order ?? Date.now() })
    // A replaced or removed photo is deleted from storage
    const oldPhoto = existing?.photo as string | undefined
    if (oldPhoto && oldPhoto !== photo) await deletePhotos([oldPhoto])
  } else {
    // New people go to the end of their group
    const last = await members.orderBy('order', 'desc').limit(1).get()
    const order = (last.docs[0]?.data().order ?? -1) + 1
    await members.add({ ...data, order })
  }
  updateTag(tags.members)
  // Sweep up any photos left behind by unsaved edits
  after(deleteOrphanPhotos)
  return { ok: true }
}

export async function deleteMember(id: string): Promise<ActionResult> {
  if (!(await getAdmin())) return notSignedIn
  const doc = adminDb().collection('members').doc(id)
  const photo = (await doc.get()).data()?.photo as string | undefined
  await doc.delete()
  if (photo) await deletePhotos([photo])
  updateTag(tags.members)
  return { ok: true }
}

/** Swaps a member with their neighbour in the same group (same role and domain). */
export async function moveMember(id: string, direction: 'up' | 'down'): Promise<ActionResult> {
  if (!(await getAdmin())) return notSignedIn
  const members = adminDb().collection('members')
  const doc = await members.doc(id).get()
  if (!doc.exists) return fail('That person no longer exists.')
  const me = doc.data() as Member

  const snap = await members.where('role', '==', me.role).get()
  const group = snap.docs
    .map((d) => ({ id: d.id, ...(d.data() as Omit<Member, 'id'>) }))
    .filter((m) => (m.domain ?? null) === (me.domain ?? null))
    .sort((a, b) => a.order - b.order)
  const index = group.findIndex((m) => m.id === id)
  const neighbour = group[direction === 'up' ? index - 1 : index + 1]
  if (!neighbour) return { ok: true }

  const batch = adminDb().batch()
  batch.update(members.doc(id), { order: neighbour.order })
  batch.update(members.doc(neighbour.id), { order: me.order })
  await batch.commit()
  updateTag(tags.members)
  return { ok: true }
}

/* ---------- Stats ---------- */

export async function saveStats(items: Stat[]): Promise<ActionResult> {
  if (!(await getAdmin())) return notSignedIn
  if (!Array.isArray(items) || items.length > 8) return fail('Use up to 8 stats.')
  const cleaned = items.map((s) => ({ value: text(s.value, 12), label: text(s.label, 40) }))
  if (cleaned.some((s) => !s.value || !s.label)) return fail('Every stat needs a number and a label.')
  if (cleaned.some(isAutoStat)) return fail('Domains and Team members are counted automatically, so leave them out.')
  await adminDb().collection('site').doc('stats').set({ items: cleaned })
  updateTag(tags.stats)
  return { ok: true }
}

/* ---------- First-time setup ---------- */

/** Copies the starting team and stats into Firebase. Only runs when the team list is empty. */
export async function importStartingContent(): Promise<ActionResult> {
  if (!(await getAdmin())) return notSignedIn
  const db = adminDb()
  const existing = await db.collection('members').limit(1).get()
  if (!existing.empty) return fail('The team already has people in it, so nothing was imported.')

  const batch = db.batch()
  for (const member of seedMembers) {
    batch.set(
      db.collection('members').doc(),
      clean({ name: member.name, role: member.role, domain: member.domain, order: member.order }),
    )
  }
  const stats = await db.collection('site').doc('stats').get()
  if (!stats.exists) batch.set(db.collection('site').doc('stats'), { items: seedStats })
  await batch.commit()

  updateTag(tags.members)
  updateTag(tags.stats)
  return { ok: true }
}
