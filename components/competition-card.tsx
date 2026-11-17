import Image from "next/image";
import Link from "next/link";

type CompetitionCardProps = {
  id: string;
  nama: string;
  deskripsi: string;
  gambar: string;
  kuota: number;
  index?: number;
};

export function CompetitionCard({
  id,
  nama,
  deskripsi,
  gambar,
  kuota,
  index = 1
}: CompetitionCardProps) {
  const category = nama.toLocaleLowerCase("id-ID").includes("fotografi")
    ? "Fotografi"
    : nama.toLocaleLowerCase("id-ID").includes("poster")
      ? "Desain poster"
      : "Desain grafis";

  return (
    <article className="competition-card">
      <Link href={`/lomba/${id}`} className="competition-card__link" aria-label={`Lihat detail ${nama}`}>
        <div className="competition-card__image">
          <Image
            src={gambar}
            alt={`Ilustrasi ${nama}`}
            fill
            sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 33vw"
            className="object-cover"
          />
          <span className="competition-card__number">{String(index).padStart(2, "0")}</span>
          <span className="competition-card__category">{category}</span>
          <span className="competition-card__image-arrow" aria-hidden="true">↗</span>
        </div>
        <div className="competition-card__body">
          <div className="competition-card__meta">
            <span className="competition-card__status"><i /> Pendaftaran dibuka</span>
            <span>Kuota {kuota} peserta</span>
          </div>
          <h3>{nama}</h3>
          <p className="competition-card__description">{deskripsi}</p>
          <span className="competition-card__action">
            Lihat detail lomba <span aria-hidden="true">→</span>
          </span>
        </div>
      </Link>
    </article>
  );
}
