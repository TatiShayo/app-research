import Link from "next/link";
import { getEventByStripeSession, activateEvent, getEventById } from "@/lib/db";
import { stripeConfigured } from "@/lib/config";
import { stripe } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id: sessionId } = await searchParams;

  let manageUrl: string | null = null;
  let eventName: string | null = null;

  if (sessionId && stripeConfigured) {
    const event = getEventByStripeSession(sessionId);
    if (event) {
      // Belt and braces: verify payment directly in case the webhook is delayed.
      if (event.status !== "active") {
        try {
          const session = await stripe().checkout.sessions.retrieve(sessionId);
          if (session.payment_status === "paid") activateEvent(event.id);
        } catch {
          // fall through — webhook will activate it
        }
      }
      const fresh = getEventById(event.id)!;
      if (fresh.status === "active") {
        manageUrl = `/manage/${fresh.admin_token}?new=1`;
        eventName = fresh.name;
      }
    }
  }

  return (
    <main className="flex-1 flex items-center justify-center px-6 py-20">
      <div className="max-w-lg text-center">
        <div className="text-5xl mb-6">🎉</div>
        {manageUrl ? (
          <>
            <h1 className="font-display text-3xl text-stone-900 mb-4">
              {eventName} is ready!
            </h1>
            <p className="text-stone-600 mb-8">
              Your event is live. Grab your QR code, print your table signs, and share the link
              with your guests. Bookmark your dashboard — it&rsquo;s your private key to the
              gallery.
            </p>
            <Link
              href={manageUrl}
              className="inline-block rounded-xl bg-terra hover:bg-terra-dark text-white font-semibold px-8 py-3.5 transition-colors"
            >
              Open my dashboard
            </Link>
          </>
        ) : (
          <>
            <h1 className="font-display text-3xl text-stone-900 mb-4">Payment received</h1>
            <p className="text-stone-600 mb-8">
              We&rsquo;re setting up your event — this usually takes a few seconds. Refresh this
              page, or check your email for your dashboard link.
            </p>
            <Link href="/" className="text-terra font-semibold underline">
              Back to home
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
