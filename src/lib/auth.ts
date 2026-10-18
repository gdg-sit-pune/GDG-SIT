import 'server-only'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { adminAuth, firebaseConfigured } from './firebase-admin'
import { SESSION_COOKIE } from './session-cookies'

export { SESSION_COOKIE, SESSION_DAYS } from './session-cookies'

/** Emails allowed into the admin panel, from the ADMIN_EMAILS environment variable. */
const adminEmails = (process.env.ADMIN_EMAILS ?? '')
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean)

export function isAdminEmail(email: string | undefined | null): email is string {
  return Boolean(email && adminEmails.includes(email.toLowerCase()))
}

export interface Admin {
  email: string
}

/** The signed-in admin, or null. Reads the session cookie, so call it at request time. */
export async function getAdmin(): Promise<Admin | null> {
  if (!firebaseConfigured) return null
  const cookie = (await cookies()).get(SESSION_COOKIE)?.value
  if (!cookie) return null
  // Verifying checks the token's expiry against the current time, so it must run per request
  await connection()
  try {
    const decoded = await adminAuth().verifySessionCookie(cookie, true)
    if (!decoded.email_verified || !isAdminEmail(decoded.email)) return null
    return { email: decoded.email }
  } catch {
    return null
  }
}

/** Use in admin pages: sends anyone who isn't an admin to the sign-in page. */
export async function requireAdmin(): Promise<Admin> {
  const admin = await getAdmin()
  if (!admin) {
    // A cookie that no longer works (expired, revoked, or not an organizer) gets a marker, so the
    // proxy doesn't bounce the visitor straight back here from the login page
    const hadCookie = (await cookies()).has(SESSION_COOKIE)
    redirect(hadCookie ? '/admin/login?session=expired' : '/admin/login')
  }
  return admin
}
