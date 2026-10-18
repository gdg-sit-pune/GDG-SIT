import 'server-only'
import { cert, getApps, initializeApp, type App } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'

// Server-side Firebase. Credentials come from environment variables (see .env.example).
// With the local emulators running, no credentials are needed.

const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
const usingEmulators = Boolean(process.env.FIRESTORE_EMULATOR_HOST)

/** True when the site can talk to Firebase. Otherwise it falls back to the starting content. */
export const firebaseConfigured = Boolean(projectId && (usingEmulators || (clientEmail && privateKey)))

function app(): App {
  const existing = getApps()[0]
  if (existing) return existing
  if (usingEmulators) return initializeApp({ projectId })
  return initializeApp({ projectId, credential: cert({ projectId, clientEmail, privateKey }) })
}

export const adminDb = () => getFirestore(app())
export const adminAuth = () => getAuth(app())
