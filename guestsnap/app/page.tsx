import CreateEventForm from "@/components/CreateEventForm";
import { priceLabel, stripeConfigured } from "@/lib/config";

const steps = [
  {
    title: "Create your event",
    body: "Name it, pay once, done. You get a QR code and a private gallery in under a minute.",
  },
  {
    title: "Put the QR code on the tables",
    body: "Print our ready-made table signs. Guests scan with their camera — no app, no account, nothing to install.",
  },
  {
    title: "Every photo lands in one gallery",
    body: "Guests upload straight from their phones. You watch the gallery fill up live, then download everything in one zip.",
  },
];

const faqs = [
  {
    q: "Do guests need to install anything?",
    a: "No. The QR code opens a web page. They pick photos, tap upload, done. Works on any phone.",
  },
  {
    q: "How many photos and guests are included?",
    a: "Unlimited guests and unlimited photos, at full original quality. One flat price per event.",
  },
  {
    q: "How long do I keep the photos?",
    a: "Your gallery stays live for 12 months. Download everything as a zip anytime — the photos are yours.",
  },
  {
    q: "Can guests see each other's photos?",
    a: "Your choice. The shared live gallery is on by default (guests love it), and you can switch it off with one toggle.",
  },
  {
    q: "Is this only for weddings?",
    a: "Weddings are the classic use, but it works for birthdays, reunions, corporate events, baby showers — anywhere phones are pointed at things.",
  },
];

export default function Home() {
  return (
    <main className="flex-1">
      {/* Hero */}
      <section className="px-6 pt-16 pb-20 max-w-5xl mx-auto text-center">
        <p className="text-sm font-semibold tracking-widest uppercase text-terra mb-4">GuestSnap</p>
        <h1 className="font-display text-4xl sm:text-6xl leading-tight text-stone-900 mb-6">
          Every photo your guests take.
          <br />
          One QR code.
        </h1>
        <p className="text-lg text-stone-600 max-w-2xl mx-auto mb-10">
          Your guests will take a thousand photos at your wedding — and you&rsquo;ll see twelve of
          them. Put a GuestSnap code on the tables and every single shot lands in your private
          gallery. No app. No accounts. {priceLabel()} once.
        </p>
        <div className="flex justify-center">
          <CreateEventForm priceLabel={priceLabel()} />
        </div>
        {!stripeConfigured && (
          <p className="mt-4 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 inline-block">
            Demo mode: payments are disabled, events are created instantly.
          </p>
        )}
      </section>

      {/* How it works */}
      <section className="bg-blush px-6 py-16">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-3xl text-stone-900 text-center mb-12">How it works</h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={step.title} className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="w-9 h-9 rounded-full bg-terra text-white flex items-center justify-center font-semibold mb-4">
                  {i + 1}
                </div>
                <h3 className="font-semibold text-lg mb-2 text-stone-900">{step.title}</h3>
                <p className="text-stone-600 text-sm leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="px-6 py-16 max-w-3xl mx-auto text-center">
        <h2 className="font-display text-3xl text-stone-900 mb-4">One price. One event. That&rsquo;s it.</h2>
        <div className="bg-white border border-stone-200 rounded-3xl p-10 shadow-sm inline-block">
          <div className="font-display text-6xl text-stone-900 mb-2">{priceLabel()}</div>
          <p className="text-stone-500 mb-6">per event, one-time — no subscription</p>
          <ul className="text-left text-stone-700 space-y-2 mb-8 text-sm">
            {[
              "Unlimited guests & unlimited photos",
              "Full original quality, yours to keep",
              "Live shared gallery (optional)",
              "Printable QR table signs",
              "One-click download of everything",
              "Gallery live for 12 months",
            ].map((f) => (
              <li key={f} className="flex gap-2">
                <span className="text-terra font-bold">✓</span> {f}
              </li>
            ))}
          </ul>
          <a
            href="#create"
            className="block rounded-xl bg-terra hover:bg-terra-dark text-white font-semibold px-8 py-3.5 transition-colors"
          >
            Create my event
          </a>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-blush px-6 py-16">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-display text-3xl text-stone-900 text-center mb-10">Questions, answered</h2>
          <div className="space-y-4">
            {faqs.map((f) => (
              <details key={f.q} className="bg-white rounded-xl p-5 shadow-sm group">
                <summary className="font-semibold text-stone-900 cursor-pointer list-none flex justify-between items-center">
                  {f.q}
                  <span className="text-terra group-open:rotate-45 transition-transform text-xl leading-none">+</span>
                </summary>
                <p className="text-stone-600 text-sm mt-3 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <footer className="px-6 py-10 text-center text-sm text-stone-400">
        © {new Date().getFullYear()} GuestSnap · Photos your guests actually share
      </footer>
    </main>
  );
}
