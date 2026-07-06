import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { headers } from "next/headers";
import { getEventByAdminToken } from "@/lib/db";
import { baseUrl } from "@/lib/config";
import PrintButton from "@/components/PrintButton";

export const dynamic = "force-dynamic";

export default async function PrintPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const event = getEventByAdminToken(token);
  if (!event) notFound();

  const hdrs = await headers();
  const host = hdrs.get("host");
  const proto = hdrs.get("x-forwarded-proto") || "http";
  const base = baseUrl(host ? `${proto}://${host}` : undefined);
  const guestUrl = `${base}/e/${event.slug}`;

  const qrDataUrl = await QRCode.toDataURL(guestUrl, {
    width: 800,
    margin: 2,
    color: { dark: "#1c1917", light: "#ffffff" },
  });

  return (
    <main className="flex-1 flex flex-col items-center px-6 py-10 bg-white min-h-screen">
      <div className="no-print mb-8 flex gap-3">
        <a
          href={`/manage/${event.admin_token}`}
          className="rounded-xl border border-stone-300 px-5 py-2.5 text-sm font-semibold text-stone-700"
        >
          ← Back to dashboard
        </a>
        <PrintButton />
      </div>

      <div className="border-4 border-double border-stone-300 rounded-2xl px-12 py-14 text-center max-w-md">
        <p className="text-xs font-semibold tracking-[0.3em] uppercase text-stone-500 mb-6">
          Share your photos
        </p>
        <h1 className="font-display text-4xl text-stone-900 mb-2">{event.name}</h1>
        {event.event_date && <p className="text-stone-500 mb-6">{event.event_date}</p>}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qrDataUrl} alt="QR code" className="w-64 h-64 mx-auto my-6" />
        <p className="font-display text-xl text-stone-800 mb-2">Scan with your camera</p>
        <p className="text-sm text-stone-500 leading-relaxed">
          Every photo you take tonight, shared with us in one tap.
          <br />
          No app needed.
        </p>
        <p className="mt-6 text-xs text-stone-400">{guestUrl.replace(/^https?:\/\//, "")}</p>
      </div>
    </main>
  );
}
