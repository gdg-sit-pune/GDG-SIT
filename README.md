# GDG on Campus SIT Pune

Website and admin panel for Google Developer Groups on Campus at Symbiosis Institute of Technology, Pune.

Built with Next.js 16 (App Router), TypeScript, Tailwind CSS 4, Firebase (Auth + Firestore), Phosphor Icons and Lenis.

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
```

Without Firebase settings, the site runs on the starting content in `src/data/seed.ts`, and the admin panel shows a "Firebase isn't set up yet" message.

## Admin panel

Use the **Admin** link in the footer (or go to `/admin`) and sign in with Google. Only emails listed in `ADMIN_EMAILS` get in. While signed in, an **Admin** button also appears in the navbar.

- **Events**: add, edit and delete events, including multi-day events (set an end date) and photos. Upcoming and past are split by date automatically; an event stays upcoming until its last day. Each event has its own page at `/events/<id>` with a photo gallery.
- **Team**: add, edit, delete and reorder people. Leadership (organizers and faculty coordinator) plus each domain's lead, co-leads and coordinators. A domain with nobody in it is hidden on the public Team page.
- **Stats**: the numbers on the Home page.

The first time, the Team page offers **Import starting content**, which copies the current team and stats from `src/data/seed.ts` into Firebase.

Changes appear on the public site immediately.

### Event photos

Event and team photos are uploaded in the admin panel and stored in **Vercel Blob** (store `gdsc-sit-photos`). Photos are resized in the browser (longest side 1920px, WebP) before uploading. The first photo is the cover and is used for link previews. Photos removed from an event, uploads from a cancelled edit, and the photos of a deleted event are deleted from storage automatically.

For uploads to work locally, `BLOB_READ_WRITE_TOKEN` must be in `.env.local` (on Vercel it is set automatically).

### Team photos

Team photos are uploaded in the admin panel too: open a person in **Team** and use **Upload photo**. The photo is cropped to a centered square and resized to 800×800 before uploading. People without a photo show their initials.

Replaced or removed photos, and the photo of a deleted person, are deleted from storage. After every save, a background sweep also deletes any stored photo that no event or person uses and that is more than an hour old. It never runs against the local test database (emulators), because the photo store is shared with the live site.

## Setting up Firebase

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com) (the free Spark plan is enough).
2. **Authentication** > Get started > Sign-in method > enable **Google**.
3. **Firestore Database** > Create database (production mode). Then deploy the rules in `firestore.rules`, either by pasting them into the Rules tab or with `npx firebase-tools deploy --only firestore:rules`. They block all direct browser access; the site's server does all reading and writing.
4. **Project settings** > General > Your apps > add a **Web app**. Copy its config into `NEXT_PUBLIC_FIREBASE_*` in `.env.local` (copy `.env.example` first).
5. **Project settings** > Service accounts > **Generate new private key**. From the downloaded JSON, copy `project_id`, `client_email` and `private_key` into `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL` and `FIREBASE_PRIVATE_KEY`. Keep this file secret and never commit it.
6. Set `ADMIN_EMAILS` (comma separated).
7. Once the site has a domain, add it under **Authentication** > Settings > Authorized domains.

## Testing locally without a Firebase project

The Firebase emulators run Auth and Firestore on your machine (needs Java 21+).

```bash
npm run emulators       # terminal 1: Auth + Firestore emulators, UI at http://127.0.0.1:4000
npm run dev:emulators   # terminal 2: the site at http://localhost:3100, using .env.emulators
```

On the Google sign-in popup, choose **Add new account** and enter an email from `ADMIN_EMAILS`. Emulator data is wiped when the emulators stop.

## Deploying (Vercel)

1. Push the repo to GitHub and import it in Vercel.
2. Add the variables from `.env.example` under Project settings > Environment Variables. For `FIREBASE_PRIVATE_KEY`, paste the key with its `\n` sequences.
3. Deploy, then add the Vercel domain to Firebase's authorized domains (step 7 above).

## Editing content in code

| What | File |
|---|---|
| Club name, email, address, social links, join link | `src/data/site.ts` |
| The seven domains | `src/data/domains.ts` |
| Starting team and stats (used before Firebase is set up, and for the import) | `src/data/seed.ts` |

## How it works

- `src/app/(site)`: the public pages. Data comes from `src/lib/content.ts`, which caches Firestore reads with `'use cache'` and tags. Admin changes call `updateTag()`, so pages refresh immediately.
- `src/app/admin`: the admin panel. `src/lib/auth.ts` verifies the session cookie on every page and action. `src/app/admin/actions.ts` holds the server actions that validate and save changes.
- Sign-in: the browser signs in with Google (Firebase Auth), sends the ID token to the `startSession` server action, which checks the email against `ADMIN_EMAILS` and sets an httpOnly session cookie for 5 days.

## Design rules

- Colors are tokens in `src/app/globals.css` (`bg-bg`, `text-fg`, `text-muted`, `border-line`, `text-ink-blue`…), so light and dark mode are defined in one place.
- One typeface (Google Sans, via `next/font`). Corners are at most 2px (`rounded-xs`). No gradients.
- Color changes take 100ms everywhere; movement takes 300ms. Both are set globally in `globals.css`.
- The theme switch grows the new theme as a circle from the toggle (View Transitions API, `src/hooks/useTheme.ts`).
- All motion turns off for visitors who prefer reduced motion.
- Icons are imported only through `src/components/icons.ts`.
