import Image from 'next/image'
import { site } from '@/data/site'

/** Club logo plus name. The full name shows on wide screens, a short one on smaller screens. */
export default function Logo() {
  const showName = !site.logo.includesName

  return (
    <span className="flex min-w-0 items-center gap-3">
      <Image
        src={site.logo.src}
        alt={showName ? '' : site.shortName}
        width={1000}
        height={484}
        loading="eager"
        className="h-8 w-auto shrink-0"
      />
      {showName && (
        <span className="min-w-0 leading-tight">
          <span className="block truncate text-sm font-medium">
            <span className="xl:hidden">GDG on Campus</span>
            <span className="hidden xl:inline">{site.fullName}</span>
          </span>
          <span className="block truncate text-xs text-muted">
            <span className="xl:hidden">SIT {site.city}</span>
            <span className="hidden xl:inline">
              {site.college}, {site.city}
            </span>
          </span>
        </span>
      )}
    </span>
  )
}
