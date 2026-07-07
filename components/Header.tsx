"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/revistas", label: "Revistas", match: "/revistas" },
  { href: "/secciones/noticias", label: "Noticias", match: "/secciones/noticias" },
  { href: "/publicaciones", label: "Publicaciones", match: "/publicaciones" },
  { href: "/80-años", label: "80 Años", match: "/80-años" },
];

/** Masthead badge — the designer's self-contained SVG logo (REVISTA DCE_02.pdf
    p.3). The SVG's burgundy (#840238) rect fills its full viewBox, so the badge
    spans the entire navbar height (flush top/bottom/left) when stretched. */
function Masthead() {
  return (
    <Link
      href="/"
      aria-label="Revista de Derecho Comercial y de la Empresa — Inicio"
      className="flex shrink-0 items-stretch"
    >
      <Image
        src="/logo-rdcydle.svg"
        alt="Revista de Derecho Comercial y de la Empresa"
        width={244}
        height={149}
        priority
        className="h-full w-auto"
      />
    </Link>
  );
}

/** Belen's direction (2026-06): slim header — left-aligned masthead,
    inline nav with an active underline, burgundy Suscribirme on the right.
    `compact` is kept for call-site compatibility (no longer toggles a
    shrink-on-scroll masthead). */
export default function Header({
  compact = false,
  borderless = false,
}: {
  compact?: boolean;
  /** Drops the bottom hairline — for pages where a dark hero sits flush
      under the header and the light border would read as a white seam. */
  borderless?: boolean;
}) {
  void compact;
  // The /80-años page is served under its accented URL (via a rewrite), and
  // usePathname() can hand back the percent-encoded form ("/80-a%C3%B1os"), so
  // decode before matching nav items — otherwise that tab's underline never lights up.
  const rawPathname = usePathname() ?? "";
  let pathname = rawPathname;
  try {
    pathname = decodeURIComponent(rawPathname);
  } catch {
    // Malformed escape — fall back to the raw value.
  }

  return (
    <header
      className={`sticky top-0 z-50 bg-paper ${borderless ? "" : "border-b border-line"}`}
    >
      <div className="mx-auto flex h-28 max-w-[1280px] items-stretch justify-between gap-6 px-4">
        {/* Masthead — fills the full navbar height, left edge aligned to the
            content grid (px-4, matching every content section's container) */}
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

      </div>
    </header>
  );
}
