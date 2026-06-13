"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/revista", label: "Revistas", match: "/revista" },
  { href: "/secciones/noticias", label: "Noticias", match: "/secciones/noticias" },
  { href: "/publicaciones", label: "Publicaciones", match: "/publicaciones" },
  { href: "/80-años", label: "80 Años", match: "/80-años" },
];

/** Masthead badge — the designer's self-contained SVG logo (REVISTA DCE_02.pdf
    p.3). The SVG carries its own burgundy (#840238) background, so no wrapper
    fill is needed. Aspect ratio 244.2×148.9 ≈ 1.64:1; sized ~56px tall on
    mobile, ~68px on desktop to read as a prominent badge. */
function Masthead() {
  return (
    <Link
      href="/"
      aria-label="Revista de Derecho Comercial y de la Empresa — Inicio"
      className="block shrink-0"
    >
      <Image
        src="/logo-rdcydle.svg"
        alt="Revista de Derecho Comercial y de la Empresa"
        width={244}
        height={149}
        priority
        className="h-14 w-auto sm:h-[68px]"
      />
    </Link>
  );
}

/** Belen's direction (2026-06): slim header — left-aligned masthead,
    inline nav with an active underline, burgundy Suscribirme on the right.
    `compact` is kept for call-site compatibility (no longer toggles a
    shrink-on-scroll masthead). */
export default function Header({ compact = false }: { compact?: boolean }) {
  void compact;
  // usePathname() can return the percent-encoded form for non-ASCII routes
  // (e.g. "/80-a%C3%B1os" for the /80-años page), so decode before matching the
  // nav items — otherwise that tab's active underline never lights up.
  const rawPathname = usePathname() ?? "";
  let pathname = rawPathname;
  try {
    pathname = decodeURIComponent(rawPathname);
  } catch {
    // Malformed escape — fall back to the raw value.
  }

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper">
      <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-6 px-4 py-5">
        {/* Masthead */}
        <Masthead />

        {/* Inline nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.match);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm transition-colors ${
                  active
                    ? "text-ink underline decoration-burgundy decoration-2 underline-offset-[6px]"
                    : "text-ink-soft hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="hidden text-sm text-ink-soft transition-colors hover:text-ink sm:block"
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            className="bg-burgundy px-5 py-2.5 text-sm text-paper transition-opacity hover:opacity-90"
          >
            Suscribirme
          </button>
        </div>
      </div>
    </header>
  );
}
