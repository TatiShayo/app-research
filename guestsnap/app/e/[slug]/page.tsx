import { notFound } from "next/navigation";
import Link from "next/link";
import { getEventBySlug, countPhotos } from "@/lib/db";
import Uploader from "@/components/Uploader";

export const dynamic = "force-dynamic";

export default async function GuestPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  if (!event || event.status !== "active") notFound();

  const total = countPhotos(event.id);

  return (
    <main className="flex-1 px-6 py-12 flex flex-col items-center">
      <p className="text-xs font-semibold tracking-widest uppercase text-terra mb-3">GuestSnap</p>
      <h1 className="font-display text-3xl sm:text-4xl text-stone-900 text-center mb-2">
        {event.name}
      </h1>
      <p className="text-stone-500 text-sm mb-8 text-center">
        Share your photos with the {total > 0 ? `${total} already collected` : "gallery"} — it
        takes ten seconds.
      </p>

      <Uploader slug={event.slug} galleryPublic={event.gallery_public === 1} />

      {event.gallery_public === 1 && (
        <Link
          href={`/e/${event.slug}/gallery`}
          className="mt-8 text-terra font-semibold underline text-sm"
        >
          View the live gallery →
        </Link>
      )}
    </main>
  );
}
