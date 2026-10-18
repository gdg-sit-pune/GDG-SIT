'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { accentAt, accents } from '@/lib/accents'

const sections = [
  { href: '/admin/events', label: 'Events' },
  { href: '/admin/team', label: 'Team' },
  { href: '/admin/stats', label: 'Stats' },
]

export default function AdminNav() {
  const pathname = usePathname()
  return (
    <nav className="flex h-full items-stretch gap-6" aria-label="Admin sections">
      {sections.map((s, i) => {
        const active = pathname.startsWith(s.href)
        return (
          <Link
            key={s.href}
            href={s.href}
            aria-current={active ? 'page' : undefined}
            className={`group relative flex items-center text-sm ${active ? 'text-fg' : 'text-muted hover:text-fg'}`}
          >
            {s.label}
            <span
              className={`absolute inset-x-0 -bottom-px h-0.5 origin-left ${accents[accentAt(i)].bg} ${
                active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
              }`}
            />
          </Link>
        )
      })}
    </nav>
  )
}
