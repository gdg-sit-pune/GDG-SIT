import type { Metadata } from 'next'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'
import { ButtonLink, Container, Label } from '@/components/ui'

export const metadata: Metadata = { title: 'Page not found' }

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Container className="py-24 lg:py-32">
          <Label tone="red">Error 404</Label>
          <h1 className="mt-8 text-6xl font-medium tracking-tight sm:text-7xl">Page not found.</h1>
          <p className="mt-6 max-w-xl text-lg text-muted">The link may be broken, or the page may have moved.</p>
          <ButtonLink to="/" className="mt-10">
            Back to home
          </ButtonLink>
        </Container>
      </main>
      <Footer />
    </div>
  )
}
