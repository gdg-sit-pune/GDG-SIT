import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'
import { signOutAction } from '@/app/admin/actions'
import AdminNav from '@/components/admin/AdminNav'
import { SignOut } from '@/components/icons'
import { ThemeToggle } from '@/components/Navbar'
import { ButtonLink, Container } from '@/components/ui'
import { getAdmin } from '@/lib/auth'

/** Signed-in email and sign-out button. Reads the session, so it streams in. */
async function SignedInAs() {
  const admin = await getAdmin()
  if (!admin) return null
  return (
    <form action={signOutAction} className="flex items-center gap-3">
      <span className="hidden text-sm text-muted lg:inline">{admin.email}</span>
      <button
        type="submit"
        aria-label="Sign out"
        title="Sign out"
        className="grid size-9 place-items-center rounded-xs border border-line text-fg hover:border-fg active:scale-95"
      >
        <SignOut size={18} />
      </button>
    </form>
  )
}

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-bg">
        <Container className="flex h-16 items-center justify-between gap-6">
          <div className="flex h-full items-center gap-8">
            <Link href="/admin/events" className="flex shrink-0 items-center gap-3">
              <Image src="/logo.png" alt="" width={1000} height={484} className="h-7 w-auto" />
              <span className="text-sm font-medium">Admin</span>
            </Link>
            <div className="hidden h-full sm:block">
              <AdminNav />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Suspense fallback={null}>
              <SignedInAs />
            </Suspense>
            <ThemeToggle />
            <div className="hidden md:block">
              <ButtonLink to="/" size="sm" variant="secondary" icon="arrow">
                View site
              </ButtonLink>
            </div>
          </div>
        </Container>
        <Container className="h-12 border-t border-line sm:hidden">
          <AdminNav />
        </Container>
      </header>
      <main>
        <Container className="py-10 lg:py-14">{children}</Container>
      </main>
    </>
  )
}
