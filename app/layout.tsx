import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sipena — Sistem Pendaftaran Lomba",
  description: "Daftar lomba sekolah SMA Kartika XIX-1 Bandung dengan mudah melalui Sipena."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
