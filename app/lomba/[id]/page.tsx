import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type CompetitionPageProps = {
  params: { id: string };
};

export default async function CompetitionPage({ params }: CompetitionPageProps) {
  const competition = await prisma.lomba.findUnique({ where: { id: params.id } });

  if (!competition) notFound();

  return (
    <>
      <SiteHeader />
      <main className="competition-detail-page">
        <Link
          href="/"
          className="competition-detail-back"
        >
          <span aria-hidden="true">←</span> Kembali ke katalog
        </Link>
        <article className="competition-detail">
          <div className="competition-detail__image">
            <Image
              src={competition.gambar}
              alt={`Ilustrasi ${competition.nama}`}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </div>
          <div className="competition-detail__body">
            <div>
              <p className="competition-detail__eyebrow">SMA Kartika XIX-1 Bandung / Katalog lomba</p>
              <span
                className={`competition-detail__status ${
                  competition.aktif ? "competition-detail__status--open" : "competition-detail__status--closed"
                }`}
              >
                {competition.aktif ? "Pendaftaran dibuka" : "Pendaftaran ditutup"}
              </span>
              <h1 className="competition-detail__title">{competition.nama}</h1>
              <h2 className="competition-detail__label">Tentang lomba</h2>
              <p className="competition-detail__description">
                {competition.deskripsi}
              </p>
              <div className="competition-detail__facts">
                <div className="competition-detail__fact">
                  <small>Kuota peserta</small>
                  <strong>{competition.kuota} peserta</strong>
                </div>
                <div className="competition-detail__fact">
                  <small>Biaya pendaftaran</small>
                  <strong>
                    {competition.biaya === 0
                      ? "Gratis"
                      : new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                          maximumFractionDigits: 0
                        }).format(competition.biaya)}
                  </strong>
                </div>
              </div>
            </div>
            <aside className="competition-detail__aside">
              <p className="competition-detail__aside-kicker">Langkah berikutnya</p>
              <h2>Siap ikut berlomba?</h2>
              <p>
                Isi data diri dan siapkan berkas untuk melanjutkan pendaftaran.
              </p>
              {competition.aktif ? (
                <Link
                  href={`/lomba/${competition.id}/daftar`}
                  className="competition-detail__button"
                >
                  Daftar Sekarang <span aria-hidden="true">↗</span>
                </Link>
              ) : (
                <span className="competition-detail__button competition-detail__button--closed">
                  Pendaftaran Ditutup
                </span>
              )}
            </aside>
          </div>
        </article>
      </main>
    </>
  );
}
