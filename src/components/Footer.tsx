import { cacheLife } from 'next/cache'
import Link from 'next/link'
import { navLinks, site } from '@/data/site'
import Logo from './Logo'
import SocialLinks from './SocialLinks'
import { ColorBar, Container, Label } from './ui'

// Cached for a day, so the year updates on its own without rendering on every request
async function CurrentYear() {
  'use cache'
  cacheLife('days')
  return <>{new Date().getFullYear()}</>
}

export default function Footer() {
  return (
    <footer className="border-t border-line">
      <Container className="grid gap-12 py-14 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-5">
          <Logo />
          <p className="mt-5 max-w-sm text-sm text-muted">{site.tagline}</p>
          <div className="mt-6">
            <SocialLinks />
          </div>
        </div>

        <div className="md:col-span-3 lg:col-span-2 lg:col-start-7">
          <Label>Pages</Label>
          <ul className="mt-5 space-y-2.5 text-sm">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-muted hover:text-fg">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-4">
          <Label>Contact</Label>
          <ul className="mt-5 space-y-2.5 text-sm text-muted">
            <li>
              <a href={`mailto:${site.email}`} className="break-all hover:text-fg">
                {site.email}
              </a>
            </li>
            <li className="max-w-xs">{site.address}</li>
          </ul>
        </div>
      </Container>

      <Container className="flex flex-col gap-2 border-t border-line py-6 text-xs text-muted sm:flex-row sm:justify-between">
        <p>
          © <CurrentYear /> {site.shortName}
          <span className="mx-2" aria-hidden="true">
            ·
          </span>
          <Link href="/admin/events" className="hover:text-fg">
            Admin
          </Link>
        </p>
        <p>Google Developer Groups on Campus is a program supported by Google for Developers.</p>
      </Container>
      <ColorBar />
    </footer>
  )
}
