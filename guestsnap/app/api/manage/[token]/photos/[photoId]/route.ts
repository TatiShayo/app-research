import { NextRequest, NextResponse } from "next/server";
import { getEventByAdminToken, getPhotoById, deletePhoto } from "@/lib/db";
import { deletePhotoFiles } from "@/lib/storage";

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ token: string; photoId: string }> }
) {
  const { token, photoId } = await ctx.params;
  const event = getEventByAdminToken(token);
  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const photo = getPhotoById(photoId);
  if (!photo || photo.event_id !== event.id) {
    return NextResponse.json({ error: "Photo not found" }, { status: 404 });
  }

  deletePhoto(photo.id);
  await deletePhotoFiles(event.id, [photo.stored_name, photo.thumb_name]);
  return NextResponse.json({ ok: true });
}
