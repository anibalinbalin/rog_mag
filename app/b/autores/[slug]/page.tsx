import { notFound } from "next/navigation";
import HeaderB from "@/components/b/HeaderB";
import FooterB from "@/components/b/FooterB";
import PageIdentity from "@/components/b/PageIdentity";
import PostGrid from "@/components/b/PostGrid";
import { getPostsByAuthor } from "@/lib/blog";
import { getAllAuthors, getAuthorBySlug } from "@/lib/authors";
import { getSectionByName } from "@/lib/sections";

export function generateStaticParams() {
  return getAllAuthors().map((author) => ({ slug: author.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const author = getAuthorBySlug(slug);
  if (!author) return {};
  return {
    title: `${author.name} — Revista de Derecho Comercial y de la Empresa`,
    description: author.bio,
  };
}

/** Author page — every.to author-profile formula, personal branding:
    avatar + section pill + name + role + bio + links + post grid. */
export default async function AuthorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const author = getAuthorBySlug(slug);
  if (!author) notFound();

  const posts = getPostsByAuthor(author.name);
  const primarySection = author.sections[0]
    ? getSectionByName(author.sections[0])
    : null;

  return (
    <>
      <HeaderB compact />

      <main>
        <PageIdentity
          avatar
          pill={primarySection ? `Escribe en ${primarySection.name}` : undefined}
          pillHref={
            primarySection ? `/b/secciones/${primarySection.slug}` : undefined
          }
          title={author.name}
          subtitle={`${author.role} · ${author.institution}`}
          bio={author.bio}
          links={
            author.linkedin
              ? [{ label: "LinkedIn", href: author.linkedin }]
              : undefined
          }
        />

        <section className="mx-auto max-w-[1280px] px-4 pb-20 pt-6">
          {posts.length > 0 ? (
            <PostGrid posts={posts} />
          ) : (
            <p className="border-t border-dashed border-line-dark pt-10 text-center font-serif text-lg text-ink-muted">
              Este autor aún no tiene publicaciones.
            </p>
          )}
        </section>
      </main>

      <FooterB />
    </>
  );
}
