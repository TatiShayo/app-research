import { NextRequest, NextResponse } from "next/server";
import { createEvent, setStripeSession, activateEvent } from "@/lib/db";
import { stripeConfigured, PRICE_CENTS, baseUrl } from "@/lib/config";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  let body: { name?: string; date?: string; email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const name = (body.name || "").trim().slice(0, 120);
  const email = (body.email || "").trim().slice(0, 200);
  const date = (body.date || "").trim().slice(0, 40) || null;

  if (!name) return NextResponse.json({ error: "Event name is required" }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
  }

  const base = baseUrl(req.nextUrl.origin);

  if (!stripeConfigured) {
    // Demo mode: no Stripe key configured, activate immediately.
    const event = createEvent({ name, eventDate: date, hostEmail: email, status: "active" });
    activateEvent(event.id);
    return NextResponse.json({ url: `${base}/manage/${event.admin_token}?new=1` });
  }

  const event = createEvent({ name, eventDate: date, hostEmail: email, status: "pending" });
  const session = await stripe().checkout.sessions.create({
    mode: "payment",
    customer_email: email,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: PRICE_CENTS,
          product_data: {
            name: "GuestSnap — one event, unlimited photos",
            description: `Photo collection for “${name}”`,
          },
        },
      },
    ],
    metadata: { event_id: event.id },
    success_url: `${base}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${base}/?canceled=1`,
  });
  setStripeSession(event.id, session.id);
  return NextResponse.json({ url: session.url });
}
