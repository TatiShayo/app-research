# GuestSnap

Every photo your guests take. One QR code. No app, no accounts — $49 per event.

Guests scan a QR code on the table, upload photos straight from their phone's camera roll,
and everything lands in the host's private gallery at full quality. The host downloads it
all as one zip. Built for weddings; works for any event.

## How it works

| Who | What |
| --- | --- |
| Host | Pays once on the landing page → gets a private dashboard URL (unguessable token, no login) |
| Guests | Scan the QR / open `/e/<slug>` → pick photos → upload. Zero friction. |
| Host | Watches the shared gallery fill up live, prints table signs, downloads everything as a zip |

## Stack

- **Next.js 16** (App Router, standalone output) + Tailwind 4
- **SQLite** (better-sqlite3) — events + photo metadata
- **Local disk** — original photos + sharp-generated webp thumbnails under `DATA_DIR/uploads/`
- **Stripe Checkout** — one-time $49 payment, webhook-activated events
- No auth system: hosts get a 24-char token URL, guests get a 6-char event slug

## Run locally (demo mode)

```bash
npm install
npm run dev
```

Without `STRIPE_SECRET_KEY` set, the app runs in **demo mode**: no payment step, events are
created instantly. This is the full product loop minus billing — create an event on the
landing page and you'll be dropped straight into the dashboard.

## Deploy (single server: Railway / Fly.io / any Docker host)

This app keeps state on disk (SQLite + photos), so deploy it to **one instance with a
persistent volume** — not to serverless. That is a feature: zero external services,
~95% margins, nothing to configure but Stripe.

```bash
docker build -t guestsnap .
docker run -p 3000:3000 -v guestsnap-data:/data \
  -e NEXT_PUBLIC_BASE_URL=https://yourdomain.com \
  -e STRIPE_SECRET_KEY=sk_live_... \
  -e STRIPE_WEBHOOK_SECRET=whsec_... \
  guestsnap
```

### Stripe setup (5 minutes)

1. Grab your secret key from the Stripe dashboard → `STRIPE_SECRET_KEY`.
2. Add a webhook endpoint pointing at `https://yourdomain.com/api/stripe/webhook`,
   subscribed to `checkout.session.completed` → copy the signing secret into
   `STRIPE_WEBHOOK_SECRET`.
3. Done. The checkout success page also verifies payment directly, so even a slow
   webhook won't strand a paying customer.

## Environment variables

See `.env.example`. Only the Stripe keys and `NEXT_PUBLIC_BASE_URL` are needed in
production; everything else has sane defaults.

## Post-MVP roadmap

- Email the dashboard link on purchase (currently shown on the success page only)
- Video uploads
- Slideshow mode (live projector view during the reception)
- Guest photo challenges ("get a photo with the groom")
- Auto-expiry + storage cleanup after 12 months
- Rate limiting on the upload endpoint
