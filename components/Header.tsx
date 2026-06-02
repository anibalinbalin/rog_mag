"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/", label: "Inicio" },
  { href: "/secciones/doctrina", label: "Doctrina" },
  { href: "/secciones/jurisprudencia", label: "Jurisprudencia" },
  { href: "/secciones/noticias", label: "Noticias" },
  { href: "/autores", label: "Autores" },
  { href: "/revista", label: "Revista" },
];

/** every.to-style header: utility bar with actions, oversized centered
    masthead that shrinks on scroll, segmented nav underneath. */
export default function Header({ compact = false }: { compact?: boolean }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const big = !compact && !scrolled;

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper">
      <div className="relative mx-auto max-w-[1280px] px-4">
        {/* Utility bar + masthead */}
        <div
          className={`flex items-center justify-between transition-all duration-300 ${
            big ? "py-6" : "py-3"
          }`}
        >
          <div className="w-32" />

          <Link href="/" className="block text-center">
            <span
              className={`block font-serif tracking-wide text-ink transition-all duration-300 ${
                big ? "text-3xl sm:text-4xl" : "text-xl"
              }`}
            >
              REVISTA DCE
            </span>
          </Link>

          <div className="flex w-32 items-center justify-end gap-3">
            <button
              type="button"
              className="hidden text-sm text-ink-muted transition-colors hover:text-ink sm:block"
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              className="bg-ink px-4 py-2 text-sm text-paper transition-opacity hover:opacity-85"
            >
              Suscribirme
            </button>
          </div>
        </div>

        {/* Segmented nav */}
        <nav className="flex items-center justify-center gap-7 pb-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm text-ink-soft transition-colors hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
