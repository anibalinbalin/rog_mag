"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/revista", label: "Revistas", match: "/revista" },
  { href: "/secciones/noticias", label: "Noticias", match: "/secciones/noticias" },
  { href: "/publicaciones", label: "Publicaciones", match: "/publicaciones" },
  { href: "/80-anos", label: "80 Años", match: "/80-anos" },
];

/** Stacked masthead badge — HTML/CSS approximation of the designer's mockup
    (REVISTA DCE_02.pdf p.1): three white bold condensed uppercase lines, each
    on its own burgundy rectangle hugging its text, left-aligned. This is a
    placeholder pending an SVG from Belen. */
function Masthead() {
  const lineClass =
    "inline-block self-start bg-burgundy px-1.5 py-[1px] font-sans font-bold uppercase leading-[1.15] tracking-[-0.01em] text-paper";
  return (
    <Link
      href="/"
      aria-label="Revista de Derecho Comercial y de la Empresa — Inicio"
      className="flex flex-col gap-[2px] text-[0.7rem] sm:text-[0.85rem]"
    >
      <span className={lineClass}>Revista de</span>
      <span className={lineClass}>Derecho Comercial</span>
      <span className={lineClass}>y de la Empresa</span>
    </Link>
  );
}

/** Belen's direction (2026-06): slim header — left-aligned masthead,
    inline nav with an active underline, burgundy Suscribirme on the right.
    `compact` is kept for call-site compatibility (no longer toggles a
    shrink-on-scroll masthead). */
export default function Header({ compact = false }: { compact?: boolean }) {
  void compact;
  const pathname = usePathname() ?? "";

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
