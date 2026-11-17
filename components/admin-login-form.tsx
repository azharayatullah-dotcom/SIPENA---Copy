"use client";

import { FormEvent, useState } from "react";

type LoginResult = { message?: string };

export function AdminLoginForm() {
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setError("");
    const data = new FormData(event.currentTarget);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: data.get("username"),
          password: data.get("password")
        })
      });
      const result = (await response.json()) as LoginResult;
      if (!response.ok) {
        setError(result.message ?? "Login belum berhasil.");
        return;
      }
      window.location.assign("/admin");
    } catch (requestError) {
      console.error("Gagal menghubungi layanan login:", requestError);
      setError("Tidak dapat terhubung ke server. Silakan coba kembali.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <label className="block text-sm font-bold text-navy">
        Username
        <input
          className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-4 text-sm"
          name="username"
          autoComplete="username"
          required
        />
      </label>
      <label className="block text-sm font-bold text-navy">
        Kata Sandi
        <input
          className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-4 text-sm"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </label>
      {error && (
        <p role="alert" className="rounded-xl bg-rose-50 p-4 text-sm text-rose-800">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={submitting}
        className="min-h-12 w-full rounded-xl bg-navy px-5 font-extrabold text-white hover:bg-slate-800 disabled:opacity-60"
      >
        {submitting ? "Memeriksa..." : "Masuk ke Dashboard"}
      </button>
    </form>
  );
}
