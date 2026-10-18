'use client'

import { getApps, initializeApp } from 'firebase/app'
import { connectAuthEmulator, getAuth, type Auth } from 'firebase/auth'

// Browser-side Firebase. Only used for the Google sign-in popup on /admin/login;
// all reading and writing of content happens on the server.

let auth: Auth | null = null

export function getClientAuth(): Auth {
  if (auth) return auth
  const app =
    getApps()[0] ??
    initializeApp({
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    })
  auth = getAuth(app)
  const emulator = process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST
  if (emulator) connectAuthEmulator(auth, `http://${emulator}`, { disableWarnings: true })
  return auth
}
