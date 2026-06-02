import { notFound } from "next/navigation";
import databaseClient from "@/tina/__generated__/databaseClient";
import { plainify } from "@/lib/tina-serialize";
import ArticleClient from "./ArticleClient";
import { getAllPosts, getPostBySlug, getRelatedPosts } from "@/lib/blog";
import { getAuthorByName } from "@/lib/authors";
import { getSectionByName } from "@/lib/sections";
import { getCurrentIssue } from "@/lib/issues";

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: `${post.title} — Revista de Derecho Comercial y de la Empresa`,
    description: post.excerpt,
  };
}

type TinaPostProps = Awaited<ReturnType<typeof databaseClient.queries.post>>;

/** Article page — Codex article formula:
    cover → 10-col shell (left author rail / center body / right spacer)
    → subscribe module → related posts → footer.

    Content is fetched through the Tina databaseClient (not gray-matter) so
    the admin's contextual editing can live-update the page in its preview
    iframe; rendering happens in ArticleClient (useTina + TinaMarkdown). */
export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Tina contextual-editing payload: { data, query, variables }.
  // plainify() strips the null-prototype objects the self-hosted
  // databaseClient returns (RSC -> client components require plain objects).
  let tinaProps: TinaPostProps | null = null;
  try {
    tinaProps = plainify(
      await databaseClient.queries.post({ relativePath: `${slug}.md` })
    );
  } catch {
    tinaProps = null;
  }
  if (!tinaProps) notFound();

  const post = tinaProps.data.post;

  // Context shown around the article — resolved from the markdown readers,
  // not part of the contextual-editing payload.
  const filePost = getPostBySlug(slug);
  const author = getAuthorByName(post.author);
  const section = getSectionByName(post.section);
  const related = filePost ? getRelatedPosts(filePost) : [];
  const currentIssue = getCurrentIssue();

  return (
    <ArticleClient
      data={tinaProps.data}
      variables={tinaProps.variables}
      query={tinaProps.query}
      author={author}
      section={section}
      related={related}
      currentIssue={currentIssue}
    />
  );
}
