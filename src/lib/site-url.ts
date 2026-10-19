// Used for absolute links in previews (Open Graph), robots.txt and the sitemap.
// Set NEXT_PUBLIC_SITE_URL once the site has a domain.
// `||` (not `??`) so an empty value in .env falls through to the default
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000')
