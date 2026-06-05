import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostCard from "@/components/PostCard";
import SectionBadge from "@/components/SectionBadge";
import { getAllPosts, getPostsBySection, formatDate } from "@/lib/blog";

export const metadata = {
  title: "Revista de Derecho Comercial y de la Empresa",
  description: "Análisis jurídico y pensamiento comercial contemporáneo.",
};

export default function HomePage() {
  const posts = getAllPosts();

  const latest = posts.slice(0, 4);
  const noticiasSection = getPostsBySection("Noticias");
  const noticias = (
    noticiasSection.length >= 4 ? noticiasSection : posts.slice(4, 8)
  ).slice(0, 4);

  return (
    <>
      <Header />

      <main>
        {/* Hero — full-bleed desk photo (the journal is in-frame on the right),
            title + tan CTA overlaid on the darker left side. */}
        <section className="relative isolate overflow-hidden bg-burgundy-dark">
          <Image
            src="/hero-desk.jpg"
            alt="Revista de Derecho Comercial y de la Empresa sobre un escritorio"
            fill
            priority
            sizes="100vw"
            className="object-cover object-right"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-transparent" />
          <div className="relative mx-auto flex min-h-[440px] max-w-[1280px] items-center px-4 py-20 lg:min-h-[560px]">
            <div className="max-w-xl text-paper">
              <h1 className="font-serif text-4xl leading-[1.1] drop-shadow-sm sm:text-5xl">
                Revista de Derecho Comercial y de la Empresa
              </h1>
              <Link
                href="/revista"
                className="mt-8 inline-flex items-center bg-action-dark px-7 py-3 text-sm uppercase tracking-widest text-paper transition-opacity hover:opacity-90"
              >
                Ver la revista
              </Link>
            </div>
          </div>
        </section>

        {/* Publicaciones — text-forward 4-col row + tan "Ver todas" */}
        <section className="mx-auto max-w-[1280px] px-4 py-16">
          <h2 className="font-serif text-3xl text-ink sm:text-4xl">
            Publicaciones
          </h2>

          <div className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {latest.map((post) => (
              <Link
                key={post.slug}
                href={`/publicaciones/${post.slug}`}
                className="group block"
              >
                <div className="flex items-center gap-3">
                  <SectionBadge section={post.section} />
                  <span className="text-[11px] uppercase tracking-widest text-ink-muted">
                    {formatDate(post.date)}
                  </span>
                </div>
                <h3 className="mt-3 font-serif text-xl font-semibold leading-snug text-ink transition-colors group-hover:text-ink-soft">
                  {post.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                  {post.excerpt}
                </p>
                <div className="mt-5">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-ink-faint">
                    Autor
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-widest text-ink">
                    {post.author}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-12 flex justify-center">
            <Link
              href="/publicaciones"
              className="inline-flex items-center bg-action-dark px-7 py-3 text-sm uppercase tracking-widest text-paper transition-opacity hover:opacity-90"
            >
              Ver todas
            </Link>
          </div>
        </section>

        {/* Noticias — kept as image cards (Belen: "está bueno como ya lo tenés") */}
        {noticias.length > 0 && (
          <section className="mx-auto max-w-[1280px] border-t border-line px-4 py-16">
            <h2 className="font-serif text-3xl text-ink sm:text-4xl">Noticias</h2>
            <div className="mt-10 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
              {noticias.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </>
  );
}
