import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { getEventByAdminToken, listPhotos } from "@/lib/db";
import { baseUrl } from "@/lib/config";
import ManageDashboard from "@/components/ManageDashboard";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export default async function ManagePage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ new?: string }>;
}) {
  const { token } = await params;
  const { new: isNew } = await searchParams;
  const event = getEventByAdminToken(token);
  if (!event) notFound();

  const hdrs = await headers();
  const host = hdrs.get("host");
  const proto = hdrs.get("x-forwarded-proto") || "http";
  const base = baseUrl(host ? `${proto}://${host}` : undefined);

  const guestUrl = `${base}/e/${event.slug}`;
  const qrDataUrl = await QRCode.toDataURL(guestUrl, {
    width: 480,
    margin: 2,
    color: { dark: "#1c1917", light: "#ffffff" },
  });

  const photos = listPhotos(event.id).map((p) => ({
    id: p.id,
    uploaderName: p.uploader_name,
    caption: p.caption,
    originalName: p.original_name,
    createdAt: p.created_at,
    size: p.size,
  }));

  return (
    <ManageDashboard
      isNew={isNew === "1"}
      event={{
        name: event.name,
        slug: event.slug,
        eventDate: event.event_date,
        status: event.status,
        galleryPublic: event.gallery_public === 1,
        adminToken: event.admin_token,
      }}
      guestUrl={guestUrl}
      qrDataUrl={qrDataUrl}
      photos={photos}
    />
  );
}
