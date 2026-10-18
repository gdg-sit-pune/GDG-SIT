// Shapes of the content managed in the admin panel.

import type { DomainId } from '@/data/domains'

export const eventTypes = ['Workshop', 'Hackathon', 'Session', 'Talk', 'Meetup', 'Contest', 'Techfest'] as const
export type EventType = (typeof eventTypes)[number]

export const eventModes = ['In-person', 'Online', 'Hybrid'] as const
export type EventMode = (typeof eventModes)[number]

export interface ClubEvent {
  id: string
  title: string
  /** YYYY-MM-DD */
  date: string
  time?: string
  venue: string
  mode: EventMode
  type: EventType
  description: string
  registrationUrl?: string
  /** Link to slides, photos or a recap post after the event */
  recapUrl?: string
}

export const memberRoles = ['organizer', 'faculty', 'lead', 'colead', 'coordinator'] as const
export type MemberRole = (typeof memberRoles)[number]

export const roleLabels: Record<MemberRole, string> = {
  organizer: 'Organizer',
  faculty: 'Faculty Coordinator',
  lead: 'Lead',
  colead: 'Co-lead',
  coordinator: 'Coordinator',
}

/** Roles that belong to a domain team (the rest are chapter-wide leadership). */
export const domainRoles: MemberRole[] = ['lead', 'colead', 'coordinator']

export interface Member {
  id: string
  name: string
  role: MemberRole
  /** Set for lead, co-lead and coordinator */
  domain?: DomainId
  /** Position within its group; lower comes first */
  order: number
  /** Custom photo path. By default /team/<FirstName>.png is used. */
  photo?: string
  linkedin?: string
  github?: string
  instagram?: string
}

export interface Stat {
  value: string
  label: string
}

/** Stats the site counts by itself. Saved stats with these labels are ignored. */
export const autoStatLabels = ['Domains', 'Team members']
export const isAutoStat = (s: Stat) => autoStatLabels.includes(s.label.trim())
