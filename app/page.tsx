import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostCard from "@/components/PostCard";
import SectionBadge from "@/components/SectionBadge";
import HeroCarousel from "@/components/HeroCarousel";
import { getAllPosts, getPostsBySection, formatDate } from "@/lib/blog";
import { getPaginaInicio, type HeroSlide } from "@/lib/paginas";

export const metadata = {
  title: "Revista de Derecho Comercial y de la Empresa",
  description: "Análisis jurídico y pensamiento comercial contemporáneo.",
};

/** Mirrors the original static hero — used when content/paginas/inicio.md is
    missing or has no slides, so the homepage never renders an empty hero. */
const FALLBACK_SLIDES: HeroSlide[] = [
  {
    image: "/hero-desk.jpg",
    heading: "Última edición",
    subheading: "DISPONIBLE",
    ctaLabel: "Ver la revista",
    ctaHref: "/revista",
  },
  {
    image: "/hero-80-anos.jpg",
    heading: "80 años",
    subheading: "Desde 1946 construyendo pensamiento jurídico",
    ctaLabel: "Leer más",
    ctaHref: "/80-años",
  },
];

export default function HomePage() {
  const posts = getAllPosts();
  const { slides } = getPaginaInicio();
  const heroSlides = slides.length > 0 ? slides : FALLBACK_SLIDES;

  const latest = posts.slice(0, 4);
  const noticiasSection = getPostsBySection("Noticias");
  const noticias = (
    noticiasSection.length >= 4 ? noticiasSection : posts.slice(4, 8)
  ).slice(0, 4);

  return (
    <>
      <Header />

      <main>
        {/* Hero carousel — slides fed by getPaginaInicio(), with a static
            fallback that mirrors the original desk hero. */}
        <HeroCarousel slides={heroSlides} />

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
