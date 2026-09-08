import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LibrosGrid from "@/components/LibrosGrid";
import { getLibrosByYear } from "@/lib/libros";

export const metadata = {
  title: "Publicaciones — Revista de Derecho Comercial y de la Empresa",
};

export default function PublicacionesPage() {
  const byYear = getLibrosByYear();
  const librosByYear = Array.from(byYear.entries())
    .filter(([y]) => y > 0)
    .sort(([a], [b]) => b - a);

  return (
    <>
      <Header compact />

      <main>
        <section className="mx-auto max-w-[1280px] px-4 pb-24 pt-12 lg:pb-32 lg:pt-16">
          <h1 className="font-serif text-4xl text-ink sm:text-5xl">
            Publicaciones
          </h1>

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
