// Club-wide info. Edit this file to change names and links across the site.
// Events, team members and stats are managed in the admin panel (/admin).

export const site = {
  shortName: 'GDG on Campus SIT Pune',
  fullName: 'Google Developer Groups on Campus',
  college: 'Symbiosis Institute of Technology',
  city: 'Pune',
  tagline: 'A community of student developers at SIT Pune who learn, build and ship together.',

  logo: {
    src: '/logo.png',
    // Set to true if logo.png already contains the club name, so the text isn't shown twice
    includesName: false,
  },

  email: 'gdsc@sitpune.edu.in',
  address: 'Symbiosis Institute of Technology, Lavale, Mulshi, Pune, Maharashtra 412115',
  mapsQuery: 'Symbiosis Institute of Technology Pune',
  // TODO: set this to the chapter's own page, e.g. https://gdg.community.dev/gdg-on-campus-<college>-pune-india/
  // once the GDG on Campus application is approved. Every "Join the chapter" button and link on the
  // site uses it, and they stay hidden while it is empty ('').
  communityUrl: '',

  // Leave a link empty ('') to hide that icon
  socials: {
    instagram: 'https://www.instagram.com/gdg.sitpune/',
    linkedin: 'https://www.linkedin.com/in/google-developer-groups-on-campus-sit-pune/',
    githubOrg: 'https://github.com/gdg-sit-pune',
    github: 'https://github.com/gdg-sit',
    x: '',
  },
}

export const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/events', label: 'Events' },
  { href: '/team', label: 'Team' },
  { href: '/contact', label: 'Contact' },
]
