'use client'

import { useState } from 'react'
import { accents, type Accent } from '@/lib/accents'
import { cell } from '@/lib/styles'
import { roleLabels, type Member } from '@/lib/types'
import { GithubLogo, InstagramLogo, LinkedinLogo } from './icons'

// Titles like "Dr." are skipped for initials and photo filenames
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

/** Photo files to try, in order: an explicit `photo`, then /team/<FirstName>.png, then lowercase. */
function photoCandidates(member: Pick<Member, 'name' | 'photo'>): string[] {
  if (member.photo) return [member.photo]
  const first = nameParts(member.name)[0] ?? ''
  return [...new Set([`/team/${first}.png`, `/team/${first.toLowerCase()}.png`])]
}

/** Square photo that falls back to initials when no file is found. */
export function MemberPhoto({
  member,
  className = '',
}: {
  member: Pick<Member, 'name' | 'photo'>
  className?: string
}) {
  const candidates = photoCandidates(member)
  const [attempt, setAttempt] = useState(0)
  const photo = candidates[attempt]
  // Move to the next candidate only once per failed file, even if both error checks fire
  const fail = (src: string) => setAttempt((n) => (candidates[n] === src ? n + 1 : n))

  if (!photo) {
    return (
      <span className={`grid size-full place-items-center font-medium tracking-tight text-muted ${className}`}>
        {initials(member.name)}
      </span>
    )
  }
  return (
    // A plain <img> so a missing file can fall back to the next name, then to initials
    // eslint-disable-next-line @next/next/no-img-element
    <img
      key={photo}
      src={photo}
      alt={member.name}
      loading="lazy"
      onError={() => fail(photo)}
      // Catch a failure that happened before React attached onError
      ref={(img) => {
        if (img?.complete && img.naturalWidth === 0) fail(photo)
      }}
      className={`size-full object-cover ${className}`}
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
    <div className={`${cell} group p-4 sm:p-5`}>
      <div className="relative aspect-square overflow-hidden rounded-xs bg-surface">
        <MemberPhoto member={member} className="text-5xl group-hover:scale-[1.03]" />
        {/* Color line grows across on hover */}
        <span className={`absolute inset-x-0 bottom-0 h-1 origin-left scale-x-25 group-hover:scale-x-100 ${a.bg}`} />
      </div>

      <div className="mt-5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-lg font-medium">{member.name}</h3>
          <p className={`mt-0.5 text-sm ${a.text}`}>{roleLabels[member.role]}</p>
        </div>
        {links.length > 0 && (
          <div className="flex shrink-0 gap-1">
            {links.map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={`${member.name} on ${label}`}
                className="grid size-8 place-items-center rounded-xs text-muted hover:bg-surface hover:text-fg active:scale-95"
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
