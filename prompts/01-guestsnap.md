# BUILD: GuestSnap — QR Photo Collection for Weddings & Events (Web App)

## Your role
You are the lead engineer-orchestrator building a production web app from scratch to deployed completion. Do not stop to ask questions — every decision you need is in this document. Where a detail is unspecified, pick the simplest option that ships.

## Product overview & business model
GuestSnap lets event hosts (weddings, birthdays, funerals, corporate) collect photos/videos from all guests via a QR code — guests upload from their phone browser, NO app download, NO account. Host pays PER EVENT (one-time payment, not subscription). Churn is the business model; revenue comes from a constant stream of new events.
- Free tier: 1 event, 20 photos, GuestSnap watermark on gallery
- Standard $49/event: 500 uploads, live slideshow, ZIP download
- Premium $99/event: unlimited uploads, video guestbook (30s clips), custom branding, AI best-shot culling
Revenue target: first paying customer within 14 days of deploy.

## Tech stack (fixed — do not deviate)
- Next.js 15, App Router, TypeScript, Tailwind CSS, shadcn/ui components
- Supabase: Postgres, Auth (email magic link + Google), Storage (media), Realtime (live slideshow)
- Stripe Checkout (one-time payments) + webhooks
- Resend for transactional email; `qrcode` npm for QR; `sharp` for thumbnails/HEIC→JPEG; `blockhash-core` or perceptual hash for duplicate detection; `archiver` for ZIP streaming
- Deploy: Vercel. Repo: single Next.js app, no monorepo.

## Data model (Supabase, with RLS)
- `profiles` (id=auth.uid, email, name, created_at)
- `events` (id, host_id FK, slug UNIQUE, title, event_date, cover_url, tier enum[free,standard,premium], brand_color, welcome_message, upload_limit int, is_active bool, created_at)
- `media` (id, event_id FK, storage_path, thumb_path, type enum[photo,video], uploader_name text nullable, phash text, is_hidden bool, is_favorite bool, width, height, created_at)
- `payments` (id, event_id, stripe_session_id, amount, tier, status, created_at)
RLS: hosts read/write own events+media; guest upload goes through a server route using service role (validate event is_active + under upload_limit); public read of media only via the event's gallery route.

## Features & implementation
1. **Host onboarding**: magic-link signup → "Create your event" form (title, date, type dropdown: wedding/birthday/funeral/corporate/other, cover image upload). Auto-generate slug (`emma-and-jake-2026`). Free tier active immediately.
2. **QR + share kit**: event dashboard shows QR (PNG + printable PDF table-card template, 4 per A4 page, generated with `@react-pdf/renderer`), short link `guestsnap.app/e/[slug]`.
3. **Guest upload page** (`/e/[slug]`, mobile-first, no auth): welcome message + host cover, "Add your photos" → multi-file input (accept image/video), client-side compression (browser-image-compression), HEIC handled server-side via sharp, optional "your name" field, upload progress bars, uploads go to server route → Supabase Storage → insert media row. Enforce limits by tier; when limit hit show "Ask the host to upgrade" (growth loop).
4. **Live slideshow** (`/e/[slug]/live`): fullscreen, auto-advancing, Ken Burns effect, subscribes to Supabase Realtime inserts so new photos appear within seconds. Designed to be cast to a TV at the event. Watermark on free tier.
5. **Host gallery/moderation**: grid with lazy loading, hide/delete/favorite, filter by uploader, bulk select.
6. **ZIP download**: server route streams all originals via archiver (Standard+).
7. **Video guestbook** (Premium): guest records ≤30s clip via MediaRecorder API, dedicated "Guestbook" tab in gallery.
8. **AI culling** (Premium): compute perceptual hash on upload; group near-duplicates (hamming distance ≤10); within a group auto-pick sharpest (variance of Laplacian via sharp stats) as "best shot"; UI shows groups with best-shot pre-selected for export.
9. **Payments**: "Upgrade event" → Stripe Checkout (one-time). Webhook `checkout.session.completed` → update event tier + upload_limit. Send receipt + confirmation via Resend.
10. **Post-event email**: cron (Vercel cron) day after event_date → email host stats + download link + "Create another event" CTA + 20% referral code.
11. **Marketing site + programmatic SEO**: landing page (hero with live demo event, pricing table, FAQ, testimonials placeholder) + SEO pages generated from a JSON list: `/wedding-photo-sharing-app`, `/qr-code-wedding-photos`, `/funeral-photo-sharing`, `/birthday-party-photo-collection`, `/corporate-event-photo-sharing`, each 600+ words unique copy, FAQ schema markup, CTA. Write the copy yourself, benefit-led, not keyword-stuffed.

## Design rules (avoid AI-slop look)
Warm editorial aesthetic: off-white background (#FAF8F5), one accent (deep terracotta #C1502E), serif display font (Fraunces) + Inter body, generous whitespace, real photography feel. No purple gradients, no glassmorphism, no emoji in UI. Guest page must load <2s on 4G and be usable one-handed.

## Agent orchestration
Run this as an orchestrated build with a task list. Spawn/execute in this order:
1. **Scaffold agent**: Next.js + Tailwind + shadcn init, Supabase schema migration files, env wiring, CI (typecheck+lint+build on push).
2. **Core flow agent**: host auth → create event → guest upload → gallery (the critical path, end-to-end, deployed to preview before anything else).
3. **Payments agent**: Stripe checkout + webhook + tier gating. Test with Stripe CLI.
4. **Experience agents (parallel)**: slideshow+realtime; QR/PDF kit; culling; video guestbook; emails.
5. **Marketing agent**: landing + SEO pages + OG images.
6. **QA agent**: Playwright e2e — signup→create event→guest uploads 3 photos→upgrade (test mode)→ZIP download; mobile viewport tests on the guest page; fix all failures.
7. **Deploy agent**: Vercel production deploy, env vars documented in README, Stripe webhook registered, smoke test on prod URL.
After each agent completes, verify build passes before proceeding. Commit at every milestone with clear messages.

## Env vars required (document in README, use placeholders)
NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, RESEND_API_KEY, NEXT_PUBLIC_APP_URL

## Definition of done
- Deployed on Vercel, all e2e tests green
- A stranger can: create event → print QR → 5 guests upload from phones → live slideshow updates in realtime → host pays (test mode) → downloads ZIP
- Lighthouse mobile ≥85 on guest page; SEO pages indexed-ready (sitemap.xml, robots.txt, metadata)
- README with setup, env vars, Stripe/Supabase config steps, and a launch checklist

## Out of scope v1 (do NOT build)
Native apps, guest accounts, photo editing, prints/physical products, multi-language, team seats.
