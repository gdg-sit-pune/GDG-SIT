import { NextResponse, type NextRequest } from 'next/server'
import { SESSION_COOKIE } from '@/lib/session-cookies'

// Runs before admin pages render, so visitors land on the right page straight away
// instead of seeing the admin frame flash before a redirect.
// This only checks whether a session cookie exists; the pages and actions still verify it.

export function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl
  const hasSession = request.cookies.has(SESSION_COOKIE)

  if (pathname === '/admin/login') {
    // Already signed in: skip the login screen. (Not when the session was just found to be
    // expired; then the login page must stay, or the visitor would bounce back and forth.)
    if (hasSession && searchParams.get('session') !== 'expired') {
      return NextResponse.redirect(new URL('/admin/events', request.url))
    }
    return NextResponse.next()
  }

  if (!hasSession) return NextResponse.redirect(new URL('/admin/login', request.url))
  if (pathname === '/admin') return NextResponse.redirect(new URL('/admin/events', request.url))
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
}
