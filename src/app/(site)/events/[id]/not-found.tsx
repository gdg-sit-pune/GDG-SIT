import { ButtonLink, Container, Label } from '@/components/ui'

export default function EventNotFound() {
  return (
    <Container className="py-24 lg:py-32">
      <Label tone="red">Event not found</Label>
      <h1 className="mt-8 text-5xl font-medium tracking-tight sm:text-6xl">This event doesn&apos;t exist.</h1>
      <p className="mt-6 max-w-xl text-lg text-muted">It may have been removed, or the link may be wrong.</p>
      <ButtonLink to="/events" icon="arrow" className="mt-10">
        All events
      </ButtonLink>
    </Container>
  )
}
