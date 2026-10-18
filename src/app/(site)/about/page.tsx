import type { Metadata } from 'next'
import { ArrowUpRight, BookOpen, Hammer, ShareNetwork, UsersThree, type Icon } from '@/components/icons'
import { AccordionItem, Reveal } from '@/components/motion'
import { ButtonLink, Container, Label, PageHeader, SectionHeader } from '@/components/ui'
import { cell, cellGrid } from '@/lib/styles'
import { site } from '@/data/site'
import { accentAt, accents } from '@/lib/accents'

const values: { title: string; text: string; icon: Icon }[] = [
  { title: 'Learn', text: 'Hands-on sessions led by students who were beginners not long ago.', icon: BookOpen },
  {
    title: 'Connect',
    text: 'Meet peers, seniors, alumni and industry speakers who share your interests.',
    icon: UsersThree,
  },
  { title: 'Build', text: 'Turn ideas into real projects at hackathons and in domain project groups.', icon: Hammer },
  {
    title: 'Share',
    text: 'Teach what you learn. Give a talk, write a blog post, or mentor juniors.',
    icon: ShareNetwork,
  },
]

const activities = [
  {
    title: 'Hackathons',
    text: 'Build under a deadline with a team, get feedback from mentors, and ship something real.',
  },
  {
    title: 'Domain sessions',
    text: 'Regular sessions run by each domain, like CP Saturdays, where members learn and practise together.',
  },
  {
    title: 'Hands-on workshops',
    text: 'Practical sessions on AI, cloud, DevOps and more, where you leave having built something.',
  },
  {
    title: 'College tech events',
    text: "We help run SIT's core tech events, including Symbitech, the college techfest.",
  },
]

const faqs = [
  {
    q: 'Who can join?',
    a: `Any student at ${site.college}, from any branch or year. You don't need to be a computer science student.`,
  },
  {
    q: 'How do I join?',
    a: "Join our chapter page on the GDG community platform. That's how you get notified about events and RSVP to them.",
  },
  {
    q: 'Do I need coding experience?',
    a: 'No. Many sessions are made for complete beginners, and domains like Media, Design and Events need no code at all.',
  },
  { q: 'Is there a membership fee?', a: 'No. Joining the chapter and attending our events is free.' },
  {
    q: 'How do I join the core team?',
    a: 'We open core team applications at the start of each academic year. Follow our social media or contact us to hear when they open.',
  },
  {
    q: 'What happened to GDSC?',
    a: 'In 2024, Google Developer Student Clubs was renamed Google Developer Groups on Campus. Same community, new name.',
  },
]

export const metadata: Metadata = {
  title: 'About',
  description: `Who we are, what we stand for and how we spend the year at ${site.shortName}.`,
}

export default function AboutPage() {
  return (
    <>
      <PageHeader
        title="Students building with Google technologies."
        subtitle={`${site.shortName} is a student-run community for anyone at ${site.college} who wants to grow as a developer.`}
      />

      {/* Who we are */}
      <section className="py-16 lg:py-24">
        <Container>
          <SectionHeader index={1} label="Who we are" title="A place to learn by doing" />
          <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-8">
            <Reveal className="space-y-5 text-lg text-muted lg:col-span-5 lg:col-start-4">
              <p>
                The best way to learn technology is to build things together. Every semester we run workshops, domain
                sessions and hackathons that help students go from curious to confident.
              </p>
              <p>
                Our members come from every branch and year at SIT. Some are writing their first line of code, and some
                are shipping production apps. Everyone learns from each other.
              </p>
            </Reveal>
            <Reveal delay={100} className="rounded-xs border border-line p-6 lg:col-span-4">
              <Label tone="blue">The program</Label>
              <p className="mt-4">
                Google Developer Groups on Campus are university groups, supported by Google for Developers, for
                students interested in Google developer technologies. The program was previously called Google Developer
                Student Clubs (GDSC).
              </p>
              <a
                href={site.communityUrl}
                target="_blank"
                rel="noreferrer"
                className="group mt-6 inline-flex items-center gap-2 text-sm font-medium hover:text-ink-blue"
              >
                GDG community platform
                <ArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* Values */}
      <section className="pb-16 lg:pb-24">
        <Container>
          <SectionHeader index={2} label="Values" title="What we stand for" />
          <div className={`${cellGrid} mt-12 sm:grid-cols-2 lg:grid-cols-4`}>
            {values.map((v, i) => (
              <Reveal key={v.title} delay={i * 70} className={`${cell} group p-6 sm:p-8`}>
                <v.icon
                  size={28}
                  weight="light"
                  className={`${accents[accentAt(i)].text} group-hover:-translate-y-1`}
                />
                <h3 className="mt-8 text-3xl font-medium tracking-tight sm:mt-12">{v.title}</h3>
                <p className="mt-3 text-muted">{v.text}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Activities */}
      <section className="pb-16 lg:pb-24">
        <Container>
          <SectionHeader index={3} label="Activities" title="How we spend the year" />
          <div className="mt-10 border-t border-line">
            {activities.map((item, i) => (
              <Reveal key={item.title} className="group grid gap-2 border-b border-line py-6 lg:grid-cols-12 lg:gap-8">
                <span className="text-sm text-muted tabular-nums lg:col-span-3 lg:pt-2">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="text-2xl font-medium tracking-tight group-hover:translate-x-1 lg:col-span-4">
                  {item.title}
                </h3>
                <p className="text-muted lg:col-span-5 lg:pt-1">{item.text}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section className="pb-16 lg:pb-24">
        <Container>
          <SectionHeader index={4} label="FAQ" title="Common questions" />
          <Reveal className="mt-10 border-t border-line lg:ml-[25%]">
            {faqs.map((f, i) => (
              <AccordionItem key={f.q} question={f.q} accent={accentAt(i)}>
                {f.a}
              </AccordionItem>
            ))}
          </Reveal>
          <div className="mt-10 lg:ml-[25%]">
            <ButtonLink to="/contact" variant="secondary" icon="arrow">
              Still have questions? Contact us
            </ButtonLink>
          </div>
        </Container>
      </section>
    </>
  )
}
