'use client'

import type { FormEvent } from 'react'
import { ArrowRight, ArrowUpRight } from '@/components/icons'
import { Reveal } from '@/components/motion'
import Select from '@/components/Select'
import SocialLinks from '@/components/SocialLinks'
import { Container, Label, PageHeader } from '@/components/ui'
import { buttonClass, fieldClass } from '@/lib/styles'
import { site } from '@/data/site'

const topics = ['General question', 'Collaboration or sponsorship', 'Speak at an event', 'Joining the core team']

export default function ContactView() {
  // No backend yet, so the form opens the visitor's email app with the message filled in.
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const data = new FormData(e.currentTarget)
    const subject = `[${data.get('topic')}] Message from ${data.get('name')}`
    const body = `${data.get('message')}\n\nFrom: ${data.get('name')} (${data.get('email')})`
    window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(site.mapsQuery)}&output=embed`

  return (
    <>
      <PageHeader
        title="Let's talk."
        subtitle="Questions, collaborations, sponsorships, or an idea for an event? We'd like to hear from you."
      />

      <section className="py-16 lg:py-24">
        <Container className="grid gap-14 lg:grid-cols-12 lg:gap-8">
          <Reveal className="lg:col-span-4">
            <dl className="border-t border-line">
              <div className="border-b border-line py-5">
                <dt>
                  <Label tone="blue">Email</Label>
                </dt>
                <dd className="mt-2">
                  <a href={`mailto:${site.email}`} className="text-lg break-all hover:text-ink-blue">
                    {site.email}
                  </a>
                </dd>
              </div>
              <div className="border-b border-line py-5">
                <dt>
                  <Label tone="red">Location</Label>
                </dt>
                <dd className="mt-2 text-lg">{site.address}</dd>
              </div>
              <div className="border-b border-line py-5">
                <dt>
                  <Label tone="yellow">Community page</Label>
                </dt>
                <dd className="mt-2">
                  <a
                    href={site.communityUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="group inline-flex items-center gap-2 text-lg hover:text-ink-blue"
                  >
                    Join the chapter for event updates
                    <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                </dd>
              </div>
            </dl>
            <div className="mt-8">
              <Label tone="green">Follow us</Label>
              <div className="mt-4">
                <SocialLinks />
              </div>
            </div>
          </Reveal>

          <Reveal delay={100} className="lg:col-span-7 lg:col-start-6">
            <form onSubmit={handleSubmit}>
              <h2 className="text-3xl font-medium tracking-tight">Send us a message</h2>
              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                <label className="block text-sm font-medium">
                  Name
                  <input name="name" required autoComplete="name" className={`${fieldClass} h-12`} />
                </label>
                <label className="block text-sm font-medium">
                  Email
                  <input name="email" type="email" required autoComplete="email" className={`${fieldClass} h-12`} />
                </label>
              </div>
              <label className="mt-6 block text-sm font-medium">
                Topic
                <Select name="topic">
                  {topics.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </Select>
              </label>
              <label className="mt-6 block text-sm font-medium">
                Message
                <textarea name="message" required rows={6} className={`${fieldClass} resize-y py-3`} />
              </label>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
                <button type="submit" className={buttonClass()}>
                  Send message <ArrowRight size={16} className="group-hover/btn:translate-x-0.5" />
                </button>
                <p className="text-sm text-muted">This opens your email app with the message filled in.</p>
              </div>
            </form>
          </Reveal>
        </Container>
      </section>

      <section className="pb-16 lg:pb-24">
        <Container>
          <iframe
            title={`Map of ${site.college}`}
            src={mapSrc}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-72 w-full rounded-xs border border-line grayscale sm:h-[420px]"
          />
        </Container>
      </section>
    </>
  )
}
