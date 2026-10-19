import type { MetadataRoute } from 'next'
import { navLinks } from '@/data/site'
import { getEvents } from '@/lib/content'
import { eventEnd } from '@/lib/dates'
import { siteUrl } from '@/lib/site-url'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const events = await getEvents()
  return [
    ...navLinks.map(({ href }) => ({ url: `${siteUrl}${href === '/' ? '' : href}` })),
    ...events.map((e) => ({ url: `${siteUrl}/events/${e.id}`, lastModified: eventEnd(e) })),
  ]
}
