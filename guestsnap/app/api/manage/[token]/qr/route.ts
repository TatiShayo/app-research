import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import { getEventByAdminToken } from "@/lib/db";
import { baseUrl } from "@/lib/config";

export async function GET(req: NextRequest, ctx: { params: Promise<{ token: string }> }) {
  const { token } = await ctx.params;
  const event = getEventByAdminToken(token);
  if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const guestUrl = `${baseUrl(req.nextUrl.origin)}/e/${event.slug}`;
  const png = await QRCode.toBuffer(guestUrl, {
    type: "png",
    width: 1200,
    margin: 2,
    color: { dark: "#1c1917", light: "#ffffff" },
  });

  return new NextResponse(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="guestsnap-qr-${event.slug}.png"`,
    },
  });
}
