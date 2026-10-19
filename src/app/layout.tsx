import type { Metadata } from 'next'
import { Google_Sans } from 'next/font/google'
import { TransitionsReady } from '@/components/ClientEffects'
import { domainCountWord } from '@/data/domains'
import { site } from '@/data/site'
import { siteUrl } from '@/lib/site-url'
import './globals.css'

const googleSans = Google_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-google-sans',
  display: 'swap',
})

const description = `${site.fullName} at ${site.college}, ${site.city}. ${domainCountWord} domains, from web development to design, and one community of student developers.`

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: site.shortName, template: `%s | ${site.shortName}` },
  description,
  openGraph: { siteName: site.shortName, title: site.shortName, description, type: 'website', locale: 'en_IN' },
  twitter: { card: 'summary_large_image' },
}

// Runs before first paint: applies the saved (or system) theme so there's no light/dark flash.
// `preload` keeps transitions off until the page is ready (removed by TransitionsReady).
const themeScript = `(() => {
  document.documentElement.classList.add('preload')
  try {
    const saved = localStorage.getItem('theme')
    const dark = saved ? saved === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches
    if (dark) document.documentElement.classList.add('dark')
  } catch {}
})()`

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={googleSans.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        {children}
        <TransitionsReady />
      </body>
    </html>
  )
}
