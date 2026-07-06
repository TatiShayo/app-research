"use client";

import { useRef, useState } from "react";

type Props = { slug: string; galleryPublic: boolean };

export default function Uploader({ slug, galleryPublic }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [name, setName] = useState("");
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  function pick(list: FileList | null) {
    if (!list) return;
    const images = Array.from(list).filter((f) => f.type.startsWith("image/"));
    setFiles((prev) => [...prev, ...images].slice(0, 20));
    setDone(null);
    setError(null);
  }

  async function upload() {
    if (files.length === 0) return;
    setBusy(true);
    setError(null);
    try {
      const form = new FormData();
      if (name.trim()) form.set("uploader_name", name.trim());
      if (caption.trim()) form.set("caption", caption.trim());
      for (const f of files) form.append("photos", f);
      const res = await fetch(`/api/e/${slug}/upload`, { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setDone(data.saved);
      setFiles([]);
      if (inputRef.current) inputRef.current.value = "";
      if (data.errors?.length) setError(data.errors.join("; "));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed — try again");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      {done !== null && (
        <div className="mb-4 rounded-xl bg-green-50 border border-green-200 text-green-800 px-4 py-3 text-sm text-center">
          🎉 {done} photo{done === 1 ? "" : "s"} added — thank you!
          {galleryPublic && (
            <>
              {" "}
              <a href={`/e/${slug}/gallery`} className="underline font-semibold">
                See the gallery
              </a>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => pick(e.target.files)}
      />

      <button
        onClick={() => inputRef.current?.click()}
        className="w-full rounded-2xl border-2 border-dashed border-terra/50 bg-white py-10 flex flex-col items-center gap-2 hover:border-terra transition-colors"
      >
        <span className="text-4xl">📸</span>
        <span className="font-semibold text-stone-800">Tap to add photos</span>
        <span className="text-xs text-stone-500">from your camera roll — up to 20 at a time</span>
      </button>

      {files.length > 0 && (
        <>
          <div className="grid grid-cols-4 gap-2 mt-4">
            {files.map((f, i) => (
              <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-stone-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={URL.createObjectURL(f)}
                  alt=""
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={() => setFiles(files.filter((_, j) => j !== i))}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white text-xs leading-none"
                  aria-label="Remove"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name (optional)"
            className="mt-4 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base outline-none focus:border-terra"
          />
          <input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="A note for the couple (optional)"
            className="mt-2 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base outline-none focus:border-terra"
          />

          <button
            onClick={upload}
            disabled={busy}
            className="mt-4 w-full rounded-xl bg-terra hover:bg-terra-dark disabled:opacity-60 text-white font-semibold py-3.5 transition-colors"
          >
            {busy
              ? "Uploading…"
              : `Upload ${files.length} photo${files.length === 1 ? "" : "s"}`}
          </button>
        </>
      )}

      {error && <p className="mt-3 text-sm text-red-700 text-center">{error}</p>}
    </div>
  );
}
