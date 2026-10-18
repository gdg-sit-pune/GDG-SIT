import type { ReactNode } from 'react'
import Link from 'next/link'
import { accentAt, accents, type Accent } from '@/lib/accents'
import { ArrowRight, ArrowUpRight } from './icons'
import { buttonClass, type ButtonSize, type ButtonVariant } from '@/lib/styles'
import { Reveal } from './motion'

/** Full-width wrapper with a small gutter on each side. */
export function Container({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`w-full px-4 sm:px-6 lg:px-8 ${className}`}>{children}</div>
}

/* ---------- Buttons ---------- */

type ButtonIcon = 'arrow' | 'external'

/** Arrow that nudges forward when its button is hovered. */
function ButtonArrow({ icon }: { icon?: ButtonIcon }) {
  if (icon === 'arrow') return <ArrowRight size={16} className="group-hover/btn:translate-x-0.5" />
  if (icon === 'external')
    return <ArrowUpRight size={16} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
  return null
}

interface ButtonLinkProps {
  children: ReactNode
  /** Internal route, e.g. "/events" */
  to?: string
  /** External URL, opens in a new tab */
  href?: string
  variant?: ButtonVariant
  size?: ButtonSize
  icon?: ButtonIcon
  className?: string
}

export function ButtonLink({ children, to, href, variant, size, icon, className = '' }: ButtonLinkProps) {
  const cls = `${buttonClass(variant, size)} ${className}`
  const content = (
    <>
      {children}
      <ButtonArrow icon={icon} />
    </>
  )
  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={cls}>
        {content}
      </a>
    )
  }
  return (
    <Link href={to ?? '/'} className={cls}>
      {content}
    </Link>
  )
}

/** Text link with an arrow that nudges on hover. */
export function ArrowLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="group/btn inline-flex items-center gap-2 text-sm font-medium hover:text-ink-blue">
      {children}
      <ButtonArrow icon="arrow" />
    </Link>
  )
}

/* ---------- Text ---------- */

/** Small label. Optionally tinted with one of the Google colors. */
export function Label({ children, tone, className = '' }: { children: ReactNode; tone?: Accent; className?: string }) {
  return <p className={`text-sm ${tone ? accents[tone].text : 'text-muted'} ${className}`}>{children}</p>
}

interface SectionHeaderProps {
  /** Section number, shown in one of the four Google colors */
  index: number
  label: string
  title: string
  description?: string
  action?: ReactNode
}

/** Section title row: numbered label on the left, heading on the right. */
export function SectionHeader({ index, label, title, description, action }: SectionHeaderProps) {
  return (
    <Reveal className="grid gap-4 border-t border-line pt-6 lg:grid-cols-12 lg:gap-8">
      <Label className="lg:col-span-3 lg:pt-3">
        <span className={`font-medium tabular-nums ${accents[accentAt(index - 1)].text}`}>
          {String(index).padStart(2, '0')}
        </span>{' '}
        / {label}
      </Label>
      <div className="flex flex-wrap items-end justify-between gap-6 lg:col-span-9">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-medium tracking-tight sm:text-4xl lg:text-5xl">{title}</h2>
          {description && <p className="mt-4 text-lg text-muted">{description}</p>}
        </div>
        {action}
      </div>
    </Reveal>
  )
}

/** Title band at the top of inner pages. */
export function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <section className="border-b border-line">
      <Container className="pt-10 pb-12 lg:pt-14 lg:pb-16">
        <h1 className="max-w-5xl text-5xl leading-[1.02] font-medium tracking-[-0.03em] sm:text-6xl lg:text-7xl">
          <Reveal as="span" className="block">
            {title}
          </Reveal>
        </h1>
        <Reveal delay={100}>
          <p className="mt-6 max-w-2xl text-lg text-muted">{subtitle}</p>
        </Reveal>
      </Container>
    </section>
  )
}

/** Flat four-color Google stripe. */
export function ColorBar({ className = '' }: { className?: string }) {
  return (
    <div className={`flex h-1 ${className}`} aria-hidden="true">
      <span className="flex-1 bg-g-blue" />
      <span className="flex-1 bg-g-red" />
      <span className="flex-1 bg-g-yellow" />
      <span className="flex-1 bg-g-green" />
    </div>
  )
}
