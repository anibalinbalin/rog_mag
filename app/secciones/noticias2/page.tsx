import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageIdentity from "@/components/PageIdentity";
import PostGrid from "@/components/PostGrid";
import { getPostsBySection } from "@/lib/blog";
import { getSectionByName } from "@/lib/sections";

export const metadata = {
  title: "Noticias — Revista de Derecho Comercial y de la Empresa",
};

// Swaps each Noticias post's real-photo cover for its Paper-generated
// abstract illustration counterpart, keyed by slug. A/B test for Belen —
// this route is a throwaway comparison, not a real section.
const ABSTRACT_COVERS: Record<string, string> = {
  "xxiii-jornadas-institutos-derecho-comercial":
    "/covers/noticias-jornadas-institutos-abstract.webp",
  "xxii-congreso-iberoamericano-derecho-concursal":
    "/covers/noticias-congreso-concursal-abstract.webp",
};

export default function Noticias2Page() {
  const section = getSectionByName("Noticias")!;
  const posts = getPostsBySection(section.name).map((post) => ({
    ...post,
    coverImage: ABSTRACT_COVERS[post.slug] ?? post.coverImage,
  }));

  return (
    <>
      <Header compact />

      <main>
        <PageIdentity
          pill="Sección · A/B"
          title={section.name}
          bio={section.tagline}
        />

        <section className="mx-auto max-w-[1280px] px-4 pb-24 pt-6 lg:pb-32">
          {posts.length > 0 ? (
            <PostGrid posts={posts} hideSectionBadge />
          ) : (
            <p className="border-t border-dashed border-line-dark pt-10 text-center font-serif text-lg text-ink-muted">
              Próximamente publicaremos contenidos en esta sección.
            </p>
          )}
        </section>
      </main>

      <Footer />
    </>
  );
}
