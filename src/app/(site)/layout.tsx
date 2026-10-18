import { SmoothScroll } from '@/components/ClientEffects'
import Footer from '@/components/Footer'
import Navbar from '@/components/Navbar'

/** Public pages: navbar, page content, footer. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <SmoothScroll />
    </div>
  )
}
