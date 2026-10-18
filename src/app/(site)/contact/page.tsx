import type { Metadata } from 'next'
import ContactView from '@/components/views/ContactView'
import { site } from '@/data/site'

export const metadata: Metadata = {
  title: 'Contact',
  description: `Questions, collaborations, sponsorships or event ideas? Get in touch with ${site.shortName}.`,
}

export default function ContactPage() {
  return <ContactView />
}
