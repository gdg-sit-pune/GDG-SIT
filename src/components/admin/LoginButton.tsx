'use client'

import { FirebaseError } from 'firebase/app'
import { GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { startSession } from '@/app/admin/actions'
import { GoogleLogo } from '@/components/icons'
import { getClientAuth } from '@/lib/firebase-client'
import { buttonClass } from '@/lib/styles'

export default function LoginButton() {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const signIn = async () => {
    setBusy(true)
    setError(null)
    const auth = getClientAuth()
    try {
      const provider = new GoogleAuthProvider()
      provider.setCustomParameters({ prompt: 'select_account' })
      const { user } = await signInWithPopup(auth, provider)
      const result = await startSession(await user.getIdToken())
      if (!result.ok) {
        setError(result.error)
        return
      }
      router.replace('/admin/events')
      router.refresh()
    } catch (e) {
      const closed =
        e instanceof FirebaseError &&
        (e.code === 'auth/popup-closed-by-user' || e.code === 'auth/cancelled-popup-request')
      if (!closed) setError('Sign-in failed. Please try again.')
    } finally {
      // The session lives in a secure cookie now; the browser doesn't need its own Firebase login
      await signOut(auth).catch(() => {})
      setBusy(false)
    }
  }

  return (
    <div>
      <button type="button" onClick={signIn} disabled={busy} className={`${buttonClass()} w-full disabled:opacity-60`}>
        <GoogleLogo size={18} weight="bold" />
        {busy ? 'Signing in…' : 'Sign in with Google'}
      </button>
      {error && (
        <p role="alert" className="mt-4 text-sm text-ink-red">
          {error}
        </p>
      )}
    </div>
  )
}
