import { notFound } from "next/navigation";
import databaseClient from "@/tina/__generated__/databaseClient";
import { plainify } from "@/lib/tina-serialize";
import AuthorClient from "./AuthorClient";
import { getPostsByAuthor } from "@/lib/blog";
import { getAllAuthors, getAuthorBySlug } from "@/lib/authors";

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

type TinaAuthorProps = Awaited<ReturnType<typeof databaseClient.queries.author>>;

/** Author page — every.to author-profile formula, personal branding:
    avatar + section pill + name + role + bio + links + post grid.

    Content is fetched through the Tina databaseClient so the admin's
    contextual editing can live-update the page; rendering happens in
    AuthorClient (useTina + TinaMarkdown). */
export default async function AuthorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let tinaProps: TinaAuthorProps | null = null;
  try {
    tinaProps = plainify(
      await databaseClient.queries.author({ relativePath: `${slug}.md` })
    );
  } catch {
    tinaProps = null;
  }
  if (!tinaProps) notFound();

  // Posts by this author — resolved from the markdown readers.
  const posts = getPostsByAuthor(tinaProps.data.author.name);

  return (
    <AuthorClient
      data={tinaProps.data}
      variables={tinaProps.variables}
      query={tinaProps.query}
      posts={posts}
    />
  );
}
