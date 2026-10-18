// Starting content.
// Shown on the site until Firebase is set up, and copied into Firebase by the
// "Import starting content" button in the admin panel. After that, edit content
// in the admin panel instead of here.

import type { DomainId } from '@/data/domains'
import type { ClubEvent, Member, MemberRole, Stat } from '@/lib/types'

export const seedEvents: ClubEvent[] = []

// Domains and Team members are counted automatically (see autoStats in lib/content.ts)
export const seedStats: Stat[] = [
  { value: '500+', label: 'Community members' },
  { value: '30+', label: 'Events hosted' },
]

type Row = [name: string, role: MemberRole, domain?: DomainId]

const rows: Row[] = [
  ['Uttkarsh Ruparel', 'organizer'],
  ['Het Jasani', 'organizer'],
  ['Dr. Rashmi Dharwadkar', 'faculty'],

  ['Rahil Bhoot', 'lead', 'web'],
  ['Tanmay Agarwal', 'colead', 'web'],
  ['Janavi Arbole', 'colead', 'web'],

  ['Sanchita Arora', 'lead', 'cp'],
  ['Mishti Kinker', 'colead', 'cp'],

  ['Sayantan Nandi', 'lead', 'aiml'],
  ['Chaitanya Gaur', 'colead', 'aiml'],
  ['Amarthaluri Hem Sharan Gupta', 'colead', 'aiml'],
  ['Ronit Mehta', 'coordinator', 'aiml'],
  ['Jayvee Shah', 'coordinator', 'aiml'],
  ['Ganesh Nair', 'coordinator', 'aiml'],

  ['Shayontan Laha', 'lead', 'cloud'],
  ['Shashank Rai', 'colead', 'cloud'],

  ['Jasnoor Kaur', 'lead', 'media'],

  ['Shaik Kashif', 'lead', 'design'],

  ['Darp Lalani', 'lead', 'events'],
  ['Jaya Mishra', 'colead', 'events'],
  ['Akansha Wadhwani', 'coordinator', 'events'],
  ['Vaishnovi Bhosale', 'coordinator', 'events'],
  ['Rikisha Bhattacharya', 'coordinator', 'events'],
]

export const seedMembers: Member[] = rows.map(([name, role, domain], i) => ({
  id: `seed-${i}`,
  name,
  role,
  ...(domain ? { domain } : {}),
  order: i,
}))
