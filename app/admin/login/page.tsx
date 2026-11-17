import { redirect } from "next/navigation";
import Link from "next/link";
import { AdminLoginForm } from "@/components/admin-login-form";
import { getAdminSession } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await getAdminSession()) redirect("/admin");

  return (
    <main className="grid min-h-screen place-items-center px-5 py-10">
      <section className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-7 shadow-card sm:p-9">
        <Link href="/" className="text-sm font-bold text-slate-500 hover:text-navy">
          ← Kembali ke Sipena
        </Link>
        <div className="mt-8">
          <p className="text-sm font-bold uppercase tracking-[0.16em] text-purple-700">Area Panitia</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-navy">Masuk Admin</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Masuk untuk memeriksa dan memverifikasi pendaftaran lomba.
          </p>
        </div>
        <div className="my-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          Akun awal: <strong>admin</strong> / <strong>admin123</strong>. Ganti kata sandi default sebelum
          aplikasi digunakan.
        </div>
        <AdminLoginForm />
      </section>
    </main>
  );
}
