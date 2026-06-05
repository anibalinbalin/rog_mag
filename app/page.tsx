import Link from "next/link";
import Image from "next/image";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostCard from "@/components/PostCard";
import { getAllPosts, getPostsBySection, formatDate } from "@/lib/blog";
import { getCurrentIssue } from "@/lib/issues";

export const metadata = {
  title: "Revista de Derecho Comercial y de la Empresa",
  description: "Análisis jurídico y pensamiento comercial contemporáneo.",
};

export default function HomePage() {
  const posts = getAllPosts();
  const currentIssue = getCurrentIssue();

  const latest = posts.slice(0, 4);
  const noticiasSection = getPostsBySection("Noticias");
  const noticias = (
    noticiasSection.length >= 4 ? noticiasSection : posts.slice(4, 8)
  ).slice(0, 4);

  return (
    <>
      <Header />

      <main>
        {/* Hero — burgundy-dark band, title + tan CTA, journal cover floated
            right. (Placeholder background: Belen's mockup uses a desk photo —
            swap in when we have the asset.) */}
        <section className="bg-burgundy-dark text-paper">
          <div className="mx-auto grid max-w-[1280px] items-center gap-10 px-4 py-16 lg:grid-cols-2 lg:py-24">
            <div>
              <h1 className="font-serif text-4xl leading-[1.1] sm:text-5xl">
                Revista de Derecho Comercial y de la Empresa
              </h1>
              <Link
                href="/revista"
                className="mt-8 inline-flex items-center bg-action-dark px-7 py-3 text-sm uppercase tracking-widest text-paper transition-opacity hover:opacity-90"
              >
                Ver la revista
              </Link>
            </div>

            {currentIssue?.cover && (
              <div className="justify-self-center lg:justify-self-end">
                <div className="relative aspect-[3/4] w-56 overflow-hidden shadow-2xl sm:w-64 lg:w-72">
                  <Image
                    src={currentIssue.cover}
                    alt={`${currentIssue.number} (${currentIssue.year})`}
                    fill
                    sizes="(min-width: 1024px) 288px, 224px"
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
            )}
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
                <p className="text-xs uppercase tracking-widest text-ink-muted">
                  {formatDate(post.date)} · {post.section}
                </p>
                <h3 className="mt-3 font-serif text-xl font-semibold leading-snug text-ink transition-colors group-hover:text-ink-soft">
                  {post.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                  {post.excerpt}
                </p>
                <p className="mt-4 text-xs uppercase tracking-widest text-ink">
                  {post.author}
                </p>
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
