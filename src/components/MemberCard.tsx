'use client'

import Image from 'next/image'
import { accents, type Accent } from '@/lib/accents'
import { cell } from '@/lib/styles'
import { roleLabels, type Member } from '@/lib/types'
import { GithubLogo, InstagramLogo, LinkedinLogo } from './icons'

// Titles like "Dr." are skipped for initials
const titles = new Set(['dr', 'prof', 'mr', 'mrs', 'ms'])
const nameParts = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .filter((part) => !titles.has(part.replace('.', '').toLowerCase()))

function initials(name: string) {
  return nameParts(name)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')
}

/** Square photo (uploaded in the admin panel), or initials when there isn't one. */
export function MemberPhoto({
  member,
  className = '',
}: {
  member: Pick<Member, 'name' | 'photo'>
  className?: string
}) {
  // Only uploaded photos are shown; old file paths from before uploads existed count as no photo
  const photo = member.photo?.startsWith('https://') ? member.photo : undefined
  if (!photo) {
    return (
      <span className={`grid size-full place-items-center font-medium tracking-tight text-muted ${className}`}>
        {initials(member.name)}
      </span>
    )
  }
  return (
    <Image
      src={photo}
      alt={member.name}
      fill
      sizes="(min-width: 1280px) 20vw, (min-width: 768px) 30vw, 50vw"
      className={`object-cover ${className}`}
    />
  )
}

export default function MemberCard({ member, accent }: { member: Member; accent: Accent }) {
  const a = accents[accent]
  const links = [
    { href: member.linkedin, label: 'LinkedIn', Icon: LinkedinLogo },
    { href: member.github, label: 'GitHub', Icon: GithubLogo },
    { href: member.instagram, label: 'Instagram', Icon: InstagramLogo },
  ].filter((l) => l.href)

  return (
    <div className={`${cell} group flex flex-col p-3 sm:p-4 lg:p-5`}>
      <div className="relative aspect-square overflow-hidden rounded-xs bg-surface">
        <MemberPhoto member={member} className="text-3xl group-hover:scale-[1.03] sm:text-5xl" />
        {/* Color line grows across on hover */}
        <span className={`absolute inset-x-0 bottom-0 h-1 origin-left scale-x-25 group-hover:scale-x-100 ${a.bg}`} />
      </div>

      <div className="mt-3 min-w-0 sm:mt-4">
        <h3 className="text-[15px] leading-snug font-medium sm:text-lg">{member.name}</h3>
        <p className={`mt-0.5 text-[13px] sm:text-sm ${a.text}`}>{roleLabels[member.role]}</p>
      </div>
      {links.length > 0 && (
        <div className="mt-2 -ml-2 flex gap-0.5">
          {links.map(({ href, label, Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={`${member.name} on ${label}`}
              className="grid size-9 place-items-center rounded-xs text-muted hover:bg-surface hover:text-fg active:scale-95"
            >
              <Icon size={18} />
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
