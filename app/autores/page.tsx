import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SectionBadge from "@/components/SectionBadge";
import { getAllAuthors } from "@/lib/authors";
import { sections } from "@/lib/sections";
import { getPostsBySection } from "@/lib/blog";

export const metadata = {
  title: "Autores — Revista de Derecho Comercial y de la Empresa",
};

/** Authors index — every.to columnists-index formula:
    title row + roster grid + sections directory + pitch CTA. */
export default function AutoresPage() {
  const authors = getAllAuthors();

  return (
    <>
      <Header compact />

      <main>
        <section className="mx-auto max-w-[1280px] px-4 pb-20 pt-12">
          {/* Title row */}
          <h1 className="border-b border-dashed border-line-dark pb-6 font-serif text-4xl text-ink">
            Nuestros autores
          </h1>

          {/* Roster grid */}
          <div className="mt-10 grid grid-cols-2 gap-10 lg:grid-cols-4">
            {authors.map((author) => (
              <Link
                key={author.slug}
                href={`/autores/${author.slug}`}
                className="group block"
              >
                {/* Portrait — uploaded photo, or cream placeholder */}
                <div className="relative aspect-square w-full overflow-hidden bg-paper-cream">
                  {author.photo && (
                    <Image
                      src={author.photo}
                      alt={author.name}
                      fill
                      sizes="(min-width: 1024px) 25vw, 50vw"
                      className="object-cover"
                    />
                  )}
                </div>
                <p className="mt-5 font-serif text-2xl font-semibold leading-snug text-ink transition-colors group-hover:text-ink-soft">
                  {author.name}
                </p>
                <p className="mt-2 text-xs uppercase tracking-widest text-ink-muted">
                  {author.role}
                </p>
                {author.sections[0] && (
                  <SectionBadge
                    section={author.sections[0]}
                    className="mt-3"
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Sections directory */}
          <div className="mt-16 border-t border-dashed border-line-dark pt-10">
            <h2 className="text-xl font-medium uppercase tracking-wide text-ink">
              Nuestras secciones
            </h2>
            <div className="mt-8 grid gap-10 sm:grid-cols-3">
              {sections.map((section) => {
                const count = getPostsBySection(section.name).length;
                return (
                  <Link
                    key={section.slug}
                    href={`/secciones/${section.slug}`}
                    className="group block"
                  >
                    <p className="font-serif text-2xl font-semibold text-ink transition-colors group-hover:text-ink-soft">
                      {section.name}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                      {section.tagline}
                    </p>
                    <p className="mt-3 text-xs uppercase tracking-widest text-ink-muted">
                      {count} {count === 1 ? "artículo" : "artículos"}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Pitch CTA */}
          <div className="mt-16 border-t border-dashed border-line-dark pt-10 text-center">
            <h2 className="font-serif text-2xl text-ink">
              ¿Le interesa publicar en la Revista?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-ink-muted">
              Recibimos trabajos de doctrina, comentarios de jurisprudencia y
              colaboraciones académicas durante todo el año.
            </p>
            <a
              href="mailto:admin@olivera.com.uy"
              className="mt-6 inline-flex items-center rounded-sm bg-action-dark px-8 py-3 text-sm uppercase tracking-widest text-paper transition-opacity hover:opacity-90"
            >
              Enviar propuesta
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
