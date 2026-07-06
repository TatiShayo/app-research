"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type PhotoItem = {
  id: string;
  uploaderName: string | null;
  caption: string | null;
  originalName: string;
  createdAt: string;
  size: number;
};

type Props = {
  isNew: boolean;
  event: {
    name: string;
    slug: string;
    eventDate: string | null;
    status: string;
    galleryPublic: boolean;
    adminToken: string;
  };
  guestUrl: string;
  qrDataUrl: string;
  photos: PhotoItem[];
};

export default function ManageDashboard({ isNew, event, guestUrl, qrDataUrl, photos }: Props) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [galleryPublic, setGalleryPublic] = useState(event.galleryPublic);
  const [deleting, setDeleting] = useState<string | null>(null);

  const totalBytes = photos.reduce((sum, p) => sum + p.size, 0);
  const totalMb = (totalBytes / (1024 * 1024)).toFixed(1);

  async function copyLink() {
    await navigator.clipboard.writeText(guestUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function toggleGallery() {
    const next = !galleryPublic;
    setGalleryPublic(next);
    await fetch(`/api/manage/${event.adminToken}/settings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gallery_public: next }),
    });
  }

  async function removePhoto(id: string) {
    if (!confirm("Delete this photo? This can't be undone.")) return;
    setDeleting(id);
    await fetch(`/api/manage/${event.adminToken}/photos/${id}`, { method: "DELETE" });
    setDeleting(null);
    router.refresh();
  }

  return (
    <main className="flex-1 px-4 sm:px-6 py-10 max-w-5xl mx-auto w-full">
      {isNew && (
        <div className="mb-6 rounded-2xl bg-green-50 border border-green-200 px-5 py-4 text-sm text-green-900">
          <strong>Your event is live!</strong> Bookmark this page — this private link is how you
          get back to your dashboard. Next step: print your table signs below.
        </div>
      )}

      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-semibold tracking-widest uppercase text-terra mb-1">
            GuestSnap dashboard
          </p>
          <h1 className="font-display text-3xl text-stone-900">{event.name}</h1>
          <p className="text-stone-500 text-sm mt-1">
            {photos.length} photo{photos.length === 1 ? "" : "s"} · {totalMb} MB collected
          </p>
        </div>
        {photos.length > 0 && (
          <a
            href={`/api/manage/${event.adminToken}/download`}
            className="rounded-xl bg-pine text-white font-semibold px-6 py-3 text-sm hover:opacity-90 transition-opacity"
          >
            ⬇ Download all ({totalMb} MB zip)
          </a>
        )}
      </div>

      {/* Share tools */}
      <div className="grid sm:grid-cols-2 gap-4 mb-10">
        <div className="bg-white border border-stone-200 rounded-2xl p-6">
          <h2 className="font-semibold text-stone-900 mb-3">Guest link</h2>
          <div className="flex gap-2">
            <input
              readOnly
              value={guestUrl}
              className="flex-1 rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-600 min-w-0"
            />
            <button
              onClick={copyLink}
              className="rounded-lg bg-terra hover:bg-terra-dark text-white px-4 py-2 text-sm font-semibold transition-colors shrink-0"
            >
              {copied ? "Copied ✓" : "Copy"}
            </button>
          </div>
          <p className="text-xs text-stone-500 mt-3">
            Share in the group chat, on invites, or anywhere guests will see it.
          </p>
          <label className="flex items-center gap-2 mt-4 text-sm text-stone-700 cursor-pointer">
            <input
              type="checkbox"
              checked={galleryPublic}
              onChange={toggleGallery}
              className="w-4 h-4 accent-[#b3573f]"
            />
            Guests can view the shared gallery
          </label>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-6 flex gap-5 items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qrDataUrl} alt="Guest QR code" className="w-28 h-28 rounded-lg border border-stone-100" />
          <div>
            <h2 className="font-semibold text-stone-900 mb-2">QR code</h2>
            <div className="flex flex-col gap-2">
              <a
                href={`/manage/${event.adminToken}/print`}
                className="text-sm font-semibold text-terra underline"
              >
                Print table signs →
              </a>
              <a
                href={`/api/manage/${event.adminToken}/qr`}
                className="text-sm font-semibold text-terra underline"
              >
                Download QR as PNG →
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Photos */}
      <h2 className="font-display text-2xl text-stone-900 mb-4">Photos</h2>
      {photos.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-stone-200 py-16 text-center text-stone-500 text-sm">
          No photos yet. Print your signs and watch this fill up on the big day.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {photos.map((photo) => (
            <div key={photo.id} className="group relative rounded-xl overflow-hidden bg-stone-100">
              <a href={`/api/img/${photo.id}`} target="_blank" rel="noopener">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/img/${photo.id}?thumb=1`}
                  alt={photo.caption || photo.originalName}
                  loading="lazy"
                  className="w-full aspect-square object-cover"
                />
              </a>
              <button
                onClick={() => removePhoto(photo.id)}
                disabled={deleting === photo.id}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Delete photo"
              >
                {deleting === photo.id ? "…" : "🗑"}
              </button>
              {(photo.uploaderName || photo.caption) && (
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent px-2 pb-1.5 pt-6 text-[11px] text-white truncate">
                  {photo.uploaderName}
                  {photo.uploaderName && photo.caption ? " · " : ""}
                  {photo.caption}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
