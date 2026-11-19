"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Gagal memuat halaman:", error);
  }, [error]);

  return (
    <main className="error-page">
      <p className="section-eyebrow"><span /> Sipena</p>
      <h1>Halaman belum dapat dimuat.</h1>
      <p>
        Periksa koneksi database dan konfigurasi deployment. Jika baru memasang aplikasi,
        jalankan migrasi database lalu isi data lomba dengan seed.
      </p>
      <button type="button" onClick={() => reset()}>Coba lagi</button>
    </main>
  );
}
