import type { Metadata } from 'next'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import LoginButton from '@/components/admin/LoginButton'
import { ThemeToggle } from '@/components/Navbar'
import { ArrowLink, Container, Label } from '@/components/ui'
import { getAdmin } from '@/lib/auth'
import { firebaseConfigured } from '@/lib/firebase-admin'

export const metadata: Metadata = { title: 'Sign in' }

/** Already signed in? Skip straight to the panel. */
async function RedirectIfSignedIn() {
  if (await getAdmin()) redirect('/admin/events')
  return null
}

export default function LoginPage() {
  return (
    <Container className="flex min-h-screen flex-col">
      <div className="flex h-16 items-center justify-between">
        <ArrowLink href="/">Back to the site</ArrowLink>
        <ThemeToggle />
      </div>

      <div className="flex flex-1 items-center">
        <div className="w-full max-w-md animate-fade-up">
          <Image src="/logo.png" alt="" width={1000} height={484} loading="eager" className="h-10 w-auto" />
          <Label className="mt-10">GDG on Campus SIT Pune</Label>
          <h1 className="mt-2 text-5xl font-medium tracking-tight">Admin panel</h1>
          <p className="mt-4 text-lg text-muted">
            Sign in with an organizer&apos;s Google account to manage events, the team and stats.
          </p>

          <div className="mt-10">
            {firebaseConfigured ? (
              <>
                <LoginButton />
                <Suspense fallback={null}>
                  <RedirectIfSignedIn />
                </Suspense>
              </>
            ) : (
              <div className="rounded-xs border border-line p-5">
                <Label tone="yellow">Firebase isn&apos;t set up yet</Label>
                <p className="mt-2 text-sm text-muted">
                  Add the Firebase settings to <code>.env.local</code> (see <code>.env.example</code> and the README),
                  then restart the site.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Container>
  )
}
