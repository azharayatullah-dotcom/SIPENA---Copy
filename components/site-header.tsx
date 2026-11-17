import Link from "next/link";

export function SiteHeader() {
  return (
    <header id="top" className="site-header">
      <div className="site-header__inner">
        <Link href="/" aria-label="Sipena, beranda" className="site-header__brand">
          <span className="site-header__mark">S</span>
          <span className="site-header__wordmark">
            <strong>Sipena</strong>
            <small>SMA Kartika XIX-1 Bandung</small>
          </span>
        </Link>
        <nav aria-label="Navigasi utama" className="site-header__nav">
          <Link href="/" className="site-header__link site-header__link--home">Beranda</Link>
          <Link href="/#lomba" className="site-header__link site-header__link--catalog">Katalog lomba</Link>
          <Link href="/admin/login" className="site-header__admin">
            Area panitia <span aria-hidden="true">↗</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
