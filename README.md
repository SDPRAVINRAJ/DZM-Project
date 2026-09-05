# DZM Tamil Corner

A full-stack web app for **SMK Dato' Zulkifli Muhammad** Tamil class — teachers upload and manage materials and competitions; students view everything publicly without logging in.

Built with **Next.js + TailwindCSS + Firebase** (Firestore, Storage, Auth) and deployed on **Netlify**.

## Features

- **Home** — festive Tamil-themed hero banner, teacher profile card, latest materials & competitions
- **Materials** — searchable grid of PDF/DOC notes grouped by subject, downloadable by anyone
- **Competitions** — announcements with date, description, and photo gallery (lightbox)
- **Teacher Login** — Firebase email/password, single teacher account (no public sign-up)
- **Teacher Dashboard** (protected) — upload materials, add/edit/delete competitions, edit teacher profile
- **Client-side compression** before upload (images resized to max 1200px / ~75% quality; PDFs re-saved with object streams). Before/after sizes shown to the teacher.
- Fully responsive, mobile-first. Tamil text uses **Noto Sans Tamil**, English/BM uses **Poppins**.

## Tech Stack

- Next.js 13 (App Router) + React 18
- TailwindCSS + shadcn/ui-style components
- Firebase (Firestore + Storage + Auth)
- `browser-image-compression` for images, `pdf-lib` for PDF optimization
- Netlify for hosting

## Setup

### 1. Firebase project

1. Go to <https://console.firebase.google.com> and create a new project.
2. Add a **Web app** to get the config values (`apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`).
3. In **Authentication → Sign-in method**, enable **Email/Password**.
4. In **Authentication → Users**, click **Add user** and create the teacher account (email + password). This is the only login that can access the dashboard.
5. In **Firestore Database**, create the database in production mode. Paste the contents of [`firestore.rules`](./firestore.rules) into the Rules tab and Publish.
6. In **Storage**, paste the contents of [`storage.rules`](./storage.rules) into the Rules tab and Publish.

### 2. Environment variables

Create a `.env.local` file (for local dev) and add the same keys in Netlify (Site settings → Environment variables):

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

### 3. Install & run locally

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

### 4. Seed data (optional)

After logging in as the teacher, use the dashboard to add:

- 1–2 materials (e.g. "Form 4 Tamil Grammar Notes" — subject: இலக்கணம், PDF)
- 1 competition (e.g. "Tamil Speech Competition 2025" with a date and a couple of photos)
- Teacher profile (name, subject: Tamil, short bio, photo)

This populates the home and listing pages.

### 5. Deploy to Netlify

1. Push this repo to GitHub.
2. In Netlify, **Add new site → Import an existing project**, pick the repo.
3. Build command: `npm run build` · Publish directory: `.next` (the `@netlify/plugin-nextjs` plugin in `netlify.toml` handles this automatically).
4. Add the same environment variables from step 2.
5. Deploy. Your site is live on a `*.netlify.app` URL.

### 6. Custom domain (optional)

In Netlify → Domain settings, add `dzmtamilcorner.com` (or your domain) and follow the DNS instructions.

## Assets

Place these in `/public`:

- `image.png` — the **real** SMK Dato' Zulkifli Muhammad school logo (used in header, hero, footer, login). Do NOT use an AI-generated logo.
- `hero-background.png` — festive Tamil-themed background image (homepage hero only). If you want to use your own, replace the Pexels URL in `app/page.tsx` with `/hero-background.png`.

A teacher profile photo is uploaded from the dashboard (no file needed in the repo).

## Firestore structure

```
materials/{auto-id}      → { title, subject, description, fileUrl, fileType, uploadedAt }
competitions/{auto-id}   → { title, description, competitionDate, photoUrls[], createdAt }
teacherProfile/main      → { name, subject, bio, photoUrl }
```

Public read on all collections; writes restricted to the authenticated teacher.

## Project structure

```
app/
  layout.tsx           # Root layout, fonts, header/footer
  page.tsx             # Home (hero + profile + latest)
  materials/page.tsx   # Public materials listing
  competitions/page.tsx # Public competitions listing + lightbox
  login/page.tsx       # Teacher login (Firebase Auth)
  dashboard/page.tsx   # Protected dashboard (materials/competitions/profile)
components/
  site-header.tsx
  site-footer.tsx
  auth-provider.tsx
lib/
  firebase.ts          # Firebase init
  firestore.ts         # CRUD helpers
  storage.ts           # Upload/delete helpers
  compression.ts       # Image + PDF compression
  utils.ts             # cn(), date formatter
firestore.rules
storage.rules
```
