import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LibrosGrid from "@/components/LibrosGrid";
import { getLibrosByYear } from "@/lib/libros";
import Link from "next/link";

export const metadata = {
  title: "Libros — Revista de Derecho Comercial y de la Empresa",
};

export default function LibrosPage() {
  const byYear = getLibrosByYear();
  const librosByYear = Array.from(byYear.entries())
    .filter(([y]) => y > 0)
    .sort(([a], [b]) => b - a);

  return (
    <>
      <Header compact />

      <main>
        <section className="mx-auto max-w-[1280px] px-4 pb-24 pt-12 lg:pb-32 lg:pt-16">
          {/* Title + pills */}
          <div className="flex items-center gap-6">
            <h1 className="font-serif text-4xl text-ink sm:text-5xl">
              Publicaciones
            </h1>

            <nav className="flex gap-2">
              <Link
                href="/publicaciones"
                className="rounded-sm px-4 py-1.5 text-xs uppercase tracking-widest text-ink-soft transition-colors hover:bg-burgundy/10 hover:text-burgundy"
              >
                Artículos
              </Link>
              <span className="rounded-sm bg-burgundy/10 px-4 py-1.5 text-xs uppercase tracking-widest text-burgundy">
                Libros
              </span>
            </nav>
          </div>

          {librosByYear.length > 0 ? (
            <LibrosGrid librosByYear={librosByYear} />
          ) : (
            <p className="mt-10 border-t border-dashed border-line-dark py-12 text-sm text-ink-muted">
              No hay libros disponibles.
            </p>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}
