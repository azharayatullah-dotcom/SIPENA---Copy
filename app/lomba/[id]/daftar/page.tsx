import Link from "next/link";
import { notFound } from "next/navigation";
import { RegistrationForm } from "@/components/registration-form";
import { SiteHeader } from "@/components/site-header";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type RegistrationPageProps = {
  params: { id: string };
};

export default async function RegistrationPage({ params }: RegistrationPageProps) {
  const competition = await prisma.lomba.findUnique({ where: { id: params.id } });

  if (!competition) notFound();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 py-8 sm:py-12">
        <Link
          href={`/lomba/${competition.id}`}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg pr-3 text-sm font-bold text-slate-600 hover:text-navy"
        >
          <span aria-hidden="true">←</span> Kembali ke detail lomba
        </Link>
        <div className="mt-5 rounded-3xl border border-slate-100 bg-white p-6 shadow-card sm:p-10">
          <div className="mb-8">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-purple-700">Formulir peserta</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-navy">Pendaftaran Lomba</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Lengkapi data diri dengan benar untuk mengikuti{" "}
              <span className="font-bold text-navy">{competition.nama}</span>.
            </p>
          </div>
          {!competition.aktif ? (
            <div role="status" className="rounded-xl bg-amber-50 p-5 text-sm leading-6 text-amber-900">
              Pendaftaran lomba ini sudah ditutup.
            </div>
          ) : (
            <RegistrationForm competitionId={competition.id} competitionName={competition.nama} />
          )}
        </div>
      </main>
    </>
  );
}
