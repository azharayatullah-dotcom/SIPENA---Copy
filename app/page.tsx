import Image from "next/image";
import Link from "next/link";
import { CompetitionCard } from "@/components/competition-card";
import { SiteHeader } from "@/components/site-header";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const competitions = await prisma.lomba.findMany({
    where: { aktif: true },
    orderBy: { nama: "asc" },
    select: { id: true, nama: true, deskripsi: true, gambar: true, kuota: true }
  });

  return (
    <>
      <SiteHeader />
      <main>
        <section className="home-hero">
          <div className="home-hero__glow home-hero__glow--one" aria-hidden="true" />
          <div className="home-hero__glow home-hero__glow--two" aria-hidden="true" />
          <div className="home-hero__facet home-hero__facet--one" aria-hidden="true" />
          <div className="home-hero__facet home-hero__facet--two" aria-hidden="true" />
          <div className="home-hero__inner">
            <div className="home-hero__copy">
              <p className="home-hero__eyebrow">
                <span className="home-hero__eyebrow-mark" aria-hidden="true" />
                SMA Kartika XIX-1 Bandung
                <span className="home-hero__eyebrow-divider" aria-hidden="true" />
                Ruang berkarya
              </p>
              <h1 className="home-hero__title">
                Temukan lomba.
                <br />
                <span className="text-gradient">Tunjukkan karyamu.</span>
              </h1>
              <p className="home-hero__description">
                Satu langkah mudah untuk ikut berkompetisi, mengembangkan bakat, dan membawa pulang
                pengalaman baru.
              </p>
              <div className="home-hero__actions">
                <a href="#lomba" className="home-hero__button">
                  Jelajahi lomba <span aria-hidden="true">↗</span>
                </a>
                <span className="home-hero__hint">Pilih bidangmu, lalu mulai mendaftar.</span>
              </div>
            </div>
            <div
              aria-label="Contoh bidang lomba: desain grafis, fotografi, dan poster"
              className="home-hero__collage"
            >
              <div className="home-hero__collage-orbit" aria-hidden="true" />
              <div className="home-hero__image home-hero__image--main">
                <Image
                  src={competitions[0]?.gambar ?? "/images/desain-grafis.svg"}
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 55vw, 390px"
                  className="object-cover"
                />
                <div className="home-hero__image-caption">
                  <span>01 / Bidang lomba</span>
                  <strong>{competitions[0]?.nama ?? "Desain Grafis"}</strong>
                </div>
              </div>
              <div className="home-hero__image home-hero__image--top">
                <Image
                  src={competitions[1]?.gambar ?? "/images/lomba-fotografi.svg"}
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 40vw, 280px"
                  className="object-cover"
                />
                <div className="home-hero__image-caption home-hero__image-caption--compact">
                  <strong>{competitions[1]?.nama ?? "Fotografi"}</strong>
                </div>
              </div>
              <div className="home-hero__image home-hero__image--bottom">
                <Image
                  src={competitions[2]?.gambar ?? "/images/kompetisi-poster.svg"}
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 38vw, 260px"
                  className="object-cover"
                />
                <div className="home-hero__image-caption home-hero__image-caption--compact">
                  <strong>{competitions[2]?.nama ?? "Kompetisi Poster"}</strong>
                </div>
              </div>
              <div className="home-hero__collage-note">
                <span className="home-hero__note-icon" aria-hidden="true">✦</span>
                <span><strong>{String(competitions.length).padStart(2, "0")}</strong> lomba tersedia</span>
              </div>
            </div>
            <div className="home-hero__metrics" aria-label="Informasi pendaftaran">
              <div className="home-hero__metric">
                <span className="home-hero__metric-number">{String(competitions.length).padStart(2, "0")}</span>
                <span><strong>Pilihan lomba</strong><small>Temukan bidang yang kamu suka</small></span>
              </div>
              <div className="home-hero__metric">
                <span className="home-hero__metric-number">01</span>
                <span><strong>Alur sederhana</strong><small>Isi data dan kirim berkas</small></span>
              </div>
              <div className="home-hero__metric">
                <span className="home-hero__metric-number">✳</span>
                <span><strong>Mulai berkarya</strong><small>Pengalaman baru menantimu</small></span>
              </div>
            </div>
          </div>
        </section>

        <section id="lomba" className="competition-section">
          <div className="competition-section__heading">
            <div>
              <p className="section-eyebrow"><span /> Katalog lomba</p>
              <h2>Pilih tantanganmu<span>.</span></h2>
            </div>
            <div className="competition-section__intro">
              <p>Pilih bidang yang paling kamu sukai dan mulai siapkan karya terbaikmu.</p>
              <span className="competition-section__count">
                {String(competitions.length).padStart(2, "0")} bidang tersedia
              </span>
            </div>
          </div>
          {competitions.length > 0 ? (
            <div className="competition-grid">
              {competitions.map((competition, index) => (
                <CompetitionCard key={competition.id} {...competition} index={index + 1} />
              ))}
            </div>
          ) : (
            <div className="competition-empty">
              <span aria-hidden="true">✳</span>
              <p>Belum ada lomba yang dibuka.</p>
              <small>Silakan kembali lagi nanti untuk melihat pilihan lomba terbaru.</small>
            </div>
          )}
        </section>
      </main>
      <footer className="site-footer">
        <div className="site-footer__inner">
          <Link href="/" className="site-footer__brand">
            <span className="site-footer__mark">S</span>
            <span><strong>Sipena</strong><small>Sistem Pendaftaran Lomba</small></span>
          </Link>
          <span className="site-footer__school">SMA Kartika XIX-1 Bandung</span>
          <a href="#top" className="site-footer__top">Kembali ke atas <span aria-hidden="true">↑</span></a>
        </div>
      </footer>
    </>
  );
}
