import Link from "next/link";
import SubscribeBox from "./SubscribeBox";

const navItems = [
  { href: "/", label: "Inicio" },
  { href: "/publicaciones", label: "Publicaciones" },
  { href: "/revista", label: "Revista" },
  { href: "/noticias", label: "Noticias" },
];

function NavTabs() {
  return (
    <nav className="border-y border-line">
      <div className="mx-auto flex max-w-2xl items-center justify-center gap-8 px-6">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="py-3 text-sm text-ink-soft transition-colors hover:text-ink"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

function TopBar() {
  return (
    <div className="mx-auto flex max-w-5xl items-center justify-end gap-5 px-6 py-3">
      <button
        type="button"
        className="text-sm text-ink-muted transition-colors hover:text-ink"
      >
        Iniciar sesión
      </button>
      <button
        type="button"
        className="text-sm text-ink-muted transition-colors hover:text-ink"
      >
        Registrarme
      </button>
    </div>
  );
}

/** Substack-style masthead header for the homepage:
    thin top bar → big centered publication name + tagline + subscribe → nav tabs */
export function MastheadHeader() {
  return (
    <header>
      <TopBar />

      <div className="mx-auto max-w-2xl px-6 pb-14 pt-10 text-center">
        <Link href="/" className="block">
          <h1 className="font-serif text-4xl leading-tight tracking-wide text-ink sm:text-5xl">
            REVISTA DE DERECHO
            <br />
            COMERCIAL Y DE LA EMPRESA
          </h1>
        </Link>
        <p className="mt-6 text-lg text-ink-muted">
          Análisis jurídico y pensamiento comercial contemporáneo
        </p>

        <div className="mt-10">
          <SubscribeBox centered />
        </div>
      </div>

      <NavTabs />
    </header>
  );
}

/** Compact header for inner pages: small centered publication name + nav tabs */
export default function Header() {
  return (
    <header>
      <TopBar />

      <div className="mx-auto max-w-2xl px-6 pb-8 pt-2 text-center">
        <Link href="/" className="block">
          <p className="font-serif text-2xl leading-tight tracking-wide text-ink">
            REVISTA DE DERECHO COMERCIAL Y DE LA EMPRESA
          </p>
        </Link>
      </div>

      <NavTabs />
    </header>
  );
}
