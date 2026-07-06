import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import { getPhotoById } from "@/lib/db";
import { photoFilePath } from "@/lib/storage";

export async function GET(req: NextRequest, ctx: { params: Promise<{ photoId: string }> }) {
  const { photoId } = await ctx.params;
  const photo = getPhotoById(photoId);
  if (!photo) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const wantThumb = req.nextUrl.searchParams.get("thumb") === "1";
  const name = wantThumb && photo.thumb_name ? photo.thumb_name : photo.stored_name;
  const mime = wantThumb && photo.thumb_name ? "image/webp" : photo.mime;
  const filePath = photoFilePath(photo.event_id, name);

  let stat: fs.Stats;
  try {
    stat = await fs.promises.stat(filePath);
  } catch {
    return NextResponse.json({ error: "File missing" }, { status: 404 });
  }

  const stream = fs.createReadStream(filePath);
  return new NextResponse(stream as unknown as ReadableStream, {
    headers: {
      "Content-Type": mime,
      "Content-Length": String(stat.size),
      "Cache-Control": "private, max-age=31536000, immutable",
    },
  });
}
