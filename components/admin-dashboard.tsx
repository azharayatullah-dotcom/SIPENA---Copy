"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";

type Registration = {
  id: string;
  nomor_registrasi: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  alasan_penolakan: string | null;
  file_path: string;
  createdAt: string;
  peserta: { nama_lengkap: string; nisn: string; no_wa: string };
  lomba: { id: string; nama: string };
};

type DashboardData = {
  statistik: { total: number; pending: number };
  pendaftar: Registration[];
  lomba: Array<{ id: string; nama: string }>;
  halaman: number;
  totalHalaman: number;
  totalHasil: number;
};

type ApiMessage = { message?: string };

const statusLabel: Record<Registration["status"], string> = {
  PENDING: "Menunggu",
  APPROVED: "Disetujui",
  REJECTED: "Ditolak"
};

const statusClass: Record<Registration["status"], string> = {
  PENDING: "bg-amber-100 text-amber-900",
  APPROVED: "bg-emerald-100 text-emerald-900",
  REJECTED: "bg-rose-100 text-rose-900"
};

export function AdminDashboard({ username }: { username: string }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [competitionId, setCompetitionId] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [rejectingId, setRejectingId] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    const query = new URLSearchParams({
      page: String(page),
      search,
      status,
      lombaId: competitionId
    });
    try {
      const response = await fetch(`/api/admin/registrations?${query}`, { cache: "no-store" });
      if (response.status === 401) {
        window.location.assign("/admin/login");
        return;
      }
      const result = (await response.json()) as DashboardData & ApiMessage;
      if (!response.ok) throw new Error(result.message ?? "Data pendaftar tidak dapat dimuat.");
      setData(result);
      setError("");
    } catch (requestError) {
      console.error("Gagal memuat data dashboard:", requestError);
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Data dashboard tidak dapat dimuat. Silakan coba kembali."
      );
    } finally {
      setLoading(false);
    }
  }, [competitionId, page, search, status]);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => void refresh(), 5000);
    return () => window.clearInterval(timer);
  }, [refresh]);

  async function verify(id: string, nextStatus: "APPROVED" | "REJECTED", reason?: string) {
    setBusyId(id);
    setError("");
    try {
      const response = await fetch(`/api/admin/registrations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          nextStatus === "REJECTED"
            ? { status: nextStatus, alasan_penolakan: reason }
            : { status: nextStatus }
        )
      });
      const result = (await response.json()) as ApiMessage;
      if (response.status === 401) {
        window.location.assign("/admin/login");
        return;
      }
      if (!response.ok) throw new Error(result.message ?? "Status pendaftar tidak dapat diperbarui.");
      setRejectingId("");
      setRejectionReason("");
      await refresh();
    } catch (requestError) {
      console.error("Gagal memperbarui status pendaftar:", requestError);
      setError(
        requestError instanceof Error ? requestError.message : "Status pendaftar tidak dapat diperbarui."
      );
    } finally {
      setBusyId("");
    }
  }

  async function reject(event: FormEvent<HTMLFormElement>, id: string) {
    event.preventDefault();
    if (!rejectionReason.trim()) {
      setError("Isi alasan penolakan sebelum melanjutkan.");
      return;
    }
    await verify(id, "REJECTED", rejectionReason.trim());
  }

  async function logout() {
    try {
      const response = await fetch("/api/admin/logout", { method: "POST" });
      if (!response.ok) throw new Error("Sesi admin tidak dapat diakhiri.");
      window.location.assign("/admin/login");
    } catch (logoutError) {
      console.error("Gagal mengakhiri sesi admin:", logoutError);
      setError("Anda belum berhasil keluar. Silakan coba kembali.");
    }
  }

  const setFilter = (setter: (value: string) => void) => (value: string) => {
    setter(value);
    setPage(1);
  };

  return (
    <main className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex min-h-[76px] max-w-7xl items-center justify-between gap-4 px-5">
          <div>
            <p className="font-extrabold tracking-tight text-navy">Sipena <span className="font-normal text-slate-400">/</span> Panitia</p>
            <p className="mt-1 text-xs text-slate-500">Masuk sebagai {username}</p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="min-h-11 rounded-xl border border-slate-300 px-4 text-sm font-bold text-navy hover:bg-slate-50"
          >
            Keluar
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-8 sm:py-10">
        <div className="mb-7">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-purple-700">Pusat Kontrol</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-navy">Dashboard Panitia</h1>
          <p className="mt-2 text-sm text-slate-600">Data diperbarui otomatis setiap 5 detik.</p>
        </div>

        <section aria-label="Statistik pendaftaran" className="mb-8 grid gap-4 sm:grid-cols-2">
          <article className="rounded-2xl bg-navy p-6 text-white shadow-card">
            <p className="text-sm font-semibold text-slate-300">Total Pendaftar</p>
            <p className="mt-2 text-4xl font-black">{data?.statistik.total ?? "—"}</p>
          </article>
          <article className="rounded-2xl bg-white p-6 shadow-card">
            <p className="text-sm font-semibold text-slate-500">Verifikasi Pending</p>
            <p className="mt-2 text-4xl font-black text-amber-600">{data?.statistik.pending ?? "—"}</p>
          </article>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card">
          <div className="border-b border-slate-100 p-5 sm:p-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <h2 className="text-xl font-extrabold text-navy">Daftar Pendaftar</h2>
                <p className="mt-1 text-sm text-slate-500">
                  {data ? `${data.totalHasil} hasil ditemukan` : "Memuat data pendaftar..."}
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <label className="text-xs font-bold text-slate-600">
                  Cari pendaftar
                  <input
                    className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 px-3 text-sm font-normal text-navy"
                    type="search"
                    value={search}
                    onChange={(event) => setFilter(setSearch)(event.target.value)}
                    placeholder="Nama, NISN, nomor"
                  />
                </label>
                <label className="text-xs font-bold text-slate-600">
                  Status
                  <select
                    className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-normal text-navy"
                    value={status}
                    onChange={(event) => setFilter(setStatus)(event.target.value)}
                  >
                    <option value="">Semua status</option>
                    <option value="PENDING">Menunggu</option>
                    <option value="APPROVED">Disetujui</option>
                    <option value="REJECTED">Ditolak</option>
                  </select>
                </label>
                <label className="text-xs font-bold text-slate-600">
                  Lomba
                  <select
                    className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-normal text-navy"
                    value={competitionId}
                    onChange={(event) => setFilter(setCompetitionId)(event.target.value)}
                  >
                    <option value="">Semua lomba</option>
                    {data?.lomba.map((competition) => (
                      <option key={competition.id} value={competition.id}>{competition.nama}</option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          </div>

          {error && (
            <p role="alert" className="mx-5 mt-5 rounded-xl bg-rose-50 p-4 text-sm text-rose-800 sm:mx-6">
              {error}
            </p>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-bold">Nama / Registrasi</th>
                  <th className="px-5 py-4 font-bold">Lomba</th>
                  <th className="px-5 py-4 font-bold">Status</th>
                  <th className="px-5 py-4 font-bold">Berkas</th>
                  <th className="px-5 py-4 font-bold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading && !data ? (
                  <tr><td colSpan={5} className="px-5 py-12 text-center text-slate-500">Memuat data pendaftar...</td></tr>
                ) : data?.pendaftar.length ? (
                  data.pendaftar.map((registration) => (
                    <tr key={registration.id} className="align-top hover:bg-slate-50/70">
                      <td className="px-5 py-4">
                        <p className="font-bold text-navy">{registration.peserta.nama_lengkap}</p>
                        <p className="mt-1 text-xs text-slate-500">NISN {registration.peserta.nisn}</p>
                        <p className="mt-1 text-xs font-semibold text-slate-500">{registration.nomor_registrasi}</p>
                      </td>
                      <td className="px-5 py-4 font-medium text-slate-700">{registration.lomba.nama}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${statusClass[registration.status]}`}>
                          {statusLabel[registration.status]}
                        </span>
                        {registration.alasan_penolakan && (
                          <p className="mt-2 max-w-48 text-xs leading-5 text-rose-700">{registration.alasan_penolakan}</p>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {registration.file_path.startsWith("seed/") ? (
                          <span className="text-xs font-medium text-slate-400">Berkas data contoh</span>
                        ) : (
                          <a
                            className="font-bold text-purple-700 underline decoration-purple-200 underline-offset-2 hover:text-purple-900"
                            href={`/api/admin/files/${encodeURIComponent(registration.file_path)}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Lihat berkas
                          </a>
                        )}
                        <p className="mt-1 text-xs text-slate-500">
                          {new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(registration.createdAt))}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        {registration.status === "PENDING" && rejectingId !== registration.id && (
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              disabled={busyId === registration.id}
                              onClick={() => void verify(registration.id, "APPROVED")}
                              className="min-h-10 rounded-lg bg-emerald-700 px-3 text-xs font-bold text-white hover:bg-emerald-800 disabled:opacity-60"
                            >
                              Setujui
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setRejectingId(registration.id);
                                setRejectionReason("");
                              }}
                              className="min-h-10 rounded-lg border border-rose-300 px-3 text-xs font-bold text-rose-700 hover:bg-rose-50"
                            >
                              Tolak
                            </button>
                          </div>
                        )}
                        {rejectingId === registration.id && (
                          <form onSubmit={(event) => void reject(event, registration.id)} className="min-w-56 space-y-2">
                            <label className="block text-xs font-bold text-slate-600">
                              Alasan penolakan
                              <textarea
                                className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-sm font-normal text-navy"
                                rows={2}
                                maxLength={500}
                                value={rejectionReason}
                                onChange={(event) => setRejectionReason(event.target.value)}
                                required
                              />
                            </label>
                            <div className="flex gap-2">
                              <button
                                type="submit"
                                disabled={busyId === registration.id}
                                className="min-h-10 rounded-lg bg-rose-700 px-3 text-xs font-bold text-white disabled:opacity-60"
                              >
                                Konfirmasi
                              </button>
                              <button
                                type="button"
                                onClick={() => setRejectingId("")}
                                className="min-h-10 rounded-lg border border-slate-300 px-3 text-xs font-bold text-slate-700"
                              >
                                Batal
                              </button>
                            </div>
                          </form>
                        )}
                        {registration.status !== "PENDING" && (
                          <span className="text-xs text-slate-400">Sudah diverifikasi</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-slate-500">
                      {error ? "Data belum dapat ditampilkan." : "Belum ada pendaftar yang sesuai filter."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-slate-100 px-5 py-4">
            <p className="text-xs text-slate-500">
              Halaman {data?.halaman ?? page} dari {data?.totalHalaman ?? 1}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1 || loading}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                className="min-h-10 rounded-lg border border-slate-300 px-4 text-sm font-bold text-navy disabled:opacity-40"
              >
                Sebelumnya
              </button>
              <button
                type="button"
                disabled={!data || page >= data.totalHalaman || loading}
                onClick={() => setPage((current) => current + 1)}
                className="min-h-10 rounded-lg border border-slate-300 px-4 text-sm font-bold text-navy disabled:opacity-40"
              >
                Berikutnya
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
