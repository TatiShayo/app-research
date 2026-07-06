import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { getEventBySlug, insertPhoto } from "@/lib/db";
import { savePhotoFile } from "@/lib/storage";
import { MAX_FILE_BYTES, MAX_FILES_PER_REQUEST } from "@/lib/config";
import { customAlphabet } from "nanoid";

const fileId = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", 20);

const EXT_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/heic": "heic",
  "image/heif": "heif",
  "image/avif": "avif",
};

export async function POST(req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const event = getEventBySlug(slug);
  if (!event || event.status !== "active") {
    return NextResponse.json({ error: "Event not found or not active" }, { status: 404 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload" }, { status: 400 });
  }

  const uploaderName = String(form.get("uploader_name") || "").trim().slice(0, 80) || null;
  const caption = String(form.get("caption") || "").trim().slice(0, 300) || null;
  const files = form.getAll("photos").filter((f): f is File => f instanceof File);

  if (files.length === 0) return NextResponse.json({ error: "No photos in upload" }, { status: 400 });
  if (files.length > MAX_FILES_PER_REQUEST) {
    return NextResponse.json({ error: `Max ${MAX_FILES_PER_REQUEST} photos per upload` }, { status: 400 });
  }

  const saved: { id: string }[] = [];
  const errors: string[] = [];

  for (const file of files) {
    const mime = file.type || "application/octet-stream";
    if (!(mime in EXT_BY_MIME)) {
      errors.push(`${file.name}: unsupported type`);
      continue;
    }
    if (file.size > MAX_FILE_BYTES) {
      errors.push(`${file.name}: over 25 MB`);
      continue;
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const id = fileId();
    const storedName = `${id}.${EXT_BY_MIME[mime]}`;

    let thumbName: string | null = null;
    try {
      const thumb = await sharp(buffer, { failOn: "none" })
        .rotate()
        .resize(600, 600, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: 78 })
        .toBuffer();
      thumbName = `${id}_t.webp`;
      await savePhotoFile(event.id, thumbName, thumb);
    } catch {
      // HEIC without codec support etc. — keep the original, skip the thumbnail.
      thumbName = null;
    }

    await savePhotoFile(event.id, storedName, buffer);
    const photo = insertPhoto({
      eventId: event.id,
      storedName,
      thumbName,
      originalName: file.name.slice(0, 200),
      uploaderName,
      caption,
      mime,
      size: file.size,
    });
    saved.push({ id: photo.id });
  }

  if (saved.length === 0) {
    return NextResponse.json({ error: errors.join("; ") || "Nothing uploaded" }, { status: 400 });
  }
  return NextResponse.json({ saved: saved.length, errors });
}
