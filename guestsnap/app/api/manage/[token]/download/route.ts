import { NextRequest, NextResponse } from "next/server";
import { ZipArchive } from "archiver";
import fs from "fs";
import { Readable } from "stream";
import { getEventByAdminToken, listPhotos } from "@/lib/db";
import { photoFilePath } from "@/lib/storage";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  const event = getEventByAdminToken(token);
  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const photos = listPhotos(event.id);
  if (photos.length === 0) {
    return NextResponse.json({ error: "No photos yet" }, { status: 404 });
  }

  const archive = new ZipArchive({ zlib: { level: 0 } }); // photos are already compressed
  const usedNames = new Set<string>();

  for (const photo of photos) {
    const filePath = photoFilePath(event.id, photo.stored_name);
    if (!fs.existsSync(filePath)) continue;
    const ext = photo.stored_name.split(".").pop();
    const uploader = (photo.uploader_name || "guest").replace(/[^\w\- ]/g, "").trim() || "guest";
    let entryName = `${uploader}-${photo.original_name.replace(/[^\w\-. ]/g, "")}` || `${photo.id}.${ext}`;
    if (usedNames.has(entryName)) entryName = `${photo.id}-${entryName}`;
    usedNames.add(entryName);
    archive.file(filePath, { name: entryName });
  }

  archive.finalize();

  const safeEventName = event.name.replace(/[^\w\- ]/g, "").trim() || "guestsnap";
  return new NextResponse(Readable.toWeb(archive as unknown as Readable) as ReadableStream, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${safeEventName}-photos.zip"`,
    },
  });
}
