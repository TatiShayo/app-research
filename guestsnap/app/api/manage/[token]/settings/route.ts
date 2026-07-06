import { NextRequest, NextResponse } from "next/server";
import { getEventByAdminToken, setGalleryPublic } from "@/lib/db";

export async function POST(req: NextRequest, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  const event = getEventByAdminToken(token);
  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let body: { gallery_public?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (typeof body.gallery_public === "boolean") {
    setGalleryPublic(event.id, body.gallery_public);
  }
  return NextResponse.json({ ok: true });
}
