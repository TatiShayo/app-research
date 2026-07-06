import { notFound } from "next/navigation";
import Link from "next/link";
import { getEventBySlug, listPhotos } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function GalleryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = getEventBySlug(slug);
  if (!event || event.status !== "active" || event.gallery_public !== 1) notFound();

  const photos = listPhotos(event.id);

  return (
    <main className="flex-1 px-4 py-10 max-w-6xl mx-auto w-full">
      <div className="text-center mb-8">
        <p className="text-xs font-semibold tracking-widest uppercase text-terra mb-2">GuestSnap</p>
        <h1 className="font-display text-3xl text-stone-900">{event.name}</h1>
        <p className="text-stone-500 text-sm mt-1">
          {photos.length} photo{photos.length === 1 ? "" : "s"} · updated live
        </p>
        <Link
          href={`/e/${event.slug}`}
          className="inline-block mt-4 rounded-xl bg-terra hover:bg-terra-dark text-white font-semibold px-6 py-2.5 text-sm transition-colors"
        >
          + Add your photos
        </Link>
      </div>

      {photos.length === 0 ? (
        <p className="text-center text-stone-500 py-20">
          No photos yet — be the first to add one!
        </p>
      ) : (
        <div className="columns-2 sm:columns-3 lg:columns-4 gap-3 [column-fill:_balance]">
          {photos.map((photo) => (
            <a
              key={photo.id}
              href={`/api/img/${photo.id}`}
              target="_blank"
              rel="noopener"
              className="block mb-3 break-inside-avoid rounded-xl overflow-hidden bg-stone-100"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/img/${photo.id}?thumb=1`}
                alt={photo.caption || photo.original_name}
                loading="lazy"
                className="w-full h-auto"
              />
              {(photo.uploader_name || photo.caption) && (
                <div className="px-3 py-2 bg-white text-xs text-stone-600">
                  {photo.uploader_name && <span className="font-semibold">{photo.uploader_name}</span>}
                  {photo.uploader_name && photo.caption && " · "}
                  {photo.caption}
                </div>
              )}
            </a>
          ))}
        </div>
      )}
    </main>
  );
}
