'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useSyncExternalStore } from 'react'
import { navLinks, site } from '@/data/site'
import { useTheme } from '@/hooks/useTheme'
import { accentAt, accents } from '@/lib/accents'
import { ADMIN_HINT_COOKIE } from '@/lib/session-cookies'
import { ArrowRight, Close, MenuIcon, Moon, Sun } from './icons'
import Logo from './Logo'
import { Collapse, IconSwap } from './motion'
import { ButtonLink, Container } from './ui'

const iconButton =
  'grid size-9 place-items-center rounded-xs border border-line text-fg hover:border-fg active:scale-95 focus-visible:outline-2 focus-visible:outline-g-blue'

/** True when an organizer is signed in (from a readable hint cookie; access is still checked on the server). */
function useSignedInAdmin() {
  return useSyncExternalStore(
    (onChange) => {
      window.addEventListener('focus', onChange)
      return () => window.removeEventListener('focus', onChange)
    },
    () => document.cookie.split('; ').includes(`${ADMIN_HINT_COOKIE}=1`),
    () => false,
  )
}

const isActive = (pathname: string, href: string) =>
  href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`)

/** Sun/moon button. The new theme grows out of it as a circle. */
export function ThemeToggle() {
  const { theme, toggle } = useTheme()
  return (
    <button
      type="button"
      onClick={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        toggle({ x: r.left + r.width / 2, y: r.top + r.height / 2 })
      }}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      className={iconButton}
    >
      <IconSwap showSecond={theme === 'dark'} first={<Moon size={18} />} second={<Sun size={18} />} />
    </button>
  )
}

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const signedIn = useSignedInAdmin()
  const close = () => setOpen(false)

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg">
      <Container className="flex h-16 items-center justify-between gap-6">
        <Link href="/" onClick={close} aria-label={`${site.shortName} home`} className="min-w-0">
          <Logo />
        </Link>

        <div className="flex h-full items-center gap-8">
          <nav className="hidden h-full items-stretch gap-7 md:flex" aria-label="Main">
            {navLinks.map((link, i) => {
              const active = isActive(pathname, link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? 'page' : undefined}
                  className={`group relative flex items-center text-sm ${active ? 'text-fg' : 'text-muted hover:text-fg'}`}
                >
                  {link.label}
                  {/* Each link underlines in its own Google color */}
                  <span
                    className={`absolute inset-x-0 -bottom-px h-0.5 origin-left ${accents[accentAt(i)].bg} ${
                      active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                    }`}
                  />
                </Link>
              )
            })}
          </nav>

          <div className="flex items-center gap-2">
            {signedIn && (
              <div className="hidden md:block">
                <ButtonLink to="/admin/events" size="sm" variant="secondary">
                  Admin
                </ButtonLink>
              </div>
            )}
            <ThemeToggle />
            {site.communityUrl && (
              <div className="hidden lg:block">
                <ButtonLink href={site.communityUrl} size="sm" icon="external">
                  Join the chapter
                </ButtonLink>
              </div>
            )}
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              className={`${iconButton} md:hidden`}
            >
              <IconSwap showSecond={open} first={<MenuIcon size={18} />} second={<Close size={18} />} />
            </button>
          </div>
        </div>
      </Container>

      <div className="md:hidden">
        <Collapse open={open}>
          <nav className="border-t border-line" aria-label="Mobile">
            <Container className="pb-4">
              {navLinks.map((link, i) => {
                const active = isActive(pathname, link.href)
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={close}
                    aria-current={active ? 'page' : undefined}
                    className={`group flex items-center justify-between border-b border-line py-4 text-lg ${
                      active ? 'text-fg' : 'text-muted'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span
                        className={`h-4 w-0.5 origin-bottom ${accents[accentAt(i)].bg} ${
                          active ? 'scale-y-100' : 'scale-y-0'
                        }`}
                      />
                      {link.label}
                    </span>
                    <ArrowRight size={18} className="group-hover:translate-x-0.5" />
                  </Link>
                )
              })}
              {signedIn && (
                <Link
                  href="/admin/events"
                  onClick={close}
                  className="group flex items-center justify-between border-b border-line py-4 text-lg text-muted"
                >
                  <span className="pl-[0.875rem]">Admin</span>
                  <ArrowRight size={18} className="group-hover:translate-x-0.5" />
                </Link>
              )}
              {site.communityUrl && (
                <ButtonLink href={site.communityUrl} icon="external" className="mt-4 w-full">
                  Join the chapter
                </ButtonLink>
              )}
            </Container>
          </nav>
        </Collapse>
      </div>
    </header>
  )
}
