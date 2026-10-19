import { site } from '@/data/site'
import { GithubLogo, InstagramLogo, LinkedinLogo, XLogo } from './icons'

// Each icon picks up one of the Google colors on hover
const items = [
  { href: site.socials.instagram, label: 'Instagram', Icon: InstagramLogo, hover: 'hover:text-ink-red' },
  { href: site.socials.linkedin, label: 'LinkedIn', Icon: LinkedinLogo, hover: 'hover:text-ink-blue' },
  { href: site.socials.githubOrg, label: 'GitHub organization', Icon: GithubLogo, hover: 'hover:text-ink-green' },
  { href: site.socials.github, label: 'GitHub profile', Icon: GithubLogo, hover: 'hover:text-ink-green' },
  { href: site.socials.x, label: 'X (Twitter)', Icon: XLogo, hover: 'hover:text-ink-yellow' },
].filter((item) => item.href)

export default function SocialLinks() {
  return (
    <div className="flex gap-2">
      {items.map(({ href, label, Icon, hover }) => (
        <a
          key={label}
          href={href}
          target="_blank"
          rel="noreferrer"
          aria-label={label}
          title={label}
          className={`group grid size-10 place-items-center rounded-xs border border-line text-muted hover:border-current active:scale-95 ${hover}`}
        >
          <Icon size={18} className="group-hover:-translate-y-px" />
        </a>
      ))}
    </div>
  )
}
