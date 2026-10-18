import { Brain, CalendarCheck, Camera, CloudArrowUp, Code, PenNib, TreeStructure, type Icon } from '@/components/icons'

export type DomainId = 'web' | 'cp' | 'aiml' | 'cloud' | 'media' | 'design' | 'events'

export interface Domain {
  id: DomainId
  name: string
  description: string
  icon: Icon
}

// Colors are assigned automatically in order (blue, red, yellow, green, repeat).
// Descriptions say what each domain is and what its members do, in plain words.
export const domains: Domain[] = [
  {
    id: 'web',
    name: 'Web Development',
    description:
      'Build websites and web apps that people actually use, learning how the web works along the way and putting your work online.',
    icon: Code,
  },
  {
    id: 'cp',
    name: 'Competitive Programming',
    description:
      'Solve tricky problems against the clock. Regular practice like CP Saturdays builds the problem-solving skills that contests and coding interviews test.',
    icon: TreeStructure,
  },
  {
    id: 'aiml',
    name: 'AI / ML',
    description:
      'Teach computers to learn from data. Understand how AI models work, then use them to build things like chatbots and smart assistants.',
    icon: Brain,
  },
  {
    id: 'cloud',
    name: 'Cloud & DevOps',
    description:
      'Take apps from your laptop to the internet. Learn how software is hosted, released and kept running smoothly for real users.',
    icon: CloudArrowUp,
  },
  {
    id: 'media',
    name: 'Media',
    description:
      "Tell the club's story. Photograph and film our events, and run the social media that keeps everyone in the loop.",
    icon: Camera,
  },
  {
    id: 'design',
    name: 'Design',
    description:
      'Shape how everything looks and feels, from app and website screens to posters, branding and event visuals.',
    icon: PenNib,
  },
  {
    id: 'events',
    name: 'Events',
    description:
      'Make things happen. Plan and run everything the club hosts, from weekly sessions to hackathons and Symbitech.',
    icon: CalendarCheck,
  },
]

const numberWords = [
  'Zero',
  'One',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
  'Eleven',
  'Twelve',
]

/** "Seven", or the digits once there are more than twelve domains. */
export const domainCountWord = numberWords[domains.length] ?? String(domains.length)
