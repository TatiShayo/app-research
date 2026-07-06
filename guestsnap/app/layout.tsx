import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GuestSnap — every guest photo, one QR code",
  description:
    "Collect every photo your wedding or event guests take. One QR code on the tables, zero apps to install, all photos in one gallery. $49 per event.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-ivory text-stone-800">{children}</body>
    </html>
  );
}
