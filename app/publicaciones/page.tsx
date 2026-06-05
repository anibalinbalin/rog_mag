import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PublicacionesSearch from "@/components/PublicacionesSearch";
import { getAllPosts, getPostsByAuthor } from "@/lib/blog";
import { getAllAuthors } from "@/lib/authors";

export const metadata = {
  title: "Publicaciones — Revista de Derecho Comercial y de la Empresa",
};

export default function PublicacionesPage() {
  // Lightweight shape for the client list (drops the full markdown body).
  const posts = getAllPosts().map((p) => ({
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    author: p.author,
    date: p.date,
    section: p.section,
  }));

  const professionals = getAllAuthors().map((a) => ({
    ...a,
    count: getPostsByAuthor(a.name).length,
  }));

  return (
    <>
      <Header compact />

      <main>
        <section className="mx-auto max-w-[1280px] px-4 py-12 lg:py-16">
          {/* Title + search + searchable list */}
          <PublicacionesSearch posts={posts} />

          {/* Profesionales */}
          {professionals.length > 0 && (
            <div className="mt-20 border-t border-line pt-12">
              <h2 className="font-serif text-3xl text-ink sm:text-4xl">
                Profesionales
              </h2>

              <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {professionals.map((author) => (
                  <Link
                    key={author.slug}
                    href={`/autores/${author.slug}`}
                    className="flex items-center gap-5 border border-line p-5 transition-colors hover:bg-paper-warm"
                  >
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden bg-paper-cream">
                      {author.photo ? (
                        <Image
                          src={author.photo}
                          alt={author.name}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      ) : (
                        <svg
                          viewBox="0 0 100 100"
                          className="h-full w-full text-line-dark"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1"
                          aria-hidden="true"
                        >
                          <rect x="0.5" y="0.5" width="99" height="99" />
                          <line x1="0.5" y1="0.5" x2="99.5" y2="99.5" />
                          <line x1="99.5" y1="0.5" x2="0.5" y2="99.5" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-widest text-ink-muted">
                        {author.role || "Profesional"}
                      </p>
                      <p className="mt-1 font-serif text-xl font-semibold leading-snug text-ink">
                        {author.name}
                      </p>
                      <p className="mt-1 text-sm text-ink-muted">
                        {author.count}{" "}
                        {author.count === 1 ? "Artículo" : "Artículos"}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}
