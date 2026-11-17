"use client";

import { FormEvent, useState } from "react";
import {
  INVALID_IDENTITY_MESSAGE,
  registrationSchema,
  simpanPendaftaranLomba
} from "@/lib/registration-validation";

type RegistrationFormProps = {
  competitionId: string;
  competitionName: string;
};

type SubmissionResult = {
  message?: string;
  nomor_registrasi?: string;
};

const inputClass =
  "mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm text-navy placeholder:text-slate-400";

export function RegistrationForm({ competitionId, competitionName }: RegistrationFormProps) {
  const [notice, setNotice] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [selectedFilename, setSelectedFilename] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    setNotice("");
    setRegistrationNumber("");
    const form = event.currentTarget;
    const formData = new FormData(form);
    const file = formData.get("file_berkas");
    const selectedFile = file instanceof File ? file : null;
    const validationMessage = simpanPendaftaranLomba(
      String(formData.get("nama_lengkap") ?? ""),
      String(formData.get("kelas") ?? ""),
      String(formData.get("no_wa") ?? ""),
      competitionId,
      selectedFile
    );
    if (validationMessage) {
      setRegistrationNumber("");
      setNotice(validationMessage);
      return;
    }

    const fields = registrationSchema.safeParse({
      nama_lengkap: formData.get("nama_lengkap"),
      nisn: formData.get("nisn"),
      kelas: formData.get("kelas"),
      asal_sekolah: formData.get("asal_sekolah"),
      no_wa: formData.get("no_wa"),
      id_lomba: competitionId
    });
    if (!fields.success) {
      const missingIdentity = fields.error.issues.some((issue) =>
        ["nama_lengkap", "no_wa", "kelas"].includes(String(issue.path[0]))
      );
      setNotice(
        missingIdentity
          ? INVALID_IDENTITY_MESSAGE
          : "Peringatan: Periksa kembali NISN dan data pendaftaran Anda."
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/registrations", {
        method: "POST",
        body: formData
      });
      const result = (await response.json()) as SubmissionResult;
      if (!response.ok) {
        setNotice(result.message ?? "Pendaftaran belum berhasil. Silakan periksa data Anda.");
        return;
      }
      setRegistrationNumber(result.nomor_registrasi ?? "");
      setNotice(result.message ?? "Pendaftaran berhasil dikirim.");
      form.reset();
      setSelectedFilename("");
    } catch (error) {
      console.error("Gagal mengirim pendaftaran:", error);
      setNotice("Tidak dapat terhubung ke server. Periksa koneksi lalu coba kembali.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm font-bold text-navy sm:col-span-2">
          Nama Lengkap
          <input
            className={inputClass}
            name="nama_lengkap"
            autoComplete="name"
            placeholder="Nama sesuai kartu pelajar"
          />
        </label>
        <label className="block text-sm font-bold text-navy">
          NISN
          <input className={inputClass} name="nisn" inputMode="numeric" placeholder="Masukkan NISN" />
        </label>
        <label className="block text-sm font-bold text-navy">
          Kelas
          <select className={inputClass} name="kelas" defaultValue="">
            <option value="" disabled>Pilih kelas</option>
            {["X", "XI", "XII"].map((grade) =>
              [1, 2, 3, 4, 5].map((room) => (
                <option key={`${grade}-${room}`} value={`${grade}-${room}`}>{`${grade}-${room}`}</option>
              ))
            )}
          </select>
        </label>
        <label className="block text-sm font-bold text-navy sm:col-span-2">
          Asal Sekolah
          <input className={inputClass} name="asal_sekolah" defaultValue="SMA Kartika XIX-1 Bandung" />
        </label>
        <label className="block text-sm font-bold text-navy sm:col-span-2">
          No. WhatsApp
          <input
            className={inputClass}
            name="no_wa"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="Contoh: 081234567890"
          />
        </label>
        <label className="block text-sm font-bold text-navy sm:col-span-2">
          Lomba
          <input
            className={`${inputClass} bg-slate-50 font-semibold`}
            name="lomba"
            value={competitionName}
            readOnly
            aria-readonly="true"
          />
          <input type="hidden" name="id_lomba" value={competitionId} />
        </label>
        <label className="block text-sm font-bold text-navy sm:col-span-2">
          Upload Berkas
          <span className="mt-2 flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-canvas px-5 text-center transition hover:border-purple-400 hover:bg-purple-50/50">
            <span
              className="grid h-11 w-11 place-items-center rounded-xl bg-white text-xl text-purple-700 shadow-sm"
              aria-hidden="true"
            >
              ↑
            </span>
            <span className="mt-3 text-sm font-bold text-navy">Pilih berkas dari perangkat</span>
            <span className="mt-1 text-xs font-medium text-slate-500">
              {selectedFilename || "Wajib: foto atau scan kartu pelajar yang terbaca"}
            </span>
            <input
              className="sr-only"
              type="file"
              name="file_berkas"
              accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
              onChange={(event) => setSelectedFilename(event.currentTarget.files?.[0]?.name ?? "")}
            />
          </span>
          <span className="mt-2 block text-xs font-medium text-slate-500">
            Unggah kartu pelajar sebagai bukti identitas. Format JPG, PNG, atau PDF; maksimal 2 MB.
          </span>
        </label>
      </div>
      <div className="rounded-xl border border-purple-100 bg-purple-50 p-4 text-sm leading-6 text-purple-950">
        Pastikan data diri sesuai dokumen dan nomor WhatsApp dapat dihubungi panitia.
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="flex min-h-12 w-full items-center justify-center rounded-xl bg-navy px-6 font-extrabold text-white transition hover:bg-slate-800 disabled:cursor-wait disabled:opacity-70"
      >
        {isSubmitting ? "Mengirim pendaftaran..." : "Kirim Pendaftaran"}
      </button>
      {notice && (
        <div
          role="status"
          className={`rounded-xl p-4 text-sm leading-6 ${
            registrationNumber
              ? "bg-emerald-50 text-emerald-900"
              : "bg-amber-50 text-amber-900"
          }`}
        >
          <p>{notice}</p>
          {registrationNumber && (
            <p className="mt-1 font-extrabold">Nomor registrasi: {registrationNumber}</p>
          )}
        </div>
      )}
    </form>
  );
}
