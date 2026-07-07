import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageIdentity from "@/components/PageIdentity";
import PostGrid from "@/components/PostGrid";
import { getPostsBySection } from "@/lib/blog";
import { sections, getSectionBySlug } from "@/lib/sections";

export function generateStaticParams() {
  return sections.map((section) => ({ slug: section.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const section = getSectionBySlug(slug);
  if (!section) return {};
  return {
    title: `${section.name} — Revista de Derecho Comercial y de la Empresa`,
    description: section.tagline,
  };
}

/** Section landing — every.to column-landing formula, institutional:
    identity block (no avatar, no author pill) + post grid. */
export default async function SectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const section = getSectionBySlug(slug);
  if (!section) notFound();

  const posts = getPostsBySection(section.name);

  return (
    <>
      <Header compact />

      <main>
        <PageIdentity
          pill="Sección"
          title={section.name}
          bio={section.tagline}
        />

        <section className="mx-auto max-w-[1280px] px-4 pb-24 pt-6 lg:pb-32">
          {posts.length > 0 ? (
            <PostGrid posts={posts} />
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
